<script setup>
// T-OTP.1: form Generate kode OTP. Klik tombol -> kode 6 digit muncul + countdown.
// Secret HANYA di memori tab (ref), hilang saat reload. Tidak disimpan/di-log.
import { ref, onUnmounted } from 'vue'
import { totpNow } from '../utils/totp.js'
import { useToast } from '../composables/useToast.js'
import BaseInput from '../components/BaseInput.vue'
import BaseSelect from '../components/BaseSelect.vue'

const { push } = useToast()

// Daftar akun = LABEL saja. Secret tidak ada di kode, ditempel manual per klik.
const accounts = [
  'test-gov',
  'kepala.opd',
  'staff.opd',
  'diskominfo.aptika',
  'diskominfo.sandi',
  'bapperida.brida',
].map((a) => ({ value: a, label: a }))

const account = ref(accounts[0].value)
const secret = ref('')
const code = ref('')
const left = ref(0)
const formError = ref('')
let timer = null

function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function tick() {
  try {
    const r = totpNow(secret.value)
    code.value = r.code
    left.value = r.left
  } catch {
    // Secret dihapus/diubah jadi invalid saat timer jalan: berhenti diam-diam.
    stop()
    code.value = ''
  }
}

function generate() {
  formError.value = ''
  stop()
  code.value = ''
  try {
    tick()
    timer = setInterval(tick, 1000)
  } catch (err) {
    formError.value = err.message
    push(err.message, 'error')
  }
}

function clearAll() {
  stop()
  secret.value = ''
  code.value = ''
  left.value = 0
  formError.value = ''
}

async function copy() {
  try {
    await navigator.clipboard.writeText(code.value)
    push('Kode tersalin.', 'ok')
  } catch {
    push('Gagal menyalin otomatis — salin manual dari layar.', 'error')
  }
}

onUnmounted(stop)
</script>

<template>
  <section class="mx-auto max-w-md rounded-xl border bg-white p-6 shadow-sm">
    <h2 class="text-xl font-bold">Generate Kode OTP</h2>
    <p class="mt-1 text-sm text-slate-600">
      Pilih akun, tempel secret-nya, klik Generate — kode 6 digit muncul di bawah.
      Secret hanya di memori tab ini.
    </p>
    <div class="mt-4 space-y-3">
      <BaseSelect v-model="account" label="Akun" :options="accounts" />
      <BaseInput
        v-model="secret" label="Secret (Base32 / otpauth URL)" type="password"
        placeholder="Tempel secret di sini" autocomplete="off"
      />
      <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
      <div class="flex gap-2">
        <button
          type="button" @click="generate"
          class="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Generate
        </button>
        <button
          v-if="code || secret" type="button" @click="clearAll"
          class="rounded-lg border px-4 py-2 text-sm hover:bg-slate-100"
        >
          Bersihkan
        </button>
      </div>
    </div>

    <div v-if="code" class="mt-4 rounded-xl border bg-slate-50 p-4 text-center">
      <p class="text-xs text-slate-500">{{ account }}</p>
      <p class="font-mono text-4xl font-bold tracking-widest">{{ code }}</p>
      <div class="mt-2 h-1.5 overflow-hidden rounded bg-slate-200">
        <div
          class="h-full bg-slate-900 transition-all duration-1000"
          :style="{ width: `${(left / 30) * 100}%` }"
        />
      </div>
      <p class="mt-1 text-xs text-slate-500">berlaku {{ left }} detik</p>
      <button
        type="button" @click="copy"
        class="mt-2 rounded-lg border px-4 py-1.5 text-sm hover:bg-slate-100"
      >
        Copy
      </button>
    </div>
  </section>
</template>
