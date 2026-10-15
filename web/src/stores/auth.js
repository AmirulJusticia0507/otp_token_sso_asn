// Store auth T-02.1: satu-satunya sumber identitas + peran di frontend.
// Kontrak: POST /auth/exchange (header X-User-Assertion: token Keycloak) -> cookie
// HttpOnly `session`; GET /introspect -> Kontrak Identitas; POST /auth/logout.
// Token Keycloak hanya di memori dan dibuang seusai ditukar (dilarang disimpan).
import { defineStore } from 'pinia'
import { api } from '../services/api.js'

// Bentuk kontrak dinormalisasi supaya komponen tidak menebak-nebak field backend.
export function normalizeIdentity(raw) {
  const c = raw?.identity ?? raw ?? null
  if (!c || typeof c !== 'object') return null
  if (!c.id && !c.user_id && !c.nip && !c.name && !c.nama) return null
  return {
    id: c.id ?? c.user_id ?? '',
    nip: c.nip ?? '',
    name: c.nama ?? c.name ?? '',
    email: c.email ?? '',
    role: c.role ?? '',
    operatorId: c.operator_id ?? c.id ?? c.user_id ?? '',
    raw: c,
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    status: 'loading', // loading | anonymous | authenticated | error
    identity: null,
    error: '',
  }),
  getters: {
    isAuthenticated: (s) => s.status === 'authenticated' && !!s.identity,
    role: (s) => s.identity?.role ?? '',
    isAdmin: (s) => (s.identity?.role ?? '') === 'Admin',
    isOperator: (s) => (s.identity?.role ?? '') === 'Operator',
    displayName: (s) => s.identity?.name || s.identity?.nip || 'Pengguna',
  },
  actions: {
    // Menukar token Keycloak menjadi sesi cookie + kontrak identitas.
    async exchangeWithToken(kcToken) {
      this.status = 'loading'
      this.error = ''
      try {
        const res = await api.post('/auth/exchange', undefined, {
          headers: { 'X-User-Assertion': kcToken },
        })
        this.identity = normalizeIdentity(res.data)
        if (!this.identity) {
          this.status = 'error'
          this.error = 'Kontrak identitas kosong.'
          return null
        }
        this.status = 'authenticated'
        return this.identity
      } catch (err) {
        this.status = 'error'
        this.error = err.message
        throw err
      }
    },
    // Memulihkan sesi dari cookie (mis. sehabis reload) tanpa token Keycloak.
    async refresh() {
      try {
        const res = await api.get('/introspect')
        this.identity = normalizeIdentity(res.data)
        this.status = this.identity ? 'authenticated' : 'anonymous'
      } catch {
        this.identity = null
        this.status = 'anonymous'
      }
    },
    async logout() {
      await api.post('/auth/logout').catch(() => {})
      this.identity = null
      this.error = ''
      this.status = 'anonymous'
    },
  },
})
