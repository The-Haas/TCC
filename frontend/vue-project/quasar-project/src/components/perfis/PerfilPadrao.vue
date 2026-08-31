<template>
  <q-page class="profile-page">
    <!-- HERO -->
    <section class="profile-hero">
      <div>
        <div class="profile-eyebrow">
          <span class="profile-eyebrow__dot"></span>
          Minha conta
        </div>

        <h1 class="profile-title">
          Gerencie seus <span>dados de acesso</span>
        </h1>

        <p class="profile-subtitle">
          Mantenha seus dados de contato atualizados e altere sua senha
          sempre que necessário.
        </p>
      </div>

      <q-btn
        flat
        no-caps
        icon="arrow_back"
        label="Voltar ao dashboard"
        to="/dashboard"
        class="back-btn"
      />
    </section>

    <div class="profile-layout">
      <!-- RESUMO LATERAL -->
      <aside class="profile-sidebar">
        <article class="profile-card panel">
          <div class="profile-avatar-wrap">
            <div class="profile-avatar">
              {{ iniciaisAvatar }}
            </div>

            <span class="profile-online-dot"></span>
          </div>

          <div class="profile-card__identity">
            <strong>{{ form.nome || authStore.userName || 'Usuário' }}</strong>
            <span>{{ form.email || 'E-mail não informado' }}</span>
          </div>

          <div class="profile-role-badge">
            <q-icon :name="perfilConfig.icon" size="15px" />
            {{ perfilConfig.label }}
          </div>

          <div class="profile-card__divider"></div>

          <div class="profile-meta-list">
            <div class="profile-meta-row">
              <div class="profile-meta-icon">
                <q-icon name="badge" size="16px" />
              </div>

              <div>
                <span>Identificação</span>
                <strong>#{{ authStore.userId || '—' }}</strong>
              </div>
            </div>

            <div class="profile-meta-row">
              <div class="profile-meta-icon">
                <q-icon name="phone" size="16px" />
              </div>

              <div>
                <span>Telefone</span>
                <strong>{{ telefoneFormatado || 'Não informado' }}</strong>
              </div>
            </div>

            <div class="profile-meta-row">
              <div class="profile-meta-icon">
                <q-icon name="verified_user" size="16px" />
              </div>

              <div>
                <span>Perfil de acesso</span>
                <strong>{{ perfilConfig.label }}</strong>
              </div>
            </div>
          </div>
        </article>

        <article class="profile-nav panel">
          <button
            v-for="item in navItems"
            :key="item.name"
            type="button"
            class="profile-nav__item"
            :class="{ 'profile-nav__item--active': tab === item.name }"
            @click="tab = item.name"
          >
            <span class="profile-nav__icon">
              <q-icon :name="item.icon" size="18px" />
            </span>

            <span class="profile-nav__copy">
              <strong>{{ item.label }}</strong>
              <small>{{ item.helper }}</small>
            </span>

            <q-icon
              name="chevron_right"
              size="17px"
              class="profile-nav__chevron"
            />
          </button>
        </article>

        <article class="security-tip panel">
          <div class="security-tip__icon">
            <q-icon name="verified_user" size="19px" />
          </div>

          <div>
            <strong>Conta protegida</strong>
            <p>
              Nunca compartilhe sua senha. Alterações feitas nesta página
              afetam somente a sua própria conta.
            </p>
          </div>
        </article>
      </aside>

      <!-- CONTEÚDO -->
      <section class="profile-content panel">
        <q-inner-loading
          :showing="loadingData"
          color="orange"
          label="Carregando seu perfil..."
          label-class="loading-label"
        />

        <q-form
          ref="formPerfil"
          class="profile-form"
          @submit.prevent="salvar"
        >
          <q-tab-panels
            v-model="tab"
            class="profile-panels"
          >
            <!-- DADOS -->
            <q-tab-panel name="dados" class="profile-tab-panel">
              <div class="form-section-head">
                <div class="form-section-icon">
                  <q-icon name="person_outline" size="22px" />
                </div>

                <div>
                  <div class="section-kicker">Informações da conta</div>
                  <h2>Dados pessoais</h2>
                  <p>
                    Atualize seu nome e seus principais canais de contato.
                  </p>
                </div>
              </div>

              <div class="form-grid">
                <div class="field-block field-block--full">
                  <span class="field-label">Nome completo *</span>

                  <q-input
                    v-model="form.nome"
                    outlined
                    dense
                    color="orange"
                    class="profile-field"
                    placeholder="Seu nome completo"
                    :rules="[
                      val => !!String(val || '').trim() || 'Informe seu nome'
                    ]"
                    hide-bottom-space
                  >
                    <template #prepend>
                      <q-icon name="person_outline" size="18px" />
                    </template>
                  </q-input>
                </div>

                <div class="field-block">
                  <span class="field-label">E-mail *</span>

                  <q-input
                    v-model="form.email"
                    outlined
                    dense
                    color="orange"
                    class="profile-field"
                    type="email"
                    placeholder="seu@email.com"
                    :rules="[
                      val => !!String(val || '').trim() || 'Informe seu e-mail',
                      validarEmail
                    ]"
                    hide-bottom-space
                  >
                    <template #prepend>
                      <q-icon name="mail_outline" size="18px" />
                    </template>
                  </q-input>
                </div>

                <div class="field-block">
                  <span class="field-label">Telefone</span>

                  <q-input
                    v-model="form.telefone"
                    outlined
                    dense
                    color="orange"
                    class="profile-field"
                    mask="(##) #####-####"
                    unmasked-value
                    placeholder="(00) 00000-0000"
                    :rules="[validarTelefone]"
                    hide-bottom-space
                  >
                    <template #prepend>
                      <q-icon name="phone" size="18px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="account-info-card">
                <div class="account-info-card__icon">
                  <q-icon :name="perfilConfig.icon" size="21px" />
                </div>

                <div>
                  <strong>{{ perfilConfig.label }}</strong>
                  <p>{{ perfilConfig.description }}</p>
                </div>

                <span class="account-info-card__badge">
                  Perfil atual
                </span>
              </div>

              <div class="info-banner">
                <div class="info-banner__icon">
                  <q-icon name="info_outline" size="19px" />
                </div>

                <div>
                  <strong>Dados de contato</strong>
                  <span>
                    O e-mail e o telefone podem ser utilizados em comunicações
                    operacionais do sistema.
                  </span>
                </div>
              </div>
            </q-tab-panel>

            <!-- SEGURANÇA -->
            <q-tab-panel name="seguranca" class="profile-tab-panel">
              <div class="form-section-head">
                <div class="form-section-icon">
                  <q-icon name="shield" size="22px" />
                </div>

                <div>
                  <div class="section-kicker">Proteção da conta</div>
                  <h2>Segurança</h2>
                  <p>
                    Para manter sua senha atual, deixe os dois campos abaixo
                    vazios.
                  </p>
                </div>
              </div>

              <div class="security-layout">
                <div class="security-form">
                  <div class="field-block password-field-block">
                    <span class="field-label">Nova senha</span>

                    <q-input
                      v-model="form.senha"
                      outlined
                      dense
                      color="orange"
                      class="profile-field"
                      :type="isPwd ? 'password' : 'text'"
                      placeholder="••••••••"
                    >
                      <template #prepend>
                        <q-icon name="key" size="18px" />
                      </template>

                      <template #append>
                        <q-icon
                          :name="isPwd ? 'visibility_off' : 'visibility'"
                          class="cursor-pointer"
                          @click="isPwd = !isPwd"
                        />
                      </template>
                    </q-input>

                    <div
                      class="password-validation-slot"
                      :class="{
                        'password-validation-slot--error':
                          form.senha && !senhaValida
                      }"
                    >
                      <template v-if="form.senha && !senhaValida">
                        <q-icon name="error_outline" size="14px" />
                        <span>
                          Use 8+ caracteres com maiúscula, minúscula, número e símbolo.
                        </span>
                      </template>
                    </div>
                  </div>

                  <div class="field-block password-field-block">
                    <span class="field-label">Confirmar nova senha</span>

                    <q-input
                      v-model="confirmarSenha"
                      outlined
                      dense
                      color="orange"
                      class="profile-field"
                      :type="isPwdConfirm ? 'password' : 'text'"
                      placeholder="••••••••"
                    >
                      <template #prepend>
                        <q-icon name="lock_outline" size="18px" />
                      </template>

                      <template #append>
                        <q-icon
                          :name="isPwdConfirm ? 'visibility_off' : 'visibility'"
                          class="cursor-pointer"
                          @click="isPwdConfirm = !isPwdConfirm"
                        />
                      </template>
                    </q-input>

                    <div
                      class="password-validation-slot"
                      :class="{
                        'password-validation-slot--error':
                          form.senha &&
                          confirmarSenha &&
                          !senhasConferem
                      }"
                    >
                      <template
                        v-if="
                          form.senha &&
                          confirmarSenha &&
                          !senhasConferem
                        "
                      >
                        <q-icon name="error_outline" size="14px" />
                        <span>As senhas não coincidem.</span>
                      </template>
                    </div>
                  </div>
                </div>

                <aside class="password-rules">
                  <div class="password-rules__head">
                    <q-icon name="verified_user" size="20px" />
                    <strong>Senha segura</strong>
                  </div>

                  <p>
                    Sua nova senha deve atender a todos os critérios abaixo:
                  </p>

                  <ul>
                    <li :class="{ 'rule-ok': regraSenha.tamanho }">
                      <q-icon
                        :name="regraSenha.tamanho ? 'check_circle' : 'radio_button_unchecked'"
                      />
                      Pelo menos 8 caracteres
                    </li>

                    <li :class="{ 'rule-ok': regraSenha.maiuscula }">
                      <q-icon
                        :name="regraSenha.maiuscula ? 'check_circle' : 'radio_button_unchecked'"
                      />
                      Uma letra maiúscula
                    </li>

                    <li :class="{ 'rule-ok': regraSenha.minuscula }">
                      <q-icon
                        :name="regraSenha.minuscula ? 'check_circle' : 'radio_button_unchecked'"
                      />
                      Uma letra minúscula
                    </li>

                    <li :class="{ 'rule-ok': regraSenha.numero }">
                      <q-icon
                        :name="regraSenha.numero ? 'check_circle' : 'radio_button_unchecked'"
                      />
                      Um número
                    </li>

                    <li :class="{ 'rule-ok': regraSenha.simbolo }">
                      <q-icon
                        :name="regraSenha.simbolo ? 'check_circle' : 'radio_button_unchecked'"
                      />
                      Um símbolo
                    </li>
                  </ul>
                </aside>
              </div>
            </q-tab-panel>
          </q-tab-panels>

          <!-- AÇÕES -->
          <div class="form-actions">
            <div class="form-actions__status">
              <q-icon
                :name="temAlteracoes ? 'edit_note' : 'check_circle'"
                size="18px"
              />

              <span>
                {{
                  temAlteracoes
                    ? 'Você possui alterações ainda não salvas.'
                    : 'Seu perfil está atualizado.'
                }}
              </span>
            </div>

            <div class="form-actions__buttons">
              <q-btn
                flat
                no-caps
                label="Cancelar"
                to="/dashboard"
                class="cancel-btn"
              />

              <q-btn
                unelevated
                no-caps
                icon="save"
                label="Salvar alterações"
                type="submit"
                :loading="loadingSubmit"
                :disable="!temAlteracoes"
                class="save-btn"
              />
            </div>
          </div>
        </q-form>
      </section>
    </div>

    <!-- CONFIRMAÇÃO -->
    <q-dialog v-model="modalConfirmacao" persistent>
      <q-card class="confirm-dialog">
        <q-card-section class="confirm-dialog__head">
          <div class="confirm-dialog__icon">
            <q-icon name="save" size="23px" />
          </div>

          <div>
            <div class="section-kicker">Confirmar alteração</div>
            <h3>Salvar dados da conta?</h3>
          </div>
        </q-card-section>

        <q-card-section class="confirm-dialog__body">
          <p>
            As informações atualizadas substituirão os dados atuais do seu
            perfil.
          </p>

          <div class="confirm-dialog__notice">
            <q-icon name="info_outline" size="18px" />
            <span>
              Caso você tenha definido uma nova senha, ela passará a valer
              imediatamente após a confirmação.
            </span>
          </div>
        </q-card-section>

        <q-card-actions class="confirm-dialog__actions">
          <q-btn
            flat
            no-caps
            label="Continuar editando"
            class="cancel-btn"
            @click="modalConfirmacao = false"
          />

          <q-btn
            unelevated
            no-caps
            icon="check"
            label="Confirmar e salvar"
            :loading="loadingSubmit"
            class="save-btn"
            @click="confirmarSalvar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const formPerfil = ref(null)
