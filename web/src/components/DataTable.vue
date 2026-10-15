<script setup>
// T-03.3: tabel generik. columns: [{ key, label }]. Sel kustom via slot `cell(key)`.
// rows = irisan halaman aktif (lihat usePagination + Pagination.vue).
const props = defineProps({
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="overflow-x-auto rounded-xl border bg-white">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b bg-slate-50 text-left">
          <th v-for="c in columns" :key="c.key" class="px-4 py-2 font-medium text-slate-600">
            {{ c.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in rows" :key="i" class="border-b last:border-0 hover:bg-slate-50">
          <td v-for="c in columns" :key="c.key" class="px-4 py-2">
            <slot :name="`cell(${c.key})`" :row="r" :value="r[c.key]">
              {{ r[c.key] ?? '—' }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
