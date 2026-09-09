<template>
  <q-page class="clientes-page">
    <!-- HERO -->
    <section class="page-hero">
      <div class="page-hero__copy">
        <div class="eyebrow">
          <span class="eyebrow__dot"></span>
          Relacionamento comercial
        </div>

        <h1>
          Clientes <span>atendidos</span>
        </h1>

        <p>
          Consulte os dados cadastrais, endereços, segurança, projetos e o histórico
          comercial dos clientes em uma única ficha administrativa.
        </p>
      </div>

      <div class="hero-summary">
        <div class="hero-summary__item">
          <span>Clientes</span>
          <strong>{{ clientes.length }}</strong>
        </div>

        <div class="hero-summary__divider"></div>

        <div class="hero-summary__item">
          <span>Projetos visíveis</span>
          <strong>{{ todosPedidos.length }}</strong>
        </div>

        <div class="hero-summary__divider"></div>

        <div class="hero-summary__item">
          <span>Lojistas envolvidos</span>
          <strong>{{ totalLojistasAtendimento }}</strong>
        </div>
      </div>
    </section>

    <section class="panel clientes-panel">
      <div class="list-toolbar">
        <div>
          <div class="section-kicker">Base de clientes</div>
          <h2>Clientes cadastrados</h2>
          <p>Clique em um cliente para abrir sua ficha completa.</p>
        </div>

        <div class="list-toolbar__actions">
          <q-input
            v-model="busca"
            debounce="300"
            outlined
            dense
            clearable
            class="search-field"
            placeholder="Pesquisar nome, documento ou código..."
          >
            <template #prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>
        </div>
      </div>

      <div class="desktop-list">
        <q-table
          flat hide-bottom row-key="cliente_id"
          :rows="clientesFiltrados"
          :columns="colunasClientes"
          :loading="loading"
          v-model:pagination="paginacao"
          class="data-table"
          table-class="data-table__body"
          table-header-class="data-table__header"
          @row-click="(_, row) => abrirEdicao(row)"
        >
          <template #body-cell-id="props">
            <q-td :props="props"><span class="id-badge">#{{ props.row.cliente_id }}</span></q-td>
          </template>

          <template #body-cell-cliente="props">
            <q-td :props="props">
              <div class="person-cell">
                <div class="client-avatar">{{ iniciais(props.row.nome) }}</div>
                <div>
                  <strong>{{ props.row.nome || 'Cliente sem nome' }}</strong>
                  <span>{{ props.row.razao_social || 'Pessoa física' }}</span>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-documento="props">
            <q-td :props="props">{{ formatarDocumento(props.row.cpf_cnpj) }}</q-td>
          </template>

          <template #body-cell-contato="props">
            <q-td :props="props">
              <div class="contact-cell">
                <div>
                  <q-icon name="mail_outline" size="15px" />
                  <span>{{ props.row.email || 'Não informado' }}</span>
                </div>
                <div>
                  <q-icon name="phone" size="15px" />
                  <span>{{ formatarTelefone(props.row.telefone) }}</span>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-localidade="props">
            <q-td :props="props">
              <span class="inline-muted">
                <q-icon name="location_on" />
                {{ props.row.cidade ? `${props.row.cidade}${props.row.uf ? ` / ${props.row.uf}` : ''}` : 'Não informada' }}
              </span>
            </q-td>
          </template>

          <template #body-cell-atividade="props">
            <q-td :props="props">
              <div class="activity-cell">
                <span>
                  <q-icon name="inventory_2" size="15px" />
                  {{ props.row.total_pedidos }}
                  {{ props.row.total_pedidos === 1 ? 'projeto' : 'projetos' }}
                </span>
                <span>
                  <q-icon name="storefront" size="15px" />
                  {{ props.row.total_lojistas }}
                  {{ props.row.total_lojistas === 1 ? 'lojista' : 'lojistas' }}
                </span>
              </div>
            </q-td>
          </template>

          <template #body-cell-acoes="props">
            <q-td :props="props" class="text-right">
              <q-btn
                flat round dense
                :icon="podeEditar ? 'edit' : 'visibility'"
                class="table-action-btn"
                @click.stop="abrirEdicao(props.row)"
              >
                <q-tooltip>
                  {{ podeEditar ? 'Abrir cadastro' : 'Visualizar cliente' }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template #no-data>
            <div class="empty-state">
              <div class="empty-state__icon">
                <q-icon name="groups" size="29px" />
              </div>

              <strong>
                {{
                  busca
                    ? 'Nenhum cliente encontrado'
                    : 'Nenhum cliente disponível'
                }}
              </strong>

              <span>
                {{
                  busca
                    ? 'Tente pesquisar utilizando outro termo.'
                    : 'Os clientes disponíveis para o seu perfil aparecerão aqui.'
                }}
              </span>
            </div>
          </template>
        </q-table>
      </div>

      <div class="mobile-list">
        <div v-if="loading" class="mobile-loading">
          <q-spinner color="orange" size="28px" />
          <span>Carregando clientes...</span>
        </div>

        <div
          v-else-if="clientesPaginadosMobile.length === 0"
          class="empty-state"
        >
          <div class="empty-state__icon">
            <q-icon name="groups" size="29px" />
          </div>
          <strong>Nenhum cliente encontrado</strong>
        </div>

        <article
          v-for="cliente in clientesPaginadosMobile"
          :key="cliente.cliente_id"
          class="mobile-card"
          @click="abrirEdicao(cliente)"
        >
          <div class="mobile-card__head">
            <div class="client-avatar client-avatar--mobile">
              {{ iniciais(cliente.nome) }}
            </div>

            <div class="mobile-card__identity">
              <strong>{{ cliente.nome || 'Cliente sem nome' }}</strong>
              <span>#{{ cliente.cliente_id }} · {{ formatarDocumento(cliente.cpf_cnpj) }}</span>
            </div>

            <q-icon name="chevron_right" size="20px" />
          </div>

          <div class="mobile-card__contacts">
            <span>
              <q-icon name="mail_outline" size="15px" />
              {{ cliente.email || 'Não informado' }}
            </span>
            <span>
              <q-icon name="phone" size="15px" />
              {{ formatarTelefone(cliente.telefone) }}
            </span>
            <span>
              <q-icon name="location_on" size="15px" />
              {{
                cliente.cidade
                  ? `${cliente.cidade}${cliente.uf ? ` / ${cliente.uf}` : ''}`
                  : 'Localidade não informada'
              }}
            </span>
          </div>

          <div class="mobile-card__stats">
            <span>
              <q-icon name="inventory_2" size="15px" />
              {{ cliente.total_pedidos }} projetos
            </span>
            <span>
              <q-icon name="storefront" size="15px" />
              {{ cliente.total_lojistas }} lojistas
            </span>
          </div>
        </article>
      </div>

      <div class="pagination-footer">
        <div class="pagination-footer__left">
          <span>Mostrar</span>
          <q-select v-model="paginacao.rowsPerPage" :options="[5,10,20,50]" outlined dense class="rows-select" />
          <span>por página</span>
        </div>

        <q-pagination
          v-model="paginacao.page"
          :max="numeroDePaginas"
          :max-pages="5"
          direction-links boundary-numbers round flat
          color="grey-7"
          active-color="orange"
          active-text-color="white"
          size="13px"
        />
      </div>
    </section>

    <q-dialog v-model="modalEdicao" persistent>
      <q-card class="cliente-dialog">
        <q-card-section class="workspace-head">
          <div class="workspace-identity">
            <div class="workspace-avatar">{{ iniciais(clienteEditando.nome) }}</div>
            <div>
              <div class="section-kicker">Cliente #{{ clienteEditando.cliente_id }}</div>
              <h2>{{ clienteEditando.nome || 'Ficha do cliente' }}</h2>
              <p>{{ clienteEditando.email || formatarDocumento(clienteEditando.cpf_cnpj) }}</p>
            </div>
          </div>

          <div class="workspace-summary">
            <div><span>Projetos</span><strong>{{ pedidosDoCliente.length }}</strong></div>
            <div><span>Lojistas</span><strong>{{ lojistasDoCliente.length }}</strong></div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="salvando"
            class="workspace-close"
            @click="fecharModal"
          />
        </q-card-section>

        <div class="workspace-tabbar-shell">
          <nav class="workspace-tabbar workspace-tabbar--four" aria-label="Seções do cliente">
            <button
              v-for="tab in tabs"
              :key="tab.name"
              type="button"
              class="workspace-tab-card"
              :class="{ 'workspace-tab-card--active': tabEdicao === tab.name }"
              @click="tabEdicao = tab.name"
            >
              <span class="workspace-tab-card__icon"><q-icon :name="tab.icon" size="20px" /></span>
              <span class="workspace-tab-card__copy">
                <span class="workspace-tab-card__title-row">
                  <strong>{{ tab.label }}</strong>
                  <span
                    v-if="tab.count !== null"
                    class="workspace-tab-count"
                  >
                    {{ tab.count }}
                  </span>
                </span>
                <small>{{ tab.description }}</small>
              </span>
              <span v-if="tabEdicao === tab.name" class="workspace-tab-card__active-mark"><q-icon name="check" size="12px" /></span>
            </button>
          </nav>
        </div>

        <q-card-section class="workspace-body">
          <q-tab-panels v-model="tabEdicao" class="workspace-panels">
            <!-- DADOS -->
            <q-tab-panel name="dados" class="workspace-panel">
              <q-form ref="formDados" @submit.prevent="salvarDados">
                <header class="tab-heading">
                  <div>
                    <div class="section-kicker">Cadastro</div>
                    <h3>Dados do cliente</h3>
                    <p>Identificação fiscal e informações de contato.</p>
                  </div>
                  <span class="client-record-badge">Registro #{{ clienteEditando.cliente_id }}</span>
                </header>

                <div class="form-card">
                  <div class="form-card__head">
                    <div class="form-card__number">01</div>
                    <div>
                      <strong>Identificação</strong>
                      <span>Nome, razão social e documento.</span>
                    </div>
                  </div>
                  <div class="form-grid">
                    <Field label="Nome completo *">
                      <q-input
                        v-model="clienteEditando.nome"
                        outlined dense color="orange"
                        :readonly="!podeEditar"
                        :rules="[
                          v => !!String(v || '').trim() || 'Informe o nome',
                          v => String(v || '').trim().includes(' ') || 'Informe nome e sobrenome'
                        ]"
                      />
                    </Field>

                    <Field label="Razão social">
                      <q-input v-model="clienteEditando.razao_social" outlined dense color="orange" :readonly="!podeEditar" />
                    </Field>

                    <Field label="CPF / CNPJ" full>
                      <q-input
                        :model-value="formatarCpfCnpjDigitacao(clienteEditando.cpf_cnpj)"
                        outlined
                        dense
                        color="orange"
                        maxlength="18"
                        :readonly="!podeEditar"
                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                        @update:model-value="atualizarCpfCnpj"
                        :rules="[
                          v => !v || [11, 14].includes(numeros(v).length) || 'Digite um CPF ou CNPJ completo',
                          v => validaCpfCnpj(v) || 'Documento inválido'
                        ]"
                      >
                        <template #prepend>
                          <q-icon name="badge" size="18px" />
                        </template>
                      </q-input>
                    </Field>
                  </div>
                </div>

                <div class="form-card">
                  <div class="form-card__head">
                    <div class="form-card__number">02</div>
                    <div>
                      <strong>Contato</strong>
                      <span>Informações para comunicação.</span>
                    </div>
                  </div>
                  <div class="form-grid">
                    <Field label="Telefone / WhatsApp">
                      <q-input
                        v-model="clienteEditando.telefone"
                        outlined dense color="orange"
                        mask="(##) #####-####"
                        unmasked-value
                        :readonly="!podeEditar"
                        :rules="[validarTelefone]"
                      />
                    </Field>

                    <Field label="E-mail">
                      <q-input
                        v-model="clienteEditando.email"
                        outlined dense color="orange"
                        type="email"
                        :readonly="!podeEditar"
                        :rules="[validarEmail]"
                      />
                    </Field>
                  </div>
                </div>

                <div class="metadata-card">
                  <div><span>Criado em</span><strong>{{ formatarData(clienteEditando.created_at) }}</strong></div>
                  <div><span>Última modificação</span><strong>{{ formatarData(clienteEditando.updated_at) }}</strong></div>
                </div>

                <footer class="tab-actions">
                  <q-btn flat no-caps label="Fechar" @click="fecharModal" />
                  <q-btn v-if="podeEditar" unelevated no-caps type="submit" icon="save" label="Salvar dados" :loading="salvando" class="save-btn" />
                </footer>
              </q-form>
            </q-tab-panel>

            <!-- ENDEREÇO -->
            <q-tab-panel name="endereco" class="workspace-panel">
              <q-form ref="formEndereco" @submit.prevent="salvarEndereco">
                <header class="tab-heading">
                  <div>
                    <div class="section-kicker">Localização</div>
                    <h3>Endereço do cliente</h3>
                    <p>Endereço principal e informações específicas para entrega.</p>
                  </div>
                </header>

                <div class="form-card">
                  <div class="form-card__head">
                    <div class="form-card__number">01</div>
                    <div>
                      <strong>Endereço principal</strong>
                      <span>Localização cadastral do cliente.</span>
                    </div>
                  </div>

                  <div class="address-grid">
                    <Field label="CEP">
                      <q-input
                        v-model="clienteEditando.cep"
                        outlined dense color="orange"
                        mask="#####-###" unmasked-value
                        :readonly="!podeEditar"
                        :rules="[v => !v || String(v).replace(/\D/g,'').length === 8 || 'Informe 8 dígitos']"
                      />
                    </Field>

                    <Field label="Logradouro" wide>
                      <q-input v-model="clienteEditando.endereco" outlined dense color="orange" :readonly="!podeEditar" />
                    </Field>

                    <Field label="Número">
                      <q-input v-model="clienteEditando.numero" outlined dense color="orange" :readonly="!podeEditar" />
                    </Field>

                    <Field label="Bairro">
                      <q-input v-model="clienteEditando.bairro" outlined dense color="orange" :readonly="!podeEditar" />
                    </Field>

                    <Field label="Cidade" wide>
                      <q-input v-model="clienteEditando.cidade" outlined dense color="orange" :readonly="!podeEditar" />
                    </Field>

                    <Field label="UF">
                      <q-input
                        v-model="clienteEditando.uf"
                        outlined dense color="orange"
                        maxlength="2"
                        :readonly="!podeEditar"
                        @update:model-value="v => clienteEditando.uf = v ? String(v).toUpperCase().replace(/[^A-Z]/g,'').slice(0,2) : ''"
                      />
                    </Field>
                  </div>
                </div>

                <div class="form-card">
                  <div class="form-card__head">
                    <div class="form-card__number">02</div>
                    <div>
                      <strong>Local de entrega</strong>
                      <span>Referência ou endereço específico da obra.</span>
                    </div>
                  </div>
                  <Field label="Endereço de entrega detalhado" full>
                    <q-input
                      v-model="clienteEditando.endereco_entrega"
                      outlined type="textarea" rows="3" color="orange"
                      :readonly="!podeEditar"
                    />
                  </Field>
                </div>

                <footer class="tab-actions">
                  <q-btn flat no-caps label="Fechar" @click="fecharModal" />
                  <q-btn v-if="podeEditar" unelevated no-caps type="submit" icon="save" label="Salvar endereço" :loading="salvando" class="save-btn" />
                </footer>
              </q-form>
            </q-tab-panel>

            <!-- PROJETOS -->
            <q-tab-panel
              name="pedidos"
              class="workspace-panel"
            >
              <div class="tab-heading">
                <div>
                  <div class="section-kicker">Somente leitura</div>
                  <h3>Projetos do cliente</h3>
                  <p>
                    Visualização resumida dos projetos vinculados a este cliente.
                  </p>
                </div>
              </div>

              <div class="related-summary related-summary--three">
                <article>
                  <div class="related-summary__icon">
                    <q-icon name="inventory_2" size="20px" />
                  </div>
                  <div>
                    <span>Total de projetos</span>
                    <strong>{{ pedidosDoCliente.length }}</strong>
                  </div>
                </article>

                <article>
                  <div class="related-summary__icon">
                    <q-icon name="payments" size="20px" />
                  </div>
                  <div>
                    <span>Volume financeiro</span>
                    <strong>{{ formatarMoeda(valorTotalPedidos) }}</strong>
                  </div>
                </article>

                <article>
                  <div class="related-summary__icon">
                    <q-icon name="storefront" size="20px" />
                  </div>
                  <div>
                    <span>Lojistas envolvidos</span>
                    <strong>{{ lojistasDoCliente.length }}</strong>
                  </div>
                </article>
              </div>

              <div class="related-toolbar related-toolbar--orders">
                <q-input
                  v-model="buscaPedidos"
                  outlined
                  dense
                  clearable
                  debounce="250"
                  class="search-field search-field--related"
                  placeholder="Pesquisar projeto ou lojista..."
                >
                  <template #prepend>
                    <q-icon name="search" size="18px" />
                  </template>
                </q-input>

                <q-select
                  v-model="filtroStatusPedido"
                  :options="opcoesStatusPedido"
                  emit-value
                  map-options
                  outlined
                  dense
                  class="status-filter"
                  label="Status"
                />
              </div>

              <div class="orders-desktop">
                <q-table
                  flat
                  hide-bottom
                  row-key="id"
                  :rows="pedidosFiltrados"
                  :columns="colunasPedidos"
                  v-model:pagination="paginacaoPedidos"
                  class="related-table"
                  table-class="related-table__body"
                  table-header-class="related-table__header"
                >
                  <template #body-cell-projeto="props">
                    <q-td :props="props">
                      <div class="project-cell">
                        <div class="project-icon">
                          <q-icon name="inventory_2" size="18px" />
                        </div>
                        <div>
                          <strong>{{ props.row.nome_projeto || 'Projeto sem nome' }}</strong>
                          <span>#{{ props.row.id }}</span>
                        </div>
                      </div>
                    </q-td>
                  </template>

                  <template #body-cell-lojista="props">
                    <q-td :props="props">
                      <div class="client-cell">
                        <strong>{{ props.row.lojista || 'Lojista não informado' }}</strong>
                        <span>Lojista #{{ props.row.id_lojista }}</span>
                      </div>
                    </q-td>
                  </template>

                  <template #body-cell-status="props">
                    <q-td :props="props">
                      <span
                        class="status-badge"
                        :style="statusStyle(props.row.cor)"
                      >
                        <span
                          class="status-badge__dot"
                          :style="{ background: props.row.cor || '#ff7b00' }"
                        ></span>
                        {{ props.row.status || 'Sem status' }}
                      </span>
                    </q-td>
                  </template>

                  <template #body-cell-valor="props">
                    <q-td :props="props">
                      <strong class="money-cell">
                        {{ formatarMoeda(props.row.valor) }}
                      </strong>
                    </q-td>
                  </template>

                  <template #body-cell-datas="props">
                    <q-td :props="props">
                      <div class="dates-cell">
                        <span>Pedido: {{ formatarDataCurta(props.row.data_pedido) }}</span>
                        <span>Previsão: {{ formatarDataCurta(props.row.data_previsao_pedido) }}</span>
                      </div>
                    </q-td>
                  </template>

                  <template #no-data>
                    <div class="empty-state empty-state--related">
                      <div class="empty-state__icon">
                        <q-icon name="inventory_2" size="28px" />
                      </div>
                      <strong>Nenhum projeto encontrado</strong>
                      <span>Não há projetos para os filtros informados.</span>
                    </div>
                  </template>
                </q-table>
              </div>

              <div class="orders-mobile">
                <article
                  v-for="pedido in pedidosPaginadosMobile"
                  :key="pedido.id"
                  class="order-mobile-card"
                >
                  <div class="order-mobile-card__top">
                    <div class="project-icon">
                      <q-icon name="inventory_2" size="18px" />
                    </div>
                    <div>
                      <strong>{{ pedido.nome_projeto || 'Projeto sem nome' }}</strong>
                      <span>#{{ pedido.id }}</span>
                    </div>
                  </div>

                  <span
                    class="status-badge"
                    :style="statusStyle(pedido.cor)"
                  >
                    <span
                      class="status-badge__dot"
                      :style="{ background: pedido.cor || '#ff7b00' }"
                    ></span>
                    {{ pedido.status || 'Sem status' }}
                  </span>

                  <div class="order-mobile-card__grid">
                    <div>
                      <span>Lojista</span>
                      <strong>{{ pedido.lojista || '—' }}</strong>
                    </div>
                    <div>
                      <span>Valor</span>
                      <strong>{{ formatarMoeda(pedido.valor) }}</strong>
                    </div>
                    <div>
                      <span>Pedido</span>
                      <strong>{{ formatarDataCurta(pedido.data_pedido) }}</strong>
                    </div>
                    <div>
                      <span>Previsão</span>
                      <strong>{{ formatarDataCurta(pedido.data_previsao_pedido) }}</strong>
                    </div>
                  </div>
                </article>
              </div>

              <div
                v-if="pedidosFiltrados.length"
                class="related-pagination"
              >
                <q-pagination
                  v-model="paginacaoPedidos.page"
                  :max="numeroPaginasPedidos"
                  :max-pages="5"
                  direction-links
                  round
                  flat
                  color="grey-7"
                  active-color="orange"
                  active-text-color="white"
                  size="12px"
                />
              </div>
            </q-tab-panel>

            <!-- LOJISTAS -->
            <q-tab-panel
              name="lojistas"
              class="workspace-panel"
            >
              <div class="tab-heading">
                <div>
                  <div class="section-kicker">Relacionamento comercial</div>
                  <h3>Lojistas que já atenderam o cliente</h3>
                  <p>
                    Histórico consolidado dos projetos do cliente agrupados por lojista.
                  </p>
                </div>
              </div>

              <div class="related-summary related-summary--three">
                <article>
                  <div class="related-summary__icon">
                    <q-icon name="storefront" size="20px" />
                  </div>
                  <div>
                    <span>Lojistas únicos</span>
                    <strong>{{ lojistasDoCliente.length }}</strong>
                  </div>
                </article>

                <article>
                  <div class="related-summary__icon">
                    <q-icon name="inventory_2" size="20px" />
                  </div>
                  <div>
                    <span>Projetos realizados</span>
                    <strong>{{ pedidosDoCliente.length }}</strong>
                  </div>
                </article>

                <article>
                  <div class="related-summary__icon">
                    <q-icon name="payments" size="20px" />
                  </div>
                  <div>
                    <span>Volume da carteira</span>
                    <strong>{{ formatarMoeda(valorTotalPedidos) }}</strong>
                  </div>
                </article>
              </div>

              <div class="related-toolbar">
                <q-input
                  v-model="buscaLojistas"
                  outlined
                  dense
                  clearable
                  debounce="250"
                  class="search-field search-field--related"
                  placeholder="Pesquisar lojista ou projeto..."
                >
                  <template #prepend>
                    <q-icon name="search" size="18px" />
                  </template>
                </q-input>

                <span class="related-count">
                  {{ lojistasFiltrados.length }}
                  {{ lojistasFiltrados.length === 1 ? 'lojista' : 'lojistas' }}
                </span>
              </div>

              <div class="stores-desktop">
                <q-table
                  flat
                  hide-bottom
                  row-key="id_lojista"
                  :rows="lojistasFiltrados"
                  :columns="colunasLojistas"
                  v-model:pagination="paginacaoLojistas"
                  class="related-table"
                  table-class="related-table__body"
                  table-header-class="related-table__header"
                >
                  <template #body-cell-lojista="props">
                    <q-td :props="props">
                      <div class="person-cell">
                        <div class="store-avatar">
                          <q-icon name="storefront" size="18px" />
                        </div>
                        <div>
                          <strong>{{ props.row.lojista }}</strong>
                          <span>Lojista #{{ props.row.id_lojista }}</span>
                        </div>
                      </div>
                    </q-td>
                  </template>

                  <template #body-cell-projetos="props">
                    <q-td :props="props">
                      <div class="relationship-cell">
                        <strong>
                          {{ props.row.total_pedidos }}
                          {{ props.row.total_pedidos === 1 ? 'projeto' : 'projetos' }}
                        </strong>
                        <span>{{ formatarMoeda(props.row.valor_total) }}</span>
                      </div>
                    </q-td>
                  </template>

                  <template #body-cell-ultimo="props">
                    <q-td :props="props">
                      <div class="last-project-cell">
                        <div class="last-project-cell__icon">
                          <q-icon name="inventory_2" size="17px" />
                        </div>
                        <div class="last-project-cell__copy">
                          <strong>{{ props.row.ultimo_projeto_nome || 'Projeto sem nome' }}</strong>
                          <span>
                            #{{ props.row.ultimo_projeto_id || '—' }} ·
                            {{ formatarDataCurta(props.row.ultimo_pedido) }}
                          </span>
                        </div>
                        <div class="last-project-cell__value">
                          {{ formatarMoeda(props.row.ultimo_projeto_valor) }}
                        </div>
                      </div>
                    </q-td>
                  </template>

                  <template #body-cell-status="props">
                    <q-td :props="props">
                      <span
                        class="status-badge"
                        :style="statusStyle(props.row.ultimo_status_cor)"
                      >
                        <span
                          class="status-badge__dot"
                          :style="{ background: props.row.ultimo_status_cor || '#ff7b00' }"
                        ></span>
                        {{ props.row.ultimo_status || 'Sem status' }}
                      </span>
                    </q-td>
                  </template>

                  <template #no-data>
                    <div class="empty-state empty-state--related">
                      <div class="empty-state__icon">
                        <q-icon name="storefront" size="28px" />
                      </div>
                      <strong>Nenhum lojista encontrado</strong>
                      <span>
                        Este cliente ainda não possui projetos com lojistas visíveis para o seu perfil.
                      </span>
                    </div>
                  </template>
                </q-table>
              </div>

              <div class="stores-mobile">
                <article
                  v-for="lojista in lojistasPaginadosMobile"
                  :key="lojista.id_lojista"
                  class="relationship-mobile-card"
                >
                  <div class="relationship-mobile-card__head">
                    <div class="store-avatar">
                      <q-icon name="storefront" size="18px" />
                    </div>
                    <div>
                      <strong>{{ lojista.lojista }}</strong>
                      <span>Lojista #{{ lojista.id_lojista }}</span>
                    </div>
                  </div>

                  <div class="relationship-mobile-card__stats">
                    <div>
                      <span>Projetos</span>
                      <strong>{{ lojista.total_pedidos }}</strong>
                    </div>
                    <div>
                      <span>Volume</span>
                      <strong>{{ formatarMoeda(lojista.valor_total) }}</strong>
                    </div>
                  </div>

                  <div class="relationship-mobile-card__last">
                    <div class="last-project-cell__icon">
                      <q-icon name="inventory_2" size="17px" />
                    </div>
                    <div>
                      <span>Último projeto</span>
                      <strong>
                        #{{ lojista.ultimo_projeto_id || '—' }} ·
                        {{ lojista.ultimo_projeto_nome || 'Projeto sem nome' }}
                      </strong>
                      <small>
                        {{ formatarDataCurta(lojista.ultimo_pedido) }} ·
                        {{ formatarMoeda(lojista.ultimo_projeto_valor) }}
                      </small>
                    </div>
                  </div>

                  <span
                    class="status-badge relationship-mobile-card__status"
                    :style="statusStyle(lojista.ultimo_status_cor)"
                  >
                    <span
                      class="status-badge__dot"
                      :style="{ background: lojista.ultimo_status_cor || '#ff7b00' }"
                    ></span>
                    {{ lojista.ultimo_status || 'Sem status' }}
                  </span>
                </article>
              </div>

              <div
                v-if="lojistasFiltrados.length"
                class="related-pagination"
              >
                <q-pagination
                  v-model="paginacaoLojistas.page"
                  :max="numeroPaginasLojistas"
                  :max-pages="5"
                  direction-links
                  round
                  flat
                  color="grey-7"
                  active-color="orange"
                  active-text-color="white"
                  size="12px"
                />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
