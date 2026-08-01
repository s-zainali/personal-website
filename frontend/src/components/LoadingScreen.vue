<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAssetLoaderStore } from '@/stores/assetLoader'

const assetLoader = useAssetLoaderStore()

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

const visible = ref(true)
const shown = ref(0) // smoothed, displayed percentage
let raf

function tick() {
    const target = assetLoader.loaded ? 100 : assetLoader.progress
    shown.value += (target - shown.value) * (reduceMotion ? 1 : 0.12)
    if (target - shown.value < 0.05) shown.value = target
    if (assetLoader.loaded && shown.value >= 99.95) {
        shown.value = 100
        visible.value = false
        return
    }
    raf = requestAnimationFrame(tick)
}

const displayPercent = computed(() => Math.round(shown.value))

const statusLabel = computed(() => {
    if (displayPercent.value >= 99) return 'Cleared for landing'
    if (shown.value < 33) return 'Clearing the runway'
    if (shown.value < 75) return 'Gaining altitude'
    return 'Final approach'
})

onMounted(() => {
    document.body.style.overflow = 'hidden'
    raf = requestAnimationFrame(tick)
})

watch(visible, (v) => {
    if (!v) document.body.style.overflow = ''
})

onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    document.body.style.overflow = ''
})
</script>

<template>
    <Transition name="loader">
        <div
            v-if="visible"
            class="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ink-950"
            role="progressbar"
            aria-label="Page loading"
            :aria-valuenow="displayPercent"
            aria-valuemin="0"
            aria-valuemax="100"
        >
            <div class="grain pointer-events-none absolute inset-0 z-0 opacity-[0.04] mix-blend-overlay"></div>

            <div class="pointer-events-none absolute inset-0 z-0">
                <div
                    class="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-900/20 blur-[160px]"
                ></div>
            </div>

            <span
                aria-hidden="true"
                class="pointer-events-none absolute select-none font-display text-[15rem] leading-none text-ink-900/60 sm:text-[18rem]"
                >S</span
            >

            <div class="relative z-10 flex flex-col items-center gap-7 px-6">
                <span
                    class="inline-flex items-center rounded-full border border-teal-800/50 bg-teal-950/40 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-teal-300 backdrop-blur-sm"
                >
                    Syed Zain Ali
                </span>

                <div
                    class="flex items-baseline font-display tabular-nums text-ink-50 [font-variation-settings:'opsz'_144]"
                >
                    <span class="text-7xl font-medium leading-none sm:text-8xl">{{ displayPercent }}</span>
                    <span class="text-2xl text-ink-500 sm:text-3xl">%</span>
                </div>

                <div class="relative h-px w-56 overflow-hidden rounded-full bg-ink-800 sm:w-72">
                    <div
                        class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-600 via-teal-400 to-teal-200"
                        :style="{ width: shown + '%' }"
                    ></div>
                </div>

                <p class="min-h-[1.5em] font-display text-sm italic text-ink-400 sm:text-base">
                    {{ statusLabel }}
                </p>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.loader-leave-active {
    transition:
        opacity 700ms cubic-bezier(0.16, 1, 0.3, 1),
        filter 700ms cubic-bezier(0.16, 1, 0.3, 1);
}
.loader-leave-to {
    opacity: 0;
    filter: blur(6px);
}

@media (prefers-reduced-motion: reduce) {
    .loader-leave-active {
        transition: opacity 200ms linear;
    }
    .loader-leave-to {
        filter: none;
    }
}
</style>
