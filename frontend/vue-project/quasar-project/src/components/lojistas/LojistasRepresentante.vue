<template>
  <div class="column fit">
    <!-- Filtros e Ações -->
    <q-card class="filter-card q-mb-lg"
      :class="isDark ? 'bg-dark-card border-dark-sharp' : 'bg-white border-light-sharp'" flat>
      <q-card-section class="row q-col-gutter-md items-center justify-between">
        <div class="col-12 col-md-5">
          <q-input v-model="busca" dense outlined :dark="isDark" debounce="300"
            placeholder="Pesquisar por nome, email ou telefone..." clearable>
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>
        </div>

        <!-- Botão Novo Lojista -->
        <div class="col-12 col-md-auto text-right" v-if="podeEditar">
          <q-btn color="primary" icon="add" label="Novo Lojista" no-caps unevaluated class="text-weight-bold radius-8"
            @click="abrirNovo" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Container da Tabela -->
    <div class="clientes-container col-grow">
      <q-card flat class="modern-card fit"
        :class="isDark ? 'bg-dark-card border-dark-sharp' : 'bg-white border-light-sharp'">
        <q-table hide-bottom flat :rows="lojistas" :columns="colunasVisiveis" row-key="id" :loading="loading"
          :filter="busca" :dark="isDark" v-model:pagination="paginacao" no-data-label="Nenhum lojista na sua carteira."
          no-results-label="Nenhum registro corresponde à sua busca." card-class="transparent"
          table-class="modern-table" table-header-class="modern-header" @row-click="handleRowClick">
          <!-- Célula: ID -->
          <template v-slot:body-cell-id="props">
            <q-td :props="props" class="text-mono text-weight-bold" :class="isDark ? 'text-grey-5' : 'text-grey-6'"
              style="font-size: 13px;">
              #{{ props.row.id }}
            </q-td>
          </template>

          <!-- Célula: Nome -->
          <template v-slot:body-cell-nome="props">
            <q-td :props="props">
              <div class="text-weight-bold text-subtitle2" :class="isDark ? 'text-white' : 'text-slate-main'">
                {{ props.row.nome }}
              </div>
            </q-td>
          </template>

          <!-- Célula: Contato -->
          <template v-slot:body-cell-contato="props">
            <q-td :props="props">
              <div class="text-weight-semibold text-slate-main font-13 flex items-center">
                <q-icon name="phone" size="14px" class="q-mr-xs text-grey-5" />
                {{ formatarTelefone(props.row.telefone) }}
              </div>
              <div class="text-caption text-grey-5 font-12 flex items-center q-mt-xs">
                <q-icon name="mail" size="14px" class="q-mr-xs text-grey-5" />
                {{ props.row.email || '---' }}
              </div>
            </q-td>
          </template>

          <!-- Célula: Ações -->
          <template v-slot:body-cell-acoes="props" v-if="podeEditar || true">
            <q-td :props="props" class="text-right">
              <!-- Botão de Editar -->
              <q-btn flat round dense icon="edit" color="primary" size="sm" class="action-btn"
                @click.stop="abrirEdicao(props.row)" />

              <!-- Botão de Excluir -->
              <q-btn flat round dense icon="delete" color="negative" size="sm" class="action-btn q-ml-sm"
                @click.stop="confirmarExclusao(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Rodapé de Paginação Independente -->
    <div class="pagination-footer q-mt-md q-pt-md row full-width justify-between items-center mt-auto">
      <div class="row items-center q-gutter-x-sm">
        <span class="text-caption text-weight-medium gt-xs"
          :class="isDark ? 'text-grey-5' : 'text-grey-6'">Mostrar</span>
        <q-select v-model="paginacao.rowsPerPage" :options="[5, 10, 20, 50]" dense outlined :dark="isDark"
          style="min-width: 65px" />
        <span class="text-caption text-weight-medium" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
          <span class="gt-xs">por página</span>
          <span class="lt-sm">itens</span>
        </span>
      </div>
      <q-pagination v-model="paginacao.page" :max="numeroDePaginas" :max-pages="5" direction-links boundary-numbers
        round flat :color="isDark ? 'grey-4' : 'grey-8'" active-color="primary" active-text-color="white" size="14px" />
    </div>

    <!-- Modal de Formulário (Edição / Criação) -->
    <q-dialog v-model="modalEdicao" transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 600px; border-radius: 14px;"
        :class="isDark ? 'bg-dark-modal text-white' : 'bg-white text-grey-9'">
        <q-card-section class="row items-center q-px-xl q-py-lg header-border">
          <div>
            <div class="text-h6 text-weight-bold tracking-tight text-slate-main flex items-center">
              <q-icon :name="lojistaEditando.id ? 'manage_accounts' : 'person_add'" color="primary" size="24px"
                class="q-mr-sm" />
              {{ lojistaEditando.id ? 'Atualizar Lojista' : 'Novo Lojista' }}
            </div>
            <div v-if="lojistaEditando.id" class="text-caption text-grey-5 font-12 q-mt-xs">Registro único: #{{
              lojistaEditando.id }}</div>
            <div v-else class="text-caption text-grey-5 font-12 q-mt-xs">Preencha os dados para adicionar à sua carteira
            </div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup :disable="salvando" class="text-grey-4" />
        </q-card-section>

        <q-card-section class="q-px-xl q-py-lg scroll layout-body">
          <q-form @submit.prevent="salvarLojista" ref="formLojista" class="row q-col-gutter-lg">

            <!-- Dados de Contato / Identificação -->
            <div class="col-12">
              <div class="inner-section-card" :class="isDark ? 'bg-dark-inner' : 'bg-slate-light'">
                <div class="form-section-title q-mb-md">Informações Básicas</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-input v-model="lojistaEditando.nome" label="Nome do Lojista *" outlined dense :dark="isDark"
                      :rules="[val => !!val || 'Campo obrigatório', val => val.trim().length >= 3 || 'O nome é muito curto']" 
                      hide-bottom-space class="premium-field" />
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-input v-model="lojistaEditando.telefone" label="Telefone (Apenas números) *" outlined dense
                      :dark="isDark" maxlength="11"
                      @update:model-value="val => lojistaEditando.telefone = val ? val.replace(/\D/g, '') : ''"
                      :rules="[val => !!val || 'Telefone é obrigatório', validarTelefone]"
                      hide-bottom-space class="premium-field" />
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-input v-model="lojistaEditando.email" label="E-mail *" outlined dense :dark="isDark" type="email"
                      :rules="[val => !!val || 'E-mail é obrigatório', validarEmail]"
                      hide-bottom-space class="premium-field" />
                  </div>

                  <!-- Senha (Aparece apenas na criação de um novo lojista) -->
                  <div class="col-12" v-if="!lojistaEditando.id">
                    <q-input v-model="lojistaEditando.senha" label="Senha de Acesso *" outlined dense :dark="isDark"
                      :type="ocultarSenha ? 'password' : 'text'"
                      :rules="[
                        val => !!val || 'A senha é obrigatória para novos cadastros',
                        validarSenhaForte
                      ]" 
                      hide-bottom-space class="premium-field">
                      <template v-slot:append>
                        <q-icon :name="ocultarSenha ? 'visibility_off' : 'visibility'"
                          class="cursor-pointer text-grey-5" @click="ocultarSenha = !ocultarSenha" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>
            </div>

            <!-- Metadados de Data (Ocultos se for novo cadastro) -->
            <div v-if="lojistaEditando.id" class="col-12 row justify-between items-center metadata-row q-pt-sm">
              <div class="text-caption text-grey-5 font-11">
                Criado em: <span class="text-weight-medium" :class="isDark ? 'text-grey-3' : 'text-grey-7'">{{
                  formatarData(lojistaEditando.created_at) }}</span>
              </div>
              <div class="text-caption text-grey-5 font-11">
                Última modificação: <span class="text-weight-medium" :class="isDark ? 'text-grey-3' : 'text-grey-7'">{{
                  formatarData(lojistaEditando.updated_at) }}</span>
              </div>
            </div>

            <!-- Botões -->
            <div class="col-12 row justify-end q-gutter-x-md q-mt-lg">
              <q-btn label="Cancelar" color="grey-6" flat v-close-popup :disable="salvando" no-caps
                class="text-weight-bold font-14" />
              <q-btn v-if="podeEditar" :label="lojistaEditando.id ? 'Salvar Alterações' : 'Cadastrar Lojista'"
                color="primary" type="submit" :loading="salvando" unevaluated no-caps
                class="text-weight-bold px-xl font-14 radius-8" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'

