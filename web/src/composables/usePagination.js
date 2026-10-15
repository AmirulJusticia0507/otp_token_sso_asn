// T-03.3: logika pagination murni (10 item/halaman sesuai dokumen).
export const PER_PAGE = 10

export function totalPages(total, perPage = PER_PAGE) {
  return Math.max(1, Math.ceil(Number(total ?? 0) / perPage))
}

export function clampPage(page, pages) {
  return Math.min(Math.max(1, Number(page ?? 1)), pages)
}

// Mengiris baris untuk halaman aktif (1-based).
export function paginate(rows = [], page = 1, perPage = PER_PAGE) {
  const pages = totalPages(rows.length, perPage)
  const p = clampPage(page, pages)
  return { page: p, pages, items: rows.slice((p - 1) * perPage, p * perPage) }
}
