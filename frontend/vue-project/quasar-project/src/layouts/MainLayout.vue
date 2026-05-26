<template>
  <q-layout view="lHh Lpr lFf" :class="isDark ? 'layout-dark' : 'layout-light'">

    <!-- ══════════════════════════════════════════════
         SIDEBAR
         ══════════════════════════════════════════════ -->
    <q-drawer
      v-model="drawerOpen"
      show-if-above
      :width="sidebarWidth"
      :breakpoint="820"
      :class="isDark ? 'sidebar-dark' : 'sidebar-light'"
      bordered
      no-swipe-close
    >
      <div class="sidebar-inner" :class="{ 'sidebar-collapsed': isCollapsed }">

        <!-- ── Brand ── -->
        <div class="sidebar-brand" :class="{ 'sidebar-brand--collapsed': isCollapsed }">
          <div class="brand-icon">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" :width="isCollapsed ? 22 : 26" :height="isCollapsed ? 22 : 26">
              <path d="M24 6 L6 38 H14 L18 30 H30 L34 38 H42 Z" fill="none" stroke="#ff7b00" stroke-width="3" stroke-linejoin="round"/>
              <path d="M20 24 H28" stroke="#ff7b00" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="24" cy="6" r="2" fill="#ff7b00"/>
            </svg>
          </div>
          <transition name="fade-text">
            <div v-if="!isCollapsed" class="brand-text">
              <span class="brand-name">ARTEZZA</span>
              <span class="brand-sub">Móveis Planejados</span>
            </div>
          </transition>
        </div>

        <!-- ── Divider ── -->
        <div class="sidebar-sep" />

        <!-- ── Perfil resumido ── -->
        <div class="sidebar-profile" :class="{ 'sidebar-profile--collapsed': isCollapsed }">
          <q-avatar
            size="34px"
            class="profile-av"
            :style="{ background: roleColor + '22', border: `1.5px solid ${roleColor}44` }"
          >
            <span style="font-size:13px;font-weight:700;" :style="{ color: roleColor }">
              {{ initials }}
            </span>
          </q-avatar>
          <transition name="fade-text">
            <div v-if="!isCollapsed" class="profile-info">
              <span class="profile-name">{{ authStore.userName }}</span>
              <span class="profile-role" :style="{ color: roleColor }">{{ roleLabel }}</span>
            </div>
          </transition>
          <q-tooltip v-if="isCollapsed" anchor="center right" self="center left" :offset="[12, 0]">
            {{ authStore.userName }} — {{ roleLabel }}
          </q-tooltip>
        </div>

        <!-- ── Divider ── -->
        <div class="sidebar-sep" />

        <!-- ── Navegação ── -->
        <q-scroll-area class="sidebar-scroll">
          <div class="nav-list">

            <template v-for="section in visibleMenu" :key="section.key">

              <!-- Rótulo da seção -->
              <transition name="fade-text">
                <div
                  v-if="!isCollapsed && section.label"
                  class="nav-section-label"
                  :class="isDark ? 'text-grey-6' : 'text-grey-5'"
                >
                  {{ section.label }}
                </div>
              </transition>

              <!-- Items da seção -->
              <router-link
                v-for="item in section.items"
                :key="item.to"
                :to="item.to"
                custom
                v-slot="{ isActive, navigate }"
              >
                <div
                  class="nav-item"
                  :class="[
                    isActive ? 'nav-item--active' : (isDark ? 'nav-item--dark' : 'nav-item--light'),
                    { 'nav-item--collapsed': isCollapsed }
                  ]"
                  @click="navigate"
                >
                  <div class="nav-item__icon">
                    <q-icon :name="item.icon" size="19px" />
                  </div>
                  <transition name="fade-text">
                    <span v-if="!isCollapsed" class="nav-item__label">{{ item.label }}</span>
                  </transition>
                  <transition name="fade-text">
                    <q-badge
                      v-if="!isCollapsed && item.badge"
                      :color="item.badgeColor || 'orange'"
                      :label="item.badge"
                      class="q-ml-auto"
                      dense
                    />
                  </transition>
                  <!-- Tooltip quando colapsado -->
                  <q-tooltip v-if="isCollapsed" anchor="center right" self="center left" :offset="[12, 0]">
                    {{ item.label }}
                  </q-tooltip>
                </div>
              </router-link>

            </template>
          </div>
        </q-scroll-area>

        <!-- ── Footer do sidebar ── -->
        <div class="sidebar-footer">
          <div class="sidebar-sep q-mb-sm" />

          <!-- Botão colapsar/expandir -->
          <div
            class="nav-item nav-item--collapse"
            :class="[isDark ? 'nav-item--dark' : 'nav-item--light', { 'nav-item--collapsed': isCollapsed }]"
            @click="toggleCollapse"
          >
            <div class="nav-item__icon">
              <q-icon :name="isCollapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'" size="19px" />
            </div>
            <transition name="fade-text">
              <span v-if="!isCollapsed" class="nav-item__label">Recolher menu</span>
            </transition>
            <q-tooltip v-if="isCollapsed" anchor="center right" self="center left" :offset="[12, 0]">
              Expandir menu
            </q-tooltip>
          </div>
        </div>

      </div>
    </q-drawer>

    <!-- ══════════════════════════════════════════════
         TOPBAR
         ══════════════════════════════════════════════ -->
    <q-header :class="isDark ? 'topbar-dark' : 'topbar-light'" bordered>
      <q-toolbar class="topbar-toolbar">

        <!-- Botão menu mobile -->
        <q-btn flat round dense icon="menu" :color="isDark ? 'grey-4' : 'grey-7'" @click="drawerOpen = !drawerOpen" class="lt-sm" />

        <!-- Título da página -->
        <div class="topbar-title">
          <q-icon :name="currentPage.icon" size="18px" color="orange" class="q-mr-xs" />
          <span :class="isDark ? 'text-grey-3' : 'text-grey-8'">{{ currentPage.label }}</span>
        </div>

        <q-space />

        <!-- ─── Área direita da topbar ─── -->
        <div class="topbar-right">

          <!-- Timer de sessão -->
          <div class="session-timer" :class="isDark ? 'session-timer--dark' : 'session-timer--light'">
            <q-icon name="schedule" size="14px" :color="sessionWarning ? 'negative' : 'grey-5'" />
            <span :class="sessionWarning ? 'text-negative' : (isDark ? 'text-grey-4' : 'text-grey-6')">
              {{ sessionTime }}
            </span>
            <q-tooltip>Tempo de sessão ativa</q-tooltip>
          </div>

          <!-- Notificações -->
          <q-btn flat round dense :color="isDark ? 'grey-4' : 'grey-7'" class="topbar-btn">
            <q-icon name="notifications_none" size="20px" />
            <q-badge color="negative" floating label="2" />
            <q-tooltip>Notificações</q-tooltip>

            <q-menu anchor="bottom right" self="top right" :offset="[0,8]" :dark="isDark" style="min-width:280px; border-radius:12px">
              <q-list :dark="isDark" class="q-py-sm">
                <div class="q-px-md q-pt-xs q-pb-sm">
                  <span class="text-caption text-weight-bold" :class="isDark ? 'text-grey-4' : 'text-grey-7'">NOTIFICAÇÕES</span>
                </div>
                <q-item clickable v-close-popup v-for="n in notifications" :key="n.id" class="notif-item">
                  <q-item-section avatar>
                    <q-avatar :color="n.color" text-color="white" size="32px" :icon="n.icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label :class="isDark ? 'text-grey-3' : 'text-grey-8'" lines="1">{{ n.title }}</q-item-label>
                    <q-item-label caption>{{ n.time }}</q-item-label>
                  </q-item-section>
                </q-item>
                <div class="q-px-md q-pt-sm">
                  <q-btn flat no-caps full-width label="Ver todas" color="orange" size="sm" />
                </div>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Toggle tema -->
          <q-btn flat round dense class="topbar-btn" :color="isDark ? 'grey-4' : 'grey-7'" @click="toggleTheme">
            <q-icon :name="isDark ? 'light_mode' : 'dark_mode'" size="20px" />
            <q-tooltip>{{ isDark ? 'Modo claro' : 'Modo escuro' }}</q-tooltip>
          </q-btn>

          <!-- Avatar + menu do usuário -->
          <q-btn flat round dense class="topbar-btn q-ml-xs">
            <q-avatar size="32px" :style="{ background: roleColor + '22', border: `1.5px solid ${roleColor}55` }">
              <span style="font-size:12px;font-weight:800;" :style="{ color: roleColor }">{{ initials }}</span>
            </q-avatar>
            <q-tooltip>Minha conta</q-tooltip>

            <q-menu anchor="bottom right" self="top right" :offset="[0,8]" :dark="isDark" style="min-width:220px; border-radius:12px">
              <q-list :dark="isDark" class="q-py-sm">

                <!-- Info do usuário -->
                <div class="q-px-md q-py-sm user-menu-header">
                  <div class="flex items-center gap-sm q-gutter-sm">
                    <q-avatar size="38px" :style="{ background: roleColor + '22', border: `1.5px solid ${roleColor}55` }">
                      <span style="font-weight:800;" :style="{ color: roleColor }">{{ initials }}</span>
                    </q-avatar>
                    <div>
                      <div class="text-body2 text-weight-bold" :class="isDark ? 'text-white' : 'text-grey-9'">
                        {{ authStore.userName }}
                      </div>
                      <div class="text-caption" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
                        {{ authStore.userEmail }}
                      </div>
                      <q-badge :style="{ background: roleColor }" :label="roleLabel" dense class="q-mt-xs" />
                    </div>
                  </div>
                </div>

                <q-separator :dark="isDark" class="q-my-xs" />

                <q-item clickable v-close-popup to="/perfil" class="menu-action-item">
                  <q-item-section avatar>
                    <q-icon name="manage_accounts" color="orange" size="18px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label :class="isDark ? 'text-grey-3' : 'text-grey-8'">Meu Perfil</q-item-label>
                    <q-item-label caption>Editar dados pessoais</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup class="menu-action-item" @click="toggleTheme">
                  <q-item-section avatar>
                    <q-icon :name="isDark ? 'light_mode' : 'dark_mode'" :color="isDark ? 'yellow-5' : 'grey-7'" size="18px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label :class="isDark ? 'text-grey-3' : 'text-grey-8'">
                      {{ isDark ? 'Modo claro' : 'Modo escuro' }}
                    </q-item-label>
                    <q-item-label caption>Alterar aparência</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator :dark="isDark" class="q-my-xs" />

                <q-item clickable v-close-popup class="menu-action-item" @click="handleLogout">
                  <q-item-section avatar>
                    <q-icon name="logout" color="negative" size="18px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-negative">Sair</q-item-label>
                    <q-item-label caption>Encerrar sessão</q-item-label>
                  </q-item-section>
                </q-item>

              </q-list>
            </q-menu>
          </q-btn>

        </div>
      </q-toolbar>
    </q-header>

    <!-- ══════════════════════════════════════════════
         CONTEÚDO
         ══════════════════════════════════════════════ -->
    <q-page-container :class="isDark ? 'page-dark' : 'page-light'">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

