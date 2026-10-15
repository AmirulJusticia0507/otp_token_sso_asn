<script setup>
// T-03.3: pagination (jendela 5 nomor di sekitar halaman aktif).
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, default: 1 },
  pages: { type: Number, default: 1 },
})
const emit = defineEmits(['update:page'])

const numbers = computed(() => {
  const start = Math.max(1, Math.min(props.page - 2, props.pages - 4))
  const out = []
  for (let p = start; p <= Math.min(props.pages, start + 4); p++) out.push(p)
  return out
})

function go(p) {
  if (p >= 1 && p <= props.pages && p !== props.page) emit('update:page', p)
}
</script>

<template>
  <nav v-if="pages > 1" class="mt-3 flex items-center gap-1 text-sm">
    <button type="button" class="rounded-lg border px-2.5 py-1.5 disabled:opacity-40" :disabled="page <= 1" @click="go(page - 1)">
      ‹
    </button>
    <button
      v-for="p in numbers" :key="p" type="button"
      class="rounded-lg border px-2.5 py-1.5"
      :class="p === page ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-100'"
      @click="go(p)"
    >
      {{ p }}
    </button>
    <button type="button" class="rounded-lg border px-2.5 py-1.5 disabled:opacity-40" :disabled="page >= pages" @click="go(page + 1)">
      ›
    </button>
  </nav>
</template>
