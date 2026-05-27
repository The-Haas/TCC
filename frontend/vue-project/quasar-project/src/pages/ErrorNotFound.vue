<template>
  <div class="not-found" :class="isDark ? 'nf-dark' : 'nf-light'">

    <!-- Fundo decorativo -->
    <div class="nf-bg" aria-hidden="true">
      <div class="nf-blob nf-blob--1" />
      <div class="nf-blob nf-blob--2" />
      <div class="dot-grid" />
    </div>

    <!-- Linhas diagonais -->
    <svg class="diag-lines" aria-hidden="true" viewBox="0 0 800 600" preserveAspectRatio="none">
      <line x1="0"   y1="100" x2="800" y2="400" stroke="rgba(255,123,0,.04)" stroke-width="1"/>
      <line x1="0"   y1="300" x2="800" y2="600" stroke="rgba(255,123,0,.04)" stroke-width="1"/>
      <line x1="200" y1="0"   x2="600" y2="600" stroke="rgba(255,123,0,.03)" stroke-width="1"/>
    </svg>

    <!-- Conteúdo central -->
    <div class="nf-content">

      <!-- Logo Artezza -->
      <div class="nf-brand">
        <div class="nf-brand__icon">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
            <path d="M24 6 L6 38 H14 L18 30 H30 L34 38 H42 Z" fill="none" stroke="#ff7b00" stroke-width="3" stroke-linejoin="round"/>
            <path d="M20 24 H28" stroke="#ff7b00" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="24" cy="6" r="2" fill="#ff7b00"/>
          </svg>
        </div>
        <span class="nf-brand__name">ARTEZZA</span>
      </div>

      <!-- 404 glitch -->
      <div class="nf-code" :data-text="'404'" aria-hidden="true">404</div>

      <!-- Texto -->
      <h1 class="nf-title" :class="isDark ? 'text-white' : 'text-grey-9'">
        Página não encontrada
      </h1>
      <p class="nf-sub">
        Parece que essa página foi desmontada ou nunca existiu.<br />
        Verifique o endereço ou volte ao início.
      </p>

      <!-- Ações -->
      <div class="nf-actions">
        <button class="nf-btn nf-btn--primary" @click="goHome">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z"/>
          </svg>
          Voltar ao início
        </button>
        <button class="nf-btn nf-btn--ghost" @click="goBack">
          Página anterior
        </button>
      </div>

    </div>

    <!-- Toggle tema (canto) -->
    <button class="nf-theme-toggle" @click="toggleTheme" :title="isDark ? 'Modo claro' : 'Modo escuro'">
      <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
      </svg>
    </button>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q    = useQuasar()
const router = useRouter()

const isDark = computed(() => $q.dark.isActive)

function toggleTheme() {
  $q.dark.toggle()
  localStorage.setItem('horus_dark', $q.dark.isActive ? '1' : '0')
}

function goHome()  { router.push('/dashboard') }
function goBack()  { router.back() }
</script>

<style scoped>
/* ── Base ── */
.not-found {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
}
.nf-dark  { background: #0d1117; }
.nf-light { background: #eef1f5; }

/* ── Fundo ── */
.nf-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }

.nf-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}
.nf-blob--1 {
  width: 500px; height: 500px;
  background: rgba(255,123,0,.08);
  top: -150px; left: -100px;
}
.nf-blob--2 {
  width: 350px; height: 350px;
  background: rgba(25,118,210,.06);
  bottom: -80px; right: -60px;
}

.dot-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size: 30px 30px;
}
.nf-light .dot-grid {
  background-image: radial-gradient(circle, rgba(0,0,0,.06) 1px, transparent 1px);
}

.diag-lines {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* ── Conteúdo ── */
.nf-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 24px;
  max-width: 480px;
}

/* ── Brand ── */
.nf-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
}
.nf-brand__icon {
  width: 46px; height: 46px;
  border-radius: 12px;
  background: rgba(255,123,0,.15);
  border: 1px solid rgba(255,123,0,.3);
  display: flex; align-items: center; justify-content: center;
}
.nf-brand__name {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 5px;
  color: #ff7b00;
}

/* ── 404 com efeito glitch ── */
.nf-code {
  font-size: clamp(96px, 22vw, 160px);
  font-weight: 900;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 2px rgba(255,123,0,.25);
  letter-spacing: -4px;
  position: relative;
  margin-bottom: 8px;
  animation: float 4s ease-in-out infinite;
  user-select: none;
}

/* Camadas glitch */
.nf-code::before,
.nf-code::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  -webkit-text-stroke: 0;
}
.nf-code::before {
  color: rgba(255,123,0,.18);
  clip-path: polygon(0 30%, 100% 30%, 100% 55%, 0 55%);
  transform: translateX(-3px);
  animation: glitch-1 3.5s infinite steps(1);
}
.nf-code::after {
  color: rgba(25,118,210,.14);
  clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%);
  transform: translateX(3px);
  animation: glitch-2 3.5s infinite steps(1);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
@keyframes glitch-1 {
  0%, 90%, 100% { transform: translateX(-3px); opacity: 1; }
  92%           { transform: translateX(6px) scaleY(1.02); opacity: .8; }
  94%           { transform: translateX(-6px); }
  96%           { transform: translateX(3px); }
}
@keyframes glitch-2 {
  0%, 85%, 100% { transform: translateX(3px); opacity: 1; }
  87%           { transform: translateX(-6px) scaleY(.98); opacity: .7; }
  89%           { transform: translateX(4px); }
  91%           { transform: translateX(-2px); }
}

/* ── Ícone ferramenta ── */
.nf-icon-wrap {
  margin-bottom: 20px;
  animation: spin-slow 12s linear infinite;
  opacity: .85;
}
@keyframes spin-slow {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ── Texto ── */
.nf-title {
  font-size: clamp(20px, 4vw, 26px);
  font-weight: 800;
  margin: 0 0 10px;
}
.nf-sub {
  font-size: 14px;
  line-height: 1.65;
  color: rgba(128,128,128,.9);
  margin: 0 0 32px;
}

/* ── Botões ── */
.nf-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.nf-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 22px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: transform .15s, box-shadow .15s, background .15s;
  font-family: inherit;
}
.nf-btn:active { transform: scale(.97); }

.nf-btn--primary {
  background: #ff7b00;
  color: #fff;
  box-shadow: 0 6px 20px rgba(255,123,0,.35);
}
.nf-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(255,123,0,.48);
}

.nf-btn--ghost {
  background: transparent;
  color: rgba(128,128,128,.9);
  border: 1px solid rgba(128,128,128,.25);
}
.nf-btn--ghost:hover {
  background: rgba(128,128,128,.08);
  color: rgba(128,128,128,1);
}

/* ── Toggle tema (canto superior direito) ── */
.nf-theme-toggle {
  position: fixed;
  top: 16px; right: 16px;
  width: 36px; height: 36px;
  border-radius: 9px;
  background: rgba(128,128,128,.12);
  border: 1px solid rgba(128,128,128,.18);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: rgba(128,128,128,.8);
  transition: background .15s, color .15s;
  z-index: 10;
}
.nf-theme-toggle:hover {
  background: rgba(255,123,0,.12);
  color: #ff7b00;
  border-color: rgba(255,123,0,.3);
}

/* ── Responsivo ── */
@media (max-width: 480px) {
  .nf-actions { flex-direction: column; width: 100%; }
  .nf-btn     { justify-content: center; }
}
</style>
