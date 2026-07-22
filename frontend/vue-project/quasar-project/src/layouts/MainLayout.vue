<template>
  <q-layout view="lHh Lpr lFf" :class="isDark ? 'layout-dark' : 'layout-light'">

    <!-- ══════════════════════════════════════════════
         SIDEBAR
         ══════════════════════════════════════════════ -->
    <q-drawer v-model="drawerOpen" show-if-above :width="sidebarWidth" :breakpoint="820"
      :class="isDark ? 'sidebar-dark' : 'sidebar-light'" bordered no-swipe-close>
      <div class="sidebar-inner">

        <!-- ── Brand + Hambúrguer (TOPO) ── -->
        <div class="sidebar-brand" :class="{ 'sidebar-brand--collapsed': isCollapsed }">

          <template v-if="!isCollapsed">
            <div class="brand-icon">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path d="M24 6 L6 38 H14 L18 30 H30 L34 38 H42 Z" fill="none" stroke="#ff7b00" stroke-width="3"
                  stroke-linejoin="round" />
                <path d="M20 24 H28" stroke="#ff7b00" stroke-width="2.5" stroke-linecap="round" />
                <circle cx="24" cy="6" r="2" fill="#ff7b00" />
              </svg>
            </div>
            <div class="brand-text">
              <span class="brand-name">ARTEZZA</span>
              <span class="brand-sub">Móveis Planejados</span>
            </div>
            <button class="hamburger-btn" @click="toggleCollapse" title="Recolher menu">
              <span class="hb-line" />
              <span class="hb-line" />
              <span class="hb-line" />
            </button>
          </template>

          <template v-else>
            <button class="hamburger-btn hamburger-btn--solo" @click="toggleCollapse" title="Expandir menu">
              <span class="hb-line" />
              <span class="hb-line hb-line--mid" />
              <span class="hb-line" />
            </button>
            <q-tooltip anchor="center right" self="center left" :offset="[12, 0]">Expandir menu</q-tooltip>
          </template>

        </div>

        <!-- ── Separador ── -->
        <div class="sidebar-sep" />

        <!-- ── Perfil resumido ── -->
        <div class="sidebar-profile" :class="{ 'sidebar-profile--collapsed': isCollapsed }">
          <!-- Avatar com iniciais — div customizada para centralização perfeita -->
          <div class="profile-av" :style="{
            background: roleColor + '22',
            border: `1.5px solid ${roleColor}44`,
          }">
            <span :style="{ color: roleColor }">{{ initials }}</span>
          </div>

          <transition name="fade-text">
            <div v-if="!isCollapsed" class="profile-info">
              <span class="profile-name text-weight-bold" :class="isDark ? 'text-white' : 'text-grey-9'">
                {{ authStore.userName }}
              </span>
              <span class="profile-role text-caption" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
                {{ roleLabel }}
              </span>
            </div>
          </transition>

          <q-tooltip v-if="isCollapsed" anchor="center right" self="center left" :offset="[12, 0]">
            {{ authStore.userName }} — {{ roleLabel }}
          </q-tooltip>
        </div>

        <!-- ── Separador ── -->
        <div class="sidebar-sep" />

        <!-- ── Navegação ── -->
        <q-scroll-area class="sidebar-scroll">
          <div class="nav-list">

            <template v-for="section in visibleMenu" :key="section.key">

              <transition name="fade-text">
                <div v-if="!isCollapsed && section.label" class="nav-section-label"
                  :class="isDark ? 'text-grey-6' : 'text-grey-5'">
                  {{ section.label }}
                </div>
              </transition>

              <router-link v-for="item in section.items" :key="item.to" :to="item.to" custom
                v-slot="{ isActive, navigate }">
                <div class="nav-item" :class="[
                  isActive ? 'nav-item--active' : (isDark ? 'nav-item--dark' : 'nav-item--light'),
                  { 'nav-item--collapsed': isCollapsed },
                ]" @click="navigate">
                  <div class="nav-item__icon">
                    <q-icon :name="item.icon" size="19px" />
                  </div>
                  <transition name="fade-text">
                    <span v-if="!isCollapsed" class="nav-item__label">{{ item.label }}</span>
                  </transition>
                  <q-tooltip v-if="isCollapsed" anchor="center right" self="center left" :offset="[12, 0]">
                    {{ item.label }}
                  </q-tooltip>
                </div>
              </router-link>

            </template>
          </div>
        </q-scroll-area>

      </div>
    </q-drawer>

    <!-- ══════════════════════════════════════════════
         TOPBAR
         ══════════════════════════════════════════════ -->
    <q-header :class="isDark ? 'topbar-dark' : 'topbar-light'" bordered>
      <q-toolbar class="topbar-toolbar">

        <!-- Menu mobile -->
        <q-btn flat round dense icon="menu" :color="isDark ? 'grey-4' : 'grey-7'" @click="toggleMobileDrawer"
          class="lt-sm q-mr-xs" />

        <!-- Título da página -->
        <div class="topbar-title">
          <q-icon :name="currentPage.icon" size="17px" color="orange" class="q-mr-xs" />
          <span :class="isDark ? 'text-grey-3' : 'text-grey-8'">{{ currentPage.label }}</span>
        </div>

        <q-space />

        <div class="topbar-right">

          <!-- Timer de sessão (regressivo) -->
          <div class="session-timer" :class="[
            isDark ? 'session-timer--dark' : 'session-timer--light',
            sessionUrgent ? 'session-timer--urgent' : '',
          ]">
            <q-icon :name="sessionUrgent ? 'timer_off' : 'timer'" size="14px"
              :color="sessionUrgent ? 'negative' : (sessionWarning ? 'warning' : 'grey-5')" />
            <span
              :class="sessionUrgent ? 'text-negative' : (sessionWarning ? 'text-warning' : (isDark ? 'text-grey-4' : 'text-grey-7'))">
              {{ sessionTimeLeft }}
            </span>
            <q-tooltip>
              {{ sessionUrgent ? 'Sessão expirando!' : sessionWarning ? 'Sessão expirando em breve' : 'Tempo restante de sessão' }}
            </q-tooltip>
          </div>

          <!-- Toggle tema -->
          <q-btn flat round dense class="topbar-btn" :color="isDark ? 'grey-4' : 'grey-6'" @click="toggleTheme">
            <q-icon :name="isDark ? 'light_mode' : 'dark_mode'" size="20px" />
            <q-tooltip>{{ isDark ? 'Modo claro' : 'Modo escuro' }}</q-tooltip>
          </q-btn>

          <!-- Avatar + menu -->
          <q-btn flat round dense class="topbar-btn q-ml-xs">
            <!-- Avatar com iniciais centralizadas -->
            <div class="topbar-av" :style="{
              background: roleColor + '22',
              border: `1.5px solid ${roleColor}55`,
            }">
              <span :style="{ color: roleColor }">{{ initials }}</span>
            </div>
            <q-tooltip>Minha conta</q-tooltip>

            <q-menu anchor="bottom right" self="top right" :offset="[0, 8]" :dark="isDark"
              style="min-width:224px;border-radius:12px;overflow:hidden">
              <q-list :dark="isDark" class="q-py-sm">

                <!-- Cabeçalho do menu -->
                <div class="user-menu-head q-px-md q-pb-sm q-pt-md">
                  <div class="user-menu-av-wrap">
                    <div class="user-menu-av"
                      :style="{ background: roleColor + '22', border: `1.5px solid ${roleColor}55` }">
                      <span :style="{ color: roleColor }">{{ initials }}</span>
                    </div>
                    <div class="user-menu-info">
                      <div class="text-weight-bold" :class="isDark ? 'text-white' : 'text-grey-9'"
                        style="font-size:13.5px;line-height:1.2">
                        {{ authStore.userName }}
                      </div>
                      <div class="text-caption q-mb-xs" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
                        {{ authStore.userEmail }}
                      </div>
                      <q-badge outline :color="isDark ? 'grey-5' : 'grey-7'" class="q-px-sm q-py-xs"
                        style="font-size: 11px; display: block !important; text-align: center !important; width: 100% !important;">
                        {{ roleLabel }}
                      </q-badge>
                    </div>
                  </div>
                </div>

                <q-separator :dark="isDark" class="q-my-xs" />

                <q-item clickable v-close-popup to="/perfil" class="menu-item">
                  <q-item-section avatar style="min-width:32px">
                    <q-icon name="manage_accounts" color="orange" size="18px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label :class="isDark ? 'text-grey-2' : 'text-grey-8'" style="font-size:13.5px">Meu
                      Perfil</q-item-label>
                    <q-item-label caption>Editar dados pessoais</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator :dark="isDark" class="q-my-xs" />

                <q-item clickable v-close-popup class="menu-item" @click="handleLogout">
                  <q-item-section avatar style="min-width:32px">
                    <q-icon name="logout" color="negative" size="18px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-negative" style="font-size:13.5px">Sair</q-item-label>
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
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// ── Sidebar ────────────────────────────────────────────────────────
const drawerOpen = ref(false)
const isCollapsed = ref(false)

