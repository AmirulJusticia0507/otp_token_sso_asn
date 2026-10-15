// HTTP client T-01.2: SELALU ke backend repo ini, tidak pernah ke identity-service.
// Sesi hidup di cookie HttpOnly -> withCredentials wajib (cermin peladen-fe/src/api.js).
import axios from 'axios'

export const MEDIA_TYPE = 'application/vnd.api+json'

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8108',
  withCredentials: true,
  headers: { Accept: MEDIA_TYPE, 'Content-Type': MEDIA_TYPE },
})

// ApiError membawa kode galat backend; nik_required = minta form NIK, bukan gagal login.
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const res = err.response
    const item = res?.data?.errors?.[0]
    return Promise.reject(
      new ApiError(
        res?.status ?? 0,
        item?.code ?? 'unknown',
        item?.detail || item?.title || err.message,
      ),
    )
  },
)
