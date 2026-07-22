<template>
  <div class="column fit">
    <!-- Filtros e Ações -->
    <q-card class="filter-card q-mb-lg" :class="isDark ? 'bg-dark-card border-dark-sharp' : 'bg-white border-light-sharp'" flat>
      <q-card-section class="row q-col-gutter-md items-center justify-between">
        <div class="col-12 col-md-5">
          <q-input 
            v-model="busca" 
            dense 
            outlined 
            :dark="isDark"
            debounce="300"
            placeholder="Pesquisar por nome, email ou telefone..." 
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>
        </div>
        
        <!-- Botão Novo Representante -->
        <div class="col-12 col-md-auto text-right">
          <q-btn 
            color="primary" 
            icon="add" 
            label="Novo Representante" 
            no-caps 
            unevaluated
            class="text-weight-bold radius-8"
            @click="abrirNovo" 
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Container da Tabela -->
    <div class="clientes-container col-grow">
      <q-card flat class="modern-card fit" :class="isDark ? 'bg-dark-card border-dark-sharp' : 'bg-white border-light-sharp'">
        <q-table
          hide-bottom
          flat
          :rows="representantes"
          :columns="colunasVisiveis"
          row-key="id"
          :loading="loading"
          :filter="busca"
          :dark="isDark"
          v-model:pagination="paginacao"
          no-data-label="Nenhum representante cadastrado no sistema."
          no-results-label="Nenhum registro corresponde à sua busca."
          card-class="transparent"
          table-class="modern-table"
          table-header-class="modern-header"
          @row-click="handleRowClick"
        >
          <!-- Célula: ID -->
          <template v-slot:body-cell-id="props">
            <q-td :props="props" class="text-mono text-weight-bold" :class="isDark ? 'text-grey-5' : 'text-grey-6'" style="font-size: 13px;">
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
                <q-icon name="phone" size="14px" class="q-mr-xs text-grey-5"/>
                {{ formatarTelefone(props.row.telefone) }}
              </div>
              <div class="text-caption text-grey-5 font-12 flex items-center q-mt-xs">
                <q-icon name="mail" size="14px" class="q-mr-xs text-grey-5"/>
                {{ props.row.email || '---' }}
              </div>
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

    <!-- Modal de Formulário (Edição / Criação) -->
    <q-dialog v-model="modalEdicao" transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 600px; border-radius: 14px;" :class="isDark ? 'bg-dark-modal text-white' : 'bg-white text-grey-9'">
        <q-card-section class="row items-center q-px-xl q-py-lg header-border">
          <div>
            <div class="text-h6 text-weight-bold tracking-tight text-slate-main flex items-center">
              <q-icon :name="representanteEditando.id ? 'manage_accounts' : 'person_add'" color="primary" size="24px" class="q-mr-sm" />
              {{ representanteEditando.id ? 'Atualizar Representante' : 'Novo Representante' }}
            </div>
            <div v-if="representanteEditando.id" class="text-caption text-grey-5 font-12 q-mt-xs">Registro único: #{{ representanteEditando.id }}</div>
            <div v-else class="text-caption text-grey-5 font-12 q-mt-xs">Preencha os dados gerais do novo representante</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup :disable="salvando" class="text-grey-4" />
        </q-card-section>

        <q-card-section class="q-px-xl q-py-lg scroll layout-body">
          <q-form @submit.prevent="salvarRepresentante" class="row q-col-gutter-lg">
            
            <!-- Dados de Contato / Identificação -->
            <div class="col-12">
              <div class="inner-section-card" :class="isDark ? 'bg-dark-inner' : 'bg-slate-light'">
                <div class="form-section-title q-mb-md">Informações Básicas</div>
                <div class="row q-col-gutter-md">
                  
                  <!-- NOME -->
                  <div class="col-12">
                    <q-input 
                      v-model="representanteEditando.nome" 
                      label="Nome do Representante *" 
                      outlined 
                      dense 
                      :dark="isDark" 
                      :rules="[val => !!val || 'Campo obrigatório']" 
                      hide-bottom-space 
                      class="premium-field" 
                    />
                  </div>
                  
                  <!-- TELEFONE -->
                  <div class="col-12 col-sm-6">
                    <q-input 
                      v-model="representanteEditando.telefone" 
                      label="Telefone (Apenas números)" 
                      outlined 
                      dense 
                      :dark="isDark" 
                      maxlength="11"
                      @update:model-value="val => representanteEditando.telefone = val ? val.replace(/\D/g, '') : ''"
                      hide-bottom-space 
                      class="premium-field" 
                    />
                  </div>
                  
                  <!-- E-MAIL -->
                  <div class="col-12 col-sm-6">
                    <q-input 
                      v-model="representanteEditando.email" 
                      label="E-mail" 
                      outlined 
                      dense 
                      :dark="isDark" 
                      type="email" 
                      hide-bottom-space 
                      class="premium-field" 
                    />
                  </div>

                  <!-- Senha (Aparece apenas na criação de um novo representante) -->
                  <div class="col-12" v-if="!representanteEditando.id">
                    <q-input 
                      v-model="representanteEditando.senha" 
                      label="Senha de Acesso *" 
                      outlined 
                      dense 
                      :dark="isDark" 
                      :type="ocultarSenha ? 'password' : 'text'"
                      :rules="[val => !!val || 'A senha é obrigatória para novos cadastros']" 
                      hide-bottom-space 
                      class="premium-field" 
                    >
                      <template v-slot:append>
                        <q-icon 
                          :name="ocultarSenha ? 'visibility_off' : 'visibility'" 
                          class="cursor-pointer text-grey-5" 
                          @click="ocultarSenha = !ocultarSenha" 
                        />
                      </template>
                    </q-input>
                  </div>

                </div>
              </div>
            </div>

            <!-- Metadados de Data (Ocultos se for novo cadastro) -->
            <div v-if="representanteEditando.id" class="col-12 row justify-between items-center metadata-row q-pt-sm">
              <div class="text-caption text-grey-5 font-11">
                Criado em: <span class="text-weight-medium" :class="isDark ? 'text-grey-3' : 'text-grey-7'">{{ formatarData(representanteEditando.created_at) }}</span>
              </div>
              <div class="text-caption text-grey-5 font-11">
                Última modificação: <span class="text-weight-medium" :class="isDark ? 'text-grey-3' : 'text-grey-7'">{{ formatarData(representanteEditando.updated_at) }}</span>
              </div>
            </div>

            <!-- Botões -->
            <div class="col-12 row justify-end q-gutter-x-md q-mt-lg">
              <q-btn label="Cancelar" color="grey-6" flat v-close-popup :disable="salvando" no-caps class="text-weight-bold font-14" />
              <q-btn :label="representanteEditando.id ? 'Salvar Alterações' : 'Cadastrar Representante'" color="primary" type="submit" :loading="salvando" unevaluated no-caps class="text-weight-bold px-xl font-14 radius-8" />
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
const representantes = ref([])
const busca = ref('')

