<template>
  <div class="login-page">

    <!-- ════════════════════════════════════════
         PAINEL ESQUERDO — visual / branding
         ════════════════════════════════════════ -->
    <div class="panel panel--left">

      <!-- Grade de pontos decorativa -->
      <div class="dot-grid" aria-hidden="true" />

      <!-- Linhas diagonais decorativas -->
      <svg class="diagonal-lines" aria-hidden="true" viewBox="0 0 500 700" preserveAspectRatio="none">
        <line x1="0"   y1="120" x2="500" y2="420" stroke="rgba(255,255,255,.04)" stroke-width="1"/>
        <line x1="0"   y1="300" x2="500" y2="600" stroke="rgba(255,255,255,.04)" stroke-width="1"/>
        <line x1="100" y1="0"   x2="400" y2="700" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
        <line x1="300" y1="0"   x2="600" y2="700" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
      </svg>

      <!-- Blob laranja de profundidade -->
      <div class="blob blob--1" aria-hidden="true" />
      <div class="blob blob--2" aria-hidden="true" />

      <div class="left-content">

        <!-- ── Logo / Marca ── -->
        <div class="brand">
          <!-- Ícone SVG genérico: letra A estilizada como telhado / mobília -->
          <div class="brand__icon">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
              <!-- Forma de "A" com detalhe de régua/esquadro -->
              <path d="M24 6 L6 38 H14 L18 30 H30 L34 38 H42 Z" fill="none" stroke="#ff7b00" stroke-width="3" stroke-linejoin="round"/>
              <path d="M20 24 H28" stroke="#ff7b00" stroke-width="2.5" stroke-linecap="round"/>
              <!-- Ponto de precisão -->
              <circle cx="24" cy="6" r="2" fill="#ff7b00"/>
            </svg>
          </div>
          <div class="brand__text">
            <span class="brand__name">ARTEZZA</span>
            <span class="brand__tagline">Móveis Planejados</span>
          </div>
        </div>

        <!-- ── Headline ── -->
        <div class="headline-wrap">
          <h1 class="headline">
            Transforme projetos<br />
            em <span class="headline__accent">realidade.</span>
          </h1>
          <p class="headline__sub">
            Gerencie pedidos, clientes e parceiros<br />em um único lugar.
          </p>
        </div>

        <!-- ── Card flutuante: stats fictícias ── -->
        <div class="stat-card">
          <div class="stat-card__item">
            <span class="stat-card__num">1.284</span>
            <span class="stat-card__lbl">Pedidos este mês</span>
          </div>
          <div class="stat-card__divider" />
          <div class="stat-card__item">
            <span class="stat-card__num">97%</span>
            <span class="stat-card__lbl">Entregas no prazo</span>
          </div>
          <div class="stat-card__divider" />
          <div class="stat-card__item">
            <span class="stat-card__num">348</span>
            <span class="stat-card__lbl">Clientes ativos</span>
          </div>
        </div>

        <!-- ── Avatares de "usuários online" ── -->
        <div class="online-row">
          <div class="avatars">
            <div class="av" style="background:#e91e63">M</div>
            <div class="av" style="background:#1976d2">R</div>
            <div class="av" style="background:#388e3c">C</div>
            <div class="av" style="background:#7b1fa2">T</div>
          </div>
          <span class="online-txt">+12 usuários online agora</span>
        </div>

      </div>
    </div>

    <!-- ════════════════════════════════════════
         PAINEL DIREITO — formulário
         ════════════════════════════════════════ -->
    <div class="panel panel--right">
      <div class="form-wrap">

        <!-- Logo mobile -->
        <div class="brand brand--mobile">
          <div class="brand__icon">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
              <path d="M24 6 L6 38 H14 L18 30 H30 L34 38 H42 Z" fill="none" stroke="#ff7b00" stroke-width="3" stroke-linejoin="round"/>
              <path d="M20 24 H28" stroke="#ff7b00" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="24" cy="6" r="2" fill="#ff7b00"/>
            </svg>
          </div>
          <div class="brand__text">
            <span class="brand__name">ARTEZZA</span>
            <span class="brand__tagline">Móveis Planejados</span>
          </div>
        </div>

        <!-- Cabeçalho -->
        <div class="form-header">
          <h2 class="form-title">Bem-vindo</h2>
          <p class="form-sub">Entre com suas credenciais para acessar</p>
        </div>

        <!-- ── Formulário ── -->
        <q-form ref="formRef" @submit.prevent="handleLogin" greedy class="q-mt-lg">

          <!-- E-mail -->
          <div class="field-group">
            <label class="field-label">E-mail</label>
            <q-input
              v-model="form.email"
              type="email"
              placeholder="seu@email.com"
              outlined dense dark
              bg-color="grey-9"
              color="orange"
              :rules="[
                v => !!v            || 'E-mail obrigatório',
                v => emailRe.test(v) || 'E-mail inválido',
              ]"
              autocomplete="email"
            >
              <template #prepend>
                <q-icon name="mail_outline" size="18px" color="grey-6" />
              </template>
            </q-input>
          </div>

          <!-- Senha -->
          <div class="field-group">
            <label class="field-label">Senha</label>
            <q-input
              v-model="form.senha"
              :type="showPw ? 'text' : 'password'"
              placeholder="••••••••"
              outlined dense dark
              bg-color="grey-9"
              color="orange"
              :rules="[v => !!v || 'Senha obrigatória']"
              autocomplete="current-password"
            >
              <template #prepend>
                <q-icon name="lock_outline" size="18px" color="grey-6" />
              </template>
              <template #append>
                <q-icon
                  :name="showPw ? 'visibility_off' : 'visibility'"
                  size="18px" color="grey-6"
                  class="cursor-pointer"
                  @click="showPw = !showPw"
                />
              </template>
            </q-input>
          </div>

          <!-- Erro -->
          <transition name="err">
            <div v-if="errorMsg" class="err-banner">
              <q-icon name="error_outline" size="16px" color="white" />
              {{ errorMsg }}
            </div>
          </transition>

          <!-- Botão -->
          <q-btn
            type="submit"
            label="Entrar no sistema"
            unelevated no-caps
            :loading="loading"
            class="login-btn full-width q-mt-lg"
          >
            <template #loading>
              <q-spinner-tail color="white" size="1.2em" />
              <span class="q-ml-sm">Verificando...</span>
            </template>
          </q-btn>

        </q-form>

        <!-- Rodapé -->
        <p class="form-footer">
          Artezza Móveis Planejados © {{ new Date().getFullYear() }}
        </p>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

