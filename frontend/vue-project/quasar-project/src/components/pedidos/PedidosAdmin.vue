<template>
  <q-page class="pedidos-page">
    <section class="page-hero">
      <div class="page-hero__copy">
        <div class="eyebrow">
          <span class="eyebrow__dot"></span>
          Gestão de projetos
        </div>

        <h1>Projetos <span>em produção</span></h1>

        <p>
          Acompanhe toda a carteira de projetos, consulte os envolvidos,
          atualize dados e status e acesse os itens importados do Promob.
        </p>
      </div>

      <div class="hero-summary">
        <div class="hero-summary__item">
          <span>Projetos</span>
          <strong>{{ pedidos.length }}</strong>
        </div>

        <div class="hero-summary__divider"></div>

        <div class="hero-summary__item">
          <span>Volume financeiro</span>
          <strong>{{ formatarMoedaCompacta(volumeTotal) }}</strong>
        </div>

        <div class="hero-summary__divider"></div>

        <div class="hero-summary__item">
          <span>Em andamento</span>
          <strong>{{ totalEmAndamento }}</strong>
        </div>

        <div class="hero-summary__divider"></div>

        <div class="hero-summary__item">
          <span>Finalizados</span>
          <strong>{{ totalFinalizados }}</strong>
        </div>
      </div>
    </section>

    <section class="panel projects-panel">
      <div class="list-toolbar">
        <div class="list-toolbar__copy">
          <div class="section-kicker">Carteira de projetos</div>
          <h2>Projetos cadastrados</h2>
          <p>Clique em um projeto para acessar informações, fluxo, itens e XML.</p>
        </div>

        <div class="list-toolbar__actions">
          <q-input
            v-model="busca"
            debounce="250"
            outlined
            dense
            clearable
            class="search-field"
            placeholder="Pesquisar projeto, cliente ou lojista..."
          >
            <template #prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>

          <q-select
            v-model="filtroStatus"
            :options="opcoesStatusFiltro"
            emit-value
            map-options
            clearable
            outlined
            dense
            class="status-filter-main"
            placeholder="Status"
          >
            <template #prepend>
              <q-icon name="sell" size="17px" />
            </template>
          </q-select>

          <q-btn
            flat
            no-caps
            icon="tune"
            :label="mostrarFiltros ? 'Ocultar filtros' : 'Filtros'"
            class="filter-btn"
            :class="{ 'filter-btn--active': temFiltrosAvancados }"
            @click="mostrarFiltros = !mostrarFiltros"
          >
            <q-badge
              v-if="quantidadeFiltrosAvancados"
              floating
              rounded
              color="orange"
            >
              {{ quantidadeFiltrosAvancados }}
            </q-badge>
          </q-btn>

          <q-btn
            unelevated
            no-caps
            icon="upload_file"
            label="Importar XML"
            class="primary-btn"
            @click="abrirImportacao"
          />
        </div>
      </div>

      <q-slide-transition>
        <div v-show="mostrarFiltros" class="advanced-filters">
          <div class="advanced-filters__head">
            <div>
              <strong>Filtros avançados</strong>
              <span>Refine a carteira por rede comercial, cliente ou período.</span>
            </div>

            <q-btn
              v-if="temFiltrosAtivos"
              flat
              dense
              no-caps
              icon="restart_alt"
              label="Limpar filtros"
              class="clear-filters-btn"
              @click="limparFiltros"
            />
          </div>

          <div class="advanced-filters__grid">
            <q-select
              v-model="filtroRepresentante"
              :options="opcoesRepresentantesFiltro"
              emit-value
              map-options
              clearable
              outlined
              dense
              label="Representante"
              class="advanced-filter-field"
            >
              <template #prepend><q-icon name="badge" size="17px" /></template>
            </q-select>

            <q-select
              v-model="filtroLojista"
              :options="opcoesLojistasFiltro"
              emit-value
              map-options
              clearable
              outlined
              dense
              label="Lojista"
              class="advanced-filter-field"
            >
              <template #prepend><q-icon name="storefront" size="17px" /></template>
            </q-select>

            <q-select
              v-model="filtroCliente"
              :options="opcoesClientesFiltro"
              emit-value
              map-options
              clearable
              outlined
              dense
              label="Cliente"
              class="advanced-filter-field"
            >
              <template #prepend><q-icon name="person_outline" size="17px" /></template>
            </q-select>

            <q-input
              :model-value="formatarDataInputVisual(dataInicio)"
              outlined
              dense
              readonly
              clearable
              label="Pedido a partir de"
              class="advanced-filter-field date-picker-field"
              @clear="dataInicio = ''"
            >
              <template #prepend>
                <q-icon name="event" size="17px" class="date-picker-icon" />
              </template>

              <template #append>
                <q-icon name="calendar_month" size="18px" class="cursor-pointer date-picker-action">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="dataInicio"
                      mask="YYYY-MM-DD"
                      color="orange"
                      today-btn
                      minimal
                    >
                      <div class="row items-center justify-end q-gutter-sm">
                        <q-btn
                          flat
                          no-caps
                          color="grey-7"
                          label="Limpar"
                          @click="dataInicio = ''"
                        />
                        <q-btn
                          v-close-popup
                          flat
                          no-caps
                          color="orange"
                          label="Concluir"
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              :model-value="formatarDataInputVisual(dataFim)"
              outlined
              dense
              readonly
              clearable
              label="Pedido até"
              class="advanced-filter-field date-picker-field"
              @clear="dataFim = ''"
            >
              <template #prepend>
                <q-icon name="event_available" size="17px" class="date-picker-icon" />
              </template>

              <template #append>
                <q-icon name="calendar_month" size="18px" class="cursor-pointer date-picker-action">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="dataFim"
                      mask="YYYY-MM-DD"
                      color="orange"
                      today-btn
                      minimal
                    >
                      <div class="row items-center justify-end q-gutter-sm">
                        <q-btn
                          flat
                          no-caps
                          color="grey-7"
                          label="Limpar"
                          @click="dataFim = ''"
                        />
                        <q-btn
                          v-close-popup
                          flat
                          no-caps
                          color="orange"
                          label="Concluir"
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
      </q-slide-transition>

      <div class="list-result-bar">
        <div>
          <strong>
            {{ pedidosFiltrados.length }}
            {{ pedidosFiltrados.length === 1 ? 'projeto encontrado' : 'projetos encontrados' }}
          </strong>
          <span>{{ formatarMoeda(volumeFiltrado) }} no resultado atual</span>
        </div>

        <div class="result-statuses">
          <span>
            <i class="result-dot result-dot--progress"></i>
            {{ totalFiltradoEmAndamento }} em andamento
          </span>
          <span>
            <i class="result-dot result-dot--done"></i>
            {{ totalFiltradoFinalizados }} finalizados
          </span>
        </div>
      </div>

      <div class="desktop-list">
        <q-table
          flat
          hide-bottom
          row-key="id"
          :rows="pedidosFiltrados"
          :columns="colunasPedidos"
          :loading="loading"
          v-model:pagination="paginacao"
          class="data-table"
          table-class="data-table__body"
          table-header-class="data-table__header"
          @row-click="handleRowClick"
        >
          <template #loading>
            <q-inner-loading showing color="orange" />
          </template>

          <template #body-cell-id="props">
            <q-td :props="props">
              <span class="id-badge">#{{ props.row.id }}</span>
            </q-td>
          </template>

          <template #body-cell-projeto="props">
            <q-td :props="props">
              <div class="project-cell">
                <div class="project-avatar">
                  <q-icon name="inventory_2" size="18px" />
                </div>
                <div>
                  <strong>{{ props.row.nome_projeto || 'Projeto sem nome' }}</strong>
                  <span>Pedido em {{ formatarDataCurta(props.row.data_pedido) }}</span>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-rede="props">
            <q-td :props="props">
              <div class="network-cell">
                <div>
                  <q-icon name="storefront" size="15px" />
                  <span>{{ props.row.lojista || 'Lojista não informado' }}</span>
                </div>
                <div>
                  <q-icon name="badge" size="15px" />
                  <span>{{ props.row.representante || 'Sem representante' }}</span>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-cliente="props">
            <q-td :props="props">
              <div class="client-cell">
                <div class="client-avatar">{{ iniciais(props.row.cliente) }}</div>
                <div>
                  <strong>{{ props.row.cliente || 'Cliente não informado' }}</strong>
                  <span>Cliente #{{ props.row.id_cliente || '—' }}</span>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <span
                class="status-badge"
                :class="{ 'status-badge--critical': Number(props.row.ordem_status) === 0 }"
                :style="Number(props.row.ordem_status) === 0 ? undefined : statusStyle(props.row.cor)"
              >
                <i :style="{ background: Number(props.row.ordem_status) === 0 ? '#fff' : (props.row.cor || '#ff7b00') }"></i>
                {{ props.row.status || 'Sem status' }}
              </span>
            </q-td>
          </template>

          <template #body-cell-progresso="props">
            <q-td :props="props">
              <div class="progress-cell">
                <div class="progress-cell__top">
                  <span>
                    {{
                      Number(props.row.ordem_status) === 0
                        ? 'Fora do fluxo'
                        : `Etapa ${posicaoEtapa(props.row)} de ${statusFluxo.length || 0}`
                    }}
                  </span>

                  <strong>{{ progressoPedido(props.row) }}%</strong>
                </div>

                <div
                  class="project-progress"
                  :class="{
                    'project-progress--complete': progressoPedido(props.row) === 100,
                    'project-progress--special': Number(props.row.ordem_status) === 0
                  }"
                >
                  <span
                    class="project-progress__fill"
                    :style="{
                      width: `${progressoPedido(props.row)}%`,
                      '--progress-color': Number(props.row.ordem_status) === 0
                        ? (props.row.cor || '#d95050')
                        : 'var(--brand)'
                    }"
                  ></span>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-financeiro="props">
            <q-td :props="props">
              <strong class="money-cell">{{ formatarMoeda(props.row.valor) }}</strong>
            </q-td>
          </template>

          <template #body-cell-datas="props">
            <q-td :props="props">
              <div class="dates-cell">
                <span>
                  <q-icon name="event" size="14px" />
                  {{ formatarDataCurta(props.row.data_pedido) }}
                </span>
                <span>
                  <q-icon name="event_available" size="14px" />
                  {{
                    props.row.data_previsao_pedido
                      ? formatarDataCurta(props.row.data_previsao_pedido)
                      : 'Sem previsão'
                  }}
                </span>
              </div>
            </q-td>
          </template>

          <template #body-cell-acoes="props">
            <q-td :props="props" class="text-right">
              <div class="row-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="visibility"
                  class="table-action-btn"
                  @click.stop="abrirPedido(props.row)"
                >
                  <q-tooltip>Abrir projeto</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  class="table-action-btn table-action-btn--danger"
                  @click.stop="confirmarExclusao(props.row)"
                >
                  <q-tooltip>Excluir projeto</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template #no-data>
            <div class="empty-state">
              <div class="empty-state__icon">
                <q-icon name="inventory_2" size="29px" />
              </div>
              <strong>Nenhum projeto encontrado</strong>
              <span>Ajuste os filtros ou importe um novo XML para iniciar um projeto.</span>
            </div>
          </template>
        </q-table>
      </div>

      <div class="mobile-list">
        <div v-if="loading" class="mobile-loading">
          <q-spinner color="orange" size="28px" />
          <span>Carregando projetos...</span>
        </div>

        <div v-else-if="pedidosPaginadosMobile.length === 0" class="empty-state">
          <div class="empty-state__icon">
            <q-icon name="inventory_2" size="29px" />
          </div>
          <strong>Nenhum projeto encontrado</strong>
        </div>

        <article
          v-for="pedido in pedidosPaginadosMobile"
          :key="pedido.id"
          class="project-mobile-card"
          @click="abrirPedido(pedido)"
        >
          <div class="project-mobile-card__head">
            <div class="project-avatar project-avatar--mobile">
              <q-icon name="inventory_2" size="20px" />
            </div>

            <div class="project-mobile-card__identity">
              <strong>{{ pedido.nome_projeto || 'Projeto sem nome' }}</strong>
              <span>#{{ pedido.id }} · {{ formatarDataCurta(pedido.data_pedido) }}</span>
            </div>

            <q-icon name="chevron_right" size="20px" />
          </div>

          <div class="project-mobile-card__status">
            <span
              class="status-badge"
              :class="{ 'status-badge--critical': Number(pedido.ordem_status) === 0 }"
              :style="Number(pedido.ordem_status) === 0 ? undefined : statusStyle(pedido.cor)"
            >
              <i :style="{ background: Number(pedido.ordem_status) === 0 ? '#fff' : (pedido.cor || '#ff7b00') }"></i>
              {{ pedido.status || 'Sem status' }}
            </span>
            <strong>{{ formatarMoeda(pedido.valor) }}</strong>
          </div>

          <div class="project-mobile-progress">
            <div class="project-mobile-progress__head">
              <span>
                {{
                  Number(pedido.ordem_status) === 0
                    ? 'Fora do fluxo principal'
                    : `Progresso · etapa ${posicaoEtapa(pedido)} de ${statusFluxo.length || 0}`
                }}
              </span>
              <strong>{{ progressoPedido(pedido) }}%</strong>
            </div>

            <div
              class="project-progress"
              :class="{
                'project-progress--complete': progressoPedido(pedido) === 100,
                'project-progress--special': Number(pedido.ordem_status) === 0
              }"
            >
              <span
                class="project-progress__fill"
                :style="{
                  width: `${progressoPedido(pedido)}%`,
                  '--progress-color': Number(pedido.ordem_status) === 0
                    ? (pedido.cor || '#d95050')
                    : 'var(--brand)'
                }"
              ></span>
            </div>
          </div>

          <div class="project-mobile-card__relations">
            <div>
              <q-icon name="person_outline" size="15px" />
              <span>{{ pedido.cliente || 'Cliente não informado' }}</span>
            </div>
            <div>
              <q-icon name="storefront" size="15px" />
              <span>{{ pedido.lojista || 'Lojista não informado' }}</span>
            </div>
            <div>
              <q-icon name="badge" size="15px" />
              <span>{{ pedido.representante || 'Sem representante' }}</span>
            </div>
          </div>

          <div class="project-mobile-card__footer">
            <span>
              Previsão:
              <strong>
                {{
                  pedido.data_previsao_pedido
                    ? formatarDataCurta(pedido.data_previsao_pedido)
                    : 'Não definida'
                }}
              </strong>
            </span>

            <q-btn
              flat
              round
              dense
              icon="delete_outline"
              class="mobile-delete-btn"
              @click.stop="confirmarExclusao(pedido)"
            />
          </div>
        </article>
      </div>

      <div class="pagination-footer">
        <div class="pagination-footer__left">
          <span>Mostrar</span>
          <q-select
            v-model="paginacao.rowsPerPage"
            :options="[5, 10, 20, 50]"
            outlined
            dense
            class="rows-select"
          />
          <span>por página</span>
        </div>

        <q-pagination
          v-model="paginacao.page"
          :max="numeroDePaginas"
          :max-pages="5"
          direction-links
          boundary-numbers
          round
          flat
          color="grey-7"
          active-color="orange"
          active-text-color="white"
          size="13px"
        />
      </div>
    </section>

    <q-dialog v-model="modalPedido" persistent>
      <q-card class="project-dialog">
        <q-inner-loading
          :showing="carregandoDetalhe"
          color="orange"
          label="Carregando projeto..."
          class="dialog-loading"
        />

        <q-card-section class="workspace-head">
          <div class="workspace-identity">
            <div class="workspace-avatar">
              <q-icon name="inventory_2" size="23px" />
            </div>

            <div>
              <div class="section-kicker">
                Projeto #{{ pedidoDetalhe.id || pedidoResumoSelecionado?.id }}
              </div>
              <h2>
                {{
                  pedidoDetalhe.nome_projeto ||
                  pedidoResumoSelecionado?.nome_projeto ||
                  'Projeto'
                }}
              </h2>
              <p>
                {{
                  pedidoDetalhe.cliente ||
                  pedidoResumoSelecionado?.cliente ||
                  'Cliente não informado'
                }}
              </p>
            </div>
          </div>

          <div class="workspace-summary">
            <div>
              <span>Valor</span>
              <strong>{{ formatarMoedaCompacta(pedidoDetalhe.valor) }}</strong>
            </div>
            <div>
              <span>Itens</span>
              <strong>{{ itensPedido.length }}</strong>
            </div>
            <div>
              <span>Etapa</span>
              <strong>{{ pedidoDetalhe.ordem_status ?? '—' }}</strong>
            </div>
          </div>

          <div class="workspace-head__actions">
            <q-btn
              flat
              round
              dense
              icon="delete_outline"
              class="workspace-delete-btn"
              @click="confirmarExclusao(pedidoDetalhe)"
            >
              <q-tooltip>Excluir projeto</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              dense
              icon="close"
              :disable="salvando || alterandoStatus"
              class="workspace-close"
              @click="fecharPedido"
            />
          </div>
        </q-card-section>

        <div class="workspace-tabbar-shell">
          <nav class="workspace-tabbar" aria-label="Seções do projeto">
            <button
              v-for="tab in tabsPedido"
              :key="tab.name"
              type="button"
              class="workspace-tab-card"
              :class="{ 'workspace-tab-card--active': tabPedido === tab.name }"
              @click="tabPedido = tab.name"
            >
              <span class="workspace-tab-card__icon">
                <q-icon :name="tab.icon" size="21px" />
              </span>

              <span class="workspace-tab-card__copy">
                <span class="workspace-tab-card__title-row">
                  <strong>{{ tab.label }}</strong>
                  <span v-if="tab.count !== null" class="workspace-tab-count">
                    {{ tab.count }}
                  </span>
                </span>
                <small>{{ tab.description }}</small>
              </span>

              <span v-if="tabPedido === tab.name" class="workspace-tab-card__active-mark">
                <q-icon name="check" size="13px" />
              </span>
            </button>
          </nav>
        </div>

        <q-card-section class="workspace-body">
          <q-tab-panels v-model="tabPedido" class="workspace-panels">
            <q-tab-panel name="dados" class="workspace-panel">
              <q-form ref="formPedido" @submit.prevent="salvarResumoPedido">
                <div class="tab-heading">
                  <div>
                    <div class="section-kicker">Informações do projeto</div>
                    <h3>Visão geral</h3>
                    <p>Consulte e atualize os dados administrativos permitidos pelo backend.</p>
                  </div>

                  <span
                  class="status-badge status-badge--large"
                  :class="{ 'status-badge--critical': Number(pedidoDetalhe.ordem_status) === 0 }"
                  :style="Number(pedidoDetalhe.ordem_status) === 0 ? undefined : statusStyle(pedidoDetalhe.cor)"
                >
                    <i :style="{ background: Number(pedidoDetalhe.ordem_status) === 0 ? '#fff' : (pedidoDetalhe.cor || '#ff7b00') }"></i>
                    {{ pedidoDetalhe.status || 'Sem status' }}
                  </span>
                </div>

                <div class="project-overview-summary">
                  <article>
                    <div class="overview-stat-icon"><q-icon name="payments" size="19px" /></div>
                    <div>
                      <span>Valor do projeto</span>
                      <strong>{{ formatarMoeda(pedidoDetalhe.valor) }}</strong>
                    </div>
                  </article>

                  <article>
                    <div class="overview-stat-icon"><q-icon name="event" size="19px" /></div>
                    <div>
                      <span>Data do pedido</span>
                      <strong>{{ formatarDataCurta(pedidoDetalhe.data_pedido) }}</strong>
                    </div>
                  </article>

                  <article>
                    <div class="overview-stat-icon"><q-icon name="event_available" size="19px" /></div>
                    <div>
                      <span>Previsão</span>
                      <strong>
                        {{
                          pedidoDetalhe.data_previsao_pedido
                            ? formatarDataCurta(pedidoDetalhe.data_previsao_pedido)
                            : 'Não definida'
                        }}
                      </strong>
                    </div>
                  </article>

                  <article>
                    <div class="overview-stat-icon"><q-icon name="send" size="19px" /></div>
                    <div>
                      <span>Enviado por</span>
                      <strong>{{ formatarOrigem(pedidoDetalhe.enviado_por) }}</strong>
                    </div>
                  </article>
                </div>

                <section class="form-card">
                  <div class="form-card__head">
                    <div class="form-card__number">01</div>
                    <div>
                      <strong>Dados comerciais</strong>
                      <span>Informações principais do projeto.</span>
                    </div>
                  </div>

                  <div class="form-grid">
                    <div class="field-block field-block--full">
                      <span class="field-label">Nome do projeto *</span>
                      <q-input
                        v-model="pedidoEditando.nome_projeto"
                        outlined
                        dense
                        color="orange"
                        class="premium-field"
                        placeholder="Nome do projeto"
                        :rules="[val => !!String(val || '').trim() || 'Informe o nome do projeto']"
                      >
                        <template #prepend><q-icon name="inventory_2" size="18px" /></template>
                      </q-input>
                    </div>

                    <div class="field-block">
                      <span class="field-label">Valor</span>
                      <q-input
                        v-model.number="pedidoEditando.valor"
                        type="number"
                        step="0.01"
                        min="0"
                        outlined
                        dense
                        color="orange"
                        class="premium-field"
                        prefix="R$"
                      >
                        <template #prepend><q-icon name="payments" size="18px" /></template>
                      </q-input>
                    </div>

                    <div class="field-block">
                      <span class="field-label">Previsão do pedido</span>

                      <q-input
                        :model-value="formatarDataInputVisual(pedidoEditando.data_previsao_pedido)"
                        outlined
                        dense
                        readonly
                        clearable
                        color="orange"
                        class="premium-field date-picker-field"
                        placeholder="Selecione uma data"
                        @clear="pedidoEditando.data_previsao_pedido = ''"
                      >
                        <template #prepend>
                          <q-icon name="event_available" size="18px" />
                        </template>

                        <template #append>
                          <q-icon name="calendar_month" size="19px" class="cursor-pointer date-picker-action">
                            <q-popup-proxy
                              cover
                              transition-show="scale"
                              transition-hide="scale"
                            >
                              <q-date
                                v-model="pedidoEditando.data_previsao_pedido"
                                mask="YYYY-MM-DD"
                                color="orange"
                                today-btn
                              >
                                <div class="row items-center justify-end q-gutter-sm">
                                  <q-btn
                                    flat
                                    no-caps
                                    color="grey-7"
                                    label="Limpar"
                                    @click="pedidoEditando.data_previsao_pedido = ''"
                                  />
                                  <q-btn
                                    v-close-popup
                                    flat
                                    no-caps
                                    color="orange"
                                    label="Concluir"
                                  />
                                </div>
                              </q-date>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>

                    <div class="field-block">
                      <span class="field-label">Cliente *</span>
                      <q-select
                        v-model="pedidoEditando.id_cliente"
                        :options="opcoesClientes"
                        emit-value
                        map-options
                        use-input
                        input-debounce="0"
                        outlined
                        dense
                        color="orange"
                        class="premium-field"
                        @filter="filtrarClientesSelect"
                        :rules="[val => !!val || 'Selecione o cliente']"
                      >
                        <template #prepend><q-icon name="person_outline" size="18px" /></template>
                      </q-select>
                    </div>

                    <div class="field-block">
                      <span class="field-label">Lojista *</span>
                      <q-select
                        v-model="pedidoEditando.id_lojista"
                        :options="opcoesLojistas"
                        emit-value
                        map-options
                        use-input
                        input-debounce="0"
                        outlined
                        dense
                        color="orange"
                        class="premium-field"
                        @filter="filtrarLojistasSelect"
                        :rules="[val => !!val || 'Selecione o lojista']"
                      >
                        <template #prepend><q-icon name="storefront" size="18px" /></template>
                      </q-select>
                    </div>
                  </div>
                </section>

                <section class="relationship-section">
                  <div class="form-card__head">
                    <div class="form-card__number">02</div>
                    <div>
                      <strong>Envolvidos</strong>
                      <span>Relações comerciais atuais deste projeto.</span>
                    </div>
                  </div>

                  <div class="relationship-grid">
                    <article class="relationship-card">
                      <div class="relationship-card__icon"><q-icon name="person_outline" size="20px" /></div>
                      <div>
                        <span>Cliente</span>
                        <strong>{{ nomeClienteSelecionado }}</strong>
                        <small>#{{ pedidoEditando.id_cliente || '—' }}</small>
                      </div>
                    </article>

                    <article class="relationship-card">
                      <div class="relationship-card__icon"><q-icon name="storefront" size="20px" /></div>
                      <div>
                        <span>Lojista</span>
                        <strong>{{ nomeLojistaSelecionado }}</strong>
                        <small>#{{ pedidoEditando.id_lojista || '—' }}</small>
                      </div>
                    </article>

                    <article class="relationship-card">
                      <div class="relationship-card__icon"><q-icon name="badge" size="20px" /></div>
                      <div>
                        <span>Representante</span>
                        <strong>{{ nomeRepresentanteSelecionado }}</strong>
                        <small>Carteira atual do lojista</small>
                      </div>
                    </article>
                  </div>
                </section>

                <div class="metadata-card">
                  <div>
                    <span>Criado em</span>
                    <strong>{{ formatarData(pedidoDetalhe.created_at) }}</strong>
                  </div>
                  <div>
                    <span>Última modificação</span>
                    <strong>{{ formatarData(pedidoDetalhe.updated_at) }}</strong>
                  </div>
                  <div>
                    <span>Origem</span>
                    <strong>{{ formatarOrigem(pedidoDetalhe.enviado_por) }}</strong>
                  </div>
                </div>

                <div class="tab-actions">
                  <q-btn
                    flat
                    no-caps
                    label="Fechar"
                    class="secondary-btn"
                    :disable="salvando"
                    @click="fecharPedido"
                  />
                  <q-btn
                    unelevated
                    no-caps
                    type="submit"
                    icon="save"
                    label="Salvar alterações"
                    :loading="salvando"
                    class="save-btn"
                  />
                </div>
              </q-form>
            </q-tab-panel>

            <q-tab-panel name="acompanhamento" class="workspace-panel">
              <div class="tab-heading">
                <div>
                  <div class="section-kicker">Fluxo de produção</div>
                  <h3>Etapas do projeto</h3>
                  <p>O administrador pode alterar o status diretamente nesta linha de produção.</p>
                </div>

                <span
                  class="status-badge status-badge--large"
                  :class="{ 'status-badge--critical': Number(pedidoDetalhe.ordem_status) === 0 }"
                  :style="Number(pedidoDetalhe.ordem_status) === 0 ? undefined : statusStyle(pedidoDetalhe.cor)"
                >
                  <i :style="{ background: Number(pedidoDetalhe.ordem_status) === 0 ? '#fff' : (pedidoDetalhe.cor || '#ff7b00') }"></i>
                  {{ pedidoDetalhe.status || 'Sem status' }}
                </span>
              </div>

              <section class="current-stage-card">
                <div class="current-stage-card__icon">
                  <q-icon :name="pedidoDetalhe.ordem_status === 0 ? 'report_problem' : 'route'" size="23px" />
                </div>

                <div class="current-stage-card__copy">
                  <span>Status atual</span>
                  <strong>{{ pedidoDetalhe.status || 'Sem status' }}</strong>
                  <small>
                    {{
                      pedidoDetalhe.ordem_status === 0
                        ? 'Projeto fora do fluxo principal'
                        : `Etapa ${pedidoDetalhe.ordem_status || '—'} do fluxo`
                    }}
                  </small>
                </div>

                <div class="current-stage-card__date">
                  <span>Previsão</span>
                  <strong>
                    {{
                      pedidoDetalhe.data_previsao_pedido
                        ? formatarDataCurta(pedidoDetalhe.data_previsao_pedido)
                        : 'Não definida'
                    }}
                  </strong>
                </div>
              </section>

              <section class="flow-board">
                <div class="flow-board__head">
                  <div>
                    <strong>Linha de produção</strong>
                    <span>
                      Clique diretamente em uma etapa para alterar o status do projeto.
                    </span>
                  </div>

                  <div class="flow-progress-summary">
                    <span>Progresso atual</span>
                    <strong>{{ progressoPedido(pedidoDetalhe) }}%</strong>
                  </div>
                </div>

                <div
                  class="flow-overall-progress"
                  :class="{ 'flow-overall-progress--special': Number(pedidoDetalhe.ordem_status) === 0 }"
                >
                  <span
                    :style="{
                      width: `${progressoPedido(pedidoDetalhe)}%`
                    }"
                  ></span>
                </div>

                <div
                  v-if="statusFluxo.length"
                  class="status-flow"
                  :class="{
                    'status-flow--special-current':
                      Number(pedidoDetalhe.ordem_status) === 0
                  }"
                >
                  <div
                    v-for="(status, index) in statusFluxo"
                    :key="status.id"
                    class="status-flow__stage"
                    :class="{
                      'status-flow__stage--done': etapaConcluida(status),
                      'status-flow__stage--active': statusAtual(status),
                      'status-flow__stage--future': etapaFutura(status)
                    }"
                  >
                    <button
                      type="button"
                      class="status-flow__button"
                      :class="{ 'status-flow__button--current': statusAtual(status) }"
                      :disabled="statusAtual(status) || alterandoStatus"
                      :aria-label="
                        statusAtual(status)
                          ? `${status.descricao}, status atual`
                          : `Alterar status para ${status.descricao}`
                      "
                      @click="solicitarAlteracaoStatus(status)"
                    >
                      <span class="status-flow__step-label">
                        Etapa {{ status.ordem }}
                      </span>

                      <span
                        class="status-flow__dot"
                        :style="{
                          '--status-color': status.cor || 'var(--brand)'
                        }"
                      >
                        <span class="status-flow__dot-core">
                          <q-icon
                            :name="
                              statusAtual(status)
                                ? 'radio_button_checked'
                                : etapaConcluida(status)
                                  ? 'check'
                                  : 'radio_button_unchecked'
                            "
                            :size="statusAtual(status) ? '20px' : '16px'"
                          />
                        </span>
                      </span>

                      <strong>{{ status.descricao }}</strong>

                      <small v-if="statusAtual(status)">
                        Status atual
                      </small>
                      <small v-else>
                        Clique para definir
                      </small>
                    </button>

                    <span
                      v-if="index < statusFluxo.length - 1"
                      class="status-flow__connector"
                      :class="{
                        'status-flow__connector--done': etapaConcluida(status),
                        'status-flow__connector--moving': statusAtual(status)
                      }"
                      :style="{
                        '--connector-color': status.cor || 'var(--brand)'
                      }"
                    ></span>
                  </div>
                </div>

                <div v-else class="empty-state empty-state--compact">
                  <div class="empty-state__icon">
                    <q-icon name="route" size="26px" />
                  </div>
                  <strong>Nenhuma etapa de produção cadastrada</strong>
                </div>

                <div v-if="statusForaFluxo.length" class="special-statuses">
                  <div class="special-statuses__head">
                    <div>
                      <span class="special-statuses__eyebrow">Situações especiais</span>
                      <strong>Fora da linha principal</strong>
                    </div>

                    <small>
                      Recusas, cancelamentos e outros estados extraordinários.
                    </small>
                  </div>

                  <div class="special-statuses__list">
                    <button
                      v-for="status in statusForaFluxo"
                      :key="status.id"
                      type="button"
                      class="special-status-pill"
                      :class="{ 'special-status-pill--active': statusAtual(status) }"
                      :style="{
                        '--special-color': status.cor || '#d95050',
                        '--special-soft': corComAlpha(status.cor || '#d95050', '12')
                      }"
                      :disabled="statusAtual(status) || alterandoStatus"
                      @click="solicitarAlteracaoStatus(status)"
                    >
                      <span class="special-status-pill__icon">
                        <q-icon
                          :name="statusAtual(status) ? 'check_circle' : 'do_not_disturb_on'"
                          size="18px"
                        />
                      </span>

                      <span class="special-status-pill__copy">
                        <strong>{{ status.descricao }}</strong>
                        <small>
                          {{ statusAtual(status) ? 'Situação atual' : 'Aplicar ao projeto' }}
                        </small>
                      </span>

                      <q-icon
                        v-if="!statusAtual(status)"
                        name="arrow_forward"
                        size="16px"
                        class="special-status-pill__arrow"
                      />
                    </button>
                  </div>
                </div>
              </section>
            </q-tab-panel>

            <q-tab-panel name="itens" class="workspace-panel">
              <div class="tab-heading">
                <div>
                  <div class="section-kicker">Composição do projeto</div>
                  <h3>Itens importados</h3>
                  <p>Itens e componentes extraídos do XML original do Promob.</p>
                </div>
              </div>

              <div class="items-summary">
                <article>
                  <div class="items-summary__icon"><q-icon name="view_list" size="20px" /></div>
                  <div><span>Itens</span><strong>{{ itensPedido.length }}</strong></div>
                </article>
                <article>
                  <div class="items-summary__icon"><q-icon name="inventory" size="20px" /></div>
                  <div><span>Quantidade total</span><strong>{{ quantidadeTotalItens }}</strong></div>
                </article>
                <article>
                  <div class="items-summary__icon"><q-icon name="account_tree" size="20px" /></div>
                  <div><span>Componentes</span><strong>{{ quantidadeComponentes }}</strong></div>
                </article>
              </div>

              <q-input
                v-if="itensPedido.length"
                v-model="buscaItens"
                outlined
                dense
                clearable
                class="search-field items-search"
                placeholder="Pesquisar item ou componente..."
              >
                <template #prepend><q-icon name="search" size="18px" /></template>
              </q-input>

              <q-list
                v-if="itensFiltrados.length"
                class="items-accordion"
              >
                <q-expansion-item
                  v-for="(item, index) in itensFiltrados"
                  :key="item.id"
                  group="project-items"
                  expand-separator
                  switch-toggle-side
                  class="item-expansion"
                  header-class="item-expansion__header"
                  expand-icon-class="item-expansion__chevron"
                >
                  <template #header>
                    <q-item-section avatar>
                      <div class="item-expansion__number">
                        {{ String(index + 1).padStart(2, '0') }}
                      </div>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label class="item-expansion__title">
                        {{ item.descricao_item || 'Item sem descrição' }}
                      </q-item-label>

                      <q-item-label caption class="item-expansion__caption">
                        Item #{{ item.id }} ·
                        {{ normalizarComponentes(item.componentes).length }}
                        {{
                          normalizarComponentes(item.componentes).length === 1
                            ? 'componente'
                            : 'componentes'
                        }}
                      </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <span class="item-quantity">
                        {{ item.quantidade_item || 0 }} un.
                      </span>
                    </q-item-section>
                  </template>

                  <div class="item-expansion__body">
                    <div class="item-detail-grid">
                      <div>
                        <span>ID do item</span>
                        <strong>#{{ item.id }}</strong>
                      </div>

                      <div>
                        <span>Quantidade</span>
                        <strong>{{ item.quantidade_item || 0 }} unidade(s)</strong>
                      </div>

                      <div>
                        <span>Componentes</span>
                        <strong>{{ normalizarComponentes(item.componentes).length }}</strong>
                      </div>
                    </div>

                    <div
                      v-if="normalizarComponentes(item.componentes).length"
                      class="item-components-detail"
                    >
                      <div class="item-components-detail__head">
                        <q-icon name="account_tree" size="18px" />
                        <div>
                          <strong>Componentes do item</strong>
                          <span>Detalhes extraídos do XML do Promob.</span>
                        </div>
                      </div>

                      <div class="item-components-detail__list">
                        <div
                          v-for="(componente, cIndex) in normalizarComponentes(item.componentes)"
                          :key="`${item.id}-${cIndex}`"
                          class="item-component-row"
                        >
                          <span class="item-component-row__index">
                            {{ String(cIndex + 1).padStart(2, '0') }}
                          </span>

                          <q-icon name="extension" size="16px" />

                          <strong>{{ componente }}</strong>
                        </div>
                      </div>
                    </div>

                    <div v-else class="components-empty components-empty--expanded">
                      <q-icon name="info_outline" size="16px" />
                      Nenhum componente detalhado para este item.
                    </div>
                  </div>
                </q-expansion-item>
              </q-list>

              <div v-else class="empty-state">
                <div class="empty-state__icon"><q-icon name="view_list" size="28px" /></div>
                <strong>{{ buscaItens ? 'Nenhum item corresponde à pesquisa' : 'Nenhum item encontrado' }}</strong>
                <span>O projeto não possui itens importados ou a busca não encontrou correspondências.</span>
              </div>
            </q-tab-panel>

            <q-tab-panel name="xml" class="workspace-panel">
              <div class="tab-heading">
                <div>
                  <div class="section-kicker">Arquivo de origem</div>
                  <h3>XML do Promob</h3>
                  <p>Consulte as informações do arquivo original utilizado na importação.</p>
                </div>
              </div>

              <section v-if="pedidoDetalhe.xml" class="xml-card">
                <div class="xml-card__hero">
                  <div class="xml-file-icon"><q-icon name="code" size="27px" /></div>

                  <div class="xml-card__copy">
                    <span>Arquivo XML disponível</span>
                    <strong>projeto-{{ pedidoDetalhe.id }}.xml</strong>
                    <small>{{ formatarBytes(tamanhoXml) }} · arquivo original do projeto</small>
                  </div>

                  <div class="xml-card__actions">
                    <q-btn
                      flat
                      no-caps
                      icon="content_copy"
                      label="Copiar XML"
                      class="secondary-outline-btn"
                      @click="copiarXml"
                    />
                    <q-btn
                      unelevated
                      no-caps
                      icon="download"
                      label="Baixar XML"
                      class="primary-btn"
                      @click="baixarXml"
                    />
                  </div>
                </div>

                <div class="xml-security-note">
                  <q-icon name="info_outline" size="18px" />
                  <span>
                    O XML contém os dados originais utilizados no cadastro do projeto.
                    Evite alterar o conteúdo antes de armazenar uma cópia.
                  </span>
                </div>

                <div class="xml-preview-toggle">
                  <div>
                    <strong>Visualização técnica</strong>
                    <span>Exiba o conteúdo somente quando precisar inspecionar o arquivo.</span>
                  </div>
                  <q-toggle v-model="mostrarXml" color="orange" label="Exibir XML" />
                </div>

                <q-slide-transition>
                  <div v-show="mostrarXml" class="xml-preview">
                    <pre>{{ pedidoDetalhe.xml }}</pre>
                  </div>
                </q-slide-transition>
              </section>

              <div v-else class="empty-state xml-empty">
                <div class="empty-state__icon"><q-icon name="code_off" size="28px" /></div>
                <strong>XML não disponível</strong>
                <span>Este projeto não possui conteúdo XML armazenado.</span>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalImportar" persistent>
      <q-card class="import-dialog">
        <q-card-section class="import-dialog__head">
          <div class="import-dialog__identity">
            <div class="import-dialog__icon"><q-icon name="upload_file" size="23px" /></div>
            <div>
              <div class="section-kicker">Novo projeto</div>
              <h3>Importar XML do Promob</h3>
              <p>Selecione o lojista responsável e adicione um ou mais arquivos XML.</p>
            </div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="importando"
            @click="modalImportar = false"
          />
        </q-card-section>

        <q-card-section class="import-dialog__body">
          <div class="import-step">
            <div class="import-step__number">01</div>
            <div class="import-step__content">
              <strong>Lojista responsável</strong>
              <span>O projeto importado ficará vinculado ao lojista selecionado.</span>

              <q-select
                v-model="lojistaImportacao"
                :options="opcoesLojistas"
                emit-value
                map-options
                use-input
                input-debounce="0"
                outlined
                dense
                color="orange"
                class="premium-field import-field"
                placeholder="Selecione o lojista"
                @filter="filtrarLojistasSelect"
              >
                <template #prepend><q-icon name="storefront" size="18px" /></template>
              </q-select>

              <div v-if="lojistaImportacao" class="selected-store-note">
                <q-icon name="badge" size="17px" />
                <span>
                  Representante:
                  <strong>{{ representanteDoLojistaImportacao }}</strong>
                </span>
              </div>
            </div>
          </div>

          <div class="import-step">
            <div class="import-step__number">02</div>
            <div class="import-step__content">
              <strong>Arquivos XML</strong>
              <span>Você pode selecionar vários projetos em uma única importação.</span>

              <q-file
                v-model="arquivosXml"
                multiple
                outlined
                use-chips
                counter
                color="orange"
                accept=".xml,text/xml,application/xml"
                class="xml-uploader"
                label="Selecionar arquivos XML"
              >
                <template #prepend><q-icon name="description" size="20px" /></template>
                <template #append><q-icon name="attach_file" size="20px" /></template>
              </q-file>
            </div>
          </div>

          <div class="import-info">
            <q-icon name="info_outline" size="19px" />
            <div>
              <strong>O que acontece na importação?</strong>
              <span>
                O backend cria ou complementa o cliente do XML, vincula o projeto ao lojista,
                aplica o status padrão e extrai os itens e componentes.
              </span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="import-dialog__actions">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            class="secondary-btn"
            :disable="importando"
            @click="modalImportar = false"
          />
          <q-btn
            unelevated
            no-caps
            icon="upload_file"
            :label="quantidadeArquivosXml > 1 ? `Importar ${quantidadeArquivosXml} arquivos` : 'Importar projeto'"
            :loading="importando"
            class="save-btn"
            @click="importarXml"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalConfirmarStatus" persistent>
      <q-card class="confirm-dialog">
        <q-card-section class="confirm-dialog__head">
          <div
            class="confirm-dialog__icon"
            :style="{
              color: statusDestino?.cor || '#ff7b00',
              background: corComAlpha(statusDestino?.cor, '12')
            }"
          >
            <q-icon name="swap_horiz" size="22px" />
          </div>

          <div>
            <div class="section-kicker">Alteração de fluxo</div>
            <h3>Confirmar novo status?</h3>
          </div>
        </q-card-section>

        <q-card-section class="confirm-dialog__body">
          <div class="status-transfer">
            <div>
              <span>Atual</span>
              <strong>{{ pedidoDetalhe.status || 'Sem status' }}</strong>
            </div>

            <q-icon name="arrow_forward" size="20px" />

            <div>
              <span>Novo</span>
              <strong>{{ statusDestino?.descricao || '—' }}</strong>
            </div>
          </div>

          <div class="confirm-note">
            <q-icon name="notifications_active" size="18px" />
            <span>
              A alteração será salva no projeto e poderá disparar as notificações
              configuradas para os envolvidos.
            </span>
          </div>
        </q-card-section>

        <q-card-actions class="confirm-dialog__actions">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            class="secondary-btn"
            :disable="alterandoStatus"
            @click="modalConfirmarStatus = false"
          />
          <q-btn
            unelevated
            no-caps
            icon="check"
            label="Confirmar alteração"
            :loading="alterandoStatus"
            class="save-btn"
            @click="confirmarAlteracaoStatus"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalExclusao" persistent>
      <q-card class="confirm-dialog">
        <q-card-section class="confirm-dialog__head">
          <div class="confirm-dialog__icon confirm-dialog__icon--danger">
            <q-icon name="delete_outline" size="22px" />
          </div>

          <div>
            <div class="section-kicker section-kicker--danger">Ação irreversível</div>
            <h3>Excluir projeto?</h3>
          </div>
        </q-card-section>

        <q-card-section class="confirm-dialog__body">
          <p>
            O projeto
            <strong>
              #{{ pedidoParaExcluir?.id }} ·
              {{ pedidoParaExcluir?.nome_projeto || 'Projeto sem nome' }}
            </strong>
            será removido.
          </p>

          <div class="delete-project-summary">
            <div>
              <span>Cliente</span>
              <strong>{{ pedidoParaExcluir?.cliente || '—' }}</strong>
            </div>
            <div>
              <span>Lojista</span>
              <strong>{{ pedidoParaExcluir?.lojista || '—' }}</strong>
            </div>
            <div>
              <span>Valor</span>
              <strong>{{ formatarMoeda(pedidoParaExcluir?.valor) }}</strong>
            </div>
          </div>

          <div class="confirm-note confirm-note--warning">
            <q-icon name="warning_amber" size="18px" />
            <span>
              Itens e componentes vinculados também serão removidos pelo backend.
              Essa operação não pode ser desfeita.
            </span>
          </div>
        </q-card-section>

        <q-card-actions class="confirm-dialog__actions">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            class="secondary-btn"
            :disable="excluindo"
            @click="modalExclusao = false"
          />
          <q-btn
            unelevated
            no-caps
            icon="delete_outline"
            label="Excluir projeto"
            :loading="excluindo"
            class="danger-btn"
            @click="excluirPedido"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>


