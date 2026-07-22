<template>
  <div class="full-width q-pa-md q-pa-md-lg" style="max-width: 1100px; margin: 0 auto;">
    
    <!-- Cabeçalho Principal da Página -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="row items-center gap-md">
        <q-avatar size="48px" color="primary" text-color="white" class="shadow-2">
          <q-icon name="settings" size="28px" />
        </q-avatar>
        <div>
          <div class="text-h5 text-weight-bold" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">
            Configurações do Sistema
          </div>
          <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">
            Gerencie as preferências e integrações globais da plataforma Artezza
          </div>
        </div>
      </div>
    </div>

    <!-- Layout com Abas e Conteúdo -->
    <q-card 
      flat 
      bordered 
      class="shadow-10" 
      style="border-radius: 20px; overflow: hidden;"
      :class="$q.dark.isActive ? 'bg-dark-card border-dark' : 'bg-white'"
    >
      <!-- Overlay de Carregamento -->
      <q-inner-loading 
        :showing="loadingData" 
        label="Carregando parâmetros do sistema..." 
        label-class="text-primary text-weight-bold" 
        style="z-index: 10;" 
      />

      <!-- Barra de Abas Superior -->
      <q-tabs
        v-model="tab"
        dense
        align="left"
        active-color="primary"
        indicator-color="primary"
        class="q-px-md q-pt-sm"
        :class="$q.dark.isActive ? 'bg-dark-tabs text-grey-4' : 'bg-grey-2 text-grey-8'"
      >
        <q-tab name="email" icon="mail_outline" label="E-mail (SMTP)" class="q-px-md text-weight-medium" />
      </q-tabs>

      <q-separator :dark="$q.dark.isActive" style="opacity: 0.2;" />

      <!-- Conteúdo das Abas -->
      <q-tab-panels v-model="tab" animated class="bg-transparent">
        
        <!-- ABA: E-MAIL (SMTP) -->
        <q-tab-panel name="email" class="q-pa-md q-pa-md-xl">
          <q-form @submit.prevent="salvar">
            
            <!-- Título da Seção Interna -->
            <div class="row items-center q-mb-lg">
              <q-icon name="mark_email_read" color="primary" size="24px" class="q-mr-sm" />
              <div>
                <div class="text-subtitle1 text-weight-bold" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">
                  Servidor de Disparo SMTP
                </div>
                <div class="text-caption text-grey-5">
                  Credenciais utilizadas para o envio automático de links de recuperação de senha e e-mails do sistema.
                </div>
              </div>
            </div>

            <!-- Formulário em Grid -->
            <div class="row q-col-gutter-md">
              
              <!-- Servidor SMTP -->
              <div class="col-12 col-md-8">
                <div class="text-caption text-weight-bold q-mb-xs" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">
                  Servidor Host *
                </div>
                <q-input 
                  v-model="form.smtp_host" 
                  outlined 
                  dense 
                  color="primary" 
                  placeholder="ex: smtp.seuprovedor.com.br"
                  :rules="[val => !!val || 'O Host do servidor é obrigatório']" 
                  hide-bottom-space 
                >
                  <template v-slot:prepend>
                    <q-icon name="dns" size="20px" />
                  </template>
                </q-input>
              </div>

              <!-- Porta SMTP -->
              <div class="col-12 col-md-4">
                <div class="text-caption text-weight-bold q-mb-xs" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">
                  Porta *
                </div>
                <q-input 
                  v-model.number="form.smtp_port" 
                  outlined 
                  dense 
                  type="number"
                  color="primary" 
                  placeholder="465 ou 587"
                  :rules="[val => !!val || 'A porta é obrigatória']" 
                  hide-bottom-space 
                >
                  <template v-slot:prepend>
                    <q-icon name="tag" size="20px" />
                  </template>
                </q-input>
              </div>

              <!-- E-mail / Usuário SMTP -->
              <div class="col-12 col-md-6">
                <div class="text-caption text-weight-bold q-mb-xs" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">
                  E-mail / Usuário *
                </div>
                <q-input 
                  v-model="form.smtp_user" 
                  outlined 
                  dense 
                  type="email" 
                  color="primary" 
                  placeholder="ex: nao-responda@artezza.com.br"
                  :rules="[val => !!val || 'O e-mail de envio é obrigatório']" 
                  hide-bottom-space 
                >
                  <template v-slot:prepend>
                    <q-icon name="alternate_email" size="20px" />
                  </template>
                </q-input>
              </div>

              <!-- Senha SMTP -->
              <div class="col-12 col-md-6">
                <div class="text-caption text-weight-bold q-mb-xs" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">
                  Senha de Autenticação *
                </div>
                <q-input 
                  v-model="form.smtp_pass" 
                  outlined
                  dense 
                  :type="isPwd ? 'password' : 'text'" 
                  color="primary" 
                  placeholder="••••••••••••"
                  :rules="[val => !!val || 'A senha é obrigatória']"
                  hide-bottom-space
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" size="20px" />
                  </template>
                  <template v-slot:append>
                    <q-icon 
                      :name="isPwd ? 'visibility_off' : 'visibility'" 
                      class="cursor-pointer" 
                      @click="isPwd = !isPwd" 
                    />
                  </template>
                </q-input>
              </div>

              <!-- Opção Conexão Segura (SSL/TLS) -->
              <div class="col-12">
                <q-card flat bordered class="q-pa-sm q-mt-xs" :class="$q.dark.isActive ? 'bg-dark-inner border-dark' : 'bg-grey-1'">
                  <q-item tag="label" v-ripple class="q-px-none">
                    <q-item-section avatar>
                      <q-toggle v-model="form.smtp_secure" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold" style="font-size: 13.5px;">
                        Usar Conexão Criptografada (SSL / TLS)
                      </q-item-label>
                      <q-item-label caption :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">
                        Recomendado ativo caso esteja utilizando a porta 465. Para porta 587, consulte o seu provedor.
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-card>
              </div>

            </div>

            <!-- Informações de Atualização & Rodapé de Ações -->
            <div class="row justify-between items-center q-mt-xl q-pt-md" style="border-top: 1px dashed rgba(128,128,128,0.25);">
              <div class="text-caption text-grey-5 font-11">
                Última alteração salva em: 
                <span class="text-weight-bold" :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'">
                  {{ formatarData(form.updated_at) }}
                </span>
              </div>

              <div class="row gap-sm items-center">
                <q-btn 
                  label="Cancelar" 
                  color="grey-6" 
                  flat 
                  to="/dashboard" 
                  no-caps 
                  class="q-px-md" 
                />
                <q-btn 
                  label="Salvar Configurações" 
                  color="primary" 
                  type="submit" 
                  :loading="loadingSubmit" 
                  unelevated 
                  no-caps 
                  icon="save" 
                  class="text-weight-bold q-px-lg shadow-4" 
                  style="border-radius: 10px;"
                />
              </div>
            </div>

          </q-form>
        </q-tab-panel>

      </q-tab-panels>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()

