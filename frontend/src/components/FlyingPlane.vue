<script setup>
/*
 * FlyingPlane — a GLB aircraft that follows the pointer, drawn as an adaptive reticle.
 *
 * Flight & roll: the orientation is PARALLEL-TRANSPORTED — as the nose turns to follow the pointer,
 * the plane's "up" is carried along rather than reset every frame. So a hard direction reversal
 * naturally rolls the plane over (it ends up inverted), exactly like a real turn. A separate,
 * rate-limited LEVELING roll continuously rolls it back upright — but it's deliberately weak while
 * the plane is turning hard, so mid-reversal it can't keep up (the plane goes upside down) and only
 * once the turn eases does it win and roll level again. No scripted flip, no forced pitch-up.
 *
 * Reticle: elegant double-ring that recolours on hover/click and never lags the pointer.
 * Perf: model is meshopt-compressed (decoder wired); the render loop pauses while the tab is hidden.
 */
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'

const props = defineProps({
    modelUrl: { type: String, default: '/soar.glb' },
    targetSpan: { type: Number, default: 3 },
    maxSpeed: { type: Number, default: 10 },
    turnRate: { type: Number, default: 4 },        // rad/s cap on how fast the nose turns
    accel: { type: Number, default: 5 },
    slowRadius: { type: Number, default: 3.4 },
    standoff: { type: Number, default: 1.2 },
    maxBank: { type: Number, default: 0.6 },         // coordinated bank into ordinary turns
    bankSign: { type: Number, default: 1 },
    levelRate: { type: Number, default: 9 },       // rad/s the wings roll back toward level
    saturation: { type: Number, default: 1.4 },
    exposure: { type: Number, default: 0.95 },
    reticleColor: { type: String, default: '#6ee7d0' },
    hoverColor: { type: String, default: '#c4b5fd' },
    activeColor: { type: String, default: '#ffffff' },
    hideNativeCursor: { type: Boolean, default: true },
    modelRotX: { type: Number, default: 180 },
    modelRotY: { type: Number, default: 0 },
    modelRotZ: { type: Number, default: 180 },
})

const container = ref(null)
const reticle = ref(null)
let renderer, scene, camera, composer, raf, clock, envRT, cursorStyle
let aircraft
let ready = false
let seen = false
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

