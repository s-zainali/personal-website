<script setup>
import Header from '@/components/Header.vue'
import PortraitHalo from '@/components/PortraitHalo.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import ExperienceSection from '@/components/sections/ExperienceSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import PoweredByZain from '@/Components/PoweredByZain.vue'
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

        <!-- dot grid, faded to a soft spotlight behind the hero -->
        <div class="dot-grid pointer-events-none absolute inset-0 z-0"></div>

        <div class="relative z-10 flex min-h-[100dvh] flex-col">
            <Header />

            <main
                class="mx-auto flex w-full min-h-[100dvh] max-w-7xl flex-1 flex-col-reverse items-center justify-center gap-16 px-6 py-16 sm:px-10 lg:flex-row lg:gap-16 lg:px-16"
            >
                <!-- text column -->
                <div class="relative flex flex-1 max-w-xl flex-col items-center gap-7 text-center opacity-0 animate-fade-up lg:items-start lg:text-left">
                    <span
                        aria-hidden="true"
                        class="pointer-events-none absolute -left-10 -top-24 z-0 hidden select-none font-display text-[13rem] leading-none text-ink-900 lg:block"
                        >S</span
                    >

                    <div class="relative z-10 flex flex-col items-center gap-7 lg:items-start">
                        <span
                            class="inline-flex items-center rounded-full border border-teal-800/50 bg-teal-950/40 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-teal-300 backdrop-blur-sm"
                        >
                            Portfolio
                        </span>

                        <h1
                            class="font-display text-5xl font-medium leading-[1.05] tracking-tight text-ink-50 sm:text-6xl lg:text-7xl [font-variation-settings:'opsz'_144]"
                        >
                            Syed Zain Ali
                        </h1>

                        <p class="text-sm uppercase tracking-[0.3em] text-ink-400 sm:text-base">
                            Software Engineer <span class="text-ink-600">·</span>
                            <span class="text-teal-300">UAV &amp; Mechatronics Engineer</span>
                        </p>

                        <p class="font-display text-base italic text-ink-300 sm:text-lg">
                            I write software that thinks, and build machines that fly.
                        </p>

                        <div class="h-px w-16 rounded-full bg-teal-500/70"></div>
                    </div>
                </div>

                <!-- portrait -->
                <div class="flex flex-1 justify-center opacity-0 animate-fade-in [animation-delay:200ms] lg:justify-end">
                    <PortraitHalo />
                </div>
            </main>

            <AboutSection />
            <ExperienceSection />
            <ProjectsSection />
            <ContactSection />

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