const $q        = useQuasar()
const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()

// ── Sidebar ────────────────────────────────────────────────────────
const drawerOpen  = ref(true)
const isCollapsed = ref(false)

const FULL_WIDTH  = 248
const MINI_WIDTH  = 64
const sidebarWidth = computed(() => isCollapsed.value ? MINI_WIDTH : FULL_WIDTH)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('horus_sidebar', isCollapsed.value ? '1' : '0')
}

// ── Tema ───────────────────────────────────────────────────────────
const isDark = computed(() => $q.dark.isActive)

function toggleTheme() {
  $q.dark.toggle()
  localStorage.setItem('horus_dark', $q.dark.isActive ? '1' : '0')
}

// ── Perfil do usuário ──────────────────────────────────────────────
const roleConfig = {
  admin:         { label: 'Administrador', color: '#ff7b00' },
  lojista:       { label: 'Lojista',       color: '#1976d2' },
  representante: { label: 'Representante', color: '#00897b' },
  cliente:       { label: 'Cliente',       color: '#7b1fa2' },
}

const roleLabel = computed(() => roleConfig[authStore.userTipo]?.label || authStore.userTipo || '—')
const roleColor = computed(() => roleConfig[authStore.userTipo]?.color || '#888')

const initials = computed(() =>
  (authStore.userName || '')
    .split(' ').slice(0, 2)
    .map(n => n[0]).join('').toUpperCase()
)

