<template>
    <q-page class="page q-pa-md column">
        <div class="page-header q-mb-lg row justify-between items-center">
            <div>
                <h1 class="text-h5 text-weight-bold" :class="isDark ? 'text-white' : 'text-grey-9'">
                    <q-icon name="receipt_long" color="primary" class="q-mr-sm" size="28px" />
                    Todos os Projetos
                </h1>
                <p class="text-caption" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
                    Gerencie todos os projetos do sistema e rastreie as etapas de fabricação de todas as lojas.
                </p>
            </div>

            <!-- BOTÃO DE UPLOAD -->
            <div>
                <q-btn color="primary" icon="upload" label="Novo Projeto" no-caps @click="abrirModalUpload" />
            </div>
        </div>

        <!-- Filtros -->
        <q-card class="filter-card q-mb-lg" :class="isDark ? 'filter-card--dark' : 'filter-card--light'" flat bordered>
            <q-card-section class="row q-col-gutter-md items-center">
                <div class="col-12 col-md-4">
                    <q-input v-model="filtros.busca" dense outlined :dark="isDark"
                        placeholder="Pesquisar por projeto, ID, lojista ou cliente..." clearable>
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
            <p class="text-grey-6 q-mt-md font-weight-medium">Buscando projetos gerais...</p>
        </div>

        <div v-else-if="pedidosFiltrados.length === 0" class="empty-state text-center q-pa-xl">
            <q-icon name="inventory_2" size="64px" color="grey-4" class="q-mb-md" />
            <h3 class="text-h6 text-grey-6 text-weight-bold">Nenhum projeto encontrado</h3>
            <p class="text-caption text-grey-5">Experimente ajustar os termos de busca ou filtros aplicados.</p>
        </div>

        <!-- Lista de Pedidos -->
        <div v-else class="pedidos-list">
            <q-expansion-item v-for="order in pedidosPaginados" :key="order.id" group="meus-pedidos-group"
                class="order-expansion q-mb-md" :class="[
                    isDark ? 'order-expansion--dark' : 'order-expansion--light',
                    { 'order-expansion--expanded': pedidoExpandidoId === order.id }
                ]" header-class="q-pa-md items-center" @show="carregarDetalhesPedido(order.id)"
                @hide="fecharPedido(order.id)">

                <template v-slot:header>
                    <div class="row full-width items-center q-col-gutter-sm">

                        <!-- Coluna 1: Dados do Projeto -->
                        <div class="col-12 col-sm-2 flex column justify-center">
                            <div class="row items-center q-gutter-x-sm">
                                <span class="text-weight-bold text-subtitle1 text-primary">{{ order.nome_projeto
                                    }}</span>
                                <span class="text-grey-6 text-weight-bold" style="font-size: 13px;">#{{ order.id
                                    }}</span>
                            </div>
                            <span class="text-caption text-grey-6">Pedido: {{ formatDate(order.data_pedido) }}</span>

                            <!-- Exibe quem enviou o projeto ao sistema -->
                            <span v-if="order.enviado_por" class="text-caption text-grey-5" style="font-size: 11px;">
                                Enviado por: <span class="text-weight-medium text-capitalize">{{ order.enviado_por
                                    }}</span>
                            </span>
                        </div>

                        <!-- Coluna 2: Barra de Progresso -->
                        <div class="col-12 col-sm-2 q-pr-md">
                            <div class="row justify-between items-center q-mb-xs">
                                <span v-if="getOrdemReal(order) === 0" class="text-weight-bold text-uppercase"
                                    :style="{ color: getCorReal(order), fontSize: '12px' }">
                                    ⚠️ Suspenso
                                </span>
                                <span v-else class="text-caption font-weight-bold text-grey-6">Progresso</span>

                                <span class="text-caption text-weight-bold"
                                    :style="{ color: getOrdemReal(order) === 0 ? getCorReal(order) : (getOrdemReal(order) === totalEtapas ? '#21BA45' : 'var(--q-primary)') }">
                                    {{ getOrdemReal(order) === 0 ? '0%' : `${Math.round((getOrdemReal(order) /
                                    totalEtapas) * 100)}%` }}
                                </span>
                            </div>
                            <q-linear-progress
                                :value="getOrdemReal(order) === 0 ? 0 : (getOrdemReal(order) / totalEtapas)"
                                :color="getOrdemReal(order) === 0 ? 'negative' : (getOrdemReal(order) === totalEtapas ? 'positive' : 'primary')"
                                :dark="isDark" :track-color="isDark ? 'grey-8' : 'grey-4'" :style="{
                                    height: '8px',
                                    borderRadius: '4px',
                                    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                                    boxShadow: isDark ? 'none' : 'inset 0 1px 3px rgba(0,0,0,0.2)'
                                }" />
                        </div>

                        <!-- Coluna 3: Previsão -->
                        <div class="col-6 col-sm-2 text-caption flex column">
                            <span class="text-grey-6 text-weight-medium">Previsão</span>
                            <span class="text-weight-bold"
                                :style="{ color: getOrdemReal(order) === 0 ? getCorReal(order) : '' }"
                                :class="getOrdemReal(order) !== 0 ? 'text-orange' : ''">
                                {{ getOrdemReal(order) === 0 ? 'Recusado' : (order.data_previsao_pedido ?
                                    formatDate(order.data_previsao_pedido) : 'Aguardando definição') }}
                            </span>
                        </div>

                        <!-- Coluna 4: Lojista e Representante -->
                        <div class="col-6 col-sm-2 text-caption flex column">
                            <span class="text-grey-6 text-weight-medium">Lojista / Rep.</span>

                            <!-- Lojista -->
                            <span class="text-weight-bold flex items-center"
                                :class="isDark ? 'text-grey-3' : 'text-grey-8'">
                                <q-icon name="storefront" size="14px" class="q-mr-xs" />
                                {{ order.lojista || 'Não informada' }}
                                <span v-if="order.id_lojista"
                                    class="text-caption text-grey-6 text-weight-normal q-ml-xs">
                                    #{{ order.id_lojista }}
                                </span>
                            </span>

                            <!-- Representante -->
                            <span class="flex items-center q-mt-xs" style="font-size: 11px;"
                                :class="isDark ? 'text-grey-5' : 'text-grey-6'">
                                <q-icon name="badge" size="12px" class="q-mr-xs" />
                                {{ order.representante || 'Sem representante' }}
                            </span>
                        </div>

                        <!-- Coluna 5: Cliente do Lojista -->
                        <div class="col-6 col-sm-2 text-caption flex column">
                            <span class="text-grey-6 text-weight-medium">Cliente Final</span>
                            <span class="text-weight-bold flex items-center"
                                :class="isDark ? 'text-grey-3' : 'text-grey-8'">
                                <q-icon name="person" size="14px" class="q-mr-xs" />
                                {{ order.cliente || 'Não informado' }}
                                <span v-if="order.id_cliente"
                                    class="text-caption text-grey-6 text-weight-normal q-ml-xs">
                                    #{{ order.id_cliente }}
                                </span>
                            </span>
                        </div>

                        <!-- Coluna 6: Badge de Status e Valor (PUXA SEMPRE A COR DO BANCO) -->
                        <div class="col-12 col-sm-2 flex column col-status-valor">
                            <span class="status-badge q-mb-xs" :style="getBadgeStyle(getCorReal(order))">
                                {{ order.status }}
                            </span>
                            <span class="text-weight-bold text-subtitle1"
                                :class="isDark ? 'text-white' : 'text-grey-9'">
                                {{ formatMoney(order.valor) }}
                            </span>
                        </div>
                    </div>
                </template>

                <q-separator :dark="isDark" />

                <!-- Detalhamento Interno do Pedido (Linha do Tempo e Edição) -->
                <q-card-section class="q-pa-md" :class="isDark ? 'bg-dark-soft' : 'bg-grey-1'">
                    <div v-if="detalhesLoading && pedidoExpandidoId === order.id" class="text-center q-pa-md">
                        <q-spinner color="primary" size="30px" />
                        <p class="text-caption text-grey-6 q-mt-sm">Carregando dados do fluxo...</p>
                    </div>

                    <template v-else-if="detalhes[order.id]">
                        <!-- Linha do Tempo -->
                        <div v-if="getOrdemReal(order) !== 0" class="q-mb-md">
                            <div class="text-subtitle2 text-weight-bold q-mb-sm text-grey-7 flex items-center">
                                <q-icon name="route" class="q-mr-xs" size="16px" /> Etapas atuais de fabricação
                            </div>

                            <div class="timeline-hz-container q-pa-md"
                                :class="isDark ? 'timeline-hz-container--dark' : 'timeline-hz-container--light'">
                                <div class="timeline-hz-row">
                                    <div v-for="(step, index) in listaEtapasDoBanco" :key="step.id"
                                        class="timeline-hz-item">

                                        <div v-if="index < listaEtapasDoBanco.length - 1" class="step-connect-line"
                                            :class="{ 'line-pulsing': isTrackPulsing(step.ordem, getOrdemReal(order, detalhes[order.id])) }"
                                            :style="getTrackStyle(step.ordem, getOrdemReal(order, detalhes[order.id]))">
                                        </div>

                                        <div class="step-circle"
                                            :class="{ 'step-circle--active': step.ordem === getOrdemReal(order, detalhes[order.id]) }"
                                            :style="{
                                                background: getCircleBg(step.ordem, getOrdemReal(order, detalhes[order.id]), getCorReal(order, detalhes[order.id])),
                                                color: step.ordem <= getOrdemReal(order, detalhes[order.id]) ? '#ffffff' : (isDark ? '#747d8c' : '#a4b0be'),
                                                boxShadow: step.ordem === getOrdemReal(order, detalhes[order.id]) ? `0 0 0 4px ${getTimelineColor(step.ordem, getOrdemReal(order, detalhes[order.id]), getCorReal(order, detalhes[order.id]))}30` : 'none'
                                            }">
                                            <q-icon
                                                :name="getTimelineIcon(step.ordem, getOrdemReal(order, detalhes[order.id]))"
                                                size="12px" />
                                        </div>

                                        <span class="step-title q-mt-xs"
                                            :style="{ color: step.ordem === getOrdemReal(order, detalhes[order.id]) ? getTimelineColor(step.ordem, getOrdemReal(order, detalhes[order.id]), getCorReal(order, detalhes[order.id])) : '' }"
                                            :class="{ 'text-weight-bold': step.ordem === getOrdemReal(order, detalhes[order.id]) }">
                                            {{ step.descricao || step.label || step.status }}
                                        </span>

                                        <span v-if="step.ordem === getOrdemReal(order, detalhes[order.id])"
                                            class="step-current-tag"
                                            :style="{ background: getTimelineColor(step.ordem, getOrdemReal(order, detalhes[order.id]), getCorReal(order, detalhes[order.id])) }">
                                            Atual
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <!-- ========================================================= -->
                        <!-- NOVA SEÇÃO: LISTA DE ITENS E COMPONENTES (SLIM & DENSE)   -->
                        <!-- ========================================================= -->
                        <div v-if="detalhes[order.id].itens && detalhes[order.id].itens.length > 0" class="q-mt-lg q-mb-md">
                            
                            <!-- ACORDEÃO PRINCIPAL -->
                            <q-expansion-item
                                dense
                                icon="list_alt"
                                label="Especificações e Itens do Projeto"
                                :caption="`${detalhes[order.id].itens.length} itens registrados`"
                                header-class="text-weight-bold q-pa-sm text-subtitle2"
                                expand-icon-class="text-primary"
                                class="rounded-borders"
                                :class="isDark ? 'bg-dark' : 'bg-white'"
                                style="border: 1px solid rgba(128,128,128,0.2);"
                            >
                                <q-separator :dark="isDark" />
                                
                                <q-list separator dense>
                                    <template v-for="item in detalhes[order.id].itens" :key="item.id">
                                    
                                        <!-- ITEM TIPO 1: Com Componentes (Expansível) -->
                                        <q-expansion-item
                                            v-if="item.componentes && item.componentes.length > 0"
                                            :group="`itens_${order.id}`"
                                            dense
                                            header-class="q-py-sm"
                                            expand-icon-class="text-primary"
                                        >
                                            <template v-slot:header>
                                                <!-- Reduzida a largura mínima do avatar para colar mais no texto -->
                                                <q-item-section avatar style="min-width: 36px;">
                                                    <q-icon name="kitchen" :color="isDark ? 'blue-4' : 'primary'" size="22px" />
                                                </q-item-section>
                                                <q-item-section>
                                                    <q-item-label class="text-weight-bold" style="font-size: 13.5px;">{{ item.descricao_item }}</q-item-label>
                                                    <q-item-label caption style="font-size: 11.5px;" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
                                                        Contém {{ item.componentes.length }} peças
                                                    </q-item-label>
                                                </q-item-section>
                                                <q-item-section side>
                                                    <!-- Badge mais compacta -->
                                                    <q-badge color="primary" rounded class="text-weight-bold shadow-1 q-px-sm" style="font-size: 11.5px; padding-top: 3px; padding-bottom: 3px;">
                                                        Qtd: {{ item.quantidade_item }}
                                                    </q-badge>
                                                </q-item-section>
                                            </template>

                                            <!-- Lista de Peças Interna (Árvore Compacta) -->
                                            <div class="q-pl-xl q-pb-sm q-pr-sm">
                                                <div class="q-pl-sm q-py-xs" style="border-left: 2px solid var(--q-primary); opacity: 0.9;">
                                                    <q-list dense>
                                                        <!-- min-height força a linha a ficar bem fina -->
                                                        <q-item v-for="(comp, i) in item.componentes" :key="i" class="q-py-none" style="min-height: 22px;">
                                                            <q-item-section avatar style="min-width: 18px; padding-right: 4px;">
                                                                <q-icon name="circle" size="4px" :color="isDark ? 'grey-6' : 'grey-4'" />
                                                            </q-item-section>
                                                            <q-item-section :class="isDark ? 'text-grey-4' : 'text-grey-8'" style="font-size: 12px; line-height: 1.2;">
                                                                {{ comp }}
                                                            </q-item-section>
                                                        </q-item>
                                                    </q-list>
                                                </div>
                                            </div>
                                        </q-expansion-item>

                                        <!-- ITEM TIPO 2: Sem Componentes (Ferragens - Fixo) -->
                                        <q-item v-else dense class="q-py-sm">
                                            <q-item-section avatar style="min-width: 36px;">
                                                <q-icon name="build" :color="isDark ? 'grey-5' : 'grey-6'" size="22px" />
                                            </q-item-section>
                                            <q-item-section>
                                                <q-item-label class="text-weight-bold" style="font-size: 13.5px;">{{ item.descricao_item }}</q-item-label>
                                                <q-item-label caption style="font-size: 11.5px;" :class="isDark ? 'text-grey-5' : 'text-grey-6'">Acessório / Material</q-item-label>
                                            </q-item-section>
                                            <q-item-section side>
                                                <q-badge color="grey-7" rounded class="text-weight-bold shadow-1 q-px-sm" style="font-size: 11.5px; padding-top: 3px; padding-bottom: 3px;">
                                                    Qtd: {{ item.quantidade_item }}
                                                </q-badge>
                                            </q-item-section>
                                        </q-item>
                                    
                                    </template>
                                </q-list>
                            </q-expansion-item>
                        </div>
                        <!-- ========================================================= -->

                        <!-- AREA DE EDIÇÃO E EXCLUSÃO DO ADMIN -->
                        <q-separator class="q-my-md" :dark="isDark" />

                        <div class="text-subtitle2 text-weight-bold q-mb-md flex items-center"
                            :class="isDark ? 'text-grey-4' : 'text-grey-8'">
                            <q-icon name="admin_panel_settings" class="q-mr-sm" size="18px" /> Alterações do Projeto
                        </div>

                        <div class="row q-col-gutter-md items-center">
                            <!-- Previsão com Calendário Melhorado (DD/MM/AAAA) -->
                            <div class="col-12 col-sm-4 col-md-3">
                                <q-input v-if="formEdicao[order.id]" v-model="formEdicao[order.id].data_previsao_pedido"
                                    dense outlined :dark="isDark" label="Previsão de Entrega" mask="##/##/####"
                                    placeholder="DD/MM/AAAA">
                                    <template v-slot:append>
                                        <q-icon name="event" class="cursor-pointer">
                                            <q-popup-proxy cover transition-show="scale" transition-hide="scale"
                                                :ref="(el) => setProxyRef(el, order.id)">
                                                <q-date v-model="formEdicao[order.id].data_previsao_pedido"
                                                    mask="DD/MM/YYYY" :dark="isDark"
                                                    @update:model-value="fecharCalendario(order.id)">
                                                    <div class="row items-center justify-end">
                                                        <q-btn v-close-popup label="Fechar" color="primary" flat />
                                                    </div>
                                                </q-date>
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                </q-input>
                            </div>

                            <!-- Status Pré-preenchido -->
                            <div class="col-12 col-sm-4 col-md-4">
                                <q-select v-if="formEdicao[order.id]" v-model="formEdicao[order.id].id_status"
                                    :options="todosStatus" option-value="id"
                                    :option-label="s => s.descricao || s.label || s.status" dense outlined
                                    :dark="isDark" label="Status Atual" emit-value map-options />
                            </div>

                            <!-- Ações -->
                            <div class="col-12 col-sm-4 col-md-5 row justify-end q-gutter-sm items-center">
                                <q-btn color="negative" icon="delete_outline" outline label="Excluir"
                                    @click="confirmarExclusao(order)" no-caps />

                                <q-btn color="primary" icon="save" label="Salvar Alterações"
                                    @click="salvarEdicao(order)" :loading="salvandoEdicao === order.id" no-caps />

                                <q-btn v-if="detalhes[order.id].xml" color="secondary" icon="download"
                                    label="Download XML" no-caps outline @click="downloadXML(detalhes[order.id])" />
                            </div>
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
            <q-pagination v-model="paginaAtual" :max="totalPaginas" :max-pages="5" direction-links boundary-numbers
                round flat :color="isDark ? 'grey-4' : 'grey-8'" active-color="primary" active-text-color="white"
                size="14px" />
        </div>

        <!-- Modal de Importação de XML -->
        <q-dialog v-model="modalUploadAberta" persistent>
            <q-card style="width: 100%; max-width: 650px; border-radius: 16px;"
                :class="isDark ? 'bg-dark text-white' : 'bg-white'">
                <q-card-section class="row items-center q-pb-md" :class="isDark ? 'bg-dark-soft' : 'bg-grey-1'">
                    <div class="text-h6 flex items-center text-weight-bold">
                        <q-icon name="cloud_upload" color="primary" class="q-mr-sm" size="28px" />
                        Importar Novos Projetos
                    </div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup :disable="enviandoArquivos" />
                </q-card-section>

                <q-card-section class="q-pa-lg">

                    <div v-if="resultadosUpload.length === 0">
                        <div class="q-mb-lg">
                            <q-select v-model="lojistaSelecionado" :options="listaLojistas" option-value="id"
                                :option-label="(item) => item.nome_fantasia || item.nome || item.razao_social || `Lojista #${item.id}`"
                                label="Selecione o Lojista *" outlined dense emit-value map-options
                                :loading="loadingLojistas" :dark="isDark" hide-bottom-space>
                                <template v-slot:prepend>
                                    <q-icon name="storefront" />
                                </template>
                            </q-select>
                        </div>

                        <div class="upload-dropzone q-pa-xl text-center cursor-pointer"
                            :class="isDark ? 'upload-dropzone--dark' : 'upload-dropzone--light'">
                            <q-file v-model="arquivosXml" multiple accept=".xml" borderless class="fit absolute-full"
                                style="opacity: 0; z-index: 2;" />
                            <q-icon name="note_add" size="64px" color="primary" class="q-mb-md" />
                            <h3 class="text-h6 text-weight-bold q-mb-xs q-mt-none">Clique ou arraste seus arquivos XML
                            </h3>
                            <p class="text-caption text-grey-6 q-mb-none">
                                Você pode selecionar vários arquivos de uma vez. Eles serão vinculados ao lojista
                                selecionado.
                            </p>

                            <div v-if="arquivosXml.length > 0" class="q-mt-lg flex flex-center q-gutter-sm"
                                style="position: relative; z-index: 3;">
                                <q-chip v-for="file in arquivosXml" :key="file.name" removable
                                    @remove="arquivosXml = arquivosXml.filter(f => f.name !== file.name)"
                                    color="primary" text-color="white" icon="insert_drive_file">
                                    {{ file.name }}
                                </q-chip>
                            </div>
                        </div>
                    </div>

                    <!-- RESULTADOS -->
                    <div v-else class="upload-results">
                        <div class="text-subtitle1 text-weight-bold q-mb-md flex items-center">
                            <q-icon name="list_alt" class="q-mr-sm" size="20px" />
                            Progresso da Importação
                        </div>

                        <div class="results-list column q-gutter-y-sm">
                            <div v-for="(resultado, index) in resultadosUpload" :key="index"
                                class="result-card row items-center q-pa-md"
                                :class="[isDark ? 'bg-dark-soft' : 'bg-grey-1', { 'border-positive': resultado.status === 'success', 'border-negative': resultado.status === 'error', 'border-primary pulsing': resultado.status === 'loading' }]">
                                <div class="q-mr-md">
                                    <q-spinner v-if="resultado.status === 'loading'" color="primary" size="24px" />
                                    <q-icon v-else-if="resultado.status === 'success'" name="check_circle"
                                        color="positive" size="28px" />
                                    <q-icon v-else name="error" color="negative" size="28px" />
                                </div>
                                <div class="col">
                                    <div class="text-weight-bold" style="word-break: break-all;">{{ resultado.nome }}
                                    </div>
                                    <div class="text-caption"
                                        :class="resultado.status === 'success' ? 'text-positive' : (resultado.status === 'error' ? 'text-negative' : 'text-grey-6')">
                                        {{ resultado.mensagem }}</div>
                                </div>
                                <div v-if="resultado.id" class="q-ml-md text-right">
                                    <div class="text-caption text-grey-6 text-uppercase" style="font-size: 10px;">ID do
                                        Pedido
                                    </div>
                                    <q-badge color="positive" class="text-weight-bold q-pa-sm text-subtitle2">#{{
                                        resultado.id
                                        }}</q-badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </q-card-section>

                <q-separator :dark="isDark" />

                <q-card-actions align="right" class="q-pa-md" :class="isDark ? 'bg-dark-soft' : 'bg-grey-1'">
                    <q-btn flat label="Cancelar" color="grey" v-close-popup v-if="resultadosUpload.length === 0" />
                    <q-btn v-if="resultadosUpload.length === 0" label="Iniciar Importação" color="primary"
                        icon="play_arrow" @click="enviarArquivos"
                        :disable="arquivosXml.length === 0 || !lojistaSelecionado" padding="8px 24px"
                        class="text-weight-bold">
                        <q-tooltip v-if="!lojistaSelecionado">Selecione um lojista primeiro</q-tooltip>
                    </q-btn>
                    <q-btn v-else label="Concluir e Fechar" color="primary" icon="done_all"
                        @click="modalUploadAberta = false" :disable="enviandoArquivos" padding="8px 24px"
                        class="text-weight-bold" />
                </q-card-actions>
            </q-card>
        </q-dialog>
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