defineOptions({ name: 'ClientesPage' })

import { h, ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'

const Field = (props, { slots }) =>
  h('div', {
    class: [
      'field-block',
      props.full ? 'field-block--full' : '',
      props.wide ? 'field-block--wide' : ''
    ]
  }, [
    h('span', { class: 'field-label' }, props.label),
    slots.default?.()
  ])
Field.props = { label: String, full: Boolean, wide: Boolean }


const $q = useQuasar()
const authStore = useAuthStore()

const podeEditar = computed(() =>
  ['admin', 'lojista'].includes(
    String(authStore.userTipo || '').toLowerCase()
  )
)

const formDados = ref(null)
const formEndereco = ref(null)

const loading = ref(true)
const salvando = ref(false)
const clientes = ref([])
const todosPedidos = ref([])
const busca = ref('')

const modalEdicao = ref(false)
const clienteEditando = ref({})
const tabEdicao = ref('dados')


const buscaPedidos = ref('')
const buscaLojistas = ref('')
const filtroStatusPedido = ref('todos')

const paginacao = ref({ sortBy: 'nome', descending: false, page: 1, rowsPerPage: 10 })
const paginacaoPedidos = ref({ page: 1, rowsPerPage: 7 })
const paginacaoLojistas = ref({ page: 1, rowsPerPage: 7 })

const headers = computed(() => ({ Authorization: `Bearer ${authStore.token}` }))

const colunasClientes = [
  { name: 'id', field: 'cliente_id', label: 'ID', align: 'left', sortable: true },
  { name: 'cliente', field: 'nome', label: 'Cliente / Empresa', align: 'left', sortable: true },
  { name: 'documento', field: 'cpf_cnpj', label: 'CPF / CNPJ', align: 'left' },
  { name: 'contato', field: 'telefone', label: 'Contato', align: 'left' },
  { name: 'localidade', field: 'cidade', label: 'Localidade', align: 'left', sortable: true },
  { name: 'atividade', field: 'total_pedidos', label: 'Atividade', align: 'left' },
  { name: 'acoes', field: 'acoes', label: '', align: 'right' }
]

const colunasPedidos = [
  { name: 'projeto', field: 'nome_projeto', label: 'Projeto', align: 'left', sortable: true },
  { name: 'lojista', field: 'lojista', label: 'Lojista', align: 'left', sortable: true },
  { name: 'status', field: 'status', label: 'Status', align: 'left', sortable: true },
  { name: 'valor', field: 'valor', label: 'Valor', align: 'left', sortable: true },
  { name: 'datas', field: 'data_pedido', label: 'Datas', align: 'left', sortable: true }
]

const colunasLojistas = [
  { name: 'lojista', field: 'lojista', label: 'Lojista', align: 'left', sortable: true },
  { name: 'projetos', field: 'total_pedidos', label: 'Relacionamento', align: 'left', sortable: true },
  { name: 'ultimo', field: 'ultimo_pedido', label: 'Último projeto', align: 'left', sortable: true },
  { name: 'status', field: 'ultimo_status', label: 'Status mais recente', align: 'left' }
]

const clientesEnriquecidos = computed(() =>
  clientes.value.map(cliente => {
    const pedidos = todosPedidos.value.filter(p => String(p.id_cliente) === String(cliente.cliente_id))
    return {
      ...cliente,
      total_pedidos: pedidos.length,
      total_lojistas: new Set(pedidos.map(p => p.id_lojista).filter(Boolean).map(String)).size
    }
  })
)

const totalLojistasAtendimento = computed(() =>
  new Set(todosPedidos.value.map(p => p.id_lojista).filter(Boolean).map(String)).size
)

const clientesFiltrados = computed(() => {
  const termo = String(busca.value || '').trim().toLowerCase()
  if (!termo) return clientesEnriquecidos.value

  return clientesEnriquecidos.value.filter(c =>
    [c.cliente_id, c.nome, c.razao_social, c.cpf_cnpj, c.email, c.telefone, c.cidade, c.uf]
      .some(v => String(v ?? '').toLowerCase().includes(termo))
  )
})

const numeroDePaginas = computed(() => {
  const limit = Number(paginacao.value.rowsPerPage)
  return limit === 0 ? 1 : Math.ceil(clientesFiltrados.value.length / limit) || 1
})

const clientesPaginadosMobile = computed(() => {
  const limit = Number(paginacao.value.rowsPerPage)
  if (!limit) return clientesFiltrados.value
  const start = (Number(paginacao.value.page) - 1) * limit
  return clientesFiltrados.value.slice(start, start + limit)
})

const pedidosDoCliente = computed(() =>
  clienteEditando.value.cliente_id
    ? todosPedidos.value.filter(p => String(p.id_cliente) === String(clienteEditando.value.cliente_id))
    : []
)

const valorTotalPedidos = computed(() =>
  pedidosDoCliente.value.reduce((sum, p) => sum + Number(p.valor || 0), 0)
)


const opcoesStatusPedido = computed(() => [
  { label: 'Todos os status', value: 'todos' },
  ...[...new Set(pedidosDoCliente.value.map(p => p.status).filter(Boolean).map(String))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map(s => ({ label: s, value: s }))
])

const pedidosFiltrados = computed(() => {
  const termo = String(buscaPedidos.value || '').trim().toLowerCase()
  return pedidosDoCliente.value.filter(p => {
    const statusOk = filtroStatusPedido.value === 'todos' || String(p.status || '') === String(filtroStatusPedido.value)
    const searchOk = !termo || [p.id, p.nome_projeto, p.lojista, p.status].some(v => String(v ?? '').toLowerCase().includes(termo))
    return statusOk && searchOk
  })
})

const numeroPaginasPedidos = computed(() =>
  Math.ceil(pedidosFiltrados.value.length / Number(paginacaoPedidos.value.rowsPerPage || 7)) || 1
)

const pedidosPaginadosMobile = computed(() => {
  const limit = Number(paginacaoPedidos.value.rowsPerPage || 7)
  const start = (Number(paginacaoPedidos.value.page) - 1) * limit
  return pedidosFiltrados.value.slice(start, start + limit)
})

const lojistasDoCliente = computed(() => {
  const mapa = new Map()

  for (const pedido of pedidosDoCliente.value) {
    if (!pedido.id_lojista) continue
    const id = String(pedido.id_lojista)

    if (!mapa.has(id)) {
      mapa.set(id, {
        id_lojista: pedido.id_lojista,
        lojista: pedido.lojista || `Lojista #${pedido.id_lojista}`,
        total_pedidos: 0,
        valor_total: 0,
        ultimo_pedido: null,
        ultimo_projeto_id: null,
        ultimo_projeto_nome: null,
        ultimo_projeto_valor: 0,
        ultimo_status: null,
        ultimo_status_cor: null
      })
    }

    const item = mapa.get(id)
    item.total_pedidos += 1
    item.valor_total += Number(pedido.valor || 0)

    const data = pedido.data_pedido ? String(pedido.data_pedido).slice(0, 10) : null
    const deveAtualizarUltimo =
      data &&
      (
        !item.ultimo_pedido ||
        data > item.ultimo_pedido ||
        (
          data === item.ultimo_pedido &&
          Number(pedido.id || 0) > Number(item.ultimo_projeto_id || 0)
        )
      )

    if (deveAtualizarUltimo) {
      item.ultimo_pedido = data
      item.ultimo_projeto_id = pedido.id
      item.ultimo_projeto_nome = pedido.nome_projeto || 'Projeto sem nome'
      item.ultimo_projeto_valor = Number(pedido.valor || 0)
      item.ultimo_status = pedido.status || 'Sem status'
      item.ultimo_status_cor = pedido.cor || '#ff7b00'
    }
  }

  return [...mapa.values()].sort((a, b) => a.lojista.localeCompare(b.lojista, 'pt-BR'))
})

const lojistasFiltrados = computed(() => {
  const termo = String(buscaLojistas.value || '').trim().toLowerCase()
  if (!termo) return lojistasDoCliente.value

  return lojistasDoCliente.value.filter(l =>
    [l.id_lojista, l.lojista, l.ultimo_projeto_id, l.ultimo_projeto_nome, l.ultimo_status]
      .some(v => String(v ?? '').toLowerCase().includes(termo))
  )
})

const numeroPaginasLojistas = computed(() =>
  Math.ceil(lojistasFiltrados.value.length / Number(paginacaoLojistas.value.rowsPerPage || 7)) || 1
)

const lojistasPaginadosMobile = computed(() => {
  const limit = Number(paginacaoLojistas.value.rowsPerPage || 7)
  const start = (Number(paginacaoLojistas.value.page) - 1) * limit
  return lojistasFiltrados.value.slice(start, start + limit)
})


const tabs = computed(() => [
  { name: 'dados', icon: 'person_outline', label: 'Dados cadastrais', description: 'Identificação e contato', count: null },
  { name: 'endereco', icon: 'location_on', label: 'Endereço', description: 'Localização e entrega', count: null },
  { name: 'pedidos', icon: 'inventory_2', label: 'Projetos', description: 'Histórico de projetos', count: pedidosDoCliente.value.length },
  { name: 'lojistas', icon: 'storefront', label: 'Lojistas', description: 'Histórico comercial', count: lojistasDoCliente.value.length }
])

watch(() => busca.value, () => { paginacao.value.page = 1 })
watch(() => paginacao.value.rowsPerPage, () => { paginacao.value.page = 1 })
watch([() => buscaPedidos.value, () => filtroStatusPedido.value], () => { paginacaoPedidos.value.page = 1 })
watch(() => buscaLojistas.value, () => { paginacaoLojistas.value.page = 1 })

watch(numeroDePaginas, max => {
  if (paginacao.value.page > max) paginacao.value.page = max
})

watch(numeroPaginasPedidos, max => {
  if (paginacaoPedidos.value.page > max) paginacaoPedidos.value.page = max
})

watch(numeroPaginasLojistas, max => {
  if (paginacaoLojistas.value.page > max) paginacaoLojistas.value.page = max
})

const validarEmail = email =>
  !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || 'Formato de e-mail inválido'

const validarTelefone = tel => {
  if (!tel) return true
  const clean = String(tel).replace(/\D/g, '')
  return (clean.length >= 10 && clean.length <= 11) || 'Telefone deve ter DDD + 8 ou 9 dígitos'
}

async function carregarBase() {
  loading.value = true
  try {
    const [clientesResponse, pedidosResponse] = await Promise.all([
      api.get('/clientes', { headers: headers.value }),
      api.get('/pedidos', { headers: headers.value })
    ])

    clientes.value = (clientesResponse.data.data || clientesResponse.data || []).map(c => ({
      ...c,
      cliente_id: c.cliente_id ?? c.id
    }))

    todosPedidos.value = pedidosResponse.data.data || pedidosResponse.data || []
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Erro ao carregar os dados de clientes.',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

function abrirEdicao(cliente) {
  buscaPedidos.value = ''
  buscaLojistas.value = ''
  filtroStatusPedido.value = 'todos'
  clienteEditando.value = JSON.parse(JSON.stringify(cliente))

  if (clienteEditando.value.cpf_cnpj) {
    clienteEditando.value.cpf_cnpj =
      formatarCpfCnpjDigitacao(clienteEditando.value.cpf_cnpj)
  }

  tabEdicao.value = 'dados'
  modalEdicao.value = true
}

function fecharModal() {
  if (!salvando.value) modalEdicao.value = false
}

async function salvarDados() {
if (!podeEditar.value) return
  if (!(await formDados.value.validate())) return

  await executarPatch({
    nome: normalizar(clienteEditando.value.nome),
    razao_social: normalizar(clienteEditando.value.razao_social),
    cpf_cnpj: numeros(clienteEditando.value.cpf_cnpj),
    telefone: numeros(clienteEditando.value.telefone),
    email: normalizar(clienteEditando.value.email)
  }, 'Dados do cliente atualizados com sucesso.')
}

async function salvarEndereco() {
if (!podeEditar.value) return
  if (!(await formEndereco.value.validate())) return

  await executarPatch({
    cep: numeros(clienteEditando.value.cep),
    endereco: normalizar(clienteEditando.value.endereco),
    numero: normalizar(clienteEditando.value.numero),
    bairro: normalizar(clienteEditando.value.bairro),
    cidade: normalizar(clienteEditando.value.cidade),
    uf: normalizar(clienteEditando.value.uf).toUpperCase(),
    endereco_entrega: normalizar(clienteEditando.value.endereco_entrega)
  }, 'Endereço atualizado com sucesso.')
}

async function executarPatch(payload, mensagem) {
  const id = clienteEditando.value.cliente_id
  if (!id) return

  salvando.value = true
  try {
    const response = await api.patch(`/clientes/${id}`, payload, { headers: headers.value })
    const data = response.data.data || response.data || {}

    clienteEditando.value = {
      ...clienteEditando.value,
      ...data,
      cliente_id: data.cliente_id ?? data.id ?? clienteEditando.value.cliente_id
    }

    $q.notify({ type: 'positive', message: mensagem, icon: 'check_circle', position: 'top-right' })
    await carregarBase()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Falha ao salvar os dados do cliente.',
      position: 'top-right'
    })
  } finally {
    salvando.value = false
  }
}

const normalizar = v => String(v ?? '').trim()
const numeros = v => String(v ?? '').replace(/\D/g, '')

function formatarCpfCnpjDigitacao(valor) {
  const digits = numeros(valor).slice(0, 14)

  if (!digits) {
    return ''
  }

  // Enquanto houver até 11 dígitos, aplica a máscara progressiva de CPF.
  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4')
  }

  // A partir do 12º dígito, muda automaticamente para a máscara de CNPJ.
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5')
}

function atualizarCpfCnpj(valor) {
  clienteEditando.value.cpf_cnpj =
    formatarCpfCnpjDigitacao(valor)
}

function statusStyle(cor) {
  const c = cor || '#ff7b00'
  return { color: c, borderColor: `${c}35`, background: `${c}12` }
}

function iniciais(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean)
  if (!partes.length) return 'C'
  return (partes.length === 1 ? partes[0][0] : partes[0][0] + partes.at(-1)[0]).toUpperCase()
}

