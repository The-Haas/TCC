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
          Gerencie seus <span>dados e preferências</span>
        </h1>

        <p class="profile-subtitle">
          Mantenha suas informações atualizadas para garantir uma comunicação
          rápida e segura durante todo o andamento dos seus projetos.
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
      <!-- COLUNA LATERAL -->
      <aside class="profile-sidebar">
        <article class="profile-card panel">
          <div class="profile-avatar-wrap">
            <div class="profile-avatar">
              {{ iniciaisAvatar }}
            </div>

            <span class="profile-online-dot"></span>
          </div>

          <div class="profile-card__identity">
            <strong>{{ form.nome || authStore.userName || 'Cliente' }}</strong>
            <span>{{ form.email || 'E-mail não informado' }}</span>
          </div>

          <div class="profile-role-badge">
            <q-icon name="person" size="15px" />
            Cliente
          </div>

          <div class="profile-card__divider"></div>

          <div class="profile-meta-list">
            <div class="profile-meta-row">
              <div class="profile-meta-icon">
                <q-icon name="badge" size="16px" />
              </div>

              <div>
                <span>Documento</span>
                <strong>{{ form.cpf_cnpj || 'Não informado' }}</strong>
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
                <q-icon name="location_on" size="16px" />
              </div>

              <div>
                <span>Localização</span>
                <strong>{{ localizacaoResumo }}</strong>
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
            <strong>Seus dados estão protegidos</strong>
            <p>
              As informações desta página são usadas somente para o atendimento
              e operação dos seus projetos.
            </p>
          </div>
        </article>
      </aside>

      <!-- CONTEÚDO PRINCIPAL -->
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
            animated
            swipeable
            class="profile-panels"
          >
            <!-- DADOS PESSOAIS -->
            <q-tab-panel name="pessoais" class="profile-tab-panel">
              <div class="form-section-head">
                <div class="form-section-icon">
                  <q-icon name="person_outline" size="22px" />
                </div>

                <div>
                  <div class="section-kicker">Identificação</div>
                  <h2>Dados pessoais</h2>
                  <p>
                    Informações utilizadas para identificar e manter contato
                    com você.
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
                      val => !!val || 'Obrigatório',
                      val => val.trim().includes(' ') || 'Informe o nome e sobrenome'
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
                      val => !!val || 'Obrigatório',
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
                  <span class="field-label">Telefone *</span>

                  <q-input
                    v-model="form.telefone"
                    outlined
                    dense
                    color="orange"
                    class="profile-field"
                    mask="(##) #####-####"
                    unmasked-value
                    placeholder="(00) 00000-0000"
                    :rules="[
                      val => !!val || 'Obrigatório',
                      validarTelefone
                    ]"
                    hide-bottom-space
                  >
                    <template #prepend>
                      <q-icon name="phone" size="18px" />
                    </template>
                  </q-input>
                </div>

                <div class="field-block">
                  <span class="field-label">Razão social</span>

                  <q-input
                    v-model="form.razao_social"
                    outlined
                    dense
                    color="orange"
                    class="profile-field"
                    placeholder="Opcional"
                    hide-bottom-space
                  >
                    <template #prepend>
                      <q-icon name="business" size="18px" />
                    </template>
                  </q-input>
                </div>

                <div class="field-block">
                  <span class="field-label">CPF / CNPJ *</span>

                  <q-input
                    v-model="form.cpf_cnpj"
                    outlined
                    dense
                    color="orange"
                    class="profile-field"
                    placeholder="CPF ou CNPJ"
                    @update:model-value="val => form.cpf_cnpj = formatarCpfCnpj(val)"
                    :rules="[
                      val => !!val || 'Obrigatório',
                      validarDocumento
                    ]"
                    hide-bottom-space
                  >
                    <template #prepend>
                      <q-icon name="badge" size="18px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="info-banner">
                <div class="info-banner__icon">
                  <q-icon name="info_outline" size="19px" />
                </div>

                <div>
                  <strong>Por que manter esses dados atualizados?</strong>
                  <span>
                    E-mail e telefone podem ser usados para comunicações sobre
                    seus projetos, aprovações e etapas de entrega.
                  </span>
                </div>
              </div>
            </q-tab-panel>

            <!-- ENDEREÇO -->
            <q-tab-panel name="endereco" class="profile-tab-panel">
              <div class="form-section-head">
                <div class="form-section-icon">
                  <q-icon name="location_on" size="22px" />
                </div>

                <div>
                  <div class="section-kicker">Localização</div>
                  <h2>Endereço</h2>
                  <p>
                    Cadastre seu endereço principal e, se necessário, um local
                    diferente para entrega.
                  </p>
                </div>
              </div>

              <div class="form-grid">
                <div class="field-block field-block--cep">
                  <span class="field-label">CEP</span>

                  <q-input
                    v-model="form.cep"
                    outlined
                    dense
                    color="orange"
                    class="profile-field"
                    mask="#####-###"
                    unmasked-value
                    :loading="loadingCep"
                    placeholder="00000-000"
                    hide-bottom-space
                  >
                    <template #prepend>
                      <q-icon name="pin_drop" size="18px" />
                    </template>
                  </q-input>
                </div>

                <div class="field-block field-block--street">
                  <span class="field-label">Logradouro</span>

                  <q-input
                    v-model="form.endereco"
                    outlined
                    dense
                    color="orange"
                    class="profile-field"
                    placeholder="Rua, avenida..."
                    hide-bottom-space
                  >
                    <template #prepend>
                      <q-icon name="signpost" size="18px" />
                    </template>
                  </q-input>
                </div>

                <div class="field-block field-block--number">
                  <span class="field-label">Número</span>

                  <q-input
                    v-model="form.numero"
                    outlined
                    dense
                    color="orange"
                    class="profile-field"
                    placeholder="Nº"
                    hide-bottom-space
                  />
                </div>

                <div class="field-block field-block--neighborhood">
                  <span class="field-label">Bairro</span>

                  <q-input
                    v-model="form.bairro"
                    outlined
                    dense
                    color="orange"
                    class="profile-field"
                    placeholder="Seu bairro"
                    hide-bottom-space
                  />
                </div>

                <div class="field-block field-block--city">
                  <span class="field-label">Cidade</span>

                  <q-input
                    v-model="form.cidade"
                    outlined
                    dense
                    color="orange"
                    class="profile-field"
                    placeholder="Sua cidade"
                    hide-bottom-space
                  />
                </div>

                <div class="field-block field-block--uf">
                  <span class="field-label">UF</span>

                  <q-input
                    v-model="form.uf"
                    outlined
                    dense
                    color="orange"
                    class="profile-field"
                    mask="AA"
                    placeholder="UF"
                    :rules="[validarUF]"
                    hide-bottom-space
                  />
                </div>
              </div>

              <div class="delivery-card">
                <div class="delivery-card__head">
                  <div class="delivery-card__icon">
                    <q-icon name="local_shipping" size="21px" />
                  </div>

                  <div>
                    <strong>Local de entrega alternativo</strong>
                    <span>Opcional</span>
                  </div>
                </div>

                <p>
                  Por padrão, seus pedidos consideram o endereço principal.
                  Preencha abaixo apenas se desejar informar outro local.
                </p>

                <q-input
                  v-model="form.endereco_entrega"
                  outlined
                  dense
                  color="orange"
                  class="profile-field profile-field--delivery"
                  placeholder="Ex: Rua X, nº 100, Bairro Y - Cidade/UF"
                  hide-bottom-space
                >
                  <template #prepend>
                    <q-icon name="where_to_vote" size="18px" />
                  </template>
                </q-input>
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
                    Altere sua senha apenas quando necessário. Se não quiser
                    modificá-la, deixe os campos abaixo vazios.
                  </p>
                </div>
              </div>

              <div class="security-layout">
                <div class="security-form">
                  <div class="field-block">
                    <span class="field-label">Nova senha</span>

                    <q-input
                      v-model="form.senha"
                      outlined
                      dense
                      color="orange"
                      class="profile-field"
                      :type="isPwd ? 'password' : 'text'"
                      placeholder="••••••••"
                      :rules="[validarForcaSenha]"
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
                  </div>

                  <div class="field-block">
                    <span class="field-label">Confirmar nova senha</span>

                    <q-input
                      v-model="confirmarSenha"
                      outlined
                      dense
                      color="orange"
                      class="profile-field"
                      :type="isPwdConfirm ? 'password' : 'text'"
                      placeholder="••••••••"
                      :rules="[
                        val =>
                          !form.senha ||
                          val === form.senha ||
                          'As senhas não coincidem'
                      ]"
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

          <!-- FOOTER DE AÇÕES -->
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
            <h3>Salvar dados do perfil?</h3>
          </div>
        </q-card-section>

        <q-card-section class="confirm-dialog__body">
          <p>
            As informações atualizadas substituirão os dados atuais da sua
            conta.
          </p>

          <div class="confirm-dialog__notice">
            <q-icon name="info_outline" size="18px" />
            <span>
              Se você alterou sua senha, a nova senha passará a valer
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
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const formPerfil = ref(null)
const loadingData = ref(true)
const loadingSubmit = ref(false)
const loadingCep = ref(false)
const tab = ref('pessoais')