// Estados para a Edição Rápida
const formEdicao = ref({})
const salvandoEdicao = ref(null)

// Configuração da Timeline
const totalEtapas = ref(6)
const listaEtapasDoBanco = ref([])
const todosStatus = ref([])

// Controle dos Modais de Calendário (Refs)
const calendarProxies = ref({})

function setProxyRef(el, id) {
    if (el) calendarProxies.value[id] = el
}

function fecharCalendario(id) {
    if (calendarProxies.value[id]) {
        calendarProxies.value[id].hide()
    }
}

// Filtros
const filtros = ref({ busca: '', status: null, dataInicio: '', dataFim: '' })
const opcoesStatus = computed(() => {
    const set = new Set(pedidos.value.map(p => p.status).filter(Boolean))
    return Array.from(set).map(status => ({ label: status, value: status }))
})

async function carregarPedidos() {
    loading.value = true
    try {
        const [resPedidos, resStatus] = await Promise.all([
            api.get('/pedidos', { headers: { Authorization: `Bearer ${authStore.token}` } }),
            api.get('/status', { headers: { Authorization: `Bearer ${authStore.token}` } })
        ])
        pedidos.value = resPedidos.data.data || resPedidos.data || []

        todosStatus.value = resStatus.data || []

        // Copiando idêntico ao código do representante
        listaEtapasDoBanco.value = todosStatus.value.filter(step => step.ordem !== 0)
        totalEtapas.value = listaEtapasDoBanco.value.length || 6

    } catch {
        $q.notify({ type: 'negative', message: 'Erro ao carregar lista de projetos e etapas.' })
    } finally {
        loading.value = false
    }
}

