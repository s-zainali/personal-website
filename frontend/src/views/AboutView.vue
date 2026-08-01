<script setup>
import { RouterLink } from 'vue-router'
import SiteShell from '@/components/SiteShell.vue'
import { about, skills } from '@/data/portfolio'
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
                    About
                </span>
                <h1 class="font-display text-4xl font-medium text-ink-50 sm:text-5xl">A bit about me</h1>
            </div>

            <div class="mt-10 flex flex-col gap-6">
                <p v-for="(para, i) in about.bio" :key="i" class="text-base leading-relaxed text-ink-300 sm:text-lg">
                    {{ para }}
                </p>
            </div>

            <h2 class="mt-16 font-display text-2xl text-ink-50">What I do</h2>
            <div class="mt-6 grid gap-4 sm:grid-cols-3">
                <div v-for="f in about.focus" :key="f.title"
                    class="rounded-2xl border border-ink-800/80 bg-ink-900/40 p-6 backdrop-blur-sm">
                    <h3 class="font-display text-lg text-ink-50">{{ f.title }}</h3>
                    <p class="mt-2 text-sm leading-relaxed text-ink-400">{{ f.body }}</p>
                </div>
            </div>

            <h2 class="mt-16 font-display text-2xl text-ink-50">Tools I reach for</h2>
            <div class="mt-6 flex flex-wrap gap-2.5">
                <div v-for="skill in skills" :key="skill.name"
                    class="flex items-center gap-2 rounded-full border border-ink-700/70 bg-ink-900/50 px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-ink-300">
                    <img class="h-6 p-1 pl-0" :src="skill.icon" :alt="skill.name" loading="lazy" decoding="async" height="24">
                    <span>{{ skill.name }}</span>
                </div>
            </div>
        </main>
    </SiteShell>
</template>