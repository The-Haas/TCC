<template>
  <q-page class="page q-pa-md column">
    <div class="page-header q-mb-lg row justify-between items-center">
      <div>
        <h1 class="text-h5 text-weight-bold" :class="isDark ? 'text-white' : 'text-grey-9'">
          <q-icon name="receipt_long" color="primary" class="q-mr-sm" size="28px" />
          Meus Projetos
        </h1>
        <p class="text-caption" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
          Gerencie e rastreie as etapas de todos os seus projetos.
        </p>
      </div>
    </div>

    <!-- Filtros -->
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

    <!-- Loading e Empty States -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner-tail color="primary" size="50px" />
      <p class="text-grey-6 q-mt-md font-weight-medium">Buscando seus projetos...</p>
    </div>

    <div v-else-if="pedidosFiltrados.length === 0" class="empty-state text-center q-pa-xl">
      <q-icon name="inventory_2" size="64px" color="grey-4" class="q-mb-md" />
      <h3 class="text-h6 text-grey-6 text-weight-bold">Nenhum pedido encontrado</h3>
      <p class="text-caption text-grey-5">Experimente ajustar os termos de busca ou filtros aplicados.</p>
    </div>

    <!-- Lista de Pedidos -->
    <div v-else class="pedidos-list">
      <q-expansion-item v-for="order in pedidosPaginados" :key="order.id" group="meus-pedidos-group"
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
                <span v-if="getOrdemReal(order) === 0" class="text-weight-bold text-uppercase"
                  :style="{ color: getCorReal(order), fontSize: '12px' }">
                  ⚠️ Projeto Suspenso/Recusado
                </span>
                <span v-else class="text-caption font-weight-bold text-grey-6">Progresso do projeto</span>

                <span class="text-caption text-weight-bold"
                  :style="{ color: getOrdemReal(order) === 0 ? getCorReal(order) : (getOrdemReal(order) === totalEtapas ? '#21BA45' : 'var(--q-primary)') }">
                  {{ getOrdemReal(order) === 0 ? '0%' : `${Math.round((getOrdemReal(order) /
                    totalEtapas) * 100)}%` }}
                </span>
              </div>
              <q-linear-progress :value="getOrdemReal(order) === 0 ? 0 : (getOrdemReal(order) / totalEtapas)"
                :dark="isDark" :track-color="isDark ? 'grey-8' : 'grey-4'" :style="{
                  color: getOrdemReal(order) === totalEtapas ? '#21BA45' : 'var(--q-primary)',
                  height: '8px',
                  borderRadius: '4px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                  boxShadow: isDark ? 'none' : 'inset 0 1px 3px rgba(0,0,0,0.2)'
                }" />
            </div>

            <div class="col-6 col-sm-2 text-caption flex column">
              <span class="text-grey-6 text-weight-medium">Previsão de Entrega</span>
              <span class="text-weight-bold" :style="{ color: getOrdemReal(order) === 0 ? getCorReal(order) : '' }"
                :class="getOrdemReal(order) !== 0 ? 'text-orange' : ''">
                {{ getOrdemReal(order) === 0 ? 'Recusado' : (order.data_previsao_pedido ?
                  formatDate(order.data_previsao_pedido) : 'Aguardando definição') }}
              </span>
            </div>

            <div class="col-6 col-sm-2 text-caption flex column">
              <span class="text-grey-6 text-weight-medium">Loja responsável</span>
              <span class="text-weight-bold flex items-center" :class="isDark ? 'text-grey-3' : 'text-grey-8'">
                {{ order.lojista || 'Não informada' }}
                <!-- Exibe o ID do Lojista ao lado do nome da loja -->
                <span v-if="order.id_lojista" class="text-caption text-grey-6 text-weight-normal q-ml-xs">
                  #{{ order.id_lojista }}
                </span>
              </span>
            </div>

            <!-- Coluna 5: Badge de Status com cor exata -->
            <div class="col-12 col-sm-2 flex column col-status-valor">
              <span class="status-badge q-mb-xs" :style="getBadgeStyle(getCorReal(order))">
                {{ order.status }}
              </span>
              <span class="text-weight-bold text-subtitle1" :class="isDark ? 'text-white' : 'text-grey-9'">
                {{ formatMoney(order.valor) }}
              </span>
            </div>
          </div>
        </template>

        <q-separator :dark="isDark" />

        <!-- Detalhamento Interno do Pedido (Linha do Tempo) -->
        <q-card-section class="q-pa-md" :class="isDark ? 'bg-dark-soft' : 'bg-grey-1'">
          <div v-if="detalhesLoading && pedidoExpandidoId === order.id" class="text-center q-pa-md">
            <q-spinner color="primary" size="30px" />
            <p class="text-caption text-grey-6 q-mt-sm">Carregando dados do fluxo...</p>
          </div>

          <template v-else-if="detalhes[order.id]">
            <!-- Oculta a linha do tempo se a ordem do status for 0 (suspenso/recusado/cancelado) -->
            <div v-if="getOrdemReal(order) !== 0" class="q-mb-md">
              <div class="text-subtitle2 text-weight-bold q-mb-sm text-grey-7 flex items-center">
                <q-icon name="route" class="q-mr-xs" size="16px" /> Etapas atuais de fabricação
              </div>

              <!-- Estrutura de Timeline 100% Importada do Dashboard -->
              <div class="timeline-hz-container q-pa-md"
                :class="isDark ? 'timeline-hz-container--dark' : 'timeline-hz-container--light'">
                <div class="timeline-hz-row">
                  <div v-for="(step, index) in listaEtapasDoBanco" :key="step.id" class="timeline-hz-item">

                    <!-- Linha Conectora (Pulsa se for a etapa atual) -->
                    <div v-if="index < listaEtapasDoBanco.length - 1" class="step-connect-line"
                      :class="{ 'line-pulsing': isTrackPulsing(step.ordem, getOrdemReal(order, detalhes[order.id])) }"
                      :style="getTrackStyle(step.ordem, getOrdemReal(order, detalhes[order.id]))">
                    </div>

                    <!-- Círculo da Etapa -->
                    <div class="step-circle"
                      :class="{ 'step-circle--active': step.ordem === getOrdemReal(order, detalhes[order.id]) }" :style="{
                        background: getCircleBg(step.ordem, getOrdemReal(order, detalhes[order.id]), getCorReal(order, detalhes[order.id])),
                        color: step.ordem <= getOrdemReal(order, detalhes[order.id]) ? '#ffffff' : (isDark ? '#747d8c' : '#a4b0be'),
                        boxShadow: step.ordem === getOrdemReal(order, detalhes[order.id]) ? `0 0 0 4px ${getCorReal(order, detalhes[order.id])}30` : 'none'
                      }">
                      <q-icon :name="getTimelineIcon(step.ordem, getOrdemReal(order, detalhes[order.id]))"
                        size="12px" />
                    </div>

                    <!-- Título da Etapa -->
                    <span class="step-title q-mt-xs"
                      :style="{ color: step.ordem === getOrdemReal(order, detalhes[order.id]) ? getCorReal(order, detalhes[order.id]) : '' }"
                      :class="{ 'text-weight-bold': step.ordem === getOrdemReal(order, detalhes[order.id]) }">
                      {{ step.descricao || step.label }}
                    </span>

                    <span v-if="step.ordem === getOrdemReal(order, detalhes[order.id])" class="step-current-tag"
                      :style="{ background: getCorReal(order, detalhes[order.id]) }">
                      Atual
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="detalhes[order.id].xml" class="row justify-end q-mt-md">
              <q-btn color="secondary" icon="download" no-caps outline label="Download XML"
                @click="downloadXML(detalhes[order.id])" />
            </div>
          </template>
        </q-card-section>
      </q-expansion-item>
    </div>

    <!-- Paginação -->
    <div v-if="pedidosFiltrados.length > 0" class="row justify-between items-center q-mt-auto q-pt-md"
      style="border-top: 1px dashed rgba(128,128,128,0.2);">
      <div class="row items-center q-gutter-x-sm">
        <span class="text-caption text-weight-medium gt-xs"
          :class="isDark ? 'text-grey-5' : 'text-grey-6'">Mostrar</span>
        <q-select v-model="itensPorPagina" :options="opcoesItensPorPagina" dense outlined :dark="isDark"
          style="min-width: 65px" @update:model-value="aoMudarItensPorPagina" />
        <span class="text-caption text-weight-medium" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
          <span class="gt-xs">por página</span>
          <span class="lt-sm">itens</span>
        </span>
      </div>
      <q-pagination v-model="paginaAtual" :max="totalPaginas" :max-pages="5" direction-links boundary-numbers round flat
        :color="isDark ? 'grey-4' : 'grey-8'" active-color="primary" active-text-color="white" size="14px" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { api } from 'boot/axios'

