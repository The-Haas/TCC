<template>
  <div class="column fit">
    <!-- Filtros e Ações -->
    <q-card class="filter-card q-mb-lg"
      :class="isDark ? 'bg-dark-card border-dark-sharp' : 'bg-white border-light-sharp'" flat>
      <q-card-section class="row q-col-gutter-md items-center justify-between">
        <div class="col-12 col-md-5">
          <q-input v-model="busca" dense outlined :dark="isDark" debounce="300" placeholder="Pesquisar por descrição..."
            clearable>
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>
        </div>

        <!-- Botão Novo Status -->
        <div class="col-12 col-md-auto text-right">
          <q-btn color="primary" icon="add" label="Novo Status" no-caps unevaluated class="text-weight-bold radius-8"
            @click="abrirNovo" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Container da Tabela -->
    <div class="clientes-container col-grow">
      <q-card flat class="modern-card fit"
        :class="isDark ? 'bg-dark-card border-dark-sharp' : 'bg-white border-light-sharp'">
        <q-table hide-bottom flat :rows="listaStatus" :columns="colunasVisiveis" row-key="id" :loading="loading"
          :filter="busca" :dark="isDark" v-model:pagination="paginacao"
          no-data-label="Nenhum status cadastrado no sistema."
          no-results-label="Nenhum registro corresponde à sua busca." card-class="transparent"
          table-class="modern-table" table-header-class="modern-header" @row-click="handleRowClick">
          <!-- Célula: ID -->
          <template v-slot:body-cell-id="props">
            <q-td :props="props" class="text-mono text-weight-bold" :class="isDark ? 'text-grey-5' : 'text-grey-6'"
              style="font-size: 13px;">
              #{{ props.row.id }}
            </q-td>
          </template>

          <!-- Célula: Descrição -->
          <template v-slot:body-cell-descricao="props">
            <q-td :props="props">
              <div class="text-weight-bold text-subtitle2" :class="isDark ? 'text-white' : 'text-slate-main'">
                {{ props.row.descricao }}
              </div>
            </q-td>
          </template>

          <!-- Célula: Cor -->
          <template v-slot:body-cell-cor="props">
            <q-td :props="props">
              <div class="flex items-center">
                <div class="color-dot q-mr-sm" :style="{ backgroundColor: props.row.cor }"></div>
                <span class="text-mono text-uppercase font-12 text-weight-medium text-grey-6">
                  {{ props.row.cor }}
                </span>
              </div>
            </q-td>
          </template>

          <!-- Célula: Ordem -->
          <template v-slot:body-cell-ordem="props">
            <q-td :props="props" class="text-weight-medium text-grey-7">
              {{ props.row.ordem }}
            </q-td>
          </template>

          <!-- Célula: Padrão -->
          <template v-slot:body-cell-padrao="props">
            <q-td :props="props">
              <q-chip v-if="props.row.padrao" color="primary" text-color="white" size="sm" class="text-weight-bold"
                dense>
                Padrão
              </q-chip>
              <span v-else class="text-grey-5 font-12">Não</span>
            </q-td>
          </template>

          <!-- Célula: Ações -->
          <template v-slot:body-cell-acoes="props">
            <q-td :props="props" class="text-right">
              <q-btn flat round dense icon="edit" color="primary" size="sm" class="action-btn" />
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
              <q-icon :name="statusEditando.id ? 'edit_attributes' : 'add_circle'" color="primary" size="24px"
                class="q-mr-sm" />
              {{ statusEditando.id ? 'Atualizar Status' : 'Novo Status' }}
            </div>
            <div v-if="statusEditando.id" class="text-caption text-grey-5 font-12 q-mt-xs">Registro único: #{{
              statusEditando.id }}</div>
            <div v-else class="text-caption text-grey-5 font-12 q-mt-xs">Preencha os dados do novo status</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup :disable="salvando" class="text-grey-4" />
        </q-card-section>

        <q-card-section class="q-px-xl q-py-lg scroll layout-body">
          <q-form @submit.prevent="salvarStatus" class="row q-col-gutter-lg">

            <div class="col-12">
              <div class="inner-section-card" :class="isDark ? 'bg-dark-inner' : 'bg-slate-light'">
                <div class="form-section-title q-mb-md">Informações do Status</div>
                <div class="row q-col-gutter-md">

                  <!-- DESCRIÇÃO -->
                  <div class="col-12">
                    <q-input v-model="statusEditando.descricao" label="Descrição *" outlined dense :dark="isDark"
                      :rules="[val => !!val || 'Campo obrigatório']" hide-bottom-space class="premium-field" />
                  </div>

                  <!-- COR (Com Color Picker) -->
                  <div class="col-12 col-sm-6">
                    <q-input v-model="statusEditando.cor" label="Cor (Hexadecimal) *" outlined dense :dark="isDark"
                      :rules="[val => !!val || 'Selecione uma cor']" hide-bottom-space class="premium-field">
                      <template v-slot:append>
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-color v-model="statusEditando.cor" format-model="hex" no-header no-footer :dark="isDark" />
                        </q-popup-proxy>
                        <!-- Adicionei a classe cursor-pointer aqui embaixo 👇 -->
                        <div class="color-preview cursor-pointer"
                          :style="{ backgroundColor: statusEditando.cor || '#cccccc' }"></div>
                      </template>
                    </q-input>
                  </div>

                  <!-- ORDEM -->
                  <div class="col-12 col-sm-6">
                    <q-input v-model.number="statusEditando.ordem" label="Ordem de Exibição *" outlined dense
                      type="number" :dark="isDark" :rules="[val => val !== null && val !== '' || 'Campo obrigatório']"
                      hide-bottom-space class="premium-field" />
                  </div>

                  <!-- PADRÃO (Toggle) -->
                  <div class="col-12 q-mt-md">
                    <q-toggle v-model="statusEditando.padrao" label="Definir como Status Padrão (inicial)"
                      color="primary" :dark="isDark" />
                  </div>

                </div>
              </div>
            </div>

            <!-- Metadados de Data -->
            <div v-if="statusEditando.id" class="col-12 row justify-between items-center metadata-row q-pt-sm">
              <div class="text-caption text-grey-5 font-11">
                Criado em: <span class="text-weight-medium" :class="isDark ? 'text-grey-3' : 'text-grey-7'">{{
                  formatarData(statusEditando.created_at) }}</span>
              </div>
              <div class="text-caption text-grey-5 font-11">
                Última modificação: <span class="text-weight-medium" :class="isDark ? 'text-grey-3' : 'text-grey-7'">{{
                  formatarData(statusEditando.updated_at) }}</span>
              </div>
            </div>

            <!-- Botões -->
            <div class="col-12 row justify-end q-gutter-x-md q-mt-lg">
              <q-btn label="Cancelar" color="grey-6" flat v-close-popup :disable="salvando" no-caps
                class="text-weight-bold font-14" />
              <q-btn :label="statusEditando.id ? 'Salvar Alterações' : 'Cadastrar Status'" color="primary" type="submit"
                :loading="salvando" unevaluated no-caps class="text-weight-bold px-xl font-14 radius-8" />
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

