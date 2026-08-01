<script setup>
import { RouterLink } from 'vue-router'
import SiteShell from '@/components/SiteShell.vue'
import { projects } from '@/data/portfolio'
</script>

<template>
    <SiteShell>
        <main class="mx-auto w-full max-w-5xl flex-1 px-6 py-20 sm:px-10 sm:py-24 lg:px-16">
            <RouterLink to="/"
                class="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-ink-400 transition-colors duration-300 hover:text-teal-300">
                <span class="transition-transform duration-300 group-hover:-translate-x-1">&larr;</span> Home
            </RouterLink>

            <div class="mt-8 flex flex-col gap-4">
                <span
                    class="inline-flex w-fit items-center rounded-full border border-teal-800/50 bg-teal-950/40 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-teal-300 backdrop-blur-sm">
                    Projects
                </span>
                <h1 class="font-display text-4xl font-medium text-ink-50 sm:text-5xl">Things I've built</h1>
                <p class="max-w-2xl text-base leading-relaxed text-ink-400">
                    A mix of software, hardware, and things that fly. Open any one for the full story.
                </p>
            </div>

            <div class="mt-12 grid gap-6 sm:grid-cols-2">
                <RouterLink v-for="project in projects" :key="project.slug" :to="`/projects/${project.slug}`"
                    class="group relative flex flex-col gap-4 rounded-[1.75rem] border border-ink-800/80 bg-ink-900/40 p-7 backdrop-blur-sm transition-all duration-500 hover:border-teal-800/70 hover:bg-ink-900/70">
                    <div
                        class="pointer-events-none absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-teal-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    </div>

                    <div class="relative flex items-start justify-between gap-4">
                        <div class="flex flex-col gap-1">
                            <h2 class="font-display text-xl text-ink-50">{{ project.name }}</h2>
                            <p class="text-sm text-teal-300/90">{{ project.tagline }}</p>
                        </div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                            class="mt-1 h-4 w-4 shrink-0 text-ink-500 transition-colors duration-300 group-hover:text-teal-300">
                            <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>

                    <p class="relative text-sm leading-relaxed text-ink-300">{{ project.description }}</p>

                    <div class="relative flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-ink-500">
                        <span>{{ project.year }}</span>
                        <span class="text-ink-700">·</span>
                        <span>{{ project.role }}</span>
                        <span class="text-ink-700">·</span>
                        <span class="text-teal-400/80">{{ project.status }}</span>
                    </div>

                    <div class="relative mt-auto flex flex-wrap gap-2 pt-2">
                        <span v-for="tag in project.tags" :key="tag"
                            class="rounded-full border border-ink-700/70 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-ink-400">
                            {{ tag }}
                        </span>
                    </div>
                </RouterLink>
            </div>
        </main>
    </SiteShell>
</template>