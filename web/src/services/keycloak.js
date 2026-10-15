// T-04: Direct Access Grant ke Keycloak (username + password + TOTP).
// Token yang kembali langsung diserahkan ke useAuthStore.exchangeWithToken,
// tidak disimpan di mana pun (cermin login.mjs tahap 2).
const REALM_URL = (
  import.meta.env?.VITE_KEYCLOAK_REALM_URL ?? 'https://sso.jogjaprov.go.id/realms/satriya'
).replace(/\/$/, '')
const CLIENT_ID = import.meta.env?.VITE_KEYCLOAK_CLIENT_ID ?? 'diy-gov'

export function mapKeycloakError(data) {
  if (data?.error === 'invalid_grant') return 'Username, password, atau kode OTP salah.'
  if (data?.error_description) return data.error_description
  return 'Login Keycloak gagal.'
}

export async function requestUserToken({ username, password, totp }) {
  const body = new URLSearchParams({
    username: String(username ?? '').trim(),
    password: String(password ?? ''),
    client_id: CLIENT_ID,
    grant_type: 'password',
    totp: String(totp ?? '').trim(),
    scope: 'openid',
  })
  const secret = import.meta.env?.VITE_KEYCLOAK_CLIENT_SECRET
  if (secret) body.set('client_secret', secret)
  const res = await fetch(`${REALM_URL}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
    body,
    signal: AbortSignal.timeout(30000),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.access_token) throw new Error(mapKeycloakError(data))
  return data.access_token
}
