<template>
  <div class="recovery-page">
    <!-- ══════════════════════════════════════════════
         CONTEXTO / IDENTIDADE
         ══════════════════════════════════════════════ -->
    <section class="recovery-hero" aria-label="Recuperação de acesso Artezza">
      <div class="recovery-hero__grid" aria-hidden="true" />
      <div class="recovery-hero__glow recovery-hero__glow--orange" aria-hidden="true" />
      <div class="recovery-hero__glow recovery-hero__glow--blue" aria-hidden="true" />

      <svg class="recovery-hero__lines" aria-hidden="true" viewBox="0 0 900 900" preserveAspectRatio="none">
        <path d="M-70 640 C145 490 315 720 520 550 C700 400 775 455 970 305" />
        <path d="M-90 745 C170 570 350 795 565 635 C735 508 835 520 985 405" />
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
            RECUPERAÇÃO DE ACESSO
          </div>

          <h1 class="hero-title">
            Volte ao sistema<br />
            com <span>segurança.</span>
          </h1>

          <p class="hero-description">
            Confirme sua identidade, valide o código recebido e defina uma nova senha para continuar acessando o Portal Artezza.
          </p>
        </div>

        <div class="security-card">
          <div class="security-card__head">
            <div>
              <span class="security-card__eyebrow">PROCESSO SEGURO</span>
              <strong>Recupere seu acesso em poucos passos</strong>
            </div>
            <q-icon name="verified_user" size="21px" />
          </div>

          <div class="recovery-steps">
            <div
              v-for="(item, index) in recoverySteps"
              :key="item.label"
              class="recovery-step"
              :class="{
                'recovery-step--active': etapa === item.stage,
                'recovery-step--done': etapa > item.stage,
              }"
            >
              <div class="recovery-step__marker">
                <q-icon v-if="etapa > item.stage" name="check" size="16px" />
                <span v-else>{{ String(index + 1).padStart(2, '0') }}</span>
              </div>
              <div class="recovery-step__copy">
                <strong>{{ item.label }}</strong>
                <span>{{ item.description }}</span>
              </div>
            </div>
          </div>
        </div>

        <footer class="hero-footer">
          <q-icon name="lock" size="16px" />
          <span>Seus dados são utilizados somente para validar sua identidade e recuperar o acesso.</span>
        </footer>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════
         FORMULÁRIO
         ══════════════════════════════════════════════ -->
    <main class="recovery-access">
      <div class="recovery-access__glow" aria-hidden="true" />

      <div class="access-shell">
        <!-- Marca para tablet/celular -->
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

        <div class="recovery-card">
          <div class="recovery-card__accent" aria-hidden="true" />

          <div class="recovery-card__topline">
            <span class="access-kicker">ETAPA {{ etapa }} DE 2</span>
            <div class="secure-pill">
              <q-icon name="lock" size="13px" />
              Ambiente seguro
            </div>
          </div>

          <div class="form-heading">
            <div class="form-heading__icon">
              <q-icon :name="etapa === 1 ? 'person_search' : 'key'" size="22px" />
            </div>
            <div>
              <h2 class="form-title">
                {{ etapa === 1 ? 'Recuperar acesso' : 'Criar nova senha' }}
              </h2>
              <p class="form-sub">
                {{ etapa === 1
                  ? 'Informe um dos dados abaixo para localizarmos a sua conta.'
                  : 'Digite o código recebido e escolha uma nova senha para sua conta.'
                }}
              </p>
            </div>
          </div>

          <transition name="step-fade" mode="out-in">
            <!-- ── ETAPA 1 ── -->
            <q-form
              v-if="etapa === 1"
              key="step1"
              class="recovery-form"
              greedy
              @submit.prevent="solicitarCodigo"
            >
              <div class="field-group">
                <label class="field-label" for="recovery-email">E-mail cadastrado</label>
                <q-input
                  id="recovery-email"
                  v-model="email"
                  class="recovery-input"
                  type="email"
                  placeholder="seu@email.com"
                  outlined
                  dark
                  color="orange"
                  hide-bottom-space
                  autocomplete="email"
                  :disable="cpfPreenchido"
                >
                  <template #prepend>
                    <q-icon name="mail_outline" size="19px" />
                  </template>
                </q-input>
              </div>

              <div class="or-divider" aria-hidden="true">
                <span>OU</span>
              </div>

              <div class="field-group">
                <label class="field-label" for="recovery-document">CPF ou CNPJ</label>
                <q-input
                  id="recovery-document"
                  v-model="cpf"
                  class="recovery-input"
                  type="text"
                  inputmode="numeric"
                  placeholder="Digite apenas os números"
                  outlined
                  dark
                  color="orange"
                  hide-bottom-space
                  autocomplete="off"
                  :disable="emailPreenchido"
                >
                  <template #prepend>
                    <q-icon name="badge" size="19px" />
                  </template>
                </q-input>
              </div>

              <div class="helper-note">
                <q-icon name="info_outline" size="16px" />
                <span v-if="emailPreenchido">CPF/CNPJ bloqueado enquanto o e-mail estiver preenchido.</span>
                <span v-else-if="cpfPreenchido">E-mail bloqueado enquanto o CPF/CNPJ estiver preenchido.</span>
                <span v-else>Você só precisa preencher <strong>um</strong> dos identificadores acima.</span>
              </div>

              <q-btn
                type="submit"
                unelevated
                no-caps
                :loading="loading"
                class="primary-btn full-width"
              >
                <span>Enviar código de recuperação</span>
                <q-icon v-if="!loading" name="arrow_forward" size="19px" class="q-ml-sm" />

                <template #loading>
                  <q-spinner-tail color="white" size="1.2em" />
                  <span class="q-ml-sm">Localizando conta...</span>
                </template>
              </q-btn>

              <q-btn
                flat
                no-caps
                icon="arrow_back"
                label="Voltar para o login"
                to="/login"
                class="back-btn full-width"
              />
            </q-form>

            <!-- ── ETAPA 2 ── -->
            <q-form
              v-else
              key="step2"
              class="recovery-form recovery-form--step2"
              greedy
              @submit.prevent="redefinirSenhaLocal"
            >
              <div class="sent-banner">
                <div class="sent-banner__icon">
                  <q-icon name="mark_email_read" size="19px" />
                </div>
                <div>
                  <span>Código enviado com sucesso</span>
                  <strong>{{ emailMascarado }}</strong>
                </div>
              </div>

              <div class="field-group">
                <label class="field-label" for="recovery-code">Código de 6 dígitos</label>
                <q-input
                  id="recovery-code"
                  v-model="codigo"
                  class="recovery-input recovery-input--code"
                  type="text"
                  inputmode="numeric"
                  mask="######"
                  placeholder="000000"
                  outlined
                  dark
                  color="orange"
                  hide-bottom-space
                  autocomplete="one-time-code"
                  :rules="[val => (val && val.length === 6) || 'Digite os 6 dígitos']"
                >
                  <template #prepend>
                    <q-icon name="pin" size="19px" />
                  </template>
                </q-input>
              </div>

              <div class="field-group">
                <label class="field-label" for="new-password">Nova senha</label>
                <q-input
                  id="new-password"
                  v-model="novaSenha"
                  class="recovery-input"
                  :type="showNovaSenha ? 'text' : 'password'"
                  placeholder="Crie uma senha forte"
                  outlined
                  dark
                  color="orange"
                  hide-bottom-space
                  autocomplete="new-password"
                  :rules="[
                    val => !!val || 'Informe a nova senha',
                    val => senhaAtendePolitica(val) || 'A senha ainda não atende a todos os requisitos',
                  ]"
                >
                  <template #prepend>
                    <q-icon name="lock_outline" size="19px" />
                  </template>
                  <template #append>
                    <q-btn
                      flat
                      round
                      dense
                      :icon="showNovaSenha ? 'visibility_off' : 'visibility'"
                      class="password-toggle"
                      :aria-label="showNovaSenha ? 'Ocultar nova senha' : 'Exibir nova senha'"
                      @click="showNovaSenha = !showNovaSenha"
                    />
                  </template>
                </q-input>
              </div>

              <div class="field-group">
                <label class="field-label" for="confirm-password">Confirmar nova senha</label>
                <q-input
                  id="confirm-password"
                  v-model="confirmarSenha"
                  class="recovery-input"
                  :type="showConfirmarSenha ? 'text' : 'password'"
                  placeholder="Repita a nova senha"
                  outlined
                  dark
                  color="orange"
                  hide-bottom-space
                  autocomplete="new-password"
                  :rules="[
                    val => !!val || 'Confirme sua senha',
                    val => val === novaSenha || 'As senhas não coincidem',
                  ]"
                >
                  <template #prepend>
                    <q-icon name="verified" size="19px" />
                  </template>
                  <template #append>
                    <q-btn
                      flat
                      round
                      dense
                      :icon="showConfirmarSenha ? 'visibility_off' : 'visibility'"
                      class="password-toggle"
                      :aria-label="showConfirmarSenha ? 'Ocultar confirmação' : 'Exibir confirmação'"
                      @click="showConfirmarSenha = !showConfirmarSenha"
                    />
                  </template>
                </q-input>
              </div>

              <div class="password-requirements">
                <div class="password-requirements__head">
                  <q-icon name="shield" size="15px" />
                  <span>A nova senha deve conter:</span>
                </div>

                <div class="password-requirements__grid">
                  <div
                    v-for="criterio in criteriosSenha"
                    :key="criterio.key"
                    class="password-requirement"
                    :class="{ 'password-requirement--ok': criterio.ok }"
                  >
                    <q-icon
                      :name="criterio.ok ? 'check_circle' : 'radio_button_unchecked'"
                      size="14px"
                    />
                    <span>{{ criterio.label }}</span>
                  </div>
                </div>
              </div>

              <q-btn
                type="submit"
                unelevated
                no-caps
                :loading="loading"
                class="primary-btn full-width"
              >
                <span>Salvar nova senha</span>
                <q-icon v-if="!loading" name="check" size="19px" class="q-ml-sm" />

                <template #loading>
                  <q-spinner-tail color="white" size="1.2em" />
                  <span class="q-ml-sm">Alterando senha...</span>
                </template>
              </q-btn>

              <q-btn
                flat
                no-caps
                icon="arrow_back"
                label="Alterar identificação"
                class="back-btn full-width"
                @click="etapa = 1"
              />
            </q-form>
          </transition>

          <div class="support-note">
            <q-icon name="shield" size="15px" />
            <span>Nunca compartilhe o código de recuperação recebido por e-mail.</span>
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()
const router = useRouter()

