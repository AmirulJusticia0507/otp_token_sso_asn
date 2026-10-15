// Util Rupiah T-01.3: dipakai masking input harga + validasi price_limit (T-06/T-09).
// total_price[i] = price[i] * quantity[i]; Grand Total = sum(total_price).

// 1500000 -> "Rp1.500.000". Non-angka -> "Rp0".
export function formatRupiah(value) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return 'Rp0'
  return `Rp${Math.round(n).toLocaleString('id-ID')}`
}

// "Rp1.500.000" / "1.500,50" -> 1500000. Gagal parse -> 0.
export function parseRupiah(text) {
  if (typeof text === 'number') return Number.isFinite(text) ? text : 0
  const digits = String(text ?? '').replace(/[^0-9,-]/g, '').replace(/\./g, '').replace(',', '.')
  const n = Number(digits)
  return Number.isFinite(n) ? n : 0
}

// Grand Total dari daftar item {price, quantity}. Dipakai validasi price_limit.
export function grandTotal(items = []) {
  return items.reduce(
    (sum, it) => sum + Number(it.price ?? 0) * Number(it.quantity ?? 0),
    0,
  )
}

// true bila Grand Total masih dalam batas Sub Kategori (syarat simpan, 422 bila langgar).
export function withinPriceLimit(items = [], priceLimit = 0) {
  return grandTotal(items) <= Number(priceLimit ?? 0)
}