function formatarData(dataISO) {
  if (!dataISO) return '---'
  const d = new Date(dataISO)
  return Number.isNaN(d.getTime()) ? '---' : d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatarDataCurta(dataISO) {
  if (!dataISO) return 'Não definido'
  const d = new Date(`${String(dataISO).slice(0,10)}T12:00:00`)
  return Number.isNaN(d.getTime()) ? 'Não definido' : d.toLocaleDateString('pt-BR')
}

function formatarDocumento(val) {
  if (!val) return 'Não informado'
  const clean = String(val).replace(/\D/g, '')
  if (clean.length === 11) return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  if (clean.length === 14) return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  return val
}

function formatarTelefone(val) {
  if (!val) return 'Não informado'
  const clean = String(val).replace(/\D/g, '')
  if (clean.length === 11) return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (clean.length === 10) return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return val
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function validaCpfCnpj(val) {
  if (!val) return true
  const n = String(val).replace(/\D/g, '')
  if (/^(\d)\1+$/.test(n)) return false

  if (n.length === 11) {
    let soma = 0
    for (let i = 0; i < 9; i++) soma += Number(n[i]) * (10 - i)
    let d1 = 11 - (soma % 11)
    if (d1 >= 10) d1 = 0
    if (d1 !== Number(n[9])) return false

    soma = 0
    for (let i = 0; i < 10; i++) soma += Number(n[i]) * (11 - i)
    let d2 = 11 - (soma % 11)
    if (d2 >= 10) d2 = 0
    return d2 === Number(n[10])
  }

  if (n.length === 14) {
    const calc = base => {
      let pos = base.length - 7, soma = 0
      for (let i = base.length; i >= 1; i--) {
        soma += Number(base[base.length - i]) * pos--
        if (pos < 2) pos = 9
      }
      const r = soma % 11
      return r < 2 ? 0 : 11 - r
    }
    const d1 = calc(n.slice(0, 12))
    const d2 = calc(n.slice(0, 12) + d1)
    return d1 === Number(n[12]) && d2 === Number(n[13])
  }

  return false
}

onMounted(carregarBase)
</script>

<style scoped>
.clientes-page {
  padding: 28px 28px 52px;
  color: var(--text-base);
}

.panel {
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-soft);
}

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
  min-width: 430px;
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
  font-size: 8px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: .07em;
}

