<template>
  <q-page class="page q-pa-md">
    <div class="page-header q-mb-lg row justify-between items-center">
      <div>
        <h1 class="text-h5 text-weight-bold" :class="isDark ? 'text-white' : 'text-grey-9'">
          <q-icon name="receipt_long" color="primary" class="q-mr-sm" size="28px" />
          Meus Projetos e Pedidos
        </h1>
        <p class="text-caption" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
          Gerencie, rastreie as etapas e visualize o detalhamento técnico de todos os seus projetos.
        </p>
      </div>
    </div>

    <q-card class="filter-card q-mb-lg" :class="isDark ? 'filter-card--dark' : 'filter-card--light'" flat bordered>
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-4">
          <q-input v-model="filtros.busca" dense outlined :dark="isDark"
            placeholder="Pesquisar por nome, ID ou lojista..." clearable>
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-select v-model="filtros.status" dense outlined :dark="isDark" :options="opcoesStatus"
            label="Filtrar por Status" clearable emit-value map-options />
        </div>

        <div class="col-12 col-sm-6 col-md-5 row q-col-gutter-sm">
          <div class="col-6">
            <q-input v-model="filtros.dataInicio" dense outlined :dark="isDark" type="date" label="De">
              <template v-slot:prepend v-if="!filtros.dataInicio">
                <q-icon name="event" size="16px" />
              </template>
            </q-input>
          </div>
          <div class="col-6">
            <q-input v-model="filtros.dataFim" dense outlined :dark="isDark" type="date" label="Até">
              <template v-slot:prepend v-if="!filtros.dataFim">
                <q-icon name="event" size="16px" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner-tail color="primary" size="50px" />
      <p class="text-grey-6 q-mt-md font-weight-medium">Buscando seus projetos...</p>
    </div>

    <div v-else-if="pedidosFiltrados.length === 0" class="empty-state text-center q-pa-xl">
      <q-icon name="inventory_2" size="64px" color="grey-4" class="q-mb-md" />
      <h3 class="text-h6 text-grey-6 text-weight-bold">Nenhum pedido encontrado</h3>
      <p class="text-caption text-grey-5">Experimente ajustar os termos de busca ou filtros aplicados.</p>
    </div>

    <div v-else class="pedidos-list">
      <q-expansion-item v-for="order in pedidosFiltrados" :key="order.id" group="meus-pedidos-group"
        class="order-expansion q-mb-md" :class="[
          isDark ? 'order-expansion--dark' : 'order-expansion--light',
          { 'order-expansion--expanded': pedidoExpandidoId === order.id }
        ]" header-class="q-pa-md items-center" @show="carregarDetalhesPedido(order.id)" @hide="fecharPedido(order.id)">
