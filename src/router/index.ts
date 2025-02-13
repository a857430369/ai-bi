import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/Layout/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => Layout
    },
    {
      path: '/main',
      name: 'Main',
      component: () => import("@/views/Main/index.vue")
    },
    {
      path: '/config',
      name: 'Config',
      component: () => import("@/views/Config/index.vue")
    }
  ]
})

export default router