// Mantém a mesma identidade visual da tela de login antes de carregar preferências do usuário.
$q.dark.set(true)

const etapa = ref(1)
const loading = ref(false)

const email = ref('')
const cpf = ref('')
const emailMascarado = ref('')
const emailConta = ref('')
const codigo = ref('')
const novaSenha = ref('')
const confirmarSenha = ref('')

const showNovaSenha = ref(false)
const showConfirmarSenha = ref(false)

const currentYear = new Date().getFullYear()

function senhaAtendePolitica(valor) {
  const senha = String(valor || '')

  return (
    senha.length >= 8 &&
    /[a-z]/.test(senha) &&
    /[A-Z]/.test(senha) &&
    /\d/.test(senha) &&
    /[^A-Za-z0-9\s]/.test(senha)
  )
}

const criteriosSenha = computed(() => {
  const senha = String(novaSenha.value || '')

  return [
    {
      key: 'tamanho',
      label: '8 caracteres ou mais',
      ok: senha.length >= 8,
    },
    {
      key: 'minuscula',
      label: '1 letra minúscula',
      ok: /[a-z]/.test(senha),
    },
    {
      key: 'maiuscula',
      label: '1 letra maiúscula',
      ok: /[A-Z]/.test(senha),
    },
    {
      key: 'numero',
      label: '1 número',
      ok: /\d/.test(senha),
    },
    {
      key: 'especial',
      label: '1 caractere especial',
      ok: /[^A-Za-z0-9\s]/.test(senha),
    },
  ]
})

