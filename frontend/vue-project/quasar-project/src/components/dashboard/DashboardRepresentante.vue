<template>
  <q-page class="representative-dashboard">
    <!-- Cabeçalho executivo -->
    <section class="dashboard-hero">
      <div class="hero-copy">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Painel do representante
        </div>

        <h1 class="hero-title font-display">
          {{ greeting }}, <span>{{ firstName }}</span>.
        </h1>

        <p class="hero-subtitle">
          {{ dateStr }} · Acompanhe sua carteira de lojistas e os projetos em andamento.
        </p>
      </div>

      <div class="hero-summary">
        <div class="hero-summary__item">
          <span class="hero-summary__label">Projetos no período</span>
          <strong>{{ totalPedidos }}</strong>
        </div>

        <div class="hero-summary__divider"></div>

        <div class="hero-summary__item">
          <span class="hero-summary__label">Volume financeiro</span>
          <strong>{{ formatMoney(valorTotalPeriodo) }}</strong>
        </div>
      </div>
    </section>

    <!-- Consulta compacta -->
    <section class="panel filter-panel">
      <div class="filter-intro">
        <div class="section-kicker">Consulta</div>
        <h2 class="section-title">Filtros do dashboard</h2>
        <p class="filter-note">Os indicadores respeitam o período selecionado.</p>
      </div>

      <div class="filter-grid">
        <div class="field-group">
          <span class="field-label">Agrupamento</span>
          <q-select
            v-model="filtros.agrupamento"
            :options="opcoesAgrupamento"
            emit-value
            map-options
            outlined
            dense
            :dark="isDark"
            class="dashboard-field"
            dropdown-icon="expand_more"
          >
            <template #prepend>
              <q-icon name="calendar_view_month" size="17px" class="field-icon" />
            </template>
          </q-select>
        </div>

        <div class="field-group">
          <span class="field-label">Data inicial</span>
          <q-input
            v-model="filtros.dataInicio"
            mask="##/##/####"
            outlined
            dense
            :dark="isDark"
            class="dashboard-field"
            placeholder="DD/MM/AAAA"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer field-icon">
                <q-popup-proxy
                  ref="qDateProxyInicio"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="filtros.dataInicio"
                    mask="DD/MM/YYYY"
                    :dark="isDark"
                    color="orange"
                    @update:model-value="() => $refs.qDateProxyInicio.hide()"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="field-group">
          <span class="field-label">Data final</span>
          <q-input
            v-model="filtros.dataFim"
            mask="##/##/####"
            outlined
            dense
            :dark="isDark"
            class="dashboard-field"
            placeholder="DD/MM/AAAA"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer field-icon">
                <q-popup-proxy
                  ref="qDateProxyFim"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="filtros.dataFim"
                    mask="DD/MM/YYYY"
                    :dark="isDark"
                    color="orange"
                    @update:model-value="() => $refs.qDateProxyFim.hide()"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <q-btn
          unelevated
          no-caps
          icon="sync"
          label="Atualizar"
          class="refresh-btn"
          :loading="loading"
          @click="carregarDados"
        />
      </div>
    </section>

    <div v-if="loadError" class="dashboard-alert dashboard-alert--error">
      <q-icon name="error_outline" size="20px" />
      <span>{{ loadError }}</span>
      <q-space />
      <q-btn flat dense no-caps label="Tentar novamente" @click="carregarDados" />
    </div>

    <!-- Situação dos projetos -->
    <section class="dashboard-section dashboard-section--separated">
      <div class="section-heading-row">
        <div>
          <div class="section-kicker">Pipeline</div>
          <h2 class="section-title">Situação dos projetos</h2>
        </div>

        <span class="section-caption">Valores e quantidade por status</span>
      </div>

      <div class="status-grid">
        <article
          v-for="card in statCards"
          :key="card.label"
          class="status-card panel"
        >
          <div class="status-card__top">
            <div
              class="status-card__icon"
              :style="{ color: card.color, background: card.color + '14' }"
            >
              <q-icon :name="card.icon" size="22px" />
            </div>

            <span
              class="status-pill"
              :style="{
                color: card.color,
                borderColor: card.color + '35',
                background: card.color + '10'
              }"
            >
              {{ card.label }}
            </span>
          </div>

          <strong class="status-card__value">
            {{ formatMoney(card.totalValor) }}
          </strong>

          <div class="status-card__footer">
            <span>
              {{ card.value }}
              {{ card.value === 1 ? 'projeto' : 'projetos' }}
            </span>

            <span class="status-card__percent">
              {{ getStatusPercent(card.value) }}%
            </span>
          </div>

          <div
            class="status-card__accent"
            :style="{ background: card.color }"
          ></div>
        </article>
      </div>
    </section>

    <!-- Resumo do período -->
    <section class="dashboard-section dashboard-section--summary dashboard-section--separated">
      <div class="section-heading-row">
        <div>
          <div class="section-kicker">Resumo</div>
          <h2 class="section-title">Indicadores do período</h2>
        </div>

        <span class="section-caption">
          Visão rápida da sua carteira na consulta atual
        </span>
      </div>

      <div class="executive-grid">
        <article
          v-for="metric in executiveMetrics"
          :key="metric.label"
          class="metric-card panel"
        >
          <div class="metric-card__icon">
            <q-icon :name="metric.icon" size="21px" />
          </div>

          <div class="metric-card__body">
            <span class="metric-card__label">{{ metric.label }}</span>
            <strong class="metric-card__value">{{ metric.value }}</strong>
            <span class="metric-card__helper">{{ metric.helper }}</span>
          </div>
        </article>
      </div>
    </section>

    <!-- Analytics -->
    <section class="dashboard-section dashboard-section--separated">
      <div class="section-heading-row">
        <div>
          <div class="section-kicker">Desempenho</div>
          <h2 class="section-title">Visão analítica</h2>
        </div>

        <span class="section-caption">
          Evolução, distribuição e desempenho dos seus lojistas
        </span>
      </div>

      <div class="analytics-grid analytics-grid--primary">
        <article class="panel chart-card chart-card--wide">
          <div class="chart-head">
            <div class="chart-title-wrap">
              <div class="chart-icon chart-icon--brand">
                <q-icon name="trending_up" size="19px" />
              </div>

              <div>
                <h3>Evolução financeira</h3>
                <p>Volume vendido ao longo do período</p>
              </div>
            </div>
          </div>

          <apexchart
            :key="chaveGrafico"
            type="area"
            height="330"
            :options="chartAreaOptions"
            :series="chartAreaSeries"
          />
        </article>

        <article class="panel chart-card">
          <div class="chart-head">
            <div class="chart-title-wrap">
              <div class="chart-icon chart-icon--brand">
                <q-icon name="donut_large" size="19px" />
              </div>

              <div>
                <h3>Status dos projetos</h3>
                <p>Distribuição da carteira atual</p>
              </div>
            </div>
          </div>

          <apexchart
            :key="chaveGrafico"
            type="donut"
            height="330"
            :options="chartPieOptions"
            :series="chartPieSeries"
          />
        </article>
      </div>

      <div class="analytics-grid analytics-grid--ranking-single">
        <article class="panel chart-card">
          <div class="chart-head">
            <div class="chart-title-wrap">
              <div class="chart-icon chart-icon--brand">
                <q-icon name="storefront" size="19px" />
              </div>

              <div>
                <h3>Lojistas em destaque</h3>
                <p>Ranking por valor vendido no período</p>
              </div>
            </div>
          </div>

          <apexchart
            :key="chaveGrafico"
            type="bar"
            height="300"
            :options="chartBarOptions"
            :series="chartBarSeries"
          />
        </article>
      </div>
    </section>

    <!-- Operação recente + rede -->
    <section class="operations-grid operations-grid--separated">
      <article class="panel recent-panel">
        <div class="panel-heading recent-heading">
          <div>
            <div class="section-kicker">Operação</div>
            <h2 class="section-title">Projetos recentes</h2>
          </div>

          <q-btn
            flat
            no-caps
            dense
            class="text-btn"
            label="Ver todos"
            icon-right="arrow_forward"
            to="/pedidos"
          />
        </div>

        <div v-if="loading && recentOrders.length === 0" class="loading-state">
          <q-spinner size="28px" color="orange" />
          <span>Carregando projetos...</span>
        </div>

        <div v-else-if="recentOrders.length === 0" class="empty-state">
          <div class="empty-icon">
            <q-icon name="inventory_2" size="26px" />
          </div>
          <strong>Nenhum projeto encontrado</strong>
          <span>Ajuste os filtros ou aguarde novas movimentações.</span>
        </div>

        <div v-else class="orders-stack">
          <article
            v-for="order in recentOrders"
            :key="order.id"
            class="order-card"
          >
            <div class="order-card__main">
              <div class="order-identity">
                <div class="order-id-row">
                  <span class="order-id">Pedido #{{ order.id }}</span>
                  <span class="order-date">
                    {{ formatDate(order.data_pedido) }}
                  </span>
                </div>

                <div class="order-store">
                  <q-icon name="storefront" size="17px" />
                  <strong>
                    {{ order.nome_lojista || 'Lojista não informado' }}
                  </strong>
                  <span v-if="order.id_lojista">#{{ order.id_lojista }}</span>
                </div>

                <div class="order-meta">
                  <span>
                    <q-icon name="person" size="14px" />
                    {{ order.nome_cliente || 'Cliente não informado' }}
                  </span>

                  <span>
                    <q-icon name="draw" size="14px" />
                    {{ order.nome_projeto || 'Projeto sem nome' }}
                  </span>
                </div>
              </div>

              <div class="order-side-data">
                <div class="order-money">
                  {{ formatMoney(order.valor) }}
                </div>

                <span
                  class="status-pill order-status"
                  :style="{
                    color: order.cor,
                    borderColor: order.cor + '35',
                    background: order.cor + '10'
                  }"
                >
                  {{ order.status }}
                </span>

                <span
                  class="forecast-text"
                  :class="{ 'forecast-text--danger': order.ordem_status === 0 }"
                >
                  <q-icon name="event_available" size="14px" />

                  {{
                    order.ordem_status === 0
                      ? 'Projeto recusado'
                      : (
                          order.data_previsao_pedido
                            ? `Previsão: ${formatDate(order.data_previsao_pedido)}`
                            : 'Previsão aguardando definição'
                        )
                  }}
                </span>
              </div>
            </div>

            <div class="order-progress">
              <div class="order-progress__head">
                <div>
                  <strong>
                    {{
                      order.ordem_status === 0
                        ? 'Fluxo interrompido'
                        : 'Progresso do projeto'
                    }}
                  </strong>

                  <span>
                    {{
                      order.ordem_status === 0
                        ? 'O projeto precisa de uma nova ação para continuar.'
                        : 'Acompanhe a etapa atual do projeto.'
                    }}
                  </span>
                </div>

                <span
                  class="progress-number"
                  :style="{
                    color: order.ordem_status === 0
                      ? order.cor
                      : 'var(--brand)'
                  }"
                >
                  {{
                    order.ordem_status === 0
                      ? '0%'
                      : `${Math.round((order.ordem_status / (totalEtapas || 1)) * 100)}%`
                  }}
                </span>
              </div>

              <q-linear-progress
                rounded
                size="7px"
                :value="
                  order.ordem_status === 0
                    ? 0
                    : (order.ordem_status / (totalEtapas || 1))
                "
                :color="
                  order.ordem_status === 0
                    ? 'negative'
                    : (
                        order.ordem_status === totalEtapas
                          ? 'positive'
                          : 'orange'
                      )
                "
                :track-color="isDark ? 'grey-9' : 'grey-3'"
              />

              <template v-if="order.ordem_status !== 0">
                <div class="timeline-action-row">
                  <q-btn
                    flat
                    dense
                    no-caps
                    class="text-btn"
                    :icon-right="
                      pedidoTimelineAberto === order.id
                        ? 'expand_less'
                        : 'expand_more'
                    "
                    :label="
                      pedidoTimelineAberto === order.id
                        ? 'Ocultar etapas'
                        : 'Detalhar etapas'
                    "
                    @click="toggleTimeline(order.id)"
                  />
                </div>

                <q-slide-transition>
                  <div
                    v-show="pedidoTimelineAberto === order.id"
                    class="timeline-shell"
                  >
                    <div class="timeline-hz-row">
                      <div
                        v-for="(step, index) in listaEtapasDoBanco"
                        :key="step.id"
                        class="timeline-hz-item"
                      >
                        <div
                          v-if="index < listaEtapasDoBanco.length - 1"
                          class="step-connect-line"
                          :class="{
                            'line-pulsing':
                              isTrackPulsing(step.ordem, order.ordem_status)
                          }"
                          :style="getTrackStyle(step.ordem, order)"
                        ></div>

                        <div
                          class="step-circle"
                          :class="{
                            'step-circle--active':
                              step.ordem === order.ordem_status &&
                              order.ordem_status !== 0
                          }"
                          :style="{
                            background: getCircleBg(step.ordem, order, isDark),
                            color:
                              step.ordem <= order.ordem_status &&
                              order.ordem_status !== 0
                                ? '#ffffff'
                                : (isDark ? '#747d8c' : '#a4b0be'),
                            boxShadow:
                              step.ordem === order.ordem_status
                                ? `0 0 0 4px ${order.cor}30`
                                : 'none'
                          }"
                        >
                          <q-icon
                            :name="
                              getTimelineIcon(
                                step.ordem,
                                order.ordem_status
                              )
                            "
                            size="12px"
                          />
                        </div>

                        <span
                          class="step-title"
                          :class="{
                            'step-title--active':
                              step.ordem === order.ordem_status
                          }"
                        >
                          {{ step.descricao }}
                        </span>

                        <span
                          v-if="step.ordem === order.ordem_status"
                          class="step-current-tag"
                        >
                          Atual
                        </span>
                      </div>
                    </div>
                  </div>
                </q-slide-transition>
              </template>
            </div>
          </article>
        </div>
      </article>

      <aside class="network-column">
        <article class="panel network-card">
          <div class="network-card__visual">
            <div class="network-orbit network-orbit--one"></div>
            <div class="network-orbit network-orbit--two"></div>

            <div class="network-main-icon">
              <q-icon name="storefront" size="27px" />
            </div>
          </div>

          <div class="section-kicker">Minha rede</div>
          <h2 class="network-title">Carteira de lojistas</h2>

          <p class="network-copy">
            Consulte rapidamente os lojistas da sua carteira e os projetos
            vinculados ao período selecionado.
          </p>

          <div class="network-stats">
            <div>
              <strong>{{ lojistasFiltrados.length }}</strong>
              <span>Lojistas ativos</span>
            </div>

            <div>
              <strong>{{ meusPedidos.length }}</strong>
              <span>Projetos</span>
            </div>
          </div>

          <div class="network-actions">
            <q-btn
              unelevated
              no-caps
              icon="storefront"
              label="Ver meus lojistas"
              class="network-btn network-btn--primary"
              @click="modalLojistas = true"
            />
          </div>
        </article>
      </aside>
    </section>

    <!-- Modal: Lojistas -> Projetos -->
    <q-dialog v-model="modalLojistas">
      <q-card class="network-dialog">
        <q-card-section class="dialog-head">
          <div class="dialog-title-wrap">
            <div class="dialog-icon">
              <q-icon name="storefront" size="21px" />
            </div>

            <div>
              <h3>Minha carteira de lojistas</h3>
              <p>
                {{ lojistasFiltrados.length }}
                {{
                  lojistasFiltrados.length === 1
                    ? 'lojista na consulta atual'
                    : 'lojistas na consulta atual'
                }}
              </p>
            </div>
          </div>

          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="dialog-body">
          <div
            v-if="lojistasFiltrados.length === 0"
            class="empty-state compact-empty"
          >
            <div class="empty-icon">
              <q-icon name="storefront" size="25px" />
            </div>
            <strong>Nenhum lojista encontrado</strong>
            <span>Não há dados para os filtros atuais.</span>
          </div>

          <q-list v-else class="network-list">
            <q-expansion-item
              v-for="lojista in lojistasFiltrados"
              :key="lojista.id"
              group="lojistas"
              class="network-expansion"
            >
              <template #header>
                <q-item-section avatar>
                  <div class="list-avatar">
                    <q-icon name="storefront" size="18px" />
                  </div>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="list-title">
                    {{ lojista.nome }}
                  </q-item-label>

                  <q-item-label caption>
                    {{ lojista.projetos.length }}
                    {{
                      lojista.projetos.length === 1
                        ? 'projeto vinculado'
                        : 'projetos vinculados'
                    }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <span class="id-chip">#{{ lojista.id }}</span>
                </q-item-section>
              </template>

              <div class="expansion-inner">
                <div
                  v-if="lojista.email || lojista.telefone"
                  class="contact-strip"
                >
                  <div class="contact-info">
                    <span v-if="lojista.email">
                      <q-icon name="mail_outline" size="14px" />
                      {{ lojista.email }}
                    </span>

                    <span v-if="lojista.telefone">
                      <q-icon name="phone" size="14px" />
                      {{ formatarTelefone(lojista.telefone) }}
                    </span>
                  </div>

                  <div class="contact-actions">
                    <q-btn
                      v-if="lojista.telefone"
                      flat
                      round
                      dense
                      icon="chat"
                      @click.stop="
                        abrirWhatsApp(
                          lojista.telefone,
                          lojista.nome
                        )
                      "
                    >
                      <q-tooltip>WhatsApp</q-tooltip>
                    </q-btn>

                    <q-btn
                      v-if="lojista.email"
                      flat
                      round
                      dense
                      icon="mail"
                      @click.stop="
                        abrirEmail(
                          lojista.email,
                          lojista.nome
                        )
                      "
                    >
                      <q-tooltip>E-mail</q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <div class="projects-mini-list">
                  <div
                    v-for="projeto in lojista.projetos"
                    :key="projeto.id"
                    class="project-mini-row"
                  >
                    <div class="project-mini-main">
                      <strong>
                        {{ projeto.nome || 'Projeto sem nome' }}
                      </strong>

                      <span>
                        {{ projeto.nome_cliente }}
                        <template v-if="projeto.id_cliente">
                          · Cliente #{{ projeto.id_cliente }}
                        </template>
                      </span>
                    </div>

                    <div class="project-mini-side">
                      <strong>
                        {{ formatMoney(projeto.valor) }}
                      </strong>

                      <span
                        class="status-pill mini-status"
                        :style="{
                          color: projeto.cor,
                          borderColor: projeto.cor + '35',
                          background: projeto.cor + '10'
                        }"
                      >
                        {{ projeto.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </q-expansion-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { api } from 'boot/axios'
import VueApexCharts from 'vue3-apexcharts'

const chaveGrafico = ref(0)
const apexchart = VueApexCharts

// Filtros
const filtros = ref({
  agrupamento: 'mes',
  dataInicio: '',
  dataFim: ''
})

const opcoesAgrupamento = [
  { label: 'Semanal', value: 'semana' },
  { label: 'Mensal', value: 'mes' },
  { label: 'Anual', value: 'anual' }
]

// Dados dos gráficos retornados pelo endpoint do representante
const dadosGraficos = ref({
  area: [],
  pizza: [],
  barras: []
})

const $q = useQuasar()
const authStore = useAuthStore()

const isDark = computed(() => $q.dark.isActive)

const firstName = computed(() =>
  (authStore.userName || 'Representante').split(' ')[0]
)

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
    .map(word =>
      word === 'de'
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ')
})

const loading = ref(true)
const loadError = ref('')
const meusPedidos = ref([])
const totalPedidos = ref(0)
const pedidoTimelineAberto = ref(null)

const modalLojistas = ref(false)

const totalEtapas = ref(0)
const todosOsStatusDoBanco = ref([])
const listaEtapasDoBanco = ref([])
const todosOsLojistas = ref([])

function formatDataToAPI(dataBR) {
  if (!dataBR) return ''

  const [d, m, y] = dataBR.split('/')

  if (y && m && d) {
    return `${y}-${m}-${d}`
  }

  return ''
}

async function carregarEtapasDoBanco() {
  try {
    const resStatus = await api.get('/status', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    todosOsStatusDoBanco.value = resStatus.data || []

    listaEtapasDoBanco.value = todosOsStatusDoBanco.value
      .filter(etapa => Number(etapa.ordem) > 0)
      .sort((a, b) => Number(a.ordem) - Number(b.ordem))

    totalEtapas.value = listaEtapasDoBanco.value.length
  } catch (err) {
    console.error('Erro ao buscar as etapas dinâmicas no banco:', err)
  }
}

function mapearStatusDinamico(statusStr) {
  const s = String(statusStr || '').trim().toLowerCase()

  const etapaEncontrada = todosOsStatusDoBanco.value.find(
    etapa =>
      String(etapa.descricao).trim().toLowerCase() === s
  )

  if (etapaEncontrada) {
    return {
      ordem: Number(etapaEncontrada.ordem),
      cor:
        etapaEncontrada.cor ||
        (
          Number(etapaEncontrada.ordem) === 0
            ? '#e74c3c'
            : '#ff7b00'
        )
    }
  }

  return {
    ordem: 0,
    cor: '#e74c3c'
  }
}

async function carregarDados() {
  loading.value = true
  loadError.value = ''

  try {
    await carregarEtapasDoBanco()

    const queryParams = new URLSearchParams()

    queryParams.append(
      'agrupamento',
      filtros.value.agrupamento
    )

    if (filtros.value.dataInicio) {
      queryParams.append(
        'dataInicio',
        formatDataToAPI(filtros.value.dataInicio)
      )
    }

    if (filtros.value.dataFim) {
      queryParams.append(
        'dataFim',
        formatDataToAPI(filtros.value.dataFim)
      )
    }

    const [resDashboard, resLojistas] = await Promise.all([
      api.get(
        `/dashboard/representante?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      ),
      api.get('/lojistas', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
    ])

    todosOsLojistas.value = resLojistas.data || []

    const rawData =
      resDashboard.data.pedidos ||
      resDashboard.data.data ||
      []

    totalPedidos.value =
      resDashboard.data.total_pedidos ||
      rawData.length

    if (resDashboard.data.graficos) {
      dadosGraficos.value = {
        area: resDashboard.data.graficos.area || [],
        pizza: resDashboard.data.graficos.pizza || [],
        barras: resDashboard.data.graficos.barras || []
      }
    } else {
      dadosGraficos.value = {
        area: [],
        pizza: [],
        barras: []
      }
    }

    meusPedidos.value = rawData.map(p => {
      const infoStatus = mapearStatusDinamico(p.status)

      const lojistaOficial = todosOsLojistas.value.find(
        l => String(l.id) === String(p.id_lojista)
      )

      return {
        ...p,
        nome_lojista:
          lojistaOficial?.nome ||
          p.nome_lojista ||
          p.lojista,
        nome_cliente:
          p.nome_cliente ||
          p.cliente,
        ordem_status: infoStatus.ordem,
        cor: infoStatus.cor,
        telefone_lojista:
          lojistaOficial?.telefone ||
          p.telefone_lojista ||
          null,
        email_lojista:
          lojistaOficial?.email ||
          p.email_lojista ||
          null
      }
    })
  } catch (err) {
    console.error('Erro na requisição dos dados:', err)
    loadError.value = 'Erro ao conectar com o servidor.'
  } finally {
    loading.value = false
  }
}

onMounted(carregarDados)

const pedidosOrdenados = computed(() =>
  [...meusPedidos.value].sort(
    (a, b) => (b.id || 0) - (a.id || 0)
  )
)

const recentOrders = computed(() =>
  pedidosOrdenados.value.slice(0, 3)
)

const valorTotalPeriodo = computed(() =>
  meusPedidos.value.reduce(
    (total, pedido) =>
      total + Number(pedido.valor || 0),
    0
  )
)

const ticketMedio = computed(() =>
  meusPedidos.value.length > 0
    ? valorTotalPeriodo.value / meusPedidos.value.length
    : 0
)

const totalClientesPeriodo = computed(() => {
  const clientes = new Set()

  meusPedidos.value.forEach(pedido => {
    const identificador =
      pedido.id_cliente ||
      pedido.cliente_id ||
      pedido.nome_cliente ||
      pedido.cliente

    if (identificador) {
      clientes.add(String(identificador))
    }
  })

  return clientes.size
})

// Agrupamento dos lojistas e seus projetos no período selecionado
const lojistasFiltrados = computed(() => {
  const mapaLoj = new Map()

  meusPedidos.value.forEach(p => {
    const idLoj = p.id_lojista

    if (!idLoj) return

    const lojKey = String(idLoj)

    if (!mapaLoj.has(lojKey)) {
      mapaLoj.set(lojKey, {
        id: lojKey,
        nome:
          p.nome_lojista ||
          'Lojista não informado',
        email:
          p.email_lojista ||
          'Não informado',
        telefone:
          p.telefone_lojista ||
          null,
        projetos: []
      })
    }

    mapaLoj.get(lojKey).projetos.push({
      id: p.id,
      nome: p.nome_projeto || p.projeto,
      nome_cliente:
        p.nome_cliente ||
        p.cliente ||
        'Não informado',
      id_cliente:
        p.id_cliente ||
        p.cliente_id,
      status: p.status,
      cor: p.cor || '#ff7b00',
      valor: p.valor
    })
  })

  return Array.from(mapaLoj.values())
})

const executiveMetrics = computed(() => [
  {
    label: 'Projetos',
    value: String(
      totalPedidos.value ||
      meusPedidos.value.length
    ),
    helper: 'na consulta atual',
    icon: 'inventory_2'
  },
  {
    label: 'Volume financeiro',
    value: formatMoney(valorTotalPeriodo.value),
    helper: 'valor total no período',
    icon: 'account_balance_wallet'
  },
  {
    label: 'Ticket médio',
    value: formatMoney(ticketMedio.value),
    helper: 'valor médio por projeto',
    icon: 'payments'
  },
  {
    label: 'Lojistas',
    value: String(lojistasFiltrados.value.length),
    helper: 'com projetos no período',
    icon: 'storefront'
  },
  {
    label: 'Clientes',
    value: String(totalClientesPeriodo.value),
    helper: 'atendidos no período',
    icon: 'groups'
  }
])

function getStatusPercent(value) {
  const total = meusPedidos.value.length

  if (!total) {
    return 0
  }

  return Math.round(
    (Number(value || 0) / total) * 100
  )
}

function abrirWhatsApp(telefone, nome) {
  if (!telefone) {
    $q.notify({
      type: 'warning',
      message: `O WhatsApp de "${nome}" não está cadastrado.`,
      icon: 'warning',
      position: 'top-right',
      timeout: 3000
    })

    return
  }

  const numLimpo = String(telefone).replace(/\D/g, '')
  const texto = encodeURIComponent(
    `Olá ${nome}, tudo bem?`
  )

  window.open(
    `https://wa.me/55${numLimpo}?text=${texto}`,
    '_blank'
  )
}

function abrirEmail(email, nome) {
  if (
    !email ||
    email === 'Contato via sistema' ||
    email === 'Não informado'
  ) {
    $q.notify({
      type: 'warning',
      message: `O e-mail de "${nome}" não está cadastrado.`,
      icon: 'warning',
      position: 'top-right',
      timeout: 3000
    })

    return
  }

  window.location.href =
    `mailto:${email}?subject=Contato`
}

function formatarTelefone(tel) {
  if (!tel) {
    return 'Não cadastrado'
  }

  const num = String(tel).replace(/\D/g, '')

  if (num.length === 11) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`
  }

  if (num.length === 10) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`
  }

  return tel
}

// ==========================================
// CONFIGURAÇÃO DOS GRÁFICOS (APEXCHARTS)
// ==========================================
const defaultThemeConfig = computed(() => ({
  mode: isDark.value ? 'dark' : 'light',
  palette: 'palette1'
}))

const chartAreaSeries = computed(() => [
  {
    name: 'Valor em Vendas (R$)',
    data: (dadosGraficos.value.area || []).map(
      item => Number(item.valor_total || 0)
    )
  }
])

const chartAreaOptions = computed(() => ({
  theme: defaultThemeConfig.value,
  chart: {
    type: 'area',
    background: 'transparent',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    fontFamily: 'inherit',
    dropShadow: {
      enabled: true,
      top: 5,
      left: 0,
      blur: 8,
      color: '#ff7b00',
      opacity: 0.18
    }
  },
  colors: ['#ff7b00'],
  stroke: {
    curve: 'smooth',
    width: 3
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.38,
      opacityTo: 0.03,
      stops: [0, 92, 100]
    }
  },
  xaxis: {
    categories: (dadosGraficos.value.area || []).map(
      item => item.periodo
    ),
    labels: {
      hideOverlappingLabels: false,
      rotate: -45,
      style: {
        fontSize: '11px'
      }
    }
  },
  yaxis: {
    decimalsInFloat: 2,
    labels: {
      formatter: val => formatChartNumber(val)
    }
  },
  grid: {
    borderColor:
      isDark.value
        ? 'rgba(255,255,255,.08)'
        : 'rgba(21,30,51,.08)',
    strokeDashArray: 4
  },
  dataLabels: {
    enabled: false
  },
  tooltip: {
    y: {
      formatter: val => formatMoney(val)
    }
  }
}))

const chartPieSeries = computed(() =>
  (dadosGraficos.value.pizza || []).map(
    item => Number(item.quantidade || 0)
  )
)

const chartPieOptions = computed(() => ({
  theme: defaultThemeConfig.value,
  chart: {
    background: 'transparent',
    fontFamily: 'inherit'
  },
  labels: (dadosGraficos.value.pizza || []).map(
    item => item.status
  ),
  colors: (dadosGraficos.value.pizza || []).map(
    item => item.cor
  ),
  stroke: {
    width: 0
  },
  dataLabels: {
    enabled: false
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '12px',
            fontWeight: '600',
            color:
              isDark.value
                ? '#9CA3AF'
                : '#6B7280',
            offsetY: -5,
            formatter: function (val) {
              if (val && val.length > 14) {
                const palavras = val.split(' ')
                const meio = Math.ceil(
                  palavras.length / 2
                )

                return [
                  palavras
                    .slice(0, meio)
                    .join(' '),
                  palavras
                    .slice(meio)
                    .join(' ')
                ]
              }

              return val
            }
          },
          value: {
            show: true,
            fontSize: '16px',
            fontWeight: 'bold',
            color:
              isDark.value
                ? '#FFFFFF'
                : '#111827',
            offsetY: 5,
            formatter: val => `${val}`
          },
          total: {
            show: true,
            label: 'Total Projetos',
            fontSize: '12px',
            color:
              isDark.value
                ? '#9CA3AF'
                : '#6B7280',
            formatter: w =>
              w.globals.seriesTotals.reduce(
                (a, b) => a + b,
                0
              )
          }
        }
      }
    }
  },
  legend: {
    position: 'bottom',
    formatter: function (seriesName, opts) {
      const val =
        opts.w.globals.series[opts.seriesIndex]

      const total =
        opts.w.globals.series.reduce(
          (a, b) => a + b,
          0
        )

      const percent =
        total > 0
          ? ((val / total) * 100)
              .toFixed(1)
              .replace('.0', '')
          : 0

      return `${seriesName} (${percent}%)`
    }
  }
}))

