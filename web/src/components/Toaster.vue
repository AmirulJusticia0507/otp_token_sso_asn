<script setup>
// T-03.3: wadah toast global. Pasang sekali di App.vue (menyusul T-04).
import { useToast } from '../composables/useToast.js'

const { toasts, remove } = useToast()
const toneClass = (t) =>
  t === 'error' ? 'border-red-300 bg-red-50 text-red-800'
  : t === 'ok' ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
  : 'border-slate-300 bg-white text-slate-800'
</script>

<template>
  <div class="pointer-events-none fixed bottom-4 right-4 z-50 w-80 space-y-2">
    <div
      v-for="t in toasts" :key="t.id"
      :class="['pointer-events-auto rounded-xl border px-4 py-2.5 text-sm shadow-lg', toneClass(t.tone)]"
    >
      <div class="flex items-start justify-between gap-2">
        <span>{{ t.message }}</span>
        <button type="button" class="opacity-60 hover:opacity-100" @click="remove(t.id)">✕</button>
      </div>
    </div>
  </div>
</template>
