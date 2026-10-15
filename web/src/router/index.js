import { createRouter, createWebHistory } from 'vue-router'

// T-01.1: satu rute stub. Guard role + halaman penuh menyusul di T-02 dst.
const routes = [
  { path: '/', name: 'home', component: () => import('../pages/Home.vue') },
]

export const router = createRouter({ history: createWebHistory(), routes })