const $q        = useQuasar()
const router    = useRouter()
const authStore = useAuthStore()

// Garante dark mode ativo sempre na abertura do sistema
$q.dark.set(true)

const form     = ref({ email: '', senha: '' })
const showPw   = ref(false)
const loading  = ref(false)
const errorMsg = ref('')
const formRef  = ref(null)

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function handleLogin() {
  errorMsg.value = ''
  const valid = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    await authStore.login(form.value.email, form.value.senha)
    router.push('/dashboard')
  } catch (err) {
    errorMsg.value =
      err?.response?.data?.message ||
      err?.response?.data?.error   ||
      'E-mail ou senha incorretos.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ── Reset / container ──────────────────────────────────── */
.login-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  background: #0d1117;
}

/* ════════════════════════════════════════════════
   PAINEL ESQUERDO
   ════════════════════════════════════════════════ */
.panel--left {
  width: 52%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #111827 0%, #1a2236 40%, #0f1f3d 100%);
  display: flex;
  align-items: center;
  padding: 60px 52px;
}

/* Grade de pontos */
.dot-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,.07) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
}

/* Linhas diagonais SVG */
.diagonal-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Blobs de profundidade */
.blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(60px);
}
.blob--1 {
  width: 420px; height: 420px;
  background: rgba(255, 123, 0, .13);
  bottom: -120px; left: -80px;
}
.blob--2 {
  width: 280px; height: 280px;
  background: rgba(25, 118, 210, .1);
  top: -60px; right: -60px;
}

/* Conteúdo interno */
.left-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

