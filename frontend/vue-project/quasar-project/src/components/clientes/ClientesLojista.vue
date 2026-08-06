<template>
  <q-page class="page q-pa-md column">
    <!-- Filtros -->
    <q-card class="filter-card q-mb-lg" :class="isDark ? 'bg-dark-card border-dark-sharp' : 'bg-white border-light-sharp'" flat>
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-5">
          <q-input 
            v-model="busca" 
            dense 
            outlined 
            :dark="isDark"
            debounce="300"
            placeholder="Pesquisar por nome, documento ou código..." 
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>
        </div>
      </q-card-section>
    </q-card>

    <!-- Container da Tabela (Ocupa o espaço livre da tela) -->
    <div class="clientes-container col-grow">
      <q-card flat class="modern-card fit" :class="isDark ? 'bg-dark-card border-dark-sharp' : 'bg-white border-light-sharp'">
        <q-table
          hide-bottom
          flat
          :rows="clientes"
          :columns="colunasVisiveis"
          row-key="cliente_id"
          :loading="loading"
          :filter="busca"
          :dark="isDark"
          v-model:pagination="paginacao"
          no-data-label="Nenhum cliente na base de dados."
          no-results-label="Nenhum registro corresponde à sua busca."
          card-class="transparent"
          table-class="modern-table"
          table-header-class="modern-header"
          @row-click="handleRowClick"
        >
          <!-- Célula: ID -->
          <template v-slot:body-cell-id="props">
            <q-td :props="props" class="text-mono text-weight-bold" :class="isDark ? 'text-grey-5' : 'text-grey-6'" style="font-size: 13px;">
              #{{ props.row.cliente_id }}
            </q-td>
          </template>

          <!-- Célula: Nome + Razão Social -->
          <template v-slot:body-cell-cliente="props">
            <q-td :props="props">
              <div class="row items-center">
                <div>
                  <div class="text-weight-bold text-subtitle2" :class="isDark ? 'text-white' : 'text-slate-main'">
                    {{ props.row.nome }}
                  </div>
                  <div v-if="props.row.razao_social" class="text-caption text-weight-medium q-mt-none" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
                    {{ props.row.razao_social }}
                  </div>
                </div>
              </div>
            </q-td>
          </template>

          <!-- Célula: Documento -->
          <template v-slot:body-cell-cpf_cnpj="props">
            <q-td :props="props" class="text-weight-medium text-slate-sub font-13">
              {{ formatarDocumento(props.row.cpf_cnpj) }}
            </q-td>
          </template>

          <!-- Célula: Contato -->
          <template v-slot:body-cell-contato="props">
            <q-td :props="props">
              <div class="text-weight-semibold text-slate-main font-13 flex items-center">
                <q-icon name="phone" size="14px" class="q-mr-xs text-grey-5"/>
                {{ formatarTelefone(props.row.telefone) }}
              </div>
              <div class="text-caption text-grey-5 font-12 flex items-center q-mt-xs">
                <q-icon name="mail" size="14px" class="q-mr-xs text-grey-5"/>
                {{ props.row.email || '---' }}
              </div>
            </q-td>
          </template>

          <!-- Célula: Localidade -->
          <template v-slot:body-cell-localidade="props">
            <q-td :props="props" class="text-slate-sub font-13">
              <div v-if="props.row.cidade" class="flex items-center">
                <q-icon name="location_on" size="16px" class="q-mr-xs text-grey-5" />
                {{ props.row.cidade }} / {{ props.row.uf }}
              </div>
              <span v-else class="text-grey-4 text-italic">---</span>
            </q-td>
          </template>

          <!-- Célula: Ações -->
          <template v-slot:body-cell-acoes="props" v-if="podeEditar">
            <q-td :props="props" class="text-right">
              <q-btn flat round dense icon="edit" color="primary" size="sm" class="action-btn" />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Rodapé de Paginação Independente (Embaixo) -->
    <div class="pagination-footer q-mt-md q-pt-md row full-width justify-between items-center mt-auto">
      <div class="row items-center q-gutter-x-sm">
          <span class="text-caption text-weight-medium gt-xs" :class="isDark ? 'text-grey-5' : 'text-grey-6'">Mostrar</span>
          <q-select 
            v-model="paginacao.rowsPerPage" 
            :options="[5, 10, 20, 50]" 
            dense 
            outlined 
            :dark="isDark"
            style="min-width: 65px" 
          />
          <span class="text-caption text-weight-medium" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
              <span class="gt-xs">por página</span>
              <span class="lt-sm">itens</span>
          </span>
      </div>
      <q-pagination 
        v-model="paginacao.page" 
        :max="numeroDePaginas" 
        :max-pages="5" 
        direction-links 
        boundary-numbers
        round 
        flat 
        :color="isDark ? 'grey-4' : 'grey-8'" 
        active-color="primary" 
        active-text-color="white"
        size="14px" 
      />
    </div>

    <!-- Modal de Edição -->
    <q-dialog v-model="modalEdicao" transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 850px; border-radius: 14px;" :class="isDark ? 'bg-dark-modal text-white' : 'bg-white text-grey-9'">
        <q-card-section class="row items-center q-px-xl q-py-lg header-border">
          <div>
            <div class="text-h6 text-weight-bold tracking-tight text-slate-main flex items-center">
              <q-icon name="manage_accounts" color="primary" size="24px" class="q-mr-sm" />
              Ficha Cadastral do Cliente
            </div>
            <div class="text-caption text-grey-5 font-12 q-mt-xs">Identificador único do registro: #{{ clienteEditando.cliente_id }}</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup :disable="salvando" class="text-grey-4" />
        </q-card-section>

        <q-card-section class="q-px-xl q-py-lg scroll layout-body" style="max-height: 75vh;">
          <q-form @submit.prevent="salvarCliente" ref="formCliente" class="row q-col-gutter-lg">
            
            <!-- Identificação -->
            <div class="col-12">
              <div class="inner-section-card" :class="isDark ? 'bg-dark-inner' : 'bg-slate-light'">
                <div class="form-section-title q-mb-md">Dados de Identificação</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input 
                      v-model="clienteEditando.nome" 
                      label="Nome Completo *" 
                      outlined 
                      dense 
                      :dark="isDark" 
                      :rules="[val => !!val || 'Obrigatório', val => val.trim().includes(' ') || 'Informe o nome e sobrenome']" 
                      hide-bottom-space 
                      class="premium-field" 
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input 
                      v-model="clienteEditando.razao_social" 
                      label="Razão Social" 
                      outlined 
                      dense 
                      :dark="isDark" 
                      hide-bottom-space 
                      class="premium-field" 
                    />
                  </div>
                  
                  <div class="col-12 col-md-4">
                    <q-input 
                      v-model="clienteEditando.cpf_cnpj" 
                      label="CPF ou CNPJ (Apenas números)" 
                      outlined 
                      dense 
                      :dark="isDark" 
                      maxlength="14"
                      @update:model-value="val => clienteEditando.cpf_cnpj = val ? val.replace(/\D/g, '') : ''"
                      :rules="[
                        val => !val || [11, 14].includes(val.length) || 'Digite exatos 11 ou 14 números',
                        val => validaCpfCnpj(val) || 'Documento inválido'
                      ]" 
                      hide-bottom-space 
                      class="premium-field"
                    >
                      <template v-slot:append>
                        <q-icon 
                          v-if="clienteEditando.cpf_cnpj && [11, 14].includes(clienteEditando.cpf_cnpj.length) && validaCpfCnpj(clienteEditando.cpf_cnpj)" 
                          name="check_circle" 
                          color="positive" 
                        />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-4">
                    <q-input 
                      v-model="clienteEditando.telefone" 
                      label="Celular / WhatsApp (Apenas números)" 
                      outlined 
                      dense 
                      :dark="isDark" 
                      maxlength="11"
                      @update:model-value="val => clienteEditando.telefone = val ? val.replace(/\D/g, '') : ''"
                      :rules="[validarTelefone]"
                      hide-bottom-space 
                      class="premium-field" 
                    />
                  </div>
                  
                  <div class="col-12 col-md-4">
                    <q-input 
                      v-model="clienteEditando.email" 
                      label="E-mail" 
                      outlined 
                      dense 
                      :dark="isDark" 
                      type="email" 
                      :rules="[validarEmail]"
                      hide-bottom-space 
                      class="premium-field" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Endereço -->
            <div class="col-12">
              <div class="inner-section-card" :class="isDark ? 'bg-dark-inner' : 'bg-slate-light'">
                <div class="form-section-title q-mb-md">Endereço Principal</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-3">
                    <q-input 
                      v-model="clienteEditando.cep" 
                      label="CEP (Apenas números)" 
                      outlined 
                      dense 
                      :dark="isDark" 
                      maxlength="8"
                      @update:model-value="val => clienteEditando.cep = val ? val.replace(/\D/g, '') : ''"
                      :rules="[val => !val || val.length === 8 || 'Exatos 8 dígitos obrigatórios']"
                      hide-bottom-space 
                      class="premium-field" 
                    />
                  </div>
                  
                  <div class="col-12 col-md-7">
                    <q-input v-model="clienteEditando.endereco" label="Logradouro (Rua, Av.)" outlined dense :dark="isDark" hide-bottom-space class="premium-field" />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input v-model="clienteEditando.numero" label="Número" outlined dense :dark="isDark" hide-bottom-space class="premium-field" />
                  </div>
                  <div class="col-12 col-md-5">
                    <q-input v-model="clienteEditando.bairro" label="Bairro" outlined dense :dark="isDark" hide-bottom-space class="premium-field" />
                  </div>
                  <div class="col-12 col-md-5">
                    <q-input v-model="clienteEditando.cidade" label="Cidade" outlined dense :dark="isDark" hide-bottom-space class="premium-field" />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input v-model="clienteEditando.uf" label="UF" outlined dense :dark="isDark" hide-bottom-space class="premium-field" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Entrega -->
            <div class="col-12">
              <div class="inner-section-card" :class="isDark ? 'bg-dark-inner' : 'bg-slate-light'">
                <div class="form-section-title q-mb-sm">Logística e Local de Entrega</div>
                <q-input v-model="clienteEditando.endereco_entrega" label="Endereço de Entrega Detalhado" type="textarea" rows="2" outlined dense :dark="isDark" hide-bottom-space class="premium-field textarea-field" placeholder="Especifique rotas ou detalhes de entrega da obra..." />
              </div>
            </div>

            <div class="col-12 row justify-between items-center metadata-row q-pt-sm">
              <div class="text-caption text-grey-5 font-11">
                Criado em: <span class="text-weight-medium" :class="isDark ? 'text-grey-3' : 'text-grey-7'">{{ formatarData(clienteEditando.created_at) }}</span>
              </div>
              <div class="text-caption text-grey-5 font-11">
                Última modificação: <span class="text-weight-medium" :class="isDark ? 'text-grey-3' : 'text-grey-7'">{{ formatarData(clienteEditando.updated_at) }}</span>
              </div>
            </div>

            <div class="col-12 row justify-end q-gutter-x-md q-mt-lg">
              <q-btn label="Cancelar" color="grey-6" flat v-close-popup :disable="salvando" no-caps class="text-weight-bold font-14" />
              <q-btn v-if="podeEditar" label="Salvar Dados" color="primary" type="submit" :loading="salvando" unevaluated no-caps class="text-weight-bold px-xl font-14 radius-8" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
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