const senhaValida = computed(() =>
  senhaAtendePolitica(novaSenha.value)
)

// Mantém os identificadores mutuamente exclusivos:
// ao preencher um deles, o outro fica bloqueado até o campo ativo ser limpo.
const emailPreenchido = computed(() => email.value.trim().length > 0)
const cpfPreenchido = computed(() => cpf.value.trim().length > 0)

const recoverySteps = [
  {
    stage: 1,
    label: 'Identifique sua conta',
    description: 'Use seu e-mail ou CPF/CNPJ cadastrado.',
  },
  {
    stage: 2,
    label: 'Valide e redefina',
    description: 'Confirme o código e escolha uma nova senha.',
  },
]

const solicitarCodigo = async () => {
  if (!email.value && !cpf.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, preencha o seu E-mail OU o seu CPF/CNPJ.',
      position: 'top',
    })
    return
  }

  loading.value = true

  // Os campos são mutuamente exclusivos na interface; envia somente o identificador preenchido.
  const identificadorParaEnviar = email.value.trim() || cpf.value.trim()

  try {
    const response = await api.post('/resetsenha', {
      identificador: identificadorParaEnviar,
    })

    if (response.data.success) {
      emailMascarado.value = response.data.emailMascarado || 'seu e-mail'

      // Guarda o e-mail completo para preencher automaticamente a tela de login.
      // Se a recuperação foi iniciada por CPF/CNPJ, utiliza o e-mail retornado pela API, quando disponível.
      emailConta.value = response.data.email || (email.value.includes('@') ? email.value.trim() : '')

      $q.notify({
        type: 'positive',
        message: 'Verifique sua caixa de entrada!',
        position: 'top',
      })

      etapa.value = 2
    }
  } catch (error) {
    const msg = error.response?.data?.message || 'Erro ao localizar usuário.'
    $q.notify({ type: 'negative', message: msg, position: 'top' })
  } finally {
    loading.value = false
  }
}