.hero-summary__item strong {
  margin-top: 5px;
  color: var(--text-strong);
  font-size: 15px;
}

.hero-summary__divider {
  width: 1px;
  margin: 0 14px;
  background: var(--border-soft);
}

.clientes-panel {
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

.list-toolbar > div {
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
  gap: 9px;
  min-width: 0;
}

.search-field {
  width: 330px;
  min-width: 0;
}

.search-field :deep(.q-field__control),
.rows-select :deep(.q-field__control),
.status-filter :deep(.q-field__control) {
  color: var(--text-strong);
  background: var(--surf-2);
  border-radius: 9px;
}

.search-field :deep(.q-field__native),
.search-field :deep(.q-field__input),
.search-field :deep(.q-field__prepend),
.rows-select :deep(.q-field__native),
.status-filter :deep(.q-field__native),
.status-filter :deep(.q-field__input) {
  color: var(--text-strong);
}

.search-field :deep(.q-field__control:before),
.rows-select :deep(.q-field__control:before),
.status-filter :deep(.q-field__control:before) {
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

.data-table,
.related-table {
  background: transparent;
}

:deep(.data-table__header),
:deep(.related-table__header) {
  background: var(--surf-2);
}

:deep(.data-table__header th),
:deep(.related-table__header th) {
  padding: 12px 16px !important;
  color: var(--text-muted) !important;
  border-bottom: 1px solid var(--border-soft) !important;
  font-size: 8.5px;
  font-weight: 800 !important;
  letter-spacing: .07em;
  text-transform: uppercase;
}

:deep(.data-table__body tbody td),
:deep(.related-table__body tbody td) {
  padding: 12px 16px !important;
  color: var(--text-base);
  border-bottom: 1px solid var(--border-soft) !important;
}

:deep(.data-table__body tbody tr) {
  cursor: pointer;
}

:deep(.data-table__body tbody tr:hover),
:deep(.related-table__body tbody tr:hover) {
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
  font-size: 10px;
  font-weight: 750;
}

.person-cell,
.project-cell,
.representative-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.store-avatar,
.client-avatar {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .14);
  border-radius: 11px;
  font-size: 10px;
  font-weight: 850;
}

.person-cell strong,
.person-cell span,
.project-cell strong,
.project-cell span,
.representative-cell strong,
.representative-cell span {
  display: block;
}

.person-cell strong,
.project-cell strong,
.representative-cell strong {
  color: var(--text-strong);
  font-size: 10.5px;
}

.person-cell span,
.project-cell span,
.representative-cell span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8.3px;
}

