<script setup>
import SocialLinks from '@/components/SocialLinks.vue'

// Nav now points at the dedicated full pages rather than in-page anchors.
const navLinks = [
    { label: 'About', to: '/about' },
    { label: 'Experience', to: '/experience' },
    { label: 'Projects', to: '/projects' },
    { label: 'Contact', to: '/contact' },
]
</script>

<template>
    <header class="sticky top-0 z-50 w-full px-4 pt-4 sm:px-8 sm:pt-6 lg:px-12">
        <div
            class="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-ink-800/60 bg-ink-900/50 px-6 py-3 backdrop-blur-md sm:px-8"
        >
            <RouterLink to="/" class="shrink-0 font-display text-base tracking-[0.15em] text-ink-100 sm:text-lg">
                Syed Zain <span class="text-teal-400">Ali</span>
            </RouterLink>

            <nav class="hidden items-center gap-8 text-xs uppercase tracking-[0.25em] text-ink-400 md:flex" aria-label="Section links">
                <RouterLink
                    v-for="link in navLinks"
                    :key="link.to"
                    :to="link.to"
                    class="transition-colors duration-300 hover:text-teal-300"
                    active-class="text-teal-300"
                >
                    {{ link.label }}
                </RouterLink>
            </nav>

            <SocialLinks icon-class="h-[17px] w-[17px]" />
        </div>
    </header>
</template>