const props = defineProps({
  podeEditar: {
    type: Boolean,
    default: false
  }
})

const $q = useQuasar()
const authStore = useAuthStore()
const isDark = computed(() => $q.dark.isActive)

// Referência do formulário para validação
const formLojista = ref(null)

const loading = ref(true)
const lojistas = ref([])
const busca = ref('')

const paginacao = ref({
  sortBy: 'nome',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

const modalEdicao = ref(false)
const salvando = ref(false)
const lojistaEditando = ref({})
const ocultarSenha = ref(true)

// --- FUNÇÕES DE VALIDAÇÃO ---
const validarEmail = (email) => {
  if (!email) return true 
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email) || 'Formato de e-mail inválido'
}

const validarTelefone = (tel) => {
  if (!tel) return true
  const limpo = String(tel).replace(/\D/g, '')
  return (limpo.length >= 10 && limpo.length <= 11) || 'Telefone deve ter DDD + 8 ou 9 dígitos'
}

const validarSenhaForte = (senha) => {
  if (!senha) return true 
  
  if (senha.length < 8) return 'A senha deve ter no mínimo 8 caracteres'
  if (!/[A-Z]/.test(senha)) return 'Deve conter pelo menos uma letra maiúscula'
  if (!/[a-z]/.test(senha)) return 'Deve conter pelo menos uma letra minúscula'
  if (!/[0-9]/.test(senha)) return 'Deve conter pelo menos um número'
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) return 'Deve conter pelo menos um caractere especial'
  
  return true
}
// ----------------------------

