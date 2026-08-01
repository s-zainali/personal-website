import '@/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// The Vue loading screen (same dark background) is now on screen — drop the static splash.
requestAnimationFrame(() => document.getElementById('boot')?.remove())
