<template>
  <q-layout view="lHh Lpr lFf" :class="isDark ? 'layout-dark' : 'layout-light'">

    <!-- ══════════════════════════════════════════════
         SIDEBAR
         ══════════════════════════════════════════════ -->
    <!-- 1. No painel lateral, altere o breakpoint para 599 -->
    <q-drawer v-model="drawerOpen" show-if-above :mini="isCollapsed" :width="252" :mini-width="64" :breakpoint="599"
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
        <div
          class="sidebar-profile"
          :class="{ 'sidebar-profile--collapsed': isCollapsed }"
          role="button"
          tabindex="0"
          aria-label="Abrir meu perfil"
          @click="goToProfile"
          @keydown.enter.prevent="goToProfile"
          @keydown.space.prevent="goToProfile"
        >
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

          <transition name="fade-text">
            <div v-if="!isCollapsed" class="profile-action">
              <q-icon name="edit" size="15px" />
            </div>
          </transition>

          <q-tooltip v-if="isCollapsed" anchor="center right" self="center left" :offset="[12, 0]">
            Meu perfil · {{ authStore.userName }}
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
        <!-- 2. No menu do topo, volte a usar a classe lt-sm -->
        <q-btn class="lt-sm q-mr-xs" flat round dense icon="menu" :color="isDark ? 'grey-4' : 'grey-7'"
          @click="toggleMobileDrawer" />

        <!-- Contexto da página atual -->
        <div class="topbar-context">
          <div class="topbar-context__icon">
            <q-icon :name="currentPage.icon" size="17px" />
          </div>

          <div class="topbar-context__copy gt-xs">
            <span class="topbar-context__root">Artezza</span>
            <q-icon name="chevron_right" size="14px" class="topbar-context__chevron" />
            <span class="topbar-context__page">{{ currentPage.label }}</span>
          </div>

          <span class="topbar-context__page xs">{{ currentPage.label }}</span>
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

          <!-- Conta do usuário -->
          <q-btn
            flat
            no-caps
            class="account-trigger q-ml-xs"
            :class="isDark ? 'account-trigger--dark' : 'account-trigger--light'"
            aria-label="Abrir menu da minha conta"
          >
            <div class="topbar-av" :style="{
              background: roleColor + '22',
              border: `1.5px solid ${roleColor}55`,
            }">
              <span :style="{ color: roleColor }">{{ initials }}</span>
            </div>

            <div class="account-trigger__meta gt-xs">
              <span class="account-trigger__name">{{ firstName }}</span>
              <span class="account-trigger__role">{{ roleLabel }}</span>
            </div>

            <q-icon name="keyboard_arrow_down" size="18px" class="account-trigger__chevron gt-xs" />
            <q-tooltip class="xs">Minha conta</q-tooltip>

            <q-menu
              anchor="bottom right"
              self="top right"
              :offset="[0, 10]"
              :dark="isDark"
              transition-show="jump-down"
              transition-hide="jump-up"
              style="min-width: 318px; border-radius: 16px; overflow: hidden;"
            >
              <div class="account-menu" :class="isDark ? 'account-menu--dark' : 'account-menu--light'">
                <div class="account-menu__hero">
                  <div class="user-menu-av"
                    :style="{ background: roleColor + '22', border: `1.5px solid ${roleColor}55` }">
                    <span :style="{ color: roleColor }">{{ initials }}</span>
                  </div>

                  <div class="account-menu__identity">
                    <div class="account-menu__name">{{ authStore.userName }}</div>
                    <div class="account-menu__email">{{ authStore.userEmail || 'E-mail não informado' }}</div>
                    <div
                      class="account-menu__role"
                      :style="{
                        color: roleColor,
                        background: roleColor + '12',
                        borderColor: roleColor + '30',
                      }"
                    >
                      <span class="account-menu__role-dot" :style="{ background: roleColor }" />
                      {{ roleLabel }}
                    </div>
                  </div>
                </div>

                <div class="account-menu__divider" />

                <div class="account-menu__label">Conta</div>

                <q-item clickable v-close-popup to="/perfil" class="account-menu__item">
                  <q-item-section avatar class="account-menu__item-avatar">
                    <div class="account-menu__item-icon account-menu__item-icon--brand">
                      <q-icon name="manage_accounts" size="19px" />
                    </div>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="account-menu__item-title">Meu perfil</q-item-label>
                    <q-item-label caption class="account-menu__item-caption">
                      Alterar dados pessoais e da conta
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" size="19px" class="account-menu__item-arrow" />
                  </q-item-section>
                </q-item>

                <div class="account-menu__session">
                  <div class="account-menu__session-icon">
                    <q-icon :name="sessionUrgent ? 'timer_off' : 'schedule'" size="17px" />
                  </div>
                  <div class="account-menu__session-copy">
                    <span>Sessão ativa</span>
                    <small>{{ sessionStatusLabel }}</small>
                  </div>
                  <strong
                    :class="{
                      'text-warning': sessionWarning && !sessionUrgent,
                      'text-negative': sessionUrgent,
                    }"
                  >
                    {{ sessionTimeLeft }}
                  </strong>
                </div>

                <div class="account-menu__divider" />

                <q-item clickable v-close-popup class="account-menu__item account-menu__item--logout" @click="handleLogout">
                  <q-item-section avatar class="account-menu__item-avatar">
                    <div class="account-menu__item-icon account-menu__item-icon--danger">
                      <q-icon name="logout" size="19px" />
                    </div>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="account-menu__item-title text-negative">Sair do sistema</q-item-label>
                    <q-item-label caption class="account-menu__item-caption">
                      Encerrar esta sessão com segurança
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" size="19px" class="text-negative" />
                  </q-item-section>
                </q-item>
              </div>
            </q-menu>
          </q-btn>

        </div>
      </q-toolbar>
    </q-header>


    <!-- ══════════════════════════════════════════════
         CONFIRMAÇÃO DE SAÍDA
         ══════════════════════════════════════════════ -->
    <q-dialog v-model="logoutDialog" persistent>
      <q-card class="logout-dialog" :class="isDark ? 'logout-dialog--dark' : 'logout-dialog--light'">
        <div class="logout-dialog__accent" />

        <q-card-section class="logout-dialog__body">
          <div class="logout-dialog__icon">
            <q-icon name="logout" size="25px" />
          </div>

          <div class="logout-dialog__content">
            <div class="logout-dialog__eyebrow">Sessão</div>
            <h3>Encerrar sessão?</h3>
            <p>
              Você será desconectado da Artezza e precisará entrar novamente para continuar.
            </p>

            <div class="logout-dialog__user">
              <div class="logout-dialog__avatar" :style="{
                background: roleColor + '22',
                border: `1px solid ${roleColor}44`,
                color: roleColor,
              }">
                {{ initials }}
              </div>
              <div>
                <strong>{{ authStore.userName }}</strong>
                <span>{{ authStore.userEmail || roleLabel }}</span>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="logout-dialog__actions" align="right">
          <q-btn
            flat
            no-caps
            label="Continuar no sistema"
            class="logout-dialog__cancel"
            @click="logoutDialog = false"
          />
          <q-btn
            unelevated
            no-caps
            color="negative"
            icon="logout"
            label="Sair do sistema"
            class="logout-dialog__confirm"
            @click="confirmLogout"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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

