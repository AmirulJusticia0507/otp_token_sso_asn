<script setup>
// T-04: form login SSO — username + password + kode OTP (6 digit dari
// authenticator atau otp.mjs) -> Keycloak -> POST /auth/exchange -> sesi cookie.
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { requestUserToken } from '../services/keycloak.js'
import { useToast } from '../composables/useToast.js'
import BaseInput from '../components/BaseInput.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const { push } = useToast()

const username = ref('')
const password = ref('')
const totp = ref('')
const busy = ref(false)
const formError = ref('')

async function submit() {
  if (busy.value) return
  busy.value = true
  formError.value = ''
  try {
    if (!/^[0-9]{6}$/.test(totp.value.trim())) {
      throw new Error('Kode OTP harus 6 digit angka.')
    }
    const userToken = await requestUserToken({
      username: username.value,
      password: password.value,
      totp: totp.value,
    })
    await auth.exchangeWithToken(userToken)
    push(`Selamat datang, ${auth.displayName}.`, 'ok')
    router.replace(String(route.query.redirect ?? '/'))
  } catch (err) {
    formError.value = err.message
    push(err.message, 'error')
  } finally {
    password.value = ''
    totp.value = ''
    busy.value = false
  }
}
</script>

<template>
  <section class="mx-auto mt-10 max-w-md rounded-xl border bg-white p-6 shadow-sm">
    <h2 class="text-xl font-bold">Masuk — ASN DIY</h2>
    <p class="mt-1 text-sm text-slate-600">
      Realm <span class="font-mono">satriya</span>. Kode OTP dari aplikasi authenticator
      atau helper <span class="font-mono">otp.mjs</span>.
    </p>
    <form class="mt-4 space-y-3" @submit.prevent="submit">
      <BaseInput v-model="username" label="Username / NIP" required autocomplete="username" />
      <BaseInput v-model="password" label="Password" type="password" required autocomplete="current-password" />
      <BaseInput
        v-model="totp" label="Kode OTP" required
        inputmode="numeric" autocomplete="one-time-code" placeholder="6 digit"
      />
      <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
      <button
        type="submit" :disabled="busy"
        class="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {{ busy ? 'Memeriksa…' : 'Masuk' }}
      </button>
    </form>
  </section>
</template>