// ── Menus por perfil ───────────────────────────────────────────────
const allMenu = [
  {
    key: 'principal',
    label: 'Principal',
    roles: ['admin', 'lojista', 'representante', 'cliente'],
    items: [
      { label: 'Dashboard',   icon: 'dashboard',     to: '/dashboard', roles: ['admin','lojista','representante','cliente'] },
      { label: 'Pedidos',     icon: 'receipt_long',  to: '/pedidos',   roles: ['admin','lojista','representante'] },
      { label: 'Meus Pedidos',icon: 'receipt_long',  to: '/pedidos',   roles: ['cliente'] },
      { label: 'Clientes',    icon: 'people_alt',    to: '/clientes',  roles: ['admin','lojista','representante'] },
    ],
  },
  {
    key: 'admin',
    label: 'Administração',
    roles: ['admin'],
    items: [
      { label: 'Lojistas',        icon: 'storefront',          to: '/lojistas',      roles: ['admin'] },
      { label: 'Representantes',  icon: 'badge',               to: '/representantes',roles: ['admin'] },
      { label: 'Administradores', icon: 'admin_panel_settings',to: '/admins',        roles: ['admin'] },
      { label: 'Status de Pedido',icon: 'label',               to: '/status-pedido', roles: ['admin'] },
    ],
  },
]

