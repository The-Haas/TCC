<template>
  <div class="login-page">
    <!-- ══════════════════════════════════════════════
         PAINEL INSTITUCIONAL
         ══════════════════════════════════════════════ -->
    <section class="hero-panel" aria-label="Artezza Móveis Planejados">
      <div class="hero-panel__grid" aria-hidden="true" />
      <div class="hero-panel__glow hero-panel__glow--orange" aria-hidden="true" />
      <div class="hero-panel__glow hero-panel__glow--blue" aria-hidden="true" />

      <svg class="hero-panel__lines" aria-hidden="true" viewBox="0 0 900 900" preserveAspectRatio="none">
        <path d="M-40 610 C190 470 300 725 520 545 C690 405 760 445 960 300" />
        <path d="M-80 710 C160 550 340 800 555 635 C740 490 825 505 980 390" />
      </svg>

      <div class="hero-content">
        <header class="brand brand--hero">
          <div class="brand__icon brand__icon--hero" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="27" height="27">
              <path d="M24 6 L6 38 H14 L18 30 H30 L34 38 H42 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />
              <path d="M20 24 H28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
              <circle cx="24" cy="6" r="2" fill="currentColor" />
            </svg>
          </div>
          <div class="brand__text">
            <span class="brand__name">ARTEZZA</span>
            <span class="brand__tagline">Móveis Planejados</span>
          </div>
        </header>

        <div class="hero-copy">
          <div class="eyebrow">
            <span class="eyebrow__dot" />
            PORTAL DE PROJETOS
          </div>

          <h1 class="hero-title">
            Projetos sob medida.<br />
            Processos sob <span>controle.</span>
          </h1>

          <p class="hero-description">
            Um único ambiente para acompanhar cada etapa do projeto, conectar a rede comercial
            e transformar planejamento em entrega.
          </p>
        </div>

        <!-- Fluxo visual resumido do sistema -->
        <div class="workflow-card">
          <div class="workflow-card__head">
            <div>
              <span class="workflow-card__eyebrow">FLUXO INTEGRADO</span>
              <strong>Da criação à entrega</strong>
            </div>
            <div class="workflow-card__status">
              <span />
              Operação conectada
            </div>
          </div>

          <div class="workflow">
            <div v-for="(step, index) in workflowSteps" :key="step.label" class="workflow__step">
              <div class="workflow__icon">
                <q-icon :name="step.icon" size="19px" />
              </div>
              <div class="workflow__text">
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                <strong>{{ step.label }}</strong>
              </div>
              <q-icon v-if="index < workflowSteps.length - 1" name="arrow_forward" class="workflow__arrow" size="17px" />
            </div>
          </div>
        </div>

        <footer class="hero-footer">
          <div class="hero-footer__item">
            <q-icon name="verified_user" size="17px" />
            <span>Acesso individual e protegido</span>
          </div>
          <div class="hero-footer__divider" />
          <div class="hero-footer__item">
            <q-icon name="hub" size="17px" />
            <span>Cliente, lojista, representante e administração</span>
          </div>
        </footer>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════
         ACESSO
         ══════════════════════════════════════════════ -->
    <main class="access-panel">
      <div class="access-panel__glow" aria-hidden="true" />

      <div class="access-shell">
        <!-- Marca exibida somente quando o painel institucional some -->
        <header class="brand brand--mobile">
          <div class="brand__icon">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="23" height="23">
              <path d="M24 6 L6 38 H14 L18 30 H30 L34 38 H42 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />
              <path d="M20 24 H28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
              <circle cx="24" cy="6" r="2" fill="currentColor" />
            </svg>
          </div>
          <div class="brand__text">
            <span class="brand__name">ARTEZZA</span>
            <span class="brand__tagline">Móveis Planejados</span>
          </div>
        </header>

        <div class="access-card">
          <div class="access-card__accent" aria-hidden="true" />

          <div class="access-card__topline">
            <span class="access-kicker">ACESSO AO SISTEMA</span>
            <div class="secure-pill">
              <q-icon name="lock" size="13px" />
              Ambiente seguro
            </div>
          </div>

          <div class="form-header">
            <h2 class="form-title">Bem-vindo de volta</h2>
            <p class="form-sub">
              Informe suas credenciais para acessar o portal Artezza.
            </p>
          </div>

          <q-form ref="formRef" class="login-form" greedy @submit.prevent="handleLogin">
            <div class="field-group">
              <label class="field-label" for="login-email">E-mail</label>
              <q-input
                id="login-email"
                v-model="form.email"
                class="login-input"
                type="email"
                placeholder="seu@email.com"
                outlined
                dark
                color="orange"
                :rules="[
                  v => !!v || 'E-mail obrigatório',
                  v => emailRe.test(v) || 'E-mail inválido',
                ]"
                autocomplete="email"
              >
                <template #prepend>
                  <q-icon name="mail_outline" size="19px" />
                </template>
              </q-input>
            </div>

            <div class="field-group field-group--password">
              <div class="field-label-row">
                <label class="field-label" for="login-password">Senha</label>
                <q-btn
                  flat
                  dense
                  no-caps
                  label="Esqueceu a senha?"
                  to="/esqueceu-senha"
                  class="forgot-link"
                />
              </div>

              <q-input
                id="login-password"
                v-model="form.senha"
                class="login-input"
                :type="showPw ? 'text' : 'password'"
                placeholder="Digite sua senha"
                outlined
                dark
                color="orange"
                :rules="[v => !!v || 'Senha obrigatória']"
                autocomplete="current-password"
              >
                <template #prepend>
                  <q-icon name="lock_outline" size="19px" />
                </template>
                <template #append>
                  <q-btn
                    flat
                    round
                    dense
                    :icon="showPw ? 'visibility_off' : 'visibility'"
                    class="password-toggle"
                    :aria-label="showPw ? 'Ocultar senha' : 'Exibir senha'"
                    @click="showPw = !showPw"
                  />
                </template>
              </q-input>
            </div>

            <transition name="err">
              <div v-if="errorMsg" class="err-banner" role="alert" aria-live="polite">
                <div class="err-banner__icon">
                  <q-icon name="error_outline" size="18px" />
                </div>
                <div>
                  <strong>Não foi possível entrar</strong>
                  <span>{{ errorMsg }}</span>
                </div>
              </div>
            </transition>

            <q-btn
              type="submit"
              unelevated
              no-caps
              :loading="loading"
              class="login-btn full-width"
            >
              <span>Entrar no sistema</span>
              <q-icon v-if="!loading" name="arrow_forward" size="19px" class="q-ml-sm" />

              <template #loading>
                <q-spinner-tail color="white" size="1.2em" />
                <span class="q-ml-sm">Verificando acesso...</span>
              </template>
            </q-btn>

            <div class="access-divider">
              <span>Primeiro acesso?</span>
            </div>

            <q-btn
              outline
              no-caps
              icon="person_add_alt_1"
              label="Ativar meu acesso"
              to="/esqueceu-senha"
              class="first-access-btn full-width"
            />
          </q-form>

          <div class="access-note">
            <q-icon name="info_outline" size="15px" />
            <span>Utilize o e-mail cadastrado na sua conta Artezza.</span>
          </div>
        </div>

        <footer class="form-footer">
          <span>Artezza Móveis Planejados © {{ currentYear }}</span>
          <span class="form-footer__dot" />
          <span>Portal de Projetos</span>
        </footer>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// O acesso mantém a identidade escura do portal antes da preferência do usuário ser carregada.