<script setup>
defineOptions({
  name: 'PedidosAdminPage'
})

import {
  ref,
  computed,
  onMounted,
  watch
} from 'vue'

import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const formPedido = ref(null)

const loading = ref(true)
const carregandoDetalhe = ref(false)
const salvando = ref(false)
const excluindo = ref(false)
const importando = ref(false)
const alterandoStatus = ref(false)

const pedidos = ref([])
const listaStatus = ref([])
const listaLojistas = ref([])
const listaClientes = ref([])

const busca = ref('')
const filtroStatus = ref(null)
const filtroRepresentante = ref(null)
const filtroLojista = ref(null)
const filtroCliente = ref(null)
const dataInicio = ref('')
const dataFim = ref('')
const mostrarFiltros = ref(false)

const modalPedido = ref(false)
const modalImportar = ref(false)
const modalExclusao = ref(false)
const modalConfirmarStatus = ref(false)

const pedidoResumoSelecionado = ref(null)
const pedidoDetalhe = ref({})
const pedidoEditando = ref({})
const pedidoParaExcluir = ref(null)
const statusDestino = ref(null)

const tabPedido = ref('acompanhamento')
const buscaItens = ref('')
const mostrarXml = ref(false)

const lojistaImportacao = ref(null)
const arquivosXml = ref([])