const redefinirSenhaLocal = async () => {
  if (String(codigo.value || '').length !== 6) {
    $q.notify({
      type: 'warning',
      message: 'Digite o código de recuperação com 6 dígitos.',
      position: 'top',
    })
    return
  }

  if (!senhaValida.value) {
    $q.notify({
      type: 'warning',
      message: 'A nova senha ainda não atende a todos os requisitos de segurança.',
      position: 'top',
    })
    return
  }

  if (confirmarSenha.value !== novaSenha.value) {
    $q.notify({
      type: 'warning',
      message: 'A confirmação da senha não coincide com a nova senha.',
      position: 'top',
    })
    return
  }

  loading.value = true

  const identificadorParaEnviar = email.value.trim() || cpf.value.trim()

  try {
    const response = await api.post('/redefinir-senha', {
      identificador: identificadorParaEnviar,
      codigo: codigo.value,
      novaSenha: novaSenha.value,
    })

    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: 'Senha redefinida com sucesso! Faça login.',
        position: 'top',
      })

      const emailParaLogin = emailConta.value || (email.value.includes('@') ? email.value.trim() : '')

      router.push({
        path: '/login',
        query: emailParaLogin ? { email: emailParaLogin } : {},
      })
    }
  } catch (error) {
    const msg = error.response?.data?.message || 'Erro ao redefinir senha.'
    $q.notify({ type: 'negative', message: msg, position: 'top' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ════════════════════════════════════════════════
   BASE
   ════════════════════════════════════════════════ */
.recovery-page {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(470px, .78fr);
  overflow: hidden;
  background: #070a10;
  color: #fff;
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
  flex: 0 0 auto;
  color: #ff7b00;
  background: rgba(255, 123, 0, .1);
  border: 1px solid rgba(255, 123, 0, .24);
  box-shadow: 0 10px 28px -16px rgba(255, 123, 0, .85);
}

.brand__icon--hero {
  width: 54px;
  height: 54px;
  color: #fff;
  background: linear-gradient(135deg, #ffab30 0%, #ff7b00 58%, #e35d00 100%);
  border-color: rgba(255,255,255,.14);
  box-shadow: 0 14px 34px -10px rgba(255,123,0,.62), 0 0 0 5px rgba(255,123,0,.08);
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
  color: rgba(255,255,255,.42);
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
   PAINEL ESQUERDO
   ════════════════════════════════════════════════ */
.recovery-hero {
  position: relative;
  min-width: 0;
  display: flex;
  overflow: hidden;
  border-right: 1px solid rgba(255,255,255,.065);
  background: linear-gradient(145deg, rgba(21,29,48,.98) 0%, rgba(9,13,24,.99) 50%, #05080e 100%);
}

.recovery-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, transparent 68%, rgba(255,123,0,.025) 100%);
}

.recovery-hero__grid {
  position: absolute;
  inset: 0;
  opacity: .55;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to bottom, rgba(0,0,0,.9), transparent 92%);
}

.recovery-hero__lines {
  position: absolute;
  left: -7%;
  bottom: -8%;
  width: 115%;
  height: 82%;
  fill: none;
  stroke: rgba(255,123,0,.115);
  stroke-width: 1.2;
  pointer-events: none;
}

.recovery-hero__glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  pointer-events: none;
}

.recovery-hero__glow--orange {
  width: 500px;
  height: 500px;
  right: -180px;
  top: 18%;
  background: radial-gradient(circle, rgba(255,123,0,.17) 0%, transparent 68%);
}

.recovery-hero__glow--blue {
  width: 440px;
  height: 440px;
  left: -190px;
  bottom: -190px;
  background: radial-gradient(circle, rgba(56,91,178,.12) 0%, transparent 70%);
}

.hero-content {
  position: relative;
  z-index: 2;
  width: min(720px, 100%);
  min-height: 100%;
  padding: clamp(38px, 5vw, 68px) clamp(44px, 6vw, 84px);
  display: flex;
  flex-direction: column;
}

.hero-copy {
  margin-top: auto;
  padding-top: 52px;
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
  box-shadow: 0 0 0 5px rgba(255,123,0,.11);
}

.hero-title {
  max-width: 650px;
  margin: 0;
  color: #f8f9fc;
  font-family: 'Space Grotesk', 'DM Sans', sans-serif;
  font-size: clamp(38px, 4.15vw, 61px);
  line-height: 1.04;
  font-weight: 700;
  letter-spacing: -2.3px;
}

.hero-title span {
  position: relative;
  color: #ff7b00;
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
  background: linear-gradient(90deg, #ff7b00 0%, rgba(255,123,0,.16) 76%, transparent 100%);
}

.hero-description {
  max-width: 570px;
  margin: 25px 0 0;
  color: rgba(219,224,234,.58);
  font-size: 14.5px;
  line-height: 1.75;
}

.security-card {
  width: 100%;
  margin-top: clamp(34px, 5.4vh, 58px);
  padding: 20px 22px;
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,.085);
  background: linear-gradient(135deg, rgba(255,255,255,.057), rgba(255,255,255,.024));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.025), 0 24px 60px -40px rgba(0,0,0,.9);
  backdrop-filter: blur(18px);
}

.security-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.security-card__head > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.security-card__eyebrow {
  color: #ff8a18;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 1.7px;
}

.security-card__head strong {
  color: rgba(255,255,255,.9);
  font-size: 13px;
  font-weight: 700;
}

.security-card__head :deep(.q-icon) {
  color: rgba(255,123,0,.7);
}

.recovery-steps {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.recovery-step {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.055);
  background: rgba(3,6,11,.24);
  transition: border-color .2s ease, background .2s ease;
}

.recovery-step__marker {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: rgba(255,255,255,.34);
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.065);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .8px;
}