const firstName = computed(() =>
  (authStore.userName || 'Usuário').trim().split(/\s+/)[0] || 'Usuário'
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
  {
    key: 'config',
    label: 'Configurações',
    items: [
      { label: 'Configurações', icon: 'settings', to: '/configuracoes', roles: ['admin'] },
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
const currentPage = computed(() => {
  if (route.path === '/perfil' || route.path.startsWith('/perfil/')) {
    return { label: 'Meu Perfil', icon: 'manage_accounts' }
  }

  const items = visibleMenu.value.flatMap(section => section.items)
  const match = items
    .filter(item => route.path === item.to || route.path.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0]

  return match || { label: 'Artezza', icon: 'home' }
})

// ── Timer de sessão REGRESSIVO ─────────────────────────────────────
const SESSION_DURATION = 1 * 60 * 60 // 1 hora em segundos

const sessionTimeLeft = ref('01:00:00')
const sessionWarning = ref(false) // < 30 min
const sessionUrgent = ref(false) // < 5 min
let timerInterval = null

const sessionStatusLabel = computed(() => {
  if (sessionUrgent.value) return 'Expirando agora'
  if (sessionWarning.value) return 'Expira em breve'
  return 'Tempo restante'
})

function tickSession() {
  const loginTs = parseInt(localStorage.getItem('horus_login_ts') || '0')
  if (!loginTs) return

  const elapsed = Math.floor((Date.now() - loginTs) / 1000)
  const remaining = SESSION_DURATION - elapsed

  if (remaining <= 0) {
    // Sessão expirou — desloga automaticamente
    performLogout({ expired: true })
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

// ── Perfil / Logout ────────────────────────────────────────────────
const logoutDialog = ref(false)

function goToProfile() {
  if ($q.screen.lt.sm) drawerOpen.value = false
  router.push('/perfil')
}

function handleLogout() {
  logoutDialog.value = true
}

function performLogout({ expired = false } = {}) {
  clearInterval(timerInterval)
  localStorage.removeItem('horus_login_ts')
  logoutDialog.value = false
  authStore.logout()

  if (expired) {
    $q.notify({
      type: 'negative',
      message: 'Sua sessão expirou. Faça login novamente.',
      icon: 'timer_off',
    })
  }

  router.push('/login')
}

function confirmLogout() {
  performLogout()
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
  background: var(--surf-0) !important;
}

.layout-light {
  background: var(--surf-0) !important;
}

.page-dark {
  background:
    radial-gradient(900px 500px at 8% -10%, rgba(255, 123, 0, .10), transparent 60%),
    radial-gradient(700px 500px at 100% 0%, rgba(255, 149, 0, .06), transparent 55%),
    var(--surf-0);
  min-height: 100%;
}

.page-light {
  background:
    radial-gradient(900px 500px at 8% -10%, rgba(255, 123, 0, .08), transparent 60%),
    radial-gradient(700px 500px at 100% 0%, rgba(255, 149, 0, .05), transparent 55%),
    var(--surf-0);
  min-height: 100%;
}

/* ══════════════════════════════════════════════
   SIDEBAR
   ══════════════════════════════════════════════ */
.sidebar-dark {
  background: var(--surf-sidebar) !important;
  border-right: 1px solid var(--border-soft) !important;
  box-shadow: var(--shadow-lg);
}

.sidebar-light {
  background: var(--surf-sidebar) !important;
  border-right: 1px solid var(--border-soft) !important;
  box-shadow: var(--shadow-sm);
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
  gap: 12px;
  padding: 22px 16px 20px;
  flex-shrink: 0;
  position: relative;
}

.sidebar-brand::after {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-strong) 40%, var(--border-strong) 60%, transparent);
}

.sidebar-brand--collapsed {
  justify-content: center;
  padding: 20px 0 18px;
}

.brand-icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: var(--brand-gradient);
  box-shadow: 0 8px 20px -5px rgba(255, 123, 0, .55), 0 0 0 4px var(--brand-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-icon svg path,
.brand-icon svg circle {
  stroke: #fff !important;
  fill: #fff !important;
}

.brand-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  min-width: 0;
}

.brand-name {
  font-size: 17px;
  font-weight: 900;
  letter-spacing: 4px;
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  white-space: nowrap;
}

.brand-sub {
  font-size: 9px;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--text-faint);
  white-space: nowrap;
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
  background: var(--brand-soft);
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
  background: var(--text-faint);
  border-radius: 2px;
  transition: all .2s ease;
  flex-shrink: 0;
}

.hb-line--mid {
  width: 13px;
  /* linha do meio mais curta → remete a "recolhido" */
}

.hamburger-btn:hover .hb-line {
  background: var(--brand);
}

/* ── Separador ── */
.sidebar-sep {
  height: 1px;
  background: var(--border-soft);
  margin: 0 12px;
  flex-shrink: 0;
}

/* ── Perfil ── */
.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px;
  margin: 10px 10px 14px;
  border-radius: 14px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  flex-shrink: 0;
}

.sidebar-profile--collapsed {
  justify-content: center;
  padding: 12px 0;
  margin: 10px 8px 14px;
}

/* Avatar perfil — div customizada para centralização perfeita */
.profile-av {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
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
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nav-section-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  padding: 16px 10px 8px;
  white-space: nowrap;
  overflow: hidden;
  color: var(--text-faint);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all .2s cubic-bezier(.2, .8, .2, 1);
  user-select: none;
  overflow: hidden;
  position: relative;
}

.nav-item--collapsed {
  justify-content: center;
  padding: 11px 0;
}

.nav-item--dark {
  color: var(--text-muted);
}

.nav-item--light {
  color: var(--text-base);
}

.nav-item--dark:hover {
  background: var(--surf-2);
  color: var(--text-strong);
  transform: translateX(2px);
}

.nav-item--light:hover {
  background: var(--surf-2);
  color: var(--text-strong);
  transform: translateX(2px);
}

.nav-item--active {
  background: var(--brand-gradient) !important;
  color: #fff !important;
  font-weight: 800;
  box-shadow: 0 8px 18px -6px rgba(255, 123, 0, .55);
  transform: none !important;
}

.nav-item--active:hover {
  transform: none;
}

.nav-item--active::before {
  display: none;
}

.nav-item--active .nav-item__icon :deep(svg) {
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, .2));
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
.topbar-dark,
.topbar-light {
  background: var(--surf-topbar) !important;
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
  border-bottom: 1px solid var(--border-soft) !important;
  box-shadow: none !important;
}