// Ranking de lojistas
const chartBarSeries = computed(() => [
  {
    name: 'Total Vendido',
    data: (dadosGraficos.value.barras || []).map(
      item => Number(item.valor_total || 0)
    )
  }
])

const chartBarOptions = computed(() => ({
  theme: defaultThemeConfig.value,
  chart: {
    background: 'transparent',
    toolbar: {
      show: false
    },
    fontFamily: 'inherit'
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 7,
      columnWidth: '42%'
    }
  },
  colors: ['#ff7b00'],
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.18,
      gradientToColors: ['#ffb04d'],
      inverseColors: false,
      opacityFrom: 0.98,
      opacityTo: 0.82,
      stops: [0, 100]
    }
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    categories: (dadosGraficos.value.barras || []).map(
      item =>
        item.nome_lojista ||
        item.nome_cliente ||
        item.nome ||
        'Loja'
    ),
    labels: {
      rotate: -45,
      style: {
        fontSize: '11px'
      }
    }
  },
  yaxis: {
    decimalsInFloat: 2,
    labels: {
      formatter: val => formatChartNumber(val)
    }
  },
  grid: {
    borderColor:
      isDark.value
        ? 'rgba(255,255,255,.08)'
        : 'rgba(21,30,51,.08)',
    strokeDashArray: 4
  },
  tooltip: {
    y: {
      formatter: val => formatMoney(val)
    }
  }
}))

