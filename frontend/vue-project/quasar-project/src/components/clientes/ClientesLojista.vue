<template>
  <div class="clientes-container">
    <!-- Tabela Estilo Premium -->
    <q-card flat class="modern-card" :class="isDark ? 'bg-dark-card border-dark-sharp' : 'bg-white border-light-sharp'">
      <q-table
        flat
        :rows="clientes"
        :columns="colunasVisiveis"
        row-key="cliente_id"
        :loading="loading"
        :filter="busca"
        :dark="isDark"
        :pagination="paginacao"
        no-data-label="Nenhum cliente na base de dados."
        no-results-label="Nenhum registro corresponde à sua busca."
        card-class="transparent"
        table-class="modern-table"
        table-header-class="modern-header"
        @row-click="handleRowClick"
      >
        <!-- Topo: Busca Minimalista -->
        <template v-slot:top-right>
          <q-input 
            outlined 
            dense 
            debounce="300" 
            v-model="busca" 
            placeholder="Filtrar clientes..." 
            :dark="isDark" 
            class="modern-search"
          >
            <template v-slot:append>
              <q-icon name="search" size="18px" class="text-grey-5" />
            </template>
          </q-input>
        </template>

        <!-- Célula: ID -->
        <template v-slot:body-cell-id="props">
          <q-td :props="props" class="text-mono text-grey-5 font-12">
            #{{ props.row.cliente_id }}
          </q-td>
        </template>

        <!-- Célula: Nome + Razão Social -->
        <template v-slot:body-cell-cliente="props">
          <q-td :props="props">
            <div class="text-weight-bold text-slate-main font-14">{{ props.row.nome }}</div>
            <div v-if="props.row.razao_social" class="text-caption text-grey-5 text-weight-medium q-mt-xs">
              {{ props.row.razao_social }}
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
            <div class="text-weight-semibold text-slate-main font-13">{{ props.row.telefone || '---' }}</div>
            <div class="text-caption text-grey-5 font-12">{{ props.row.email || '---' }}</div>
          </q-td>
        </template>

        <!-- Célula: Localidade -->
        <template v-slot:body-cell-localidade="props">
          <q-td :props="props" class="text-slate-sub font-13">
            <span v-if="props.row.cidade">{{ props.row.cidade }} / {{ props.row.uf }}</span>
            <span v-else class="text-grey-4 text-italic">---</span>
          </q-td>
        </template>

        <!-- Célula: Indicador de Ação Discreto no final da linha -->
        <template v-slot:body-cell-acoes="props" v-if="podeEditar">
          <q-td :props="props" class="text-center">
            <q-icon name="chevron_right" size="20px" class="text-grey-4 chevron-indicator" />
          </q-td>
        </template>

        <!-- Paginação customizada idêntica à de pedidos -->
        <template v-slot:bottom="props">
          <div class="row full-width items-center justify-between modern-pagination q-py-md">
            <div class="text-caption text-grey-5 text-weight-medium">
              Mostrando {{ props.pagination.rowsPerPage === 0 ? props.rowsNumber : Math.min(props.pagination.rowsPerPage, props.rowsNumber) }} de {{ props.rowsNumber }} clientes
            </div>
            <q-pagination
              v-model="props.pagination.page"
              :max="props.pagesNumber"
              :max-pages="6"
              direction-links
              flat
              color="grey-5"
              active-color="primary"
              size="sm"
              gutter="sm"
            />
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Modal de Edição Alto Padrão Redesenhado -->
    <q-dialog v-model="modalEdicao" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 850px; border-radius: 14px;" :class="isDark ? 'bg-dark-modal text-white' : 'bg-white text-grey-9'">
        
        <!-- Header Minimalista -->
        <q-card-section class="row items-center q-px-xl q-py-lg header-border">
          <div>
            <div class="text-h6 text-weight-bold tracking-tight text-slate-main">Ficha Cadastral do Cliente</div>
            <div class="text-caption text-grey-5 font-12">Identificador único do registro: #{{ clienteEditando.cliente_id }}</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup :disable="salvando" class="text-grey-4" />
        </q-card-section>

        <!-- Corpo do Formulário Organizado por Blocos Visuais Limpos -->
        <q-card-section class="q-px-xl q-py-xl scroll layout-body" style="max-height: 70vh;">
          <q-form @submit.prevent="salvarCliente" class="row q-col-gutter-lg">
            
            <!-- Card Interno 1: Identificação -->
            <div class="col-12">
              <div class="inner-section-card" :class="isDark ? 'bg-dark-inner' : 'bg-slate-light'">
                <div class="form-section-title q-mb-md">Dados de Identificação</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input v-model="clienteEditando.nome" label="Nome Completo *" outlined dense :dark="isDark" :rules="[val => !!val || 'Obrigatório']" hide-bottom-space class="premium-field" />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input v-model="clienteEditando.razao_social" label="Razão Social" outlined dense :dark="isDark" hide-bottom-space class="premium-field" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input v-model="clienteEditando.cpf_cnpj" label="CPF ou CNPJ" outlined dense :dark="isDark" :rules="[val => validaCpfCnpj(val) || 'Documento inválido']" hide-bottom-space class="premium-field" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input v-model="clienteEditando.telefone" label="Telefone / WhatsApp" outlined dense :dark="isDark" hide-bottom-space class="premium-field" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input v-model="clienteEditando.email" label="E-mail" outlined dense :dark="isDark" type="email" hide-bottom-space class="premium-field" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Interno 2: Endereço -->
            <div class="col-12">
              <div class="inner-section-card" :class="isDark ? 'bg-dark-inner' : 'bg-slate-light'">
                <div class="form-section-title q-mb-md">Endereço Principal</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-3">
                    <q-input v-model="clienteEditando.cep" label="CEP" outlined dense :dark="isDark" hide-bottom-space class="premium-field" />
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

            <!-- Card Interno 3: Entrega -->
            <div class="col-12">
              <div class="inner-section-card" :class="isDark ? 'bg-dark-inner' : 'bg-slate-light'">
                <div class="form-section-title q-mb-sm">Logística e Local de Entrega</div>
                <q-input v-model="clienteEditando.endereco_entrega" label="Endereço de Entrega Detalhado" type="textarea" rows="2" outlined dense :dark="isDark" hide-bottom-space class="premium-field textarea-field" placeholder="Especifique rotas ou detalhes de entrega da obra..." />
              </div>
            </div>

            <!-- Rodapé com Metadados do Sistema -->
            <div class="col-12 row justify-between items-center metadata-row q-pt-sm">
              <div class="text-caption text-grey-5 font-11">
                Criado em: <span class="text-weight-medium" :class="isDark ? 'text-grey-3' : 'text-grey-7'">{{ formatarData(clienteEditando.created_at) }}</span>
              </div>
              <div class="text-caption text-grey-5 font-11">
                Última modificação: <span class="text-weight-medium" :class="isDark ? 'text-grey-3' : 'text-grey-7'">{{ formatarData(clienteEditando.updated_at) }}</span>
              </div>
            </div>

            <!-- Ações Finais -->
            <div class="col-12 row justify-end q-gutter-x-md q-mt-lg">
              <q-btn label="Cancelar" color="grey-6" flat v-close-popup :disable="salvando" no-caps class="text-weight-bold font-14" />
              <q-btn v-if="podeEditar" label="Salvar Dados" color="primary" type="submit" :loading="salvando" unevaluated no-caps class="text-weight-bold px-xl font-14 radius-8" />
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

