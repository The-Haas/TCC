<template>
  <div class="forgot-container">
    <q-card class="forgot-card shadow-10">
      
      <!-- ── Cabeçalho com Ícone Dinâmico ── -->
      <q-card-section class="text-center q-pb-none">
        <div class="icon-wrapper q-mx-auto q-mb-md">
          <q-icon :name="etapa === 1 ? 'mark_email_read' : 'vpn_key'" size="32px" color="orange" />
        </div>
        <h2 class="form-title">{{ etapa === 1 ? 'Recuperar Senha' : 'Criar Nova Senha' }}</h2>
        <p class="form-sub q-mt-xs">
          {{ etapa === 1 
            ? 'Digite seu e-mail para receber o código de segurança.' 
            : 'Enviamos um código para o seu e-mail. Digite-o abaixo.' 
          }}
        </p>
      </q-card-section>

      <q-card-section>
        <!-- Transição suave entre as etapas -->
        <transition name="slide-fade" mode="out-in">
          
          <!-- ── ETAPA 1: Solicitar E-mail ── -->
          <q-form v-if="etapa === 1" @submit.prevent="solicitarCodigo" class="q-gutter-y-sm" key="step1">
            <div class="field-group q-mt-md">
              <label class="field-label">E-mail cadastrado</label>
              <q-input
                v-model="email"
                type="email"
                placeholder="seu@email.com"
                outlined dense dark
                bg-color="grey-9"
                color="orange"
                :rules="[val => !!val || 'O e-mail é obrigatório']"
              >
                <template #prepend>
                  <q-icon name="mail_outline" size="18px" color="grey-6" />
                </template>
              </q-input>
            </div>

            <q-btn
              label="Enviar Código"
              type="submit"
              unelevated no-caps
              class="action-btn full-width q-mt-md"
              :loading="loading"
            >
              <template #loading>
                <q-spinner-tail color="white" size="1.2em" />
              </template>
            </q-btn>
            
            <div class="text-center q-mt-lg">
              <q-btn flat no-caps label="Voltar para o Login" to="/login" class="back-link" />
            </div>
          </q-form>

          <!-- ── ETAPA 2: Código e Nova Senha ── -->
          <q-form v-else @submit.prevent="redefinirSenha" class="q-gutter-y-sm" key="step2">
            
            <!-- Aviso visual mostrando onde o código foi enviado -->
            <div class="email-badge q-mb-md q-mt-sm">
              <q-icon name="check_circle" color="positive" size="16px" class="q-mr-xs" />
              Código enviado para: <strong>{{ email }}</strong>
            </div>

            <div class="field-group">
              <label class="field-label">Código de 6 dígitos</label>
              <q-input
                v-model="codigo"
                type="text"
                mask="######"
                placeholder="000000"
                outlined dense dark
                bg-color="grey-9"
                color="orange"
                :rules="[val => val && val.length === 6 || 'Digite os 6 dígitos']"
              >
                <template #prepend>
                  <q-icon name="pin" size="18px" color="grey-6" />
                </template>
              </q-input>
            </div>

            <div class="field-group">
              <label class="field-label">Nova Senha</label>
              <q-input
                v-model="novaSenha"
                :type="showNovaSenha ? 'text' : 'password'"
                placeholder="••••••••"
                outlined dense dark
                bg-color="grey-9"
                color="orange"
                :rules="[val => val && val.length >= 8 || 'Mínimo 8 caracteres']"
              >
                <template #prepend>
                  <q-icon name="lock_outline" size="18px" color="grey-6" />
                </template>
                <template #append>
                  <q-icon
                    :name="showNovaSenha ? 'visibility_off' : 'visibility'"
                    size="18px" color="grey-6"
                    class="cursor-pointer"
                    @click="showNovaSenha = !showNovaSenha"
                  />
                </template>
              </q-input>
            </div>

            <div class="field-group">
              <label class="field-label">Confirmar Senha</label>
              <q-input
                v-model="confirmarSenha"
                :type="showConfirmarSenha ? 'text' : 'password'"
                placeholder="••••••••"
                outlined dense dark
                bg-color="grey-9"
                color="orange"
                :rules="[
                  val => !!val || 'Confirme sua senha',
                  val => val === novaSenha || 'As senhas não coincidem'
                ]"
              >
                <template #prepend>
                  <q-icon name="check_circle_outline" size="18px" color="grey-6" />
                </template>
                <template #append>
                  <q-icon
                    :name="showConfirmarSenha ? 'visibility_off' : 'visibility'"
                    size="18px" color="grey-6"
                    class="cursor-pointer"
                    @click="showConfirmarSenha = !showConfirmarSenha"
                  />
                </template>
              </q-input>
            </div>

            <q-btn
              label="Alterar Senha"
              type="submit"
              unelevated no-caps
              class="action-btn full-width q-mt-md"
              :loading="loading"
            >
              <template #loading>
                <q-spinner-tail color="white" size="1.2em" />
              </template>
            </q-btn>

            <div class="text-center q-mt-md">
              <q-btn flat no-caps label="Informou o e-mail errado? Voltar" @click="etapa = 1" class="back-link" />
            </div>
          </q-form>

        </transition>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()
