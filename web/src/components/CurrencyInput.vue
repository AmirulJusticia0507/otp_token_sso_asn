<script setup>
// T-03.2: input Rupiah (dipakai price, price_limit, grand_total).
// v-model number; tampil format "Rp1.500.000" saat blur, digit polos saat fokus.
import { ref, watch } from 'vue'
import { formatRupiah, parseRupiah } from '../utils/currency.js'

const props = defineProps({
  label: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
const model = defineModel({ type: Number, default: 0 })
const text = ref(formatRupiah(model.value))
const focused = ref(false)
const id = `rp-${Math.random().toString(36).slice(2)}`

watch(model, (v) => { if (!focused.value) text.value = formatRupiah(v) })

function onFocus() {
  focused.value = true
  text.value = String(model.value || '')
}
function onInput() {
  model.value = parseRupiah(text.value)
}
function onBlur() {
  focused.value = false
  text.value = formatRupiah(model.value)
}
</script>

<template>
  <label class="block" :for="id">
    <span v-if="label" class="mb-1 block text-sm font-medium">
      {{ label }}<span v-if="required" class="text-red-600"> *</span>
    </span>
    <input
      :id="id" v-model="text" inputmode="numeric" autocomplete="off"
      :required="required" :disabled="disabled"
      @focus="onFocus" @input="onInput" @blur="onBlur"
      class="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
      :class="error ? 'border-red-500' : 'border-slate-300 focus:border-slate-500'"
    />
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </label>
</template>