.topbar-toolbar {
  padding: 0 14px;
  min-height: 56px;
  flex-wrap: nowrap;
}

/* ── Contexto / breadcrumb da página ── */
.topbar-context {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-shrink: 1;
  margin-left: 2px;
}

.topbar-context__icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .18);
}

.topbar-context__copy {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  white-space: nowrap;
}

.topbar-context__root {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-faint);
  letter-spacing: .2px;
}

.topbar-context__chevron {
  color: var(--text-faint);
  opacity: .7;
  flex-shrink: 0;
}

.topbar-context__page {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 800;
  color: var(--text-strong);
  letter-spacing: .1px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
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
  border: 1px solid var(--border-soft);
  flex-shrink: 0;
  white-space: nowrap;
}

.session-timer--dark {
  background: var(--surf-2);
}

.session-timer--light {
  background: var(--surf-2);
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
  width: 33px;
  height: 33px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-xs);
  transition: box-shadow .2s ease;
}

.topbar-btn:hover .topbar-av {
  box-shadow: var(--shadow-sm);
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
   PERFIL INTERATIVO / CONTA
   ══════════════════════════════════════════════ */
.sidebar-profile {
  cursor: pointer;
  outline: none;
  transition:
    background .18s ease,
    border-color .18s ease,
    transform .18s ease,
    box-shadow .18s ease;
}

.sidebar-profile:hover,
.sidebar-profile:focus-visible {
  background: var(--brand-soft);
  border-color: rgba(255, 123, 0, .24);
  box-shadow: var(--shadow-xs);
}

.sidebar-profile:hover {
  transform: translateY(-1px);
}

.sidebar-profile:focus-visible {
  box-shadow: 0 0 0 3px rgba(255, 123, 0, .14);
}

.profile-info {
  min-width: 0;
  flex: 1;
}

.profile-action {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-faint);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  flex-shrink: 0;
  transition: color .18s ease, border-color .18s ease, background .18s ease;
}