const router = useRouter()

const etapa = ref(1) // 1 = Pedir e-mail | 2 = Redefinir senha
const loading = ref(false)

const email = ref('')
const codigo = ref('')
const novaSenha = ref('')
const confirmarSenha = ref('')

// Variáveis para alternar a visualização da senha
const showNovaSenha = ref(false)
const showConfirmarSenha = ref(false)

const solicitarCodigo = async () => {
  loading.value = true
  try {
    const response = await api.post('/resetsenha', { email: email.value })
    
    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: response.data.message || 'Código enviado para o seu e-mail!',
        position: 'top'
      })
      etapa.value = 2
    }
  } catch (error) {
    const msg = error.response?.data?.message || 'Erro ao solicitar código.'
    $q.notify({ type: 'negative', message: msg, position: 'top' })
  } finally {
    loading.value = false
  }
}

const redefinirSenha = async () => {
  loading.value = true
  try {
    const response = await api.post('/redefinir-senha', {
      email: email.value,
      codigo: codigo.value,
      novaSenha: novaSenha.value
    })
    
    if (response.data.success) {
      $q.notify({
        type: 'positive',
        message: 'Senha redefinida com sucesso! Faça login.',
        position: 'top'
      })
      router.push('/login') 
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
.forgot-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.forgot-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  background: #161b22;
  border: 1px solid rgba(255, 123, 0, 0.15);
  padding: 10px;
}

/* ── Ícone do Topo ── */
.icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 123, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 123, 0, 0.2);
}

/* ── Textos ── */
.form-title {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.3px;
}
.form-sub {
  font-size: 13px;
  color: rgba(255,255,255,.5);
  margin: 0;
}

/* ── Labels dos inputs ── */
.field-group { margin-bottom: 6px; }
.field-label {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: .7px;
  text-transform: uppercase;
  color: rgba(255,255,255,.5);
  margin-bottom: 6px;
}

/* ── Etiqueta de E-mail ── */
.email-badge {
  background: rgba(33, 186, 69, 0.1);
  border: 1px solid rgba(33, 186, 69, 0.3);
  color: #a5d6a7;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.email-badge strong {
  color: #fff;
  margin-left: 4px;
}

/* ── Botão Principal ── */
.action-btn {
  background: #ff7b00 !important;
  color: #fff !important;
  height: 46px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: .3px;
  box-shadow: 0 8px 24px rgba(255,123,0,.35) !important;
  transition: transform .15s, box-shadow .15s;
}
.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255,123,0,.48) !important;
}

/* ── Links ── */
.back-link {
  font-size: 12.5px;
  color: rgba(255,255,255,.45) !important;
  transition: color 0.2s ease;
}
.back-link:hover {
  color: #ff7b00 !important;
}

/* ── Animação (Transition) ── */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>