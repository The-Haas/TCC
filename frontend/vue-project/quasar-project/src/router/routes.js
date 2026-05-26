const routes = [
  // ── Rota pública: Login ────────────────────────────────────────────
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    meta: { guest: true }, // só acessível sem login
  },

  // ── Rotas protegidas: Sistema ──────────────────────────────────────
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      {
        path: 'dashboard',
        component: () => import('pages/IndexPage.vue'), // será o Dashboard futuramente
      },
    ],
  },

  // ── 404 ───────────────────────────────────────────────────────────
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
