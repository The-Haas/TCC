<template>
  <q-page class="client-dashboard">
    <!-- Cabeçalho -->
    <section class="dashboard-hero">
      <div class="hero-copy">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          Área do cliente
        </div>

        <h1 class="hero-title font-display">
          {{ greeting }}, <span>{{ firstName }}</span>.
        </h1>

        <p class="hero-subtitle">
          {{ dateStr }} · Acompanhe o andamento dos seus projetos em um só lugar.
        </p>
      </div>

      <div class="hero-summary">
        <div class="hero-summary__item">
          <span class="hero-summary__label">Meus projetos</span>
          <strong>{{ totalPedidos }}</strong>
        </div>

        <div class="hero-summary__divider"></div>

        <div class="hero-summary__item">
          <span class="hero-summary__label">Em andamento</span>
          <strong>{{ projetosAtivos }}</strong>
        </div>
      </div>
    </section>

    <div v-if="loadError" class="dashboard-alert dashboard-alert--error">
      <q-icon name="error_outline" size="20px" />
      <span>{{ loadError }}</span>
      <q-space />
      <q-btn flat dense no-caps label="Tentar novamente" @click="carregarDados" />
    </div>

    <!-- Pipeline -->
    <section class="dashboard-section dashboard-section--separated">
      <div class="section-heading-row">
        <div>
          <div class="section-kicker">Acompanhamento</div>
          <h2 class="section-title">Situação dos projetos</h2>
        </div>

        <span class="section-caption">
          Quantidade de projetos em cada etapa
        </span>
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
              :style="{
                color: card.color,
                background: card.color + '14'
              }"
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
            {{ card.value }}
            {{ card.value === 1 ? 'projeto' : 'projetos' }}
          </strong>

          <div class="status-card__footer">
            <span>na sua carteira</span>
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

    <!-- Indicadores -->
    <section class="dashboard-section dashboard-section--summary dashboard-section--separated">
      <div class="section-heading-row">
        <div>
          <div class="section-kicker">Resumo</div>
          <h2 class="section-title">Visão geral</h2>
        </div>

        <span class="section-caption">
          Informações rápidas sobre seus projetos
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

    <!-- Operação -->
    <section class="operations-grid operations-grid--separated">
      <article class="panel recent-panel">
        <div class="panel-heading recent-heading">
          <div>
            <div class="section-kicker">Projetos</div>
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
          <span>Seus projetos aparecerão aqui quando forem cadastrados.</span>
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
                  <span class="order-date">{{ formatDate(order.data_pedido) }}</span>
                </div>

                <div class="client-order-project">
                  <q-icon name="draw" size="17px" />
                  <strong>{{ order.nome_projeto || 'Projeto sem nome' }}</strong>
                </div>

                <div class="project-store-meta">
                  <q-icon name="storefront" size="14px" />
                  <span>
                    {{ order.nome_lojista || 'Loja não informada' }}
                    <template v-if="order.id_lojista"> · #{{ order.id_lojista }}</template>
                  </span>
                </div>
              </div>

              <div class="order-side-data">
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
                  class="client-forecast"
                  :class="{ 'client-forecast--danger': Number(order.ordem_status) === 0 }"
                >
                  <q-icon name="event_available" size="14px" />

                  {{
                    Number(order.ordem_status) === 0
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
                      Number(order.ordem_status) === 0
                        ? 'Fluxo interrompido'
                        : 'Progresso do projeto'
                    }}
                  </strong>

                  <span>
                    {{
                      Number(order.ordem_status) === 0
                        ? 'Entre em contato com a loja responsável para mais informações.'
                        : 'Acompanhe a etapa atual do seu projeto.'
                    }}
                  </span>
                </div>

                <span
                  class="progress-number"
                  :style="{
                    color: Number(order.ordem_status) === 0
                      ? order.cor
                      : 'var(--brand)'
                  }"
                >
                  {{
                    Number(order.ordem_status) === 0
                      ? '0%'
                      : `${getProgressPercent(order)}%`
                  }}
                </span>
              </div>

              <q-linear-progress
                rounded
                size="7px"
                :value="getProgressValue(order)"
                :color="
                  Number(order.ordem_status) === 0
                    ? 'negative'
                    : (
                        Number(order.ordem_status) === totalEtapas
                          ? 'positive'
                          : 'orange'
                      )
                "
                :track-color="isDark ? 'grey-9' : 'grey-3'"
              />

              <template v-if="Number(order.ordem_status) !== 0">
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
                        : 'Acompanhar etapas'
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
                              Number(step.ordem) === Number(order.ordem_status)
                          }"
                          :style="{
                            background: getCircleBg(step.ordem, order, isDark),
                            color:
                              Number(step.ordem) <= Number(order.ordem_status)
                                ? '#ffffff'
                                : (isDark ? '#747d8c' : '#a4b0be'),
                            boxShadow:
                              Number(step.ordem) === Number(order.ordem_status)
                                ? `0 0 0 4px ${order.cor}30`
                                : 'none'
                          }"
                        >
                          <q-icon
                            :name="getTimelineIcon(step.ordem, order.ordem_status)"
                            size="12px"
                          />
                        </div>

                        <span
                          class="step-title"
                          :class="{
                            'step-title--active':
                              Number(step.ordem) === Number(order.ordem_status)
                          }"
                        >
                          {{ step.descricao }}
                        </span>

                        <span
                          v-if="Number(step.ordem) === Number(order.ordem_status)"
                          class="step-current-tag"
                          :style="{ background: order.cor || 'var(--brand)' }"
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

      <!-- Suporte -->
      <aside class="network-column">
        <article class="panel network-card">
          <div class="network-card__visual">
            <div class="network-orbit network-orbit--one"></div>
            <div class="network-orbit network-orbit--two"></div>

            <div class="network-main-icon">
              <q-icon name="support_agent" size="27px" />
            </div>
          </div>

          <div class="section-kicker">Suporte</div>
          <h2 class="network-title">Precisa de ajuda?</h2>

          <p class="network-copy">
            Ficou com alguma dúvida sobre o andamento do seu projeto?
            Fale diretamente com a loja responsável.
          </p>

          <div class="network-stats">
            <div>
              <strong>{{ lojistasFiltrados.length }}</strong>
              <span>
                {{ lojistasFiltrados.length === 1 ? 'Loja responsável' : 'Lojas responsáveis' }}
              </span>
            </div>

            <div>
              <strong>{{ totalPedidos }}</strong>
              <span>Projetos cadastrados</span>
            </div>
          </div>

          <div class="network-actions">
            <q-btn
              unelevated
              no-caps
              icon="chat"
              label="Falar com a loja"
              class="network-btn network-btn--primary"
              @click="abrirModalLojistas"
            />
          </div>
        </article>

        <article class="panel deadline-card">
          <div class="deadline-card__head">
            <div class="deadline-card__icon">
              <q-icon name="event_note" size="19px" />
            </div>

            <div>
              <strong>Sobre os prazos</strong>
              <span>Previsões de entrega</span>
            </div>
          </div>

          <p>
            As datas informadas são previsões e podem sofrer ajustes conforme
            a complexidade do projeto e o andamento das etapas de produção.
          </p>
        </article>
      </aside>
    </section>

    <!-- Modal de lojistas -->
    <q-dialog v-model="modalLojistas">
      <q-card class="network-dialog">
        <q-card-section class="dialog-head">
          <div class="dialog-title-wrap">
            <div class="dialog-icon">
              <q-icon name="storefront" size="21px" />
            </div>

            <div>
              <h3>Lojas responsáveis</h3>
              <p>
                Entre em contato com a loja vinculada ao seu projeto
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

            <strong>Nenhuma loja encontrada</strong>
            <span>Não há lojas vinculadas aos seus projetos neste momento.</span>
          </div>

          <q-list v-else class="network-list">
            <q-expansion-item
              v-for="lojista in lojistasFiltrados"
              :key="lojista.chave"
              group="lojistas-cliente"
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
                  <span v-if="lojista.id" class="id-chip">#{{ lojista.id }}</span>
                </q-item-section>
              </template>

              <div class="expansion-inner">
                <div class="contact-strip">
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
                      @click.stop="abrirWhatsApp(lojista.telefone, lojista.nome)"
                    >
                      <q-tooltip>WhatsApp</q-tooltip>
                    </q-btn>

                    <q-btn
                      v-if="lojista.email"
                      flat
                      round
                      dense
                      icon="mail"
                      @click.stop="abrirEmail(lojista.email, lojista.nome)"
                    >
                      <q-tooltip>E-mail</q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <div class="client-dialog-projects">
                  <div
                    v-for="projeto in lojista.projetos"
                    :key="projeto.id"
                    class="client-project-mini-row"
                  >
                    <div class="client-project-mini-main">
                      <strong>{{ projeto.nome || 'Projeto sem nome' }}</strong>
                      <span>
                        Projeto #{{ projeto.id }} · {{ formatDate(projeto.data) }}
                      </span>
                    </div>

                    <div class="client-project-mini-side">
                      <span
                        class="status-pill mini-status"
                        :style="{
                          color: projeto.cor,
                          borderColor: projeto.cor + '35',
                          background: projeto.cor + '10'
                        }"
                      >
                        {{ projeto.status || 'Pendente' }}
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