const statCards = computed(() => {
  const map = {}

  meusPedidos.value.forEach(p => {
    const key = p.status || 'Pendente'

    if (!map[key]) {
      const statusBanco =
        todosOsStatusDoBanco.value.find(
          s =>
            String(s.descricao)
              .trim()
              .toLowerCase() ===
            String(key)
              .trim()
              .toLowerCase()
        )

      map[key] = {
        label: key,
        color: p.cor || '#888888',
        value: 0,
        totalValor: 0,
        icon: getStatusIcon(key),
        ordem:
          statusBanco
            ? Number(statusBanco.ordem)
            : 999
      }
    }

    map[key].value++
    map[key].totalValor += Number(
      p.valor || 0
    )
  })

  if (Object.keys(map).length === 0) {
    return [
      {
        label: 'Projetos',
        color: '#888888',
        value: 0,
        totalValor: 0,
        icon: 'inventory_2',
        ordem: 0
      }
    ]
  }

  return Object.values(map).sort(
    (a, b) => a.ordem - b.ordem
  )
})

function getStatusIcon(status) {
  const s = String(status || '').toLowerCase()

  if (s.includes('pendente')) {
    return 'hourglass_empty'
  }

  if (s.includes('aprovado')) {
    return 'thumb_up'
  }

  if (
    s.includes('recusado') ||
    s.includes('nope')
  ) {
    return 'cancel'
  }

  if (
    s.includes('andamento') ||
    s.includes('produção')
  ) {
    return 'engineering'
  }

  if (
    s.includes('concluído') ||
    s.includes('entregue') ||
    s.includes('finalizado')
  ) {
    return 'check_circle'
  }

  return 'inventory_2'
}

