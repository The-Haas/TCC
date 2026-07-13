<template>
  <q-page class="page">

    <div class="greeting-wrap">
      <div>
        <h1 class="greeting" :class="isDark ? 'text-white' : 'text-grey-9'">
          {{ greeting }}, <span class="greeting-name">{{ firstName }}</span>.
        </h1>
        <p class="greeting-sub" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
          {{ dateStr }} — Acompanhe o andamento dos seus projetos.
        </p>
      </div>
    </div>

    <div class="stats-row">
      <div v-for="card in statCards" :key="card.label" class="stat-card"
        :class="isDark ? 'stat-card--dark' : 'stat-card--light'">
        <div class="stat-icon-wrap" :style="{ background: card.color + '15', color: card.color }">
          <q-icon :name="card.icon" size="24px" />
        </div>

        <div class="stat-text" style="gap: 2px;">
          <div class="row q-mb-xs">
            <span class="stat-label" :style="{
              color: card.color,
              background: card.color + '15',
              padding: '4px 8px',
              borderRadius: '6px',
              border: `1px solid ${card.color}30`,
              fontSize: '11px',
              fontWeight: '800'
            }">
              {{ card.label }}
            </span>
          </div>

          <span class="stat-value" :class="isDark ? 'text-white' : 'text-grey-9'">
            {{ card.value }}
          </span>

          <span class="text-weight-bold q-mt-xs" :class="isDark ? 'text-grey-4' : 'text-grey-7'"
            style="font-size: 14px; line-height: 1;">
            {{ formatMoney(card.totalValor) }}
          </span>
        </div>

        <div class="stat-bar" :style="{ background: card.color }" />
      </div>
    </div>

    <div class="main-grid">

      <div class="block" :class="isDark ? 'block--dark' : 'block--light'">

        <div class="block-head">
          <div class="block-title" :class="isDark ? 'text-grey-1' : 'text-grey-9'">
            <q-icon name="receipt_long" size="20px" color="primary" class="q-mr-sm" />
            Projetos Recentes
          </div>
          <q-btn flat no-caps dense label="Ver todos" color="primary" icon-right="east" to="/pedidos"
            style="font-size:13px; font-weight: 600;" />
        </div>

        <div class="order-list">
          <div v-if="recentOrders.length === 0" class="empty-state">
            <q-icon name="inventory_2" size="40px" color="grey-4" class="q-mb-sm" />
            <span class="text-grey-6 text-weight-medium">Nenhum projeto encontrado.</span>
          </div>

          <div v-for="order in recentOrders" :key="order.id" class="order-card q-mb-md"
            :class="isDark ? 'order-card--dark' : 'order-card--light'">
            <div class="order-row q-pa-md">
              <div class="order-col-info">
                <span class="text-weight-bold text-subtitle1 text-primary">
                  {{ order.nome_projeto }} <span class="text-grey-6 text-weight-medium" style="font-size: 13px;">#{{
                    order.id }}</span>
                </span>
                <span class="text-caption text-grey-6">Pedido: {{ formatDate(order.data_pedido) }}</span>
              </div>

              <div class="order-col-forecast">
                <span class="forecast-label">Previsão:</span>
                <span class="forecast-value" :style="{ color: order.ordem_status === 0 ? order.cor : '' }"
                  :class="order.ordem_status !== 0 ? 'text-orange' : ''">
                  {{ order.ordem_status === 0 ? 'Recusado' : (order.data_previsao_pedido ?
                    formatDate(order.data_previsao_pedido) : 'Aguardando definição') }}
                </span>
              </div>

              <div class="order-col-status">
                <span class="status-badge"
                  :style="{ background: order.cor + '15', color: order.cor, border: `1px solid ${order.cor}30` }">
                  {{ order.status }}
                </span>
              </div>

              <div class="order-col-value text-weight-bold text-subtitle1">
                {{ formatMoney(order.valor) }}
              </div>
            </div>

            <div class="q-px-md q-pb-md q-pt-sm">
              <div class="row justify-between items-center q-mb-xs">
                <span v-if="order.ordem_status === 0" class="text-weight-bold text-uppercase"
                  :style="{ color: order.cor, fontSize: '13px' }">
                  ⚠️ Projeto Suspenso / Recusado
                </span>
                <span v-else class="text-weight-bold" :class="isDark ? 'text-grey-3' : 'text-grey-8'"
                  style="font-size: 13px; letter-spacing: 0.2px;">
                  Progresso do pedido
                </span>

                <span class="text-weight-bold"
                  :style="{ color: order.ordem_status === 0 ? order.cor : 'var(--q-primary)', fontSize: '13px' }">
                  {{ order.ordem_status === 0 ? '0%' : `${Math.round((order.ordem_status / totalEtapas) * 100)}%` }}
                </span>
              </div>

              <q-linear-progress :value="order.ordem_status === 0 ? 0 : (order.ordem_status / totalEtapas)"
                :dark="isDark" :track-color="isDark ? 'grey-8' : 'grey-4'" :style="{
                  color: order.ordem_status === 0 ? order.cor : 'var(--q-primary)',
                  height: '8px',
                  borderRadius: '4px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                  boxShadow: isDark ? 'none' : 'inset 0 1px 3px rgba(0,0,0,0.2)'
                }" />

              <template v-if="order.ordem_status !== 0">
                <div class="row justify-end q-mt-xs">
                  <q-btn flat dense no-caps size="sm" color="primary" class="text-weight-bold"
                    :icon-right="pedidoTimelineAberto === order.id ? 'expand_less' : 'expand_more'"
                    :label="pedidoTimelineAberto === order.id ? 'Ocultar etapas' : 'Rastrear etapas do projeto'"
                    @click="toggleTimeline(order.id)" />
                </div>

                <!-- A animação de abrir/fechar as etapas -->
                <q-slide-transition>
                  <div v-show="pedidoTimelineAberto === order.id">

                    <!-- Sem aquela div de fora, só o container direto! -->
                    <div class="timeline-hz-container q-mt-sm q-mb-md q-pa-md"
                      :class="isDark ? 'timeline-hz-container--dark' : 'timeline-hz-container--light'">

                      <div class="timeline-hz-row">
                        <div v-for="(step, index) in listaEtapasDoBanco" :key="step.id" class="timeline-hz-item">

                          <div v-if="index < listaEtapasDoBanco.length - 1" class="step-connect-line"
                            :class="{ 'line-pulsing': isTrackPulsing(step.ordem, order.ordem_status) }"
                            :style="getTrackStyle(step.ordem, order)">
                          </div>

                          <div class="step-circle"
                            :class="{ 'step-circle--active': step.ordem === order.ordem_status && order.ordem_status !== 0 }"
                            :style="{
                              background: getCircleBg(step.ordem, order, isDark),
                              color: step.ordem <= order.ordem_status && order.ordem_status !== 0 ? '#ffffff' : (isDark ? '#747d8c' : '#a4b0be'),
                              boxShadow: step.ordem === order.ordem_status ? `0 0 0 4px ${order.cor}30` : 'none'
                            }">
                            <q-icon :name="getTimelineIcon(step.ordem, order.ordem_status)" size="12px" />
                          </div>

                          <span class="step-title q-mt-xs"
                            :style="{ color: step.ordem === order.ordem_status ? order.cor : '' }"
                            :class="{ 'text-weight-bold': step.ordem === order.ordem_status }">
                            {{ step.descricao }}
                          </span>

                          <span v-if="step.ordem === order.ordem_status && order.ordem_status !== 0"
                            class="step-current-tag" :style="{ background: order.cor }">
                            Atual
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </q-slide-transition>



              </template>
                              <!-- LINHA BRANCA MOVIDA PARA CA! 
                     Fica fora da transição, então nunca some.
                     Se a timeline abrir, ela é empurrada para baixo. -->
                <q-separator :dark="isDark" class="q-mt-sm q-mb-xs" />
            </div>
          </div>
        </div>
      </div>

      <div class="side-column">
        <div class="block support-block" :class="isDark ? 'block--dark' : 'block--light'">
          <div class="support-icon-wrap">
            <q-icon name="support_agent" size="36px" color="primary" />
          </div>
          <h3 class="support-title" :class="isDark ? 'text-white' : 'text-grey-9'">Precisa de ajuda?</h3>
          <p class="support-text" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
            Ficou com alguma dúvida sobre o andamento do seu projeto? Entre em contato com a loja responsável.
          </p>

          <q-btn unelevated no-caps color="primary" icon="chat" label="Falar com o Lojista" class="full-width q-mt-sm"
            style="border-radius: 10px; font-weight: 700; font-size: 14px; padding: 12px 0;"
            @click="abrirModalLojistas" />
        </div>

        <div class="block info-block q-mt-lg" :class="isDark ? 'block--dark' : 'block--light'">
          <div class="info-header">
            <q-icon name="info" size="18px" :color="isDark ? 'grey-4' : 'grey-7'" />
            <span class="info-title" :class="isDark ? 'text-grey-4' : 'text-grey-8'">Sobre os Prazos</span>
          </div>
          <p class="info-text" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
            As datas de previsão podem sofrer pequenas alterações conforme a complexidade dos itens do projeto e o envio
            para a fábrica.
          </p>
        </div>
      </div>

    </div>
  </q-page>

  <q-dialog v-model="modalLojistas">
    <q-card style="width: 500px; max-width: 90vw; border-radius: 16px;"
      :class="isDark ? 'bg-dark text-white' : 'bg-white text-grey-9'">

      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">Selecione o Lojista</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <p class="text-caption q-mb-md" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
          Abaixo estão listadas as lojas responsáveis pelos seus projetos ativos ou recentes:
        </p>

        <div v-if="lojistasFiltrados.length === 0" class="text-center q-pa-md"
          style="border: 1px dashed rgba(128,128,128,0.3); border-radius: 12px;">
          <span class="text-grey-6">Nenhum lojista vinculado encontrado.</span>
        </div>

        <template v-else>
          <q-card v-for="lojista in lojistasFiltrados" :key="lojista.email" flat bordered class="q-mb-md"
            :class="isDark ? 'bg-dark border-grey-8' : 'bg-white border-grey-3'"
            style="border-radius: 12px; overflow: hidden;">
            <q-card-section class="row items-center q-pb-sm">
              <q-avatar color="primary" text-color="white" icon="store" size="42px" class="q-mr-md" />

              <div class="col">
                <div class="text-weight-bold" style="font-size: 15px;">{{ lojista.nome }}</div>
                <div class="text-caption" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
                  {{ lojista.email }}
                </div>
                <div v-if="lojista.telefone" :class="isDark ? 'text-grey-4' : 'text-grey-7'"
                  class="text-caption text-weight-medium q-mt-xs flex items-center">
                  <q-icon name="phone" size="14px" class="q-mr-xs" />{{ formatarTelefone(lojista.telefone) }}
                </div>
              </div>

              <div class="col-auto row q-gutter-xs">
                <q-btn v-if="lojista.telefone" round flat dense color="green" icon="chat" size="14px"
                  @click="abrirWhatsApp(lojista.telefone, lojista.nome)">
                  <q-tooltip>Chamar no WhatsApp</q-tooltip>
                </q-btn>

                <q-btn round flat dense color="primary" icon="mail" size="14px" @click="abrirEmail(lojista.email)">
                  <q-tooltip>Enviar E-mail</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>

            <q-separator :class="isDark ? 'bg-grey-9' : 'bg-grey-2'" />

            <q-card-section class="q-pt-sm q-pb-md" :class="isDark ? 'bg-grey-10' : 'bg-grey-1'">
              <div class="text-caption text-weight-bold q-mb-sm" :class="isDark ? 'text-grey-6' : 'text-grey-5'"
                style="font-size: 11px;">
                PROJETOS VINCULADOS:
              </div>

              <div v-for="proj in lojista.projetos" :key="proj.id" class="row items-center justify-between q-py-xs">
                <div class="row items-center q-gutter-x-sm">
                  <span class="text-weight-bold" style="font-size: 13px;"
                    :class="isDark ? 'text-grey-3' : 'text-grey-9'">
                    {{ proj.nome || 'Projeto Indefinido' }}
                  </span>
                  <span class="text-caption" :class="isDark ? 'text-grey-6' : 'text-grey-5'">
                    #{{ proj.id }} • {{ formatDate(proj.data) }}
                  </span>
                </div>

                <span class="status-badge" :style="badgeStyle(proj.cor)" style="padding: 2px 8px; font-size: 10px;">
                  {{ proj.status || 'Pendente' }}
                </span>
              </div>
            </q-card-section>
          </q-card>
        </template>

      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { api } from 'boot/axios'

