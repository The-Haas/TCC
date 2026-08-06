<template>
  <div class="full-width row justify-center q-px-sm q-pb-xl">
    <!-- Card Principal -->
    <q-card class="shadow-10 relative-position full-width"
      style="max-width: 800px; border-radius: 28px; margin-top: 60px;"
      :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-grey-9'">

      <!-- Avatar Flutuante Premium -->
      <div class="absolute-top row justify-center" style="top: -55px; left: 0; right: 0; z-index: 2;">
        <q-avatar size="110px" class="shadow-5" :style="{
          background: $q.dark.isActive ? '#1d1d1d' : '#ffffff',
          border: '4px solid var(--q-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }">
          <span class="text-primary text-weight-bolder"
            style="font-size: 40px; letter-spacing: -1px; margin: 0; padding: 0;">
            {{ iniciaisAvatar }}
          </span>
        </q-avatar>
      </div>

      <!-- Loading Overlay -->
      <q-inner-loading :showing="loadingData" label="Carregando seu perfil..." label-class="text-primary"
        label-style="font-size: 1.1em; font-weight: bold;" style="border-radius: 28px; z-index: 10;" />

      <!-- Cabeçalho -->
      <q-card-section class="text-center q-pt-xl q-pb-md" style="margin-top: 20px;">
        <div class="text-h5 text-weight-bolder text-primary">{{ form.nome || 'Meu Perfil' }}</div>
        <div class="text-body2 q-mt-xs" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">
          Gerencie suas informações pessoais, endereços e segurança
        </div>
      </q-card-section>

      <q-card-section class="q-px-md q-px-sm-xl q-pb-lg">
        <q-form @submit.prevent="salvar" ref="formPerfil">

          <!-- ABAS ESTILO BOTÃO -->
          <div class="row justify-center q-mb-lg">
            <q-tabs v-model="tab" class="text-grey-7" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
              active-color="white" active-bg-color="primary" indicator-color="transparent" align="justify"
              narrow-indicator :inline-label="!$q.screen.lt.sm" dense
              style="border-radius: 12px; padding: 4px; max-width: 500px; width: 100%;">
              <q-tab name="pessoais" icon="person" label="Pessoal" style="border-radius: 8px;"
                class="q-px-xs q-py-xs" />
              <q-tab name="endereco" icon="location_on" label="Endereço" style="border-radius: 8px;"
                class="q-px-xs q-py-xs" />
              <q-tab name="seguranca" icon="shield" label="Segurança" style="border-radius: 8px;"
                class="q-px-xs q-py-xs" />
            </q-tabs>
          </div>

          <!-- CONTEÚDO DAS ABAS -->
          <q-tab-panels v-model="tab" animated swipeable class="bg-transparent">

            <!-- ABA 1: DADOS PESSOAIS -->
            <q-tab-panel name="pessoais" class="q-px-none q-py-none">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input v-model="form.nome" label="Nome Completo *" outlined color="primary"
                    :rules="[val => !!val || 'Obrigatório', val => val.trim().includes(' ') || 'Informe o nome e sobrenome']"
                    hide-bottom-space />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="form.email" label="E-mail *" outlined type="email" color="primary"
                    :rules="[val => !!val || 'Obrigatório', validarEmail]" hide-bottom-space />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="form.telefone" label="Telefone *" outlined mask="(##) #####-####" unmasked-value
                    color="primary" :rules="[val => !!val || 'Obrigatório', validarTelefone]" hide-bottom-space />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="form.razao_social" label="Razão Social" outlined color="primary"
                    hide-bottom-space />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="form.cpf_cnpj" label="CPF / CNPJ *" outlined color="primary"
                    @update:model-value="val => form.cpf_cnpj = formatarCpfCnpj(val)"
                    :rules="[val => !!val || 'Obrigatório', validarDocumento]" hide-bottom-space />
                </div>
              </div>
            </q-tab-panel>

            <!-- ABA 2: ENDEREÇO -->
            <q-tab-panel name="endereco" class="q-px-none q-py-none">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <!-- Busca de CEP mantida, mas não é mais obrigatório -->
                  <q-input v-model="form.cep" label="CEP" outlined mask="#####-###" unmasked-value color="primary" :loading="loadingCep" hide-bottom-space />
                </div>
                <div class="col-12 col-sm-8">
                  <q-input v-model="form.endereco" label="Logradouro (Rua/Av)" outlined color="primary"
                    hide-bottom-space />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input v-model="form.numero" label="Número" outlined color="primary" hide-bottom-space />
                </div>
                <div class="col-12 col-sm-8">
                  <q-input v-model="form.bairro" label="Bairro" outlined color="primary" hide-bottom-space />
                </div>
                <div class="col-12 col-sm-9">
                  <q-input v-model="form.cidade" label="Cidade" outlined color="primary" hide-bottom-space />
                </div>
                <div class="col-12 col-sm-3">
                  <!-- UF valida se o estado existe através da função validarUF -->
                  <q-input v-model="form.uf" label="UF" outlined mask="AA" color="primary" :rules="[validarUF]"
                    hide-bottom-space />
                </div>
              </div>

              <!-- Destaque: Endereço de Entrega Alternativo-->
              <!-- ... -->
              <div class="q-mt-lg q-pa-md" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-primary'"
                :style="$q.dark.isActive ? 'border: 1px solid #333;' : 'background-color: rgba(25, 118, 210, 0.05) !important; border: 1px dashed var(--q-primary);'"
                style="border-radius: 16px;">

                <div class="row items-center q-mb-sm text-primary text-weight-bold">
                  <q-icon name="local_shipping" size="24px" class="q-mr-sm" />
                  Local de Entrega
                </div>

                <div class="text-caption q-mb-md" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">
                  Seus pedidos serão enviados para o endereço principal acima. Caso queira que a entrega seja feita em
                  um local diferente, informe abaixo.
                </div>

                <q-input v-model="form.endereco_entrega" label="Endereço de Entrega Completo (Opcional)" outlined
                  color="primary" :bg-color="$q.dark.isActive ? 'dark' : 'white'"
                  placeholder="Ex: Rua X, Galpão 2, Bairro Y - Cidade/UF" hide-bottom-space />
              </div>
            </q-tab-panel>

            <!-- ABA 3: SEGURANÇA -->
            <q-tab-panel name="seguranca" class="q-px-none q-py-none flex flex-center">
              <div class="full-width text-center" style="max-width: 440px;">
                <q-icon name="lock_outline" size="64px" color="primary" class="q-mb-sm opacity-50" />
                <div class="text-h6 text-weight-bold q-mb-sm">Proteção da Conta</div>
                <div class="text-body2 text-grey q-mb-lg">
                  Para manter sua senha atual, deixe os campos abaixo vazios.
                </div>

                <!-- Nova Senha -->
                <q-input v-model="form.senha" label="Nova Senha" outlined :type="isPwd ? 'password' : 'text'"
                  color="primary" class="q-mb-md" placeholder="••••••••" :rules="[validarForcaSenha]" hide-bottom-space>
                  <template v-slot:prepend>
                    <q-icon name="key" />
                  </template>
                  <template v-slot:append>
                    <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                      @click="isPwd = !isPwd" />
                  </template>
                </q-input>

                <!-- Confirmar Nova Senha -->
                <q-input v-model="confirmarSenha" label="Confirmar Nova Senha" outlined
                  :type="isPwdConfirm ? 'password' : 'text'" color="primary" placeholder="••••••••"
                  :rules="[val => !form.senha || val === form.senha || 'As senhas não coincidem']" hide-bottom-space>
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                  <template v-slot:append>
                    <q-icon :name="isPwdConfirm ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                      @click="isPwdConfirm = !isPwdConfirm" />
                  </template>
                </q-input>
              </div>
            </q-tab-panel>

          </q-tab-panels>

          <q-separator class="q-mt-md q-mb-md" :dark="$q.dark.isActive" style="opacity: 0.3;" />

          <!-- BOTÕES AÇÃO -->
          <div class="row q-col-gutter-sm justify-between items-center" :class="$q.screen.lt.sm ? 'column' : ''">
            <div :class="$q.screen.lt.sm ? 'col-12 order-last q-mt-sm' : 'col-auto'">
              <q-btn label="Cancelar e Voltar" color="grey-6" flat to="/dashboard" rounded no-caps class="full-width"
                size="16px" />
            </div>
            <div :class="$q.screen.lt.sm ? 'col-12' : 'col-auto'">
              <q-btn label="Salvar Alterações" color="primary" type="submit" :loading="loadingSubmit" unelevated rounded
                no-caps class="full-width text-weight-bold shadow-4" size="16px" />
            </div>
          </div>

        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const formPerfil = ref(null) // Referência ao formulário para validação automática
