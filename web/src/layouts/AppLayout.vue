<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const router = useRouter()

// Nav nyata hanya yang sudah ada rutenya; sisanya nonaktif sampai TODO-nya dikerjakan.
const nav = [
  { to: '/', label: 'Beranda' },
  { label: 'Barang Masuk', soon: true },
  { label: 'Master Data', soon: true },
  { label: 'Manajemen User', soon: true },
]

const badgeClass = computed(() =>
  auth.isAdmin ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800',
)

async function signOut() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 text-slate-900">
    <aside class="flex w-60 shrink-0 flex-col border-r bg-white">
      <div class="border-b px-4 py-3 font-semibold">Pengelolaan Barang</div>
      <nav class="flex-1 space-y-1 p-3">
        <template v-for="item in nav" :key="item.label">
          <RouterLink
            v-if="item.to" :to="item.to"
            class="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
            active-class="bg-slate-900 text-white hover:bg-slate-900"
          >
            {{ item.label }}
          </RouterLink>
          <span v-else class="block rounded-lg px-3 py-2 text-sm text-slate-400">
            {{ item.label }} <small class="ml-1 rounded bg-slate-100 px-1">segera</small>
          </span>
        </template>
      </nav>
      <div class="border-t p-3 text-sm">
        <p class="font-medium">{{ auth.displayName }}</p>
        <p class="text-xs text-slate-500">{{ auth.identity?.nip || '—' }}</p>
        <span :class="['mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium', badgeClass]">
          {{ auth.role || '—' }}
        </span>
        <button
          type="button" @click="signOut"
          class="mt-2 w-full rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-100"
        >
          Keluar
        </button>
      </div>
    </aside>
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="border-b bg-white px-6 py-3">
        <p class="text-sm text-slate-500">DIY-Gov · PT JMC Indonesia</p>
      </header>
      <main class="mx-auto w-full max-w-5xl flex-1 px-6 py-6">
        <slot />
      </main>
    </div>
  </div>
</template>
