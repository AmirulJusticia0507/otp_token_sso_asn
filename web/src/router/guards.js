// Guard T-02.2: hanya merapikan tampilan; backend tetap menolak yang tak berhak.
// meta rute: { requiresAuth?: boolean, roles?: Array<'Admin'|'Operator'> }

// Murni & teruji: memutuskan tanpa router/store asli.
export function canAccess(meta = {}, auth = {}) {
  if (meta.requiresAuth && !auth.isAuthenticated) return { redirect: 'login' }
  if (meta.roles?.length && !meta.roles.includes(auth.role)) return { redirect: 'home' }
  if (meta.guestOnly && auth.isAuthenticated) return { redirect: 'home' }
  return { ok: true }
}

// Dipasang sekali di router. useAuth dilewat sebagai argumen agar mudah diuji.
export function installGuard(router, useAuth) {
  router.beforeEach((to) => {
    const auth = useAuth()
    // Sesi cookie mungkin masih hidup sehabis reload: coba pulihkan sekali.
    if (auth.status === 'loading') return true
    const res = canAccess(to.meta ?? {}, auth)
    if (res.ok) return true
    if (res.redirect === 'login') return { name: 'login', query: { redirect: to.fullPath } }
    return { name: 'home' }
  })
}