const isPwd = ref(true)
const isPwdConfirm = ref(true)
const confirmarSenha = ref('')
const modalConfirmacao = ref(false)

const snapshotOriginal = ref('')

const form = ref({
  nome: '',
  email: '',
  telefone: '',
  razao_social: '',
  cpf_cnpj: '',
  cep: '',
  endereco: '',
  numero: '',
  bairro: '',
  cidade: '',
  uf: '',
  endereco_entrega: '',
  senha: ''
})

const navItems = [
  {
    name: 'pessoais',
    label: 'Dados pessoais',
    helper: 'Identificação e contato',
    icon: 'person_outline'
  },
  {
    name: 'endereco',
    label: 'Endereço',
    helper: 'Localização e entrega',
    icon: 'location_on'
  },
  {
    name: 'seguranca',
    label: 'Segurança',
    helper: 'Senha e proteção',
    icon: 'shield'
  }
]

const iniciaisAvatar = computed(() => {
  const nomeCompleto = form.value.nome || authStore.userName || ''

  if (!nomeCompleto) return 'C'

  const partesNome = nomeCompleto.trim().split(/\s+/)

  if (partesNome.length === 1) {
    return partesNome[0].charAt(0).toUpperCase()
  }

  const primeiraLetra = partesNome[0].charAt(0)
  const ultimaLetra = partesNome[partesNome.length - 1].charAt(0)

  return (primeiraLetra + ultimaLetra).toUpperCase()
})

