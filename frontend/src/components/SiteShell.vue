<script setup>
/*
 * Shared page frame: the ambient background (grain, glows, dot-grid), the sticky Header, and the
 * footer. Every page — landing and each full section page — renders inside this so the whole site
 * shares one consistent backdrop.
 */
import Header from '@/components/Header.vue'
import PoweredByZain from '@/components/PoweredByZain.vue'
</script>

<template>
    <div class="relative min-h-[100dvh] w-full overflow-hidden bg-ink-950 font-sans text-ink-50">
        <!-- film grain -->
        <div class="grain pointer-events-none absolute inset-0 z-0 opacity-[0.04] mix-blend-overlay"></div>

        <!-- ambient glows -->
        <div class="pointer-events-none absolute inset-0 z-0">
            <div class="absolute -top-40 left-[-10%] h-[30rem] w-[30rem] rounded-full bg-teal-900/25 blur-[150px]"></div>
            <div class="absolute bottom-[-20%] right-[-10%] h-[36rem] w-[36rem] rounded-full bg-teal-800/15 blur-[170px]"></div>
            <div class="absolute bottom-0 left-1/4 h-[24rem] w-[24rem] rounded-full bg-indigo-500/5 blur-[180px]"></div>
        </div>

        <!-- dot grid, faded to a soft spotlight -->
        <div class="dot-grid pointer-events-none absolute inset-0 z-0"></div>

        <div class="relative z-10 flex min-h-[100dvh] flex-col">
            <Header />
            <slot />
            <PoweredByZain />
        </div>
    </div>
</template>

<style>
.grain {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.dot-grid {
    background-image: radial-gradient(circle, rgba(134, 191, 185, 0.22) 1px, transparent 1px);
    background-size: 32px 32px;
    mask-image: radial-gradient(ellipse 60% 55% at 50% 45%, black 0%, transparent 75%);
    -webkit-mask-image: radial-gradient(ellipse 60% 55% at 50% 45%, black 0%, transparent 75%);
}
</style>