// TOTP viewer (Keycloak satriya) — tanpa dependensi, Node 18+.
// Cara pakai:
//   set TOTP_SECRET=JBSW...  (sekali per terminal)
//   node otp.mjs              -> tampilkan 1 kode + sisa detik
//   node otp.mjs --watch      -> auto-refresh tiap detik
//   node otp.mjs ABCDEF123    -> secret via argumen (tidak disarankan, masuk history)
// Secret juga bisa berupa URL otpauth://...?secret=XXX (diambil param secret-nya saja).
// Secret TIDAK pernah dicetak ke layar / log.
import { readFileSync, existsSync } from 'node:fs';
import { base32Decode, extractSecret, totp, remainingSecs } from './totp.mjs';

function usage() {
  return [
    'Pakai:',
    '  node otp.mjs [--watch] [--secret BASE32]',
    '  node otp.mjs JBSWY3DPEHPK3PXP',
    '',
    'Sumber secret (urutan prioritas): --secret / argumen / env TOTP_SECRET / file .totp-secret',
    'File .totp-secret sudah di-gitignore, isi 1 baris secret saja.',
  ].join('\n');
}

function loadSecret(argv) {
  const secretArgv = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--watch' || argv[i] === '-w') continue;
    if (argv[i] === '--time') { i++; continue; }
    secretArgv.push(argv[i]);
  }
  const idx = secretArgv.indexOf('--secret');
  if (idx !== -1 && secretArgv[idx + 1]) return secretArgv[idx + 1];
  const positional = secretArgv.find((a) => !a.startsWith('-'));
  if (positional) return positional;
  if (process.env.TOTP_SECRET) return process.env.TOTP_SECRET;
  if (process.env.OTP_SECRET) return process.env.OTP_SECRET;
  if (existsSync('.totp-secret')) {
    const f = readFileSync('.totp-secret', 'utf8').split('\n')[0]?.trim();
    if (f) return f;
  }
  return '';
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('-h') || argv.includes('--help')) {
    console.log(usage());
    process.exit(0);
  }
  const watch = argv.includes('--watch') || argv.includes('-w');
  // --time <detik> hanya untuk verifikasi mandiri, tidak untuk pemakaian harian.
  const ti = argv.indexOf('--time');
  const fixedTime = ti !== -1 && argv[ti + 1] ? Number(argv[ti + 1]) * 1000 : null;

  const key = base32Decode(extractSecret(loadSecret(argv)));

  if (fixedTime) {
    console.log(totp(key, fixedTime).code);
    return;
  }

  if (!watch) {
    const now = Date.now();
    const { code } = totp(key, now);
    console.log(code);
    console.error(`Sisa ${remainingSecs(now)} dtk. Untuk auto-refresh: node otp.mjs --watch`);
    return;
  }

  let lastCounter = -1;
  const tick = () => {
    const now = Date.now();
    const { code, counter } = totp(key, now);
    const left = remainingSecs(now);
    if (counter !== lastCounter) {
      lastCounter = counter;
      process.stdout.write(`\n${code}  (berlaku ${left} dtk)`);
    } else {
      process.stdout.write(`\r${code}  (sisa ${left} dtk) `);
    }
  };
  console.error('Tekan Ctrl+C untuk berhenti. Kode baru tiap 30 detik.');
  tick();
  setInterval(tick, 1000);
}

try {
  main();
} catch (err) {
  console.error(`Gagal: ${err.message}`);
  console.error(usage());
  process.exit(1);
}