const loadingData = ref(true)
const loadingSubmit = ref(false)
const loadingCep = ref(false)
const tab = ref('pessoais')

const isPwd = ref(true)
const isPwdConfirm = ref(true)
const confirmarSenha = ref('')

const form = ref({
  nome: '', email: '', telefone: '', razao_social: '', cpf_cnpj: '',
  cep: '', endereco: '', numero: '', bairro: '', cidade: '', uf: '', endereco_entrega: '', senha: ''
})

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

// --- INÍCIO DAS VALIDAÇÕES ---

const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email) || 'Formato de e-mail inválido'
}

const validarTelefone = (tel) => {
  // Como usamos unmasked-value, o valor chega apenas como números (ex: 11999999999)
  if (!tel) return true
  const limpo = tel.replace(/\D/g, '')
  return (limpo.length >= 10 && limpo.length <= 11) || 'Telefone deve ter DDD + 8 ou 9 dígitos'
}

// Regras de CPF/CNPJ existentes
const formatarCpfCnpj = (val) => {
  if (!val) return ''
  let v = val.replace(/\D/g, '')
  if (v.length > 14) v = v.slice(0, 14)

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

const validarCPF = (strCPF) => {
  let soma = 0
  let resto
  if (strCPF === "00000000000" || strCPF.length !== 11) return false
  for (let i = 1; i <= 9; i++) soma = soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i)
  resto = (soma * 10) % 11
  if ((resto === 10) || (resto === 11)) resto = 0
  if (resto !== parseInt(strCPF.substring(9, 10))) return false
  soma = 0
  for (let i = 1; i <= 10; i++) soma = soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i)
  resto = (soma * 10) % 11
  if ((resto === 10) || (resto === 11)) resto = 0
  if (resto !== parseInt(strCPF.substring(10, 11))) return false
  return true
}