.representative-cell__icon {
  width: 33px;
  height: 33px;
  flex: 0 0 33px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 10px;
}

.contact-cell,
.activity-cell {
  display: grid;
  gap: 5px;
}

.contact-cell div,
.activity-cell span {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: var(--text-muted);
  font-size: 9px;
}

.contact-cell span {
  overflow-wrap: anywhere;
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
  max-width: 360px;
  font-size: 9px;
  line-height: 1.45;
}

.empty-state--related {
  min-height: 190px;
}

.mobile-list {
  display: none;
  padding: 12px;
  background: var(--surf-2);
}

.mobile-card {
  margin-bottom: 10px;
  padding: 14px;
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 13px;
  box-shadow: var(--shadow-soft);
  cursor: pointer;
}

.mobile-card__head {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 10px;
}

.store-avatar--mobile {
  width: 42px;
  height: 42px;
  flex-basis: 42px;
}

.mobile-card__identity strong,
.mobile-card__identity span {
  display: block;
}

.mobile-card__identity strong {
  color: var(--text-strong);
  font-size: 11px;
}

.mobile-card__identity span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8.5px;
}

.mobile-card__representative {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 10px;
}

.mobile-card__representative div {
  min-width: 0;
}

.mobile-card__representative span,
.mobile-card__representative strong {
  display: block;
}