function formatMoney(valor) {
  if (valor == null) {
    return 'R$ 0,00'
  }

  return Number(valor).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  )
}

function formatChartNumber(valor) {
  const numero = Number(valor || 0)

  return numero.toLocaleString(
    'pt-BR',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  )
}

function formatDate(d) {
  if (!d) {
    return ''
  }

  const dt = new Date(d)

  if (isNaN(dt)) {
    return d
  }

  return dt.toLocaleDateString(
    'pt-BR',
    {
      timeZone: 'UTC'
    }
  )
}

function toggleTimeline(pedidoId) {
  pedidoTimelineAberto.value =
    pedidoTimelineAberto.value === pedidoId
      ? null
      : pedidoId
}

function getCircleBg(
  stepOrdem,
  order,
  darkMode
) {
  if (order.ordem_status === 0) {
    return darkMode
      ? '#22272e'
      : '#f3f4f6'
  }

  if (stepOrdem < order.ordem_status) {
    return '#21BA45'
  }

  if (stepOrdem === order.ordem_status) {
    return order.cor || 'var(--brand)'
  }

  return darkMode
    ? '#22272e'
    : '#f3f4f6'
}

function getTimelineIcon(
  stepOrdem,
  currentOrdem
) {
  if (currentOrdem === 0) {
    return 'radio_button_unchecked'
  }

  if (stepOrdem < currentOrdem) {
    return 'check'
  }

  if (stepOrdem === currentOrdem) {
    return 'hourglass_empty'
  }

  return 'radio_button_unchecked'
}