async function carregarDetalhesPedido(id) {
    pedidoExpandidoId.value = id

    const pedidoObj = pedidos.value.find(p => p.id === id)

    if (pedidoObj && !formEdicao.value[id]) {
        let prev = ''
        if (pedidoObj.data_previsao_pedido) {
            const dateParts = pedidoObj.data_previsao_pedido.split('T')[0].split('-')
            if (dateParts.length === 3) {
                prev = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
            }
        }

        let currentIdStatus = pedidoObj.id_status
        if (!currentIdStatus) {
            const foundStatus = todosStatus.value.find(s =>
                (s.status || s.label || s.descricao || '').toLowerCase() === (pedidoObj.status || '').toLowerCase()
            )
            if (foundStatus) currentIdStatus = foundStatus.id
        }

        formEdicao.value[id] = {
            data_previsao_pedido: prev,
            id_status: currentIdStatus
        }
    }

    if (detalhes.value[id]) return

    detalhesLoading.value = true
    try {
        const response = await api.get(`/pedidos/${id}`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
        })
        detalhes.value[id] = response.data.data || response.data
    } catch {
        $q.notify({ type: 'negative', message: 'Não foi possível carregar as especificações.' })
    } finally {
        detalhesLoading.value = false
    }
}

function fecharPedido(id) {
    if (pedidoExpandidoId.value === id) pedidoExpandidoId.value = null
}