.recovery-step__copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.recovery-step__copy strong {
  color: rgba(255,255,255,.62);
  font-size: 10.5px;
  font-weight: 700;
}

.recovery-step__copy span {
  color: rgba(255,255,255,.28);
  font-size: 9px;
  line-height: 1.4;
}

.recovery-step--active {
  border-color: rgba(255,123,0,.18);
  background: rgba(255,123,0,.055);
}

.recovery-step--active .recovery-step__marker {
  color: #ff9a24;
  border-color: rgba(255,123,0,.2);
  background: rgba(255,123,0,.1);
}

.recovery-step--active .recovery-step__copy strong {
  color: rgba(255,255,255,.9);
}

.recovery-step--done .recovery-step__marker {
  color: #8ee5ae;
  border-color: rgba(34,197,94,.2);
  background: rgba(34,197,94,.08);
}

.hero-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 27px;
  color: rgba(255,255,255,.29);
  font-size: 10px;
  line-height: 1.45;
}

.hero-footer :deep(.q-icon) {
  color: rgba(255,123,0,.66);
  flex: 0 0 auto;
}

/* ════════════════════════════════════════════════
   ÁREA DO FORMULÁRIO
   ════════════════════════════════════════════════ */
.recovery-access {
  position: relative;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 38px clamp(28px, 4vw, 58px);
  background:
    radial-gradient(circle at 90% 12%, rgba(255,123,0,.065), transparent 29%),
    #090c12;
}

.recovery-access::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .42;
  background-image: radial-gradient(circle, rgba(255,255,255,.045) 1px, transparent 1px);
  background-size: 30px 30px;
  mask-image: linear-gradient(130deg, transparent 3%, #000 42%, transparent 92%);
}

.recovery-access__glow {
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  left: 10%;
  bottom: -225px;
  background: radial-gradient(circle, rgba(40,69,135,.11) 0%, transparent 70%);
  pointer-events: none;
}

.access-shell {
  position: relative;
  z-index: 1;
  width: min(455px, 100%);
}

.recovery-card {
  position: relative;
  overflow: hidden;
  padding: 30px;
  border-radius: 26px;
  border: 1px solid rgba(255,255,255,.085);
  background: linear-gradient(155deg, rgba(20,25,36,.94), rgba(13,17,25,.97));
  box-shadow: 0 34px 80px -35px rgba(0,0,0,.95), inset 0 1px 0 rgba(255,255,255,.025);
  backdrop-filter: blur(20px);
}

.recovery-card__accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #ff7b00 0%, #ffab30 28%, rgba(255,123,0,.12) 68%, transparent 100%);
}

.recovery-card__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 23px;
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

.form-heading {
  display: flex;
  align-items: flex-start;
  gap: 13px;
}

.form-heading__icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: #ff8a18;
  background: rgba(255,123,0,.085);
  border: 1px solid rgba(255,123,0,.14);
}

.form-title {
  margin: 0;
  color: #f6f7fa;
  font-family: 'Space Grotesk', 'DM Sans', sans-serif;
  font-size: 26px;
  line-height: 1.13;
  font-weight: 700;
  letter-spacing: -.65px;
}