// Referência do formulário adicionada
const formCliente = ref(null) 

const loading = ref(true)
const clientes = ref([])
const busca = ref('')

const paginacao = ref({
  sortBy: 'nome',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

const modalEdicao = ref(false)
const salvando = ref(false)
const clienteEditando = ref({})

// --- FUNÇÕES DE VALIDAÇÃO ---
const validarEmail = (email) => {
  if (!email) return true // Pode ser vazio caso o cliente não possua
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email) || 'Formato de e-mail inválido'
}

const validarTelefone = (tel) => {
  if (!tel) return true // Pode ser vazio
  const limpo = String(tel).replace(/\D/g, '')
  return (limpo.length >= 10 && limpo.length <= 11) || 'Telefone deve ter DDD + 8 ou 9 dígitos'
}
// ----------------------------

// Cálculo Dinâmico das Páginas para o rodapé externo
const numeroDePaginas = computed(() => {
  let total = clientes.value.length
  
  // Replicando o filtro nativo para manter as páginas exatas ao pesquisar
  if (busca.value) {
    const termo = String(busca.value).toLowerCase()
    total = clientes.value.filter(row => {
      return Object.values(row).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(termo)
      )
    }).length
  }

  const limit = paginacao.value.rowsPerPage
  return limit === 0 ? 1 : Math.ceil(total / limit) || 1
})

