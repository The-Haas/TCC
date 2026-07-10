import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────────────────
  const token = ref(localStorage.getItem('horus_token') || null)
  const user  = ref(JSON.parse(localStorage.getItem('horus_user') || 'null'))

  // ── Getters ────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value)
  const userTipo        = computed(() => user.value?.tipo  || null)
  const userName        = computed(() => user.value?.nome  || '')
  const userEmail       = computed(() => user.value?.email || '')
  const userId          = computed(() => user.value?.id || null)

  const isAdmin         = computed(() => userTipo.value === 'admin')
  const isLojista       = computed(() => userTipo.value === 'lojista')
  const isRepresentante = computed(() => userTipo.value === 'representante')
  const isCliente       = computed(() => userTipo.value === 'cliente')

  // ── Actions ────────────────────────────────────────────────────────
  async function login(email, senha) {
    const { data } = await api.post('/login', { email, senha })

    token.value = data.token
    user.value  = data.user

    localStorage.setItem('horus_token',    data.token)
    localStorage.setItem('horus_user',     JSON.stringify(data.user))
    localStorage.setItem('horus_login_ts', Date.now().toString())

    return data
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('horus_token')
    localStorage.removeItem('horus_user')
    localStorage.removeItem('horus_login_ts')
  }

  return {
    token, user,
    isAuthenticated, userTipo, userName, userEmail, 
    userId, isAdmin, isLojista, isRepresentante, isCliente,
    login, logout, 
  }
})