.form-sub {
  margin: 7px 0 0;
  color: rgba(205,211,223,.48);
  font-size: 12px;
  line-height: 1.55;
}

.recovery-form {
  margin-top: 24px;
}

.field-group + .field-group {
  margin-top: 14px;
}

.field-label {
  display: block;
  margin: 0 0 7px;
  color: rgba(230,233,239,.64);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.1px;
  text-transform: uppercase;
}

/* Inputs Quasar */
.recovery-input :deep(.q-field__control) {
  min-height: 49px;
  border-radius: 13px !important;
  background: rgba(3,6,11,.4);
  color: #f5f6f9;
  transition: background .18s ease, box-shadow .18s ease;
}

.recovery-input :deep(.q-field__control::before) {
  border-color: rgba(255,255,255,.10) !important;
}

.recovery-input :deep(.q-field__control:hover::before) {
  border-color: rgba(255,255,255,.18) !important;
}

.recovery-input.q-field--focused :deep(.q-field__control) {
  background: rgba(4,7,12,.72);
  box-shadow: 0 0 0 3px rgba(255,123,0,.07);
}

.recovery-input.q-field--focused :deep(.q-field__control::after) {
  border-color: #ff7b00 !important;
  border-width: 1px !important;
}

.recovery-input :deep(.q-field__native),
.recovery-input :deep(.q-field__input) {
  color: rgba(255,255,255,.9) !important;
  font-size: 13px;
  font-weight: 500;
}

.recovery-input :deep(.q-field__native::placeholder),
.recovery-input :deep(.q-field__input::placeholder) {
  color: rgba(255,255,255,.25) !important;
  opacity: 1;
}

.recovery-input :deep(.q-field__prepend),
.recovery-input :deep(.q-field__append) {
  color: rgba(255,255,255,.32);
}

.recovery-input :deep(.q-field__prepend) {
  padding-right: 11px;
}

.recovery-input.q-field--focused :deep(.q-field__prepend) {
  color: #ff8a18;
}

.recovery-input :deep(.q-field__bottom) {
  padding: 5px 4px 0;
  color: #ff8a80;
  font-size: 10.5px;
}

.recovery-input.q-field--disabled {
  opacity: .48;
}

.recovery-input.q-field--disabled :deep(.q-field__control) {
  cursor: not-allowed;
  background: rgba(255,255,255,.025);
}

.recovery-input.q-field--disabled :deep(.q-field__control::before) {
  border-color: rgba(255,255,255,.07);
}

.recovery-input.q-field--disabled :deep(.q-field__native),
.recovery-input.q-field--disabled :deep(.q-field__input),
.recovery-input.q-field--disabled :deep(.q-field__prepend) {
  cursor: not-allowed;
}

.recovery-input--code :deep(.q-field__native),
.recovery-input--code :deep(.q-field__input) {
  letter-spacing: 4px;
  font-size: 15px;
  font-weight: 800;
}

.password-toggle {
  color: rgba(255,255,255,.36) !important;
  transition: color .18s ease, background .18s ease;
}

.password-toggle:hover {
  color: #ff8a18 !important;
  background: rgba(255,123,0,.08) !important;
}

.or-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 0;
  color: rgba(255,255,255,.25);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
}

.or-divider::before,
.or-divider::after {
  content: '';
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.085));
}

.or-divider::after {
  background: linear-gradient(90deg, rgba(255,255,255,.085), transparent);
}

.helper-note,
.helper-note :deep(.q-icon) {
  color: rgba(255,123,0,.58);
}

.helper-note strong {
  color: rgba(255,255,255,.55);
  font-weight: 700;
}

.password-requirements {
  margin-top: 13px;
  padding: 10px 11px;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 12px;
  background: rgba(255,255,255,.025);
}

.password-requirements__head {
  display: flex;
  align-items: center;
  gap: 7px;
  color: rgba(255,255,255,.42);
  font-size: 9px;
  font-weight: 700;
}

.password-requirements__head :deep(.q-icon) {
  color: rgba(255,123,0,.68);
}

.password-requirements__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 12px;
  margin-top: 8px;
}

.password-requirement {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255,255,255,.3);
  font-size: 8.8px;
  line-height: 1.3;
  transition: color .18s ease;
}

.password-requirement :deep(.q-icon) {
  flex: 0 0 auto;
  color: rgba(255,255,255,.22);
  transition: color .18s ease;
}

.password-requirement--ok {
  color: rgba(142,229,174,.72);
}