const $q = useQuasar()
const authStore = useAuthStore()
const isDark = computed(() => $q.dark.isActive)

// Estados Principais
const loading = ref(true)
const pedidos = ref([])
const detalhes = ref({})
const pedidoExpandidoId = ref(null)
const detalhesLoading = ref(false)


// Configuração da Timeline
const totalEtapas = ref(6)
const listaEtapasDoBanco = ref([])
const todosStatus = ref([])

// Filtros
const filtros = ref({ busca: '', status: null, dataInicio: '', dataFim: '' })
const opcoesStatus = computed(() => {
  const set = new Set(pedidos.value.map(p => p.status))
  return Array.from(set).map(status => ({ label: status, value: status }))
})

async function carregarPedidos() {
  loading.value = true
  try {
    const [resPedidos, resStatus] = await Promise.all([
      api.get('/pedidos', { headers: { Authorization: `Bearer ${authStore.token}` } }),
      api.get('/status', { headers: { Authorization: `Bearer ${authStore.token}` } })
    ])
    pedidos.value = resPedidos.data.data || []

    // 1. Salva TODOS os status (incluindo os recusados/ordem 0) para consultar cores
    todosStatus.value = resStatus.data || []

    // 2. Filtra os de ordem 0 apenas para a linha do tempo
    listaEtapasDoBanco.value = todosStatus.value.filter(step => step.ordem !== 0)

    totalEtapas.value = listaEtapasDoBanco.value.length || 6
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar lista de pedidos e etapas.' })
  } finally {
    loading.value = false
  }
}