const colunasBase = [
  { name: 'id', field: 'cliente_id', label: 'ID', align: 'left', sortable: true, style: 'width: 70px' },
  { name: 'cliente', field: 'nome', label: 'Cliente / Empresa', align: 'left', sortable: true },
  { name: 'cpf_cnpj', field: 'cpf_cnpj', label: 'CPF/CNPJ', align: 'left', style: 'width: 160px' },
  { name: 'contato', field: 'telefone', label: 'Contato Principal', align: 'left' },
  { name: 'localidade', field: 'cidade', label: 'Localidade', align: 'left', sortable: true },
  { name: 'acoes', field: 'acoes', label: '', align: 'right', style: 'width: 60px' }
]

const colunasVisiveis = computed(() => {
  if (props.podeEditar) return colunasBase
  return colunasBase.filter(col => col.name !== 'acoes')
})

async function carregarClientes() {
  loading.value = true
  try {
    const response = await api.get('/clientes', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    clientes.value = response.data.data || response.data || []
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Erro ao carregar a lista de clientes.' })
  } finally {
    loading.value = false
  }
}

function handleRowClick(evt, row) {
  if (!props.podeEditar) return
  abrirEdicao(row)
}

function abrirEdicao(cliente) {
  clienteEditando.value = JSON.parse(JSON.stringify(cliente))
  modalEdicao.value = true
}

async function salvarCliente() {
  // Dispara a validação de todos os campos antes de continuar
  const success = await formCliente.value.validate()
  
  if (!success) {
    $q.notify({ 
      type: 'warning', 
      message: 'Existem campos inválidos. Por favor, verifique os dados.', 
      position: 'top-right' 
    })
    return
  }

  salvando.value = true
  try {
    const id = clienteEditando.value.cliente_id
    
    // Tratativa para evitar o erro do banco de dados (enviamos apenas os dados úteis via PATCH)
    const payload = { ...clienteEditando.value }
    delete payload.cliente_id
    delete payload.created_at
    delete payload.updated_at

    await api.patch(`/clientes/${id}`, payload, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    
    $q.notify({ type: 'positive', message: 'Cadastro atualizado com sucesso.' })
    modalEdicao.value = false
    await carregarClientes()
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

function formatarDocumento(val) {
  if (!val) return '---'
  const clean = String(val).replace(/\D/g, '')
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return val
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

function validaCpfCnpj(val) {
  if (!val) return true
  const numbers = String(val).replace(/\D/g, '')
  
  if (numbers.length === 11) {
    if (/^(\d)\1+$/.test(numbers)) return false
    let sum = 0, remainder
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(numbers.substring(i - 1, i)) * (11 - i)
    remainder = (sum * 10) % 11
    if ((remainder === 10) || (remainder === 11)) remainder = 0
    if (remainder !== parseInt(numbers.substring(9, 10))) return false
    sum = 0
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(numbers.substring(i - 1, i)) * (12 - i)
    remainder = (sum * 10) % 11
    if ((remainder === 10) || (remainder === 11)) remainder = 0
    if (remainder !== parseInt(numbers.substring(10, 11))) return false
    return true
  }
  
  if (numbers.length === 14) {
    if (/^(\d)\1+$/.test(numbers)) return false
    let size = numbers.length - 2
    let base = numbers.substring(0, size)
    const digits = numbers.substring(size)
    let sum = 0, pos = size - 7
    for (let i = size; i >= 1; i--) {
      sum += base.charAt(size - i) * pos--
      if (pos < 2) pos = 9
    }
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11
    if (result !== parseInt(digits.charAt(0))) return false
    size = size + 1
    base = numbers.substring(0, size)
    sum = 0; pos = size - 7
    for (let i = size; i >= 1; i--) {
      sum += base.charAt(size - i) * pos--
      if (pos < 2) pos = 9
    }
    result = sum % 11 < 2 ? 0 : 11 - sum % 11
    if (result !== parseInt(digits.charAt(1))) return false
    return true
  }
  return false
}

onMounted(() => {
  carregarClientes()
})
</script>

<style scoped>
/* Grid & Estrutura Master */
.page {
  min-height: 100vh;
}
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
.bg-dark-modal .premium-field :deep(.q-field__control) { background-color: #14181e !important; }
.bg-white .premium-field :deep(.q-field__control) { background-color: #ffffff !important; }

.bg-dark-modal .premium-field :deep(.q-field__control:before) { border-color: #334155 !important; }
.bg-white .premium-field :deep(.q-field__control:before) { border-color: #e2e8f0 !important; }

.bg-dark-modal .premium-field :deep(.q-field__control:hover:before) { border-color: #475569 !important; }
.bg-white .premium-field :deep(.q-field__control:hover:before) { border-color: #cbd5e1 !important; }

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

.bg-dark-modal .premium-field :deep(.q-field__label) { color: #8a94a6 !important; }
.bg-white .premium-field :deep(.q-field__label) { color: #64748b !important; }

/* Utilitários Extras */
.textarea-field :deep(.q-field__control) {
  padding-top: 6px;
}
.metadata-row {
  border-top: 1px dashed v-bind("isDark ? '#2e353f' : '#e2e8f0'");
}
.font-11 { font-size: 11px; }
.font-12 { font-size: 12px; }
.font-13 { font-size: 13px; }
.font-14 { font-size: 14px; }
.text-mono { font-family: monospace; }
.tracking-tight { letter-spacing: -0.4px; }
.radius-8 { border-radius: 8px; }
</style>