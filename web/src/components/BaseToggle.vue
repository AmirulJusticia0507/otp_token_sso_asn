<script setup>
// T-03.1: saklar boolean (dipakai Toggle Verifikasi T-10). v-model boolean.
const props = defineProps({
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})
const model = defineModel({ type: Boolean, default: false })
const id = `tg-${Math.random().toString(36).slice(2)}`
</script>

<template>
  <label :for="id" class="inline-flex cursor-pointer items-center gap-2">
    <input :id="id" v-model="model" type="checkbox" :disabled="disabled" class="peer sr-only" />
    <span
      class="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-slate-900 peer-disabled:opacity-50 after:ml-0.5 after:mt-0.5 after:block after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5"
    />
    <span v-if="label" class="text-sm font-medium">{{ label }}</span>
  </label>
</template>