.mobile-card__representative span {
  color: var(--text-muted);
  font-size: 7.5px;
  text-transform: uppercase;
}

.mobile-card__representative strong {
  margin-top: 2px;
  color: var(--text-strong);
  font-size: 9px;
}

.mobile-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 10px;
}

.mobile-card__stats span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 8.5px;
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

/* WORKSPACE */
.cliente-dialog {
  width: min(1180px, calc(100vw - 28px));
  height: min(880px, calc(100vh - 28px));
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

.workspace-head {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    auto
    36px;
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
  margin: 5px 0 2px;
  color: var(--text-strong);
  font-size: 18px;
  line-height: 1.2;
  font-weight: 800;
  overflow-wrap: anywhere;
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
  font-size: 12px;
}

.workspace-close {
  color: var(--text-muted);
}

/* PREMIUM TABS */
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
  gap: 9px;
  width: 100%;
  min-width: 0;
}

.workspace-tabbar--four {
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
}

.workspace-tab-card {
  position: relative;
  min-width: 0;
  min-height: 64px;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
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

.workspace-tab-card:not(.workspace-tab-card--disabled):hover {
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
  min-width: 0;
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

.workspace-tab-lock {
  color: var(--text-muted);
}

.workspace-tab-card--disabled {
  cursor: not-allowed;
  opacity: .5;
  background: var(--surf-2);
  box-shadow: none;
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

.record-badge {
  padding: 6px 9px;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .14);
  border-radius: 999px;
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
}

.form-card {
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

.premium-field.q-field--focused :deep(.q-field__control) {
  box-shadow:
    0 0 0 3px rgba(255, 123, 0, .08);
}

.premium-field :deep(.q-field__bottom) {
  min-height: 30px;
  padding: 5px 9px 0;
}

.premium-field--no-bottom :deep(.q-field__bottom) {
  display: none;
}


.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 14px;
  padding: 12px;
  color: var(--text-muted);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .12);
  border-radius: 10px;
}

.info-banner .q-icon {
  color: var(--brand);
  flex: 0 0 auto;
}

.info-banner strong,
.info-banner span {
  display: block;
}

.info-banner strong {
  color: var(--text-strong);
  font-size: 9.5px;
}

.info-banner span {
  margin-top: 3px;
  font-size: 8.5px;
}

.metadata-card {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
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

/* REPRESENTANTE */
.representative-selection-card,
.current-representative-card {
  padding: 18px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
}

.representative-selection-card__head {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 18px;
}

.representative-big-icon {
  width: 45px;
  height: 45px;
  flex: 0 0 45px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 12px;
}

.representative-selection-card__head strong,
.representative-selection-card__head span {
  display: block;
}

.representative-selection-card__head strong {
  color: var(--text-strong);
  font-size: 11px;
}

.representative-selection-card__head span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8.7px;
}

.representative-create-note {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 4px;
  padding: 10px;
  color: var(--text-muted);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 9px;
  font-size: 8.5px;
}

.representative-create-note .q-icon {
  color: var(--brand);
  flex: 0 0 auto;
}

.current-representative-card__top {
  display: grid;
  grid-template-columns:
    54px
    minmax(0, 1fr)
    auto;
  align-items: center;
  gap: 12px;
}

.representative-avatar {
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .16);
  border-radius: 14px;
  font-size: 14px;
  font-weight: 850;
}