<template v-slot:header>
          <div class="row full-width items-center q-col-gutter-sm">
            <div class="col-12 col-sm-3 flex column justify-center">
              <div class="row items-center q-gutter-x-sm">
                <span class="text-weight-bold text-subtitle1 text-primary">{{ order.nome_projeto }}</span>
                <span class="text-grey-6 text-weight-bold" style="font-size: 13px;">#{{ order.id }}</span>
              </div>
              <span class="text-caption text-grey-6">Pedido: {{ formatDate(order.data_pedido) }}</span>
            </div>

            <div class="col-12 col-sm-3 q-pr-md">
              <div class="row justify-between items-center q-mb-xs">
                <span class="text-caption font-weight-bold text-grey-6">Progresso do projeto</span>
                <span class="text-caption text-weight-bold text-primary">
                  {{ Math.round((getOrdemStatus(order) / totalEtapas) * 100) || 0 }}%
                </span>
              </div>
              <q-linear-progress 
                :value="getOrdemStatus(order) / totalEtapas || 0" 
                :color="getOrdemStatus(order) === 0 || order.status.toLowerCase().includes('recusado') ? 'negative' : 'primary'" 
                :dark="isDark"
                :track-color="isDark ? 'grey-8' : 'grey-4'" 
                :style="{
                  height: '8px', 
                  borderRadius: '4px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                  boxShadow: isDark ? 'none' : 'inset 0 1px 3px rgba(0,0,0,0.2)'
                }"
              />
            </div>

            <div class="col-6 col-sm-2 text-caption flex column">
              <span class="text-grey-6 text-weight-medium">Previsão de Entrega</span>
              <span class="text-orange text-weight-bold">
                {{ order.data_previsao_pedido ? formatDate(order.data_previsao_pedido) : 'Aguardando definição' }}
              </span>
            </div>

            <div class="col-6 col-sm-2 text-caption flex column">
              <span class="text-grey-6 text-weight-medium">Loja responsável</span>
              <span class="text-weight-bold" :class="isDark ? 'text-grey-3' : 'text-grey-8'">{{ order.lojista }}</span>
            </div>

            <div class="col-6 col-sm-2 text-right flex column items-end">
              <span class="status-badge q-mb-xs" :style="getBadgeStyle(order)">
                {{ order.status }}
              </span>
              <span class="text-weight-bold text-subtitle1" :class="isDark ? 'text-white' : 'text-grey-9'">
                {{ formatMoney(order.valor) }}
              </span>
            </div>
          </div>
        </template>

        <q-separator :dark="isDark" />

