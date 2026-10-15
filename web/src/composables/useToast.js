// T-03.3: toast global (dipakai Toaster.vue). Auto-hilang 4 detik.
import { ref } from 'vue'

const toasts = ref([])
let seq = 0

export function useToast() {
  function push(message, tone = 'info') {
    const id = ++seq
    toasts.value.push({ id, message, tone })
    setTimeout(() => remove(id), 4000)
    return id
  }
  function remove(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }
  return { toasts, push, remove }
}