const SaturationShader = {
    uniforms: { tDiffuse: { value: null }, saturation: { value: 1.0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
        uniform sampler2D tDiffuse; uniform float saturation; varying vec2 vUv;
        void main(){
            vec4 c = texture2D(tDiffuse, vUv);
            float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
            gl_FragColor = vec4(mix(vec3(l), c.rgb, saturation), c.a);
        }`,
}

// flight state
const pos = new THREE.Vector3(0, 0, 0)
const heading = new THREE.Vector3(1, 0, 0)
const target = new THREE.Vector3(0, 0, 0)
let speed = 0
let bank = 0            // smoothed coordinated bank
let bankTarget = 0
let turnActivity = 0    // 0..1, how hard we're currently turning (weakens leveling)

// orientation state (persistent, so "up" is carried across frames = parallel transport)
const qShip = new THREE.Quaternion()
let shipInited = false

// scratch
const ndc = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
const flightPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
const toTarget = new THREE.Vector3()
const aim = new THREE.Vector3()
const turnAxis = new THREE.Vector3()
const qStep = new THREE.Quaternion()
const xAxis = new THREE.Vector3()
const yAxis = new THREE.Vector3()
const zAxis = new THREE.Vector3()
const basis = new THREE.Matrix4()
const LOCAL_NOSE = new THREE.Vector3(0, 0, -1)
const LOCAL_UP = new THREE.Vector3(0, 1, 0)
const curNose = new THREE.Vector3()
const curUp = new THREE.Vector3()
const refUp = new THREE.Vector3()
const cross = new THREE.Vector3()
const qAlign = new THREE.Quaternion()
const qRollLevel = new THREE.Quaternion()
const qTilt = new THREE.Quaternion()
const WORLD_UP = new THREE.Vector3(0, 1, 0)
const ALT_UP = new THREE.Vector3(0, 0, 1)

const CLICKABLE = 'a,button,[role="button"],label,select,summary,input[type=checkbox],input[type=radio],input[type=submit],input[type=button],[data-cursor="pointer"]'
const TEXTUAL = 'input:not([type]),input[type=text],input[type=email],input[type=search],input[type=url],input[type=tel],input[type=password],input[type=number],textarea,[contenteditable=""],[contenteditable="true"],[data-cursor="text"]'

function stateFor(el) {
    if (!el || !el.closest) return 'default'
    if (el.closest(TEXTUAL)) return 'text'
    if (el.closest(CLICKABLE)) return 'pointer'
    return 'default'
}

function onPointer(e) {
    if (reticle.value) {
        reticle.value.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
        if (!seen) reticle.value.style.opacity = '1'
        const st = stateFor(document.elementFromPoint(e.clientX, e.clientY))
        if (reticle.value.dataset.state !== st) reticle.value.dataset.state = st
    }
    seen = true
    ndc.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
    raycaster.setFromCamera(ndc, camera)
    raycaster.ray.intersectPlane(flightPlane, target)
}
function onDown() { if (reticle.value) reticle.value.dataset.active = 'true' }
function onUp() { if (reticle.value) reticle.value.dataset.active = 'false' }

function resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    renderer.setSize(w, h)
    composer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
}

function follow(dt) {
    toTarget.subVectors(target, pos)
    const dist = toTarget.length()
    if (dist > 1e-4) aim.copy(toTarget).multiplyScalar(1 / dist)

    if (reduceMotion) {
        if (dist > props.standoff) pos.copy(target).addScaledVector(aim, -props.standoff)
        if (dist > 0.02) heading.copy(aim)
        bankTarget = 0
        turnActivity = 0
        return
    }

    let desired = 0
    if (dist > props.standoff) {
        const t = THREE.MathUtils.clamp((dist - props.standoff) / props.slowRadius, 0, 1)
        desired = props.maxSpeed * t
    }
    speed += (desired - speed) * Math.min(1, dt * props.accel)

    let turnFrac = 0
    if (dist > 0.05) {
        turnAxis.crossVectors(heading, aim)
        const sinA = turnAxis.length()
        const cosA = THREE.MathUtils.clamp(heading.dot(aim), -1, 1)
        const angle = Math.atan2(sinA, cosA)
        if (angle > 1e-4) {
            if (sinA < 1e-6) turnAxis.copy(WORLD_UP)
            turnAxis.normalize()
            const maxStep = props.turnRate * dt
            const step = Math.min(angle, maxStep)
            qStep.setFromAxisAngle(turnAxis, step)
            heading.applyQuaternion(qStep).normalize()
            turnFrac = step / Math.max(maxStep, 1e-6)
            const yawComp = turnAxis.dot(WORLD_UP)
            bankTarget = -yawComp * turnFrac * props.maxBank * props.bankSign
        } else bankTarget = 0
    } else bankTarget = 0

    // smoothed turn intensity — high while turning hard, which is when leveling should back off
    turnActivity += (turnFrac - turnActivity) * Math.min(1, dt * 7)
    bank += (bankTarget - bank) * Math.min(1, dt * 6)

    pos.addScaledVector(heading, speed * dt)
}

function orient(dt) {
    if (!shipInited) {
        zAxis.copy(heading).multiplyScalar(-1)
        xAxis.crossVectors(WORLD_UP, zAxis).normalize()
        yAxis.crossVectors(zAxis, xAxis).normalize()
        basis.makeBasis(xAxis, yAxis, zAxis)
        qShip.setFromRotationMatrix(basis)
        shipInited = true
    }

    // 1) TURN: rotate the whole ship so its nose tracks the heading — carries "up" along with it
    curNose.copy(LOCAL_NOSE).applyQuaternion(qShip)
    qAlign.setFromUnitVectors(curNose, heading)
    qShip.premultiply(qAlign)

    // 2) LEVEL: roll about the nose toward upright (world-up ⟂ heading, tilted by the coordinated bank)
    const dotUp = heading.dot(WORLD_UP)
    refUp.copy(WORLD_UP).addScaledVector(heading, -dotUp)
    if (refUp.lengthSq() < 1e-5) {
        const dotAlt = heading.dot(ALT_UP)
        refUp.copy(ALT_UP).addScaledVector(heading, -dotAlt)
    }
    refUp.normalize()
    if (bank !== 0) {
        qTilt.setFromAxisAngle(heading, bank)
        refUp.applyQuaternion(qTilt)
    }

    curUp.copy(LOCAL_UP).applyQuaternion(qShip)
    const signed = Math.atan2(cross.crossVectors(curUp, refUp).dot(heading), curUp.dot(refUp))
    // leveling backs off while turning hard → the plane genuinely rolls inverted mid-reversal,
    // then rolls upright once the turn eases
    const rate = reduceMotion ? Math.PI : props.levelRate * (0.12 + 0.88 * (1 - turnActivity))
    const step = THREE.MathUtils.clamp(signed, -rate * dt, rate * dt)
    qRollLevel.setFromAxisAngle(heading, step)
    qShip.premultiply(qRollLevel)

    aircraft.quaternion.copy(qShip)
    aircraft.position.copy(pos)
}

function tick() {
    raf = requestAnimationFrame(tick)
    const dt = Math.min(clock.getDelta(), 0.05)
    if (ready) {
        follow(dt)
        orient(dt)
    }
    composer.render()
}

function onVisibility() {
    if (document.hidden) {
        if (raf) { cancelAnimationFrame(raf); raf = 0 }
    } else if (!raf) {
        clock.getDelta()
        raf = requestAnimationFrame(tick)
    }
}

onMounted(() => {
    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, -3, 18)
    camera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.NeutralToneMapping
    renderer.toneMappingExposure = props.exposure
    container.value.appendChild(renderer.domElement)

    const pmrem = new THREE.PMREMGenerator(renderer)
    envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = envRT.texture
    if ('environmentIntensity' in scene) scene.environmentIntensity = 0.5
    pmrem.dispose()

    scene.add(new THREE.AmbientLight(0xffffff, 0.3))
    const key = new THREE.DirectionalLight(0xffffff, 1.1)
    key.position.set(4, 6, 8)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x88bbff, 0.45)
    rim.position.set(-6, -2, -4)
    scene.add(rim)

    aircraft = new THREE.Group()
    scene.add(aircraft)

    composer = new EffectComposer(renderer)
    composer.setSize(window.innerWidth, window.innerHeight)
    composer.addPass(new RenderPass(scene, camera))
    const satPass = new ShaderPass(SaturationShader)
    satPass.uniforms.saturation.value = props.saturation
    composer.addPass(satPass)

    clock = new THREE.Clock()
    tick()

    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    loader.load(
        props.modelUrl,
        (gltf) => {
            const model = gltf.scene
            model.traverse((o) => {
                if (!o.isMesh || !o.material) return
                const mats = Array.isArray(o.material) ? o.material : [o.material]
                mats.forEach((m) => {
                    if ('metalness' in m) m.metalness = Math.min(m.metalness ?? 0, 0.2)
                    if ('envMapIntensity' in m) m.envMapIntensity = 0.5
                    m.needsUpdate = true
                })
            })

            const box = new THREE.Box3().setFromObject(model)
            const size = box.getSize(new THREE.Vector3())
            const centre = box.getCenter(new THREE.Vector3())
            model.position.sub(centre)
            model.scale.setScalar(props.targetSpan / Math.max(size.x, size.y, size.z))

            const fix = new THREE.Group()
            fix.rotation.set(
                THREE.MathUtils.degToRad(props.modelRotX),
                THREE.MathUtils.degToRad(props.modelRotY),
                THREE.MathUtils.degToRad(props.modelRotZ)
            )
            fix.add(model)
            aircraft.add(fix)
            ready = true
        },
        undefined,
        (err) => console.error('FlyingPlane: failed to load', props.modelUrl, err)
    )

    if (props.hideNativeCursor) {
        cursorStyle = document.createElement('style')
        cursorStyle.textContent = 'html.fp-nocursor, html.fp-nocursor * { cursor: none !important; }'
        document.head.appendChild(cursorStyle)
        document.documentElement.classList.add('fp-nocursor')
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
    if (raf) cancelAnimationFrame(raf)
    window.removeEventListener('pointermove', onPointer)
    window.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    window.removeEventListener('resize', resize)
    document.removeEventListener('visibilitychange', onVisibility)
    document.documentElement.classList.remove('fp-nocursor')
    cursorStyle?.remove()
    envRT?.dispose()
    composer?.dispose()
    scene?.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) {
            const mats = Array.isArray(o.material) ? o.material : [o.material]
            mats.forEach((m) => {
                for (const k in m) if (m[k]?.isTexture) m[k].dispose()
                m.dispose()
            })
        }
    })
    renderer?.dispose()
    renderer?.domElement?.remove()
})
</script>

<template>
    <div class="flying-plane">
        <div ref="container" class="fp-canvas" aria-hidden="true"></div>
        <div
            ref="reticle"
            class="fp-reticle"
            data-state="default"
            data-active="false"
            aria-hidden="true"
            :style="{ '--base': reticleColor, '--hover': hoverColor, '--active': activeColor }"
        >
            <svg viewBox="0 0 40 40" width="40" height="40">
                <circle class="fp-halo" cx="20" cy="20" r="15" fill="none" stroke="currentColor" stroke-width="0.8" />
                <circle class="fp-ring" cx="20" cy="20" r="11" fill="none" stroke="currentColor" stroke-width="1.1" />
                <circle class="fp-dot" cx="20" cy="20" r="1.7" fill="currentColor" />
                <rect class="fp-beam" x="19.1" y="9" width="1.8" height="22" rx="0.9" fill="currentColor" />
            </svg>
        </div>
    </div>
</template>

<style scoped>
.flying-plane {
    position: fixed;
    inset: 0;
    z-index: 40;
    pointer-events: none;
}
.fp-canvas {
    position: absolute;
    inset: 0;
}
.fp-canvas :deep(canvas) {
    display: block;
}

.fp-reticle {
    position: absolute;
    top: 0;
    left: 0;
    width: 40px;
    height: 40px;
    opacity: 0;
    color: var(--base);
    transition: opacity 300ms ease, color 150ms ease;
    filter: drop-shadow(0 0 4px currentColor);
}
.fp-halo,
.fp-ring,
.fp-dot,
.fp-beam {
    transform-box: fill-box;
    transform-origin: center;
    transition: opacity 180ms ease, transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fp-halo {
    opacity: 0.18;
}
.fp-ring {
    opacity: 0.6;
}
.fp-dot {
    opacity: 1;
}
.fp-beam {
    opacity: 0;
}

.fp-reticle[data-state='pointer'] {
    color: var(--hover);
}
.fp-reticle[data-active='true'] {
    color: var(--active);
}

.fp-reticle[data-state='pointer'] .fp-halo {
    opacity: 0.5;
    transform: scale(1.18);
}
.fp-reticle[data-state='pointer'] .fp-ring {
    opacity: 0.95;
}
.fp-reticle[data-state='pointer'] .fp-dot {
    transform: scale(1.2);
}

.fp-reticle[data-active='true'] .fp-ring {
    transform: scale(0.82);
}
.fp-reticle[data-active='true'] .fp-halo {
    transform: scale(1);
    opacity: 0.35;
}

.fp-reticle[data-state='text'] .fp-halo,
.fp-reticle[data-state='text'] .fp-ring,
.fp-reticle[data-state='text'] .fp-dot {
    opacity: 0;
}
.fp-reticle[data-state='text'] .fp-beam {
    opacity: 0.9;
}

@media (prefers-reduced-motion: reduce) {
    .fp-reticle,
    .fp-halo,
    .fp-ring,
    .fp-dot,
    .fp-beam {
        transition: none;
    }
}
</style>