const opcoesClientes = ref([])
const opcoesLojistas = ref([])

const paginacao = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 10
})

const headers = computed(() => ({
  Authorization: `Bearer ${authStore.token}`
}))

const colunasPedidos = [
  {
    name: 'id',
    field: 'id',
    label: 'ID',
    align: 'left',
    sortable: true,
    style: 'width: 70px'
  },
  {
    name: 'projeto',
    field: 'nome_projeto',
    label: 'Projeto',
    align: 'left',
    sortable: true
  },
  {
    name: 'rede',
    field: 'lojista',
    label: 'Rede comercial',
    align: 'left',
    sortable: true
  },
  {
    name: 'cliente',
    field: 'cliente',
    label: 'Cliente',
    align: 'left',
    sortable: true
  },
  {
    name: 'status',
    field: 'status',
    label: 'Status',
    align: 'left',
    sortable: true
  },
  {
    name: 'progresso',
    field: 'ordem_status',
    label: 'Progresso',
    align: 'left',
    sortable: true,
    style: 'min-width: 150px'
  },
  {
    name: 'financeiro',
    field: 'valor',
    label: 'Valor',
    align: 'left',
    sortable: true
  },
  {
    name: 'datas',
    field: 'data_pedido',
    label: 'Pedido / Previsão',
    align: 'left',
    sortable: true
  },
  {
    name: 'acoes',
    field: 'acoes',
    label: '',
    align: 'right',
    style: 'width: 96px'
  }
]