const loadingData = ref(true)
const loadingSubmit = ref(false)

const tab = ref('dados')
const isPwd = ref(true)
const isPwdConfirm = ref(true)
const confirmarSenha = ref('')
const modalConfirmacao = ref(false)

const snapshotOriginal = ref('')

const form = ref({
  nome: '',
  email: '',
  telefone: '',
  senha: ''
})

const navItems = [
  {
    name: 'dados',
    label: 'Dados pessoais',
    helper: 'Identificação e contato',
    icon: 'person_outline'
  },
  {
    name: 'seguranca',
    label: 'Segurança',
    helper: 'Senha e proteção',
    icon: 'shield'
  }
]

const perfis = {
  admin: {
    label: 'Administrador',
    icon: 'admin_panel_settings',
    endpoint: 'admins',
    responseKey: 'admin',
    description:
      'Perfil com acesso às funções administrativas e configurações gerais do sistema.'
  },
  representante: {
    label: 'Representante',
    icon: 'badge',
    endpoint: 'representantes',
    responseKey: 'representante',
    description:
      'Perfil responsável pelo acompanhamento da carteira de lojistas e seus projetos.'
  },
  lojista: {
    label: 'Lojista',
    icon: 'storefront',
    endpoint: 'lojistas',
    responseKey: 'lojista',
    description:
      'Perfil responsável pelo relacionamento com clientes e envio dos projetos.'
  }
}

