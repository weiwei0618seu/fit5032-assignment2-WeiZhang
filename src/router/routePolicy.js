export const resolveRouteAccess = (to, auth) => {
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'account' }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  const allowedRoles = to.meta.roles

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(auth.currentUser?.role)
  ) {
    return { name: 'forbidden' }
  }

  return true
}

export const getSafeRedirectTarget = (target, fallback = '/account') =>
  typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
    ? target
    : fallback
