<template>
    <q-page class="page">

        <div class="greeting-wrap">
            <div>
                <h1 class="greeting" :class="isDark ? 'text-white' : 'text-grey-9'">
                    {{ greeting }}, <span class="greeting-name">{{ firstName }}</span>.
                </h1>
                <p class="greeting-sub" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
                    {{ dateStr }} — Acompanhe as vendas gerais, representantes e projetos em andamento.
                </p>
            </div>
        </div>

        <!-- Cards dinâmicos de Resumo de Vendas -->
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
                        {{ formatMoney(card.totalValor) }}
                    </span>

                    <span class="stat-qty" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
                        {{ card.value }} {{ card.value === 1 ? 'pedido' : 'pedidos' }}
                    </span>
                </div>

                <div class="stat-bar" :style="{ background: card.color }" />
            </div>
        </div>

        <div class="main-grid">
            <!-- Lista de Projetos Recentes -->
            <div class="block" :class="isDark ? 'block--dark' : 'block--light'">
                <div class="block-head">
                    <div class="block-title" :class="isDark ? 'text-grey-1' : 'text-grey-9'">
                        <q-icon name="receipt_long" size="20px" color="primary" class="q-mr-sm" />
                        Últimas Vendas / Projetos
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
                                <!-- NOVO: Badge de ID do Pedido -->
                                <div class="q-mb-xs">
                                    <span class="text-caption text-weight-bold"
                                        :class="isDark ? 'bg-grey-9 text-grey-3' : 'bg-blue-1 text-primary'"
                                        style="padding: 3px 8px; border-radius: 6px; font-size: 11px;">
                                        <q-icon name="receipt_long" size="12px" class="q-mr-xs"
                                            style="margin-top: -2px" />
                                        Pedido #{{ order.id }}
                                    </span>
                                </div>

                                <!-- Destaque para o NOME DA LOJA / LOJISTA -->
                                <span
                                    class="text-weight-bold text-subtitle1 text-primary flex items-center gap-2 q-mt-xs">
                                    <q-icon name="storefront" size="18px" class="q-mr-xs" />
                                    {{ order.nome_lojista || 'Lojista não informado' }}
                                    <span v-if="order.id_lojista"
                                        class="text-caption text-grey-6 text-weight-normal q-ml-xs">
                                        #{{ order.id_lojista }}
                                    </span>
                                </span>

                                <!-- NOVO: Representante vinculado ao Pedido -->
                                <span class="flex items-center" style="font-size: 11.5px; margin-top: -2px;"
                                    :class="isDark ? 'text-grey-5' : 'text-grey-6'">
                                    <q-icon name="badge" size="13px" class="q-mr-xs" />
                                    {{ order.representante || order.nome_representante || 'Sem representante' }}
                                </span>

                                <!-- Dados do Cliente Final -->
                                <span class="text-caption text-grey-7 q-mt-xs flex items-center">
                                    <q-icon name="person" size="14px" class="q-mr-xs text-grey-5" />
                                    Cliente:
                                    <strong :class="isDark ? 'text-grey-4' : 'text-grey-9'" class="q-ml-xs">
                                        {{ order.nome_cliente || 'Não informado' }}
                                    </strong>
                                </span>

                                <!-- Dados do Projeto -->
                                <span class="text-caption text-grey-6 q-mt-xs">
                                    Projeto: <strong :class="isDark ? 'text-grey-4' : 'text-grey-8'">{{
                                        order.nome_projeto }}</strong>
                                </span>
                                <span class="text-caption text-grey-6">Venda em: {{ formatDate(order.data_pedido)
                                }}</span>
                            </div>

                            <div class="order-col-forecast">
                                <span class="forecast-label">Previsão Fábrica:</span>
                                <span class="forecast-value"
                                    :style="{ color: order.ordem_status === 0 ? order.cor : '' }"
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

                        <!-- LINHA DO TEMPO -->
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

                                <!-- Porcentagem idêntica à tela de Pedidos -->
                                <span class="text-weight-bold"
                                    :style="{ color: order.ordem_status === 0 ? order.cor : (order.ordem_status === totalEtapas ? '#21BA45' : 'var(--q-primary)'), fontSize: '13px' }">
                                    {{ order.ordem_status === 0 ? '0%' : `${Math.round((order.ordem_status /
                                        (totalEtapas || 1)) * 100)}%` }}
                                </span>
                            </div>

                            <!-- Barra de Progresso idêntica à tela de Pedidos -->
                            <q-linear-progress
                                :value="order.ordem_status === 0 ? 0 : (order.ordem_status / (totalEtapas || 1))"
                                :color="order.ordem_status === 0 ? 'negative' : (order.ordem_status === totalEtapas ? 'positive' : 'primary')"
                                :dark="isDark" :track-color="isDark ? 'grey-8' : 'grey-4'" :style="{
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

                                <q-slide-transition>
                                    <div v-show="pedidoTimelineAberto === order.id">
                                        <div class="timeline-hz-container q-mt-sm q-mb-md q-pa-md"
                                            :class="isDark ? 'timeline-hz-container--dark' : 'timeline-hz-container--light'">
                                            <div class="timeline-hz-row">
                                                <div v-for="(step, index) in listaEtapasDoBanco" :key="step.id"
                                                    class="timeline-hz-item">
                                                    <div v-if="index < listaEtapasDoBanco.length - 1"
                                                        class="step-connect-line"
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
                                                        <q-icon :name="getTimelineIcon(step.ordem, order.ordem_status)"
                                                            size="12px" />
                                                    </div>
                                                    <span class="step-title q-mt-xs"
                                                        :style="{ color: step.ordem === order.ordem_status ? order.cor : '' }"
                                                        :class="{ 'text-weight-bold': step.ordem === order.ordem_status }">
                                                        {{ step.descricao }}
                                                    </span>
                                                    <span
                                                        v-if="step.ordem === order.ordem_status && order.ordem_status !== 0"
                                                        class="step-current-tag" :style="{ background: order.cor }">
                                                        Atual
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </q-slide-transition>
                            </template>

                            <q-separator :dark="isDark" class="q-mt-sm q-mb-xs" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Coluna Lateral Admin - Representantes -->
            <div class="side-column">
                <div class="block support-block" :class="isDark ? 'block--dark' : 'block--light'">
                    <div class="support-icon-wrap">
                        <q-icon name="badge" size="36px" color="primary" />
                    </div>
                    <h3 class="support-title" :class="isDark ? 'text-white' : 'text-grey-9'">Minha Rede</h3>
                    <p class="support-text" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
                        Acesse rapidamente a agenda e os contatos dos seus representantes comerciais.
                    </p>

                    <q-btn unelevated no-caps color="primary" icon="assignment_ind" label="Representantes"
                        class="full-width"
                        style="border-radius: 10px; font-weight: 700; font-size: 14px; padding: 12px 0;"
                        @click="modalRepresentantes = true" />
                </div>
            </div>
        </div>
    </q-page>

    <!-- Modal de Representantes (Admin) -->
    <q-dialog v-model="modalRepresentantes">
        <q-card style="width: 500px; max-width: 90vw; border-radius: 16px;"
            :class="isDark ? 'bg-dark text-white' : 'bg-white text-grey-9'">
            <q-card-section class="row items-center q-pb-none">
                <div class="text-h6 text-weight-bold">Representantes Cadastrados</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section class="q-pa-md">
                <div v-if="representantesFiltrados.length === 0" class="text-center q-pa-md"
                    style="border: 1px dashed rgba(128,128,128,0.3); border-radius: 12px;">
                    <span class="text-grey-6">Nenhum representante encontrado.</span>
                </div>

                <template v-else>
                    <q-card v-for="representante in representantesFiltrados" :key="representante.id" flat bordered
                        class="q-mb-md" :class="isDark ? 'bg-dark border-grey-8' : 'bg-white border-grey-3'"
                        style="border-radius: 12px; overflow: hidden;">

                        <!-- Dados do Representante -->
                        <q-card-section class="row items-center q-pb-sm">
                            <q-avatar color="primary" text-color="white" icon="assignment_ind" size="42px"
                                class="q-mr-md" />

                            <div class="col">
                                <div class="text-weight-bold flex items-center" style="font-size: 15px;">
                                    {{ representante.nome }}
                                    <span v-if="representante.id"
                                        class="text-caption text-grey-6 text-weight-normal q-ml-xs">
                                        #{{ representante.id }}
                                    </span>
                                </div>

                                <div class="text-caption" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
                                    {{ representante.email }}
                                </div>
                                <div v-if="representante.telefone" :class="isDark ? 'text-grey-4' : 'text-grey-7'"
                                    class="text-caption text-weight-medium q-mt-xs flex items-center">
                                    <q-icon name="phone" size="14px" class="q-mr-xs" />
                                    {{ formatarTelefone(representante.telefone) }}
                                </div>
                            </div>

                            <!-- Botões de ação com o REPRESENTANTE -->
                            <div class="col-auto row q-gutter-xs">
                                <q-btn v-if="representante.telefone" round flat dense color="green" icon="chat"
                                    size="14px" @click="abrirWhatsApp(representante.telefone, representante.nome)">
                                    <q-tooltip>Chamar no WhatsApp</q-tooltip>
                                </q-btn>
                                <q-btn round flat dense color="primary" icon="mail" size="14px"
                                    @click="abrirEmail(representante.email, representante.nome)">
                                    <q-tooltip>Enviar E-mail</q-tooltip>
                                </q-btn>
                            </div>
                        </q-card-section>

                        <q-separator :dark="isDark" />

                        <!-- Listagem dos Projetos do Representante -->
                        <q-card-section class="q-pt-sm q-pb-sm" :class="isDark ? 'bg-grey-10' : 'bg-grey-1'">
                            <div class="text-caption text-weight-bold q-mb-xs"
                                :class="isDark ? 'text-grey-5' : 'text-grey-7'">
                                <q-icon name="receipt_long" size="14px" class="q-mr-xs" /> Projetos deste representante
                            </div>

                            <div v-if="representante.projetos.length === 0" class="text-caption text-grey-5 q-pa-sm">
                                Nenhum projeto vinculado.
                            </div>

                            <div v-for="projeto in representante.projetos" :key="projeto.id"
                                class="row items-center justify-between q-mb-xs q-pa-sm rounded-borders"
                                :class="isDark ? 'bg-dark' : 'bg-white'"
                                style="border: 1px solid rgba(128,128,128,0.15);">

                                <div class="col-7 flex column">
                                    <span class="text-weight-bold text-primary"
                                        style="font-size: 13px; line-height: 1.2;">
                                        {{ projeto.nome || 'Projeto sem nome' }}
                                        <span class="text-grey-6 text-weight-medium q-ml-xs">#{{ projeto.id }}</span>
                                    </span>
                                    <span class="text-caption text-grey-6" style="font-size: 11px;">
                                        Cli: {{ projeto.nome_cliente || 'Não inf.' }}
                                        <span v-if="projeto.id_cliente" class="text-weight-bold">#{{ projeto.id_cliente
                                            }}</span>
                                    </span>
                                </div>

                                <div class="col-5 flex row items-center justify-end q-gutter-x-sm">
                                    <span class="text-weight-bold" :class="isDark ? 'text-white' : 'text-grey-9'"
                                        style="font-size: 12px;">
                                        {{ formatMoney(projeto.valor) }}
                                    </span>
                                    <span class="status-badge"
                                        :style="{ background: projeto.cor + '15', color: projeto.cor, border: `1px solid ${projeto.cor}30`, padding: '2px 6px', fontSize: '10px' }">
                                        {{ projeto.status }}
                                    </span>
                                </div>
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

