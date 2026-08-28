<template>
  <div class="error-page">
    <!-- Fundo decorativo -->
    <div class="error-bg" aria-hidden="true">
      <div class="error-bg__grid" />
      <div class="error-bg__glow error-bg__glow--brand" />
      <div class="error-bg__glow error-bg__glow--navy" />
    </div>

    <!-- Barra superior -->
    <header class="error-topbar">
      <div class="brand" aria-label="Artezza Móveis Planejados">
        <div class="brand__icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="23" height="23">
            <path
              d="M24 6 L6 38 H14 L18 30 H30 L34 38 H42 Z"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linejoin="round"
            />
            <path d="M20 24 H28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
            <circle cx="24" cy="6" r="2" fill="currentColor" />
          </svg>
        </div>

        <div class="brand__text">
          <span class="brand__name">ARTEZZA</span>
          <span class="brand__tagline">Portal de Projetos</span>
        </div>
      </div>

      <q-btn
        flat
        round
        dense
        class="theme-toggle"
        :icon="isDark ? 'light_mode' : 'dark_mode'"
        :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
        :title="isDark ? 'Modo claro' : 'Modo escuro'"
        @click="toggleTheme"
      />
    </header>

    <!-- Conteúdo -->
    <main class="error-shell">
      <section class="error-card">
        <!-- Painel visual -->
        <aside class="error-visual" aria-hidden="true">
          <div class="error-visual__grid" />
          <div class="error-visual__orb error-visual__orb--one" />
          <div class="error-visual__orb error-visual__orb--two" />

          <div class="error-visual__content">
            <div class="error-kicker">
              <span class="error-kicker__dot" />
              ROTA NÃO ENCONTRADA
            </div>

            <div class="error-code-wrap">
              <span class="error-code-shadow">404</span>
              <strong class="error-code">404</strong>
            </div>

            <div class="error-visual__footer">
              <q-icon name="route" size="18px" />
              <span>O caminho solicitado não faz parte da navegação disponível.</span>
            </div>
          </div>
        </aside>

        <!-- Conteúdo funcional -->
        <div class="error-content">
          <div class="error-content__accent" aria-hidden="true" />

          <div class="status-pill">
            <q-icon name="error_outline" size="15px" />
            Erro 404
          </div>

          <div class="error-copy">
            <h1>Página não encontrada</h1>
            <p>
              O endereço que você tentou acessar pode ter sido alterado, removido
              ou digitado incorretamente.
            </p>
          </div>

          <div class="route-box" aria-label="Endereço solicitado">
            <div class="route-box__icon">
              <q-icon name="link" size="18px" />
            </div>
            <div class="route-box__content">
              <span>ENDEREÇO SOLICITADO</span>
              <strong>{{ currentPath }}</strong>
            </div>
          </div>

          <div class="helper-box">
            <div class="helper-box__icon">
              <q-icon name="lightbulb_outline" size="19px" />
            </div>
            <div>
              <strong>Você pode continuar normalmente</strong>
              <span>Volte ao painel principal ou retorne para a página anterior.</span>
            </div>
          </div>

          <div class="error-actions">
            <q-btn
              unelevated
              no-caps
              class="primary-action"
              icon="home"
              label="Voltar ao início"
              @click="goHome"
            />

            <q-btn
              outline
              no-caps
              class="secondary-action"
              icon="arrow_back"
              label="Página anterior"
              @click="goBack"
            />
          </div>

          <div class="error-footer">
            <span class="error-footer__line" />
            <span>Artezza Móveis Planejados</span>
            <span class="error-footer__line" />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const isDark = computed(() => $q.dark.isActive)
const currentPath = computed(() => route.fullPath || '/')

function toggleTheme() {
  $q.dark.toggle()
  localStorage.setItem('horus_dark', $q.dark.isActive ? '1' : '0')
}

function goHome() {
  router.push('/dashboard')
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/dashboard')
}
</script>

<style scoped>
.error-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  background: var(--surf-0);
  color: var(--text-strong);
  font-family: 'DM Sans', sans-serif;
}

/* ─────────────────────────────────────────────
   FUNDO
   ───────────────────────────────────────────── */
.error-bg {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.error-bg__grid {
  position: absolute;
  inset: 0;
  opacity: .34;
  background-image:
    linear-gradient(var(--border-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-soft) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, .65), transparent 78%);
}

.error-bg__glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(6px);
}

.error-bg__glow--brand {
  width: 36vw;
  min-width: 340px;
  aspect-ratio: 1;
  top: -18%;
  left: -7%;
  background: var(--blob-brand);
}

.error-bg__glow--navy {
  width: 34vw;
  min-width: 320px;
  aspect-ratio: 1;
  right: -9%;
  bottom: -24%;
  background: var(--blob-navy);
}

/* ─────────────────────────────────────────────
   TOPO
   ───────────────────────────────────────────── */
.error-topbar {
  position: relative;
  z-index: 2;
  height: 78px;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 11px;
}

.brand__icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08);
}

.brand__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.brand__name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 3.4px;
  color: var(--text-strong);
}

.brand__tagline {
  margin-top: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.35px;
  text-transform: uppercase;
  color: var(--text-faint);
}