// Cálculo Dinâmico das Páginas
const numeroDePaginas = computed(() => {
  let total = lojistas.value.length

  if (busca.value) {
    const termo = String(busca.value).toLowerCase()
    total = lojistas.value.filter(row => {
      return Object.values(row).some(val =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(termo)
      )
    }).length
  }

  const limit = paginacao.value.rowsPerPage
  return limit === 0 ? 1 : Math.ceil(total / limit) || 1
})

// Configuração das colunas (Exibindo apenas os dados permitidos)
const colunasBase = [
  { name: 'id', field: 'id', label: 'ID', align: 'left', sortable: true, style: 'width: 70px' },
  { name: 'nome', field: 'nome', label: 'Lojista', align: 'left', sortable: true },
  { name: 'contato', field: 'telefone', label: 'Contato', align: 'left' },
  { name: 'acoes', field: 'acoes', label: '', align: 'right', style: 'width: 60px' }
]

// Esconde a coluna de ações se não puder editar
const colunasVisiveis = computed(() => {
  if (props.podeEditar) return colunasBase
  return colunasBase.filter(col => col.name !== 'acoes')
})

async function carregarLojistas() {
  loading.value = true
  try {
    const response = await api.get('/lojistas', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    lojistas.value = response.data.data || response.data || []
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Erro ao carregar a lista de lojistas.' })
  } finally {
    loading.value = false
  }
}

function handleRowClick(evt, row) {
  if (!props.podeEditar) return
  abrirEdicao(row)
}

function abrirEdicao(lojista) {
  lojistaEditando.value = JSON.parse(JSON.stringify(lojista))
  modalEdicao.value = true
}

function abrirNovo() {
  lojistaEditando.value = {
    nome: '',
    email: '',
    telefone: '',
    senha: ''
  }
  ocultarSenha.value = true
  modalEdicao.value = true
}

async function salvarLojista() {
  // Trava para validar os campos antes do envio
  const isFormValid = await formLojista.value.validate()
  if (!isFormValid) {
    $q.notify({
      type: 'warning',
      message: 'Existem campos inválidos. Por favor, verifique os dados preenchidos.',
      position: 'top-right'
    })
    return
  }

  salvando.value = true
  try {
    const payload = {
      nome: lojistaEditando.value.nome,
      email: lojistaEditando.value.email,
      telefone: lojistaEditando.value.telefone
    }

    if (lojistaEditando.value.id) {
      await api.patch(`/lojistas/${lojistaEditando.value.id}`, payload, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      $q.notify({ type: 'positive', message: 'Lojista atualizado com sucesso.' })
    } else {
      payload.senha = lojistaEditando.value.senha

      await api.post('/lojistas', payload, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      $q.notify({ type: 'positive', message: 'Novo lojista adicionado com sucesso.' })
    }

    modalEdicao.value = false
    await carregarLojistas()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Falha ao salvar dados.'
    })
  } finally {
    salvando.value = false
  }
}

function formatarData(dataISO) {
  if (!dataISO) return '---'
  return new Date(dataISO).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatarTelefone(val) {
  if (!val) return '---'
  const clean = String(val).replace(/\D/g, '')
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return val
}

function confirmarExclusao(lojista) {
  $q.dialog({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir o lojista <strong>${lojista.nome}</strong>?<br><br><span class="text-caption text-negative">Nota: Lojistas com pedidos vinculados no sistema não poderão ser excluídos.</span>`,
    html: true,
    cancel: { label: 'Cancelar', flat: true, color: 'grey-7' },
    ok: { label: 'Excluir', color: 'negative', unelevated: true },
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/lojistas/${lojista.id}`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      
      $q.notify({ type: 'positive', message: 'Lojista removido com sucesso!' })
      
      await carregarLojistas()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      $q.notify({ 
        type: 'negative', 
        message: error.response?.data?.message || 'Erro ao excluir o lojista. Verifique se ele possui pedidos vinculados.' 
      })
    }
  })
}

onMounted(() => {
  carregarLojistas()
})
</script>

<style scoped>
/* Grid & Estrutura Master */
.modern-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.border-light-sharp {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.border-dark-sharp {
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.bg-dark-card {
  background-color: #1d222b !important;
}

.bg-dark-modal {
  background-color: #14181e !important;
}

.bg-dark-inner {
  background-color: #1c2128 !important;
  border: 1px solid #2e353f;
}

/* Filtros */
.filter-card {
  border-radius: 12px;
}

/* Tabela Interativa (Row Click) */
:deep(.modern-table tbody tr) {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

:deep(.modern-table tbody tr:hover) {
  background-color: v-bind("isDark ? '#232932' : '#f8fafc'") !important;
}

:deep(.modern-table tbody tr:hover .action-btn) {
  transform: scale(1.1);
  background-color: rgba(25, 118, 210, 0.1);
}

.action-btn {
  transition: all 0.2s ease;
}

/* Customização de Cabeçalhos e Células */
:deep(.modern-header) {
  background-color: v-bind("isDark ? '#14181e' : '#f8fafc'") !important;
}

:deep(.modern-header th) {
  font-weight: 600 !important;
  color: v-bind("isDark ? '#8a94a6' : '#64748b'") !important;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.6px;
  padding: 14px 18px !important;
  border-bottom: 1px solid v-bind("isDark ? '#2e353f' : '#eaedf3'") !important;
}

:deep(.q-table tbody td) {
  padding: 16px 18px !important;
  border-bottom: 1px solid v-bind("isDark ? '#252b35' : '#f1f5f9'") !important;
}

/* Rodapé Externo de Paginação */
.pagination-footer {
  border-top: 1px dashed v-bind("isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'");
}

/* Cores de Texto e Utilitários */
.text-slate-main {
  color: v-bind("isDark ? '#f1f5f9' : '#1e293b'");
}

.text-slate-sub {
  color: v-bind("isDark ? '#cbd5e1' : '#475569'");
}

/* Visual Clean do Modal */
.header-border {
  border-bottom: 1px solid v-bind("isDark ? '#2e353f' : '#f1f5f9'");
}

.inner-section-card {
  padding: 20px;
  border-radius: 8px;
}

.bg-slate-light {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}

/* Títulos das seções */
.form-section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--q-primary) !important;
}

/* Inputs Premium */
.premium-field :deep(.q-field__control) {
  border-radius: 6px !important;
  transition: all 0.2s ease;
}

.bg-dark-modal .premium-field :deep(.q-field__control) {
  background-color: #14181e !important;
}

.bg-white .premium-field :deep(.q-field__control) {
  background-color: #ffffff !important;
}

.bg-dark-modal .premium-field :deep(.q-field__control:before) {
  border-color: #334155 !important;
}

.bg-white .premium-field :deep(.q-field__control:before) {
  border-color: #e2e8f0 !important;
}

.bg-dark-modal .premium-field :deep(.q-field__control:hover:before) {
  border-color: #475569 !important;
}

.bg-white .premium-field :deep(.q-field__control:hover:before) {
  border-color: #cbd5e1 !important;
}

.bg-dark-modal .premium-field :deep(.q-field__control:after) {
  border-color: #94a3b8 !important;
  border-width: 1px !important;
  box-shadow: none !important;
}

.bg-white .premium-field :deep(.q-field__control:after) {
  border-color: #64748b !important;
  border-width: 1px !important;
  box-shadow: none !important;
}

.bg-dark-modal .premium-field :deep(.q-field__native),
.bg-dark-modal .premium-field :deep(.q-field__input) {
  color: #f1f5f9 !important;
  font-size: 13px;
}

.bg-white .premium-field :deep(.q-field__native),
.bg-white .premium-field :deep(.q-field__input) {
  color: #1e293b !important;
  font-size: 13px;
}

.bg-dark-modal .premium-field :deep(.q-field__label) {
  color: #8a94a6 !important;
}

.bg-white .premium-field :deep(.q-field__label) {
  color: #64748b !important;
}

/* Utilitários Extras */
.metadata-row {
  border-top: 1px dashed v-bind("isDark ? '#2e353f' : '#e2e8f0'");
}

.font-11 {
  font-size: 11px;
}

.font-12 {
  font-size: 12px;
}

.font-13 {
  font-size: 13px;
}

.font-14 {
  font-size: 14px;
}

.text-mono {
  font-family: monospace;
}

.tracking-tight {
  letter-spacing: -0.4px;
}

.radius-8 {
  border-radius: 8px;
}
</style>