.password-requirement--ok :deep(.q-icon) {
  color: #65c88a;
}

.sent-banner {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 17px;
  padding: 11px 12px;
  border-radius: 12px;
  border: 1px solid rgba(34,197,94,.16);
  background: rgba(34,197,94,.06);
}

.sent-banner__icon {
  width: 31px;
  height: 31px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  color: #75d898;
  background: rgba(34,197,94,.08);
}

.sent-banner > div:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sent-banner span {
  color: rgba(179,232,197,.54);
  font-size: 9.5px;
}

.sent-banner strong {
  overflow: hidden;
  color: rgba(220,247,229,.88);
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Ações */
.primary-btn {
  min-height: 49px;
  margin-top: 18px;
  border-radius: 13px !important;
  color: #fff !important;
  background: linear-gradient(135deg, #ff9a24 0%, #ff7b00 56%, #ee6600 100%) !important;
  box-shadow: 0 16px 30px -15px rgba(255,123,0,.72) !important;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .15px;
  transition: transform .16s ease, box-shadow .16s ease, filter .16s ease;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.04);
  box-shadow: 0 20px 34px -15px rgba(255,123,0,.85) !important;
}

.back-btn {
  min-height: 37px;
  margin-top: 8px;
  border-radius: 11px !important;
  color: rgba(255,255,255,.38) !important;
  font-size: 10.5px;
  font-weight: 600;
  transition: color .18s ease, background .18s ease;
}

.back-btn:hover {
  color: #ff8a18 !important;
  background: rgba(255,123,0,.045) !important;
}

.support-note {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 15px;
  padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,.06);
  color: rgba(255,255,255,.25);
  font-size: 9.3px;
  line-height: 1.4;
}

.support-note :deep(.q-icon) {
  color: rgba(255,123,0,.52);
  flex: 0 0 auto;
}

.form-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 17px;
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

/* Transição entre etapas */
.step-fade-enter-active {
  transition: opacity .25s ease, transform .25s ease;
}

.step-fade-leave-active {
  transition: opacity .16s ease, transform .16s ease;
}

.step-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.step-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* ════════════════════════════════════════════════
   RESPONSIVO / ALTURAS DE NOTEBOOK
   ════════════════════════════════════════════════ */
