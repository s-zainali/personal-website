<script setup>
const skills = {
    'Python': '/Python.png',
    'Flask': '/flask.png',
    'FastAPI': '/fastapi.png',
    'JavaScript': '/javascript.webp',
    'Next.js': '/nextjs.png',
    'React.js': '/react.webp',
    'Vue.js': '/vue.webp',
    'C++': '/cpp.webp',
    'PCB Design': '/pcb.png',
    'Docker': '/docker.png',
    'PostgreSQL': '/postgres.png',
    'AWS': '/aws.webp',
}
</script>

<template>
    <section id="about" class="relative scroll-mt-28 px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
        <div class="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
            <span
                class="inline-flex items-center rounded-full border border-teal-800/50 bg-teal-950/40 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-teal-300 backdrop-blur-sm">
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
                <div v-for="skill in Object.keys(skills)" :key="skill"
                    class="flex gap-2 items-center justify-between rounded-full border border-ink-700/70 bg-ink-900/50 px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-ink-300">
                    <img class="h-6 p-1 pl-0" :src="skills[skill]" alt="" loading="lazy" decoding="async" height="24">
                    <span>
                        {{ skill }}
                    </span>
                </div>
            </div>
        </div>
    </section>
</template>
