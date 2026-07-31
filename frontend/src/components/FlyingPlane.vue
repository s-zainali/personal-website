<script setup>
/*
 * FlyingPlane — a GLB aircraft that follows the pointer, drawn as a sleek dot + trailing-ring cursor.
 *
 * Flight: capped-turn steering (curved, banked direction changes) + arrive speed (eases to a stop at
 * the crosshair, never orbits). Orientation uses a COHERENT frame — the up-vector is carried between
 * frames and only re-uprighted while roughly level — so passing the nose through vertical during a
 * left/right reversal rolls smoothly instead of snapping at the singularity.
 *
 * Cursor: a small precise dot at the pointer + a thin ring that trails with a slight lag. It adapts:
 * ring contracts over clickable things, becomes an I-beam over text. Native cursor hidden globally.
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
    maxSpeed: { type: Number, default: 9.5 },       // top speed
    turnRate: { type: Number, default: 3.4 },       // rad/s cap on how fast the nose swings
    accel: { type: Number, default: 4 },
    slowRadius: { type: Number, default: 3.2 },
    standoff: { type: Number, default: 1.2 },
    maxBank: { type: Number, default: 0.7 },
    bankSign: { type: Number, default: 1 },
    saturation: { type: Number, default: 1.4 },
    exposure: { type: Number, default: 0.95 },
    reticleColor: { type: String, default: '#6ee7d0' },
    ringLag: { type: Number, default: 16 },         // higher = ring tracks the dot more tightly
    hideNativeCursor: { type: Boolean, default: true },
    modelRotX: { type: Number, default: 180 },
    modelRotY: { type: Number, default: 0 },
    modelRotZ: { type: Number, default: 180 },
})

const container = ref(null)
const cursor = ref(null)
const ring = ref(null)
const dot = ref(null)
let renderer, scene, camera, composer, raf, clock, envRT, cursorStyle
let aircraft
let ready = false
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

// cursor state
let px = -100, py = -100, rx = -100, ry = -100, firstMove = true

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
const upVec = new THREE.Vector3(0, 1, 0) // persistent up for the coherent frame
let speed = 0
let bank = 0
let bankTarget = 0

// scratch
const ndc = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
const flightPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
const toTarget = new THREE.Vector3()
const aim = new THREE.Vector3()
const rawCross = new THREE.Vector3()
const qStep = new THREE.Quaternion()
const xAxis = new THREE.Vector3()
const yAxis = new THREE.Vector3()
const zAxis = new THREE.Vector3()
const basis = new THREE.Matrix4()
const qLook = new THREE.Quaternion()
const qRoll = new THREE.Quaternion()
const AXIS_Z = new THREE.Vector3(0, 0, 1)
const UP_REF = new THREE.Vector3(0, 1, 0)
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
    px = e.clientX
    py = e.clientY
    if (firstMove) {
        rx = px
        ry = py
        firstMove = false
        if (cursor.value) cursor.value.style.opacity = '1'
    }
    if (dot.value) dot.value.style.transform = `translate(${px}px, ${py}px)`
    if (cursor.value) {
        const st = stateFor(document.elementFromPoint(px, py))
        if (cursor.value.dataset.state !== st) cursor.value.dataset.state = st
    }
    ndc.set((px / window.innerWidth) * 2 - 1, -((py / window.innerHeight) * 2 - 1))
    raycaster.setFromCamera(ndc, camera)
    raycaster.ray.intersectPlane(flightPlane, target)
}

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

    let stepFrac = 0
    if (dist > 0.05) {
        const d = THREE.MathUtils.clamp(heading.dot(aim), -1, 1)
        const ang = Math.acos(d)
        if (ang > 1e-4) {
            rawCross.crossVectors(heading, aim)
            const turnDir = Math.sign(rawCross.z) || 1
            const maxStep = props.turnRate * dt
            const step = Math.min(ang, maxStep)
            qStep.setFromAxisAngle(AXIS_Z, step * turnDir)
            heading.applyQuaternion(qStep).normalize()
            stepFrac = (step / Math.max(maxStep, 1e-6)) * turnDir
        }
    }
    bankTarget = -stepFrac * props.maxBank * props.bankSign
    pos.addScaledVector(heading, speed * dt)
}

function orient(dt) {
    // coherent frame: build from the carried up-vector so it never flips at the vertical singularity
    zAxis.copy(heading).multiplyScalar(-1)
    xAxis.crossVectors(upVec, zAxis)
    if (xAxis.lengthSq() < 1e-6) xAxis.crossVectors(ALT_UP, zAxis)
    xAxis.normalize()
    yAxis.crossVectors(zAxis, xAxis).normalize()
    upVec.copy(yAxis)

    // ease back toward true upright, but only while roughly level (near vertical we leave it alone,
    // which is exactly what avoids the snap)
    const horiz = 1 - Math.min(1, Math.abs(heading.y) * 1.25)
    if (horiz > 0 && !reduceMotion) upVec.lerp(UP_REF, horiz * Math.min(1, dt * 1.5)).normalize()

    basis.makeBasis(xAxis, yAxis, zAxis)
    qLook.setFromRotationMatrix(basis)
    bank += (bankTarget - bank) * Math.min(1, dt * 6)
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
    // trailing ring
    const k = reduceMotion ? 1 : 1 - Math.exp(-props.ringLag * dt)
    rx += (px - rx) * k
    ry += (py - ry) * k
    if (ring.value) ring.value.style.transform = `translate(${rx}px, ${ry}px)`
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
    window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('pointermove', onPointer)
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
        <div ref="cursor" class="fp-cursor" data-state="default" aria-hidden="true" :style="{ color: reticleColor }">
            <div ref="ring" class="fp-ring-pos"><span class="fp-ring"></span></div>
            <div ref="dot" class="fp-dot-pos"><span class="fp-dot"></span></div>
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

.fp-cursor {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 300ms ease;
}
.fp-ring-pos,
.fp-dot-pos {
    position: absolute;
    top: 0;
    left: 0;
    will-change: transform;
}
/* inner elements are centred on the pos point and carry the state morphs */
.fp-ring,
.fp-dot {
    position: absolute;
    left: 0;
    top: 0;
    display: block;
    transform: translate(-50%, -50%);
    transition: width 220ms ease, height 220ms ease, opacity 220ms ease, border-radius 220ms ease, transform 220ms ease;
}
.fp-ring {
    width: 34px;
    height: 34px;
    border: 1px solid currentColor;
    border-radius: 50%;
    opacity: 0.5;
}
.fp-dot {
    width: 5px;
    height: 5px;
    background: currentColor;
    border-radius: 50%;
    box-shadow: 0 0 5px currentColor;
}

/* clickable: ring draws in to hug the dot, dot swells slightly */
.fp-cursor[data-state='pointer'] .fp-ring {
    transform: translate(-50%, -50%) scale(0.58);
    opacity: 0.9;
}
.fp-cursor[data-state='pointer'] .fp-dot {
    transform: translate(-50%, -50%) scale(1.5);
}

/* text: ring fades, dot becomes a fine I-beam */
.fp-cursor[data-state='text'] .fp-ring {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.4);
}
.fp-cursor[data-state='text'] .fp-dot {
    width: 2px;
    height: 22px;
    border-radius: 1px;
}

@media (prefers-reduced-motion: reduce) {
    .fp-cursor,
    .fp-ring,
    .fp-dot {
        transition: none;
    }
}
</style>