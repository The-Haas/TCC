<template>
  <div class="full-width row justify-center q-px-sm q-pb-xl">
    <!-- Card Principal -->
    <q-card 
      class="shadow-10 relative-position full-width" 
      style="max-width: 800px; border-radius: 28px; margin-top: 60px;"
      :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-grey-9'"
    >
      
      <!-- Avatar Flutuante Premium -->
      <div class="absolute-top row justify-center" style="top: -55px; left: 0; right: 0; z-index: 2;">
        <q-avatar size="110px" class="shadow-5" 
          :style="{ 
            background: $q.dark.isActive ? '#1d1d1d' : '#ffffff', 
            border: '4px solid var(--q-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }">
          <span class="text-primary text-weight-bolder" style="font-size: 40px; letter-spacing: -1px; margin: 0; padding: 0;">
            {{ iniciaisAvatar }}
          </span>
        </q-avatar>
      </div>

      <!-- Loading Overlay -->
      <q-inner-loading :showing="loadingData" label="Carregando seu perfil..." label-class="text-primary" label-style="font-size: 1.1em; font-weight: bold;" style="border-radius: 28px; z-index: 10;" />

      <!-- Cabeçalho -->
      <q-card-section class="text-center q-pt-xl q-pb-md" style="margin-top: 20px;">
        <div class="text-h5 text-weight-bolder text-primary">{{ form.nome || 'Meu Perfil' }}</div>
        <div class="text-body2 q-mt-xs" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">
          Atualize seus dados de acesso e segurança
        </div>
      </q-card-section>

      <q-card-section class="q-px-md q-px-sm-xl q-pb-lg">
        <q-form @submit.prevent="salvar">
          
          <!-- ABAS ESTILO BOTÃO -->
          <div class="row justify-center q-mb-lg">
            <q-tabs
              v-model="tab"
              class="text-grey-7"
              :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
              active-color="white"
              active-bg-color="primary"
              indicator-color="transparent"
              align="justify"
              narrow-indicator
              :inline-label="!$q.screen.lt.sm"
              dense
              style="border-radius: 12px; padding: 4px; max-width: 400px; width: 100%;"
            >
              <q-tab name="pessoais" icon="person" label="Conta" style="border-radius: 8px;" class="q-px-xs q-py-xs" />
              <q-tab name="seguranca" icon="shield" label="Segurança" style="border-radius: 8px;" class="q-px-xs q-py-xs" />
            </q-tabs>
          </div>

          <!-- CONTEÚDO DAS ABAS -->
          <q-tab-panels 
            v-model="tab" 
            animated 
            swipeable 
            class="bg-transparent"
          >
            
            <!-- ABA 1: DADOS DA CONTA -->
            <q-tab-panel name="pessoais" class="q-px-none q-py-none">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input v-model="form.nome" label="Nome *" outlined dense color="primary" 
                    :rules="[val => !!val || 'Obrigatório']" hide-bottom-space />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="form.email" label="E-mail *" outlined dense type="email" color="primary" 
                    :rules="[val => !!val || 'Obrigatório']" hide-bottom-space />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="form.telefone" label="Telefone" outlined dense mask="(##) #####-####" unmasked-value color="primary" hide-bottom-space />
                </div>

                <!-- DADOS VINCULADOS (Somente Leitura) -->
                <div class="col-12 q-mt-md" v-if="form.nome_representante">
                  <q-input v-model="form.nome_representante" label="Representante Vinculado" outlined dense readonly :bg-color="$q.dark.isActive ? 'dark' : 'grey-2'" hide-bottom-space>
                    <template v-slot:prepend>
                      <q-icon name="handshake" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- METADADOS DE CRIAÇÃO (Somente Leitura) -->
              <div class="row justify-between items-center q-mt-lg q-pt-md" style="border-top: 1px dashed rgba(128,128,128,0.3);">
                <div class="text-caption text-grey-5 font-11">
                  Criado em: <span class="text-weight-medium" :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-7'">{{ formatarData(form.created_at) }}</span>
                </div>
                <div class="text-caption text-grey-5 font-11">
                  Última modificação: <span class="text-weight-medium" :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-7'">{{ formatarData(form.updated_at) }}</span>
                </div>
              </div>
            </q-tab-panel>

            <!-- ABA 2: SEGURANÇA -->
            <q-tab-panel name="seguranca" class="q-px-none q-py-none flex flex-center">
              <div class="full-width text-center" style="max-width: 440px;">
                <q-icon name="lock_outline" size="64px" color="primary" class="q-mb-sm opacity-50" />
                <div class="text-h6 text-weight-bold q-mb-sm">Alterar Senha</div>
                <div class="text-body2 text-grey q-mb-lg">
                  Para manter sua senha atual, deixe os campos abaixo vazios.
                </div>
                
                <!-- Nova Senha -->
                <q-input 
                  v-model="form.senha" 
                  label="Nova Senha" 
                  outlined
                  dense 
                  :type="isPwd ? 'password' : 'text'" 
                  color="primary" 
                  class="q-mb-md"
                  placeholder="••••••••"
                  :rules="[val => !val || val.length >= 6 || 'Mínimo de 6 caracteres']"
                  hide-bottom-space
                >
                  <template v-slot:prepend>
                    <q-icon name="key" />
                  </template>
                  <template v-slot:append>
                    <q-icon 
                      :name="isPwd ? 'visibility_off' : 'visibility'" 
                      class="cursor-pointer" 
                      @click="isPwd = !isPwd" 
                    />
                  </template>
                </q-input>

                <!-- Confirmar Nova Senha -->
                <q-input 
                  v-model="confirmarSenha" 
                  label="Confirmar Nova Senha" 
                  outlined
                  dense 
                  :type="isPwdConfirm ? 'password' : 'text'" 
                  color="primary"
                  placeholder="••••••••"
                  :rules="[val => val === form.senha || 'As senhas não coincidem']"
                  hide-bottom-space
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                  <template v-slot:append>
                    <q-icon 
                      :name="isPwdConfirm ? 'visibility_off' : 'visibility'" 
                      class="cursor-pointer" 
                      @click="isPwdConfirm = !isPwdConfirm" 
                    />
                  </template>
                </q-input>
              </div>
            </q-tab-panel>

          </q-tab-panels>

          <q-separator class="q-mt-md q-mb-md" :dark="$q.dark.isActive" style="opacity: 0.3;" />

          <!-- BOTÕES AÇÃO -->
          <div class="row q-col-gutter-sm justify-between items-center" :class="$q.screen.lt.sm ? 'column' : ''">
            <div :class="$q.screen.lt.sm ? 'col-12 order-last q-mt-sm' : 'col-auto'">
              <q-btn label="Cancelar e Voltar" color="grey-6" flat to="/dashboard" rounded no-caps class="full-width" size="16px" />
            </div>
            <div :class="$q.screen.lt.sm ? 'col-12' : 'col-auto'">
              <q-btn label="Salvar Alterações" color="primary" type="submit" :loading="loadingSubmit" unelevated rounded no-caps class="full-width text-weight-bold shadow-4" size="16px" />
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

