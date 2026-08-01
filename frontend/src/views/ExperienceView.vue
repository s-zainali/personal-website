<script setup>
import { RouterLink } from 'vue-router'
import SiteShell from '@/components/SiteShell.vue'
import { experience } from '@/data/portfolio'
</script>

<template>
    <SiteShell>
        <main class="mx-auto w-full max-w-4xl flex-1 px-6 py-20 sm:px-10 sm:py-24 lg:px-16">
            <RouterLink to="/"
                class="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-ink-400 transition-colors duration-300 hover:text-teal-300">
                <span class="transition-transform duration-300 group-hover:-translate-x-1">&larr;</span> Home
            </RouterLink>

            <div class="mt-8 flex flex-col gap-4">
                <span
                    class="inline-flex w-fit items-center rounded-full border border-teal-800/50 bg-teal-950/40 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-teal-300 backdrop-blur-sm">
                    Experience
                </span>
                <h1 class="font-display text-4xl font-medium text-ink-50 sm:text-5xl">Where I've worked</h1>
            </div>

            <div class="mt-12 flex flex-col gap-6">
                <article v-for="role in experience" :key="role.slug"
                    class="rounded-[1.75rem] border border-ink-800/80 bg-ink-900/40 p-7 backdrop-blur-sm sm:p-8">
                    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h2 class="font-display text-2xl text-ink-50">{{ role.title }}</h2>
                        <span class="text-xs uppercase tracking-[0.2em] text-ink-500">{{ role.period }}</span>
                    </div>
                    <p class="mt-1 text-sm uppercase tracking-[0.2em] text-teal-300">
                        {{ role.org }} <span class="text-ink-600">·</span> {{ role.location }}
                    </p>

                    <p class="mt-4 text-base leading-relaxed text-ink-300">{{ role.summary }}</p>

                    <ul class="mt-5 flex flex-col gap-2">
                        <li v-for="h in role.highlights" :key="h" class="flex gap-3 text-sm leading-relaxed text-ink-300">
                            <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400"></span>
                            <span>{{ h }}</span>
                        </li>
                    </ul>

                    <div class="mt-6 flex flex-wrap gap-2">
                        <span v-for="t in role.stack" :key="t"
                            class="rounded-full border border-ink-700/70 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-ink-400">
                            {{ t }}
                        </span>
                    </div>
                </article>
            </div>
        </main>
    </SiteShell>
</template>