function getTrackStyle(
  stepOrdem,
  order
) {
  const current = order.ordem_status

  if (stepOrdem < current) {
    return {
      background: '#21BA45'
    }
  }

  return {
    background:
      isDark.value
        ? '#262a33'
        : '#e0e0e0'
  }
}

function isTrackPulsing(
  stepOrdem,
  currentOrdem
) {
  return stepOrdem === currentOrdem
}
</script>

<style scoped>
.representative-dashboard {
  padding: 30px 28px 52px;
  color: var(--text-base);
}

.panel {
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* HERO */
.dashboard-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  margin-bottom: 24px;
}

.hero-eyebrow,
.section-kicker {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--brand);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.65px;
  text-transform: uppercase;
}

.eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 0 5px var(--brand-soft);
}

.hero-title {
  margin: 8px 0 5px;
  color: var(--text-strong);
  font-size: clamp(27px, 3vw, 38px);
  font-weight: 700;
  letter-spacing: -1.2px;
  line-height: 1.05;
}

.hero-title span {
  color: var(--brand);
}

.hero-subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 13.5px;
  font-weight: 500;
}

.hero-summary {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  min-width: 390px;
  padding: 17px 20px;
  background: var(--surf-1);
  color: var(--text-strong);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition:
    background-color .25s ease,
    border-color .25s ease,
    box-shadow .25s ease;
}

