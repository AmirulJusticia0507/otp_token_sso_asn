<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import AppLayout from './layouts/AppLayout.vue'

// T-02.3: halaman publik (login) polos; selebihnya di dalam layout + guard.
const auth = useAuthStore()
const route = useRoute()
const bare = computed(() => route.meta.guestOnly || !auth.isAuthenticated)

onMounted(() => {
  if (auth.status === 'loading') auth.refresh()
})
</script>

<template>
  <AppLayout v-if="!bare">
    <RouterView />
  </AppLayout>
  <div v-else class="min-h-screen bg-slate-50 text-slate-900">
    <main class="mx-auto max-w-5xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
