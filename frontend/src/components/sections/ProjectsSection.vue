<script setup>
const projects = [
    {
        name: 'Aerowatch',
        description: 'Autonomous drone telemetry and mission-planning dashboard with live MAVLink streaming.',
        tags: ['Vue', 'WebSockets', 'MAVLink', 'PostgreSQL'],
        href: 'https://github.com/s-zainali',
    },
    {
        name: 'Pulse',
        description: 'Distributed task scheduler with worker queues built for horizontal scale.',
        tags: ['Go', 'Redis', 'Kubernetes'],
        href: 'https://github.com/s-zainali',
    },
    {
        name: 'Wingman',
        description: 'PX4-based flight controller fork with custom failsafe and geofencing logic.',
        tags: ['C++', 'PX4', 'ROS 2'],
        href: 'https://github.com/s-zainali',
    },
    {
        name: 'Ledger Lite',
        description: 'Lightweight double-entry accounting API built for small businesses.',
        tags: ['TypeScript', 'Node.js', 'PostgreSQL'],
        href: 'https://github.com/s-zainali',
    },
]
</script>

<template>
    <section id="projects" class="relative scroll-mt-28 px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
        <div class="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
            <span
                class="inline-flex items-center rounded-full border border-teal-800/50 bg-teal-950/40 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-teal-300 backdrop-blur-sm"
            >
                Projects
            </span>

            <h2 class="font-display text-3xl font-medium text-ink-50 sm:text-4xl">Things I've built</h2>
        </div>

        <div class="mx-auto mt-16 grid w-full max-w-5xl gap-6 sm:grid-cols-2">
            <a
                v-for="project in projects"
                :key="project.name"
                :href="project.href"
                target="_blank"
                rel="noopener noreferrer"
                class="group relative flex flex-col gap-4 rounded-[1.75rem] border border-ink-800/80 bg-ink-900/40 p-7 backdrop-blur-sm transition-all duration-500 hover:border-teal-800/70 hover:bg-ink-900/70"
            >
                <div
                    class="pointer-events-none absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-teal-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                ></div>

                <div class="relative flex items-start justify-between gap-4">
                    <h3 class="font-display text-xl text-ink-50">{{ project.name }}</h3>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        class="mt-1 h-4 w-4 shrink-0 text-ink-500 transition-colors duration-300 group-hover:text-teal-300"
                    >
                        <path d="M7 17L17 7M7 7h10v10" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>

                <p class="relative text-sm leading-relaxed text-ink-300">{{ project.description }}</p>

                <div class="relative mt-auto flex flex-wrap gap-2 pt-2">
                    <span
                        v-for="tag in project.tags"
                        :key="tag"
                        class="rounded-full border border-ink-700/70 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-ink-400"
                    >
                        {{ tag }}
                    </span>
                </div>
            </a>
        </div>
    </section>
</template>