const FULL_WIDTH = 252
const MINI_WIDTH = 64
const sidebarWidth = computed(() => isCollapsed.value ? MINI_WIDTH : FULL_WIDTH)

function toggleCollapse() {
  if ($q.screen.lt.sm) {
    // No mobile, o botão fecha o drawer direto
    drawerOpen.value = false
  } else {
    isCollapsed.value = !isCollapsed.value
    localStorage.setItem('horus_sidebar', isCollapsed.value ? '1' : '0')
  }
}

// ── Tema ───────────────────────────────────────────────────────────
const isDark = computed(() => $q.dark.isActive)

function toggleTheme() {
  $q.dark.toggle()
  localStorage.setItem('horus_dark', $q.dark.isActive ? '1' : '0')
}

// ── Perfil ─────────────────────────────────────────────────────────
const roleConfig = {
  admin: { label: 'Administrador', color: '#ff7b00' },
  lojista: { label: 'Lojista', color: '#3b82f6' },
  representante: { label: 'Representante', color: '#10b981' },
  cliente: { label: 'Cliente', color: '#ff7b00' },
}

const roleLabel = computed(() => roleConfig[authStore.userTipo]?.label || authStore.userTipo || '—')
const roleColor = computed(() => roleConfig[authStore.userTipo]?.color || '#888')

