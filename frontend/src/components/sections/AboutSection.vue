<script setup>
import { RouterLink } from 'vue-router'
import { about, skills } from '@/data/portfolio'
</script>

<template>
    <section id="about" class="relative scroll-mt-28 px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
        <div class="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
            <span
                class="inline-flex items-center rounded-full border border-teal-800/50 bg-teal-950/40 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-teal-300 backdrop-blur-sm">
                About
            </span>

            <h2 class="font-display text-3xl font-medium text-ink-50 sm:text-4xl">A bit about me</h2>

            <p class="max-w-2xl text-base leading-relaxed text-ink-300 sm:text-lg">{{ about.blurb }}</p>

            <div class="mt-2 flex flex-wrap items-center justify-center gap-2.5">
                <div v-for="skill in skills" :key="skill.name"
                    class="flex gap-2 items-center justify-between rounded-full border border-ink-700/70 bg-ink-900/50 px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-ink-300">
                    <img class="h-6 p-1 pl-0" :src="skill.icon" :alt="skill.name" loading="lazy" decoding="async" height="24">
                    <span>{{ skill.name }}</span>
                </div>
            </div>

            <RouterLink to="/about"
                class="group mt-4 inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-teal-300 transition-colors duration-300 hover:text-teal-200">
                More about me
                <span class="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </RouterLink>
        </div>
    </section>
</template>