const colunasBase = [
  { name: 'id', field: 'cliente_id', label: 'ID', align: 'left', sortable: true, style: 'width: 70px' },
  { name: 'cliente', field: 'nome', label: 'Cliente / Empresa', align: 'left', sortable: true },
  { name: 'cpf_cnpj', field: 'cpf_cnpj', label: 'Documento', align: 'left', style: 'width: 160px' },
  { name: 'contato', field: 'telefone', label: 'Contato Principal', align: 'left' },
  { name: 'localidade', field: 'cidade', label: 'Cidade', align: 'left', sortable: true },
  { name: 'acoes', field: 'acoes', label: '', align: 'center', style: 'width: 40px' }
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

// Disparado ao clicar em qualquer lugar da linha
function handleRowClick(evt, row) {
  if (!props.podeEditar) return
  abrirEdicao(row)
}

function abrirEdicao(cliente) {
  clienteEditando.value = JSON.parse(JSON.stringify(cliente))
  modalEdicao.value = true
}

async function salvarCliente() {
  salvando.value = true
  try {
    const id = clienteEditando.value.cliente_id
    await api.put(`/clientes/${id}`, clienteEditando.value, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    $q.notify({ type: 'positive', message: 'Cadastro atualizado com sucesso.' })
    modalEdicao.value = false
    await carregarClientes()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Falha ao salvar dados.' })
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
.modern-card {
  border-radius: 8px;
  overflow: hidden;
}
.border-light-sharp {
  border: 1px solid #eaedf3;
}
.border-dark-sharp {
  border: 1px solid #2e353f;
}
.bg-dark-card {
  background-color: #1c2128 !important;
}
.bg-dark-modal {
  background-color: #14181e !important;
}
.bg-dark-inner {
  background-color: #1c2128 !important;
  border: 1px solid #2e353f;
}

/* Tabela Interativa (Row Click) */
:deep(.modern-table tbody tr) {
  cursor: pointer;
  transition: background-color 0.15s ease;
}
:deep(.modern-table tbody tr:hover) {
  background-color: v-bind("isDark ? '#232932' : '#f8fafc'") !important;
}
:deep(.modern-table tbody tr:hover .chevron-indicator) {
  color: var(--q-primary) !important;
  transform: translateX(2px);
}
.chevron-indicator {
  transition: all 0.2s ease;
}

/* Customização de Cabeçalhos e Células */
:deep(.modern-header) {
  background-color: v-bind("isDark ? '#1f242d' : '#f8fafc'") !important;
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

/* Cores de Texto e Utilitários */
.text-slate-main {
  color: v-bind("isDark ? '#f1f5f9' : '#1e293b'");
}
.text-slate-sub {
  color: v-bind("isDark ? '#cbd5e1' : '#475569'");
}
.modern-search {
  width: 280px;
  font-size: 13px;
}
.modern-pagination {
  border-top: 1px solid v-bind("isDark ? '#2e353f' : '#eaedf3'");
}

/* Visual Clean do Modal (Design Customizado) */
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
.form-section-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--q-primary);
}

/* Modificadores finos de Inputs (Sem estilo grosseiro) */
.premium-field :deep(.q-field__control) {
  background-color: v-bind("isDark ? '#14181e' : '#ffffff'") !important;
  border-radius: 6px !important;
  transition: all 0.2s ease;
}
.premium-field :deep(.q-field__control:before) {
  border-color: v-bind("isDark ? '#334155' : '#cbd5e1'") !important;
}
.premium-field :deep(.q-field__native),
.premium-field :deep(.q-field__input) {
  font-size: 13px;
}
.textarea-field :deep(.q-field__control) {
  padding-top: 6px;
}
.metadata-row {
  border-top: 1px dashed v-bind("isDark ? '#2e353f' : '#e2e8f0'");
}

/* Fontes e alinhamentos */
.font-11 { font-size: 11px; }
.font-12 { font-size: 12px; }
.font-13 { font-size: 13px; }
.font-14 { font-size: 14px; }
.text-mono { font-family: monospace; }
.tracking-tight { letter-spacing: -0.4px; }
.radius-8 { border-radius: 8px; }
</style>