const initials = computed(() =>
  (authStore.userName || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() || '')
    .join('')
)

// ── Menu por perfil ────────────────────────────────────────────────
const allMenu = [
  {
    key: 'principal',
    label: 'Principal',
    items: [
      { label: 'Dashboard', icon: 'dashboard', to: '/dashboard', roles: ['admin', 'lojista', 'representante', 'cliente'] },

      // Pedidos gerais (Admin e Lojista)
      { label: 'Projetos', icon: 'receipt_long', to: '/pedidos', roles: ['admin', 'lojista', 'representante'] },

      // Tela de Projetos/Pedidos específica do Representante (A que fizemos com upload de XML)

      // Pedidos do Cliente Final
      { label: 'Meus Projetos', icon: 'local_mall', to: '/pedidos', roles: ['cliente'] },
    ],
  },
  {
    key: 'admin',
    label: 'Administração',
    items: [
      { label: 'Clientes', icon: 'people_alt', to: '/clientes', roles: ['admin', 'lojista'] },
      { label: 'Lojistas', icon: 'storefront', to: '/lojistas', roles: ['admin', 'representante'] },
      { label: 'Representantes', icon: 'badge', to: '/representantes', roles: ['admin'] },
      { label: 'Administradores', icon: 'admin_panel_settings', to: '/admins', roles: ['admin'] },
      { label: 'Status de Pedido', icon: 'label', to: '/status', roles: ['admin'] },
    ],
  },
]

const visibleMenu = computed(() => {
  const tipo = authStore.userTipo
  return allMenu
    .map(s => ({ ...s, items: s.items.filter(i => i.roles.includes(tipo)) }))
    .filter(s => s.items.length > 0)
})

// ── Título da página atual ─────────────────────────────────────────
const allItems = allMenu.flatMap(s => s.items)

const currentPage = computed(() => {
  const match = allItems.find(i => route.path.startsWith(i.to) && i.to !== '/')
  if (match) return match
  if (route.path === '/perfil') return { label: 'Meu Perfil', icon: 'manage_accounts' }
  return { label: 'Artezza', icon: 'home' }
})

// ── Timer de sessão REGRESSIVO ─────────────────────────────────────
const SESSION_DURATION = 1 * 60 * 60 // 1 hora em segundos

const sessionTimeLeft = ref('08:00:00')
const sessionWarning = ref(false) // < 30 min
const sessionUrgent = ref(false) // < 5 min
let timerInterval = null

