<script setup>
// T-03.1: input teks generik (label + error + required). v-model string/number.
const props = defineProps({
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  autocomplete: { type: String, default: 'off' },
  inputmode: { type: String, default: undefined },
})
const model = defineModel({ type: [String, Number], default: '' })
const id = `in-${Math.random().toString(36).slice(2)}`
</script>

<template>
  <label class="block" :for="id">
    <span v-if="label" class="mb-1 block text-sm font-medium">
      {{ label }}<span v-if="required" class="text-red-600"> *</span>
    </span>
    <input
      :id="id" v-model="model" :type="type" :placeholder="placeholder"
      :required="required" :disabled="disabled" :autocomplete="autocomplete"
      :inputmode="inputmode"
      class="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
      :class="error ? 'border-red-500' : 'border-slate-300 focus:border-slate-500'"
    />
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </label>
</template>
