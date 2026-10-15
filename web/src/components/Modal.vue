<script setup>
// T-03.3: modal popup (dipakai CRUD master data T-05/T-06). v-model boolean.
import { onMounted, onUnmounted, watch } from 'vue'

const open = defineModel({ type: Boolean, default: false })
const props = defineProps({ title: { type: String, default: '' } })
const emit = defineEmits(['close'])

function onKey(e) {
  if (e.key === 'Escape') close()
}
function close() {
  open.value = false
  emit('close')
}

watch(open, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" @click="close" />
      <div class="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h3 v-if="title" class="mb-4 text-lg font-bold">{{ title }}</h3>
        <slot />
        <div v-if="$slots.footer" class="mt-4 flex justify-end gap-2">
          <slot name="footer" :close="close" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