const $q = useQuasar()
const authStore = useAuthStore()
const isDark = computed(() => $q.dark.isActive)

const firstName = computed(() => (authStore.userName || 'Cliente').split(' ')[0])

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
})

const dateStr = computed(() => {
  const rawDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  return rawDate
    .split(' ')
    .map(word => word === 'de' ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

const loading = ref(true)
const loadError = ref('')
const meusPedidos = ref([])
const totalPedidos = ref(0)
const totalEtapas = ref(6)
const listaEtapasDoBanco = ref([])
const pedidoTimelineAberto = ref(null)
const modalLojistas = ref(false)

async function carregarDados() {
  loading.value = true
  loadError.value = ''
  try {
    const [resDashboard, resStatus] = await Promise.all([
      api.get('/dashboard/cliente', {
        headers: { Authorization: `Bearer ${authStore.token}` }
      }),
      api.get('/status', {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
    ])

    totalPedidos.value = resDashboard.data.total_pedidos || 0
    meusPedidos.value = resDashboard.data.pedidos || []

    // Filtra para remover status com ordem zero da linha do tempo
    listaEtapasDoBanco.value = (resStatus.data || []).filter(step => step.ordem !== 0)
    totalEtapas.value = listaEtapasDoBanco.value.length || 6

  } catch (err) {
    console.error('Erro na requisição da dashboard:', err)
    loadError.value = 'Erro ao conectar com o servidor.'
  } finally {
    loading.value = false
  }
}

onMounted(carregarDados)

const pedidosOrdenados = computed(() =>
  [...meusPedidos.value].sort((a, b) => (b.id || 0) - (a.id || 0))
)

const recentOrders = computed(() => pedidosOrdenados.value.slice(0, 2))

const lojistasFiltrados = computed(() => {
  const mapa = new Map()

  meusPedidos.value.forEach(p => {
    if (p.email_lojista) {
      if (!mapa.has(p.email_lojista)) {
        mapa.set(p.email_lojista, {
          nome: p.nome_lojista || 'Lojista Sem Nome',
          email: p.email_lojista,
          telefone: p.telefone_lojista || '',
          projetos: []
        })
      }

      mapa.get(p.email_lojista).projetos.push({
        id: p.id,
        nome: p.nome_projeto,
        data: p.data_pedido,
        status: p.status,
        cor: p.cor
      })
    }
  })

  return Array.from(mapa.values())
})

function abrirModalLojistas() {
  modalLojistas.value = true
}

function abrirWhatsApp(telefone, nomeLojista) {
  const numLimpo = String(telefone).replace(/\D/g, '')
  const texto = encodeURIComponent(`Olá ${nomeLojista}, gostaria de tirar uma dúvida sobre o meu projeto.`)
  window.open(`https://wa.me/55${numLimpo}?text=${texto}`, '_blank')
}

function abrirEmail(email) {
  window.location.href = `mailto:${email}?subject=Dúvida sobre Projeto`
}

function formatarTelefone(tel) {
  if (!tel) return ''
  const num = String(tel).replace(/\D/g, '')
  if (num.length === 11) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`
  }
  if (num.length === 10) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`
  }
  return tel
}

const statCards = computed(() => {
  const map = {}
  meusPedidos.value.forEach(p => {
    const key = p.status || 'Pendente'
    if (!map[key]) {
      map[key] = {
        label: key,
        color: p.cor || '#888888',
        value: 0,
        totalValor: 0,
        icon: getStatusIcon(key)
      }
    }
    map[key].value++
    map[key].totalValor += Number(p.valor || 0)
  })

  if (Object.keys(map).length === 0) {
    return [{ label: 'Projetos', color: '#888888', value: 0, totalValor: 0, icon: 'inventory_2' }]
  }

  return Object.values(map)
})

function getStatusIcon(status) {
  const s = String(status || '').toLowerCase()
  if (s.includes('pendente')) return 'hourglass_empty'
  if (s.includes('aprovado')) return 'thumb_up'
  if (s.includes('recusado') || s.includes('cancelado')) return 'cancel'
  if (s.includes('andamento') || s.includes('produção')) return 'engineering'
  if (s.includes('concluído') || s.includes('entregue')) return 'check_circle'
  return 'inventory_2'
}

function badgeStyle(corBanco) {
  const c = corBanco || '#888888'
  return {
    backgroundColor: c + '1A',
    color: c,
    border: `1px solid ${c}40`
  }
}

function formatMoney(valor) {
  if (valor == null) return 'R$ 0,00'
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt)) return d
  return dt.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function toggleTimeline(pedidoId) {
  pedidoTimelineAberto.value = pedidoTimelineAberto.value === pedidoId ? null : pedidoId
}

function getCircleBg(stepOrdem, order, isDark) {
  if (order.ordem_status === 0) return isDark ? '#22272e' : '#f3f4f6'
  if (stepOrdem < order.ordem_status) return '#21BA45'
  if (stepOrdem === order.ordem_status) return order.cor || 'var(--q-primary)'
  return isDark ? '#22272e' : '#f3f4f6'
}

function getTimelineIcon(stepOrdem, currentOrdem) {
  if (currentOrdem === 0) return 'radio_button_unchecked'
  if (stepOrdem < currentOrdem) return 'check'
  if (stepOrdem === currentOrdem) return 'hourglass_empty'
  return 'radio_button_unchecked'
}

// Retorna o fundo da linha (passado = verde, atual = degradê pulsante, futuro = cinza)
function getTrackStyle(stepOrdem, order) {
  const current = order.ordem_status

  // Se for uma etapa que já passou, fica verde sólida
  if (stepOrdem < current) {
    return { background: '#21BA45' }
  }

  // Status Atual e Futuro compartilham a mesma base cinza discreta
  return { background: isDark.value ? '#262a33' : '#e0e0e0' }
}

// Verifica se a linha deste step deve pulsar (apenas o step atual pulsa para o próximo)
function isTrackPulsing(stepOrdem, currentOrdem) {
  return stepOrdem === currentOrdem
}
</script>

<style scoped>
.page {
  padding: 32px 28px 48px;
}

/* No mobile, o Pedidos usa o padding padrão do Quasar (16px) tanto na
   página quanto dentro dos cards. Aqui no Dashboard o padding da página
   (28px) somado ao padding do .block (24px) e do card interno deixava
   bem menos largura sobrando pro conteúdo — inclusive pro detalhamento
   das etapas, que por isso ficava mais estreito/apertado que no Pedidos. */
@media (max-width: 600px) {
  .page {
    padding: 12px 8px 24px;
  }
}

/* ══════════════════════════════════════
   GREETING
   ══════════════════════════════════════ */
.greeting-wrap {
  margin-bottom: 32px;
}

.greeting {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 8px;
  line-height: 1.2;
}

.greeting-name {
  color: var(--q-primary);
}

.greeting-sub {
  font-size: 14px;
  margin: 0;
  font-weight: 500;
}

/* ══════════════════════════════════════
   STAT CARDS
   ══════════════════════════════════════ */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
}

.stat-card--dark {
  background: #161b22;
  border: 1px solid rgba(255, 255, 255, .05);
}

.stat-card--light {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, .04);
  box-shadow: 0 4px 12px rgba(0, 0, 0, .03);
}

.stat-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  opacity: 0.8;
  border-radius: 0 0 16px 16px;
}