$q.dark.set(true)

const emailRecebido = typeof route.query.email === 'string' ? route.query.email : ''
const form = ref({ email: emailRecebido, senha: '' })
const showPw = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const formRef = ref(null)

const currentYear = new Date().getFullYear()
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const workflowSteps = [
  { label: 'Projeto', icon: 'design_services' },
  { label: 'Análise', icon: 'fact_check' },
  { label: 'Produção', icon: 'precision_manufacturing' },
  { label: 'Entrega', icon: 'local_shipping' },
]

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
      err?.response?.data?.error ||
      'E-mail ou senha incorretos.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ════════════════════════════════════════════════
   BASE
   ════════════════════════════════════════════════ */
.login-page {
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.16fr) minmax(440px, .84fr);
  background: #070a10;
  color: #fff;
  overflow: hidden;
}

/* ════════════════════════════════════════════════
   MARCA
   ════════════════════════════════════════════════ */
.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand__icon {
  width: 48px;
  height: 48px;
  border-radius: 15px;
  display: grid;
  place-items: center;
  color: #ff7b00;
  background: rgba(255, 123, 0, .1);
  border: 1px solid rgba(255, 123, 0, .24);
  box-shadow: 0 10px 28px -16px rgba(255, 123, 0, .85);
  flex: 0 0 auto;
}