.hero-summary::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--brand-gradient);
}

.hero-summary::after {
  content: '';
  position: absolute;
  top: -46px;
  right: -36px;
  width: 118px;
  height: 118px;
  border-radius: 50%;
  background: var(--blob-brand);
  pointer-events: none;
}

.hero-summary__item {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-summary__label {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .8px;
}

.hero-summary__item strong {
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-summary__divider {
  position: relative;
  z-index: 1;
  width: 1px;
  height: 34px;
  margin: 0 20px;
  background: var(--border-soft);
}

/* HEADINGS */
.panel-heading,
.section-heading-row,
.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-title {
  margin: 3px 0 0;
  color: var(--text-strong);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -.25px;
}

.section-caption {
  color: var(--text-muted);
  font-size: 11.5px;
  font-weight: 500;
}

.dashboard-section {
  margin-top: 26px;
}

.dashboard-section--summary {
  margin-top: 24px;
}

.dashboard-section--separated {
  margin-top: 30px;
  padding-top: 27px;
  border-top: 1px solid var(--border-soft);
}

.section-heading-row {
  margin-bottom: 14px;
}

/* FILTERS */
.filter-panel {
  display: grid;
  grid-template-columns: 205px minmax(0, 1fr);
  align-items: end;
  gap: 18px;
  padding: 15px 17px;
  overflow: hidden;
}

.filter-intro {
  min-width: 0;
}

.filter-intro .section-title {
  margin-top: 2px;
  font-size: 15px;
}

.filter-note {
  margin: 4px 0 0;
  color: var(--text-faint);
  font-size: 10px;
  font-weight: 500;
  line-height: 1.35;
}

.filter-grid {
  width: 100%;
  max-width: 880px;
  min-width: 0;
  justify-self: end;
  display: grid;
  grid-template-columns:
    minmax(0, 1.08fr)
    minmax(0, .92fr)
    minmax(0, .92fr)
    minmax(132px, .76fr);
  gap: 9px;
  align-items: end;
}

.field-group,
.dashboard-field {
  min-width: 0;
  width: 100%;
}

.field-label {
  display: block;
  margin: 0 0 4px 2px;
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .7px;
}

.field-icon {
  color: var(--brand);
}

:deep(.dashboard-field .q-field__control) {
  min-height: 38px;
  height: 38px;
  background: var(--surf-2);
  border-radius: 10px !important;
}

:deep(.dashboard-field .q-field__marginal) {
  height: 38px;
}

:deep(.dashboard-field .q-field__native),
:deep(.dashboard-field .q-field__input) {
  min-height: 38px;
  padding-top: 0;
  padding-bottom: 0;
  color: var(--text-strong);
  font-size: 11.5px;
  font-weight: 650;
}

:deep(.dashboard-field.q-field--outlined .q-field__control:before) {
  border-color: var(--border-soft);
}

:deep(.dashboard-field.q-field--focused .q-field__control:before) {
  border-color: var(--brand) !important;
}

.refresh-btn {
  width: 100%;
  min-width: 0;
  height: 38px;
  min-height: 38px;
  color: white;
  background: var(--brand-gradient) !important;
  border-radius: 10px !important;
  box-shadow: var(--shadow-brand);
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: .1px;
}

.refresh-btn:hover {
  transform: translateY(-1px);
}

.dashboard-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 13px;
  font-size: 12px;
  font-weight: 600;
}

.dashboard-alert--error {
  color: #d95050;
  border: 1px solid rgba(217, 80, 80, .2);
  background: rgba(217, 80, 80, .08);
}

/* EXECUTIVE METRICS */
.executive-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.metric-card {
  display: flex;
  gap: 13px;
  padding: 17px;
  min-width: 0;
}

.metric-card__icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .16);
  border-radius: 13px;
}

.metric-card__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.metric-card__label {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .55px;
  text-transform: uppercase;
}

.metric-card__value {
  margin-top: 2px;
  color: var(--text-strong);
  font-size: 18px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-card__helper {
  margin-top: 3px;
  color: var(--text-faint);
  font-size: 10.5px;
  font-weight: 600;
}

/* STATUS */
.status-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(205px, 1fr)
  );
  gap: 14px;
}

.status-card {
  position: relative;
  overflow: hidden;
  padding: 17px;
  transition:
    transform .18s ease,
    box-shadow .18s ease;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.status-card__top,
.status-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.status-card__icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  padding: 4px 8px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .15px;
  line-height: 1.2;
}

.status-card__value {
  display: block;
  margin: 14px 0 9px;
  color: var(--text-strong);
  font-size: 19px;
  line-height: 1.1;
}

.status-card__footer {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
}

.status-card__percent {
  color: var(--text-faint);
}

.status-card__accent {
  position: absolute;
  inset: auto 0 0 0;
  height: 3px;
  opacity: .85;
}