.theme-toggle {
  width: 39px;
  height: 39px;
  color: var(--text-muted);
  background: color-mix(in srgb, var(--surf-1) 76%, transparent);
  border: 1px solid var(--border-soft);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: color .2s ease, border-color .2s ease, background .2s ease, transform .2s ease;
}

.theme-toggle:hover {
  color: var(--brand);
  border-color: rgba(255, 123, 0, .28);
  background: var(--brand-soft);
  transform: translateY(-1px);
}

/* ─────────────────────────────────────────────
   CARD PRINCIPAL
   ───────────────────────────────────────────── */
.error-shell {
  position: relative;
  z-index: 1;
  min-height: calc(100dvh - 78px);
  padding: 22px 28px 48px;
  display: grid;
  place-items: center;
}

.error-card {
  width: min(1040px, 100%);
  min-height: 545px;
  display: grid;
  grid-template-columns: minmax(330px, .86fr) minmax(430px, 1.14fr);
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-soft);
  background: var(--surf-1);
  box-shadow: var(--shadow-xl);
}

/* ─────────────────────────────────────────────
   PAINEL 404
   ───────────────────────────────────────────── */
.error-visual {
  position: relative;
  overflow: hidden;
  min-height: 100%;
  color: #fff;
  background:
    linear-gradient(145deg, rgba(255, 123, 0, .09), transparent 40%),
    var(--navy-gradient);
}

.error-visual::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, rgba(255, 123, 0, .6), transparent);
}

.error-visual__grid {
  position: absolute;
  inset: 0;
  opacity: .12;
  background-image:
    linear-gradient(rgba(255, 255, 255, .16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, .16) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: linear-gradient(135deg, #000, transparent 78%);
}

.error-visual__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
}

.error-visual__orb--one {
  width: 280px;
  height: 280px;
  left: -125px;
  top: -70px;
  background: radial-gradient(circle, rgba(255, 123, 0, .27), transparent 68%);
}

.error-visual__orb--two {
  width: 260px;
  height: 260px;
  right: -120px;
  bottom: -80px;
  background: radial-gradient(circle, rgba(80, 110, 220, .18), transparent 68%);
}

.error-visual__content {
  position: relative;
  z-index: 1;
  height: 100%;
  min-height: 545px;
  padding: 46px 42px 38px;
  display: flex;
  flex-direction: column;
}

.error-kicker {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  width: fit-content;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.8px;
  color: rgba(255, 255, 255, .6);
}

.error-kicker__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 0 5px rgba(255, 123, 0, .12);
}

.error-code-wrap {
  position: relative;
  margin: auto 0;
  width: fit-content;
}

.error-code,
.error-code-shadow {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(112px, 12vw, 180px);
  font-weight: 800;
  letter-spacing: -9px;
  line-height: .8;
}

.error-code {
  position: relative;
  z-index: 2;
  color: #fff;
  text-shadow: 0 18px 55px rgba(0, 0, 0, .28);
}

.error-code-shadow {
  position: absolute;
  z-index: 1;
  inset: 9px auto auto 9px;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 123, 0, .52);
  opacity: .8;
}

.error-visual__footer {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 290px;
  color: rgba(255, 255, 255, .58);
  font-size: 12px;
  line-height: 1.55;
}

.error-visual__footer .q-icon {
  flex: 0 0 auto;
  margin-top: 1px;
  color: var(--brand);
}

/* ─────────────────────────────────────────────
   CONTEÚDO
   ───────────────────────────────────────────── */
.error-content {
  position: relative;
  padding: 48px 54px 42px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: color-mix(in srgb, var(--surf-1) 96%, transparent);
}

.error-content__accent {
  position: absolute;
  top: 0;
  left: 54px;
  width: 84px;
  height: 3px;
  border-radius: 0 0 8px 8px;
  background: var(--brand-gradient);
  box-shadow: 0 5px 16px rgba(255, 123, 0, .28);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  padding: 6px 10px;
  margin-bottom: 18px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .16);
}

.error-copy h1 {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(29px, 3.2vw, 40px);
  font-weight: 700;
  letter-spacing: -.9px;
  line-height: 1.08;
  color: var(--text-strong);
}

.error-copy p {
  max-width: 500px;
  margin: 13px 0 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-muted);
}

.route-box,
.helper-box {
  display: flex;
  align-items: center;
  gap: 13px;
  border: 1px solid var(--border-soft);
  background: var(--surf-2);
}

.route-box {
  margin-top: 27px;
  padding: 13px 15px;
  border-radius: var(--radius-sm);
}

.route-box__icon,
.helper-box__icon {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
}

.route-box__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: var(--brand);
  background: var(--brand-soft);
}

.route-box__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.route-box__content span {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.15px;
  color: var(--text-faint);
}

.route-box__content strong {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-base);
}

.helper-box {
  margin-top: 11px;
  padding: 13px 15px;
  border-radius: var(--radius-sm);
  align-items: flex-start;
  background: color-mix(in srgb, var(--surf-2) 60%, transparent);
}

