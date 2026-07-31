<script setup>
const roles = [
    {
        title: 'Software Engineer Intern',
        org: 'Bank Al Habib, Pakistan',
        period: '2026',
        description:
            'Leading backend architecture for a fleet-management platform; migrated core services to an event-driven design, cutting p95 latency by 40%.',
    },
    {
        title: 'Lead Software Engineer',
        org: 'Cents',
        period: '2025 - 2026',
        description:
            'Built internal tooling for data pipelines and owned the migration of the deploy process to a fully containerized, zero-downtime pipeline.',
    },
    {
        title: 'Undergraduate Teaching Assistant',
        org: 'University of British Columbia',
        period: '2025',
        description: 'Developed flight-control firmware and telemetry tooling for a fixed-wing autonomous survey drone.',
    },
]
</script>

<template>
    <section id="experience" class="relative scroll-mt-28 px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
        <div class="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
            <span
                class="inline-flex items-center rounded-full border border-teal-800/50 bg-teal-950/40 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-teal-300 backdrop-blur-sm"
            >
                Experience
            </span>

            <h2 class="font-display text-3xl font-medium text-ink-50 sm:text-4xl">Where I've worked</h2>
        </div>

        <div class="mx-auto mt-16 flex w-full max-w-3xl flex-col">
            <div v-for="(role, index) in roles" :key="role.title" class="relative flex gap-6 pb-14 last:pb-0">
                <div class="flex flex-col items-center">
                    <span class="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-teal-400 bg-ink-950"></span>
                    <span v-if="index < roles.length - 1" class="mt-2 w-px flex-1 rounded-full bg-ink-800"></span>
                </div>

                <div class="flex flex-1 flex-col gap-2 pb-2 text-left">
                    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 class="font-display text-xl text-ink-50">{{ role.title }}</h3>
                        <span class="text-xs uppercase tracking-[0.2em] text-ink-500">{{ role.period }}</span>
                    </div>
                    <p class="text-sm uppercase tracking-[0.2em] text-teal-300">{{ role.org }}</p>
                    <p class="text-base leading-relaxed text-ink-300">{{ role.description }}</p>
                </div>
            </div>
        </div>
    </section>
</template>