// ------ FUNÇÕES DE EDIÇÃO E EXCLUSÃO ------

async function salvarEdicao(pedido) {
    salvandoEdicao.value = pedido.id
    try {
        const payload = {}
        const editData = formEdicao.value[pedido.id]

        if (editData.data_previsao_pedido) {
            const parts = editData.data_previsao_pedido.split('/')
            if (parts.length === 3) {
                payload.data_previsao_pedido = `${parts[2]}-${parts[1]}-${parts[0]}`
            } else {
                payload.data_previsao_pedido = editData.data_previsao_pedido
            }
        }

        if (editData.id_status) payload.id_status = editData.id_status

        const res = await api.patch(`/pedidos/${pedido.id}`, payload, {
            headers: { Authorization: `Bearer ${authStore.token}` }
        })

        const index = pedidos.value.findIndex(p => p.id === pedido.id)
        if (index !== -1) {
            const updatedData = res.data.data || res.data || {}

            if (payload.id_status) {
                const statusInfo = todosStatus.value.find(s => s.id === payload.id_status)
                if (statusInfo) {
                    updatedData.status = statusInfo.status || statusInfo.label || statusInfo.descricao
                    updatedData.id_status = statusInfo.id
                    updatedData.cor = statusInfo.cor
                    updatedData.ordem_status = statusInfo.ordem
                }
            }

            pedidos.value[index] = { ...pedidos.value[index], ...updatedData }

            if (detalhes.value[pedido.id]) {
                detalhes.value[pedido.id] = { ...detalhes.value[pedido.id], ...updatedData }
            }
        }

        $q.notify({ type: 'positive', message: 'Pedido atualizado com sucesso!' })
    } catch (e) {
        console.error(e)
        $q.notify({ type: 'negative', message: 'Erro ao atualizar o pedido.' })
    } finally {
        salvandoEdicao.value = null
    }
}