.helper-box__icon {
  width: 30px;
  height: 30px;
  margin-top: 1px;
  border-radius: 9px;
  color: var(--text-muted);
  background: color-mix(in srgb, var(--text-muted) 9%, transparent);
}

.helper-box > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.helper-box strong {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-base);
}

.helper-box span {
  font-size: 11px;
  line-height: 1.45;
  color: var(--text-muted);
}

.error-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 11px;
  margin-top: 25px;
}

.primary-action,
.secondary-action {
  min-height: 44px;
  font-weight: 700;
  letter-spacing: -.1px;
}

.primary-action {
  color: #fff;
  background: var(--brand-gradient) !important;
  box-shadow: var(--shadow-brand);
  transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
}

.primary-action:hover {
  transform: translateY(-1px);
  filter: saturate(1.08);
  box-shadow: 0 16px 32px -10px rgba(255, 123, 0, .58);
}

.secondary-action {
  color: var(--text-base);
  border-color: var(--border-strong) !important;
  background: transparent;
}

.secondary-action:hover {
  color: var(--brand);
  background: var(--brand-soft);
}

.error-footer {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: 29px;
  color: var(--text-faint);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  white-space: nowrap;
}

.error-footer__line {
  height: 1px;
  flex: 1;
  background: var(--border-soft);
}

/* ─────────────────────────────────────────────
   NOTEBOOKS COM MENOR ALTURA
   ───────────────────────────────────────────── */
@media (min-width: 821px) and (max-height: 720px) {
  .error-topbar {
    height: 64px;
  }

  .error-shell {
    min-height: calc(100dvh - 64px);
    padding-top: 10px;
    padding-bottom: 24px;
  }

  .error-card {
    min-height: 478px;
  }

  .error-visual__content {
    min-height: 478px;
    padding: 34px 36px 30px;
  }

  .error-code,
  .error-code-shadow {
    font-size: clamp(102px, 11vw, 148px);
  }

  .error-content {
    padding: 34px 44px 30px;
  }

  .error-content__accent {
    left: 44px;
  }

  .status-pill {
    margin-bottom: 13px;
  }

  .route-box {
    margin-top: 20px;
  }

  .error-actions {
    margin-top: 19px;
  }

  .error-footer {
    margin-top: 21px;
  }
}

/* ─────────────────────────────────────────────
   TABLET / MOBILE
   ───────────────────────────────────────────── */
@media (max-width: 820px) {
  .error-page {
    overflow-y: auto;
  }

  .error-topbar {
    height: 68px;
    padding-inline: 18px;
  }

  .error-shell {
    min-height: calc(100dvh - 68px);
    padding: 14px 18px 28px;
    align-items: center;
  }

  .error-card {
    width: min(620px, 100%);
    min-height: 0;
    grid-template-columns: 1fr;
  }

  .error-visual {
    min-height: 210px;
  }

  .error-visual::after {
    top: auto;
    bottom: 0;
    right: auto;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255, 123, 0, .62), transparent);
  }

  .error-visual__content {
    min-height: 210px;
    padding: 26px 30px;
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto 1fr;
    gap: 8px 18px;
  }

  .error-kicker {
    grid-column: 1;
    grid-row: 1;
  }

  .error-code-wrap {
    grid-column: 2;
    grid-row: 1 / 3;
    align-self: center;
    margin: 0;
  }

  .error-code,
  .error-code-shadow {
    font-size: clamp(82px, 19vw, 118px);
    letter-spacing: -6px;
  }

  .error-visual__footer {
    grid-column: 1;
    grid-row: 2;
    align-self: end;
  }

  .error-content {
    padding: 34px 30px 28px;
  }

  .error-content__accent {
    left: 30px;
  }
}

@media (max-width: 520px) {
  .brand__tagline {
    display: none;
  }

  .brand__name {
    font-size: 14px;
    letter-spacing: 2.7px;
  }

  .brand__icon {
    width: 38px;
    height: 38px;
  }

  .error-shell {
    padding-inline: 12px;
  }

  .error-card {
    border-radius: 22px;
  }

  .error-visual {
    min-height: 178px;
  }

  .error-visual__content {
    min-height: 178px;
    padding: 22px;
  }

  .error-visual__footer {
    max-width: 180px;
    font-size: 10px;
  }

  .error-code,
  .error-code-shadow {
    font-size: clamp(72px, 24vw, 96px);
  }

  .error-content {
    padding: 30px 22px 24px;
  }

  .error-content__accent {
    left: 22px;
  }

  .error-copy h1 {
    font-size: 28px;
  }

  .error-copy p {
    font-size: 13px;
  }

  .route-box,
  .helper-box {
    padding: 12px;
  }

  .error-actions {
    grid-template-columns: 1fr;
  }

  .error-footer {
    margin-top: 23px;
    font-size: 8px;
  }
}

@media (max-width: 390px) {
  .error-visual__footer {
    display: none;
  }

  .error-visual__content {
    grid-template-columns: 1fr auto;
    grid-template-rows: 1fr;
    align-items: center;
  }

  .error-kicker {
    grid-row: 1;
    align-self: start;
  }

  .error-code-wrap {
    grid-row: 1;
  }
}
</style>
