// Tahap 2: login Keycloak (Direct Access Grant + TOTP) lalu exchange ke peladen-be.
// Windows-native, tanpa bash/oathtool. Setara gabungan:
//   peladen-be/scripts/login-mfa.sh + peladen-be/scripts/login-exchange.sh
//
// Cara pakai:
//   node login.mjs <username> <password> <kode-6-digit-ATAU-secret>
//   node login.mjs <username> <password> --secret BASE32
//   node login.mjs <username> <password> <otp> --nik <16-digit>   (register-citizen bila nik_required)
//   node login.mjs <username> <password> <otp> --no-exchange      (berhenti di login Keycloak)
//   node login.mjs <username> <password> <otp> --token-only       (cetak HANYA access token ke stdout)
//   node login.mjs --decode <jwt>                                (baca payload token, offline)
//
// Env (opsional, agar password/secret tidak masuk history terminal):
//   LOGIN_USERNAME, LOGIN_PASSWORD, TOTP_SECRET, CLIENT_SECRET,
//   REALM_URL (default realm satriya), CLIENT_ID (default diy-gov),
//   BACKEND_URL (default http://localhost:8108), COOKIE_JAR (default ./.dev-cookies)
//
// Keamanan: password, secret, dan token TIDAK pernah dicetak kecuali --token-only
// (sengaja, untuk piping seperti TOKEN_ONLY=1 di login-mfa.sh).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolveCode, decodeJwt } from './totp.mjs';

const REALM_URL = (process.env.REALM_URL ?? 'https://sso.jogjaprov.go.id/realms/satriya').replace(/\/$/, '');
const CLIENT_ID = process.env.CLIENT_ID ?? 'diy-gov';
const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:8108').replace(/\/$/, '');
const JAR_PATH = process.env.COOKIE_JAR ?? './.dev-cookies';
const MEDIA = 'application/vnd.api+json';

function usage() {
  return [
    'Pakai:',
    '  node login.mjs <username> <password> <kode-6-digit-ATAU-secret> [--nik NIK] [--no-exchange] [--token-only]',
    '  node login.mjs --decode <jwt>',
    '',
    'Client confidential -> set CLIENT_SECRET dulu (jangan hardcode).',
    'Sesi tersimpan di COOKIE_JAR untuk memanggil rute terlindungi:',
    '  curl -b .dev-cookies http://localhost:8108/me',
  ].join('\n');
}

function argValue(argv, ...names) {
  for (const n of names) {
    const i = argv.indexOf(n);
    if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('-')) return argv[i + 1];
  }
  return '';
}

function loadJar() {
  try {
    if (!existsSync(JAR_PATH)) return {};
    return JSON.parse(readFileSync(JAR_PATH, 'utf8')).cookies ?? {};
  } catch { return {}; }
}

function saveJar(cookies) {
  writeFileSync(JAR_PATH, JSON.stringify({ cookies, updated_at: new Date().toISOString() }, null, 2));
}

function cookieHeader(jar) {
  return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
}

function storeCookies(jar, res) {
  // Node fetch: getSetCookie() bila tersedia, fallback parsing mentah.
  const raw = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : [res.headers.get('set-cookie')].filter(Boolean);
  for (const line of raw.flatMap((l) => String(l).split(/,(?=[^;,]+=[^;,]+;)/))) {
    const m = String(line).trim().match(/^([^=;\s]+)=([^;]*)/);
    if (m) jar[m[1]] = m[2];
  }
  return jar;
}

async function keycloakLogin(username, password, code) {
  const body = new URLSearchParams({
    username, password, client_id: CLIENT_ID, grant_type: 'password', totp: code, scope: 'openid',
  });
  if (process.env.CLIENT_SECRET) body.set('client_secret', process.env.CLIENT_SECRET);
  const res = await fetch(`${REALM_URL}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
    body,
    signal: AbortSignal.timeout(30000),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) {
    console.error('LOGIN GAGAL. Response Keycloak:');
    console.error(JSON.stringify(data ?? { http: res.status }, null, 2));
    process.exit(1);
  }
  return data;
}

async function exchange(kcToken, jar, path, body) {
  const headers = { Accept: MEDIA, 'Content-Type': MEDIA, Authorization: `Bearer ${kcToken}` };
  const cookies = cookieHeader(jar);
  if (cookies) headers.Cookie = cookies;
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST', headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  storeCookies(jar, res);
  saveJar(jar);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('-h') || argv.includes('--help')) { console.log(usage()); return; }
  if (argv.includes('--decode')) {
    const t = argValue(argv, '--decode') || argv[argv.indexOf('--decode') + 1] || '';
    console.log(JSON.stringify(decodeJwt(t), null, 2));
    return;
  }

  const flags = new Set(argv.filter((a) => a.startsWith('-')));
  const positional = argv.filter((a, i) => !a.startsWith('-') && !['--secret', '--nik'].includes(argv[i - 1]));
  const username = argValue(argv, '--username', '-u') || positional[0] || process.env.LOGIN_USERNAME || '';
  const password = argValue(argv, '--password', '-p') || positional[1] || process.env.LOGIN_PASSWORD || '';
  const otpInput = argValue(argv, '--secret') || positional[2] || process.env.TOTP_SECRET || '';
  const nik = argValue(argv, '--nik') || '';
  if (!username || !password || !otpInput) {
    console.error('Username, password, dan kode/secret OTP wajib diisi.');
    console.error(usage());
    process.exit(1);
  }

  const { code, fromSecret } = resolveCode(otpInput);
  console.error(fromSecret ? 'Kode TOTP dibuat dari secret.' : 'Pakai kode langsung.');
  // Urutan = login-mfa.sh: [1/2] login, [2/2] exchange.
  console.error('>> [1/2] Login Keycloak + OTP...');
  const tokens = await keycloakLogin(username, password, code);
  console.error('LOGIN BERHASIL.');

  if (flags.has('--token-only')) {
    console.log(tokens.access_token);
    return;
  }
  console.error('=== DECODED ACCESS TOKEN ===');
  console.error(JSON.stringify(decodeJwt(tokens.access_token), null, 2));

  if (flags.has('--no-exchange')) return;

  console.error(`>> [2/2] Exchange ke ${BACKEND_URL}/auth/exchange...`);
  const jar = loadJar();
  const ex = await exchange(tokens.access_token, jar, '/auth/exchange');
  if (!ex.ok && ex.status === 401 && ex.data?.errors?.some((e) => e.code === 'nik_required')) {
    if (nik) {
      console.error('>> nik_required: mendaftarkan NIK...');
      const reg = await exchange(tokens.access_token, jar, '/auth/register-citizen', { nik });
      console.log(JSON.stringify(reg.data, null, 2));
      if (!reg.ok) process.exit(1);
      return;
    }
    console.error('>> Akun ini belum tertaut NIK. Ulangi dengan tambahan --nik <16-digit>.');
    process.exit(0);
  }
  console.log(JSON.stringify(ex.data, null, 2));
  if (!ex.ok || !ex.data?.data?.identity) {
    console.error('>> Exchange GAGAL - lihat response di atas.');
    process.exit(1);
  }
  console.error(`>> Sesi tersimpan di ${JAR_PATH}. Pakai untuk rute terlindungi:`);
  console.error(`   curl -b ${JAR_PATH} ${BACKEND_URL}/me`);
}

main().catch((err) => {
  console.error(`Gagal: ${err.message}`);
  process.exit(1);
});