const statusFluxo = computed(() =>
  [...listaStatus.value]
    .filter(status => Number(status.ordem) > 0)
    .sort((a, b) => Number(a.ordem) - Number(b.ordem))
)

const statusForaFluxo = computed(() =>
  [...listaStatus.value]
    .filter(status => Number(status.ordem) === 0)
    .sort((a, b) =>
      String(a.descricao || '').localeCompare(
        String(b.descricao || ''),
        'pt-BR'
      )
    )
)

const maiorOrdemStatus = computed(() => {
  const ordens = statusFluxo.value
    .map(status => Number(status.ordem))
    .filter(Number.isFinite)

  return ordens.length
    ? Math.max(...ordens)
    : 0
})

const volumeTotal = computed(() =>
  pedidos.value.reduce(
    (total, pedido) =>
      total + Number(pedido.valor || 0),
    0
  )
)

const totalEmAndamento = computed(() =>
  pedidos.value.filter(pedido => {
    const ordem = Number(pedido.ordem_status)

    return (
      ordem > 0 &&
      ordem < maiorOrdemStatus.value
    )
  }).length
)

const totalFinalizados = computed(() =>
  maiorOrdemStatus.value > 0
    ? pedidos.value.filter(pedido =>
        Number(pedido.ordem_status) === maiorOrdemStatus.value
      ).length
    : 0
)

const opcoesStatusFiltro = computed(() =>
  [...listaStatus.value]
    .sort((a, b) =>
      Number(a.ordem ?? 999) -
      Number(b.ordem ?? 999)
    )
    .map(status => ({
      label: status.descricao,
      value: status.id
    }))
)

const opcoesRepresentantesFiltro = computed(() => {
  const mapa = new Map()

  pedidos.value.forEach(pedido => {
    if (
      pedido.id_representante &&
      !mapa.has(String(pedido.id_representante))
    ) {
      mapa.set(
        String(pedido.id_representante),
        {
          label:
            pedido.representante ||
            `Representante #${pedido.id_representante}`,
          value: pedido.id_representante
        }
      )
    }
  })

  return [...mapa.values()].sort(
    (a, b) =>
      a.label.localeCompare(b.label, 'pt-BR')
  )
})

const opcoesLojistasFiltro = computed(() =>
  [...listaLojistas.value]
    .map(lojista => ({
      label: lojista.nome,
      value: lojista.id
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, 'pt-BR')
    )
)

const opcoesClientesFiltro = computed(() =>
  [...listaClientes.value]
    .map(cliente => ({
      label: cliente.nome,
      value: cliente.id
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, 'pt-BR')
    )
)

const quantidadeFiltrosAvancados = computed(() =>
  [
    filtroRepresentante.value,
    filtroLojista.value,
    filtroCliente.value,
    dataInicio.value,
    dataFim.value
  ].filter(valor =>
    valor !== null &&
    valor !== undefined &&
    valor !== ''
  ).length
)

const temFiltrosAvancados = computed(() =>
  quantidadeFiltrosAvancados.value > 0
)

const temFiltrosAtivos = computed(() =>
  Boolean(
    busca.value ||
    filtroStatus.value ||
    temFiltrosAvancados.value
  )
)

const pedidosFiltrados = computed(() => {
  const termo =
    String(busca.value || '')
      .trim()
      .toLowerCase()

  return pedidos.value.filter(pedido => {
    if (
      filtroStatus.value &&
      String(pedido.id_status) !==
      String(filtroStatus.value)
    ) {
      return false
    }

    if (
      filtroRepresentante.value &&
      String(pedido.id_representante) !==
      String(filtroRepresentante.value)
    ) {
      return false
    }

    if (
      filtroLojista.value &&
      String(pedido.id_lojista) !==
      String(filtroLojista.value)
    ) {
      return false
    }

    if (
      filtroCliente.value &&
      String(pedido.id_cliente) !==
      String(filtroCliente.value)
    ) {
      return false
    }

    const dataPedido =
      pedido.data_pedido
        ? String(pedido.data_pedido).slice(0, 10)
        : ''

    if (
      dataInicio.value &&
      (
        !dataPedido ||
        dataPedido < dataInicio.value
      )
    ) {
      return false
    }

    if (
      dataFim.value &&
      (
        !dataPedido ||
        dataPedido > dataFim.value
      )
    ) {
      return false
    }

    if (!termo) {
      return true
    }

    return [
      pedido.id,
      pedido.nome_projeto,
      pedido.cliente,
      pedido.lojista,
      pedido.representante,
      pedido.status,
      pedido.valor
    ].some(valor =>
      String(valor ?? '')
        .toLowerCase()
        .includes(termo)
    )
  })
})

const volumeFiltrado = computed(() =>
  pedidosFiltrados.value.reduce(
    (total, pedido) =>
      total + Number(pedido.valor || 0),
    0
  )
)

const totalFiltradoEmAndamento = computed(() =>
  pedidosFiltrados.value.filter(pedido => {
    const ordem = Number(pedido.ordem_status)

    return (
      ordem > 0 &&
      ordem < maiorOrdemStatus.value
    )
  }).length
)

const totalFiltradoFinalizados = computed(() =>
  maiorOrdemStatus.value > 0
    ? pedidosFiltrados.value.filter(pedido =>
        Number(pedido.ordem_status) === maiorOrdemStatus.value
      ).length
    : 0
)

const numeroDePaginas = computed(() => {
  const limite = Number(paginacao.value.rowsPerPage)

  return limite === 0
    ? 1
    : Math.ceil(
        pedidosFiltrados.value.length /
        limite
      ) || 1
})

const pedidosPaginadosMobile = computed(() => {
  const limite = Number(paginacao.value.rowsPerPage)

  if (!limite) {
    return pedidosFiltrados.value
  }

  const inicio =
    (Number(paginacao.value.page) - 1) *
    limite

  return pedidosFiltrados.value.slice(
    inicio,
    inicio + limite
  )
})

const itensPedido = computed(() =>
  Array.isArray(pedidoDetalhe.value.itens)
    ? pedidoDetalhe.value.itens
    : []
)

const tabsPedido = computed(() => [
  {
    name: 'acompanhamento',
    icon: 'route',
    label: 'Acompanhamento',
    description: 'Fluxo e status do projeto',
    count: null
  },
  {
    name: 'dados',
    icon: 'dashboard_customize',
    label: 'Dados do projeto',
    description: 'Cadastro e envolvidos',
    count: null
  },
  {
    name: 'itens',
    icon: 'view_list',
    label: 'Itens',
    description: 'Itens e componentes',
    count: itensPedido.value.length
  },
  {
    name: 'xml',
    icon: 'code',
    label: 'XML',
    description: 'Arquivo de origem',
    count: null
  }
])

const itensFiltrados = computed(() => {
  const termo =
    String(buscaItens.value || '')
      .trim()
      .toLowerCase()

  if (!termo) {
    return itensPedido.value
  }

  return itensPedido.value.filter(item => {
    const componentes =
      normalizarComponentes(item.componentes)

    return [
      item.id,
      item.descricao_item,
      item.quantidade_item,
      ...componentes
    ].some(valor =>
      String(valor ?? '')
        .toLowerCase()
        .includes(termo)
    )
  })
})

const quantidadeTotalItens = computed(() =>
  itensPedido.value.reduce(
    (total, item) =>
      total + Number(item.quantidade_item || 0),
    0
  )
)

const quantidadeComponentes = computed(() =>
  itensPedido.value.reduce(
    (total, item) =>
      total +
      normalizarComponentes(item.componentes).length,
    0
  )
)

const tamanhoXml = computed(() => {
  const xml = String(pedidoDetalhe.value.xml || '')

  if (!xml) {
    return 0
  }

  try {
    return new Blob([xml]).size
  } catch {
    return xml.length
  }
})

const quantidadeArquivosXml = computed(() =>
  Array.isArray(arquivosXml.value)
    ? arquivosXml.value.length
    : arquivosXml.value
      ? 1
      : 0
)

const lojistaSelecionado = computed(() =>
  listaLojistas.value.find(lojista =>
    String(lojista.id) ===
    String(pedidoEditando.value.id_lojista)
  ) || null
)

const clienteSelecionado = computed(() =>
  listaClientes.value.find(cliente =>
    String(cliente.id) ===
    String(pedidoEditando.value.id_cliente)
  ) || null
)

const nomeClienteSelecionado = computed(() =>
  clienteSelecionado.value?.nome ||
  pedidoDetalhe.value.cliente ||
  'Cliente não informado'
)

const nomeLojistaSelecionado = computed(() =>
  lojistaSelecionado.value?.nome ||
  pedidoDetalhe.value.lojista ||
  'Lojista não informado'
)

const nomeRepresentanteSelecionado = computed(() =>
  lojistaSelecionado.value?.nome_representante ||
  pedidoDetalhe.value.representante ||
  'Sem representante'
)

const representanteDoLojistaImportacao = computed(() => {
  const lojista =
    listaLojistas.value.find(item =>
      String(item.id) ===
      String(lojistaImportacao.value)
    )

  return (
    lojista?.nome_representante ||
    'Sem representante'
  )
})

watch(
  [
    () => busca.value,
    () => filtroStatus.value,
    () => filtroRepresentante.value,
    () => filtroLojista.value,
    () => filtroCliente.value,
    () => dataInicio.value,
    () => dataFim.value
  ],
  () => {
    paginacao.value.page = 1
  }
)

watch(
  () => paginacao.value.rowsPerPage,
  () => {
    paginacao.value.page = 1
  }
)

async function carregarBase() {
  loading.value = true

  try {
    const [
      pedidosResponse,
      statusResponse,
      lojistasResponse,
      clientesResponse
    ] = await Promise.all([
      api.get('/pedidos', {
        headers: headers.value
      }),

      api.get('/status', {
        headers: headers.value
      }),

      api.get('/lojistas', {
        headers: headers.value
      }),

      api.get('/clientes', {
        headers: headers.value
      })
    ])

    pedidos.value =
      pedidosResponse.data.data ||
      pedidosResponse.data ||
      []

    listaStatus.value =
      statusResponse.data.data ||
      statusResponse.data ||
      []

    listaLojistas.value =
      lojistasResponse.data.data ||
      lojistasResponse.data ||
      []

    listaClientes.value =
      (
        clientesResponse.data.data ||
        clientesResponse.data ||
        []
      ).map(cliente => ({
        ...cliente,
        id:
          cliente.id ??
          cliente.cliente_id
      }))

    resetarOpcoesSelect()
  } catch (error) {
    console.error(
      'Erro ao carregar projetos:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Erro ao carregar os projetos.',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

async function carregarPedidos({
  silencioso = true
} = {}) {
  if (!silencioso) {
    loading.value = true
  }

  try {
    const response =
      await api.get('/pedidos', {
        headers: headers.value
      })

    pedidos.value =
      response.data.data ||
      response.data ||
      []
  } finally {
    if (!silencioso) {
      loading.value = false
    }
  }
}

function handleRowClick(evt, row) {
  abrirPedido(row)
}

async function abrirPedido(pedido) {
  pedidoResumoSelecionado.value =
    JSON.parse(JSON.stringify(pedido))

  pedidoDetalhe.value = {
    ...pedido
  }

  pedidoEditando.value =
    criarFormularioPedido(pedido)

  tabPedido.value = 'acompanhamento'
  buscaItens.value = ''
  mostrarXml.value = false
  modalPedido.value = true

  await recarregarPedidoAtual()
}

async function recarregarPedidoAtual() {
  const id =
    pedidoDetalhe.value.id ||
    pedidoResumoSelecionado.value?.id

  if (!id) {
    return
  }

  carregandoDetalhe.value = true

  try {
    const response =
      await api.get(
        `/pedidos/${id}`,
        {
          headers: headers.value
        }
      )

    const detalhe =
      response.data.data ||
      response.data ||
      {}

    pedidoDetalhe.value = {
      ...pedidoResumoSelecionado.value,
      ...detalhe
    }

    pedidoEditando.value =
      criarFormularioPedido(
        pedidoDetalhe.value
      )
  } catch (error) {
    console.error(
      'Erro ao carregar o projeto:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Erro ao carregar os detalhes do projeto.',
      position: 'top-right'
    })
  } finally {
    carregandoDetalhe.value = false
  }
}

function criarFormularioPedido(pedido) {
  return {
    nome_projeto:
      pedido.nome_projeto || '',

    valor:
      pedido.valor === null ||
      pedido.valor === undefined
        ? null
        : Number(pedido.valor),

    id_cliente:
      pedido.id_cliente || null,

    id_lojista:
      pedido.id_lojista || null,

    data_previsao_pedido:
      normalizarDataInput(
        pedido.data_previsao_pedido
      )
  }
}

function fecharPedido() {
  if (
    salvando.value ||
    alterandoStatus.value
  ) {
    return
  }

  modalPedido.value = false
}

async function salvarResumoPedido() {
  const valido =
    await formPedido.value.validate()

  if (!valido) {
    $q.notify({
      type: 'warning',
      message:
        'Revise os campos do projeto antes de salvar.',
      position: 'top-right'
    })

    return
  }

  salvando.value = true

  try {
    await api.patch(
      `/pedidos/${pedidoDetalhe.value.id}`,
      {
        nome_projeto:
          String(
            pedidoEditando.value.nome_projeto ||
            ''
          ).trim(),

        valor:
          pedidoEditando.value.valor === '' ||
          pedidoEditando.value.valor === null
            ? null
            : Number(
                pedidoEditando.value.valor
              ),

        id_cliente:
          pedidoEditando.value.id_cliente,

        id_lojista:
          pedidoEditando.value.id_lojista,

        data_previsao_pedido:
          pedidoEditando.value
            .data_previsao_pedido ||
          null
      },
      {
        headers: headers.value
      }
    )

    $q.notify({
      type: 'positive',
      message:
        'Projeto atualizado com sucesso.',
      icon: 'check_circle',
      position: 'top-right'
    })

    await Promise.all([
      carregarPedidos(),
      recarregarPedidoAtual()
    ])
  } catch (error) {
    console.error(
      'Erro ao atualizar projeto:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Erro ao atualizar o projeto.',
      position: 'top-right'
    })
  } finally {
    salvando.value = false
  }
}

function solicitarAlteracaoStatus(status) {
  if (!status?.id) {
    return
  }

  statusDestino.value =
    JSON.parse(JSON.stringify(status))

  modalConfirmarStatus.value = true
}

async function confirmarAlteracaoStatus() {
  if (
    !pedidoDetalhe.value.id ||
    !statusDestino.value?.id
  ) {
    return
  }

  alterandoStatus.value = true

  try {
    await api.patch(
      `/pedidos/${pedidoDetalhe.value.id}`,
      {
        id_status:
          statusDestino.value.id
      },
      {
        headers: headers.value
      }
    )

    $q.notify({
      type: 'positive',
      message:
        `Status alterado para “${statusDestino.value.descricao}”.`,
      icon: 'swap_horiz',
      position: 'top-right'
    })

    modalConfirmarStatus.value = false
    statusDestino.value = null

    await Promise.all([
      carregarPedidos(),
      recarregarPedidoAtual()
    ])
  } catch (error) {
    console.error(
      'Erro ao alterar status:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Erro ao alterar o status do projeto.',
      position: 'top-right'
    })
  } finally {
    alterandoStatus.value = false
  }
}

function statusAtual(status) {
  return (
    String(status?.id) ===
    String(pedidoDetalhe.value.id_status)
  )
}

function etapaConcluida(status) {
  const atual =
    Number(pedidoDetalhe.value.ordem_status)

  const ordem =
    Number(status?.ordem)

  return (
    atual > 0 &&
    ordem > 0 &&
    ordem < atual
  )
}

function etapaFutura(status) {
  const atual =
    Number(pedidoDetalhe.value.ordem_status)

  const ordem =
    Number(status?.ordem)

  return (
    atual > 0 &&
    ordem > atual
  )
}

function abrirImportacao() {
  lojistaImportacao.value = null
  arquivosXml.value = []
  resetarOpcoesSelect()
  modalImportar.value = true
}

async function importarXml() {
  if (!lojistaImportacao.value) {
    $q.notify({
      type: 'warning',
      message:
        'Selecione o lojista responsável.',
      position: 'top-right'
    })

    return
  }

  const arquivos =
    Array.isArray(arquivosXml.value)
      ? arquivosXml.value
      : arquivosXml.value
        ? [arquivosXml.value]
        : []

  if (!arquivos.length) {
    $q.notify({
      type: 'warning',
      message:
        'Selecione pelo menos um arquivo XML.',
      position: 'top-right'
    })

    return
  }

  importando.value = true

  try {
    const formData = new FormData()

    arquivos.forEach(arquivo => {
      formData.append(
        'xml',
        arquivo,
        arquivo.name
      )
    })

    formData.append(
      'id_lojista',
      lojistaImportacao.value
    )

    const response =
      await api.post(
        '/importaxml',
        formData,
        {
          headers: headers.value
        }
      )

    const processados =
      response.data?.processados ??
      arquivos.length

    const falhas =
      response.data?.falhas ??
      0

    if (falhas > 0) {
      $q.notify({
        type: 'warning',
        message:
          `${processados} projeto(s) importado(s) e ${falhas} arquivo(s) com falha.`,
        position: 'top-right',
        timeout: 5000
      })
    } else {
      $q.notify({
        type: 'positive',
        message:
          processados === 1
            ? 'Projeto importado com sucesso.'
            : `${processados} projetos importados com sucesso.`,
        icon: 'check_circle',
        position: 'top-right'
      })
    }

    modalImportar.value = false
    arquivosXml.value = []
    lojistaImportacao.value = null

    await carregarPedidos({
      silencioso: false
    })
  } catch (error) {
    console.error(
      'Erro ao importar XML:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Erro ao importar o XML.',
      position: 'top-right',
      timeout: 5000
    })
  } finally {
    importando.value = false
  }
}

function confirmarExclusao(pedido) {
  if (!pedido?.id) {
    return
  }

  pedidoParaExcluir.value =
    JSON.parse(JSON.stringify(pedido))

  modalExclusao.value = true
}

async function excluirPedido() {
  if (!pedidoParaExcluir.value?.id) {
    return
  }

  excluindo.value = true

  try {
    const id =
      pedidoParaExcluir.value.id

    await api.delete(
      `/pedidos/${id}`,
      {
        headers: headers.value
      }
    )

    $q.notify({
      type: 'positive',
      message:
        'Projeto excluído com sucesso.',
      icon: 'check_circle',
      position: 'top-right'
    })

    modalExclusao.value = false

    if (
      String(pedidoDetalhe.value.id) ===
      String(id)
    ) {
      modalPedido.value = false
    }

    pedidoParaExcluir.value = null

    await carregarPedidos({
      silencioso: false
    })
  } catch (error) {
    console.error(
      'Erro ao excluir projeto:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Erro ao excluir o projeto.',
      position: 'top-right'
    })
  } finally {
    excluindo.value = false
  }
}

