import { defineRouter } from '#q-app/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'

export default defineRouter(function () {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHistory(),
  })

  // ── Navigation Guard ──────────────────────────────────────────────
  Router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('horus_token')
    const isAuthenticated = !!token

    // Rota exige login e o usuário NÃO está logado → vai para /login
    if (to.meta.requiresAuth && !isAuthenticated) {
      return next('/login')
    }

    // Rota é guest (ex: /login) e o usuário JÁ está logado → vai para /dashboard
    if (to.meta.guest && isAuthenticated) {
      return next('/dashboard')
    }

    next()
  })

  return Router
})