.brand__icon--hero {
  width: 54px;
  height: 54px;
  color: #fff;
  background: linear-gradient(135deg, #ffab30 0%, #ff7b00 58%, #e35d00 100%);
  border-color: rgba(255, 255, 255, .14);
  box-shadow: 0 14px 34px -10px rgba(255, 123, 0, .62), 0 0 0 5px rgba(255, 123, 0, .08);
}

.brand__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand__name {
  color: #ff8a18;
  font-family: 'Space Grotesk', 'DM Sans', sans-serif;
  font-size: 20px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 5px;
}

.brand__tagline {
  color: rgba(255, 255, 255, .42);
  font-size: 9px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 2.4px;
  text-transform: uppercase;
}

.brand--mobile {
  display: none;
}

/* ════════════════════════════════════════════════
   PAINEL INSTITUCIONAL
   ════════════════════════════════════════════════ */
.hero-panel {
  position: relative;
  min-width: 0;
  display: flex;
  overflow: hidden;
  background:
    linear-gradient(145deg, rgba(21, 29, 48, .98) 0%, rgba(9, 13, 24, .99) 50%, rgba(5, 8, 14, 1) 100%);
  border-right: 1px solid rgba(255, 255, 255, .065);
}

.hero-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, transparent 68%, rgba(255, 123, 0, .025) 100%);
}

.hero-panel__grid {
  position: absolute;
  inset: 0;
  opacity: .55;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to bottom, rgba(0,0,0,.9), transparent 92%);
}

.hero-panel__lines {
  position: absolute;
  left: -7%;
  bottom: -8%;
  width: 115%;
  height: 82%;
  fill: none;
  stroke: rgba(255, 123, 0, .115);
  stroke-width: 1.2;
  pointer-events: none;
}

.hero-panel__glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  pointer-events: none;
}

.hero-panel__glow--orange {
  width: 520px;
  height: 520px;
  right: -180px;
  top: 24%;
  background: radial-gradient(circle, rgba(255, 123, 0, .17) 0%, rgba(255, 123, 0, 0) 68%);
}

.hero-panel__glow--blue {
  width: 460px;
  height: 460px;
  left: -190px;
  bottom: -190px;
  background: radial-gradient(circle, rgba(56, 91, 178, .12) 0%, rgba(56, 91, 178, 0) 70%);
}

.hero-content {
  position: relative;
  z-index: 2;
  width: min(760px, 100%);
  min-height: 100%;
  padding: clamp(38px, 5vw, 68px) clamp(44px, 6vw, 86px);
  display: flex;
  flex-direction: column;
}

.hero-copy {
  margin: auto 0 0;
  padding-top: 62px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 18px;
  color: #ff8a18;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2.1px;
}

.eyebrow__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff7b00;
  box-shadow: 0 0 0 5px rgba(255, 123, 0, .11);
}

.hero-title {
  max-width: 680px;
  margin: 0;
  color: #f8f9fc;
  font-family: 'Space Grotesk', 'DM Sans', sans-serif;
  font-size: clamp(38px, 4.35vw, 64px);
  line-height: 1.04;
  font-weight: 700;
  letter-spacing: -2.4px;
}

.hero-title span {
  color: #ff7b00;
  position: relative;
  white-space: nowrap;
}

