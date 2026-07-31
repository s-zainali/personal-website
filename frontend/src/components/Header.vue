<script setup>
import SocialLinks from '@/components/SocialLinks.vue'

const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact', href: '#contact' },
]
</script>

<template>
    <header class="sticky top-0 z-50 w-full px-4 pt-4 sm:px-8 sm:pt-6 lg:px-12">
        <div
            class="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-ink-800/60 bg-ink-900/50 px-6 py-3 backdrop-blur-md sm:px-8"
        >
            <a href="/" class="shrink-0 font-display text-base tracking-[0.15em] text-ink-100 sm:text-lg">
                Syed Zain <span class="text-teal-400">Ali</span>
            </a>

            <nav class="hidden items-center gap-8 text-xs uppercase tracking-[0.25em] text-ink-400 md:flex" aria-label="Section links">
                <a v-for="link in navLinks" :key="link.href" :href="link.href" class="transition-colors duration-300 hover:text-teal-300">
                    {{ link.label }}
                </a>
            </nav>

            <SocialLinks icon-class="h-[17px] w-[17px]" />
        </div>
    </header>
</template>