const $q = useQuasar()
const authStore = useAuthStore()

const isDark = computed(() => $q.dark.isActive)

const firstName = computed(() =>
  (authStore.userName || 'Cliente').split(' ')[0]
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
const totalEtapas = ref(0)
const listaEtapasDoBanco = ref([])
const todosOsStatusDoBanco = ref([])
const pedidoTimelineAberto = ref(null)
const modalLojistas = ref(false)

async function carregarDados() {
  loading.value = true
  loadError.value = ''

  try {
    const [resDashboard, resStatus] = await Promise.all([
      api.get('/dashboard/cliente', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }),
      api.get('/status', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
    ])

    meusPedidos.value = resDashboard.data.pedidos || []

    totalPedidos.value =
      Number(resDashboard.data.total_pedidos) ||
      meusPedidos.value.length

    todosOsStatusDoBanco.value = resStatus.data || []

    listaEtapasDoBanco.value = todosOsStatusDoBanco.value
      .filter(step => Number(step.ordem) > 0)
      .sort((a, b) => Number(a.ordem) - Number(b.ordem))

    totalEtapas.value =
      Number(resDashboard.data.total_etapas) ||
      listaEtapasDoBanco.value.length ||
      1
  } catch (err) {
    console.error('Erro na requisição da dashboard do cliente:', err)
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

const projetosAtivos = computed(() =>
  meusPedidos.value.filter(p => {
    const ordem = Number(p.ordem_status || 0)

    return ordem > 0 && ordem < totalEtapas.value
  }).length
)

const projetosConcluidos = computed(() =>
  meusPedidos.value.filter(
    p =>
      totalEtapas.value > 0 &&
      Number(p.ordem_status) === totalEtapas.value
  ).length
)

const projetosComPrevisao = computed(() =>
  meusPedidos.value.filter(
    p =>
      p.data_previsao_pedido &&
      Number(p.ordem_status || 0) !== 0
  ).length
)

const lojistasFiltrados = computed(() => {
  const mapa = new Map()

  meusPedidos.value.forEach(p => {
    const chave =
      p.id_lojista
        ? String(p.id_lojista)
        : (
            p.email_lojista ||
            p.nome_lojista ||
            null
          )

    if (!chave) return

    if (!mapa.has(chave)) {
      mapa.set(chave, {
        chave,
        id: p.id_lojista,
        nome:
          p.nome_lojista ||
          'Loja não informada',
        email:
          p.email_lojista ||
          '',
        telefone:
          p.telefone_lojista ||
          '',
        projetos: []
      })
    }

    mapa.get(chave).projetos.push({
      id: p.id,
      nome: p.nome_projeto,
      data: p.data_pedido,
      status: p.status,
      cor: p.cor || '#ff7b00'
    })
  })

  return Array.from(mapa.values())
})

const executiveMetrics = computed(() => [
  {
    label: 'Projetos',
    value: String(totalPedidos.value),
    helper: 'cadastrados na sua conta',
    icon: 'inventory_2'
  },
  {
    label: 'Concluídos',
    value: String(projetosConcluidos.value),
    helper: 'projetos finalizados',
    icon: 'task_alt'
  },
  {
    label: 'Com previsão',
    value: String(projetosComPrevisao.value),
    helper: 'possuem data prevista',
    icon: 'event_available'
  },
  {
    label: 'Lojas responsáveis',
    value: String(lojistasFiltrados.value.length),
    helper: 'vinculadas aos seus projetos',
    icon: 'storefront'
  }
])

const statCards = computed(() => {
  const map = {}

  meusPedidos.value.forEach(p => {
    const key = p.status || 'Pendente'

    if (!map[key]) {
      const statusBanco = todosOsStatusDoBanco.value.find(
        s =>
          String(s.descricao || '')
            .trim()
            .toLowerCase() ===
          String(key)
            .trim()
            .toLowerCase()
      )

      map[key] = {
        label: key,
        color:
          p.cor ||
          statusBanco?.cor ||
          '#888888',
        value: 0,
        icon: getStatusIcon(key),
        ordem:
          statusBanco
            ? Number(statusBanco.ordem)
            : 999
      }
    }

    map[key].value++
  })

  if (Object.keys(map).length === 0) {
    return [
      {
        label: 'Projetos',
        color: '#888888',
        value: 0,
        icon: 'inventory_2',
        ordem: 0
      }
    ]
  }

  return Object.values(map).sort(
    (a, b) => a.ordem - b.ordem
  )
})

function getStatusPercent(value) {
  if (!meusPedidos.value.length) return 0

  return Math.round(
    (Number(value || 0) / meusPedidos.value.length) * 100
  )
}

function getStatusIcon(status) {
  const s = String(status || '').toLowerCase()

  if (s.includes('pendente')) return 'hourglass_empty'
  if (s.includes('aprovado')) return 'thumb_up'

  if (
    s.includes('recusado') ||
    s.includes('cancelado')
  ) {
    return 'cancel'
  }

  if (
    s.includes('produção') ||
    s.includes('andamento')
  ) {
    return 'engineering'
  }

  if (s.includes('qualidade')) {
    return 'inventory'
  }

  if (s.includes('preparando')) {
    return 'inventory_2'
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

function abrirModalLojistas() {
  modalLojistas.value = true
}

function abrirWhatsApp(telefone, nomeLojista) {
  if (!telefone) {
    $q.notify({
      type: 'warning',
      message: `O WhatsApp de "${nomeLojista}" não está cadastrado.`,
      position: 'top-right',
      timeout: 3000
    })

    return
  }

  const numLimpo = String(telefone).replace(/\D/g, '')

  const texto = encodeURIComponent(
    `Olá ${nomeLojista}, gostaria de tirar uma dúvida sobre o meu projeto.`
  )

  window.open(
    `https://wa.me/55${numLimpo}?text=${texto}`,
    '_blank'
  )
}

function abrirEmail(email, nomeLojista = 'lojista') {
  if (!email) {
    $q.notify({
      type: 'warning',
      message: `O e-mail de "${nomeLojista}" não está cadastrado.`,
      position: 'top-right',
      timeout: 3000
    })

    return
  }

  window.location.href =
    `mailto:${email}?subject=Dúvida sobre Projeto`
}

function formatarTelefone(tel) {
  if (!tel) return 'Não cadastrado'

  const num = String(tel).replace(/\D/g, '')

  if (num.length === 11) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`
  }

  if (num.length === 10) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`
  }

  return tel
}

function formatDate(d) {
  if (!d) return ''

  const dt = new Date(d)

  if (isNaN(dt)) return d

  return dt.toLocaleDateString(
    'pt-BR',
    {
      timeZone: 'UTC'
    }
  )
}

function getProgressValue(order) {
  const ordem = Number(order.ordem_status || 0)

  if (
    ordem <= 0 ||
    totalEtapas.value <= 0
  ) {
    return 0
  }

  return Math.min(
    ordem / totalEtapas.value,
    1
  )
}

function getProgressPercent(order) {
  return Math.round(
    getProgressValue(order) * 100
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
  const step = Number(stepOrdem)
  const current = Number(order.ordem_status || 0)

  if (current === 0) {
    return darkMode
      ? '#22272e'
      : '#f3f4f6'
  }

  if (step < current) {
    return '#21BA45'
  }

  if (step === current) {
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
  const step = Number(stepOrdem)
  const current = Number(currentOrdem || 0)

  if (current === 0) {
    return 'radio_button_unchecked'
  }

  if (step < current) {
    return 'check'
  }

  if (step === current) {
    return 'hourglass_empty'
  }

  return 'radio_button_unchecked'
}

function getTrackStyle(
  stepOrdem,
  order
) {
  const step = Number(stepOrdem)
  const current = Number(order.ordem_status || 0)

  if (step < current) {
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
  return Number(stepOrdem) === Number(currentOrdem)
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

.client-dashboard {
  padding: 30px 28px 52px;
  color: var(--text-base);
}

.client-dashboard .executive-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.client-dashboard .operations-grid {
  grid-template-columns: minmax(0, 1fr) 310px;
}

.client-dashboard .order-store {
  align-items: flex-start;
}

.client-dashboard .order-side-data {
  justify-content: center;
}

.client-dashboard .network-column {
  display: grid;
  gap: 14px;
}

.deadline-card {
  padding: 19px;
}

.deadline-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.deadline-card__icon {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .16);
  border-radius: 11px;
}

.deadline-card__head strong {
  display: block;
  color: var(--text-strong);
  font-size: 13px;
}

.deadline-card__head span {
  display: block;
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 9.5px;
}

.deadline-card p {
  margin: 0;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.55;
}

.project-store-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 7px;
  color: var(--text-muted);
  font-size: 10.5px;
  font-weight: 600;
}

.project-store-meta .q-icon {
  color: var(--brand);
}

.client-order-project {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-strong);
  font-size: 14px;
}

.client-order-project .q-icon {
  color: var(--brand);
}

.client-order-project strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.client-forecast {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 600;
}

.client-forecast--danger {
  color: #d95050;
}

.client-dialog-projects {
  display: grid;
  gap: 6px;
}

.client-project-mini-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 11px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
}

.client-project-mini-main,
.client-project-mini-side {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.client-project-mini-main strong {
  color: var(--text-strong);
  font-size: 11px;
}

.client-project-mini-main span {
  color: var(--text-muted);
  font-size: 9.5px;
}

.client-project-mini-side {
  align-items: flex-end;
  flex-shrink: 0;
}

@media (max-width: 1180px) {
  .client-dashboard .executive-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .client-dashboard .operations-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .client-dashboard {
    padding: 18px 10px 34px;
  }

  .client-dashboard .executive-grid {
    grid-template-columns: 1fr 1fr;
  }

  .client-project-mini-row {
    flex-direction: column;
  }

  .client-project-mini-side {
    align-items: flex-start;
  }
}

@media (max-width: 420px) {
  .client-dashboard .executive-grid {
    grid-template-columns: 1fr;
  }
}

</style>