.hero-title span::after {
  content: '';
  position: absolute;
  left: 2px;
  right: 4px;
  bottom: -7px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, #ff7b00 0%, rgba(255, 123, 0, .16) 76%, transparent 100%);
}

.hero-description {
  max-width: 590px;
  margin: 27px 0 0;
  color: rgba(219, 224, 234, .58);
  font-size: 15px;
  line-height: 1.78;
}

/* Fluxo */
.workflow-card {
  width: 100%;
  margin-top: clamp(36px, 6vh, 64px);
  padding: 20px 22px 18px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, .085);
  background: linear-gradient(135deg, rgba(255,255,255,.057), rgba(255,255,255,.024));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.025), 0 24px 60px -40px rgba(0,0,0,.9);
  backdrop-filter: blur(18px);
}

.workflow-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.workflow-card__head > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.workflow-card__eyebrow {
  color: #ff8a18;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 1.7px;
}

.workflow-card__head strong {
  color: rgba(255,255,255,.9);
  font-size: 13px;
  font-weight: 700;
}

.workflow-card__status {
  display: flex;
  align-items: center;
  gap: 7px;
  color: rgba(255,255,255,.42);
  font-size: 10px;
  white-space: nowrap;
}

.workflow-card__status span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, .09);
}

.workflow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
}

.workflow__step {
  position: relative;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 25px;
}

.workflow__icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: #ff8a18;
  background: rgba(255, 123, 0, .095);
  border: 1px solid rgba(255, 123, 0, .14);
}

.workflow__text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.workflow__text span {
  color: rgba(255,255,255,.25);
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 1px;
}

.workflow__text strong {
  overflow: hidden;
  color: rgba(255,255,255,.75);
  font-size: 10.5px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workflow__arrow {
  position: absolute;
  right: 6px;
  color: rgba(255,255,255,.16);
}

.hero-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: auto;
  padding-top: 30px;
  color: rgba(255,255,255,.3);
}

.hero-footer__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
}

.hero-footer__item :deep(.q-icon) {
  color: rgba(255, 123, 0, .72);
}

.hero-footer__divider {
  width: 1px;
  height: 18px;
  background: rgba(255,255,255,.09);
}

/* ════════════════════════════════════════════════
   PAINEL DE ACESSO
   ════════════════════════════════════════════════ */
.access-panel {
  position: relative;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding: 44px clamp(30px, 4vw, 64px);
  background:
    radial-gradient(circle at 90% 12%, rgba(255, 123, 0, .065), transparent 29%),
    #090c12;
}

.access-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .42;
  background-image: radial-gradient(circle, rgba(255,255,255,.045) 1px, transparent 1px);
  background-size: 30px 30px;
  mask-image: linear-gradient(130deg, transparent 3%, #000 42%, transparent 92%);
}

.access-panel__glow {
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  left: 10%;
  bottom: -220px;
  pointer-events: none;
  background: radial-gradient(circle, rgba(40, 69, 135, .11) 0%, transparent 70%);
}

.access-shell {
  position: relative;
  z-index: 1;
  width: min(440px, 100%);
}

.access-card {
  position: relative;
  overflow: hidden;
  padding: 32px;
  border-radius: 26px;
  border: 1px solid rgba(255,255,255,.085);
  background: linear-gradient(155deg, rgba(20, 25, 36, .94), rgba(13, 17, 25, .97));
  box-shadow: 0 34px 80px -35px rgba(0,0,0,.95), inset 0 1px 0 rgba(255,255,255,.025);
  backdrop-filter: blur(20px);
}

.access-card__accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #ff7b00 0%, #ffab30 28%, rgba(255,123,0,.12) 68%, transparent 100%);
}

.access-card__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 26px;
}

.access-kicker {
  color: #ff8a18;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.secure-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  border-radius: 999px;
  color: rgba(255,255,255,.44);
  background: rgba(255,255,255,.035);
  border: 1px solid rgba(255,255,255,.065);
  font-size: 9.5px;
  white-space: nowrap;
}

