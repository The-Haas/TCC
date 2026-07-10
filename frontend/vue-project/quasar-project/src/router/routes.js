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
        component: () => import('pages/DashboardPage.vue'), // será o Dashboard futuramente
      },
      // 👇 AQUI ENTRA A SUA NOVA ROTA 👇
      {
        path: 'pedidos',
        component: () => import('pages/PedidosPage.vue'), // Agora aponta para a Casca!
      },
      { 
        path: 'perfil', 
        component: () => import('pages/Perfil.vue'),
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