@media (min-width: 921px) and (max-height: 820px) {
  .hero-content {
    padding-top: 28px;
    padding-bottom: 25px;
  }

  .brand__icon--hero {
    width: 48px;
    height: 48px;
  }

  .hero-copy {
    padding-top: 24px;
  }

  .eyebrow {
    margin-bottom: 12px;
  }

  .hero-title {
    font-size: clamp(35px, 3.65vw, 50px);
    line-height: 1.02;
  }

  .hero-description {
    margin-top: 16px;
    font-size: 12.7px;
    line-height: 1.55;
  }

  .security-card {
    margin-top: 23px;
    padding: 15px 17px;
    border-radius: 18px;
  }

  .security-card__head {
    margin-bottom: 12px;
  }

  .recovery-step {
    padding: 9px 10px;
  }

  .recovery-step__marker {
    width: 30px;
    height: 30px;
  }

  .hero-footer {
    padding-top: 15px;
  }

  .recovery-access {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .recovery-card {
    padding: 23px 26px;
    border-radius: 22px;
  }

  .recovery-card__topline {
    margin-bottom: 16px;
  }

  .form-heading__icon {
    width: 38px;
    height: 38px;
  }

  .form-title {
    font-size: 23px;
  }

  .form-sub {
    margin-top: 4px;
    line-height: 1.4;
  }

  .recovery-form {
    margin-top: 17px;
  }

  .field-group + .field-group {
    margin-top: 10px;
  }

  .field-label {
    margin-bottom: 5px;
  }

  .recovery-input :deep(.q-field__control) {
    min-height: 44px;
  }

  .or-divider {
    margin: 10px 0;
  }

  .helper-note {
    margin-top: 9px;
  }

  .password-requirements {
    margin-top: 9px;
    padding: 8px 9px;
  }

  .password-requirements__grid {
    gap: 5px 9px;
    margin-top: 6px;
  }

  .sent-banner {
    margin-bottom: 12px;
    padding: 8px 10px;
  }

  .primary-btn {
    min-height: 44px;
    margin-top: 12px;
  }

  .back-btn {
    min-height: 32px;
    margin-top: 5px;
  }

  .support-note {
    margin-top: 9px;
    padding-top: 9px;
  }

  .form-footer {
    margin-top: 9px;
  }
}

@media (min-width: 921px) and (max-height: 700px) {
  .hero-content {
    padding-top: 18px;
    padding-bottom: 17px;
  }

  .brand__icon--hero {
    width: 43px;
    height: 43px;
  }

  .brand__name {
    font-size: 18px;
  }

  .hero-copy {
    padding-top: 10px;
  }

  .hero-title {
    font-size: clamp(31px, 3.15vw, 43px);
  }

  .hero-description {
    margin-top: 11px;
    font-size: 11.5px;
    line-height: 1.42;
  }

  .security-card {
    margin-top: 15px;
    padding: 11px 13px;
  }

  .security-card__head {
    margin-bottom: 8px;
  }

  .recovery-step {
    padding: 7px 8px;
    gap: 8px;
  }

  .recovery-step__marker {
    width: 27px;
    height: 27px;
  }

  .recovery-step__copy span {
    display: none;
  }

  .hero-footer {
    padding-top: 8px;
    font-size: 8.8px;
  }

  .recovery-access {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .recovery-card {
    padding: 17px 22px;
  }

  .recovery-card__topline {
    margin-bottom: 10px;
  }

  .form-heading {
    gap: 10px;
  }

  .form-heading__icon {
    width: 34px;
    height: 34px;
  }

  .form-title {
    font-size: 21px;
  }

  .form-sub {
    margin-top: 3px;
    font-size: 10.8px;
    line-height: 1.32;
  }

  .recovery-form {
    margin-top: 12px;
  }

  .field-group + .field-group {
    margin-top: 7px;
  }

  .field-label {
    margin-bottom: 3px;
    font-size: 9px;
  }

  .recovery-input :deep(.q-field__control) {
    min-height: 40px;
  }

  .or-divider {
    margin: 7px 0;
  }

  .helper-note {
    margin-top: 6px;
    font-size: 8.8px;
  }

  .password-requirements {
    margin-top: 6px;
    padding: 6px 8px;
  }

  .password-requirements__head {
    font-size: 8.2px;
  }

  .password-requirements__grid {
    gap: 4px 8px;
    margin-top: 5px;
  }

  .password-requirement {
    font-size: 8px;
  }

  .sent-banner {
    margin-bottom: 8px;
    padding: 6px 9px;
  }

  .sent-banner__icon {
    width: 27px;
    height: 27px;
  }

  .primary-btn {
    min-height: 40px;
    margin-top: 8px;
  }

  .back-btn {
    min-height: 28px;
    margin-top: 3px;
  }

  .support-note {
    margin-top: 6px;
    padding-top: 6px;
    font-size: 8.5px;
  }

  .form-footer {
    margin-top: 5px;
    font-size: 8.5px;
  }
}

@media (max-width: 1180px) {
  .recovery-page {
    grid-template-columns: minmax(0, 1fr) minmax(430px, .8fr);
  }

  .hero-content {
    padding-left: 45px;
    padding-right: 45px;
  }

  .hero-title {
    font-size: clamp(36px, 4vw, 50px);
  }

  .recovery-steps {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 920px) {
  .recovery-page {
    display: block;
    min-height: 100dvh;
    overflow: auto;
  }

  .recovery-hero {
    display: none;
  }

  .recovery-access {
    min-height: 100dvh;
    padding: 34px 24px;
    align-items: center;
    background:
      radial-gradient(circle at 88% 10%, rgba(255,123,0,.11), transparent 30%),
      radial-gradient(circle at 8% 92%, rgba(39,69,141,.11), transparent 34%),
      #080b11;
  }

  .brand--mobile {
    display: flex;
    width: max-content;
    margin: 0 auto 24px;
  }

  .access-shell {
    width: min(470px, 100%);
  }
}

@media (max-width: 520px) {
  .password-requirements__grid {
    grid-template-columns: 1fr;
  }

  .recovery-access {
    padding: 25px 15px;
    align-items: flex-start;
  }

  .brand--mobile {
    margin-top: 3px;
    margin-bottom: 20px;
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

  .recovery-card {
    padding: 23px 19px;
    border-radius: 21px;
  }

  .recovery-card__topline {
    margin-bottom: 19px;
  }

  .form-heading__icon {
    width: 39px;
    height: 39px;
  }

  .form-title {
    font-size: 23px;
  }

  .form-sub {
    font-size: 11.2px;
  }

  .recovery-form {
    margin-top: 21px;
  }

  .recovery-input :deep(.q-field__control) {
    min-height: 47px;
  }
}

@media (max-width: 360px) {
  .secure-pill {
    display: none;
  }

  .recovery-card__topline {
    justify-content: flex-start;
  }

  .form-heading__icon {
    display: none;
  }
}
</style>