.secure-pill :deep(.q-icon) {
  color: rgba(255,123,0,.78);
}

.form-title {
  margin: 0;
  color: #f6f7fa;
  font-family: 'Space Grotesk', 'DM Sans', sans-serif;
  font-size: 29px;
  line-height: 1.13;
  font-weight: 700;
  letter-spacing: -.7px;
}

.form-sub {
  margin: 8px 0 0;
  color: rgba(205, 211, 223, .48);
  font-size: 12.5px;
  line-height: 1.6;
}

.login-form {
  margin-top: 28px;
}

.field-group + .field-group {
  margin-top: 16px;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 7px;
}

.field-label {
  display: block;
  margin: 0 0 7px;
  color: rgba(230, 233, 239, .64);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.1px;
  text-transform: uppercase;
}

.field-label-row .field-label {
  margin-bottom: 0;
}

/* Inputs Quasar */
.login-input :deep(.q-field__control) {
  min-height: 50px;
  border-radius: 13px !important;
  background: rgba(3, 6, 11, .4);
  color: #f5f6f9;
  transition: background .18s ease, box-shadow .18s ease;
}

.login-input :deep(.q-field__control::before) {
  border-color: rgba(255,255,255,.10) !important;
}

.login-input :deep(.q-field__control:hover::before) {
  border-color: rgba(255,255,255,.18) !important;
}

.login-input.q-field--focused :deep(.q-field__control) {
  background: rgba(4, 7, 12, .72);
  box-shadow: 0 0 0 3px rgba(255, 123, 0, .07);
}

.login-input.q-field--focused :deep(.q-field__control::after) {
  border-color: #ff7b00 !important;
  border-width: 1px !important;
}

.login-input :deep(.q-field__native),
.login-input :deep(.q-field__input) {
  color: rgba(255,255,255,.9) !important;
  font-size: 13px;
  font-weight: 500;
}

.login-input :deep(.q-field__native::placeholder),
.login-input :deep(.q-field__input::placeholder) {
  color: rgba(255,255,255,.25) !important;
  opacity: 1;
}

.login-input :deep(.q-field__prepend) {
  padding-right: 11px;
  color: rgba(255,255,255,.32);
}

.login-input.q-field--focused :deep(.q-field__prepend) {
  color: #ff8a18;
}

.login-input :deep(.q-field__append) {
  color: rgba(255,255,255,.32);
}

.login-input :deep(.q-field__bottom) {
  padding: 6px 4px 0;
  color: #ff8a80;
  font-size: 10.5px;
}

.password-toggle {
  color: rgba(255,255,255,.36) !important;
  transition: color .18s ease, background .18s ease;
}

.password-toggle:hover {
  color: #ff8a18 !important;
  background: rgba(255,123,0,.08) !important;
}

.forgot-link {
  min-height: 24px !important;
  padding: 0 2px !important;
  color: rgba(255,255,255,.42) !important;
  font-size: 10.5px;
  font-weight: 600;
  transition: color .18s ease;
}

.forgot-link:hover {
  color: #ff8a18 !important;
}

/* Erro */
.err-banner {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin-top: 12px;
  padding: 12px 13px;
  border-radius: 12px;
  border: 1px solid rgba(239, 83, 80, .22);
  background: rgba(239, 83, 80, .075);
  color: #ffb4b1;
}

.err-banner__icon {
  width: 28px;
  height: 28px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: #ff7974;
  background: rgba(239, 83, 80, .11);
}

.err-banner > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.err-banner strong {
  color: #ffc5c2;
  font-size: 11px;
  font-weight: 700;
}

.err-banner span {
  color: rgba(255, 196, 193, .7);
  font-size: 10.5px;
  line-height: 1.45;
}

/* Ações */
.login-btn {
  min-height: 50px;
  margin-top: 18px;
  border-radius: 13px !important;
  color: #fff !important;
  background: linear-gradient(135deg, #ff9a24 0%, #ff7b00 56%, #ee6600 100%) !important;
  box-shadow: 0 16px 30px -15px rgba(255,123,0,.72) !important;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: .15px;
  transition: transform .16s ease, box-shadow .16s ease, filter .16s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.04);
  box-shadow: 0 20px 34px -15px rgba(255,123,0,.85) !important;
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.access-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 21px 0 14px;
  color: rgba(255,255,255,.25);
  font-size: 9.5px;
  font-weight: 600;
  white-space: nowrap;
}