const validarCNPJ = (cnpj) => {
  if (!cnpj || cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false
  let tamanho = cnpj.length - 2
  let numeros = cnpj.substring(0, tamanho)
  const digitos = cnpj.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--
    if (pos < 2) pos = 9
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(0))) return false
  tamanho = tamanho + 1
  numeros = cnpj.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--
    if (pos < 2) pos = 9
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(1))) return false
  return true
}

const validarDocumento = (val) => {
  if (!val) return true
  const limpo = val.replace(/\D/g, '')
  if (limpo.length <= 11) {
    return validarCPF(limpo) || 'CPF inválido'
  } else {
    return validarCNPJ(limpo) || 'CNPJ inválido'
  }
}
// --- FIM DAS VALIDAÇÕES ---

const carregar = async () => {
  try {
    loadingData.value = true
    const response = await api.get(`/clientes/${authStore.userId}`)
    const dadosRecuperados = response.data.cliente || response.data

    Object.keys(form.value).forEach(key => {
      if (dadosRecuperados[key] !== undefined && dadosRecuperados[key] !== null) {
        form.value[key] = String(dadosRecuperados[key])
      }
    })

    if (form.value.cpf_cnpj) {
      form.value.cpf_cnpj = formatarCpfCnpj(form.value.cpf_cnpj)
    }

    form.value.senha = ''
    confirmarSenha.value = ''
  } catch (error) {
    console.error('Erro no carregar do Perfil:', error)
    $q.notify({ type: 'negative', message: 'Falha ao buscar seus dados.', position: 'top-right' })
  } finally {
    loadingData.value = false
  }
}

const salvar = async () => {
  // Chama a validação nativa do formulário (q-form)
  const success = await formPerfil.value.validate()

  if (!success) {
    $q.notify({
      type: 'warning',
      message: 'Existem campos inválidos ou não preenchidos. Por favor, verifique as abas.',
      position: 'top-right'
    })
    // Opcional: tentar adivinhar a aba que tem erro, mas a notificação já ajuda o usuário
    return
  }

  // Abre o modal premium de confirmação
  $q.dialog({
    title: 'Salvar alterações',
    message: 'Deseja realmente atualizar as informações do seu perfil?',
    class: $q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-grey-9',
    style: 'border-radius: 16px; border-top: 4px solid var(--q-primary); box-shadow: 0 10px 30px rgba(0,0,0,0.1);',
    cancel: {
      label: 'Cancelar',
      color: 'grey-6',
      flat: true,
      noCaps: true,
      class: 'text-weight-medium q-px-md'
    },
    ok: {
      label: 'Confirmar e Salvar',
      color: 'primary',
      unelevated: true,
      noCaps: true,
      icon: 'save',
      class: 'text-weight-bold q-px-md'
    },
    persistent: true
  }).onOk(async () => {
    try {
      loadingSubmit.value = true
      const payload = { ...form.value }

      if (payload.cpf_cnpj) {
        payload.cpf_cnpj = payload.cpf_cnpj.replace(/\D/g, '')
      }

      if (!payload.senha) {
        delete payload.senha
      }

      await api.patch(`/clientes/${authStore.userId}`, payload)
      authStore.userName = form.value.nome

      $q.notify({
        type: 'positive',
        message: 'Perfil atualizado com sucesso!',
        position: 'top-right',
        icon: 'check_circle'
      })

      form.value.senha = ''
      confirmarSenha.value = ''
    } catch (error) {
      console.error('Erro no salvar do Perfil:', error)
      $q.notify({ type: 'negative', message: 'Erro ao salvar as alterações.', position: 'top-right' })
    } finally {
      loadingSubmit.value = false
    }
  })
}

const validarForcaSenha = (senha) => {
  // Se estiver vazio, passa (pois o usuário pode não querer alterar a senha)
  if (!senha) return true

  // Regex: 
  // (?=.*[a-z]) -> Pelo menos 1 minúscula
  // (?=.*[A-Z]) -> Pelo menos 1 maiúscula
  // (?=.*\d)    -> Pelo menos 1 número
  // (?=.*[\W_]) -> Pelo menos 1 caractere especial (símbolo)
  // .{8,}       -> Mínimo de 8 caracteres no total
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/

  if (!regex.test(senha)) {
    return 'A senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.'
  }

  return true
}

const validarUF = (uf) => {
  // Se o usuário não digitar nada, passa a validação (já que endereço não é obrigatório)
  if (!uf) return true

  // Lista oficial de UFs do Brasil
  const ufsValidas = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  // Converte para maiúsculo e checa se existe na lista
  if (!ufsValidas.includes(uf.toUpperCase())) {
    return 'Estado (UF) inválido'
  }

  return true
}

onMounted(() => {
  carregar()
})
</script>