const telefoneFormatado = computed(() => {
  const tel = String(form.value.telefone || '').replace(/\D/g, '')

  if (tel.length === 11) {
    return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`
  }

  if (tel.length === 10) {
    return `(${tel.slice(0, 2)}) ${tel.slice(2, 6)}-${tel.slice(6)}`
  }

  return form.value.telefone || ''
})

const localizacaoResumo = computed(() => {
  const cidade = form.value.cidade?.trim()
  const uf = form.value.uf?.trim().toUpperCase()

  if (cidade && uf) return `${cidade}/${uf}`
  if (cidade) return cidade
  if (uf) return uf

  return 'Não informada'
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

function serializarFormAtual() {
  const payload = {
    ...form.value,
    senha: form.value.senha || ''
  }

  return JSON.stringify(payload)
}

const temAlteracoes = computed(() => {
  if (loadingData.value) return false

  return serializarFormAtual() !== snapshotOriginal.value
})

const validarEmail = email => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return regex.test(email) || 'Formato de e-mail inválido'
}

const validarTelefone = tel => {
  if (!tel) return true

  const limpo = tel.replace(/\D/g, '')

  return (
    (limpo.length >= 10 && limpo.length <= 11) ||
    'Telefone deve ter DDD + 8 ou 9 dígitos'
  )
}

const formatarCpfCnpj = val => {
  if (!val) return ''

  let v = val.replace(/\D/g, '')

  if (v.length > 14) {
    v = v.slice(0, 14)
  }

  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  } else {
    v = v.replace(/^(\d{2})(\d)/, '$1.$2')
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
    v = v.replace(/(\d{4})(\d{1,2})$/, '$1-$2')
  }

  return v
}

const validarCPF = strCPF => {
  let soma = 0
  let resto

  if (
    strCPF === '00000000000' ||
    strCPF.length !== 11
  ) {
    return false
  }

  for (let i = 1; i <= 9; i++) {
    soma +=
      parseInt(strCPF.substring(i - 1, i)) *
      (11 - i)
  }

  resto = (soma * 10) % 11

  if (resto === 10 || resto === 11) {
    resto = 0
  }

  if (
    resto !==
    parseInt(strCPF.substring(9, 10))
  ) {
    return false
  }

  soma = 0

  for (let i = 1; i <= 10; i++) {
    soma +=
      parseInt(strCPF.substring(i - 1, i)) *
      (12 - i)
  }

  resto = (soma * 10) % 11

  if (resto === 10 || resto === 11) {
    resto = 0
  }

  return (
    resto ===
    parseInt(strCPF.substring(10, 11))
  )
}

const validarCNPJ = cnpj => {
  if (
    !cnpj ||
    cnpj.length !== 14 ||
    /^(\d)\1+$/.test(cnpj)
  ) {
    return false
  }

  let tamanho = cnpj.length - 2
  let numeros = cnpj.substring(0, tamanho)
  const digitos = cnpj.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--

    if (pos < 2) {
      pos = 9
    }
  }

  let resultado =
    soma % 11 < 2
      ? 0
      : 11 - (soma % 11)

  if (
    resultado !==
    parseInt(digitos.charAt(0))
  ) {
    return false
  }

  tamanho += 1
  numeros = cnpj.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--

    if (pos < 2) {
      pos = 9
    }
  }

  resultado =
    soma % 11 < 2
      ? 0
      : 11 - (soma % 11)

  return (
    resultado ===
    parseInt(digitos.charAt(1))
  )
}

const validarDocumento = val => {
  if (!val) return true

  const limpo = val.replace(/\D/g, '')

  if (limpo.length <= 11) {
    return validarCPF(limpo) || 'CPF inválido'
  }

  return validarCNPJ(limpo) || 'CNPJ inválido'
}

const validarForcaSenha = senha => {
  if (!senha) return true

  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/

  if (!regex.test(senha)) {
    return 'Use no mínimo 8 caracteres com maiúscula, minúscula, número e símbolo.'
  }

  return true
}

const validarUF = uf => {
  if (!uf) return true

  const ufsValidas = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF',
    'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
    'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS',
    'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  if (!ufsValidas.includes(uf.toUpperCase())) {
    return 'Estado (UF) inválido'
  }

  return true
}

const carregar = async () => {
  try {
    loadingData.value = true

    const response = await api.get(
      `/clientes/${authStore.userId}`
    )

    const dadosRecuperados =
      response.data.cliente ||
      response.data

    Object.keys(form.value).forEach(key => {
      if (
        dadosRecuperados[key] !== undefined &&
        dadosRecuperados[key] !== null
      ) {
        form.value[key] =
          String(dadosRecuperados[key])
      }
    })

    if (form.value.cpf_cnpj) {
      form.value.cpf_cnpj =
        formatarCpfCnpj(form.value.cpf_cnpj)
    }

    form.value.senha = ''
    confirmarSenha.value = ''

    snapshotOriginal.value =
      serializarFormAtual()
  } catch (error) {
    console.error(
      'Erro no carregar do Perfil:',
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
        'Existem campos inválidos ou não preenchidos. Verifique as seções do perfil.',
      position: 'top-right'
    })

    return
  }

  if (
    form.value.senha &&
    form.value.senha !== confirmarSenha.value
  ) {
    tab.value = 'seguranca'

    $q.notify({
      type: 'warning',
      message: 'A confirmação da nova senha não confere.',
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
      ...form.value
    }

    if (payload.cpf_cnpj) {
      payload.cpf_cnpj =
        payload.cpf_cnpj.replace(/\D/g, '')
    }

    if (!payload.senha) {
      delete payload.senha
    }

    await api.patch(
      `/clientes/${authStore.userId}`,
      payload
    )

    authStore.userName =
      form.value.nome

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
      'Erro no salvar do Perfil:',
      error
    )

    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar as alterações.',
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
  max-width: 720px;
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
  min-width: 0;
  overflow: hidden;
}

.profile-form,
.profile-panels,
.profile-tab-panel {
  background: transparent;
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

.field-block--cep {
  grid-column: span 4;
}

.field-block--street {
  grid-column: span 8;
}

.field-block--number {
  grid-column: span 3;
}

.field-block--neighborhood {
  grid-column: span 9;
}

.field-block--city {
  grid-column: span 9;
}

.field-block--uf {
  grid-column: span 3;
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

.info-banner {
  display: flex;
  gap: 11px;
  margin-top: 20px;
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

.delivery-card {
  margin-top: 22px;
  padding: 18px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 13px;
}

.delivery-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.delivery-card__icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 10px;
}

.delivery-card__head strong {
  display: block;
  color: var(--text-strong);
  font-size: 11.5px;
}

.delivery-card__head span {
  display: block;
  margin-top: 2px;
  color: var(--brand);
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.delivery-card p {
  margin: 11px 0 14px;
  max-width: 720px;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.55;
}

.profile-field--delivery :deep(.q-field__control) {
  background: var(--surf-1);
}

.security-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 22px;
  align-items: start;
}

.security-form {
  display: grid;
  gap: 16px;
}

.security-form .field-block {
  grid-column: auto;
}

/*
 * Mantém os campos de senha estáveis quando aparecem mensagens de validação.
 * O Quasar passa a reservar sempre a área inferior e o texto pode quebrar linha
 * sem alterar bruscamente a altura do card.
 */
.security-form .profile-field :deep(.q-field__bottom) {
  min-height: 34px;
  padding: 6px 12px 0;
}

.security-form .profile-field :deep(.q-field__messages) {
  min-height: 26px;
  line-height: 1.35;
  white-space: normal;
  overflow-wrap: anywhere;
}

.security-form .profile-field :deep(.q-field__messages > div) {
  white-space: normal;
  line-height: 1.35;
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

@media (max-width: 1120px) {
  .profile-layout {
    grid-template-columns: 250px minmax(0, 1fr);
  }

  .security-layout {
    grid-template-columns: 1fr;
  }

  .password-rules {
    max-width: none;
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
    grid-template-columns: 1fr;
  }

  .profile-nav {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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

  .profile-card {
    padding: 18px;
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

  .field-block,
  .field-block--cep,
  .field-block--street,
  .field-block--number,
  .field-block--neighborhood,
  .field-block--city,
  .field-block--uf {
    grid-column: 1 / -1;
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

  .form-section-head {
    gap: 10px;
  }

  .form-section-icon {
    width: 38px;
    height: 38px;
    flex-basis: 38px;
  }
}
</style>