const paginacao = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 10
})

const modalEdicao = ref(false)
const salvando = ref(false)
const representanteEditando = ref({})
const ocultarSenha = ref(true)

// Cálculo Dinâmico das Páginas
const numeroDePaginas = computed(() => {
  let total = representantes.value.length
  
  if (busca.value) {
    const termo = String(busca.value).toLowerCase()
    total = representantes.value.filter(row => {
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
  { name: 'nome', field: 'nome', label: 'Representante', align: 'left', sortable: true },
  { name: 'contato', field: 'telefone', label: 'Contato', align: 'left' },
  { name: 'acoes', field: 'acoes', label: '', align: 'right', style: 'width: 60px' }
]

async function carregarRepresentantes() {
  loading.value = true
  try {
    const response = await api.get('/representantes', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    representantes.value = response.data.data || response.data || []
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Erro ao carregar a lista de representantes.' })
  } finally {
    loading.value = false
  }
}

function handleRowClick(evt, row) {
  abrirEdicao(row)
}

function abrirEdicao(representante) {
  representanteEditando.value = JSON.parse(JSON.stringify(representante))
  modalEdicao.value = true
}

function abrirNovo() {
  representanteEditando.value = {
    nome: '',
    email: '',
    telefone: '',
    senha: ''
  }
  ocultarSenha.value = true
  modalEdicao.value = true
}

async function salvarRepresentante() {
  salvando.value = true
  try {
    const payload = {
      nome: representanteEditando.value.nome,
      email: representanteEditando.value.email,
      telefone: representanteEditando.value.telefone
    }

    if (representanteEditando.value.id) {
      // PATCH - ATUALIZAÇÃO
      await api.patch(`/representantes/${representanteEditando.value.id}`, payload, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      $q.notify({ type: 'positive', message: 'Representante atualizado com sucesso.' })
    } else {
      // POST - CRIAÇÃO
      payload.senha = representanteEditando.value.senha
      
      await api.post('/representantes', payload, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      $q.notify({ type: 'positive', message: 'Novo representante adicionado com sucesso.' })
    }
    
    modalEdicao.value = false
    await carregarRepresentantes()
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

onMounted(() => {
  carregarRepresentantes()
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