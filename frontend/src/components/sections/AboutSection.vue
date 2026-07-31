<script setup>
const skills = [
    'Python',
    'TypeScript',
    'Vue.js',
    'C++',
    'ROS 2',
    'PX4 / ArduPilot',
    'Embedded Systems (STM32)',
    'PCB Design',
    'Docker',
    'PostgreSQL',
    'AWS',
]
</script>

<template>
    <section id="about" class="relative scroll-mt-28 px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
        <div class="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
            <span
                class="inline-flex items-center rounded-full border border-teal-800/50 bg-teal-950/40 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-teal-300 backdrop-blur-sm"
            >
                About
            </span>

            <h2 class="font-display text-3xl font-medium text-ink-50 sm:text-4xl">A bit about me</h2>

            <p class="max-w-2xl text-base leading-relaxed text-ink-300 sm:text-lg">
                I'm a software engineer who spends the workday writing systems that need to be reliable, and the
                weekend building things that need to fly. I care about clean architecture as much as clean solder
                joints — whether that means designing a scalable backend service or tuning a control loop on a
                quadcopter's flight controller. Somewhere between the compiler and the workshop is where I do my
                best work.
            </p>

            <div class="mt-2 flex flex-wrap items-center justify-center gap-2.5">
                <span
                    v-for="skill in skills"
                    :key="skill"
                    class="rounded-full border border-ink-700/70 bg-ink-900/50 px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-ink-300"
                >
                    {{ skill }}
                </span>
            </div>
        </div>
    </section>
</template>
