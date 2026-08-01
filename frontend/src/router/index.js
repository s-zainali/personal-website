import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '@/views/LandingView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', name: 'home', component: LandingView },
        // full section pages — lazy-loaded so they don't weigh down the landing bundle
        { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue') },
        { path: '/experience', name: 'experience', component: () => import('@/views/ExperienceView.vue') },
        { path: '/projects', name: 'projects', component: () => import('@/views/ProjectsView.vue') },
        { path: '/projects/:slug', name: 'project', component: () => import('@/views/ProjectView.vue') },
        { path: '/contact', name: 'contact', component: () => import('@/views/ContactView.vue') },
        { path: '/:pathMatch(.*)*', redirect: '/' },
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        if (to.hash) return { el: to.hash, behavior: 'smooth' }
        return { top: 0 }
    },
})

export default router