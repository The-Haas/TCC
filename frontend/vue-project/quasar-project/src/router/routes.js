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
      {
        path: 'pedidos',
        component: () => import('pages/PedidosPage.vue'), // Aponta para a Casca de Pedidos
      },
      {
        path: 'perfil',
        component: () => import('pages/Perfil.vue'),
      },
      {
        path: 'clientes',
        component: () => import('pages/ClientesPage.vue'),
      },
      {
        path: 'lojistas',
        component: () => import('pages/LojistasPage.vue'),
      },
      {
        path: 'representantes',
        component: () => import('pages/RepresentantesPage.vue'),
      },
      {
        path: 'admins',
        component: () => import('pages/AdminsPage.vue'),
      },
      {
        path: 'status',
        component: () => import('pages/StatusPage.vue'),
      },
      {
        path: 'configuracoes',
        component: () => import('pages/ConfiguracoesPage.vue'),
      }

    ],
  },

  // ── 404 ───────────────────────────────────────────────────────────
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes