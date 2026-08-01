<script setup>
/*
 * FlyingPlane — a GLB aircraft that follows the pointer, drawn as an adaptive reticle.
 *
 * Flight: 3D banked-turn steering with a capped turn rate. Direction reversals arc through the depth
 * axis (toward/away from the viewer) as a banked roll, NOT a flat in-plane half-loop — a half-loop
 * puts you inverted at the top, which is what made it look upside-down. The plane's up is world-up
 * PROJECTED onto the heading, which can never invert, so it always settles right-side up; bank is a
 * temporary roll driven by how hard (and which way) it's turning.
 *
 * Reticle: elegant double-ring that recolours on hover/click and never lags the pointer.
 */
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'

const props = defineProps({
    modelUrl: { type: String, default: '/soar.glb' },
    targetSpan: { type: Number, default: 3 },
    maxSpeed: { type: Number, default: 5.3 },       // top speed
    turnRate: { type: Number, default: 3.0 },       // rad/s cap on turning
    accel: { type: Number, default: 4 },
    slowRadius: { type: Number, default: 3.4 },     // decelerate-to-arrive distance
    standoff: { type: Number, default: 1.2 },
    maxBank: { type: Number, default: 0.85 },       // roll into turns (~49°); never inverts
    bankSign: { type: Number, default: 1 },
    saturation: { type: Number, default: 1.4 },
    exposure: { type: Number, default: 0.95 },
    reticleColor: { type: String, default: '#6ee7d0' }, // default
    hoverColor: { type: String, default: '#c4b5fd' },   // over clickable
    activeColor: { type: String, default: '#ffffff' },  // while pressed
    hideNativeCursor: { type: Boolean, default: true },
    modelRotX: { type: Number, default: 0 },
    modelRotY: { type: Number, default: 0 },
    modelRotZ: { type: Number, default: 0 },
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
let bank = 0
let bankTarget = 0

// scratch
const ndc = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
const flightPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
const toTarget = new THREE.Vector3()
const aim = new THREE.Vector3()
const turnAxis = new THREE.Vector3()
const upVec = new THREE.Vector3()
const qStep = new THREE.Quaternion()
const xAxis = new THREE.Vector3()
const yAxis = new THREE.Vector3()
const zAxis = new THREE.Vector3()
const basis = new THREE.Matrix4()
const qLook = new THREE.Quaternion()
const qRoll = new THREE.Quaternion()
const AXIS_Z = new THREE.Vector3(0, 0, 1)
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
    // position FIRST, synchronously, with no CSS transition on transform → never lags
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
        return
    }

    let desired = 0
    if (dist > props.standoff) {
        const t = THREE.MathUtils.clamp((dist - props.standoff) / props.slowRadius, 0, 1)
        desired = props.maxSpeed * t
    }
    speed += (desired - speed) * Math.min(1, dt * props.accel)

    if (dist > 0.05) {
        // turn the nose toward the target in 3D, capped
        turnAxis.crossVectors(heading, aim)
        const sinA = turnAxis.length()
        const cosA = THREE.MathUtils.clamp(heading.dot(aim), -1, 1)
        const angle = Math.atan2(sinA, cosA)
        if (angle > 1e-4) {
            if (sinA < 1e-6) turnAxis.copy(WORLD_UP) // ~0/180°: yaw about vertical (arc through depth, stays upright)
            turnAxis.normalize()
            const maxStep = props.turnRate * dt
            const step = Math.min(angle, maxStep)
            qStep.setFromAxisAngle(turnAxis, step)
            heading.applyQuaternion(qStep).normalize()
            // bank into the turn: only the vertical-axis (yaw) part of the turn earns roll
            const yawComp = turnAxis.dot(WORLD_UP)
            bankTarget = -yawComp * (step / Math.max(maxStep, 1e-6)) * props.maxBank * props.bankSign
        } else bankTarget = 0
    } else bankTarget = 0

    pos.addScaledVector(heading, speed * dt)
}

function orient(dt) {
    // up = world-up with the heading component removed → always "upper hemisphere", never inverts
    const dotUp = heading.dot(WORLD_UP)
    upVec.copy(WORLD_UP).addScaledVector(heading, -dotUp)
    if (upVec.lengthSq() < 1e-6) {
        const dotAlt = heading.dot(ALT_UP)
        upVec.copy(ALT_UP).addScaledVector(heading, -dotAlt)
    }
    upVec.normalize()

    zAxis.copy(heading).multiplyScalar(-1)
    xAxis.crossVectors(upVec, zAxis).normalize()
    yAxis.crossVectors(zAxis, xAxis).normalize()
    basis.makeBasis(xAxis, yAxis, zAxis)
    qLook.setFromRotationMatrix(basis)

    bank += (bankTarget - bank) * Math.min(1, dt * 6) // roll eases in and levels back to 0
    qRoll.setFromAxisAngle(AXIS_Z, bank)

    aircraft.quaternion.multiplyQuaternions(qLook, qRoll)
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

    new GLTFLoader().load(
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
})

onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('pointermove', onPointer)
    window.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    window.removeEventListener('resize', resize)
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
    /* NOTE: transform is intentionally NOT transitioned, so the reticle tracks the pointer instantly */
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

/* recolour by state; active wins (declared last, equal specificity) */
.fp-reticle[data-state='pointer'] {
    color: var(--hover);
}
.fp-reticle[data-active='true'] {
    color: var(--active);
}

/* clickable: outer halo blooms, inner ring sharpens, dot swells */
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

/* pressed: quick inward tuck for tactile feedback */
.fp-reticle[data-active='true'] .fp-ring {
    transform: scale(0.82);
}
.fp-reticle[data-active='true'] .fp-halo {
    transform: scale(1);
    opacity: 0.35;
}

/* text: rings drop away to a slim I-beam */
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