const visibleMenu = computed(() => {
  const tipo = authStore.userTipo
  return allMenu
    .map(section => ({
      ...section,
      items: section.items.filter(i => i.roles.includes(tipo)),
    }))
    .filter(s => s.items.length > 0)
})

// ── Título da página atual ─────────────────────────────────────────
const allItems = allMenu.flatMap(s => s.items)

const currentPage = computed(() => {
  const match = allItems.find(i => route.path.startsWith(i.to) && i.to !== '/')
  if (match) return match
  if (route.path === '/perfil') return { label: 'Meu Perfil', icon: 'manage_accounts' }
  return { label: 'Horus', icon: 'home' }
})

// ── Notificações (mock) ────────────────────────────────────────────
const notifications = [
  { id: 1, title: 'Novo pedido recebido',    time: 'há 5 min',  icon: 'receipt_long',  color: 'orange' },
  { id: 2, title: 'Cliente cadastrado',       time: 'há 22 min', icon: 'person_add',    color: 'teal'   },
]

// ── Timer de sessão ────────────────────────────────────────────────
const sessionTime    = ref('00:00:00')
const sessionWarning = ref(false)
let timerInterval    = null

function startSessionTimer() {
  const loginTs = parseInt(localStorage.getItem('horus_login_ts') || '0')
  if (!loginTs) {
    localStorage.setItem('horus_login_ts', Date.now().toString())
  }

  timerInterval = setInterval(() => {
    const start   = parseInt(localStorage.getItem('horus_login_ts') || Date.now().toString())
    const elapsed = Math.floor((Date.now() - start) / 1000)

    const h = String(Math.floor(elapsed / 3600)).padStart(2, '0')
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
    const s = String(elapsed % 60).padStart(2, '0')

    sessionTime.value    = `${h}:${m}:${s}`
    sessionWarning.value = elapsed > 3600 * 8 // aviso após 8h
  }, 1000)
}

// ── Logout ─────────────────────────────────────────────────────────
function handleLogout() {
  $q.dialog({
    title: 'Encerrar sessão',
    message: 'Deseja realmente sair do sistema?',
    dark: isDark.value,
    cancel: { label: 'Cancelar', flat: true },
    ok:     { label: 'Sair',     color: 'negative', unelevated: true },
  }).onOk(() => {
    clearInterval(timerInterval)
    localStorage.removeItem('horus_login_ts')
    authStore.logout()
    router.push('/login')
  })
}

// ── Lifecycle ──────────────────────────────────────────────────────
onMounted(() => {
  // Restaurar estado do sidebar
  const saved = localStorage.getItem('horus_sidebar')
  if (saved === '1') isCollapsed.value = true

  // Iniciar timer
  startSessionTimer()
})

onUnmounted(() => {
  clearInterval(timerInterval)
})
</script>

<style scoped>
/* ══════════════════════════════════════════════
   LAYOUT BASE
   ══════════════════════════════════════════════ */