function baixarXml() {
  const xml =
    pedidoDetalhe.value.xml

  if (!xml) {
    return
  }

  const blob =
    new Blob(
      [xml],
      {
        type: 'application/xml;charset=utf-8'
      }
    )

  const url =
    URL.createObjectURL(blob)

  const link =
    document.createElement('a')

  link.href = url
  link.download =
    `projeto-${pedidoDetalhe.value.id || 'artezza'}.xml`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

async function copiarXml() {
  const xml =
    String(pedidoDetalhe.value.xml || '')

  if (!xml) {
    return
  }

  try {
    await navigator.clipboard.writeText(xml)

    $q.notify({
      type: 'positive',
      message: 'XML copiado.',
      icon: 'content_copy',
      position: 'top-right'
    })
  } catch {
    $q.notify({
      type: 'warning',
      message:
        'Não foi possível copiar o XML automaticamente.',
      position: 'top-right'
    })
  }
}

function limparFiltros() {
  busca.value = ''
  filtroStatus.value = null
  filtroRepresentante.value = null
  filtroLojista.value = null
  filtroCliente.value = null
  dataInicio.value = ''
  dataFim.value = ''
}

function resetarOpcoesSelect() {
  opcoesClientes.value =
    listaClientes.value
      .map(cliente => ({
        label: cliente.nome,
        value: cliente.id
      }))
      .sort((a, b) =>
        a.label.localeCompare(
          b.label,
          'pt-BR'
        )
      )

  opcoesLojistas.value =
    listaLojistas.value
      .map(lojista => ({
        label:
          lojista.nome_representante
            ? `${lojista.nome} · ${lojista.nome_representante}`
            : lojista.nome,

        value: lojista.id
      }))
      .sort((a, b) =>
        a.label.localeCompare(
          b.label,
          'pt-BR'
        )
      )
}

function filtrarClientesSelect(
  val,
  update
) {
  update(() => {
    const termo =
      String(val || '')
        .trim()
        .toLowerCase()

    const base =
      listaClientes.value

    const filtrados =
      termo
        ? base.filter(cliente =>
            [
              cliente.nome,
              cliente.email,
              cliente.cpf_cnpj,
              cliente.id
            ].some(valor =>
              String(valor ?? '')
                .toLowerCase()
                .includes(termo)
            )
          )
        : base

    opcoesClientes.value =
      filtrados
        .map(cliente => ({
          label: cliente.nome,
          value: cliente.id
        }))
        .sort((a, b) =>
          a.label.localeCompare(
            b.label,
            'pt-BR'
          )
        )
  })
}

function filtrarLojistasSelect(
  val,
  update
) {
  update(() => {
    const termo =
      String(val || '')
        .trim()
        .toLowerCase()

    const base =
      listaLojistas.value

    const filtrados =
      termo
        ? base.filter(lojista =>
            [
              lojista.nome,
              lojista.email,
              lojista.nome_representante,
              lojista.id
            ].some(valor =>
              String(valor ?? '')
                .toLowerCase()
                .includes(termo)
            )
          )
        : base

    opcoesLojistas.value =
      filtrados
        .map(lojista => ({
          label:
            lojista.nome_representante
              ? `${lojista.nome} · ${lojista.nome_representante}`
              : lojista.nome,

          value: lojista.id
        }))
        .sort((a, b) =>
          a.label.localeCompare(
            b.label,
            'pt-BR'
          )
        )
  })
}

function normalizarComponentes(componentes) {
  if (Array.isArray(componentes)) {
    return componentes.filter(Boolean)
  }

  if (
    componentes === null ||
    componentes === undefined ||
    componentes === ''
  ) {
    return []
  }

  if (typeof componentes === 'string') {
    try {
      const parseado =
        JSON.parse(componentes)

      if (Array.isArray(parseado)) {
        return parseado.filter(Boolean)
      }
    } catch {
      return [componentes]
    }
  }

  return []
}

function iniciais(nome) {
  const partes =
    String(nome || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)

  if (!partes.length) {
    return 'C'
  }

  if (partes.length === 1) {
    return partes[0]
      .charAt(0)
      .toUpperCase()
  }

  return (
    partes[0].charAt(0) +
    partes[partes.length - 1].charAt(0)
  ).toUpperCase()
}

function normalizarDataInput(data) {
  if (!data) {
    return ''
  }

  return String(data).slice(0, 10)
}

function formatarDataInputVisual(dataISO) {
  if (!dataISO) {
    return ''
  }

  const valor = String(dataISO).slice(0, 10)
  const [ano, mes, dia] = valor.split('-')

  if (!ano || !mes || !dia) {
    return valor
  }

  return `${dia}/${mes}/${ano}`
}

function posicaoEtapa(pedido) {
  if (!pedido || Number(pedido.ordem_status) === 0) {
    return 0
  }

  const indexPorId = statusFluxo.value.findIndex(
    status =>
      pedido.id_status !== null &&
      pedido.id_status !== undefined &&
      String(status.id) === String(pedido.id_status)
  )

  if (indexPorId >= 0) {
    return indexPorId + 1
  }

  const indexPorOrdem = statusFluxo.value.findIndex(
    status =>
      Number(status.ordem) === Number(pedido.ordem_status)
  )

  return indexPorOrdem >= 0
    ? indexPorOrdem + 1
    : 0
}

function progressoPedido(pedido) {
  if (!pedido || Number(pedido.ordem_status) === 0) {
    return 0
  }

  const total = statusFluxo.value.length

  if (!total) {
    return 0
  }

  const posicao = posicaoEtapa(pedido)

  if (!posicao) {
    return 0
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round((posicao / total) * 100)
    )
  )
}

function formatarDataCurta(dataISO) {
  if (!dataISO) {
    return 'Não definida'
  }

  const data =
    new Date(
      `${String(dataISO).slice(0, 10)}T12:00:00`
    )

  if (Number.isNaN(data.getTime())) {
    return 'Não definida'
  }

  return data.toLocaleDateString(
    'pt-BR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  )
}

function formatarData(dataISO) {
  if (!dataISO) {
    return 'Não informado'
  }

  const data =
    new Date(dataISO)

  if (Number.isNaN(data.getTime())) {
    return 'Não informado'
  }

  return data.toLocaleString(
    'pt-BR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  )
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
  )
}

function formatarMoedaCompacta(valor) {
  const numero =
    Number(valor || 0)

  if (Math.abs(numero) >= 1000000) {
    return (
      'R$ ' +
      (numero / 1000000)
        .toLocaleString(
          'pt-BR',
          {
            maximumFractionDigits: 1
          }
        ) +
      ' mi'
    )
  }

  if (Math.abs(numero) >= 1000) {
    return (
      'R$ ' +
      (numero / 1000)
        .toLocaleString(
          'pt-BR',
          {
            maximumFractionDigits: 1
          }
        ) +
      ' mil'
    )
  }

  return formatarMoeda(numero)
}

function formatarOrigem(tipo) {
  const mapa = {
    admin: 'Administrador',
    representante: 'Representante',
    lojista: 'Lojista',
    cliente: 'Cliente'
  }

  return (
    mapa[String(tipo || '').toLowerCase()] ||
    tipo ||
    'Não informado'
  )
}

function corComAlpha(
  cor,
  alpha = '18'
) {
  const hex =
    /^#[0-9a-f]{6}$/i.test(
      String(cor || '')
    )
      ? String(cor)
      : '#ff7b00'

  return `${hex}${alpha}`
}

function statusStyle(cor) {
  const base =
    /^#[0-9a-f]{6}$/i.test(
      String(cor || '')
    )
      ? String(cor)
      : '#ff7b00'

  return {
    color: base,
    borderColor:
      corComAlpha(base, '35'),
    background:
      corComAlpha(base, '10')
  }
}

function formatarBytes(bytes) {
  const numero =
    Number(bytes || 0)

  if (numero < 1024) {
    return `${numero} B`
  }

  if (numero < 1024 * 1024) {
    return `${(numero / 1024).toFixed(1)} KB`
  }

  return `${(numero / (1024 * 1024)).toFixed(1)} MB`
}

onMounted(carregarBase)
</script>


<style scoped>
.pedidos-page {
  container-type: inline-size;
  padding: 28px 28px 52px;
  color: var(--text-base);
}

.panel {
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-soft);
}

/* HERO */
.page-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.page-hero__copy {
  min-width: 0;
}

.eyebrow,
.section-kicker {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--brand);
  font-size: 10px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: .11em;
  text-transform: uppercase;
}

.eyebrow__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 0 4px var(--brand-soft);
}

.page-hero h1 {
  margin: 10px 0 8px;
  color: var(--text-strong);
  font-size: clamp(28px, 3vw, 39px);
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -.04em;
}

.page-hero h1 span {
  color: var(--brand);
}

.page-hero p {
  max-width: 760px;
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.hero-summary {
  display: flex;
  align-items: stretch;
  flex: 0 0 auto;
  min-width: 560px;
  padding: 14px 16px;
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-left: 3px solid var(--brand);
  border-radius: 16px;
  box-shadow: var(--shadow-soft);
}

.hero-summary__item {
  min-width: 105px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-summary__item span {
  color: var(--text-muted);
  font-size: 7.7px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.hero-summary__item strong {
  margin-top: 5px;
  color: var(--text-strong);
  font-size: 14px;
}

.hero-summary__divider {
  width: 1px;
  margin: 0 13px;
  background: var(--border-soft);
}

/* LISTAGEM */
.projects-panel {
  min-width: 0;
  overflow: hidden;
  border-radius: 18px;
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 20px 22px;
  border-bottom: 1px solid var(--border-soft);
}

.list-toolbar__copy {
  min-width: 0;
}

.list-toolbar h2 {
  margin: 6px 0 0;
  color: var(--text-strong);
  font-size: 17px;
  font-weight: 800;
}

.list-toolbar p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 9px;
}

.list-toolbar__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
}

.search-field {
  width: 300px;
  min-width: 0;
}

.status-filter-main {
  width: 190px;
}

.search-field :deep(.q-field__control),
.status-filter-main :deep(.q-field__control),
.advanced-filter-field :deep(.q-field__control),
.rows-select :deep(.q-field__control) {
  color: var(--text-strong);
  background: var(--surf-2);
  border-radius: 9px;
}

.search-field :deep(.q-field__native),
.search-field :deep(.q-field__input),
.search-field :deep(.q-field__prepend),
.status-filter-main :deep(.q-field__native),
.status-filter-main :deep(.q-field__input),
.status-filter-main :deep(.q-field__prepend),
.advanced-filter-field :deep(.q-field__native),
.advanced-filter-field :deep(.q-field__input),
.advanced-filter-field :deep(.q-field__prepend),
.rows-select :deep(.q-field__native) {
  color: var(--text-strong);
}

.search-field :deep(.q-field__control:before),
.status-filter-main :deep(.q-field__control:before),
.advanced-filter-field :deep(.q-field__control:before),
.rows-select :deep(.q-field__control:before) {
  border-color: var(--border-soft);
}

.primary-btn {
  min-height: 39px;
  padding: 0 14px;
  color: #fff !important;
  background:
    linear-gradient(
      135deg,
      var(--brand),
      #ff9634
    ) !important;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(255, 123, 0, .18);
  font-weight: 750;
}

.filter-btn {
  min-height: 39px;
  padding: 0 11px;
  color: var(--text-muted);
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 9px;
}

.filter-btn--active {
  color: var(--brand);
  background: var(--brand-soft);
  border-color: rgba(255, 123, 0, .18);
}

.advanced-filters {
  padding: 16px 22px;
  background: var(--surf-2);
  border-bottom: 1px solid var(--border-soft);
}

.advanced-filters__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.advanced-filters__head strong,
.advanced-filters__head span {
  display: block;
}

.advanced-filters__head strong {
  color: var(--text-strong);
  font-size: 10px;
}

.advanced-filters__head span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8px;
}

.clear-filters-btn {
  color: var(--brand);
  font-size: 8.5px;
}

.advanced-filters__grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr))
    minmax(150px, .8fr)
    minmax(150px, .8fr);
  gap: 9px;
}

.list-result-bar {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 9px 22px;
  background: var(--surf-1);
  border-bottom: 1px solid var(--border-soft);
}

.list-result-bar > div:first-child {
  min-width: 0;
}

.list-result-bar strong,
.list-result-bar span {
  display: block;
}

.list-result-bar > div:first-child strong {
  color: var(--text-strong);
  font-size: 9px;
}

.list-result-bar > div:first-child span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 7.8px;
}

.result-statuses {
  display: flex;
  align-items: center;
  gap: 14px;
}

.result-statuses span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 8px;
}