<q-separator :dark="isDark" />
        
        <q-card-section class="q-pa-md" :class="isDark ? 'bg-dark-soft' : 'bg-grey-1'">
          <div v-if="detalhesLoading && pedidoExpandidoId === order.id" class="text-center q-pa-md">
            <q-spinner color="primary" size="30px" />
            <p class="text-caption text-grey-6 q-mt-sm">Carregando dados do fluxo...</p>
          </div>

          <template v-else-if="detalhes[order.id]">
            <div v-if="order.status.toLowerCase().indexOf('recusado') === -1" class="q-mb-md">
              <div class="text-subtitle2 text-weight-bold q-mb-sm text-grey-7 flex items-center">
                <q-icon name="route" class="q-mr-xs" size="16px" /> Etapas atuais de fabricação
              </div>
              
              <div class="timeline-hz-container q-pa-md" :class="isDark ? 'timeline-hz-container--dark' : 'timeline-hz-container--light'">
                <div class="timeline-hz-row">
                  <div v-for="(step, index) in listaEtapasDoBanco" :key="step.id" class="timeline-hz-item">
                    
                    <div v-if="index < listaEtapasDoBanco.length - 1" 
                         class="step-connect-line"
                         :class="{ 'line-pulsing': step.ordem === detalhes[order.id].id_status }"
                         :style="getTrackStyle(step.ordem, detalhes[order.id].id_status)">
                    </div>

                    <div class="step-circle"
                      :style="{
                        background: getCircleBg(step.ordem, detalhes[order.id].id_status),
                        color: step.ordem <= detalhes[order.id].id_status ? '#ffffff' : (isDark ? '#747d8c' : '#a4b0be'),
                        boxShadow: step.ordem === detalhes[order.id].id_status ? `0 0 0 4px var(--q-primary)30` : 'none'
                      }">
                      <q-icon :name="getTimelineIcon(step.ordem, detalhes[order.id].id_status)" size="12px" />
                    </div>

                    <span class="step-title q-mt-xs"
                          :style="{ color: step.ordem === detalhes[order.id].id_status ? 'var(--q-primary)' : '' }"
                          :class="{ 'text-weight-bold': step.ordem === detalhes[order.id].id_status }">
                      {{ step.label || step.descricao }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="detalhes[order.id].xml" class="row justify-end q-mt-md">
              <q-btn
                color="secondary"
                icon="download"
                no-caps
                outline
                label="Baixar Arquivo de Projeto (XML)"
                @click="downloadXML(detalhes[order.id])"
              />
            </div>
          </template>
        </q-card-section>
      </q-expansion-item>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { api } from 'boot/axios'

const $q = useQuasar()
const authStore = useAuthStore()
const isDark = computed(() => $q.dark.isActive)

// Estados Principais
const loading = ref(true)
const pedidos = ref([])
const detalhes = ref({}) // Dicionário chaveado por ID do pedido { [id]: dadosDoPedido }
const pedidoExpandidoId = ref(null)
const detalhesLoading = ref(false)

// Controle dinâmico de etapas vindo do banco (Igual ao Dashboard)
const totalEtapas = ref(6)
const listaEtapasDoBanco = ref([])

// Filtros Reativos
const filtros = ref({
  busca: '',
  status: null,
  dataInicio: '',
  dataFim: ''
})

// Opções dinâmicas de Status geradas a partir da lista de pedidos carregada
const opcoesStatus = computed(() => {
  const set = new Set(pedidos.value.map(p => p.status))
  return Array.from(set).map(status => ({ label: status, value: status }))
})

// Requisição inicial (Listar pedidos e buscar status do banco)
async function carregarPedidos() {
  loading.value = true
  try {
    const [resPedidos, resStatus] = await Promise.all([
      api.get('/pedidos', { headers: { Authorization: `Bearer ${authStore.token}` } }),
      api.get('/status', { headers: { Authorization: `Bearer ${authStore.token}` } })
    ])

    pedidos.value = resPedidos.data.data || []

    // Filtra para remover status com ordem zero da linha do tempo
    listaEtapasDoBanco.value = (resStatus.data || []).filter(step => step.ordem !== 0)
    totalEtapas.value = listaEtapasDoBanco.value.length || 6

  } catch (err) {
    console.error('Erro ao buscar dados:', err)
    $q.notify({ type: 'negative', message: 'Erro ao carregar lista de pedidos e etapas.' })
  } finally {
    loading.value = false
  }
}

// Descobre em qual etapa o pedido está cruzando o texto do status com a lista do banco
function getOrdemStatus(order) {
  // Se a API por acaso já mandar o número, usa ele
  if (order.ordem_status !== undefined) return order.ordem_status;
  if (order.id_status !== undefined) return order.id_status;

  // Se não, procura na lista do banco a etapa que tem o mesmo nome do status atual
  const step = listaEtapasDoBanco.value.find(s =>
    (s.label || s.descricao || '').toLowerCase() === (order.status || '').toLowerCase()
  );

  return step ? step.ordem : 0;
}

// Requisição sob demanda (Detalhar ID)
async function carregarDetalhesPedido(id) {
  pedidoExpandidoId.value = id
  // Evita re-buscar do backend se já foi carregado anteriormente
  if (detalhes.value[id]) return

  detalhesLoading.value = true
  try {
    const response = await api.get(`/pedidos/${id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    detalhes.value[id] = response.data.data
  } catch (err) {
    console.error(`Erro ao buscar detalhes do pedido #${id}:`, err)
    $q.notify({ type: 'negative', message: 'Não foi possível carregar as especificações do item.' })
  } finally {
    detalhesLoading.value = false
  }
}

// Limpa o ID expandido ao fechar a sanfona
function fecharPedido(id) {
  if (pedidoExpandidoId.value === id) {
    pedidoExpandidoId.value = null
  }
}

// Filtro Inteligente Combinado (Nome, ID, Lojista, Status e Período de Datas)
const pedidosFiltrados = computed(() => {
  return pedidos.value.filter(order => {
    // 1. Filtro por Busca Global Texto (Case Insensitive)
    if (filtros.value.busca) {
      const term = filtros.value.busca.toLowerCase()
      const matchesName = String(order.nome_projeto || '').toLowerCase().includes(term)
      const matchesId = String(order.id).includes(term)
      const matchesLojista = String(order.lojista || '').toLowerCase().includes(term)

      if (!matchesName && !matchesId && !matchesLojista) return false
    }

    // 2. Filtro de Status Exato
    if (filtros.value.status && order.status !== filtros.value.status) {
      return false
    }

    // 3. Filtro por Período de Datas
    if (order.data_pedido) {
      const pDate = new Date(order.data_pedido).getTime()

      if (filtros.value.dataInicio) {
        const start = new Date(filtros.value.dataInicio + 'T00:00:00').getTime()
        if (pDate < start) return false
      }

      if (filtros.value.dataFim) {
        const end = new Date(filtros.value.dataFim + 'T23:59:59').getTime()
        if (pDate > end) return false
      }
    }

    return true
  })
})

// Função de Download do XML Puro
function downloadXML(pedido) {
  if (!pedido.xml) return
  const blob = new Blob([pedido.xml], { type: 'text/xml;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `projeto_${pedido.id}_${pedido.nome_projeto}.xml`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Auxiliares de Tratamento Visual
function formatMoney(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function getBadgeStyle(order) {
  const s = order.status.toLowerCase()
  let c = '#1976D2' // Default azul
  if (s.includes('pendente')) c = '#F2C037' // Amarelo
  if (s.includes('aprovado')) c = '#21BA45' // Verde
  if (s.includes('produção')) c = '#027BE3' // Azul escuro
  if (s.includes('recusado')) c = '#C10015' // Vermelho

  return {
    backgroundColor: c + '15',
    color: c,
    border: `1px solid ${c}30`,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold'
  }
}

// Lógica de Renderização do Feixe de Luz da Timeline
function getTrackStyle(stepOrdem, currentStatusId) {
  if (stepOrdem === currentStatusId) {
    return {
      background: isDark.value ? '#21262d' : '#e0e0e0'
    }
  }
  if (stepOrdem < currentStatusId) return { background: '#21BA45' }
  return { background: isDark.value ? '#21262d' : '#e0e0e0' }
}

function getCircleBg(stepOrdem, currentStatusId) {
  if (stepOrdem < currentStatusId) return '#21BA45'
  if (stepOrdem === currentStatusId) return 'var(--q-primary)'
  return isDark.value ? '#22272e' : '#f3f4f6'
}

function getTimelineIcon(stepOrdem, currentStatusId) {
  if (stepOrdem < currentStatusId) return 'check'
  if (stepOrdem === currentStatusId) return 'hourglass_empty'
  return 'radio_button_unchecked'
}

onMounted(carregarPedidos)
</script>

<style scoped>
/* Cards Principais e Accordions */
.order-expansion {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.order-expansion--light {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.order-expansion--dark {
  background: #1d222b;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.order-expansion--expanded {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.bg-dark-soft {
  background: #14181f;
}

/* Container de Baixo Relevo da Linha do Tempo */
.timeline-hz-container {
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.timeline-hz-container--light {
  background: #f8f9fa;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.timeline-hz-container--dark {
  background: #0f1319;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

/* Elementos do Fluxo Horizontal */
.timeline-hz-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.timeline-hz-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.step-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
}

.step-title {
  font-size: 11px;
  max-width: 90px;
  line-height: 1.2;
}

/* Nova Linha Conectora com Feixe de Luz Varrendo */
.step-connect-line {
  position: absolute;
  top: 10px;
  left: 50%;
  width: 100%;
  height: 3px;
  z-index: 1;
  transition: all 0.5s ease;
}

.line-pulsing {
  height: 3px;
  background-image: linear-gradient(90deg,
      rgba(33, 186, 69, 0) 0%,
      rgba(33, 186, 69, 1) 50%,
      rgba(33, 186, 69, 0) 100%) !important;
  background-size: 60px 100% !important;
  background-repeat: no-repeat !important;
  animation: light-sweep 2.2s infinite ease-in-out !important;
}

@keyframes light-sweep {
  0% {
    background-position: -60px 0;
    opacity: 0.3;
  }

  50% {
    opacity: 1;
  }

  100% {
    background-position: calc(100% + 60px) 0;
    opacity: 0.3;
  }
}

/* Estrutura de subitens técnicos */
.component-row {
  border-left: 2px dashed rgba(128, 128, 128, 0.2);
  padding-left: 8px;
}
</style>