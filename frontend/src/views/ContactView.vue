<script setup>
import { RouterLink } from 'vue-router'
import SiteShell from '@/components/SiteShell.vue'
import SocialLinks from '@/components/SocialLinks.vue'
import { contact } from '@/data/portfolio'
</script>

<template>
    <SiteShell>
        <main class="mx-auto w-full max-w-3xl flex-1 px-6 py-20 sm:px-10 sm:py-24 lg:px-16">
            <RouterLink to="/"
                class="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-ink-400 transition-colors duration-300 hover:text-teal-300">
                <span class="transition-transform duration-300 group-hover:-translate-x-1">&larr;</span> Home
            </RouterLink>

            <div class="mt-8 flex flex-col gap-4">
                <span
                    class="inline-flex w-fit items-center rounded-full border border-teal-800/50 bg-teal-950/40 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-teal-300 backdrop-blur-sm">
                    Contact
                </span>
                <h1 class="font-display text-4xl font-medium text-ink-50 sm:text-5xl">Let's build something</h1>
                <p class="max-w-xl text-base leading-relaxed text-ink-300 sm:text-lg">
                    Whether it's software, circuitry, or something that flies — I'm always up for talking about the
                    next project. {{ contact.availability }}
                </p>
            </div>

            <div class="mt-12 grid gap-4 sm:grid-cols-2">
                <a :href="`mailto:${contact.email}`"
                    class="group flex flex-col gap-1 rounded-2xl border border-ink-800/80 bg-ink-900/40 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-teal-800/70">
                    <span class="text-[11px] uppercase tracking-[0.2em] text-ink-500">Email</span>
                    <span class="font-display text-lg text-ink-100 transition-colors group-hover:text-teal-300">{{ contact.email }}</span>
                </a>
                <div class="flex flex-col gap-1 rounded-2xl border border-ink-800/80 bg-ink-900/40 p-6 backdrop-blur-sm">
                    <span class="text-[11px] uppercase tracking-[0.2em] text-ink-500">Based in</span>
                    <span class="font-display text-lg text-ink-100">{{ contact.location }}</span>
                </div>
            </div>

            <div class="mt-10 flex flex-col items-start gap-4">
                <span class="text-[11px] uppercase tracking-[0.2em] text-ink-500">Elsewhere</span>
                <SocialLinks icon-class="h-5 w-5" />
            </div>

            <div class="mt-12">
                <a :href="`mailto:${contact.email}`"
                    class="inline-flex items-center rounded-full bg-teal-400 px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-ink-950 transition-colors duration-300 hover:bg-teal-300">
                    Say hello
                </a>
            </div>
        </main>
    </SiteShell>
</template>