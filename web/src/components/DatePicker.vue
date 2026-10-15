<script setup>
// T-03.2: tanggal native (YYYY-MM-DD) — aksesibel + ramah mobile. v-model string.
const props = defineProps({
  label: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  min: { type: String, default: undefined },
  max: { type: String, default: undefined },
})
const model = defineModel({ type: String, default: '' })
const id = `dt-${Math.random().toString(36).slice(2)}`
</script>

<template>
  <label class="block" :for="id">
    <span v-if="label" class="mb-1 block text-sm font-medium">
      {{ label }}<span v-if="required" class="text-red-600"> *</span>
    </span>
    <input
      :id="id" v-model="model" type="date" :min="min" :max="max"
      :required="required" :disabled="disabled"
      class="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
      :class="error ? 'border-red-500' : 'border-slate-300 focus:border-slate-500'"
    />
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </label>
</template>