.result-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.result-dot--progress {
  background: var(--brand);
}

.result-dot--done {
  background: #21ba45;
}

/* TABLE */
.data-table {
  background: transparent;
}

:deep(.data-table__header) {
  background: var(--surf-2);
}

:deep(.data-table__header th) {
  padding: 12px 14px !important;
  color: var(--text-muted) !important;
  border-bottom: 1px solid var(--border-soft) !important;
  font-size: 8.2px;
  font-weight: 800 !important;
  letter-spacing: .06em;
  text-transform: uppercase;
}

:deep(.data-table__body tbody td) {
  padding: 12px 14px !important;
  color: var(--text-base);
  border-bottom: 1px solid var(--border-soft) !important;
}

:deep(.data-table__body tbody tr) {
  cursor: pointer;
}

:deep(.data-table__body tbody tr:hover) {
  background: var(--surf-2) !important;
}

.id-badge {
  color: var(--text-muted);
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;
  font-size: 9.5px;
  font-weight: 750;
}

.project-cell,
.client-cell {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.project-avatar {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .14);
  border-radius: 11px;
}

.project-cell > div:last-child,
.client-cell > div:last-child {
  min-width: 0;
}

.project-cell strong,
.project-cell span,
.client-cell strong,
.client-cell span {
  display: block;
}

.project-cell strong,
.client-cell strong {
  max-width: 210px;
  color: var(--text-strong);
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-cell span,
.client-cell span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8px;
}

.client-avatar {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 9px;
  font-size: 8.5px;
  font-weight: 850;
}

.network-cell,
.dates-cell {
  display: grid;
  gap: 5px;
}

.network-cell div,
.dates-cell span {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: var(--text-muted);
  font-size: 8.5px;
}

.network-cell span {
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 190px;
  padding: 5px 8px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 8.1px;
  font-weight: 750;
  line-height: 1.2;
}

.status-badge i {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  border-radius: 50%;
}

.status-badge--large {
  padding: 7px 10px;
  font-size: 8.7px;
}

.money-cell {
  color: var(--text-strong);
  font-size: 9.5px;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 3px;
}

.table-action-btn {
  color: var(--text-muted);
}

.table-action-btn:hover {
  color: var(--brand);
  background: var(--brand-soft);
}

.table-action-btn--danger:hover {
  color: #d95050;
  background: rgba(217, 80, 80, .09);
}

/* EMPTY */
.empty-state,
.mobile-loading {
  width: 100%;
  min-height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  color: var(--text-muted);
  text-align: center;
}

.empty-state--compact {
  min-height: 160px;
}

.empty-state__icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 14px;
}

.empty-state strong {
  color: var(--text-strong);
  font-size: 11px;
}

.empty-state span,
.mobile-loading span {
  max-width: 390px;
  font-size: 9px;
  line-height: 1.45;
}

/* MOBILE */
.mobile-list {
  display: none;
  padding: 12px;
  background: var(--surf-2);
}

.project-mobile-card {
  margin-bottom: 10px;
  padding: 14px;
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 13px;
  box-shadow: var(--shadow-soft);
  cursor: pointer;
}

.project-mobile-card__head {
  display: grid;
  grid-template-columns:
    42px
    minmax(0, 1fr)
    20px;
  align-items: center;
  gap: 10px;
}

.project-avatar--mobile {
  width: 42px;
  height: 42px;
}

.project-mobile-card__identity {
  min-width: 0;
}

.project-mobile-card__identity strong,
.project-mobile-card__identity span {
  display: block;
}

.project-mobile-card__identity strong {
  color: var(--text-strong);
  font-size: 10.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-mobile-card__identity span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8px;
}

.project-mobile-card__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
  margin-top: 12px;
}

.project-mobile-card__status > strong {
  color: var(--text-strong);
  font-size: 10px;
}

.project-mobile-card__relations {
  display: grid;
  gap: 6px;
  margin-top: 11px;
  padding: 10px 0;
  border-top: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
}

.project-mobile-card__relations div {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  color: var(--text-muted);
  font-size: 8.5px;
}

.project-mobile-card__relations span {
  overflow-wrap: anywhere;
}

.project-mobile-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
  padding-top: 10px;
  color: var(--text-muted);
  font-size: 8px;
}

.project-mobile-card__footer strong {
  color: var(--text-strong);
}

.mobile-delete-btn {
  color: #d95050;
}

.pagination-footer {
  min-height: 66px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 18px;
  background: var(--surf-2);
  border-top: 1px solid var(--border-soft);
}

.pagination-footer__left {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text-muted);
  font-size: 8.5px;
  font-weight: 650;
}

.rows-select {
  width: 68px;
}


/* PROGRESSO DOS PROJETOS */
.progress-cell {
  width: 150px;
}

.progress-cell__top,
.project-mobile-progress__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.progress-cell__top span,
.project-mobile-progress__head span {
  min-width: 0;
  color: var(--text-muted);
  font-size: 7.4px;
  font-weight: 650;
}

.progress-cell__top strong,
.project-mobile-progress__head strong {
  flex: 0 0 auto;
  color: var(--text-strong);
  font-size: 8px;
}

.project-progress {
  position: relative;
  width: 100%;
  height: 7px;
  overflow: hidden;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 999px;
}

.project-progress__fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0;
  min-width: 0;
  background: var(--progress-color, var(--brand));
  border-radius: inherit;
  transition: width .35s ease;
}

.project-progress--complete .project-progress__fill {
  background: #21ba45;
}

.project-progress--special .project-progress__fill {
  min-width: 5px;
}

.project-mobile-progress {
  margin-top: 11px;
  padding: 9px 10px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 9px;
}

@keyframes progressFlow {
  from {
    background-position: 100% 0;
  }

  to {
    background-position: -80% 0;
  }
}

/* CALENDÁRIOS */
.date-picker-field :deep(.q-field__native),
.date-picker-field :deep(.q-field__input) {
  cursor: pointer;
}

.date-picker-action {
  color: var(--brand);
  transition:
    transform .15s ease,
    opacity .15s ease;
}

.date-picker-action:hover {
  transform: scale(1.08);
}


/* WORKSPACE */
.project-dialog {
  width: min(1220px, calc(100vw - 28px));
  height: min(900px, calc(100vh - 28px));
  max-width: none;
  max-height: none;
  display: flex;
  flex-direction: column;
  color: var(--text-base);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-strong);
}

.dialog-loading {
  z-index: 20;
  border-radius: inherit;
}

.workspace-head {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    auto
    auto;
  align-items: center;
  gap: 18px;
  min-height: 92px;
  padding: 17px 20px;
}

.workspace-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.workspace-avatar {
  width: 50px;
  height: 50px;
  flex: 0 0 50px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .15);
  border-radius: 14px;
}

.workspace-identity > div:last-child {
  min-width: 0;
}

.workspace-identity h2 {
  max-width: 500px;
  margin: 5px 0 2px;
  color: var(--text-strong);
  font-size: 18px;
  line-height: 1.2;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-identity p {
  margin: 0;
  color: var(--text-muted);
  font-size: 9px;
}

.workspace-summary {
  display: flex;
  padding: 8px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 11px;
}

.workspace-summary div {
  min-width: 70px;
  padding: 0 10px;
  text-align: center;
}

.workspace-summary div + div {
  border-left: 1px solid var(--border-soft);
}

.workspace-summary span,
.workspace-summary strong {
  display: block;
}

.workspace-summary span {
  color: var(--text-muted);
  font-size: 7px;
  text-transform: uppercase;
}

.workspace-summary strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 11px;
}

.workspace-head__actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.workspace-close,
.workspace-delete-btn {
  color: var(--text-muted);
}

.workspace-delete-btn:hover {
  color: #d95050;
  background: rgba(217, 80, 80, .08);
}

/* TABS */
.workspace-tabbar-shell {
  flex: 0 0 auto;
  padding: 13px 16px;
  background: var(--surf-2);
  border-top: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
  overflow: hidden;
}

.workspace-tabbar {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 9px;
  width: 100%;
  min-width: 0;
}

.workspace-tab-card {
  position: relative;
  min-width: 0;
  min-height: 64px;
  display: grid;
  grid-template-columns:
    38px
    minmax(0, 1fr)
    auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: var(--text-base);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  font: inherit;
  text-align: left;
  cursor: pointer;
  outline: none;
  box-shadow: 0 2px 8px rgba(16, 24, 40, .025);
  transition:
    transform .16s ease,
    border-color .16s ease,
    box-shadow .16s ease;
}

.workspace-tab-card:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 123, 0, .26);
  box-shadow: 0 7px 18px rgba(16, 24, 40, .055);
}

.workspace-tab-card--active {
  color: var(--brand);
  background:
    linear-gradient(
      135deg,
      var(--brand-soft),
      var(--surf-1) 72%
    );
  border-color: rgba(255, 123, 0, .35);
  box-shadow:
    0 8px 22px rgba(255, 123, 0, .09),
    inset 3px 0 0 var(--brand);
}

.workspace-tab-card__icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
}

.workspace-tab-card--active .workspace-tab-card__icon {
  color: var(--brand);
  background: var(--brand-soft);
  border-color: rgba(255, 123, 0, .2);
}

.workspace-tab-card__copy {
  min-width: 0;
}

.workspace-tab-card__copy strong,
.workspace-tab-card__copy small {
  display: block;
}

.workspace-tab-card__copy strong {
  min-width: 0;
  color: var(--text-strong);
  font-size: 10.5px;
  line-height: 1.25;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-tab-card--active .workspace-tab-card__copy strong {
  color: var(--brand);
}

.workspace-tab-card__copy small {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8px;
  line-height: 1.3;
  font-weight: 600;
}

.workspace-tab-card__title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.workspace-tab-count {
  flex: 0 0 auto;
  min-width: 20px;
  height: 20px;
  display: inline-grid;
  place-items: center;
  padding: 0 6px;
  color: var(--text-muted);
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  font-size: 7.5px;
  font-weight: 850;
}

.workspace-tab-card--active .workspace-tab-count {
  color: var(--brand);
  background: var(--brand-soft);
  border-color: rgba(255, 123, 0, .18);
}

.workspace-tab-card__active-mark {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  color: #fff;
  background: var(--brand);
  border-radius: 7px;
  box-shadow: 0 5px 12px rgba(255, 123, 0, .22);
}

.workspace-body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 0;
  overflow: hidden;
}

.workspace-panels {
  width: 100%;
  height: 100%;
  background: transparent;
}

.workspace-panel {
  height: 100%;
  padding: 22px;
  overflow-y: auto;
  box-sizing: border-box;
}

/* HEADINGS / FORM */
.tab-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.tab-heading h3 {
  margin: 6px 0 3px;
  color: var(--text-strong);
  font-size: 17px;
  font-weight: 800;
}

.tab-heading p {
  margin: 0;
  color: var(--text-muted);
  font-size: 9.5px;
  line-height: 1.5;
}

.project-overview-summary {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.project-overview-summary article,
.items-summary article {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 11px;
}

.overview-stat-icon,
.items-summary__icon {
  width: 37px;
  height: 37px;
  flex: 0 0 37px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 10px;
}

.project-overview-summary span,
.project-overview-summary strong,
.items-summary span,
.items-summary strong {
  display: block;
}

.project-overview-summary span,
.items-summary span {
  color: var(--text-muted);
  font-size: 7.8px;
  text-transform: uppercase;
}

.project-overview-summary strong,
.items-summary strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 10.5px;
}

.form-card,
.relationship-section {
  margin-bottom: 14px;
  padding: 16px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 13px;
}

.form-card__head {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-bottom: 14px;
}

.form-card__number {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 8px;
  font-size: 8px;
  font-weight: 850;
}

.form-card__head strong,
.form-card__head span {
  display: block;
}

.form-card__head strong {
  color: var(--text-strong);
  font-size: 10.5px;
}

.form-card__head span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8.5px;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 13px;
}

.field-block {
  min-width: 0;
}

.field-block--full {
  grid-column: 1 / -1;
}

.field-label {
  display: block;
  margin: 0 0 6px 2px;
  color: var(--text-base);
  font-size: 9.5px;
  font-weight: 750;
}

.premium-field {
  width: 100%;
  min-width: 0;
}

.premium-field :deep(.q-field__control) {
  min-height: 42px;
  color: var(--text-strong);
  background: var(--surf-1);
  border-radius: 9px;
}

.premium-field :deep(.q-field__native),
.premium-field :deep(.q-field__input),
.premium-field :deep(.q-field__prepend),
.premium-field :deep(.q-field__append) {
  color: var(--text-strong);
}

.premium-field :deep(.q-field__prepend),
.premium-field :deep(.q-field__append) {
  color: var(--text-muted);
}

.premium-field :deep(.q-field__control:before) {
  border-color: var(--border-soft);
}

.premium-field :deep(.q-field__bottom) {
  min-height: 27px;
  padding: 4px 8px 0;
}

.relationship-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.relationship-card {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 11px;
}

.relationship-card__icon {
  width: 37px;
  height: 37px;
  flex: 0 0 37px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 10px;
}

.relationship-card > div:last-child {
  min-width: 0;
}

.relationship-card span,
.relationship-card strong,
.relationship-card small {
  display: block;
}

.relationship-card span {
  color: var(--text-muted);
  font-size: 7.5px;
  text-transform: uppercase;
}

.relationship-card strong {
  margin-top: 2px;
  color: var(--text-strong);
  font-size: 9.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relationship-card small {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 7.8px;
}

.metadata-card {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
}

.metadata-card span,
.metadata-card strong {
  display: block;
}

.metadata-card span {
  color: var(--text-muted);
  font-size: 7.8px;
  text-transform: uppercase;
}

.metadata-card strong {
  margin-top: 3px;
  color: var(--text-base);
  font-size: 8.7px;
}

.tab-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.secondary-btn {
  color: var(--text-muted);
  border-radius: 9px;
}

.save-btn {
  color: #fff !important;
  background:
    linear-gradient(
      135deg,
      var(--brand),
      #ff9634
    ) !important;
  border-radius: 9px;
}

.danger-btn {
  color: #fff !important;
  background: #d95050 !important;
  border-radius: 9px;
}

/* FLOW */
.current-stage-card {
  display: grid;
  grid-template-columns:
    44px
    minmax(0, 1fr)
    auto;
  align-items: center;
  gap: 11px;
  margin-bottom: 14px;
  padding: 14px;
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .14);
  border-radius: 12px;
}

.current-stage-card__icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--surf-1);
  border-radius: 11px;
}

.current-stage-card__copy span,
.current-stage-card__copy strong,
.current-stage-card__copy small,
.current-stage-card__date span,
.current-stage-card__date strong {
  display: block;
}

.current-stage-card__copy span,
.current-stage-card__date span {
  color: var(--text-muted);
  font-size: 7.5px;
  text-transform: uppercase;
}

.current-stage-card__copy strong {
  margin-top: 2px;
  color: var(--text-strong);
  font-size: 11px;
}

.current-stage-card__copy small {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8px;
}

.current-stage-card__date {
  padding-left: 16px;
  border-left: 1px solid rgba(255, 123, 0, .15);
}

.current-stage-card__date strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 9px;
}

.flow-board {
  padding: 18px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
}

.flow-board__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
}

.flow-board__head > div:first-child strong,
.flow-board__head > div:first-child span {
  display: block;
}

.flow-board__head > div:first-child strong {
  color: var(--text-strong);
  font-size: 11px;
}

.flow-board__head > div:first-child span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8.4px;
}

.flow-progress-summary {
  flex: 0 0 auto;
  text-align: right;
}

.flow-progress-summary span,
.flow-progress-summary strong {
  display: block;
}

.flow-progress-summary span {
  color: var(--text-muted);
  font-size: 7px;
  text-transform: uppercase;
}

.flow-progress-summary strong {
  margin-top: 2px;
  color: var(--brand);
  font-size: 15px;
}

