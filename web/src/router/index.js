import { createRouter, createWebHistory } from 'vue-router'
import { installGuard } from './guards.js'

// T-02.2: rute lindung + login (stub, form penuh di T-04).
// Halaman Admin-only (master data, manajemen user) menyusul di T-05 dst.
const routes = [
  { path: '/', name: 'home', component: () => import('../pages/Home.vue'), meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: () => import('../pages/Login.vue'), meta: { guestOnly: true } },
]

export const router = createRouter({ history: createWebHistory(), routes })

// Guard dipasang di main.js setelah Pinia (butuh store aktif).
export { installGuard }
