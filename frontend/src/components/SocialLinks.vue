<script setup>
defineProps({
    iconClass: {
        type: String,
        default: 'h-4 w-4',
    },
})

const links = [
    {
        name: 'GitHub',
        href: 'https://github.com/s-zainali',
        path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.379.202 2.398.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.523 2 12 2z',
        fillRule: 'evenodd',
    },
    {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/in/s-zain-ali/',
        path: 'M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3-.02-3-1.83-3-1.83 0-2.1 1.43-2.1 2.9V21h-4z',
    },
    {
        name: 'Email',
        href: 'mailto:szainali284@gmail.com',
        path: 'M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm1.4 2L12 12.4 19.6 7H4.4zM20 8.4l-7.4 5.3a1 1 0 01-1.2 0L4 8.4V17h16V8.4z',
    },
]
</script>

<template>
    <nav class="flex items-center gap-5" aria-label="Social links">
        <a
            v-for="link in links"
            :key="link.name"
            :href="link.href"
            :target="link.href.startsWith('http') ? '_blank' : undefined"
            :rel="link.href.startsWith('http') ? 'noopener noreferrer' : undefined"
            :aria-label="link.name"
            class="text-ink-400 transition-colors duration-300 hover:text-teal-300"
        >
            <svg :class="iconClass" viewBox="0 0 24 24" fill="currentColor" :fill-rule="link.fillRule">
                <path :d="link.path" />
            </svg>
        </a>
    </nav>
</template>