.flow-overall-progress {
  position: relative;
  height: 6px;
  margin-top: 12px;
  overflow: hidden;
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 999px;
}

.flow-overall-progress > span {
  position: absolute;
  inset: 0 auto 0 0;
  overflow: hidden;
  background: var(--brand);
  border-radius: inherit;
  box-shadow: 0 0 10px rgba(255, 123, 0, .16);
  transition: width .3s ease;
}

.flow-overall-progress > span::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -64px;
  width: 64px;
  background:
    linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, .08) 20%,
      rgba(255, 255, 255, .82) 50%,
      rgba(255, 255, 255, .16) 72%,
      transparent 100%
    );
  filter: blur(.2px);
  animation: flowShine 1.8s linear infinite;
}

.flow-overall-progress--special > span {
  min-width: 5px;
}

.status-flow {
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  margin-top: 28px;
  padding: 8px 6px 4px;
  overflow-x: auto;
  overflow-y: visible;
  scrollbar-width: thin;
}

.status-flow__stage {
  position: relative;
  flex: 1 0 150px;
  min-width: 150px;
  display: flex;
  justify-content: center;
}

.status-flow__button {
  position: relative;
  z-index: 2;
  width: 130px;
  min-width: 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0;
  color: var(--text-base);
  background: transparent;
  border: 0;
  font: inherit;
  text-align: center;
  cursor: pointer;
  outline: none;
}

.status-flow__button:disabled {
  cursor: default;
}

.status-flow__step-label {
  margin-bottom: 8px;
  color: var(--text-muted);
  font-size: 7px;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
}

.status-flow__dot {
  --status-color: var(--brand);
  position: relative;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  color: var(--status-color);
  background:
    color-mix(
      in srgb,
      var(--status-color) 4%,
      var(--surf-1)
    );
  border: 1.5px solid
    color-mix(
      in srgb,
      var(--status-color) 48%,
      var(--border-soft)
    );
  border-radius: 50%;
  box-shadow:
    inset 0 0 0 3px
      color-mix(
        in srgb,
        var(--status-color) 3%,
        transparent
      ),
    0 2px 7px rgba(16, 24, 40, .04);
  transition:
    transform .18s ease,
    color .18s ease,
    border-color .18s ease,
    box-shadow .18s ease,
    background .18s ease,
    opacity .18s ease;
}

.status-flow__button:not(:disabled):hover .status-flow__dot {
  transform: translateY(-2px) scale(1.045);
  color: var(--status-color);
  border-color: var(--status-color);
  background:
    color-mix(
      in srgb,
      var(--status-color) 10%,
      var(--surf-1)
    );
  box-shadow:
    0 7px 16px rgba(16, 24, 40, .075),
    0 0 0 4px
      color-mix(
        in srgb,
        var(--status-color) 9%,
        transparent
      );
}

.status-flow__stage--done .status-flow__dot {
  color: var(--status-color);
  background:
    color-mix(
      in srgb,
      var(--status-color) 8%,
      var(--surf-1)
    );
  border-color:
    color-mix(
      in srgb,
      var(--status-color) 62%,
      var(--border-soft)
    );
  box-shadow:
    inset 0 0 0 3px
      color-mix(
        in srgb,
        var(--status-color) 5%,
        transparent
      ),
    0 2px 7px rgba(16, 24, 40, .04);
}

.status-flow__stage--active .status-flow__dot {
  width: 46px;
  height: 46px;
  margin-top: -3px;
  color: var(--status-color);
  background:
    color-mix(
      in srgb,
      var(--status-color) 8%,
      var(--surf-1)
    );
  border: 2px solid var(--status-color);
  box-shadow:
    inset 0 0 0 4px
      color-mix(
        in srgb,
        var(--status-color) 5%,
        transparent
      ),
    0 0 0 5px
      color-mix(
        in srgb,
        var(--status-color) 8%,
        transparent
      ),
    0 8px 18px rgba(16, 24, 40, .065);
}

.status-flow__stage--active .status-flow__dot::before,
.status-flow__stage--active .status-flow__dot::after {
  content: '';
  position: absolute;
  inset: -6px;
  border: 1px solid
    color-mix(
      in srgb,
      var(--status-color) 58%,
      transparent
    );
  border-radius: 50%;
  opacity: .22;
  animation: statusPulse 2.1s ease-out infinite;
}

.status-flow__stage--active .status-flow__dot::after {
  animation-delay: .85s;
}

.status-flow__dot-core {
  width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  background:
    color-mix(
      in srgb,
      var(--status-color) 7%,
      transparent
    );
  border-radius: 50%;
  transition:
    color .18s ease,
    background .18s ease,
    transform .18s ease;
}

.status-flow__stage--done .status-flow__dot-core {
  background:
    color-mix(
      in srgb,
      var(--status-color) 11%,
      transparent
    );
}

.status-flow__stage--active .status-flow__dot-core {
  width: 29px;
  height: 29px;
  background:
    color-mix(
      in srgb,
      var(--status-color) 12%,
      transparent
    );
}

.status-flow__button strong {
  display: -webkit-box;
  margin-top: 10px;
  color: var(--text-strong);
  font-size: 8.8px;
  line-height: 1.3;
  font-weight: 800;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.status-flow__stage--active .status-flow__button strong {
  color: var(--status-color);
}

.status-flow__stage--done .status-flow__button strong {
  color: var(--text-strong);
}

.status-flow__button small {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 7px;
}

.status-flow__stage--future .status-flow__button {
  opacity: 1;
}

.status-flow__stage--future .status-flow__dot {
  color: var(--text-muted);
  background: var(--surf-1);
  border-color: var(--border-soft);
  box-shadow:
    inset 0 0 0 3px
      color-mix(
        in srgb,
        var(--text-muted) 3%,
        transparent
      ),
    0 2px 6px rgba(16, 24, 40, .025);
}

.status-flow__stage--future .status-flow__dot-core {
  color: var(--text-muted);
  background: var(--surf-2);
}

.status-flow__stage--future .status-flow__button strong {
  color: var(--text-muted);
  font-weight: 700;
}

.status-flow__stage--future .status-flow__step-label,
.status-flow__stage--future .status-flow__button small {
  color:
    color-mix(
      in srgb,
      var(--text-muted) 78%,
      transparent
    );
}

.status-flow__stage--future
.status-flow__button:not(:disabled):hover
.status-flow__dot {
  color: var(--status-color);
  background:
    color-mix(
      in srgb,
      var(--status-color) 7%,
      var(--surf-1)
    );
  border-color:
    color-mix(
      in srgb,
      var(--status-color) 66%,
      var(--border-soft)
    );
  box-shadow:
    inset 0 0 0 3px
      color-mix(
        in srgb,
        var(--status-color) 4%,
        transparent
      ),
    0 6px 14px rgba(16, 24, 40, .055),
    0 0 0 4px
      color-mix(
        in srgb,
        var(--status-color) 7%,
        transparent
      );
}

.status-flow__stage--future
.status-flow__button:not(:disabled):hover
.status-flow__dot-core {
  color: var(--status-color);
  background:
    color-mix(
      in srgb,
      var(--status-color) 10%,
      transparent
    );
}

.status-flow__stage--future
.status-flow__button:not(:disabled):hover
strong {
  color: var(--status-color);
}

.status-flow__connector {
  --connector-color: var(--brand);
  position: absolute;
  z-index: 1;
  top: 38px;
  left: calc(50% + 26px);
  width: calc(100% - 52px);
  height: 4px;
  overflow: hidden;
  background: var(--border-soft);
  border-radius: 999px;
}

.status-flow__connector--done {
  background: var(--connector-color);
}

/*
 * O único trecho animado é o que sai do status atual.
 * A linha permanece cinza e um pequeno brilho laranja "viaja"
 * em direção ao próximo status, como no dashboard.
 */
.status-flow__connector--moving {
  background: var(--border-soft);
  box-shadow: none;
}

.status-flow__connector--moving::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -72px;
  width: 72px;
  background:
    linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 123, 0, .08) 12%,
      rgba(255, 123, 0, .42) 34%,
      var(--brand) 54%,
      rgba(255, 157, 69, .72) 70%,
      rgba(255, 123, 0, .14) 88%,
      transparent 100%
    );
  border-radius: inherit;
  filter: blur(.25px);
  animation: connectorTravel 1.7s ease-in-out infinite;
}


/* Recusado/cancelado:
   fluxo principal neutro; a cor de cada etapa volta somente no hover. */
.status-flow--special-current .status-flow__dot,
.status-flow--special-current .status-flow__stage--done .status-flow__dot,
.status-flow--special-current .status-flow__stage--active .status-flow__dot {
  color: var(--text-muted);
  background: var(--surf-1);
  border-color: var(--border-soft);
  box-shadow: 0 2px 7px rgba(16, 24, 40, .035);
}

.status-flow--special-current .status-flow__dot::before,
.status-flow--special-current .status-flow__dot::after {
  display: none;
}

.status-flow--special-current .status-flow__button strong {
  color: var(--text-muted);
}

.status-flow--special-current .status-flow__connector,
.status-flow--special-current .status-flow__connector--done,
.status-flow--special-current .status-flow__connector--moving {
  background: var(--border-soft);
  box-shadow: none;
}

.status-flow--special-current .status-flow__connector--moving::after {
  display: none;
}

.status-flow--special-current
.status-flow__button:not(:disabled):hover
.status-flow__dot {
  color: var(--status-color);
  border-color: var(--status-color);
  background:
    color-mix(
      in srgb,
      var(--status-color) 8%,
      var(--surf-1)
    );
  box-shadow:
    0 6px 14px rgba(16, 24, 40, .06),
    0 0 0 4px
      color-mix(
        in srgb,
        var(--status-color) 8%,
        transparent
      );
}

.status-flow--special-current
.status-flow__button:not(:disabled):hover
strong {
  color: var(--status-color);
}

.status-badge--critical {
  color: #fff !important;
  background: #dc2626 !important;
  border-color: #dc2626 !important;
  box-shadow: 0 5px 13px rgba(220, 38, 38, .16);
}

.status-badge--critical i {
  background: #fff !important;
}

.special-statuses {
  margin-top: 25px;
  padding-top: 16px;
  border-top: 1px solid var(--border-soft);
}

.special-statuses__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.special-statuses__head > div span,
.special-statuses__head > div strong {
  display: block;
}

.special-statuses__eyebrow {
  color: var(--text-muted);
  font-size: 6.8px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.special-statuses__head strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 9.5px;
}

.special-statuses__head > small {
  max-width: 420px;
  color: var(--text-muted);
  font-size: 7.6px;
  text-align: right;
}

.special-statuses__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.special-status-pill {
  --special-color: #d95050;
  --special-soft: rgba(217, 80, 80, .08);
  min-width: 190px;
  display: grid;
  grid-template-columns:
    34px
    minmax(0, 1fr)
    18px;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  color: var(--text-base);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    transform .15s ease,
    border-color .15s ease,
    background .15s ease;
}

.special-status-pill:not(:disabled):hover {
  transform: translateY(-1px);
  background: var(--special-soft);
  border-color: var(--special-color);
}

.special-status-pill--active {
  background: var(--special-soft);
  border-color: var(--special-color);
  cursor: default;
}

.special-status-pill__icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: var(--special-color);
  background: var(--special-soft);
  border-radius: 50%;
}

.special-status-pill__copy {
  min-width: 0;
}

.special-status-pill__copy strong,
.special-status-pill__copy small {
  display: block;
}

.special-status-pill__copy strong {
  color: var(--text-strong);
  font-size: 8.6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.special-status-pill--active .special-status-pill__copy strong {
  color: var(--special-color);
}

.special-status-pill__copy small {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 6.9px;
}

.special-status-pill__arrow {
  color: var(--special-color);
}

@keyframes statusPulse {
  0% {
    transform: scale(.72);
    opacity: .45;
  }

  75%,
  100% {
    transform: scale(1.22);
    opacity: 0;
  }
}

@keyframes connectorTravel {
  0% {
    left: -72px;
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  88% {
    opacity: 1;
  }

  100% {
    left: 100%;
    opacity: 0;
  }
}

@keyframes flowShine {
  0% {
    transform: translateX(0);
    opacity: 0;
  }

  15% {
    opacity: .9;
  }

  80% {
    opacity: .9;
  }

  100% {
    transform: translateX(calc(100% + 128px));
    opacity: 0;
  }
}




  to {
    background-position: 72px 0;
  }





  to {
    background-position: 0 72px;
  }



@supports not (color: color-mix(in srgb, red 10%, transparent)) {
  .status-flow__dot {
    background: var(--surf-1);
    border-color: var(--border-soft);
    box-shadow: 0 2px 8px rgba(16, 24, 40, .045);
  }

  .status-flow__button:not(:disabled):hover .status-flow__dot,
  .status-flow__stage--active .status-flow__dot,
  .status-flow__stage--done .status-flow__dot {
    color: var(--status-color);
    border-color: var(--status-color);
  }

  .status-flow--special-current .status-flow__dot {
    color: var(--text-muted);
    border-color: var(--border-soft);
  }

  .status-flow--special-current
  .status-flow__button:not(:disabled):hover
  .status-flow__dot {
    color: var(--status-color);
    border-color: var(--status-color);
  }
}

/* ITEMS */
.items-summary {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.items-search {
  width: min(390px, 100%);
  margin-bottom: 12px;
}

.items-accordion {
  display: grid;
  gap: 9px;
  padding: 0;
}

.item-expansion {
  overflow: hidden;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 11px;
  transition:
    border-color .16s ease,
    box-shadow .16s ease;
}

.item-expansion:hover {
  border-color: rgba(255, 123, 0, .18);
}

.item-expansion.q-expansion-item--expanded {
  border-color: rgba(255, 123, 0, .28);
  box-shadow: 0 8px 20px rgba(16, 24, 40, .05);
}

.item-expansion :deep(.q-item) {
  min-height: 62px;
  padding: 10px 12px;
}

.item-expansion :deep(.q-item__section--avatar) {
  min-width: 42px;
}

.item-expansion__number {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 9px;
  font-size: 7.8px;
  font-weight: 850;
}

.item-expansion__title {
  color: var(--text-strong);
  font-size: 9.6px;
  font-weight: 800;
  line-height: 1.35;
}

.item-expansion__caption {
  margin-top: 3px;
  color: var(--text-muted) !important;
  font-size: 7.6px;
}

.item-expansion__chevron {
  color: var(--brand);
}

.item-quantity {
  padding: 5px 8px;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 999px;
  font-size: 7.8px;
  font-weight: 800;
}

.item-expansion__body {
  padding: 2px 14px 14px;
  border-top: 1px solid var(--border-soft);
}

.item-detail-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 12px 0;
}

.item-detail-grid > div {
  min-width: 0;
  padding: 9px 10px;
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 8px;
}

.item-detail-grid span,
.item-detail-grid strong {
  display: block;
}

.item-detail-grid span {
  color: var(--text-muted);
  font-size: 6.9px;
  font-weight: 700;
  text-transform: uppercase;
}

.item-detail-grid strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 8.5px;
}

.item-components-detail {
  padding: 11px;
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 9px;
}

.item-components-detail__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 9px;
  border-bottom: 1px solid var(--border-soft);
}

.item-components-detail__head > .q-icon {
  color: var(--brand);
}

.item-components-detail__head strong,
.item-components-detail__head span {
  display: block;
}

.item-components-detail__head strong {
  color: var(--text-strong);
  font-size: 8.8px;
}

.item-components-detail__head span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 7.2px;
}

.item-components-detail__list {
  display: grid;
  gap: 5px;
  margin-top: 9px;
}

.item-component-row {
  display: grid;
  grid-template-columns:
    28px
    20px
    minmax(0, 1fr);
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 5px 8px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 7px;
}

.item-component-row__index {
  color: var(--text-muted);
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;
  font-size: 7px;
}