.access-divider::before,
.access-divider::after {
  content: '';
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.085));
}

.access-divider::after {
  background: linear-gradient(90deg, rgba(255,255,255,.085), transparent);
}

.first-access-btn {
  min-height: 47px;
  border-radius: 13px !important;
  color: rgba(255,255,255,.66) !important;
  font-size: 11.5px;
  font-weight: 700;
  background: rgba(255,255,255,.02) !important;
  transition: color .16s ease, background .16s ease, border-color .16s ease;
}

.first-access-btn::before {
  border-color: rgba(255,255,255,.105) !important;
}

.first-access-btn:hover {
  color: #ff9a24 !important;
  background: rgba(255,123,0,.055) !important;
}

.first-access-btn:hover::before {
  border-color: rgba(255,123,0,.28) !important;
}

.access-note {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 18px;
  padding-top: 17px;
  border-top: 1px solid rgba(255,255,255,.06);
  color: rgba(255,255,255,.27);
  font-size: 9.5px;
  line-height: 1.4;
}

.access-note :deep(.q-icon) {
  color: rgba(255,123,0,.55);
}

.form-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
  color: rgba(255,255,255,.2);
  font-size: 9.5px;
  letter-spacing: .2px;
  text-align: center;
}

.form-footer__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255,123,0,.45);
}

.err-enter-active,
.err-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}

.err-enter-from,
.err-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ════════════════════════════════════════════════
   RESPONSIVO
   ════════════════════════════════════════════════ */
/* Alturas menores de notebook: mantém toda a experiência dentro do viewport */
@media (min-width: 921px) and (max-height: 820px) {
  .hero-content {
    padding-top: 28px;
    padding-bottom: 26px;
  }

  .brand__icon--hero {
    width: 48px;
    height: 48px;
    border-radius: 14px;
  }

  .hero-copy {
    padding-top: 24px;
  }

  .eyebrow {
    margin-bottom: 12px;
  }

  .hero-title {
    font-size: clamp(36px, 3.75vw, 52px);
    line-height: 1.01;
  }

  .hero-description {
    margin-top: 16px;
    font-size: 13px;
    line-height: 1.55;
  }

  .workflow-card {
    margin-top: 24px;
    padding: 15px 17px 14px;
    border-radius: 18px;
  }

  .workflow-card__head {
    margin-bottom: 13px;
  }

  .workflow__icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }

  .hero-footer {
    padding-top: 17px;
  }

  .access-panel {
    padding-top: 22px;
    padding-bottom: 22px;
  }

  .access-card {
    padding: 24px 26px;
    border-radius: 22px;
  }

  .access-card__topline {
    margin-bottom: 18px;
  }

  .form-title {
    font-size: 26px;
  }

  .form-sub {
    margin-top: 5px;
    line-height: 1.45;
  }

  .login-form {
    margin-top: 19px;
  }

  .field-group + .field-group {
    margin-top: 10px;
  }

  .field-label-row,
  .field-label {
    margin-bottom: 5px;
  }

  .login-input :deep(.q-field__control) {
    min-height: 46px;
  }

  .login-input :deep(.q-field__bottom) {
    padding-top: 4px;
    min-height: 16px;
  }

  .login-btn {
    min-height: 46px;
    margin-top: 12px;
  }

  .access-divider {
    margin: 14px 0 10px;
  }

  .first-access-btn {
    min-height: 43px;
  }

  .access-note {
    margin-top: 12px;
    padding-top: 11px;
  }

  .form-footer {
    margin-top: 11px;
  }
}

