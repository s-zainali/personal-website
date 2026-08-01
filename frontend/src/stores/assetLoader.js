import { ref } from 'vue'
import { defineStore } from 'pinia'

// Everything the landing page needs before it's fully "ready" — the aircraft
// model and every image actually painted on first view.
const ASSET_URLS = [
    '/soar.glb',
    '/profile.jpg',
    '/Python.png',
    '/flask.png',
    '/fastapi.png',
    '/javascript.webp',
    '/nextjs.png',
    '/react.webp',
    '/vue.webp',
    '/cpp.webp',
    '/pcb.png',
    '/docker.png',
    '/postgres.png',
    '/aws.webp',
]

const SAFETY_TIMEOUT_MS = 20000

export const useAssetLoaderStore = defineStore('assetLoader', () => {
    const progress = ref(0)
    const loaded = ref(false)
    let started = false

    async function fetchAsset(url, entry, recompute) {
        try {
            const res = await fetch(url)
            const total = Number(res.headers.get('content-length')) || 0
            entry.total = total

            if (!res.body || !total) {
                const blob = await res.blob()
                entry.total = entry.total || blob.size || 1
                entry.loaded = entry.total
                recompute()
                return
            }

            const reader = res.body.getReader()
            for (;;) {
                const { done, value } = await reader.read()
                if (done) break
                entry.loaded += value.length
                recompute()
            }
            entry.loaded = entry.total
            recompute()
        } catch {
            // treat unreachable assets as "done" so a single failure can't stall the page forever
            entry.total = entry.total || 1
            entry.loaded = entry.total
            recompute()
        }
    }

    // Fetches every asset exactly once, up front, so the <img>/GLTFLoader
    // requests that happen later (once `loaded` gates the real content in)
    // are cheap cache revalidations instead of a second full download.
    async function load() {
        if (started) return
        started = true

        const entries = ASSET_URLS.map(() => ({ loaded: 0, total: 0 }))
        const recompute = () => {
            const totalKnown = entries.reduce((sum, e) => sum + e.total, 0)
            const totalLoaded = entries.reduce((sum, e) => sum + e.loaded, 0)
            if (totalKnown > 0) progress.value = Math.min(99, (totalLoaded / totalKnown) * 100)
        }

        const timeout = new Promise((resolve) => setTimeout(resolve, SAFETY_TIMEOUT_MS))
        const work = Promise.all(ASSET_URLS.map((u, i) => fetchAsset(u, entries[i], recompute))).then(
            () => document.fonts?.ready
        )

        await Promise.race([work, timeout])
        progress.value = 100
        loaded.value = true
    }

    return { progress, loaded, load }
})