.current-representative-card__identity > span {
  color: var(--text-muted);
  font-size: 7.7px;
  font-weight: 750;
  text-transform: uppercase;
}

.current-representative-card__identity h4 {
  margin: 4px 0 0;
  color: var(--text-strong);
  font-size: 15px;
  font-weight: 800;
}

.current-representative-card__identity p {
  margin: 2px 0 0;
  color: var(--text-muted);
  font-size: 8.5px;
}

.current-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 8px;
  color: #168c36;
  background: rgba(33, 186, 69, .09);
  border-radius: 999px;
  font-size: 8px;
  font-weight: 750;
}

.current-representative-card__contacts {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 16px;
}

.current-representative-card__contacts div {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  padding: 10px;
  color: var(--text-muted);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 9px;
  font-size: 8.7px;
}

.current-representative-card__contacts .q-icon {
  color: var(--brand);
  flex: 0 0 auto;
}

.current-representative-card__contacts span {
  overflow-wrap: anywhere;
}

.current-representative-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 16px;
  padding-top: 15px;
  border-top: 1px solid var(--border-soft);
}

.current-representative-card__actions > div {
  min-width: 0;
}

.current-representative-card__actions strong,
.current-representative-card__actions span {
  display: block;
}

.current-representative-card__actions strong {
  color: var(--text-strong);
  font-size: 9.5px;
}

.current-representative-card__actions span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8.3px;
}

/* RELATED */
.related-summary {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
}

.related-summary--three {
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
}

.related-summary article {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 11px;
}

.related-summary__icon {
  width: 37px;
  height: 37px;
  flex: 0 0 37px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 10px;
}

.related-summary span,
.related-summary strong {
  display: block;
}

.related-summary span {
  color: var(--text-muted);
  font-size: 8px;
  text-transform: uppercase;
}

.related-summary strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 12px;
}

.related-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.related-toolbar--orders {
  justify-content: flex-start;
}

.search-field--related {
  width: min(360px, 100%);
}

.status-filter {
  width: 190px;
}

.related-count {
  color: var(--text-muted);
  font-size: 8.5px;
}

.project-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 10px;
}

.client-cell strong,
.client-cell span,
.relationship-cell strong,
.relationship-cell span {
  display: block;
}

.client-cell strong,
.relationship-cell strong {
  color: var(--text-strong);
  font-size: 9.5px;
}

.client-cell span,
.relationship-cell span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8.3px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 8.3px;
  font-weight: 750;
}

.status-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.money-cell {
  color: var(--text-strong);
  font-size: 9.5px;
}

.dates-cell {
  display: grid;
  gap: 4px;
  color: var(--text-muted);
  font-size: 8.3px;
}

.dates-cell strong {
  color: var(--text-strong);
  font-size: 8.7px;
}

.orders-mobile,
.clients-mobile {
  display: none;
}

.order-mobile-card,
.client-mobile-card {
  margin-bottom: 9px;
  padding: 13px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
}

.order-mobile-card__top,
.client-mobile-card__head {
  display: flex;
  align-items: center;
  gap: 9px;
}

.order-mobile-card__top strong,
.order-mobile-card__top span,
.client-mobile-card__head strong,
.client-mobile-card__head span {
  display: block;
}

.order-mobile-card__top strong,
.client-mobile-card__head strong {
  color: var(--text-strong);
  font-size: 10px;
}

.order-mobile-card__top span,
.client-mobile-card__head span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8px;
}

.order-mobile-card > .status-badge {
  margin-top: 10px;
}

.order-mobile-card__grid,
.client-mobile-card__stats {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 11px;
  padding-top: 10px;
  border-top: 1px solid var(--border-soft);
}

.order-mobile-card__grid span,
.order-mobile-card__grid strong,
.client-mobile-card__stats span,
.client-mobile-card__stats strong {
  display: block;
}

.order-mobile-card__grid span,
.client-mobile-card__stats span {
  color: var(--text-muted);
  font-size: 7.5px;
  text-transform: uppercase;
}

.order-mobile-card__grid strong,
.client-mobile-card__stats strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 8.7px;
  overflow-wrap: anywhere;
}

.client-mobile-card__contacts {
  display: grid;
  gap: 6px;
  margin-top: 10px;
  padding: 10px 0;
  border-top: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
}

.client-mobile-card__contacts span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 8.5px;
  overflow-wrap: anywhere;
}

.related-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}

/* REPRESENTATIVE DIALOG */
.representative-dialog {
  width: min(720px, calc(100vw - 24px));
  max-height: min(82vh, 720px);
  display: flex;
  flex-direction: column;
  color: var(--text-base);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 17px;
  overflow: hidden;
}

.representative-dialog__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px 14px;
}

.representative-dialog__head h3 {
  margin: 6px 0 3px;
  color: var(--text-strong);
  font-size: 17px;
  font-weight: 800;
}

.representative-dialog__head p {
  margin: 0;
  color: var(--text-muted);
  font-size: 9px;
}

.representative-dialog__head p strong {
  color: var(--text-strong);
}

.representative-dialog__toolbar {
  padding: 10px 20px;
  background: var(--surf-2);
  border-top: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
}

.search-field--modal {
  width: 100%;
}

.representative-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 12px;
  overflow-y: auto;
}

.representative-option {
  display: grid;
  grid-template-columns:
    42px
    minmax(0, 1fr)
    auto;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  padding: 11px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 11px;
}

.representative-avatar--small {
  width: 42px;
  height: 42px;
  flex-basis: 42px;
  border-radius: 11px;
  font-size: 11px;
}

.representative-option__copy {
  min-width: 0;
}

.representative-option__copy strong,
.representative-option__copy span {
  display: block;
}

.representative-option__copy strong {
  color: var(--text-strong);
  font-size: 9.5px;
}

.representative-option__copy span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8px;
  overflow-wrap: anywhere;
}

.select-representative-btn {
  min-height: 34px;
  color: var(--brand);
  background: var(--brand-soft) !important;
  border: 1px solid rgba(255, 123, 0, .14);
  border-radius: 8px;
  font-size: 8.5px;
}

/* CONFIRM */
.confirm-dialog {
  width: min(470px, calc(100vw - 24px));
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
  font-size: 10px;
}

.confirm-dialog__body > p strong {
  color: var(--text-strong);
}

.transfer-summary {
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

.transfer-summary > div {
  min-width: 0;
}

.transfer-summary span,
.transfer-summary strong {
  display: block;
}

.transfer-summary span {
  color: var(--text-muted);
  font-size: 7.5px;
  text-transform: uppercase;
}

.transfer-summary strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 9px;
  overflow-wrap: anywhere;
}

.transfer-summary .q-icon {
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
  font-size: 8.7px;
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

.confirm-dialog__actions {
  justify-content: flex-end;
  gap: 7px;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--border-soft);
}