async function carregarDetalhesPedido(id) {
  pedidoExpandidoId.value = id
  if (detalhes.value[id]) return // Cache
  detalhesLoading.value = true
  try {
    const response = await api.get(`/pedidos/${id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    detalhes.value[id] = response.data.data
  } catch { // <-- Removido o (err) que não estava sendo usado
    $q.notify({ type: 'negative', message: 'Não foi possível carregar as especificações.' })
  } finally {
    detalhesLoading.value = false
  }
}

function fecharPedido(id) {
  if (pedidoExpandidoId.value === id) pedidoExpandidoId.value = null
}

// --- FUNÇÕES INTELIGENTES E UNIFICADAS (BASEADAS NO DASHBOARD) ---

function getOrdemReal(order, detalhe = null) {
  const alvo = detalhe || order || {};
  const ordem = Number(alvo.ordem_status !== undefined ? alvo.ordem_status : alvo.id_status);

  if (!isNaN(ordem) && ordem > 0) return ordem;

  // Agora pesquisa na lista completa (todosStatus)
  const step = todosStatus.value.find(s =>
    (s.label || s.descricao || '').toLowerCase() === (alvo.status || '').toLowerCase()
  );
  return step ? Number(step.ordem) : 0;
}

function getCorReal(order, detalhe = null) {
  const alvo = detalhe || order || {};
  if (alvo.cor) return alvo.cor;

  // Agora pesquisa na lista completa (todosStatus)
  const step = todosStatus.value.find(s =>
    (s.label || s.descricao || '').toLowerCase() === (alvo.status || '').toLowerCase()
  );
  if (step && step.cor) return step.cor;

  const s = String(alvo.status || '').toLowerCase();
  if (s.includes('pendente')) return '#F2C037';
  if (s.includes('aprovado')) return '#21BA45';
  if (s.includes('produção') || s.includes('andamento')) return '#027BE3';
  if (s.includes('recusado') || s.includes('cancelado')) return '#C10015';
  return '#1976D2'; // Padrão
}

// --- CONTROLES VISUAIS DA TIMELINE ---
function getCircleBg(stepOrdem, currentOrdem, orderCor) {
  if (currentOrdem === 0) return isDark.value ? '#22272e' : '#f3f4f6';
  if (stepOrdem < currentOrdem) return '#21BA45';
  if (stepOrdem === currentOrdem) return orderCor || 'var(--q-primary)';
  return isDark.value ? '#22272e' : '#f3f4f6';
}

function getTimelineIcon(stepOrdem, currentOrdem) {
  if (currentOrdem === 0) return 'radio_button_unchecked';
  if (stepOrdem < currentOrdem) return 'check';
  if (stepOrdem === currentOrdem) return 'hourglass_empty';
  return 'radio_button_unchecked';
}

function getTrackStyle(stepOrdem, currentOrdem) {
  if (stepOrdem < currentOrdem) return { background: '#21BA45' };
  return { background: isDark.value ? '#262a33' : '#e0e0e0' };
}

function isTrackPulsing(stepOrdem, currentOrdem) {
  return stepOrdem === currentOrdem && currentOrdem !== 0;
}

function getBadgeStyle(corBase) {
  return {
    backgroundColor: corBase + '15',
    color: corBase,
    border: `1px solid ${corBase}30`,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  }
}

// --- AUXILIARES GERAIS ---
function formatMoney(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

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

// --- FILTROS E PAGINAÇÃO ---
const pedidosFiltrados = computed(() => {
  return pedidos.value.filter(order => {
    if (filtros.value.busca) {
      const term = filtros.value.busca.toLowerCase()
      const matchesName = String(order.nome_projeto || '').toLowerCase().includes(term)
      const matchesId = String(order.id).includes(term)
      const matchesLojista = String(order.lojista || '').toLowerCase().includes(term)
      if (!matchesName && !matchesId && !matchesLojista) return false
    }
    if (filtros.value.status && order.status !== filtros.value.status) return false
    if (order.data_pedido) {
      const pDate = new Date(order.data_pedido).getTime()
      if (filtros.value.dataInicio && pDate < new Date(filtros.value.dataInicio + 'T00:00:00').getTime()) return false
      if (filtros.value.dataFim && pDate > new Date(filtros.value.dataFim + 'T23:59:59').getTime()) return false
    }
    return true
  })
})

const paginaAtual = ref(1)
const itensPorPagina = ref(10)
const opcoesItensPorPagina = [5, 10, 20, 50]

const totalPaginas = computed(() => {
  if (!pedidosFiltrados.value || pedidosFiltrados.value.length === 0) return 1
  return Math.ceil(pedidosFiltrados.value.length / itensPorPagina.value)
})

const pedidosPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina.value
  return pedidosFiltrados.value.slice(inicio, inicio + itensPorPagina.value)
})

function aoMudarItensPorPagina() {
  paginaAtual.value = 1
}

watch(() => pedidosFiltrados.value.length, () => {
  paginaAtual.value = 1
})

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

/* Container da Linha do Tempo (Igual ao Dashboard) */
.timeline-hz-container {
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.timeline-hz-container--light {
  background: #f8f9fa;
  border: 1px solid rgba(0, 0, 0, 0.04);
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
  max-width: 100%;
}

.timeline-hz-row::-webkit-scrollbar {
  height: 4px;
}

.timeline-hz-row::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 4px;
}

.timeline-hz-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  min-width: 0;
  box-sizing: border-box;
}

/* Círculos e Textos */
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

.step-circle--active {
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.2);
  animation: pulse 2s infinite;
}

.step-title {
  font-size: 11px;
  line-height: 1.2;
  margin-top: 6px;
  max-width: 90px;
  white-space: normal;
  word-break: normal;
  overflow-wrap: normal;
}

.step-current-tag {
  font-size: 9px;
  text-transform: uppercase;
  font-weight: 800;
  color: #fff;
  padding: 1px 5px;
  border-radius: 4px;
  margin-top: 4px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0px rgba(25, 118, 210, 0.3);
  }

  70% {
    box-shadow: 0 0 0 5px rgba(25, 118, 210, 0);
  }

  100% {
    box-shadow: 0 0 0 0px rgba(25, 118, 210, 0);
  }
}

/* Linha Conectora e Feixe de Luz */
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
  background-image: linear-gradient(90deg, rgba(33, 186, 69, 0) 0%, rgba(33, 186, 69, 1) 50%, rgba(33, 186, 69, 0) 100%) !important;
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

/* Ajustes de Responsividade */
@media (max-width: 600px) {
  .timeline-hz-container {
    padding: 12px 8px !important;
  }
}

.col-status-valor {
  align-items: flex-start;
  text-align: left;
  margin-top: 12px;
}

@media (min-width: 600px) {
  .col-status-valor {
    align-items: flex-end;
    text-align: right;
    margin-top: 0;
  }
}
</style>