.layout-dark  { background: #0d1117 !important; }
.layout-light { background: #f0f2f5 !important; }

.page-dark  { background: #0d1117; }
.page-light { background: #f0f2f5; }

/* ══════════════════════════════════════════════
   SIDEBAR
   ══════════════════════════════════════════════ */
.sidebar-dark  { background: #161b22 !important; border-right: 1px solid rgba(255,255,255,.06) !important; }
.sidebar-light { background: #ffffff !important; border-right: 1px solid #e5e7eb !important; }

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition: all .22s ease;
}

/* ── Brand ── */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px 18px;
  flex-shrink: 0;
  transition: all .22s ease;
}
.sidebar-brand--collapsed {
  justify-content: center;
  padding: 20px 0 18px;
}

.brand-icon {
  width: 40px; height: 40px;
  border-radius: 11px;
  background: rgba(255,123,0,.15);
  border: 1px solid rgba(255,123,0,.3);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.brand-text { display: flex; flex-direction: column; gap: 1px; overflow: hidden; }
.brand-name { font-size: 16px; font-weight: 900; letter-spacing: 4px; color: #ff7b00; line-height: 1; white-space: nowrap; }
.brand-sub  { font-size: 9.5px; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(255,255,255,.35); white-space: nowrap; }

/* ── Separador ── */
.sidebar-sep {
  height: 1px;
  background: rgba(255,255,255,.06);
  margin: 0 12px;
  flex-shrink: 0;
}
.sidebar-light .sidebar-sep { background: #e5e7eb; }

/* ── Perfil ── */
.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  flex-shrink: 0;
  transition: all .22s ease;
}
.sidebar-profile--collapsed {
  justify-content: center;
  padding: 14px 0;
}
.profile-av { flex-shrink: 0; }
.profile-info { overflow: hidden; display: flex; flex-direction: column; gap: 1px; }
.profile-name { font-size: 13px; font-weight: 600; color: #e6edf3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.profile-role { font-size: 11px; font-weight: 600; white-space: nowrap; }

/* ── Scroll area ── */
.sidebar-scroll {
  flex: 1;
  min-height: 0;
}

/* ── Navegação ── */
.nav-list { padding: 8px; display: flex; flex-direction: column; gap: 1px; }

.nav-section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 12px 8px 4px;
  white-space: nowrap;
  overflow: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 9px;
  cursor: pointer;
  transition: all .15s ease;
  user-select: none;
  overflow: hidden;
  position: relative;
}
.nav-item--collapsed {
  justify-content: center;
  padding: 10px 0;
}

/* ── States ── */
.nav-item--dark  { color: rgba(255,255,255,.55); }
.nav-item--light { color: #555; }

.nav-item--dark:hover  { background: rgba(255,255,255,.06); color: rgba(255,255,255,.9); }
.nav-item--light:hover { background: rgba(0,0,0,.05); color: #111; }

.nav-item--active {
  background: rgba(255,123,0,.15) !important;
  color: #ff7b00 !important;
  font-weight: 600;
}
.nav-item--active::before {
  content: '';
  position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 3px;
  background: #ff7b00;
  border-radius: 0 3px 3px 0;
}
.nav-item--collapsed.nav-item--active::before { display: none; }

/* ── Ícone e label ── */
.nav-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  flex-shrink: 0;
}
.nav-item__label {
  font-size: 13.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* ── Footer sidebar ── */
.sidebar-footer { flex-shrink: 0; padding: 0 8px 12px; }
.nav-item--collapse { color: rgba(255,255,255,.3) !important; }
.nav-item--collapse:hover { color: rgba(255,255,255,.7) !important; background: rgba(255,255,255,.04) !important; }

/* ══════════════════════════════════════════════
   TOPBAR
   ══════════════════════════════════════════════ */
.topbar-dark  {
  background: #161b22 !important;
  border-bottom: 1px solid rgba(255,255,255,.06) !important;
  box-shadow: none !important;
}
.topbar-light {
  background: #ffffff !important;
  border-bottom: 1px solid #e5e7eb !important;
  box-shadow: 0 1px 3px rgba(0,0,0,.06) !important;
}

.topbar-toolbar { padding: 0 16px; min-height: 54px; }

.topbar-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: .2px;
  margin-left: 4px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 2px;
}
.topbar-btn { transition: background .15s; }

/* ── Session timer ── */
.session-timer {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  margin-right: 4px;
}
.session-timer--dark  { background: rgba(255,255,255,.05); }
.session-timer--light { background: rgba(0,0,0,.05); }
.session-timer span   { font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: .5px; }

/* ── Notificações ── */
.notif-item { transition: background .15s; }
.user-menu-header { padding-top: 12px; padding-bottom: 10px; }
.menu-action-item { transition: background .15s; min-height: 46px; }

/* ══════════════════════════════════════════════
   TRANSIÇÃO DE PÁGINA
   ══════════════════════════════════════════════ */
.page-fade-enter-active,
.page-fade-leave-active { transition: opacity .16s ease, transform .16s ease; }
.page-fade-enter-from   { opacity: 0; transform: translateY(5px); }
.page-fade-leave-to     { opacity: 0; transform: translateY(-5px); }

/* ══════════════════════════════════════════════
   TRANSIÇÃO DE TEXTO DO SIDEBAR
   ══════════════════════════════════════════════ */
.fade-text-enter-active,
.fade-text-leave-active { transition: opacity .15s ease; }
.fade-text-enter-from,
.fade-text-leave-to     { opacity: 0; }
</style>