const tipoUsuario = computed(() =>
  String(authStore.userTipo || '')
    .trim()
    .toLowerCase()
)

const perfilConfig = computed(() =>
  perfis[tipoUsuario.value] || {
    label: 'Usuário',
    icon: 'person',
    endpoint: '',
    responseKey: '',
    description: 'Perfil de acesso ao sistema Artezza.'
  }
)

const endpointPerfil = computed(() => {
  const endpoint = perfilConfig.value.endpoint

  if (!endpoint || !authStore.userId) {
    return ''
  }

  return `/${endpoint}/${authStore.userId}`
})

const iniciaisAvatar = computed(() => {
  const nomeCompleto =
    form.value.nome ||
    authStore.userName ||
    ''

  if (!nomeCompleto) return 'U'

  const partes = nomeCompleto
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (partes.length === 1) {
    return partes[0]
      .charAt(0)
      .toUpperCase()
  }

  return (
    partes[0].charAt(0) +
    partes[partes.length - 1].charAt(0)
  ).toUpperCase()
})

const telefoneFormatado = computed(() => {
  const tel = String(
    form.value.telefone || ''
  ).replace(/\D/g, '')

  if (tel.length === 11) {
    return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`
  }

  if (tel.length === 10) {
    return `(${tel.slice(0, 2)}) ${tel.slice(2, 6)}-${tel.slice(6)}`
  }

  return form.value.telefone || ''
})

const regraSenha = computed(() => {
  const senha = form.value.senha || ''

  return {
    tamanho: senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    minuscula: /[a-z]/.test(senha),
    numero: /\d/.test(senha),
    simbolo: /[\W_]/.test(senha)
  }
})

const senhaValida = computed(() => {
  if (!form.value.senha) return true

  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(
    form.value.senha
  )
})

const senhasConferem = computed(() => {
  if (!form.value.senha) return true

  return confirmarSenha.value === form.value.senha
})

function serializarFormAtual() {
  return JSON.stringify({
    nome: form.value.nome || '',
    email: form.value.email || '',
    telefone: form.value.telefone || '',
    senha: form.value.senha || ''
  })
}

const temAlteracoes = computed(() => {
  if (loadingData.value) return false

  return (
    serializarFormAtual() !==
    snapshotOriginal.value
  )
})

const validarEmail = email => {
  if (!email) return true

  const regex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return (
    regex.test(email) ||
    'Formato de e-mail inválido'
  )
}

const validarTelefone = tel => {
  if (!tel) return true

  const limpo =
    String(tel).replace(/\D/g, '')

  return (
    (limpo.length >= 10 &&
      limpo.length <= 11) ||
    'Telefone deve ter DDD + 8 ou 9 dígitos'
  )
}


function extrairDadosPerfil(responseData) {
  if (!responseData) return {}

  const key =
    perfilConfig.value.responseKey

  if (
    key &&
    responseData[key] &&
    typeof responseData[key] === 'object'
  ) {
    return responseData[key]
  }

  if (
    responseData.usuario &&
    typeof responseData.usuario === 'object'
  ) {
    return responseData.usuario
  }

  if (
    responseData.data &&
    typeof responseData.data === 'object' &&
    !Array.isArray(responseData.data)
  ) {
    return responseData.data
  }

  return responseData
}

const carregar = async () => {
  try {
    loadingData.value = true

    if (!endpointPerfil.value) {
      throw new Error(
        `Perfil não suportado: ${authStore.userTipo || 'não informado'}`
      )
    }

    const response =
      await api.get(endpointPerfil.value)

    const dados =
      extrairDadosPerfil(response.data)

    form.value.nome =
      dados.nome != null
        ? String(dados.nome)
        : ''

    form.value.email =
      dados.email != null
        ? String(dados.email)
        : ''

    form.value.telefone =
      dados.telefone != null
        ? String(dados.telefone)
        : ''

    form.value.senha = ''
    confirmarSenha.value = ''

    snapshotOriginal.value =
      serializarFormAtual()
  } catch (error) {
    console.error(
      'Erro ao carregar perfil:',
      error
    )

    $q.notify({
      type: 'negative',
      message: 'Falha ao buscar seus dados.',
      position: 'top-right'
    })
  } finally {
    loadingData.value = false
  }
}

const salvar = async () => {
  const success =
    await formPerfil.value.validate()

  if (!success) {
    $q.notify({
      type: 'warning',
      message:
        'Existem campos inválidos. Verifique os dados informados.',
      position: 'top-right'
    })

    return
  }

  if (
    form.value.senha &&
    !senhaValida.value
  ) {
    tab.value = 'seguranca'

    $q.notify({
      type: 'warning',
      message:
        'A nova senha ainda não atende a todos os requisitos de segurança.',
      position: 'top-right'
    })

    return
  }

  if (
    form.value.senha &&
    !senhasConferem.value
  ) {
    tab.value = 'seguranca'

    $q.notify({
      type: 'warning',
      message:
        'A confirmação da nova senha não confere.',
      position: 'top-right'
    })

    return
  }

  modalConfirmacao.value = true
}

const confirmarSalvar = async () => {
  try {
    loadingSubmit.value = true

    const payload = {
      nome: form.value.nome.trim(),
      email: form.value.email.trim(),
      telefone:
        form.value.telefone
          ? String(form.value.telefone)
              .replace(/\D/g, '')
          : ''
    }

    if (form.value.senha) {
      payload.senha = form.value.senha
    }

    await api.patch(
      endpointPerfil.value,
      payload
    )

    authStore.userName =
      form.value.nome.trim()

    form.value.senha = ''
    confirmarSenha.value = ''

    snapshotOriginal.value =
      serializarFormAtual()

    modalConfirmacao.value = false

    $q.notify({
      type: 'positive',
      message: 'Perfil atualizado com sucesso!',
      position: 'top-right',
      icon: 'check_circle'
    })
  } catch (error) {
    console.error(
      'Erro ao salvar perfil:',
      error
    )

    const mensagem =
      error?.response?.data?.message ||
      error?.response?.data?.erro ||
      'Erro ao salvar as alterações.'

    $q.notify({
      type: 'negative',
      message: mensagem,
      position: 'top-right'
    })
  } finally {
    loadingSubmit.value = false
  }
}

onMounted(carregar)
</script>

<style scoped>
.profile-page {
  padding: 28px 28px 52px;
  color: var(--text-base);
}

.panel {
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-soft);
}

.profile-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.profile-eyebrow,
.section-kicker {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--brand);
  font-size: 10px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: .11em;
  text-transform: uppercase;
}

.profile-eyebrow__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 0 4px var(--brand-soft);
}

.profile-title {
  margin: 10px 0 8px;
  color: var(--text-strong);
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -.035em;
}

.profile-title span {
  color: var(--brand);
}

.profile-subtitle {
  max-width: 700px;
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.back-btn {
  flex: 0 0 auto;
  color: var(--text-muted);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  background: var(--surf-1);
}

.back-btn:hover {
  color: var(--brand);
  background: var(--brand-soft);
}

.profile-layout {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.profile-sidebar {
  display: grid;
  gap: 14px;
  position: sticky;
  top: 18px;
}

.profile-card,
.profile-nav,
.security-tip,
.profile-content {
  border-radius: 18px;
}

.profile-card {
  padding: 24px 20px 20px;
  text-align: center;
}

.profile-avatar-wrap {
  position: relative;
  width: fit-content;
  margin: 0 auto;
}

.profile-avatar {
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  color: var(--brand);
  background:
    linear-gradient(
      145deg,
      var(--brand-soft),
      var(--surf-2)
    );
  border: 1px solid rgba(255, 123, 0, .22);
  font-size: 25px;
  font-weight: 850;
  letter-spacing: -.04em;
  box-shadow: 0 10px 28px rgba(255, 123, 0, .12);
}

.profile-online-dot {
  position: absolute;
  right: -1px;
  bottom: 4px;
  width: 14px;
  height: 14px;
  border: 3px solid var(--surf-1);
  border-radius: 50%;
  background: #21ba45;
}

.profile-card__identity {
  margin-top: 14px;
}

.profile-card__identity strong {
  display: block;
  color: var(--text-strong);
  font-size: 16px;
  line-height: 1.35;
}

.profile-card__identity span {
  display: block;
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 10.5px;
  overflow-wrap: anywhere;
}

.profile-role-badge {
  width: fit-content;
  margin: 13px auto 0;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .17);
  border-radius: 999px;
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.profile-card__divider {
  height: 1px;
  margin: 18px 0;
  background: var(--border-soft);
}

.profile-meta-list {
  display: grid;
  gap: 12px;
  text-align: left;
}

.profile-meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-meta-icon {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 9px;
}

.profile-meta-row span,
.profile-meta-row strong {
  display: block;
}

.profile-meta-row span {
  color: var(--text-muted);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.profile-meta-row strong {
  margin-top: 2px;
  color: var(--text-strong);
  font-size: 11px;
  font-weight: 700;
}

.profile-nav {
  overflow: hidden;
  padding: 6px;
}

.profile-nav__item {
  width: 100%;
  display: grid;
  grid-template-columns: 34px 1fr 18px;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 0;
  border-radius: 11px;
  color: var(--text-base);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: .18s ease;
}

.profile-nav__item:hover {
  background: var(--surf-2);
}

.profile-nav__item--active {
  color: var(--brand);
  background: var(--brand-soft);
}

.profile-nav__icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
}

.profile-nav__item--active .profile-nav__icon {
  color: var(--brand);
  border-color: rgba(255, 123, 0, .18);
  background: rgba(255, 123, 0, .08);
}

.profile-nav__copy {
  min-width: 0;
}

.profile-nav__copy strong,
.profile-nav__copy small {
  display: block;
}

.profile-nav__copy strong {
  color: inherit;
  font-size: 11px;
}

.profile-nav__copy small {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 9.5px;
}

.profile-nav__chevron {
  color: var(--text-muted);
}

.security-tip {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 14px;
}

.security-tip__icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  color: #21ba45;
  background: rgba(33, 186, 69, .1);
  border: 1px solid rgba(33, 186, 69, .14);
  border-radius: 10px;
}

.security-tip strong {
  display: block;
  color: var(--text-strong);
  font-size: 10.5px;
}

.security-tip p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 9.5px;
  line-height: 1.5;
}

.profile-content {
  width: 100%;
  min-width: 0;
  overflow: hidden;
}

.profile-form,
.profile-panels,
.profile-tab-panel {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: transparent;
}

/* Mantém a troca de abas visualmente estável no desktop */
.profile-panels,
.profile-tab-panel {
  min-height: 470px;
}

.profile-tab-panel {
  padding: 26px;
}

.form-section-head {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding-bottom: 20px;
  margin-bottom: 22px;
  border-bottom: 1px solid var(--border-soft);
}

.form-section-icon {
  width: 43px;
  height: 43px;
  flex: 0 0 43px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .16);
  border-radius: 12px;
}

.form-section-head h2 {
  margin: 5px 0 4px;
  color: var(--text-strong);
  font-size: 20px;
  line-height: 1.25;
  font-weight: 800;
}

.form-section-head p {
  margin: 0;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.55;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
}

.field-block {
  grid-column: span 6;
  min-width: 0;
}

.field-block--full {
  grid-column: 1 / -1;
}

.field-label {
  display: block;
  margin: 0 0 6px 2px;
  color: var(--text-base);
  font-size: 10.5px;
  font-weight: 700;
}

.profile-field :deep(.q-field__control) {
  min-height: 43px;
  color: var(--text-strong);
  background: var(--surf-2);
  border-radius: 10px;
}

.profile-field :deep(.q-field__native),
.profile-field :deep(.q-field__input),
.profile-field :deep(.q-field__prepend),
.profile-field :deep(.q-field__append) {
  color: var(--text-strong);
}

.profile-field :deep(.q-field__prepend) {
  color: var(--text-muted);
}

.profile-field :deep(.q-field__control:before) {
  border-color: var(--border-soft);
}

.profile-field :deep(.q-field__control:hover:before) {
  border-color: rgba(255, 123, 0, .35);
}

.profile-field.q-field--focused :deep(.q-field__control) {
  background: var(--surf-1);
  box-shadow: 0 0 0 3px rgba(255, 123, 0, .08);
}

.account-info-card {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  margin-top: 22px;
  padding: 15px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
}

.account-info-card__icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 11px;
}

.account-info-card strong {
  display: block;
  color: var(--text-strong);
  font-size: 11.5px;
}

.account-info-card p {
  margin: 3px 0 0;
  max-width: 560px;
  color: var(--text-muted);
  font-size: 9.5px;
  line-height: 1.45;
}

.account-info-card__badge {
  padding: 6px 9px;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .15);
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.info-banner {
  display: flex;
  gap: 11px;
  margin-top: 14px;
  padding: 14px 15px;
  color: var(--text-base);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .13);
  border-radius: 11px;
}

.info-banner__icon {
  color: var(--brand);
  flex: 0 0 auto;
}

.info-banner strong,
.info-banner span {
  display: block;
}

.info-banner strong {
  color: var(--text-strong);
  font-size: 10.5px;
}

.info-banner span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9.5px;
  line-height: 1.5;
}

.security-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(250px, 280px);
  gap: 22px;
  align-items: start;
  width: 100%;
  min-width: 0;
}

.security-form {
  display: grid;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.security-form .field-block {
  grid-column: auto;
  width: 100%;
  min-width: 0;
}

.password-field-block {
  width: 100%;
  min-width: 0;
}

.password-field-block .profile-field {
  width: 100%;
  min-width: 0;
}

.password-field-block .profile-field :deep(.q-field__inner),
.password-field-block .profile-field :deep(.q-field__control-container) {
  width: 100%;
  min-width: 0;
}

/*
 * Área própria e fixa para validação.
 * Assim o Quasar não empurra o próximo label e o card não muda de largura.
 */
.password-validation-slot {
  width: 100%;
  min-width: 0;
  height: 42px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  padding: 6px 10px 0;
  color: transparent;
  font-size: 10px;
  line-height: 1.35;
  overflow: hidden;
}

.password-validation-slot--error {
  color: #d93f3f;
}

.password-validation-slot .q-icon {
  flex: 0 0 auto;
  margin-top: 1px;
}

.password-validation-slot span {
  min-width: 0;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: break-word;
  word-break: normal;
}

.password-rules {
  padding: 17px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
}

.password-rules__head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--brand);
}

.password-rules__head strong {
  color: var(--text-strong);
  font-size: 11.5px;
}

.password-rules p {
  margin: 9px 0 13px;
  color: var(--text-muted);
  font-size: 9.5px;
  line-height: 1.5;
}

.password-rules ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.password-rules li {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text-muted);
  font-size: 9.5px;
  font-weight: 600;
}

.password-rules li .q-icon {
  font-size: 15px;
}

.password-rules li.rule-ok {
  color: #21ba45;
}

.form-actions {
  min-height: 74px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 20px;
  border-top: 1px solid var(--border-soft);
  background: var(--surf-2);
}

.form-actions__status {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text-muted);
  font-size: 9.5px;
  font-weight: 600;
}

.form-actions__status .q-icon {
  color: var(--brand);
}

.form-actions__buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-btn {
  color: var(--text-muted);
  border-radius: 9px;
}

.save-btn {
  color: #fff !important;
  background:
    linear-gradient(
      135deg,
      var(--brand),
      #ff9a3d
    ) !important;
  border-radius: 9px;
  box-shadow: 0 7px 18px rgba(255, 123, 0, .18);
}

.save-btn.q-btn--disable {
  opacity: .45 !important;
}

.confirm-dialog {
  width: min(440px, calc(100vw - 28px));
  color: var(--text-base);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 17px;
  overflow: hidden;
  box-shadow: var(--shadow-strong);
}

.confirm-dialog__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 14px;
}

.confirm-dialog__icon {
  width: 43px;
  height: 43px;
  flex: 0 0 43px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .16);
  border-radius: 12px;
}

.confirm-dialog h3 {
  margin: 5px 0 0;
  color: var(--text-strong);
  font-size: 17px;
  font-weight: 800;
}

.confirm-dialog__body {
  padding: 0 20px 18px;
}

.confirm-dialog__body > p {
  margin: 0 0 13px;
  color: var(--text-muted);
  font-size: 10.5px;
  line-height: 1.55;
}

.confirm-dialog__notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 11px 12px;
  color: var(--text-muted);
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  font-size: 9.5px;
  line-height: 1.45;
}

.confirm-dialog__notice .q-icon {
  color: var(--brand);
  flex: 0 0 auto;
}

.confirm-dialog__actions {
  justify-content: flex-end;
  gap: 6px;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--border-soft);
}

.loading-label {
  color: var(--brand);
  font-weight: 700;
}

@media (max-width: 1240px) {
  .profile-layout {
    grid-template-columns: 250px minmax(0, 1fr);
  }

  .profile-panels,
  .profile-tab-panel {
    min-height: 520px;
  }

  .security-layout {
    grid-template-columns: 1fr;
  }

  .password-rules {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .profile-page {
    padding: 22px 16px 40px;
  }

  .profile-layout {
    grid-template-columns: 1fr;
  }

  .profile-sidebar {
    position: static;
  }

  .profile-nav {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .profile-nav__item {
    grid-template-columns: 30px 1fr;
  }

  .profile-nav__chevron,
  .profile-nav__copy small {
    display: none;
  }

  .security-tip {
    display: none;
  }

  .profile-panels,
  .profile-tab-panel {
    min-height: 0;
  }
}

@media (max-width: 680px) {
  .profile-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-title {
    font-size: 26px;
  }

  .back-btn {
    width: 100%;
  }

  .profile-meta-list {
    grid-template-columns: 1fr 1fr;
  }

  .profile-meta-row:last-child {
    grid-column: 1 / -1;
  }

  .profile-nav {
    grid-template-columns: 1fr;
  }

  .profile-nav__item {
    grid-template-columns: 34px 1fr 18px;
  }

  .profile-nav__chevron,
  .profile-nav__copy small {
    display: block;
  }

  .profile-tab-panel {
    padding: 20px 16px;
  }

  .field-block {
    grid-column: 1 / -1;
  }

  .account-info-card {
    grid-template-columns: 42px 1fr;
  }

  .account-info-card__badge {
    grid-column: 2;
    width: fit-content;
  }

  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .form-actions__buttons {
    display: grid;
    grid-template-columns: 1fr;
  }

  .form-actions__buttons .q-btn {
    width: 100%;
  }
}

@media (max-width: 420px) {
  .profile-page {
    padding: 16px 10px 32px;
  }

  .profile-meta-list {
    grid-template-columns: 1fr;
  }

  .profile-meta-row:last-child {
    grid-column: auto;
  }
}
</style>
