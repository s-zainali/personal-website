<script setup>
const spherePores = Array.from({ length: 20 }, () => ({
    top: `${10 + Math.random() * 80}%`,
    left: `${10 + Math.random() * 80}%`,
    w: 8 + Math.random() * 26,
    h: 8 + Math.random() * 26,
    rotate: (Math.random() - 0.5) * 60,
    opacity: 0.4 + Math.random() * 0.35,
}))
</script>

<template>
    <div class="portrait-wrap relative flex h-[22rem] w-[22rem] items-center justify-center sm:h-[24rem] sm:w-[24rem] lg:h-[30rem] lg:w-[30rem]">
        <div class="portrait-halo-bg pointer-events-none absolute inset-0">
            <div
                class="ambient-glow absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 via-teal-400/15 to-pink-400/10 opacity-80 blur-[70px]"
            ></div>

            <div
                class="sphere-glow glow-lg absolute inset-2 opacity-80 blur-3xl"
                style="background: radial-gradient(circle at 35% 30%, #a78bfaaa, transparent 70%)"
            ></div>
            <div
                class="sphere-glow glow-md absolute inset-5 opacity-85 blur-2xl"
                style="background: radial-gradient(circle at 65% 55%, #6ee7d0aa, transparent 70%)"
            ></div>
            <div
                class="sphere-glow glow-md absolute inset-4 opacity-75 blur-2xl"
                style="background: radial-gradient(circle at 45% 70%, #f5b8e0aa, transparent 70%)"
            ></div>

            <div class="cell-sphere-wrap absolute inset-0">
                <div class="cell-sphere absolute inset-3 overflow-hidden opacity-80 blur-[1px]">
                    <span
                        v-for="(pore, i) in spherePores"
                        :key="i"
                        class="absolute rounded-full bg-white"
                        :style="{
                            top: pore.top,
                            left: pore.left,
                            width: pore.w + 'px',
                            height: pore.h + 'px',
                            transform: `rotate(${pore.rotate}deg)`,
                            opacity: pore.opacity,
                        }"
                    ></span>
                </div>
            </div>

            <div
                class="frame-blob-b absolute h-16 w-16 border border-indigo-400/25 bg-indigo-500/10 blur-[3px] sm:h-20 sm:w-20"
                style="top: 84%; left: 10%; transform: translate(-50%, -50%)"
            ></div>

            <svg class="portrait-ring absolute inset-0 h-full w-full rotate-[135deg] opacity-70" viewBox="0 0 200 200" fill="none">
                <defs>
                    <linearGradient id="portraitRing" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#5aa39c" stop-opacity="0" />
                        <stop offset="50%" stop-color="#86bfb9" stop-opacity="0.9" />
                        <stop offset="100%" stop-color="#5aa39c" stop-opacity="0" />
                    </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="92" stroke="url(#portraitRing)" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="416 162" />
            </svg>

            <span class="absolute h-3 w-3 rounded-full bg-teal-400/70 blur-[1px]" style="top: 8%; left: 68%"></span>
            <span class="absolute h-2 w-2 rounded-full bg-teal-300/60" style="top: 40%; left: 96%"></span>
            <span class="absolute h-2 w-2 rounded-full bg-violet-300/50" style="top: 62%; left: 2%"></span>
        </div>

        <div class="portrait-blob relative z-10 h-72 w-72 overflow-hidden sm:h-80 sm:w-80 lg:h-[26rem] lg:w-[26rem]">
            <img class="h-full w-full object-cover grayscale-[10%]" src="/profile.jpg" alt="Portrait of Syed Zain Ali" />
        </div>
    </div>
</template>

<style>
.cell-sphere {
    background: conic-gradient(from 0deg, #a78bfa, #6ee7d0, #93c5fd, #f5b8e0, #a78bfa);
}

.portrait-blob {
    box-shadow:
        0 40px 90px -30px rgba(0, 0, 0, 0.8),
        0 0 70px 14px rgba(167, 139, 250, 0.35),
        0 0 90px 24px rgba(110, 231, 208, 0.25);
}

.cell-sphere,
.sphere-glow,
.portrait-blob {
    animation: organic-morph 17s linear infinite;
}

.cell-sphere {
    animation-name: organic-morph, hue-shift-1;
    animation-duration: 17s, 30s;
    animation-timing-function: linear, linear;
    animation-iteration-count: infinite, infinite;
}

.glow-lg {
    animation-name: organic-morph, hue-shift-64;
    animation-duration: 17s, 30s;
    animation-timing-function: linear, linear;
    animation-iteration-count: infinite, infinite;
}

.glow-md {
    animation-name: organic-morph, hue-shift-40;
    animation-duration: 17s, 30s;
    animation-timing-function: linear, linear;
    animation-iteration-count: infinite, infinite;
}

.portrait-blob {
    transition: transform 700ms ease-out;
}

.portrait-blob:hover {
    transform: scale(1.06);
}

.portrait-halo-bg {
    transition: transform 700ms ease-out;
}

.portrait-wrap:has(.portrait-blob:hover) .portrait-halo-bg {
    transform: scale(1.08);
}

.ambient-glow,
.portrait-ring {
    transition: opacity 700ms ease-out;
}

.portrait-wrap:has(.portrait-blob:hover) .ambient-glow,
.portrait-wrap:has(.portrait-blob:hover) .portrait-ring {
    opacity: 1;
}

@keyframes hue-shift-1 {
    from {
        filter: blur(1px) hue-rotate(0deg);
    }
    to {
        filter: blur(1px) hue-rotate(360deg);
    }
}

@keyframes hue-shift-40 {
    from {
        filter: blur(40px) hue-rotate(0deg);
    }
    to {
        filter: blur(40px) hue-rotate(360deg);
    }
}

@keyframes hue-shift-64 {
    from {
        filter: blur(64px) hue-rotate(0deg);
    }
    to {
        filter: blur(64px) hue-rotate(360deg);
    }
}

@keyframes organic-morph {
    0%,
    100% {
        border-radius: 42% 58% 63% 37% / 41% 46% 54% 59%;
    }
    17% {
        border-radius: 58% 42% 40% 60% / 55% 38% 62% 45%;
    }
    34% {
        border-radius: 63% 37% 55% 45% / 42% 60% 40% 58%;
    }
    50% {
        border-radius: 45% 55% 38% 62% / 60% 42% 58% 40%;
    }
    67% {
        border-radius: 39% 61% 60% 40% / 46% 55% 45% 54%;
    }
    84% {
        border-radius: 55% 45% 46% 54% / 38% 63% 37% 62%;
    }
}

.frame-blob-b {
    border-radius: 60% 40% 35% 65% / 55% 40% 60% 45%;
    animation: blob-morph-b 24s linear infinite;
    animation-delay: -6s;
}

@keyframes blob-morph-b {
    0%,
    100% {
        border-radius: 60% 40% 35% 65% / 55% 40% 60% 45%;
    }
    50% {
        border-radius: 38% 62% 55% 45% / 45% 55% 45% 55%;
    }
}

@media (prefers-reduced-motion: reduce) {
    .cell-sphere,
    .sphere-glow,
    .portrait-blob,
    .frame-blob-b {
        animation: none;
    }
}
</style>
