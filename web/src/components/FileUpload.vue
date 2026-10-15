<script setup>
// T-03.2: unggah lampiran surat masuk (v-model File|null, validasi ukuran di sisi klien).
import { ref } from 'vue'

const props = defineProps({
  label: { type: String, default: 'Lampiran' },
  accept: { type: String, default: '.pdf,.jpg,.jpeg,.png' },
  maxBytes: { type: Number, default: 10 * 1024 * 1024 },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})
const model = defineModel({ type: [Object, null], default: null })
const localError = ref('')
const id = `fu-${Math.random().toString(36).slice(2)}`

function fmt(bytes) {
  return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}

function onChange(e) {
  localError.value = ''
  const f = e.target.files?.[0] ?? null
  if (!f) { model.value = null; return }
  if (f.size > props.maxBytes) {
    localError.value = `Berkas ${fmt(f.size)} melebihi batas ${fmt(props.maxBytes)}.`
    model.value = null
    e.target.value = ''
    return
  }
  model.value = f
}

function clear() {
  model.value = null
  localError.value = ''
  const el = document.getElementById(id)
  if (el) el.value = ''
}
</script>

<template>
  <div class="block">
    <span v-if="label" class="mb-1 block text-sm font-medium">{{ label }}</span>
    <input
      :id="id" type="file" :accept="accept" :disabled="disabled"
      class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:text-white disabled:bg-slate-100"
      @change="onChange"
    />
    <p v-if="model" class="mt-1 text-xs text-slate-600">
      {{ model.name }} ({{ fmt(model.size) }})
      <button type="button" class="ml-2 text-red-600 underline" @click="clear">hapus</button>
    </p>
    <p v-if="localError || error" class="mt-1 text-xs text-red-600">{{ localError || error }}</p>
  </div>
</template>
