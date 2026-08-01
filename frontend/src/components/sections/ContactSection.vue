<script setup>
import { RouterLink } from 'vue-router'
import SocialLinks from '@/components/SocialLinks.vue'
import { contact } from '@/data/portfolio'
</script>

<template>
    <section id="contact" class="relative scroll-mt-28 px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
        <div
            class="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-[2rem] border border-ink-800/80 bg-ink-900/40 px-8 py-16 text-center backdrop-blur-sm">
            <div class="pointer-events-none absolute -inset-x-10 -top-24 h-64 rounded-full bg-teal-800/15 blur-[120px]"></div>

            <span
                class="relative inline-flex items-center rounded-full border border-teal-800/50 bg-teal-950/40 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-teal-300 backdrop-blur-sm">
                Contact
            </span>

            <h2 class="relative font-display text-3xl font-medium text-ink-50 sm:text-4xl">Let's build something</h2>

            <p class="relative max-w-xl text-base leading-relaxed text-ink-300 sm:text-lg">
                Whether it's software, circuitry, or something that flies — I'm always up for talking about the next
                project.
            </p>

            <a :href="`mailto:${contact.email}`"
                class="relative mt-2 inline-flex items-center rounded-full bg-teal-400 px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-ink-950 transition-colors duration-300 hover:bg-teal-300">
                Say hello
            </a>

            <div class="relative mt-2">
                <SocialLinks icon-class="h-5 w-5" />
            </div>

            <RouterLink to="/contact"
                class="group relative mt-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-ink-400 transition-colors duration-300 hover:text-teal-300">
                Contact details
                <span class="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </RouterLink>
        </div>
    </section>
</template>