function tickSession() {
  const loginTs = parseInt(localStorage.getItem('horus_login_ts') || '0')
  if (!loginTs) return

  const elapsed = Math.floor((Date.now() - loginTs) / 1000)
  const remaining = SESSION_DURATION - elapsed

  if (remaining <= 0) {
    // Sessão expirou — desloga automaticamente
    clearInterval(timerInterval)
    $q.notify({ type: 'negative', message: 'Sua sessão expirou. Faça login novamente.' })
    authStore.logout()
    router.push('/login')
    return
  }

  const h = String(Math.floor(remaining / 3600)).padStart(2, '0')
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0')
  const s = String(remaining % 60).padStart(2, '0')

  sessionTimeLeft.value = `${h}:${m}:${s}`
  sessionWarning.value = remaining < 30 * 60  // últimos 30 min → amarelo
  sessionUrgent.value = remaining < 5 * 60  // últimos 5 min  → vermelho
}

function toggleMobileDrawer() {
  if (!drawerOpen.value) {
    isCollapsed.value = false // sempre abre expandido no mobile
  }
  drawerOpen.value = !drawerOpen.value
}

// ── Logout ─────────────────────────────────────────────────────────
function handleLogout() {
  $q.dialog({
    title: 'Encerrar sessão',
    message: 'Deseja realmente sair do sistema e encerrar suas atividades?',

    // Classes de cor dinâmicas (Claro / Escuro)
    class: isDark.value ? 'bg-dark text-white' : 'bg-white text-grey-9',

    // O pulo do gato: Borda superior fina vermelha, arredondamento médio e sombra suave
    style: 'border-radius: 16px; border-top: 4px solid var(--q-negative); box-shadow: 0 10px 30px rgba(0,0,0,0.1);',

    cancel: {
      label: 'Cancelar',
      color: 'grey-6',
      flat: true,
      noCaps: true,
      class: 'text-weight-medium q-px-md' // Deixa o texto com peso médio
    },
    ok: {
      label: 'Sair do sistema',
      color: 'negative',
      unelevated: true,
      noCaps: true,
      icon: 'logout', // Ícone no botão, porém mais sutil e à esquerda
      class: 'text-weight-bold q-px-md' // Negrito no botão de ação principal
    },
    persistent: true // Evita fechar o modal se o usuário clicar fora por acidente

  }).onOk(() => {
    clearInterval(timerInterval)
    localStorage.removeItem('horus_login_ts')
    authStore.logout()
    router.push('/login')
  })
}

onMounted(() => {
  const savedSidebar = localStorage.getItem('horus_sidebar')
  if (savedSidebar === '1') isCollapsed.value = true

  // Dark mode como padrão
  const savedTheme = localStorage.getItem('horus_dark')
  if (savedTheme === null) {
    $q.dark.set(true)
  } else {
    $q.dark.set(savedTheme === '1')
  }

  tickSession()
  timerInterval = setInterval(tickSession, 1000)
})

onUnmounted(() => clearInterval(timerInterval))
</script>

<style scoped>
/* ══════════════════════════════════════════════
   LAYOUT BASE
   ══════════════════════════════════════════════ */
.layout-dark {
  background: #0d1117 !important;
}

.layout-light {
  background: #dde1e8 !important;
}

.page-dark {
  background: #0d1117;
}

.page-light {
  background: #f6f6f6;
}

/* ══════════════════════════════════════════════
   SIDEBAR
   ══════════════════════════════════════════════ */
.sidebar-dark {
  background: #161b22 !important;
  border-right: 1px solid rgba(255, 255, 255, .06) !important;
}

.sidebar-light {
  background: #c8cdd6 !important;
  border-right: 1px solid rgba(0, 0, 0, .1) !important;
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ── Brand + Hambúrguer ── */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 14px;
  flex-shrink: 0;
}

.sidebar-brand--collapsed {
  justify-content: center;
  padding: 16px 0;
}

.brand-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 123, 0, .15);
  border: 1px solid rgba(255, 123, 0, .3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
  min-width: 0;
}

.brand-name {
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 4px;
  color: #ff7b00;
  line-height: 1;
  white-space: nowrap;
}

.brand-sub {
  font-size: 9px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, .3);
  white-space: nowrap;
}

/* Tema claro */
.sidebar-light .brand-sub {
  color: rgba(0, 0, 0, .55);
}