function confirmarExclusao(pedido) {
    $q.dialog({
        title: 'Confirmar Exclusão',
        message: `Atenção: Você está prestes a excluir o projeto #${pedido.id} (${pedido.nome_projeto}). Esta ação é irreversível. Deseja continuar?`,
        cancel: { label: 'Cancelar', flat: true, color: 'grey-7' },
        ok: { label: 'Excluir', color: 'negative', unelevated: true },
        persistent: true
    }).onOk(async () => {
        try {
            await api.delete(`/pedidos/${pedido.id}`, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            })

            $q.notify({ type: 'positive', message: 'Pedido removido com sucesso!' })

            pedidos.value = pedidos.value.filter(p => p.id !== pedido.id)
            if (pedidoExpandidoId.value === pedido.id) {
                pedidoExpandidoId.value = null
            }
        } catch (error) {
            console.error(error)
            $q.notify({ type: 'negative', message: 'Erro ao excluir o pedido.' })
        }
    })
}

// ------------------------------------------
// LÓGICA DE CORES COPIADA IDÊNTICA DO ARQUIVO DO REPRESENTANTE
// ------------------------------------------

function getOrdemReal(order, detalhe = null) {
    const alvo = detalhe || order || {};
    const ordem = Number(alvo.ordem_status !== undefined ? alvo.ordem_status : alvo.id_status);

    if (!isNaN(ordem) && ordem > 0) return ordem;

    const step = todosStatus.value.find(s =>
        (s.label || s.descricao || s.status || '').toLowerCase() === (alvo.status || '').toLowerCase()
    );
    return step ? Number(step.ordem) : 0;
}