/* ══════════════════════════════════════
   GRID PRINCIPAL
   ══════════════════════════════════════ */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
}

@media (max-width: 1060px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

.block {
  border-radius: 20px;
  padding: 24px;
}

@media (max-width: 600px) {
  .block {
    padding: 12px;
  }
}

.block--dark {
  background: #161b22;
  border: 1px solid rgba(255, 255, 255, .05);
}

.block--light {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, .04);
  box-shadow: 0 4px 12px rgba(0, 0, 0, .03);
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.block-title {
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  background: rgba(128, 128, 128, 0.03);
  border-radius: 12px;
  border: 1px dashed rgba(128, 128, 128, 0.2);
}

/* ══════════════════════════════════════
   LISTA DE PEDIDOS CORRIGIDA E DISCRETA
   ══════════════════════════════════════ */
.order-list {
  display: flex;
  flex-direction: column;
}

.order-row {
  padding: 16px 12px;
  border-radius: 12px;
  transition: all .15s ease;
  border-bottom: 1px solid transparent;
}

@media (min-width: 601px) {
  .order-row {
    display: grid;
    grid-template-columns: 2.2fr 1.3fr 1.5fr 1fr;
    align-items: center;
    gap: 16px;
  }

  .order-col-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .order-col-forecast {
    display: flex;
    flex-direction: column;
  }

  .order-col-status {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .order-col-value {
    text-align: right;
  }
}

@media (max-width: 600px) {
  .order-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .order-col-info {
    grid-column: span 2;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .order-col-forecast {
    grid-column: span 2;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }

  .order-col-forecast .forecast-label {
    margin-bottom: 0;
  }

  .order-col-status {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .order-col-value {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    text-align: right;
  }
}

.order-row--light:not(:last-child) {
  border-bottom-color: rgba(0, 0, 0, 0.06);
}

.order-row--light:hover {
  background: rgba(0, 0, 0, 0.02);
  border-bottom-color: transparent;
}

.order-row--dark:not(:last-child) {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

.order-row--dark:hover {
  background: rgba(255, 255, 255, 0.03);
  border-bottom-color: transparent;
}

.order-product {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-meta {
  font-size: 12px;
  font-weight: 500;
}

.forecast-label {
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  color: #999;
  margin-bottom: 2px;
}

.forecast-value {
  font-size: 12px;
  font-weight: 600;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  /* Deixa os cantos levemente arredondados, formato quadradinho */
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  /* Removido o text-transform: uppercase para o texto ficar natural igual à foto (ex: Em Produção) */
}

.order-value {
  font-size: 15px;
  font-weight: 800;
}

/* ══════════════════════════════════════
   ESTILOS AJUSTADOS DO CONTAINER DA LINHA DO TEMPO
   ══════════════════════════════════════ */
.timeline-hz-container {
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

/* Modo Claro: Um cinza bem suave, quase branco, para dar profundidade */
.timeline-hz-container--light {
  background: #f8f9fa;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

/* Modo Escuro: Sai o preto puro (#000000) e entra um grafite ligeiramente */
/* mais escuro que o card (#161b22), criando um efeito elegante de "baixo relevo" */
.timeline-hz-container--dark {
  background: #0f1319;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.timeline-hz-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
}

/* Barra de rolagem discreta para telas muito pequenas no mobile */
.timeline-hz-row::-webkit-scrollbar {
  height: 4px;
}

.timeline-hz-row::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 4px;
}

.timeline-hz-track {
  position: absolute;
  top: 15px;
  /* Alinha perfeitamente ao meio vertical do círculo de 22px */
  left: 40px;
  right: 40px;
  height: 2px;
  z-index: 1;
}

.track-light {
  background: #e0e0e0;
}

.track-dark {
  background: #262a33;
}

/* Linha conectora individual */
.step-connect-line {
  position: absolute;
  top: 10px;
  /* Alinha perfeitamente ao centro do círculo de 22px */
  left: 50%;
  /* Começa no centro do círculo atual */
  width: 100%;
  /* Vai até o centro do próximo círculo */
  height: 3px;
  z-index: 1;
  transition: all 0.5s ease;
}

/* Força o container do item a ser o ponto de referência da linha */
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

/* CLASSE ATIVA DA LINHA ATUAL: Injeta o feixe de luz sutil */
.line-pulsing {
  height: 3px;
  /* Cria uma base cinza, mas com um "ponto" verde luminoso no meio */
  background-image: linear-gradient(90deg,
      rgba(33, 186, 69, 0) 0%,
      rgba(33, 186, 69, 1) 50%,
      rgba(33, 186, 69, 0) 100%) !important;
  background-size: 60px 100% !important;
  /* Tamanho do feixe de luz */
  background-repeat: no-repeat !important;
  animation: light-sweep 2.2s infinite ease-in-out !important;
}

/* Animação que faz o feixe nascer na esquerda e viajar até a direita */
@keyframes light-sweep {
  0% {
    background-position: -60px 0;
    /* Começa escondido antes do círculo atual */
    opacity: 0.3;
  }

  50% {
    opacity: 1;
    /* Fica bem nítido no meio do caminho */
  }

  100% {
    background-position: calc(100% + 60px) 0;
    /* Viaja e some dentro do próximo círculo */
    opacity: 0.3;
  }
}

/* Garante que o círculo fique por cima da linha */
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

  /* Quebra a linha normalmente nos espaços entre as palavras (como no
     Pedidos), em vez de forçar a quebra no meio da palavra. */
  white-space: normal;
  word-break: normal;
  overflow-wrap: normal;
}

.step-current-tag {
  font-size: 9px;
  text-transform: uppercase;
  font-weight: 800;
  background: var(--q-primary);
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

/* Em telas pequenas, o Dashboard tem mais camadas de padding aninhadas do
   que a tela de Pedidos (card > linha do pedido > container da timeline).
   Aqui reduzimos só o padding do container da timeline para sobrar mais
   espaço horizontal para as 5 etapas, sem mexer no resto do layout. */
@media (max-width: 600px) {
  .timeline-hz-container {
    padding: 12px 8px !important;
  }
}

/* ══════════════════════════════════════
   COLUNA DIREITA (SUPORTE)
   ══════════════════════════════════════ */
.support-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 24px;
}

.support-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 123, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.support-title {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 8px;
}

.support-text {
  font-size: 13px;
  line-height: 1.5;
  margin: 0 0 20px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.info-title {
  font-size: 14px;
  font-weight: 700;
}

.info-text {
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}

/* Nova Barra de Progresso Customizada */
.custom-progress-container {
  width: 100%;
}

.custom-progress-track {
  width: 100%;
  height: 8px;
  /* Mais gordinha para melhor visualização */
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

/* Fundo da barra no tema claro (baixo relevo sutil) */
.track-light {
  background: #e2e8f0;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Fundo da barra no tema escuro (fundo bem demarcado) */
.track-dark {
  background: #15181e;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
}

/* Cor que preenche a barra */
.custom-progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
  /* Adiciona um gradiente de brilho na cor principal */
  background-image: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.2) 100%);
}
</style>