.item-component-row .q-icon {
  color: var(--brand);
}

.item-component-row strong {
  color: var(--text-base);
  font-size: 7.8px;
  font-weight: 650;
}

.components-empty {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 7.8px;
}

.components-empty--expanded {
  min-height: 42px;
  padding: 10px;
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 8px;
}

/* XML */
.xml-card {
  padding: 16px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 13px;
}

.xml-card__hero {
  display: grid;
  grid-template-columns:
    48px
    minmax(0, 1fr)
    auto;
  align-items: center;
  gap: 11px;
}

.xml-file-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 12px;
}

.xml-card__copy {
  min-width: 0;
}

.xml-card__copy span,
.xml-card__copy strong,
.xml-card__copy small {
  display: block;
}

.xml-card__copy span {
  color: var(--text-muted);
  font-size: 7.5px;
  text-transform: uppercase;
}

.xml-card__copy strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 10.5px;
}

.xml-card__copy small {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8px;
}

.xml-card__actions {
  display: flex;
  gap: 7px;
}

.secondary-outline-btn {
  color: var(--text-base);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 9px;
}

.xml-security-note {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 14px;
  padding: 10px;
  color: var(--text-muted);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 9px;
  font-size: 8px;
  line-height: 1.45;
}

.xml-security-note .q-icon {
  flex: 0 0 auto;
  color: var(--brand);
}

.xml-preview-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px solid var(--border-soft);
}

.xml-preview-toggle strong,
.xml-preview-toggle span {
  display: block;
}

.xml-preview-toggle strong {
  color: var(--text-strong);
  font-size: 9.5px;
}

.xml-preview-toggle span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 7.8px;
}

.xml-preview {
  max-height: 420px;
  margin-top: 11px;
  overflow: auto;
  background: #101828;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 10px;
}

.xml-preview pre {
  min-width: max-content;
  margin: 0;
  padding: 14px;
  color: #e5e7eb;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;
  font-size: 8px;
  line-height: 1.55;
  white-space: pre;
}

.xml-empty {
  min-height: 320px;
}

/* IMPORT */
.import-dialog {
  width: min(720px, calc(100vw - 24px));
  max-height: min(90vh, 760px);
  display: flex;
  flex-direction: column;
  color: var(--text-base);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-strong);
}

.import-dialog__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px 15px;
  border-bottom: 1px solid var(--border-soft);
}

.import-dialog__identity {
  display: flex;
  align-items: center;
  gap: 11px;
}

.import-dialog__icon {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 12px;
}

.import-dialog__head h3 {
  margin: 6px 0 2px;
  color: var(--text-strong);
  font-size: 17px;
  font-weight: 800;
}

.import-dialog__head p {
  margin: 0;
  color: var(--text-muted);
  font-size: 8.7px;
}

.import-dialog__body {
  display: grid;
  gap: 12px;
  padding: 16px 20px;
  overflow-y: auto;
}

.import-step {
  display: grid;
  grid-template-columns:
    32px
    minmax(0, 1fr);
  gap: 10px;
  padding: 14px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
}

.import-step__number {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 9px;
  font-size: 8px;
  font-weight: 850;
}

.import-step__content {
  min-width: 0;
}

.import-step__content > strong,
.import-step__content > span {
  display: block;
}

.import-step__content > strong {
  color: var(--text-strong);
  font-size: 10px;
}

.import-step__content > span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8.2px;
}

.import-field,
.xml-uploader {
  margin-top: 11px;
}

.xml-uploader :deep(.q-field__control) {
  min-height: 54px;
  color: var(--text-strong);
  background: var(--surf-1);
  border-radius: 10px;
}

.xml-uploader :deep(.q-field__native),
.xml-uploader :deep(.q-field__prepend),
.xml-uploader :deep(.q-field__append) {
  color: var(--text-strong);
}

.xml-uploader :deep(.q-field__control:before) {
  border-color: var(--border-soft);
}

.selected-store-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 9px;
  color: var(--text-muted);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  font-size: 7.8px;
}

.selected-store-note .q-icon {
  color: var(--brand);
}

.selected-store-note strong {
  color: var(--text-strong);
}

.import-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 11px;
  color: var(--text-muted);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .12);
  border-radius: 10px;
}

.import-info .q-icon {
  flex: 0 0 auto;
  color: var(--brand);
}

.import-info strong,
.import-info span {
  display: block;
}

.import-info strong {
  color: var(--text-strong);
  font-size: 9px;
}

.import-info span {
  margin-top: 3px;
  font-size: 8px;
  line-height: 1.45;
}

.import-dialog__actions {
  justify-content: flex-end;
  gap: 7px;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--border-soft);
}

/* CONFIRM */
.confirm-dialog {
  width: min(500px, calc(100vw - 24px));
  color: var(--text-base);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 17px;
  overflow: hidden;
  box-shadow: var(--shadow-strong);
}

.confirm-dialog__head {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 18px 20px 13px;
}

.confirm-dialog__icon {
  width: 41px;
  height: 41px;
  flex: 0 0 41px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 11px;
}

.confirm-dialog__icon--danger {
  color: #d95050;
  background: rgba(217, 80, 80, .09);
}

.section-kicker--danger {
  color: #d95050;
}

.confirm-dialog h3 {
  margin: 5px 0 0;
  color: var(--text-strong);
  font-size: 16px;
  font-weight: 800;
}

.confirm-dialog__body {
  padding: 0 20px 17px;
}

.confirm-dialog__body > p {
  margin: 0 0 11px;
  color: var(--text-muted);
  font-size: 9.5px;
  line-height: 1.45;
}

.confirm-dialog__body > p strong {
  color: var(--text-strong);
}

.status-transfer {
  display: grid;
  grid-template-columns:
    1fr
    24px
    1fr;
  align-items: center;
  gap: 8px;
  margin-bottom: 11px;
  padding: 12px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
}

.status-transfer > div {
  min-width: 0;
}

.status-transfer span,
.status-transfer strong {
  display: block;
}

.status-transfer span {
  color: var(--text-muted);
  font-size: 7.4px;
  text-transform: uppercase;
}

.status-transfer strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 9px;
  overflow-wrap: anywhere;
}

.status-transfer .q-icon {
  color: var(--brand);
}

.confirm-note {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 10px 11px;
  color: var(--text-muted);
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  font-size: 8.4px;
  line-height: 1.45;
}

.confirm-note--warning {
  color: #9b6507;
  background: rgba(242, 160, 7, .08);
  border-color: rgba(242, 160, 7, .15);
}

.confirm-note .q-icon {
  flex: 0 0 auto;
}

.delete-project-summary {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 10px;
}

.delete-project-summary div {
  min-width: 0;
  padding: 9px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 8px;
}

.delete-project-summary span,
.delete-project-summary strong {
  display: block;
}

.delete-project-summary span {
  color: var(--text-muted);
  font-size: 7.2px;
  text-transform: uppercase;
}

.delete-project-summary strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.confirm-dialog__actions {
  justify-content: flex-end;
  gap: 7px;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--border-soft);
}

/* RESPONSIVE */
@media (max-width: 1320px) {
  .page-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-summary {
    width: 100%;
    min-width: 0;
  }

  .hero-summary__item {
    flex: 1 1 0;
    min-width: 0;
  }

  .list-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .list-toolbar__actions {
    width: 100%;
  }

  .search-field {
    flex: 1 1 auto;
    width: auto;
  }

  .advanced-filters__grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1000px) {
  .pedidos-page {
    padding: 22px 16px 40px;
  }

  .desktop-list {
    display: none;
  }

  .mobile-list {
    display: block;
  }

  .project-dialog {
    width: calc(100vw - 18px);
    height: calc(100vh - 18px);
    border-radius: 16px;
  }

  .workspace-head {
    grid-template-columns:
      minmax(0, 1fr)
      auto;
  }

  .workspace-summary {
    display: none;
  }

  .project-overview-summary {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .advanced-filters__grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .pedidos-page {
    padding: 16px 10px 30px;
  }

  .page-hero h1 {
    font-size: 27px;
  }

  .page-hero p {
    font-size: 11.5px;
  }

  .hero-summary {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    padding: 10px;
  }

  .hero-summary__divider {
    display: none;
  }

  .hero-summary__item {
    padding: 7px;
  }

  .list-toolbar {
    padding: 15px 12px;
  }

  .list-toolbar__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .search-field,
  .status-filter-main,
  .filter-btn,
  .primary-btn {
    width: 100%;
  }

  .advanced-filters {
    padding: 13px 12px;
  }

  .advanced-filters__head {
    align-items: flex-start;
    flex-direction: column;
  }

  .advanced-filters__grid {
    grid-template-columns: 1fr;
  }

  .list-result-bar {
    align-items: flex-start;
    flex-direction: column;
    padding: 10px 12px;
  }

  .result-statuses {
    width: 100%;
    justify-content: space-between;
  }

  .pagination-footer {
    align-items: stretch;
    flex-direction: column;
    padding: 12px;
  }

  .pagination-footer :deep(.q-pagination) {
    width: 100%;
    justify-content: center;
  }

  .project-dialog {
    width: 100vw;
    height: 100vh;
    border: 0;
    border-radius: 0;
  }

  .workspace-head {
    min-height: 78px;
    padding: 13px 12px;
  }

  .workspace-avatar {
    width: 43px;
    height: 43px;
    flex-basis: 43px;
  }

  .workspace-identity h2 {
    max-width: calc(100vw - 150px);
    font-size: 15px;
  }

  .workspace-identity p {
    display: none;
  }

  .workspace-tabbar-shell {
    padding: 9px 8px;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .workspace-tabbar-shell::-webkit-scrollbar {
    height: 4px;
  }

  .workspace-tabbar-shell::-webkit-scrollbar-thumb {
    background: var(--border-soft);
    border-radius: 999px;
  }

  .workspace-tabbar {
    grid-template-columns:
      repeat(4, 150px);
    width: max-content;
    min-width: max-content;
    gap: 7px;
  }

  .workspace-tab-card {
    min-height: 55px;
    grid-template-columns:
      32px
      minmax(0, 1fr);
    gap: 8px;
    padding: 8px 9px;
  }

  .workspace-tab-card__icon {
    width: 32px;
    height: 32px;
  }

  .workspace-tab-card__copy strong {
    font-size: 9px;
  }

  .workspace-tab-card__copy small {
    font-size: 7px;
  }

  .workspace-tab-card__active-mark {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 18px;
    height: 18px;
  }

  .workspace-panel {
    padding: 16px 12px 22px;
  }

  .tab-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .project-overview-summary,
  .form-grid,
  .relationship-grid,
  .metadata-card,
  .items-summary,
  .outflow-grid {
    grid-template-columns: 1fr;
  }

  .field-block--full {
    grid-column: auto;
  }

  .tab-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .tab-actions .q-btn {
    width: 100%;
  }

  .current-stage-card {
    grid-template-columns:
      42px
      minmax(0, 1fr);
  }

  .flow-board {
    padding: 14px 11px;
  }

  .flow-board__head,
  .special-statuses__head {
    align-items: flex-start;
    flex-direction: column;
  }

  .flow-progress-summary {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
  }

  .status-flow {
    display: flex;
    align-items: flex-start;
    gap: 0;
    margin-top: 20px;
    padding: 9px 7px 15px;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
  }

  .status-flow::-webkit-scrollbar {
    height: 4px;
  }

  .status-flow::-webkit-scrollbar-thumb {
    background: var(--border-soft);
    border-radius: 999px;
  }

  .status-flow__stage {
    flex: 0 0 126px;
    min-width: 126px;
    min-height: 0;
    display: flex;
    justify-content: center;
    scroll-snap-align: center;
  }

  .status-flow__button {
    width: 108px;
    display: flex;
    align-items: center;
    flex-direction: column;
    text-align: center;
  }

  .status-flow__step-label {
    margin: 0 0 7px;
  }

  .status-flow__dot {
    width: 36px;
    height: 36px;
    justify-self: auto;
  }

  .status-flow__dot-core {
    width: 22px;
    height: 22px;
  }

  .status-flow__stage--active .status-flow__dot {
    width: 42px;
    height: 42px;
    margin-top: -3px;
  }

  .status-flow__stage--active .status-flow__dot-core {
    width: 26px;
    height: 26px;
  }

  .status-flow__button strong {
    margin-top: 8px;
    font-size: 8px;
    line-height: 1.25;
  }

  .status-flow__button small {
    margin-top: 2px;
    font-size: 6.7px;
  }

  .status-flow__connector {
    top: 34px;
    left: calc(50% + 22px);
    width: calc(100% - 44px);
    height: 3px;
  }

  .status-flow__connector--moving::after {
    top: 0;
    bottom: 0;
    left: -72px;
    width: 72px;
    height: auto;
    background:
      linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 123, 0, .08) 12%,
        rgba(255, 123, 0, .42) 34%,
        var(--brand) 54%,
        rgba(255, 157, 69, .72) 70%,
        rgba(255, 123, 0, .14) 88%,
        transparent 100%
      );
    filter: blur(.25px);
    animation: connectorTravel 1.7s ease-in-out infinite;
  }

  .special-statuses__head > small {
    text-align: left;
  }

  .special-statuses__list {
    display: grid;
    grid-template-columns: 1fr;
  }

  .special-status-pill {
    width: 100%;
    min-width: 0;
  }

  .item-detail-grid {
    grid-template-columns: 1fr;
  }

  .current-stage-card__date {
    grid-column: 1 / -1;
    padding: 10px 0 0;
    border-top: 1px solid rgba(255, 123, 0, .15);
    border-left: 0;
  }


  .xml-card__hero {
    grid-template-columns:
      48px
      minmax(0, 1fr);
  }

  .xml-card__actions {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr;
  }

  .xml-card__actions .q-btn {
    width: 100%;
  }

  .xml-preview-toggle {
    align-items: flex-start;
    flex-direction: column;
  }

  .import-dialog {
    width: calc(100vw - 14px);
    max-height: calc(100vh - 14px);
  }

  .import-dialog__head {
    padding: 15px 14px;
  }

  .import-dialog__body {
    padding: 13px;
  }

  .import-step {
    grid-template-columns: 1fr;
  }

  .import-dialog__actions,
  .confirm-dialog__actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .import-dialog__actions .q-btn,
  .confirm-dialog__actions .q-btn {
    width: 100%;
  }

  .confirm-dialog {
    width: calc(100vw - 14px);
  }

  .status-transfer {
    grid-template-columns: 1fr;
  }

  .status-transfer .q-icon {
    justify-self: center;
    transform: rotate(90deg);
  }

  .delete-project-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 430px) {
  .pedidos-page {
    padding-inline: 8px;
  }

  .hero-summary {
    grid-template-columns: 1fr;
  }

  .hero-summary__item + .hero-summary__item {
    border-top: 1px solid var(--border-soft);
  }

  .workspace-tabbar {
    grid-template-columns:
      repeat(4, 138px);
  }

  .project-mobile-card {
    padding: 12px;
  }

  .project-mobile-card__status {
    align-items: flex-start;
    flex-direction: column;
  }
}

/* CONTAINER QUERIES */
@container (max-width: 1120px) {
  .page-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-summary {
    width: 100%;
    min-width: 0;
  }

  .hero-summary__item {
    flex: 1 1 0;
    min-width: 0;
  }

  .list-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .list-toolbar__actions {
    width: 100%;
  }

  .search-field {
    flex: 1 1 auto;
    width: auto;
  }

  .advanced-filters__grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@container (max-width: 820px) {
  .desktop-list {
    display: none;
  }

  .mobile-list {
    display: block;
  }

  .advanced-filters__grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@container (max-width: 600px) {
  .list-toolbar__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .search-field,
  .status-filter-main,
  .filter-btn,
  .primary-btn {
    width: 100%;
  }

  .advanced-filters__grid {
    grid-template-columns: 1fr;
  }

  .list-result-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .result-statuses {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
