<script setup>
// T-03.1: textarea generik (label + error + rows).
const props = defineProps({
  label: { type: String, default: '' },
  rows: { type: Number, default: 3 },
  error: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
const model = defineModel({ type: String, default: '' })
const id = `ta-${Math.random().toString(36).slice(2)}`
</script>

<template>
  <label class="block" :for="id">
    <span v-if="label" class="mb-1 block text-sm font-medium">
      {{ label }}<span v-if="required" class="text-red-600"> *</span>
    </span>
    <textarea
      :id="id" v-model="model" :rows="rows" :placeholder="placeholder"
      :required="required" :disabled="disabled"
      class="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
      :class="error ? 'border-red-500' : 'border-slate-300 focus:border-slate-500'"
    />
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </label>
</template>