/* CHARTS */
.analytics-grid {
  display: grid;
  gap: 14px;
}

.analytics-grid--primary {
  grid-template-columns:
    minmax(0, 1.7fr)
    minmax(300px, .8fr);
}

.analytics-grid--ranking-single {
  grid-template-columns: 1fr;
  margin-top: 14px;
}

.chart-card {
  min-width: 0;
  padding: 19px 19px 10px;
  overflow: hidden;
}

.chart-title-wrap {
  display: flex;
  align-items: center;
  gap: 11px;
}

.chart-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: var(--navy-2);
  background: var(--navy-soft);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
}

.chart-icon--brand {
  color: var(--brand);
  background: var(--brand-soft);
  border-color: rgba(255, 123, 0, .16);
}

.chart-title-wrap h3 {
  margin: 0;
  color: var(--text-strong);
  font-size: 14px;
  font-weight: 800;
}

.chart-title-wrap p {
  margin: 2px 0 0;
  color: var(--text-muted);
  font-size: 10.5px;
  font-weight: 500;
}

/* OPERATIONS */
.operations-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 16px;
  margin-top: 30px;
  align-items: start;
}

.operations-grid--separated {
  padding-top: 28px;
  border-top: 1px solid var(--border-soft);
}

.recent-panel {
  padding: 20px;
}

.recent-heading {
  margin-bottom: 16px;
}

.text-btn {
  color: var(--brand) !important;
  font-size: 11.5px;
  font-weight: 800;
}

.orders-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  overflow: hidden;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 15px;
}

.order-card__main {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 17px;
}

.order-identity {
  min-width: 0;
}

.order-id-row {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 8px;
}

.order-id {
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .14);
  border-radius: 7px;
  padding: 3px 7px;
  font-size: 10px;
  font-weight: 800;
}

.order-date {
  color: var(--text-faint);
  font-size: 10.5px;
  font-weight: 600;
}

.order-store {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-strong);
  font-size: 14px;
}

.order-store .q-icon {
  color: var(--brand);
}

.order-store span {
  color: var(--text-faint);
  font-size: 10px;
  font-weight: 700;
}

.order-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 7px;
  color: var(--text-muted);
  font-size: 10.5px;
  font-weight: 600;
}

.order-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.order-side-data {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  text-align: right;
}

.order-money {
  color: var(--text-strong);
  font-size: 16px;
  font-weight: 900;
}

.order-status {
  max-width: 180px;
}

.forecast-text {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 600;
}

.forecast-text--danger {
  color: #d95050;
}

.order-progress {
  padding: 13px 17px 15px;
  border-top: 1px solid var(--border-soft);
  background: var(--surf-1);
}

.order-progress__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 10px;
}

.order-progress__head > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-progress__head strong {
  color: var(--text-strong);
  font-size: 11px;
}

.order-progress__head span:not(.progress-number) {
  color: var(--text-muted);
  font-size: 9.5px;
}

.progress-number {
  font-size: 11px;
  font-weight: 900;
}

.timeline-action-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 3px;
}

.timeline-shell {
  position: relative;
  width: 100%;
  max-width: 100%;
  margin-top: 8px;
  padding: 14px 10px;
  overflow: hidden;
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
}

.timeline-hz-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.timeline-hz-item {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.step-connect-line {
  position: absolute;
  top: 10px;
  left: 50%;
  width: 100%;
  height: 3px;
  z-index: 1;
}

.step-circle {
  position: relative;
  z-index: 2;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  transition: .25s ease;
}

.step-circle--active {
  animation: pulse 2s infinite;
}

.step-title {
  max-width: 90px;
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 9.5px;
  font-weight: 600;
  line-height: 1.2;
  white-space: normal;
  word-break: normal;
  overflow-wrap: normal;
}

.step-title--active {
  color: var(--brand);
  font-weight: 800;
}

.step-current-tag {
  margin-top: 4px;
  padding: 2px 5px;
  color: white;
  background: var(--brand);
  border-radius: 4px;
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
}

.line-pulsing {
  background-image: linear-gradient(
    90deg,
    rgba(255, 123, 0, 0),
    rgba(255, 123, 0, 1),
    rgba(255, 123, 0, 0)
  ) !important;
  background-size: 60px 100% !important;
  background-repeat: no-repeat !important;
  animation:
    light-sweep
    2.2s
    infinite
    ease-in-out
    !important;
}

@keyframes light-sweep {
  0% {
    background-position: -60px 0;
    opacity: .3;
  }

  50% {
    opacity: 1;
  }

  100% {
    background-position: calc(100% + 60px) 0;
    opacity: .3;
  }
}

@keyframes pulse {
  0% {
    box-shadow:
      0 0 0 0
      rgba(255, 123, 0, .32);
  }

  70% {
    box-shadow:
      0 0 0 6px
      rgba(255, 123, 0, 0);
  }

  100% {
    box-shadow:
      0 0 0 0
      rgba(255, 123, 0, 0);
  }
}

/* NETWORK */
.network-column {
  position: sticky;
  top: 82px;
}

.network-card {
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.network-card::after {
  content: '';
  position: absolute;
  top: -95px;
  right: -95px;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background: var(--blob-brand);
  pointer-events: none;
}

.network-card__visual {
  position: relative;
  width: 82px;
  height: 82px;
  display: grid;
  place-items: center;
  margin-bottom: 18px;
}

.network-main-icon {
  position: relative;
  z-index: 3;
  width: 50px;
  height: 50px;
  display: grid;
  place-items: center;
  color: white;
  background: var(--brand-gradient);
  border-radius: 15px;
  box-shadow: var(--shadow-brand);
}

.network-orbit {
  position: absolute;
  border: 1px solid rgba(255, 123, 0, .2);
  border-radius: 50%;
}

.network-orbit--one {
  inset: 7px;
}

.network-orbit--two {
  inset: 0;
  opacity: .55;
}

.network-title {
  margin: 5px 0 7px;
  color: var(--text-strong);
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -.3px;
}

.network-copy {
  margin: 0;
  color: var(--text-muted);
  font-size: 11.5px;
  line-height: 1.55;
}

.network-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 18px 0;
}

.network-stats > div {
  padding: 12px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
}

.network-stats strong {
  display: block;
  color: var(--text-strong);
  font-size: 17px;
}

.network-stats span {
  color: var(--text-muted);
  font-size: 9.5px;
  font-weight: 700;
}

.network-actions {
  display: grid;
  gap: 8px;
}

.network-btn {
  min-height: 42px;
  font-size: 11.5px;
  font-weight: 800;
  transition:
    background-color .2s ease,
    border-color .2s ease,
    transform .2s ease,
    box-shadow .2s ease;
}

.network-btn--primary {
  color: var(--text-strong) !important;
  background: var(--surf-2) !important;
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-xs);
}

.network-btn--primary :deep(.q-icon) {
  color: var(--brand);
}