.sidebar-profile:hover .profile-action {
  color: var(--brand);
  border-color: rgba(255, 123, 0, .28);
  background: var(--brand-soft);
}

/* ── Gatilho da conta no topo ── */
.account-trigger {
  min-height: 42px;
  border-radius: 12px;
  padding: 4px 8px 4px 5px;
  color: var(--text-base);
  border: 1px solid transparent;
  transition:
    background .18s ease,
    border-color .18s ease,
    box-shadow .18s ease;
}

.account-trigger :deep(.q-btn__content) {
  flex-wrap: nowrap;
  gap: 8px;
}

.account-trigger--light:hover,
.account-trigger--dark:hover {
  background: var(--surf-2);
  border-color: var(--border-soft);
  box-shadow: var(--shadow-xs);
}

.account-trigger__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  max-width: 142px;
  line-height: 1.15;
}

.account-trigger__name {
  max-width: 100%;
  font-size: 12.5px;
  font-weight: 800;
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-trigger__role {
  max-width: 100%;
  margin-top: 2px;
  font-size: 9.5px;
  font-weight: 700;
  color: var(--text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-trigger__chevron {
  color: var(--text-faint);
  transition: transform .18s ease, color .18s ease;
}

.account-trigger:hover .account-trigger__chevron {
  color: var(--brand);
  transform: translateY(1px);
}

/* ── Popover da conta ── */
.account-menu {
  width: 318px;
  padding: 10px;
  background: var(--surf-1);
  color: var(--text-base);
}

.account-menu--dark,
.account-menu--light {
  background: var(--surf-1);
}

.account-menu__hero {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 10px 12px;
}

.user-menu-av {
  width: 46px;
  height: 46px;
  box-shadow: var(--shadow-xs);
}

.user-menu-av span {
  font-size: 15px;
}

.account-menu__identity {
  flex: 1;
  min-width: 0;
}

.account-menu__name {
  font-size: 14px;
  line-height: 1.25;
  font-weight: 850;
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-menu__email {
  margin-top: 3px;
  font-size: 11px;
  line-height: 1.35;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-menu__role {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 4px 8px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: .35px;
  text-transform: uppercase;
}

.account-menu__role-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.account-menu__divider {
  height: 1px;
  margin: 4px 6px;
  background: var(--border-soft);
}

.account-menu__label {
  padding: 10px 10px 6px;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-faint);
}

.account-menu__item {
  min-height: 58px;
  margin: 2px 0;
  padding: 7px 8px;
  border-radius: 11px;
  color: var(--text-base);
  transition: background .16s ease, transform .16s ease;
}

.account-menu__item:hover {
  background: var(--surf-2);
}

.account-menu__item-avatar {
  min-width: 44px !important;
  padding-right: 8px;
}

.account-menu__item-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
}

.account-menu__item-icon--brand {
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .18);
}

.account-menu__item-icon--danger {
  color: var(--q-negative);
  background: rgba(229, 57, 53, .09);
  border: 1px solid rgba(229, 57, 53, .14);
}

.account-menu__item-title {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--text-strong);
}

.account-menu__item-caption {
  margin-top: 2px;
  font-size: 10.5px;
  line-height: 1.35;
  color: var(--text-muted) !important;
}

.account-menu__item-arrow {
  color: var(--text-faint);
}

.account-menu__item--logout:hover {
  background: rgba(229, 57, 53, .06);
}

.account-menu__session {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 8px 2px;
  padding: 10px;
  border-radius: 11px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
}

.account-menu__session-icon {
  width: 31px;
  height: 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: var(--brand);
  background: var(--brand-soft);
  flex-shrink: 0;
}

.account-menu__session-copy {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  line-height: 1.2;
}

.account-menu__session-copy span {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-strong);
}