const loadingData = ref(true)
const loadingSubmit = ref(false)
const tab = ref('pessoais') 

const isPwd = ref(true)
const isPwdConfirm = ref(true)
const confirmarSenha = ref('')

const form = ref({
  nome: '', 
  email: '', 
  telefone: '', 
  senha: '',
  nome_representante: '',
  created_at: null,
  updated_at: null
})

// Endpoint dinâmico como no seu código original
const getEndpoint = () => {
  const tipo = authStore.userTipo
  if (tipo === 'admin') return 'admins'
  if (tipo === 'lojista') return 'lojistas'
  return 'representantes'
}

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

function formatarData(dataISO) {
  if (!dataISO) return '---'
  return new Date(dataISO).toLocaleString('pt-BR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  })
}

const carregar = async () => {
  try {
    loadingData.value = true
    const { data } = await api.get(`/${getEndpoint()}/${authStore.userId}`)
    
    form.value.nome = data.nome || ''
    form.value.email = data.email || ''
    form.value.telefone = data.telefone || ''
    form.value.nome_representante = data.nome_representante || ''
    form.value.created_at = data.created_at || null
    form.value.updated_at = data.updated_at || null
    
    form.value.senha = ''
    confirmarSenha.value = ''
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Erro ao carregar perfil.', position: 'top-right' })
  } finally {
    loadingData.value = false
  }
}

const salvar = async () => {
  if (!form.value.nome || !form.value.email) {
    tab.value = 'pessoais'
    $q.notify({ type: 'warning', message: 'Preencha os campos obrigatórios (Nome e E-mail).', position: 'top-right' })
    return
  }

  if (form.value.senha && form.value.senha !== confirmarSenha.value) {
    tab.value = 'seguranca'
    $q.notify({ type: 'negative', message: 'As senhas não coincidem.', position: 'top-right' })
    return
  }

  $q.dialog({
    title: 'Salvar alterações',
    message: 'Deseja realmente atualizar as informações do seu perfil?',
    class: $q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-grey-9',
    style: 'border-radius: 16px; border-top: 4px solid var(--q-primary); box-shadow: 0 10px 30px rgba(0,0,0,0.1);',
    cancel: { 
      label: 'Cancelar', color: 'grey-6', flat: true, noCaps: true, class: 'text-weight-medium q-px-md'
    },
    ok: { 
      label: 'Confirmar e Salvar', color: 'primary', unelevated: true, noCaps: true, icon: 'save', class: 'text-weight-bold q-px-md'
    },
    persistent: true
  }).onOk(async () => {
    try {
      loadingSubmit.value = true
      
      // Monta o payload SÓ com o que pode ser atualizado (nome, email, telefone, senha)
      const payload = {
        nome: form.value.nome,
        email: form.value.email,
        telefone: form.value.telefone
      }

      if (form.value.senha) {
        payload.senha = form.value.senha
      }

      // AGORA SIM, USANDO PATCH!
      await api.patch(`/${getEndpoint()}/${authStore.userId}`, payload)
      
      authStore.userName = form.value.nome
      
      $q.notify({ 
        type: 'positive', 
        message: 'Perfil atualizado com sucesso!', 
        position: 'top-right',
        icon: 'check_circle'
      })
      
      form.value.senha = ''
      confirmarSenha.value = ''
      
      // Atualiza os dados novamente para pegar o novo "updated_at" do banco
      await carregar()
      
    } catch (error) {
      console.error(error)
      $q.notify({ 
        type: 'negative', 
        message: error.response?.data?.message || 'Erro ao salvar as alterações.', 
        position: 'top-right' 
      })
    } finally {
      loadingSubmit.value = false
    }
  })
}

onMounted(carregar)
</script>

<style scoped>
.font-11 { font-size: 11px; }
</style>