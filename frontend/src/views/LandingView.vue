<script setup>
import SiteShell from '@/components/SiteShell.vue'
import PortraitHalo from '@/components/PortraitHalo.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import ExperienceSection from '@/components/sections/ExperienceSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
</script>

<template>
    <SiteShell>
        <main
            class="mx-auto flex w-full min-h-[80dvh] max-w-7xl flex-1 flex-col-reverse items-center justify-center gap-16 px-6 py-16 sm:px-10 lg:flex-row lg:gap-16 lg:px-16"
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
    </SiteShell>
</template>