.account-menu__session-copy small {
  margin-top: 2px;
  font-size: 9.5px;
  color: var(--text-faint);
}

.account-menu__session strong {
  font-size: 11.5px;
  font-weight: 850;
  font-variant-numeric: tabular-nums;
  color: var(--text-base);
  white-space: nowrap;
}

/* ══════════════════════════════════════════════
   MODAL DE LOGOUT
   ══════════════════════════════════════════════ */
.logout-dialog {
  width: 460px;
  max-width: calc(100vw - 28px);
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid var(--border-soft);
  box-shadow: 0 24px 70px rgba(0, 0, 0, .22);
  color: var(--text-base);
}

.logout-dialog--dark,
.logout-dialog--light {
  background: var(--surf-1);
}

.logout-dialog__accent {
  height: 4px;
  background: linear-gradient(90deg, var(--q-negative), #ff6b5f 52%, rgba(255, 107, 95, .16));
}

.logout-dialog__body {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px 24px 18px;
}

.logout-dialog__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 14px;
  color: var(--q-negative);
  background: rgba(229, 57, 53, .09);
  border: 1px solid rgba(229, 57, 53, .16);
}

.logout-dialog__content {
  flex: 1;
  min-width: 0;
}

.logout-dialog__eyebrow {
  margin-bottom: 4px;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--q-negative);
}

.logout-dialog__content h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  font-weight: 900;
  color: var(--text-strong);
}

.logout-dialog__content p {
  margin: 8px 0 16px;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--text-muted);
}

.logout-dialog__user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
}

.logout-dialog__avatar {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 850;
}

.logout-dialog__user > div:last-child {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.logout-dialog__user strong {
  font-size: 11.5px;
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-dialog__user span {
  margin-top: 1px;
  font-size: 9.5px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-dialog__actions {
  gap: 8px;
  padding: 0 24px 22px;
}

.logout-dialog__cancel,
.logout-dialog__confirm {
  min-height: 40px;
  border-radius: 10px;
  font-weight: 800;
  padding: 0 14px;
}

.logout-dialog__cancel {
  color: var(--text-muted);
}

@media (max-width: 1023px) {
  .account-trigger__meta {
    max-width: 110px;
  }
}

@media (max-width: 599px) {
  .topbar-toolbar {
    min-height: 54px;
    padding: 0 8px;
  }

  .topbar-context {
    gap: 6px;
    margin-left: 0;
  }

  .topbar-context__icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }

  .topbar-context__page {
    max-width: 104px;
    font-size: 12px;
  }

  .session-timer {
    margin-right: 2px;
    padding: 5px 7px;
  }

  .account-trigger {
    width: 40px;
    min-width: 40px;
    padding: 3px;
    border-radius: 50%;
  }

  .account-trigger :deep(.q-btn__content) {
    gap: 0;
  }

  .topbar-av {
    width: 32px;
    height: 32px;
  }

  .account-menu {
    width: min(318px, calc(100vw - 20px));
  }

  .logout-dialog__body {
    padding: 20px 18px 16px;
    gap: 12px;
  }

  .logout-dialog__actions {
    padding: 0 18px 18px;
    flex-direction: column-reverse;
    align-items: stretch !important;
  }

  .logout-dialog__cancel,
  .logout-dialog__confirm {
    width: 100%;
    margin: 0 !important;
  }
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
