// Primitif validasi T-01.2 (zod + @vee-validate/zod).
// Skema per form (kategori, sub kategori, barang masuk) menyusul di T-05 dst.
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

export { z, toTypedSchema }

// String wajib isi (trim dulu supaya spasi doang ditolak).
export const requiredString = (label = 'Field') =>
  z.string({ required_error: `${label} wajib diisi.` }).trim().min(1, `${label} wajib diisi.`)

// Angka uang: menolak NaN/negatif di level fondasi.
export const rupiahNumber = (label = 'Nominal') =>
  z.number({ invalid_type_error: `${label} harus angka.` }).min(0, `${label} tidak boleh negatif.`)

// Kode unik master (dipakai T-05 Kategori): maks 10 karakter.
export const masterCode = (label = 'Kode') =>
  requiredString(label).max(10, `${label} maks. 10 karakter.`)