.network-btn--primary:hover {
  background: var(--brand-soft) !important;
  border-color: rgba(255, 123, 0, .28);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

/* STATES */
.empty-state,
.loading-state {
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 5px;
  color: var(--text-muted);
  background: var(--surf-2);
  border: 1px dashed var(--border-strong);
  border-radius: 14px;
}

.empty-state strong {
  color: var(--text-strong);
  font-size: 12px;
}

.empty-state span,
.loading-state span {
  font-size: 10.5px;
}

.empty-icon {
  width: 45px;
  height: 45px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 14px;
  margin-bottom: 3px;
}

.compact-empty {
  min-height: 180px;
}

/* DIALOG */
.network-dialog {
  width: 680px;
  max-width: 94vw;
  max-height: 86vh;
  background: var(--surf-1) !important;
  color: var(--text-base);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 20px 22px;
}

.dialog-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 12px;
}

.dialog-title-wrap h3 {
  margin: 0;
  color: var(--text-strong);
  font-size: 15px;
  font-weight: 900;
}

.dialog-title-wrap p {
  margin: 2px 0 0;
  color: var(--text-muted);
  font-size: 10.5px;
}

.dialog-body {
  max-height: 68vh;
  overflow-y: auto;
  padding: 16px;
}

.network-list {
  display: grid;
  gap: 8px;
}

.network-expansion {
  overflow: hidden;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 13px;
}

.list-avatar {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 10px;
}

.list-title {
  color: var(--text-strong);
  font-size: 12px;
  font-weight: 800;
}

.id-chip {
  color: var(--text-faint);
  font-size: 9.5px;
  font-weight: 800;
}

.expansion-inner {
  padding: 8px;
  background: var(--surf-1);
  border-top: 1px solid var(--border-soft);
}

.contact-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 7px;
  padding: 9px 10px;
  color: var(--text-muted);
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
}

.contact-info {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  min-width: 0;
  font-size: 9.5px;
  font-weight: 600;
}

.contact-info span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  overflow-wrap: anywhere;
}

.contact-actions {
  display: flex;
  flex-shrink: 0;
  color: var(--brand);
}

.projects-mini-list {
  display: grid;
  gap: 6px;
}

.project-mini-row {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 10px 11px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
}

.project-mini-main,
.project-mini-side {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.project-mini-main strong,
.project-mini-side strong {
  color: var(--text-strong);
  font-size: 11px;
}

.project-mini-main span {
  color: var(--text-muted);
  font-size: 9.5px;
}

.project-mini-side {
  align-items: flex-end;
  text-align: right;
  flex-shrink: 0;
}

.mini-status {
  padding: 2px 6px;
  font-size: 8px;
}

/* APEX */
:deep(.apexcharts-text),
:deep(.apexcharts-legend-text) {
  font-family:
    'DM Sans',
    sans-serif !important;
}

:deep(.apexcharts-gridline) {
  stroke: var(--border-soft);
}

/* RESPONSIVE */
@media (max-width: 1360px) {
  .filter-panel {
    grid-template-columns: 1fr;
    gap: 11px;
    align-items: stretch;
  }

  .filter-intro {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 14px;
  }

  .filter-note {
    margin: 0 0 1px;
    max-width: 320px;
    text-align: right;
  }

  .filter-grid {
    max-width: none;
    min-width: 0;
    justify-self: stretch;
    grid-template-columns:
      minmax(0, 1.05fr)
      minmax(0, .9fr)
      minmax(0, .9fr)
      minmax(132px, .72fr);
  }
}

@media (max-width: 1180px) {
  .executive-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .analytics-grid--primary {
    grid-template-columns: 1fr;
  }

  .operations-grid {
    grid-template-columns: 1fr;
  }

  .network-column {
    position: static;
  }

  .network-card {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 18px;
    align-items: start;
  }

  .network-card__visual {
    grid-row: 1 / span 4;
  }

  .network-stats,
  .network-actions {
    grid-column: 2;
  }
}

@media (max-width: 900px) {
  .dashboard-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-summary {
    min-width: 0;
    width: 100%;
  }

  .executive-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .filter-grid {
    max-width: none;
    justify-self: stretch;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .representative-dashboard {
    padding: 18px 10px 34px;
  }

  .dashboard-hero {
    margin-bottom: 18px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-summary {
    padding: 14px;
  }

  .hero-summary__divider {
    margin: 0 12px;
  }

  .hero-summary__item strong {
    font-size: 13px;
  }

  .filter-panel,
  .recent-panel,
  .network-card {
    padding: 14px;
  }

  .section-heading-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }

  .section-caption {
    display: none;
  }

  .filter-intro {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  .filter-intro .section-kicker {
    display: none;
  }

  .filter-intro .section-title {
    margin: 0;
    font-size: 14px;
  }

  .filter-note {
    margin: 0;
    text-align: right;
    max-width: 190px;
  }

  .filter-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .dashboard-section--separated {
    padding-top: 22px;
    margin-top: 24px;
  }

  .operations-grid--separated {
    padding-top: 22px;
    margin-top: 24px;
  }

  .executive-grid {
    grid-template-columns: 1fr 1fr;
    gap: 9px;
  }

  .metric-card {
    padding: 13px;
    gap: 9px;
  }

  .metric-card__icon {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }

  .metric-card__value {
    font-size: 15px;
  }

  .metric-card__helper {
    display: none;
  }

  .status-grid {
    grid-template-columns: 1fr 1fr;
    gap: 9px;
  }

  .status-card {
    padding: 13px;
  }

  .status-card__value {
    font-size: 15px;
  }

  .status-pill {
    font-size: 8.5px;
  }

  .chart-card {
    padding: 15px 10px 8px;
  }

  .order-card__main {
    flex-direction: column;
    gap: 12px;
    padding: 14px;
  }

  .order-side-data {
    align-items: flex-start;
    text-align: left;
  }

  .order-progress {
    padding: 12px 14px 14px;
  }

  .timeline-shell {
    padding: 12px 6px;
  }

  .step-title {
    max-width: 62px;
    font-size: 8px;
    line-height: 1.15;
  }

  .step-current-tag {
    margin-top: 3px;
    padding: 2px 4px;
    font-size: 7px;
  }

  .network-card {
    display: block;
  }

  .network-card__visual {
    margin-bottom: 15px;
  }

  .network-stats,
  .network-actions {
    grid-column: auto;
  }

  .dialog-head {
    padding: 16px;
  }

  .dialog-body {
    padding: 10px;
  }

  .contact-strip {
    align-items: flex-start;
    flex-direction: column;
  }

  .project-mini-row {
    flex-direction: column;
  }

  .project-mini-side {
    align-items: flex-start;
    text-align: left;
  }
}

@media (max-width: 420px) {
  .executive-grid,
  .status-grid {
    grid-template-columns: 1fr;
  }

  .filter-intro {
    display: block;
  }

  .filter-note {
    margin-top: 3px;
    text-align: left;
    max-width: none;
  }

  .hero-summary {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .hero-summary__divider {
    width: 100%;
    height: 1px;
    margin: 0;
  }

  .timeline-shell {
    padding: 10px 4px;
  }

  .step-circle {
    width: 20px;
    height: 20px;
  }

  .step-connect-line {
    top: 9px;
  }

  .step-title {
    max-width: 52px;
    font-size: 7.4px;
  }
}
</style>