const $q = useQuasar()
const authStore = useAuthStore()
const isDark = computed(() => $q.dark.isActive)

// Estados
const loading = ref(true)
const listaStatus = ref([])
const busca = ref('')

const paginacao = ref({
  sortBy: 'ordem', // Ordena pela ordem visual
  descending: false,
  page: 1,
  rowsPerPage: 10
})

const modalEdicao = ref(false)
const salvando = ref(false)
const statusEditando = ref({})

// Cálculo Dinâmico das Páginas
const numeroDePaginas = computed(() => {
  let total = listaStatus.value.length

  if (busca.value) {
    const termo = String(busca.value).toLowerCase()
    total = listaStatus.value.filter(row => {
      return Object.values(row).some(val =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(termo)
      )
    }).length
  }

  const limit = paginacao.value.rowsPerPage
  return limit === 0 ? 1 : Math.ceil(total / limit) || 1
})

const colunasVisiveis = [
  { name: 'id', field: 'id', label: 'ID', align: 'left', sortable: true, style: 'width: 70px' },
  { name: 'descricao', field: 'descricao', label: 'Descrição', align: 'left', sortable: true },
  { name: 'cor', field: 'cor', label: 'Cor Hex', align: 'left', sortable: true },
  { name: 'ordem', field: 'ordem', label: 'Ordem', align: 'left', sortable: true },
  { name: 'padrao', field: 'padrao', label: 'Padrão?', align: 'left', sortable: true },
  { name: 'acoes', field: 'acoes', label: '', align: 'right', style: 'width: 60px' }
]

async function carregarStatus() {
  loading.value = true
  try {
    const response = await api.get('/status', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    listaStatus.value = response.data.data || response.data || []
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Erro ao carregar a lista de status.' })
  } finally {
    loading.value = false
  }
}

function handleRowClick(evt, row) {
  abrirEdicao(row)
}

function abrirEdicao(statusItem) {
  statusEditando.value = JSON.parse(JSON.stringify(statusItem))
  modalEdicao.value = true
}

function abrirNovo() {
  statusEditando.value = {
    descricao: '',
    cor: '#000000',
    padrao: false,
    ordem: 0
  }
  modalEdicao.value = true
}

async function salvarStatus() {
  salvando.value = true
  try {
    const payload = {
      descricao: statusEditando.value.descricao,
      cor: statusEditando.value.cor,
      padrao: Boolean(statusEditando.value.padrao),
      ordem: Number(statusEditando.value.ordem)
    }

    if (statusEditando.value.id) {
      // PATCH - ATUALIZAÇÃO
      await api.patch(`/status/${statusEditando.value.id}`, payload, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      $q.notify({ type: 'positive', message: 'Status atualizado com sucesso.' })
    } else {
      // POST - CRIAÇÃO
      await api.post('/status', payload, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      $q.notify({ type: 'positive', message: 'Novo status adicionado com sucesso.' })
    }

    modalEdicao.value = false
    await carregarStatus()
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

onMounted(() => {
  carregarStatus()
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

/* Bolinha de Cor e Preview */
.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(128, 128, 128, 0.3);
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  margin-left: 10px;
  border: 1px solid rgba(128, 128, 128, 0.3);
}

/* Filtros */
.filter-card {
  border-radius: 12px;
}

/* Tabela Interativa */
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