const firstName = computed(() => (authStore.userName || 'Admin').split(' ')[0])

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
const pedidoTimelineAberto = ref(null)

const modalRepresentantes = ref(false) // Alterado para modalRepresentantes

// 1. DECLARAÇÃO DAS VARIÁVEIS DE STATUS E RECURSOS
const totalEtapas = ref(0)
const todosOsStatusDoBanco = ref([])
const listaEtapasDoBanco = ref([])
const todosOsLojistas = ref([])
const todosOsRepresentantes = ref([]) // Nova lista para alimentar o modal do Admin

// 2. FUNÇÃO PARA BUSCAR AS ETAPAS NO BANCO
async function carregarEtapasDoBanco() {
    try {
        const resStatus = await api.get('/status', {
            headers: { Authorization: `Bearer ${authStore.token}` }
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

// 3. FUNÇÃO DINÂMICA DE STATUS
function mapearStatusDinamico(statusStr) {
    const s = String(statusStr || '').trim().toLowerCase()

    const etapaEncontrada = todosOsStatusDoBanco.value.find(
        etapa => String(etapa.descricao).trim().toLowerCase() === s
    )

    if (etapaEncontrada) {
        return {
            ordem: Number(etapaEncontrada.ordem),
            cor: etapaEncontrada.cor || (Number(etapaEncontrada.ordem) === 0 ? '#e74c3c' : '#3498db')
        }
    }

    return { ordem: 0, color: '#e74c3c' }
}

// 4. CARREGAMENTO DOS DADOS (AGORA PUXANDO REPRESENTANTES TAMBÉM)
async function carregarDados() {
    loading.value = true
    loadError.value = ''
    try {
        await carregarEtapasDoBanco()

        // Puxa pedidos, lojistas e representantes
        const [resDashboard, resLojistas, resRepresentantes] = await Promise.all([
            api.get('/pedidos', { headers: { Authorization: `Bearer ${authStore.token}` } }),
            api.get('/lojistas', { headers: { Authorization: `Bearer ${authStore.token}` } }),
            api.get('/representantes', { headers: { Authorization: `Bearer ${authStore.token}` } }) // Rota de admin
        ])

        todosOsLojistas.value = resLojistas.data || []
        todosOsRepresentantes.value = resRepresentantes.data.data || resRepresentantes.data || []

        const rawData = resDashboard.data.data || resDashboard.data || []
        totalPedidos.value = rawData.length

        meusPedidos.value = rawData.map(p => {
            const infoStatus = mapearStatusDinamico(p.status)

            // Mapeando os lojistas para a lista principal da timeline
            const lojistaOficial = todosOsLojistas.value.find(l => l.id === p.id_lojista)

            return {
                ...p,
                nome_lojista: lojistaOficial?.nome || p.lojista,
                nome_cliente: p.nome_cliente || p.cliente,
                ordem_status: infoStatus.ordem,
                cor: infoStatus.cor,
                // NOVIDADE AQUI: Busca o representante diretamente do lojista, caso o pedido não traga
                id_representante: p.id_representante || p.representante_id || lojistaOficial?.id_representante
            }
        })

    } catch (err) {
        console.error('Erro na requisição dos dados:', err)
        loadError.value = 'Erro ao conectar com o servidor.'
    } finally {
        loading.value = false
    }
}

// 5. FUNÇÕES DE CONTATO DIRETO (WHATSAPP E EMAIL)
function abrirWhatsApp(telefone, nome) {
    if (!telefone) {
        $q.notify({
            type: 'warning',
            message: `O WhatsApp de "${nome}" não está cadastrado no banco de dados.`,
            icon: 'warning',
            position: 'top-right',
            timeout: 3000
        })
        return
    }
    const numLimpo = String(telefone).replace(/\D/g, '')
    const texto = encodeURIComponent(`Olá ${nome}, tudo bem?`)
    window.open(`https://wa.me/55${numLimpo}?text=${texto}`, '_blank')
}

function abrirEmail(email, nome) {
    if (!email || email === 'Contato via sistema' || email === 'Não informado') {
        $q.notify({
            type: 'warning',
            message: `O e-mail de "${nome}" não está cadastrado no banco de dados.`,
            icon: 'warning',
            position: 'top-right',
            timeout: 3000
        })
        return
    }
    window.location.href = `mailto:${email}?subject=Contato`
}

function formatarTelefone(tel) {
    if (!tel) return 'Não cadastrado'
    const num = String(tel).replace(/\D/g, '')
    if (num.length === 11) return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`
    if (num.length === 10) return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`
    return tel
}

// Executa o carregamento inicial dos dados
onMounted(carregarDados)

const pedidosOrdenados = computed(() =>
    [...meusPedidos.value].sort((a, b) => (b.id || 0) - (a.id || 0))
)

const recentOrders = computed(() => pedidosOrdenados.value.slice(0, 3))

// Agrupando Representantes e inserindo seus respectivos projetos
const representantesFiltrados = computed(() => {
    const mapa = new Map()

    // Alimenta o mapa com a lista oficial de representantes garantindo que o ID seja String
    todosOsRepresentantes.value.forEach(r => {
        mapa.set(String(r.id), {
            id: r.id,
            nome: r.nome,
            email: r.email || 'Não informado',
            telefone: r.telefone || null,
            projetos: []
        })
    })

    // Distribui os projetos de meusPedidos para os respectivos representantes
    meusPedidos.value.forEach(p => {
        const idRep = p.id_representante || p.representante_id

        if (idRep) {
            const key = String(idRep) // Transforma em String para garantir o "Match"

            if (!mapa.has(key)) {
                // Fallback caso venha um ID que não estava na listagem principal
                mapa.set(key, {
                    id: key,
                    nome: p.nome_representante || 'Representante Sem Nome',
                    email: p.email_representante || 'Não informado',
                    telefone: p.telefone_representante || null,
                    projetos: []
                })
            }

            mapa.get(key).projetos.push({
                id: p.id,
                nome: p.nome_projeto || p.projeto || 'Projeto sem nome',
                nome_cliente: p.nome_cliente || p.cliente || 'Não inf.',
                id_cliente: p.id_cliente,
                status: p.status,
                cor: p.cor || '#1976D2',
                valor: p.valor
            })
        }
    })
    return Array.from(mapa.values())
})

// Estatísticas dos cards do topo
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
        return [{ label: 'Vendas', color: '#888888', value: 0, totalValor: 0, icon: 'inventory_2' }]
    }

    return Object.values(map).sort((a, b) => b.totalValor - a.totalValor)
})

function getStatusIcon(status) {
    const s = String(status || '').toLowerCase()
    if (s.includes('pendente')) return 'hourglass_empty'
    if (s.includes('aprovado')) return 'thumb_up'
    if (s.includes('recusado') || s.includes('nope')) return 'cancel'
    if (s.includes('andamento') || s.includes('produção')) return 'engineering'
    if (s.includes('concluído') || s.includes('entregue') || s.includes('finalizado')) return 'check_circle'
    return 'inventory_2'
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

function getTrackStyle(stepOrdem, order) {
    const current = order.ordem_status
    if (stepOrdem < current) return { background: '#21BA45' }
    return { background: isDark.value ? '#262a33' : '#e0e0e0' }
}

function isTrackPulsing(stepOrdem, currentOrdem) {
    return stepOrdem === currentOrdem
}
</script>

<style scoped>
.page {
    padding: 32px 28px 48px;
}

@media (max-width: 600px) {
    .page {
        padding: 12px 8px 24px;
    }
}

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

.stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

.stat-qty {
    font-size: 12px;
    font-weight: 600;
    margin-top: 2px;
    letter-spacing: 0.2px;
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
    min-width: 0;
    flex: 1;
}

.stat-value {
    font-size: 18px;
    font-weight: 800;
    line-height: 1.2;
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 600px) {
    .stat-card {
        padding: 12px;
        gap: 10px;
    }

    .stat-value {
        font-size: 16px;
    }

    .stat-icon-wrap {
        width: 44px;
        height: 44px;
    }

    .stat-qty {
        font-size: 11px;
    }
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
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
}

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

.timeline-hz-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    max-width: 100%;
}

.step-connect-line {
    position: absolute;
    top: 10px;
    left: 50%;
    width: 100%;
    height: 3px;
    z-index: 1;
    transition: all 0.5s ease;
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
    background: rgba(25, 118, 210, 0.1);
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
</style>