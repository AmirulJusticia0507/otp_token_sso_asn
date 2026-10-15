<script setup>
// T-03.1: dropdown generik. options: [{ value, label }].
const props = defineProps({
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  error: { type: String, default: '' },
  placeholder: { type: String, default: '— Pilih —' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
const model = defineModel({ type: [String, Number], default: '' })
const id = `sel-${Math.random().toString(36).slice(2)}`
</script>

<template>
  <label class="block" :for="id">
    <span v-if="label" class="mb-1 block text-sm font-medium">
      {{ label }}<span v-if="required" class="text-red-600"> *</span>
    </span>
    <select
      :id="id" v-model="model" :required="required" :disabled="disabled"
      class="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
      :class="error ? 'border-red-500' : 'border-slate-300 focus:border-slate-500'"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </label>
</template>