function getCorReal(order, detalhe = null) {
    const alvo = detalhe || order || {};
    if (alvo.cor) return alvo.cor;

    const step = todosStatus.value.find(s =>
        (s.label || s.descricao || s.status || '').toLowerCase() === (alvo.status || '').toLowerCase()
    );
    if (step && step.cor) return step.cor;

    return 'var(--q-primary)';
}

// NOVA FUNÇÃO: Retorna verde apenas se for a ÚLTIMA etapa. Senão, puxa a cor real.
function getTimelineColor(stepOrdem, currentOrdem, orderCor) {
    if (currentOrdem === totalEtapas.value && stepOrdem === currentOrdem) {
        return '#21BA45'; // Fica verde quando for a última etapa 100%
    }
    return orderCor || 'var(--q-primary)';
}

function getCircleBg(stepOrdem, currentOrdem, orderCor) {
    if (currentOrdem === 0) return isDark.value ? '#22272e' : '#f3f4f6';
    if (stepOrdem < currentOrdem) return '#21BA45';

    // Se for a etapa atual
    if (stepOrdem === currentOrdem) {
        // Regra do 100% verde
        if (currentOrdem === totalEtapas.value) return '#21BA45';
        // Senão usa a cor do banco
        return orderCor || 'var(--q-primary)';
    }

    return isDark.value ? '#22272e' : '#f3f4f6';
}