/* RESPONSIVE */
@media (max-width: 1180px) {
  .clientes-page {
    padding: 24px 20px 44px;
  }

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

  .search-field {
    width: 280px;
  }

  .workspace-tabbar--four {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .clientes-page {
    padding: 20px 14px 36px;
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

  .desktop-list {
    display: none;
  }

  .mobile-list {
    display: block;
  }

  .cliente-dialog {
    width: calc(100vw - 18px);
    height: calc(100vh - 18px);
    border-radius: 16px;
  }

  .workspace-head {
    grid-template-columns:
      minmax(0, 1fr)
      36px;
  }

  .workspace-summary {
    display: none;
  }

  .orders-desktop,
  .clients-desktop {
    display: none;
  }

  .orders-mobile,
  .clients-mobile {
    display: block;
  }
}

@media (max-width: 680px) {
  .clientes-page {
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
    grid-template-columns: 1fr 1fr;
    padding: 11px;
  }

  .hero-summary__divider {
    display: none;
  }

  .hero-summary__item {
    padding: 7px;
  }

  .hero-summary__item:last-child {
    grid-column: 1 / -1;
    border-top: 1px solid var(--border-soft);
  }

  .list-toolbar {
    padding: 15px 12px;
  }

  .list-toolbar__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .search-field,
  .primary-btn {
    width: 100%;
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

  .cliente-dialog {
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

  .workspace-tabbar--four {
    grid-template-columns:
      repeat(4, 150px);
    width: max-content;
    min-width: max-content;
    gap: 7px;
  }

  .workspace-tab-card {
    min-height: 55px;
    grid-template-columns:
      32px minmax(0, 1fr);
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

  .workspace-tab-card__active-mark,
  .workspace-tab-lock {
    position: absolute;
    top: 6px;
    right: 6px;
  }

  .workspace-tab-card__active-mark {
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

  .form-grid,
  .related-summary--three,
  .current-representative-card__contacts {
    grid-template-columns: 1fr;
  }

  .field-block--full {
    grid-column: auto;
  }

  .metadata-card {
    grid-template-columns: 1fr;
  }

  .tab-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .tab-actions .q-btn {
    width: 100%;
  }

  .current-representative-card__top {
    grid-template-columns:
      48px minmax(0, 1fr);
  }

  .representative-avatar {
    width: 48px;
    height: 48px;
    flex-basis: 48px;
  }

  .current-badge {
    grid-column: 1 / -1;
    justify-self: start;
  }

  .current-representative-card__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .current-representative-card__actions .primary-btn {
    width: 100%;
  }

  .related-toolbar,
  .related-toolbar--orders {
    align-items: stretch;
    flex-direction: column;
  }

  .search-field--related,
  .status-filter {
    width: 100%;
  }

  .related-pagination {
    justify-content: center;
  }

  .order-mobile-card__grid,
  .client-mobile-card__stats {
    grid-template-columns: 1fr;
  }

  .representative-dialog {
    width: calc(100vw - 14px);
    max-height: calc(100vh - 14px);
  }

  .representative-option {
    grid-template-columns:
      42px minmax(0, 1fr);
  }

  .representative-option .select-representative-btn {
    grid-column: 1 / -1;
    width: 100%;
  }

  .confirm-dialog {
    width: calc(100vw - 14px);
  }

  .confirm-dialog__actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .confirm-dialog__actions .q-btn {
    width: 100%;
  }
}

@media (max-width: 430px) {
  .clientes-page {
    padding-inline: 8px;
  }

  .hero-summary {
    grid-template-columns: 1fr;
  }

  .hero-summary__item:last-child {
    grid-column: 1;
  }

  .hero-summary__item + .hero-summary__item {
    border-top: 1px solid var(--border-soft);
  }

  .workspace-tabbar--four {
    grid-template-columns:
      repeat(4, 138px);
  }

  .mobile-card {
    padding: 12px;
  }

  .transfer-summary {
    grid-template-columns: 1fr;
  }

  .transfer-summary .q-icon {
    transform: rotate(90deg);
    justify-self: center;
  }
}


/* =========================================================
   CLIENTES — extensões específicas sobre o mesmo layout-base
   utilizado em LojistasAdmin.vue.
   ========================================================= */

.client-avatar {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .14);
  border-radius: 11px;
  font-size: 10px;
  font-weight: 850;
}

.document-cell,
.inline-muted {
  color: var(--text-muted);
  font-size: 9px;
}

.inline-muted {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mobile-card__contacts {
  display: grid;
  gap: 6px;
  margin-top: 11px;
  padding: 10px 0;
  border-top: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
}

.mobile-card__contacts span {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: var(--text-muted);
  font-size: 8.5px;
  overflow-wrap: anywhere;
}


.client-record-badge {
  flex: 0 0 auto;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  min-height: 27px;
  padding: 6px 10px;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .14);
  border-radius: 999px;
  font-size: 8px;
  line-height: 1;
  font-weight: 800;
  white-space: nowrap;
  text-transform: uppercase;
}

.field-block--wide {
  min-width: 0;
}

.field-block :deep(.q-field__control) {
  min-height: 42px;
  color: var(--text-strong);
  background: var(--surf-1);
  border-radius: 9px;
}

.field-block :deep(.q-field__native),
.field-block :deep(.q-field__input),
.field-block :deep(.q-field__prepend),
.field-block :deep(.q-field__append) {
  color: var(--text-strong);
}

.field-block :deep(.q-field__prepend),
.field-block :deep(.q-field__append) {
  color: var(--text-muted);
}

.field-block :deep(.q-field__control:before) {
  border-color: var(--border-soft);
}

.field-block :deep(.q-field__bottom) {
  min-height: 30px;
  padding: 5px 9px 0;
}

.address-grid {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) 110px;
  gap: 13px;
}

.address-grid .field-block--wide {
  min-width: 0;
}


.commercial-highlight {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 14px;
  padding: 13px;
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .12);
  border-radius: 11px;
}

.commercial-highlight > .q-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  padding: 8px;
  color: var(--brand);
  background: var(--surf-1);
  border-radius: 10px;
}

.commercial-highlight span,
.commercial-highlight strong {
  display: block;
}

.commercial-highlight span {
  color: var(--text-muted);
  font-size: 7.8px;
  text-transform: uppercase;
}

.commercial-highlight strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 9.5px;
  line-height: 1.45;
}

.store-cell strong,
.store-cell small {
  display: block;
}

.store-cell strong {
  color: var(--text-strong);
  font-size: 9.5px;
}

.store-cell small {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8.3px;
}

.status-badge i {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  display: inline-block;
  border-radius: 50%;
}

.last-project-cell {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.last-project-cell__icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 9px;
}

.last-project-cell__copy {
  min-width: 0;
}

.last-project-cell__copy strong,
.last-project-cell__copy span {
  display: block;
}

.last-project-cell__copy strong {
  color: var(--text-strong);
  font-size: 9px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.last-project-cell__copy span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 7.8px;
}

.last-project-cell__value {
  padding-left: 10px;
  color: var(--text-strong);
  border-left: 1px solid var(--border-soft);
  font-size: 8.5px;
  font-weight: 800;
  white-space: nowrap;
}

.relationship-mobile-card {
  margin-bottom: 9px;
  padding: 13px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
}

.relationship-mobile-card__head {
  display: flex;
  align-items: center;
  gap: 9px;
}

.relationship-mobile-card__head strong,
.relationship-mobile-card__head span {
  display: block;
}

.relationship-mobile-card__head strong {
  color: var(--text-strong);
  font-size: 10px;
}

.relationship-mobile-card__head span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8px;
}

.relationship-mobile-card__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 11px;
}

.relationship-mobile-card__stats div {
  min-width: 0;
  padding: 9px;
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 9px;
}

.relationship-mobile-card__stats span,
.relationship-mobile-card__stats strong {
  display: block;
}

.relationship-mobile-card__stats span {
  color: var(--text-muted);
  font-size: 7.3px;
  text-transform: uppercase;
}

.relationship-mobile-card__stats strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 8.7px;
}

.relationship-mobile-card__last {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  align-items: center;
  gap: 9px;
  margin-top: 9px;
  padding: 10px;
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 9px;
}

.relationship-mobile-card__last span,
.relationship-mobile-card__last strong,
.relationship-mobile-card__last small {
  display: block;
}

.relationship-mobile-card__last span {
  color: var(--text-muted);
  font-size: 7.2px;
  text-transform: uppercase;
}

.relationship-mobile-card__last strong {
  margin-top: 2px;
  color: var(--text-strong);
  font-size: 8.8px;
  overflow-wrap: anywhere;
}

.relationship-mobile-card__last small {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 7.8px;
}

.relationship-mobile-card__status {
  margin-top: 9px;
}

.stores-mobile {
  display: none;
}

/* O mesmo tamanho de workspace utilizado na tela de lojistas. */
.cliente-dialog {
  width: min(1180px, calc(100vw - 28px));
  height: min(880px, calc(100vh - 28px));
}

/* A tela vive dentro do MainLayout; container queries evitam depender só
   da largura total do monitor quando a sidebar reduz a área útil. */
.clientes-page {
  container-name: clientes-page;
  container-type: inline-size;
}

@container clientes-page (max-width: 1050px) {
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
    width: min(100%, 420px);
  }
}

@container clientes-page (max-width: 760px) {
  .desktop-list {
    display: none;
  }

  .mobile-list {
    display: block;
  }

  .search-field {
    width: 100%;
  }
}

@media (max-width: 1180px) {

  .address-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .address-grid .field-block--wide {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .stores-desktop {
    display: none;
  }

  .stores-mobile {
    display: block;
  }
}

@media (max-width: 680px) {

  .address-grid,
  .relationship-mobile-card__stats {
    grid-template-columns: 1fr;
  }

  .address-grid .field-block--wide,
  .field-block--full {
    grid-column: auto;
  }

  .client-record-badge {
    align-self: flex-start;
  }
}

@media (max-width: 430px) {
}

</style>