/* ── Hambúrguer ── */
.hamburger-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: background .15s;
}

.hamburger-btn:hover {
  background: rgba(255, 255, 255, .08);
}

.hamburger-btn--solo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.hb-line {
  display: block;
  width: 18px;
  height: 2px;
  background: rgba(255, 255, 255, .55);
  border-radius: 2px;
  transition: all .2s ease;
  flex-shrink: 0;
}

.hb-line--mid {
  width: 13px;
  /* linha do meio mais curta → remete a "recolhido" */
}

.hamburger-btn:hover .hb-line {
  background: rgba(255, 255, 255, .9);
}

/* Light mode: linhas escuras */
.sidebar-light .hb-line {
  background: rgba(0, 0, 0, .45);
}

.sidebar-light .hamburger-btn:hover .hb-line {
  background: rgba(0, 0, 0, .8);
}

/* ── Separador ── */
.sidebar-sep {
  height: 1px;
  background: rgba(255, 255, 255, .06);
  margin: 0 12px;
  flex-shrink: 0;
}

.sidebar-light .sidebar-sep {
  background: rgba(0, 0, 0, .1);
}

/* ── Perfil ── */
.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  flex-shrink: 0;
}

.sidebar-profile--collapsed {
  justify-content: center;
  padding: 12px 0;
}

/* Avatar perfil — div customizada para centralização perfeita */
.profile-av {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-av span {
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: .5px;
}

.profile-info {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-role {
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

/* ── Navegação ── */
.sidebar-scroll {
  flex: 1;
  min-height: 0;
}

.nav-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

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

.nav-item--dark {
  color: rgba(255, 255, 255, .5);
}

.nav-item--light {
  color: #2c333d;
}

.nav-item--dark:hover {
  background: rgba(255, 255, 255, .07);
  color: rgba(255, 255, 255, .9);
}

.nav-item--light:hover {
  background: rgba(0, 0, 0, .08);
  color: #111;
}

.nav-item--active {
  background: rgba(255, 123, 0, .15) !important;
  color: #ff7b00 !important;
  font-weight: 600;
}

.nav-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  background: #ff7b00;
  border-radius: 0 3px 3px 0;
}

.nav-item--collapsed.nav-item--active::before {
  display: none;
}

.nav-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  flex-shrink: 0;
}

.nav-item__label {
  font-size: 13.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* ══════════════════════════════════════════════
   TOPBAR
   ══════════════════════════════════════════════ */
.topbar-dark {
  background: #161b22 !important;
  border-bottom: 1px solid rgba(255, 255, 255, .06) !important;
  box-shadow: none !important;
}

.topbar-light {
  background: #fcfdfe !important;
  border-bottom: 1px solid rgba(0, 0, 0, .06) !important;
  box-shadow: 0 1px 6px rgba(0, 0, 0, .05) !important;
}

.topbar-toolbar {
  padding: 0 16px;
  min-height: 54px;
}

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

.topbar-btn {
  transition: background .15s;
}

/* ── Timer de sessão ── */
.session-timer {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 8px;
  margin-right: 6px;
  transition: background .3s;
}

.session-timer--dark {
  background: rgba(255, 255, 255, .06);
}

.session-timer--light {
  background: rgba(0, 0, 0, .1);
}

.session-timer--urgent {
  animation: pulse-urgent 1s infinite;
}

@keyframes pulse-urgent {

  0%,
  100% {
    background: rgba(229, 57, 53, .15);
  }

  50% {
    background: rgba(229, 57, 53, .3);
  }
}

.session-timer span {
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: .5px;
}

/* ── Avatar topbar ── */
.topbar-av {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topbar-av span {
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: .5px;
}

/* ── Menu do usuário ── */
.user-menu-head {
  border-bottom: none;
}

.user-menu-av-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-menu-av {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-menu-av span {
  font-size: 15px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: .5px;
}

.user-menu-info {
  display: flex;
  flex-direction: column;
}

.role-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
  text-align: center;
}

.menu-item {
  transition: background .12s;
  min-height: 44px;
}

/* ══════════════════════════════════════════════
   TRANSIÇÕES
   ══════════════════════════════════════════════ */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity .16s ease, transform .16s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(5px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.fade-text-enter-active,
.fade-text-leave-active {
  transition: opacity .15s ease;
}

.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
}
</style>