const tab = ref('email')
const loadingData = ref(true)
const loadingSubmit = ref(false)
const isPwd = ref(true)

const form = ref({
  smtp_host: '',
  smtp_port: 465,
  smtp_user: '',
  smtp_pass: '',
  smtp_secure: true,
  updated_at: null
})

function formatarData(dataISO) {
  if (!dataISO) return 'Nunca alterado'
  return new Date(dataISO).toLocaleString('pt-BR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  })
}

const carregar = async () => {
  try {
    loadingData.value = true
    const { data } = await api.get('/configuracoes')
    const config = data.data || data

    if (config) {
      form.value.smtp_host = config.smtp_host || ''
      form.value.smtp_port = config.smtp_port || 465
      form.value.smtp_user = config.smtp_user || ''
      form.value.smtp_pass = config.smtp_pass || ''
      form.value.smtp_secure = config.smtp_secure ?? true
      form.value.updated_at = config.updated_at || null
    }
  } catch (error) {
    console.error(error)
    $q.notify({ 
      type: 'negative', 
      message: 'Erro ao carregar configurações do sistema.', 
      position: 'top-right' 
    })
  } finally {
    loadingData.value = false
  }
}

const salvar = async () => {
  if (!form.value.smtp_host || !form.value.smtp_user || !form.value.smtp_pass) {
    $q.notify({ 
      type: 'warning', 
      message: 'Preencha todos os campos obrigatórios do servidor SMTP.', 
      position: 'top-right' 
    })
    return
  }

  $q.dialog({
    title: 'Confirmar alterações',
    message: 'Deseja realmente atualizar os parâmetros do servidor SMTP no banco de dados?',
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
      
      const payload = {
        smtp_host: form.value.smtp_host,
        smtp_port: Number(form.value.smtp_port),
        smtp_user: form.value.smtp_user,
        smtp_pass: form.value.smtp_pass,
        smtp_secure: form.value.smtp_secure
      }

      await api.patch('/configuracoes', payload)
      
      $q.notify({ 
        type: 'positive', 
        message: 'Configurações salvas com sucesso!', 
        position: 'top-right',
        icon: 'check_circle'
      })
      
      await carregar()
      
    } catch (error) {
      console.error(error)
      $q.notify({ 
        type: 'negative', 
        message: error.response?.data?.message || 'Erro ao salvar as configurações.', 
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
.font-11 { 
  font-size: 11px; 
}
.gap-sm {
  gap: 8px;
}
.gap-md {
  gap: 16px;
}

/* Customização dos tons pretos/escuros para Dark Mode */
.bg-dark-card {
  background: #181818 !important;
}
.bg-dark-tabs {
  background: #121212 !important;
}
.bg-dark-inner {
  background: #212121 !important;
}
.border-dark {
  border-color: rgba(255, 255, 255, 0.08) !important;
}
</style>