function getTimelineIcon(stepOrdem, currentOrdem) {
    if (currentOrdem === 0) return 'radio_button_unchecked';
    if (stepOrdem < currentOrdem) return 'check';
    if (stepOrdem === currentOrdem) {
        if (currentOrdem === totalEtapas.value) return 'check';
        return 'hourglass_empty';
    }
    return 'radio_button_unchecked';
}

function getTrackStyle(stepOrdem, currentOrdem) {
    if (stepOrdem < currentOrdem) return { background: '#21BA45' };
    return { background: isDark.value ? '#262a33' : '#e0e0e0' };
}

function isTrackPulsing(stepOrdem, currentOrdem) {
    // Para de pulsar se já chegou na última etapa (100%)
    return stepOrdem === currentOrdem && currentOrdem !== 0 && currentOrdem !== totalEtapas.value;
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

const pedidosFiltrados = computed(() => {
    return pedidos.value.filter(order => {
        if (filtros.value.busca) {
            const term = filtros.value.busca.toLowerCase()
            const matchesName = String(order.nome_projeto || '').toLowerCase().includes(term)
            const matchesId = String(order.id).includes(term)
            const matchesCliente = String(order.cliente || '').toLowerCase().includes(term)
            const matchesLojista = String(order.lojista || '').toLowerCase().includes(term)

            if (!matchesName && !matchesId && !matchesCliente && !matchesLojista) return false
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

// --- ESTADOS DE UPLOAD E LOJISTAS ---
const modalUploadAberta = ref(false)
const arquivosXml = ref([])
const enviandoArquivos = ref(false)
const resultadosUpload = ref([])
const listaLojistas = ref([])
const lojistaSelecionado = ref(null)
const loadingLojistas = ref(false)

async function carregarLojistas() {
    loadingLojistas.value = true
    try {
        const response = await api.get('/lojistas', {
            headers: { Authorization: `Bearer ${authStore.token}` }
        })
        listaLojistas.value = response.data.data || response.data || []
    } catch (error) {
        console.error('Erro ao carregar lojistas', error)
        $q.notify({ type: 'warning', message: 'Não foi possível carregar a lista de lojistas.' })
    } finally {
        loadingLojistas.value = false
    }
}

function abrirModalUpload() {
    arquivosXml.value = []
    resultadosUpload.value = []
    lojistaSelecionado.value = null
    modalUploadAberta.value = true

    if (listaLojistas.value.length === 0) {
        carregarLojistas()
    }
}

async function enviarArquivos() {
    if (!arquivosXml.value || arquivosXml.value.length === 0 || !lojistaSelecionado.value) return

    enviandoArquivos.value = true

    resultadosUpload.value = arquivosXml.value.map(file => ({
        nome: file.name,
        status: 'loading',
        mensagem: 'Processando...',
        id: null
    }))

    const formData = new FormData()
    for (const file of arquivosXml.value) {
        formData.append('xml', file)
    }

    formData.append('id_lojista', lojistaSelecionado.value)

    try {
        const response = await api.post('/importaxml', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${authStore.token}`
            }
        })

        const resultadosBackend = response.data.resultados || []

        for (const res of resultadosBackend) {
            const itemTela = resultadosUpload.value.find(item => item.nome === res.arquivo)

            if (itemTela) {
                if (res.success) {
                    itemTela.status = 'success'
                    itemTela.mensagem = 'Projeto importado com sucesso!'
                    itemTela.id = res.data?.idPedido
                } else {
                    itemTela.status = 'error'
                    itemTela.mensagem = res.mensagem || 'Falha ao importar o arquivo.'
                }
            }
        }

    } catch (error) {
        for (const item of resultadosUpload.value) {
            if (item.status === 'loading') {
                item.status = 'error'
                item.mensagem = error.response?.data?.message || 'Erro de comunicação com o servidor.'
            }
        }
    }

    enviandoArquivos.value = false
    arquivosXml.value = []

    carregarPedidos()
}

onMounted(carregarPedidos)
</script>

<style scoped>
/* ESTILOS MANTIDOS IDÊNTICOS */
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

.upload-dropzone {
    position: relative;
    border-radius: 16px;
    transition: all 0.3s ease;
    overflow: hidden;
}

.upload-dropzone--light {
    background-color: rgba(25, 118, 210, 0.03);
    border: 2px dashed rgba(25, 118, 210, 0.3);
}

.upload-dropzone--light:hover {
    background-color: rgba(25, 118, 210, 0.08);
    border-color: var(--q-primary);
}

.upload-dropzone--dark {
    background-color: rgba(255, 255, 255, 0.02);
    border: 2px dashed rgba(255, 255, 255, 0.2);
}

.upload-dropzone--dark:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: var(--q-primary);
}

.result-card {
    border-radius: 12px;
    border-left: 4px solid transparent;
    transition: all 0.3s ease;
}

.border-positive {
    border-left-color: var(--q-positive);
}

.border-negative {
    border-left-color: var(--q-negative);
}

.border-primary {
    border-left-color: var(--q-primary);
}

.pulsing {
    animation: pulse-bg 1.5s infinite alternate;
}

@keyframes pulse-bg {
    0% {
        opacity: 0.8;
    }

    100% {
        opacity: 1;
    }
}
</style>