@media (min-width: 921px) and (max-height: 700px) {
  .hero-content {
    padding-top: 20px;
    padding-bottom: 18px;
  }

  .brand__icon--hero {
    width: 44px;
    height: 44px;
  }

  .brand__name {
    font-size: 18px;
  }

  .hero-copy {
    padding-top: 12px;
  }

  .hero-title {
    font-size: clamp(32px, 3.35vw, 45px);
  }

  .hero-description {
    margin-top: 12px;
    font-size: 12px;
    line-height: 1.45;
  }

  .workflow-card {
    margin-top: 17px;
    padding: 12px 14px;
  }

  .workflow-card__head {
    margin-bottom: 10px;
  }

  .workflow-card__status {
    display: none;
  }

  .workflow__icon {
    width: 30px;
    height: 30px;
  }

  .workflow__text strong {
    font-size: 9.5px;
  }

  .hero-footer {
    padding-top: 10px;
  }

  .hero-footer__item {
    font-size: 9px;
  }

  .access-panel {
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .access-card {
    padding: 19px 23px;
  }

  .access-card__topline {
    margin-bottom: 12px;
  }

  .form-title {
    font-size: 24px;
  }

  .form-sub {
    font-size: 11.5px;
  }

  .login-form {
    margin-top: 14px;
  }

  .field-group + .field-group {
    margin-top: 7px;
  }

  .field-label,
  .field-label-row {
    margin-bottom: 3px;
  }

  .login-input :deep(.q-field__control) {
    min-height: 43px;
  }

  .login-input :deep(.q-field__bottom) {
    min-height: 13px;
    padding-top: 2px;
  }

  .login-btn {
    min-height: 43px;
    margin-top: 8px;
  }

  .access-divider {
    margin: 10px 0 8px;
  }

  .first-access-btn {
    min-height: 40px;
  }

  .access-note {
    margin-top: 9px;
    padding-top: 8px;
  }

  .form-footer {
    margin-top: 7px;
  }
}

@media (max-width: 1180px) {
  .login-page {
    grid-template-columns: minmax(0, 1fr) minmax(410px, .82fr);
  }

  .hero-content {
    padding-left: 46px;
    padding-right: 46px;
  }

  .hero-title {
    font-size: clamp(38px, 4.1vw, 51px);
  }

  .workflow {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: 16px;
  }

  .workflow__step:nth-child(2) .workflow__arrow {
    display: none;
  }
}

@media (max-width: 920px) {
  .login-page {
    display: block;
    min-height: 100dvh;
    overflow: auto;
  }

  .hero-panel {
    display: none;
  }

  .access-panel {
    min-height: 100dvh;
    padding: 38px 24px;
    align-items: center;
    background:
      radial-gradient(circle at 88% 10%, rgba(255,123,0,.11), transparent 30%),
      radial-gradient(circle at 8% 92%, rgba(39,69,141,.11), transparent 34%),
      #080b11;
  }

  .brand--mobile {
    display: flex;
    width: max-content;
    margin: 0 auto 26px;
  }

  .access-shell {
    width: min(460px, 100%);
  }
}

@media (max-width: 520px) {
  .access-panel {
    padding: 28px 16px;
    align-items: flex-start;
  }

  .brand--mobile {
    margin-top: 4px;
    margin-bottom: 22px;
  }

  .brand__icon {
    width: 44px;
    height: 44px;
    border-radius: 13px;
  }

  .brand__name {
    font-size: 17px;
    letter-spacing: 4px;
  }

  .brand__tagline {
    font-size: 8px;
    letter-spacing: 2px;
  }

  .access-card {
    padding: 25px 20px;
    border-radius: 21px;
  }

  .access-card__topline {
    margin-bottom: 22px;
  }

  .secure-pill {
    padding: 5px 7px;
    font-size: 8.5px;
  }

  .form-title {
    font-size: 25px;
  }

  .form-sub {
    font-size: 11.5px;
  }

  .login-form {
    margin-top: 24px;
  }

  .login-input :deep(.q-field__control) {
    min-height: 48px;
  }
}

@media (max-width: 360px) {
  .secure-pill {
    display: none;
  }

  .access-card__topline {
    justify-content: flex-start;
  }
}
</style>