/* ── Brand ── */
.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}
.brand__icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: rgba(255, 123, 0, .15);
  border: 1px solid rgba(255, 123, 0, .3);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.brand__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.brand__name {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 5px;
  color: #ff7b00;
  line-height: 1;
}
.brand__tagline {
  font-size: 11px;
  letter-spacing: 1.5px;
  color: rgba(255,255,255,.4);
  text-transform: uppercase;
}

/* Mobile brand — oculto no desktop */
.brand--mobile { display: none; }

/* ── Headline ── */
.headline-wrap {}
.headline {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.25;
  color: #fff;
  margin: 0 0 14px;
  letter-spacing: -.3px;
}
.headline__accent {
  color: #ff7b00;
  position: relative;
}
/* sublinhado decorativo */
.headline__accent::after {
  content: '';
  position: absolute;
  left: 0; bottom: -3px;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, #ff7b00, transparent);
  border-radius: 2px;
}
.headline__sub {
  font-size: 14px;
  line-height: 1.65;
  color: rgba(255,255,255,.5);
  margin: 0;
}

/* ── Card de stats ── */
.stat-card {
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 14px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 0;
  backdrop-filter: blur(8px);
}
.stat-card__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-card__num {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}
.stat-card__lbl {
  font-size: 10.5px;
  color: rgba(255,255,255,.45);
  text-align: center;
  letter-spacing: .3px;
}
.stat-card__divider {
  width: 1px;
  height: 36px;
  background: rgba(255,255,255,.1);
  flex-shrink: 0;
}

/* ── Avatares online ── */
.online-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatars {
  display: flex;
}
.av {
  width: 30px; height: 30px;
  border-radius: 50%;
  border: 2px solid #111827;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff;
  margin-right: -8px;
  flex-shrink: 0;
}
.avatars .av:last-child { margin-right: 0; }
.online-txt {
  font-size: 12.5px;
  color: rgba(255,255,255,.45);
  margin-left: 12px;
}

/* ════════════════════════════════════════════════
   PAINEL DIREITO
   ════════════════════════════════════════════════ */
.panel--right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 52px;
  background: #161b22;
  border-left: 1px solid rgba(255,255,255,.06);
}

.form-wrap {
  width: 100%;
  max-width: 340px;
}

/* ── Cabeçalho do form ── */
.form-header { margin-bottom: 0; }
.form-title {
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 6px;
}
.form-sub {
  font-size: 13px;
  color: rgba(255,255,255,.4);
  margin: 0;
}

/* ── Labels ── */
.field-group { margin-bottom: 4px; }
.field-label {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: .7px;
  text-transform: uppercase;
  color: rgba(255,255,255,.5);
  margin-bottom: 6px;
  margin-top: 16px;
}

/* ── Banner de erro ── */
.err-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(229, 57, 53, .18);
  border: 1px solid rgba(229, 57, 53, .4);
  color: #ef9a9a;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  margin-top: 8px;
}

/* ── Botão entrar ── */
.login-btn {
  background: #ff7b00 !important;
  color: #fff !important;
  height: 46px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: .3px;
  box-shadow: 0 8px 24px rgba(255,123,0,.35) !important;
  transition: transform .15s, box-shadow .15s;
}
.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255,123,0,.48) !important;
}
.login-btn:active:not(:disabled) { transform: translateY(0); }

/* ── Rodapé ── */
.form-footer {
  margin: 28px 0 0;
  font-size: 11.5px;
  color: rgba(255,255,255,.2);
  text-align: center;
  letter-spacing: .3px;
}

/* ── Transição do erro ── */
.err-enter-active, .err-leave-active { transition: all .2s ease; }
.err-enter-from { opacity: 0; transform: translateY(-5px); }
.err-leave-to   { opacity: 0; }

/* ════════════════════════════════════════════════
   RESPONSIVO
   ════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .panel--left  { display: none; }
  .panel--right { padding: 48px 28px; align-items: flex-start; padding-top: 72px; }
  .brand--mobile { display: flex !important; }
}

@media (max-width: 400px) {
  .panel--right { padding: 40px 20px; padding-top: 60px; }
}
</style>
