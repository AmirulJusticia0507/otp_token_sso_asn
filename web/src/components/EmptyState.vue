<script setup>
// T-03.3: status kosong (filter tanpa hasil, tabel belum ada data).
const props = defineProps({
  title: { type: String, default: 'Belum ada data' },
  hint: { type: String, default: '' },
})
</script>

<template>
  <div class="rounded-xl border border-dashed bg-white px-4 py-10 text-center">
    <p class="font-medium">{{ title }}</p>
    <p v-if="hint" class="mt-1 text-sm text-slate-500">{{ hint }}</p>
  </div>
</template>
