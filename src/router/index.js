import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import("@/Layout/index.vue")
    },
    {
      path: '/main',
      name: 'Main',
      component: () => import("@/views/Home/index.vue")
    },
    {
      path: '/config',
      name: 'Config',
      component: () => import("@/views/Config/index.vue")
    }
  ]
})

export default router