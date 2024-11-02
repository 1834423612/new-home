import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import Projects from '@/views/Projects.vue'
import About from '@/views/About.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/projects',
        name: 'Projects',
        component: Projects
    },
    {
        path: '/about',
        name: 'About',
        component: About
    },
    // {
    //     path: '/projects',
    //     name: 'Projects',
    //     component: () => import('../views/Projects.vue')
    // },
    // {
    //     path: '/about',
    //     name: 'About',
    //     component: () => import('../views/About.vue')
    // }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router