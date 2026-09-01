<template>
  <q-page class="lojistas-page">
    <!-- HERO -->
    <section class="page-hero">
      <div class="page-hero__copy">
        <div class="eyebrow">
          <span class="eyebrow__dot"></span>
          Minha carteira comercial
        </div>

        <h1>
          Meus <span>lojistas</span>
        </h1>

        <p>
          Gerencie os lojistas vinculados à sua carteira, acompanhe os projetos enviados
          e consulte os clientes já atendidos por cada loja.
        </p>
      </div>

      <div class="hero-summary">
        <div class="hero-summary__item">
          <span>Lojistas</span>
          <strong>{{ lojistas.length }}</strong>
        </div>

        <div class="hero-summary__divider"></div>

        <div class="hero-summary__item">
          <span>Projetos</span>
          <strong>{{ todosPedidos.length }}</strong>
        </div>

        <div class="hero-summary__divider"></div>

        <div class="hero-summary__item">
          <span>Clientes atendidos</span>
          <strong>{{ totalClientesAtendidos }}</strong>
        </div>
      </div>
    </section>

    <!-- LISTAGEM -->
    <section class="panel lojistas-panel">
      <div class="list-toolbar">
        <div>
          <div class="section-kicker">Carteira</div>
          <h2>Lojistas vinculados a você</h2>
          <p>
            Clique em uma loja para acessar cadastro, representante, projetos e clientes.
          </p>
        </div>

        <div class="list-toolbar__actions">
          <q-input
            v-model="busca"
            debounce="300"
            outlined
            dense
            clearable
            class="search-field"
            placeholder="Pesquisar nome, e-mail ou telefone..."
          >
            <template #prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>

          <q-btn
            v-if="podeEditar"
            unelevated
            no-caps
            icon="add_business"
            label="Novo lojista"
            class="primary-btn"
            @click="abrirNovo"
          />
        </div>
      </div>

      <!-- DESKTOP -->
      <div class="desktop-list">
        <q-table
          flat
          hide-bottom
          row-key="id"
          :rows="lojistasFiltrados"
          :columns="colunasLojistas"
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

          <template #body-cell-lojista="props">
            <q-td :props="props">
              <div class="person-cell">
                <div class="store-avatar">
                  <q-icon name="storefront" size="19px" />
                </div>

                <div>
                  <strong>{{ props.row.nome }}</strong>
                  <span>Lojista da sua carteira</span>
                </div>
              </div>
            </q-td>
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

          <template #body-cell-atividade="props">
            <q-td :props="props">
              <div class="activity-cell">
                <span>
                  <q-icon name="inventory_2" size="15px" />
                  {{ props.row.total_pedidos }}
                  {{ props.row.total_pedidos === 1 ? 'projeto' : 'projetos' }}
                </span>

                <span>
                  <q-icon name="groups" size="15px" />
                  {{ props.row.total_clientes }}
                  {{ props.row.total_clientes === 1 ? 'cliente' : 'clientes' }}
                </span>
              </div>
            </q-td>
          </template>

          <template
            v-if="podeEditar"
            #body-cell-acoes="props"
          >
            <q-td :props="props" class="text-right">
              <div class="row-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  class="table-action-btn"
                  @click.stop="abrirEdicao(props.row)"
                >
                  <q-tooltip>Editar lojista</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  class="table-action-btn table-action-btn--danger"
                  @click.stop="confirmarExclusao(props.row)"
                >
                  <q-tooltip>Excluir lojista</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template #no-data>
            <div class="empty-state">
              <div class="empty-state__icon">
                <q-icon name="storefront" size="29px" />
              </div>

              <strong>
                {{
                  busca
                    ? 'Nenhum lojista encontrado'
                    : 'Nenhum lojista na sua carteira'
                }}
              </strong>

              <span>
                {{
                  busca
                    ? 'Tente pesquisar utilizando outro termo.'
                    : 'Quando houver lojistas vinculados a você, eles aparecerão aqui.'
                }}
              </span>
            </div>
          </template>
        </q-table>
      </div>

      <!-- MOBILE -->
      <div class="mobile-list">
        <div v-if="loading" class="mobile-loading">
          <q-spinner color="orange" size="28px" />
          <span>Carregando lojistas...</span>
        </div>

        <div
          v-else-if="lojistasPaginadosMobile.length === 0"
          class="empty-state"
        >
          <div class="empty-state__icon">
            <q-icon name="storefront" size="29px" />
          </div>

          <strong>Nenhum lojista encontrado</strong>
        </div>

        <article
          v-for="lojista in lojistasPaginadosMobile"
          :key="lojista.id"
          class="mobile-card"
          @click="abrirVisualizacao(lojista)"
        >
          <div class="mobile-card__head">
            <div class="store-avatar store-avatar--mobile">
              <q-icon name="storefront" size="20px" />
            </div>

            <div class="mobile-card__identity">
              <strong>{{ lojista.nome }}</strong>
              <span>#{{ lojista.id }} · Lojista</span>
            </div>

            <q-icon name="chevron_right" size="20px" />
          </div>

          <div class="mobile-card__contacts">
            <span>
              <q-icon name="mail_outline" size="15px" />
              {{ lojista.email || 'Não informado' }}
            </span>

            <span>
              <q-icon name="phone" size="15px" />
              {{ formatarTelefone(lojista.telefone) }}
            </span>
          </div>

          <div class="mobile-card__stats">
            <span>
              <q-icon name="inventory_2" size="15px" />
              {{ lojista.total_pedidos }} projetos
            </span>

            <span>
              <q-icon name="groups" size="15px" />
              {{ lojista.total_clientes }} clientes
            </span>
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

    <!-- WORKSPACE -->
    <q-dialog
      v-model="modalEdicao"
      persistent
    >
      <q-card class="lojista-dialog">
        <!-- CABEÇALHO -->
        <q-card-section class="workspace-head">
          <div class="workspace-identity">
            <div class="workspace-avatar">
              <q-icon name="storefront" size="23px" />
            </div>

            <div>
              <div class="section-kicker">
                {{
                  lojistaEditando.id
                    ? `Lojista #${lojistaEditando.id}`
                    : 'Novo lojista'
                }}
              </div>

              <h2>
                {{
                  lojistaEditando.nome ||
                  'Cadastrar lojista'
                }}
              </h2>

              <p>
                {{
                  lojistaEditando.email ||
                  'Preencha os dados para adicionar o lojista à sua carteira.'
                }}
              </p>
            </div>
          </div>

          <div
            v-if="lojistaEditando.id"
            class="workspace-summary"
          >
            <div>
              <span>Projetos</span>
              <strong>{{ pedidosDoLojista.length }}</strong>
            </div>

            <div>
              <span>Clientes</span>
              <strong>{{ clientesAtendidos.length }}</strong>
            </div>
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

        <!-- TABS PREMIUM -->
        <div class="workspace-tabbar-shell">
          <nav
            class="workspace-tabbar workspace-tabbar--four"
            aria-label="Seções do lojista"
          >
            <button
              type="button"
              class="workspace-tab-card"
              :class="{ 'workspace-tab-card--active': tabEdicao === 'dados' }"
              @click="tabEdicao = 'dados'"
            >
              <span class="workspace-tab-card__icon">
                <q-icon name="storefront" size="21px" />
              </span>

              <span class="workspace-tab-card__copy">
                <strong>Dados cadastrais</strong>
                <small>Identificação e acesso</small>
              </span>

              <span
                v-if="tabEdicao === 'dados'"
                class="workspace-tab-card__active-mark"
              >
                <q-icon name="check" size="13px" />
              </span>
            </button>

            <button
              type="button"
              class="workspace-tab-card"
              :class="{ 'workspace-tab-card--active': tabEdicao === 'representante' }"
              @click="tabEdicao = 'representante'"
            >
              <span class="workspace-tab-card__icon">
                <q-icon name="badge" size="21px" />
              </span>

              <span class="workspace-tab-card__copy">
                <strong>Representante</strong>
                <small>Sua carteira comercial</small>
              </span>
            </button>

            <button
              type="button"
              class="workspace-tab-card"
              :class="{
                'workspace-tab-card--active': tabEdicao === 'pedidos',
                'workspace-tab-card--disabled': !lojistaEditando.id
              }"
              :disabled="!lojistaEditando.id"
              @click="lojistaEditando.id && (tabEdicao = 'pedidos')"
            >
              <span class="workspace-tab-card__icon">
                <q-icon name="inventory_2" size="21px" />
              </span>

              <span class="workspace-tab-card__copy">
                <span class="workspace-tab-card__title-row">
                  <strong>Projetos</strong>

                  <span
                    v-if="lojistaEditando.id"
                    class="workspace-tab-count"
                  >
                    {{ pedidosDoLojista.length }}
                  </span>
                </span>

                <small>
                  {{
                    lojistaEditando.id
                      ? 'Consulta dos projetos'
                      : 'Disponível após salvar'
                  }}
                </small>
              </span>

              <q-icon
                v-if="!lojistaEditando.id"
                name="lock_outline"
                size="15px"
                class="workspace-tab-lock"
              />
            </button>

            <button
              type="button"
              class="workspace-tab-card"
              :class="{
                'workspace-tab-card--active': tabEdicao === 'clientes',
                'workspace-tab-card--disabled': !lojistaEditando.id
              }"
              :disabled="!lojistaEditando.id"
              @click="lojistaEditando.id && (tabEdicao = 'clientes')"
            >
              <span class="workspace-tab-card__icon">
                <q-icon name="groups" size="21px" />
              </span>

              <span class="workspace-tab-card__copy">
                <span class="workspace-tab-card__title-row">
                  <strong>Clientes</strong>

                  <span
                    v-if="lojistaEditando.id"
                    class="workspace-tab-count"
                  >
                    {{ clientesAtendidos.length }}
                  </span>
                </span>

                <small>
                  {{
                    lojistaEditando.id
                      ? 'Histórico de atendimento'
                      : 'Disponível após salvar'
                  }}
                </small>
              </span>

              <q-icon
                v-if="!lojistaEditando.id"
                name="lock_outline"
                size="15px"
                class="workspace-tab-lock"
              />
            </button>
          </nav>
        </div>

        <!-- CONTEÚDO -->
        <q-card-section class="workspace-body">
          <q-tab-panels
            v-model="tabEdicao"
            class="workspace-panels"
          >
            <!-- DADOS -->
            <q-tab-panel
              name="dados"
              class="workspace-panel"
            >
              <q-form
                ref="formLojista"
                @submit.prevent="salvarLojista"
              >
                <div class="tab-heading">
                  <div>
                    <div class="section-kicker">Cadastro</div>
                    <h3>Dados do lojista</h3>
                    <p>
                      Informações de identificação e contato do lojista.
                    </p>
                  </div>

                  <span
                    v-if="lojistaEditando.id"
                    class="record-badge"
                  >
                    Registro #{{ lojistaEditando.id }}
                  </span>
                </div>

                <section class="form-card">
                  <div class="form-card__head">
                    <div class="form-card__number">01</div>

                    <div>
                      <strong>Identificação e contato</strong>
                      <span>Dados principais do lojista.</span>
                    </div>
                  </div>

                  <div class="form-grid">
                    <div class="field-block field-block--full">
                      <span class="field-label">Nome do lojista *</span>

                      <q-input
                        v-model="lojistaEditando.nome"
                        outlined
                        dense
                        color="orange"
                        class="premium-field"
                        placeholder="Nome da loja ou lojista"
                        :readonly="!podeEditar"
                        :rules="[
                          val => !!String(val || '').trim() || 'Informe o nome',
                          val => String(val || '').trim().length >= 3 || 'O nome é muito curto'
                        ]"
                      >
                        <template #prepend>
                          <q-icon name="storefront" size="18px" />
                        </template>
                      </q-input>
                    </div>

                    <div class="field-block">
                      <span class="field-label">E-mail *</span>

                      <q-input
                        v-model="lojistaEditando.email"
                        outlined
                        dense
                        type="email"
                        color="orange"
                        class="premium-field"
                        placeholder="lojista@empresa.com"
                        :readonly="!podeEditar"
                        :rules="[
                          val => !!String(val || '').trim() || 'Informe o e-mail',
                          validarEmail
                        ]"
                      >
                        <template #prepend>
                          <q-icon name="mail_outline" size="18px" />
                        </template>
                      </q-input>
                    </div>

                    <div class="field-block">
                      <span class="field-label">Telefone *</span>

                      <q-input
                        v-model="lojistaEditando.telefone"
                        outlined
                        dense
                        color="orange"
                        class="premium-field"
                        mask="(##) #####-####"
                        unmasked-value
                        placeholder="(00) 00000-0000"
                        :readonly="!podeEditar"
                        :rules="[
                          val => !!String(val || '').trim() || 'Informe o telefone',
                          validarTelefone
                        ]"
                      >
                        <template #prepend>
                          <q-icon name="phone" size="18px" />
                        </template>
                      </q-input>
                    </div>
                  </div>
                </section>

                <section
                  v-if="!lojistaEditando.id"
                  class="form-card"
                >
                  <div class="form-card__head">
                    <div class="form-card__number">02</div>

                    <div>
                      <strong>Senha inicial</strong>
                      <span>Utilizada no primeiro acesso do lojista.</span>
                    </div>
                  </div>

                  <div class="password-layout">
                    <div class="password-fields">
                      <div class="password-field-block">
                        <span class="field-label">Senha de acesso *</span>

                        <q-input
                          v-model="lojistaEditando.senha"
                          outlined
                          dense
                          color="orange"
                          class="premium-field premium-field--no-bottom"
                          :type="ocultarSenha ? 'password' : 'text'"
                          placeholder="••••••••"
                        >
                          <template #prepend>
                            <q-icon name="key" size="18px" />
                          </template>

                          <template #append>
                            <q-icon
                              :name="ocultarSenha ? 'visibility_off' : 'visibility'"
                              class="cursor-pointer"
                              @click="ocultarSenha = !ocultarSenha"
                            />
                          </template>
                        </q-input>

                        <div
                          class="validation-slot"
                          :class="{
                            'validation-slot--error':
                              lojistaEditando.senha && !senhaValida
                          }"
                        >
                          <template v-if="lojistaEditando.senha && !senhaValida">
                            <q-icon name="error_outline" size="14px" />
                            <span>A senha ainda não atende a todos os requisitos.</span>
                          </template>
                        </div>
                      </div>

                      <div class="password-field-block">
                        <span class="field-label">Confirmar senha *</span>

                        <q-input
                          v-model="confirmarSenha"
                          outlined
                          dense
                          color="orange"
                          class="premium-field premium-field--no-bottom"
                          :type="ocultarConfirmacao ? 'password' : 'text'"
                          placeholder="••••••••"
                        >
                          <template #prepend>
                            <q-icon name="lock_outline" size="18px" />
                          </template>

                          <template #append>
                            <q-icon
                              :name="ocultarConfirmacao ? 'visibility_off' : 'visibility'"
                              class="cursor-pointer"
                              @click="ocultarConfirmacao = !ocultarConfirmacao"
                            />
                          </template>
                        </q-input>

                        <div
                          class="validation-slot"
                          :class="{
                            'validation-slot--error':
                              confirmarSenha && !senhasConferem
                          }"
                        >
                          <template v-if="confirmarSenha && !senhasConferem">
                            <q-icon name="error_outline" size="14px" />
                            <span>As senhas não coincidem.</span>
                          </template>
                        </div>
                      </div>
                    </div>

                    <aside class="password-rules">
                      <div class="password-rules__head">
                        <q-icon name="verified_user" size="19px" />
                        <strong>Senha segura</strong>
                      </div>

                      <ul>
                        <li :class="{ 'rule-ok': regraSenha.tamanho }">
                          <q-icon
                            :name="regraSenha.tamanho ? 'check_circle' : 'radio_button_unchecked'"
                          />
                          8 ou mais caracteres
                        </li>

                        <li :class="{ 'rule-ok': regraSenha.maiuscula }">
                          <q-icon
                            :name="regraSenha.maiuscula ? 'check_circle' : 'radio_button_unchecked'"
                          />
                          Uma letra maiúscula
                        </li>

                        <li :class="{ 'rule-ok': regraSenha.minuscula }">
                          <q-icon
                            :name="regraSenha.minuscula ? 'check_circle' : 'radio_button_unchecked'"
                          />
                          Uma letra minúscula
                        </li>

                        <li :class="{ 'rule-ok': regraSenha.numero }">
                          <q-icon
                            :name="regraSenha.numero ? 'check_circle' : 'radio_button_unchecked'"
                          />
                          Um número
                        </li>

                        <li :class="{ 'rule-ok': regraSenha.simbolo }">
                          <q-icon
                            :name="regraSenha.simbolo ? 'check_circle' : 'radio_button_unchecked'"
                          />
                          Um símbolo
                        </li>
                      </ul>
                    </aside>
                  </div>
                </section>

                <div
                  v-else
                  class="info-banner"
                >
                  <q-icon name="info_outline" size="19px" />

                  <div>
                    <strong>Senha preservada</strong>
                    <span>
                      A edição mantém a senha atual do lojista.
                    </span>
                  </div>
                </div>

                <div
                  v-if="lojistaEditando.id"
                  class="metadata-card"
                >
                  <div>
                    <span>Criado em</span>
                    <strong>{{ formatarData(lojistaEditando.created_at) }}</strong>
                  </div>

                  <div>
                    <span>Última modificação</span>
                    <strong>{{ formatarData(lojistaEditando.updated_at) }}</strong>
                  </div>
                </div>

                <div class="tab-actions">
                  <q-btn
                    flat
                    no-caps
                    label="Fechar"
                    class="secondary-btn"
                    :disable="salvando"
                    @click="fecharModal"
                  />

                  <q-btn
                    v-if="podeEditar"
                    unelevated
                    no-caps
                    type="submit"
                    icon="save"
                    :label="
                      lojistaEditando.id
                        ? 'Salvar alterações'
                        : 'Cadastrar lojista'
                    "
                    :loading="salvando"
                    class="save-btn"
                  />
                </div>
              </q-form>
            </q-tab-panel>

            <!-- REPRESENTANTE READ ONLY -->
            <q-tab-panel
              name="representante"
              class="workspace-panel"
            >
              <div class="tab-heading">
                <div>
                  <div class="section-kicker">Carteira comercial</div>
                  <h3>Representante responsável</h3>
                  <p>
                    Este lojista pertence à sua carteira e o vínculo não pode ser alterado nesta tela.
                  </p>
                </div>
              </div>

              <section class="current-representative-card">
                <div class="current-representative-card__top">
                  <div class="representative-avatar">
                    {{ iniciais(representanteAtual?.nome) }}
                  </div>

                  <div class="current-representative-card__identity">
                    <span>Representante responsável</span>
                    <h4>{{ representanteAtual?.nome || authStore.userName || 'Seu cadastro' }}</h4>
                    <p>#{{ representanteAtual?.id || authStore.userId }}</p>
                  </div>

                  <span class="current-badge">
                    <q-icon name="verified" size="14px" />
                    Sua carteira
                  </span>
                </div>

                <div class="current-representative-card__contacts">
                  <div>
                    <q-icon name="mail_outline" size="17px" />
                    <span>{{ representanteAtual?.email || 'E-mail não informado' }}</span>
                  </div>

                  <div>
                    <q-icon name="phone" size="17px" />
                    <span>{{ formatarTelefone(representanteAtual?.telefone) }}</span>
                  </div>
                </div>

                <div class="readonly-link-note">
                  <div class="readonly-link-note__icon">
                    <q-icon name="lock_outline" size="19px" />
                  </div>

                  <div>
                    <strong>Vínculo protegido</strong>
                    <span>
                      Representantes não podem transferir lojistas para outra carteira.
                      Essa alteração é exclusiva do administrador.
                    </span>
                  </div>
                </div>
              </section>
            </q-tab-panel>

            <!-- PROJETOS -->
            <q-tab-panel
              name="pedidos"
              class="workspace-panel"
            >
              <div class="tab-heading">
                <div>
                  <div class="section-kicker">Somente leitura</div>
                  <h3>Projetos do lojista</h3>
                  <p>
                    Visualização resumida dos projetos enviados por esta loja.
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
                    <strong>{{ pedidosDoLojista.length }}</strong>
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
                    <q-icon name="groups" size="20px" />
                  </div>

                  <div>
                    <span>Clientes atendidos</span>
                    <strong>{{ clientesAtendidos.length }}</strong>
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
                  placeholder="Pesquisar projeto ou cliente..."
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

              <!-- DESKTOP -->
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

                  <template #body-cell-cliente="props">
                    <q-td :props="props">
                      <div class="client-cell">
                        <strong>{{ props.row.cliente || 'Cliente não informado' }}</strong>
                        <span>Cliente #{{ props.row.id_cliente }}</span>
                      </div>
                    </q-td>
                  </template>

                  <template #body-cell-status="props">
                    <q-td :props="props">
                      <span
                        class="status-badge"
                        :style="{
                          color: props.row.cor || '#ff7b00',
                          borderColor: (props.row.cor || '#ff7b00') + '35',
                          background: (props.row.cor || '#ff7b00') + '12'
                        }"
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
                        <span>
                          Pedido: {{ formatarDataCurta(props.row.data_pedido) }}
                        </span>

                        <span>
                          Previsão:
                          {{ formatarDataCurta(props.row.data_previsao_pedido) }}
                        </span>
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

              <!-- MOBILE -->
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
                    :style="{
                      color: pedido.cor || '#ff7b00',
                      borderColor: (pedido.cor || '#ff7b00') + '35',
                      background: (pedido.cor || '#ff7b00') + '12'
                    }"
                  >
                    <span
                      class="status-badge__dot"
                      :style="{ background: pedido.cor || '#ff7b00' }"
                    ></span>

                    {{ pedido.status || 'Sem status' }}
                  </span>

                  <div class="order-mobile-card__grid">
                    <div>
                      <span>Cliente</span>
                      <strong>{{ pedido.cliente || '—' }}</strong>
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

            <!-- CLIENTES -->
            <q-tab-panel
              name="clientes"
              class="workspace-panel"
            >
              <div class="tab-heading">
                <div>
                  <div class="section-kicker">Relacionamento</div>
                  <h3>Clientes atendidos</h3>
                  <p>
                    Clientes que já possuem pelo menos um projeto vinculado a este lojista.
                  </p>
                </div>
              </div>

              <div class="related-summary related-summary--three">
                <article>
                  <div class="related-summary__icon">
                    <q-icon name="groups" size="20px" />
                  </div>

                  <div>
                    <span>Clientes únicos</span>
                    <strong>{{ clientesAtendidos.length }}</strong>
                  </div>
                </article>

                <article>
                  <div class="related-summary__icon">
                    <q-icon name="inventory_2" size="20px" />
                  </div>

                  <div>
                    <span>Projetos realizados</span>
                    <strong>{{ pedidosDoLojista.length }}</strong>
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
                  v-model="buscaClientes"
                  outlined
                  dense
                  clearable
                  debounce="250"
                  class="search-field search-field--related"
                  placeholder="Pesquisar cliente..."
                >
                  <template #prepend>
                    <q-icon name="search" size="18px" />
                  </template>
                </q-input>

                <span class="related-count">
                  {{ clientesFiltrados.length }}
                  {{ clientesFiltrados.length === 1 ? 'cliente' : 'clientes' }}
                </span>
              </div>

              <!-- DESKTOP -->
              <div class="clients-desktop">
                <q-table
                  flat
                  hide-bottom
                  row-key="id"
                  :rows="clientesFiltrados"
                  :columns="colunasClientes"
                  v-model:pagination="paginacaoClientes"
                  class="related-table"
                  table-class="related-table__body"
                  table-header-class="related-table__header"
                >
                  <template #body-cell-cliente="props">
                    <q-td :props="props">
                      <div class="person-cell">
                        <div class="client-avatar">
                          {{ iniciais(props.row.nome) }}
                        </div>

                        <div>
                          <strong>{{ props.row.nome }}</strong>
                          <span>Cliente #{{ props.row.id }}</span>
                        </div>
                      </div>
                    </q-td>
                  </template>

                  <template #body-cell-relacionamento="props">
                    <q-td :props="props">
                      <div class="relationship-cell">
                        <strong>
                          {{ props.row.total_pedidos }}
                          {{ props.row.total_pedidos === 1 ? 'projeto' : 'projetos' }}
                        </strong>

                        <span>
                          {{ formatarMoeda(props.row.valor_total) }}
                        </span>
                      </div>
                    </q-td>
                  </template>

                  <template #body-cell-ultimo="props">
                    <q-td :props="props">
                      <div class="dates-cell">
                        <span>Último projeto</span>
                        <strong>{{ formatarDataCurta(props.row.ultimo_pedido) }}</strong>
                      </div>
                    </q-td>
                  </template>

                  <template #no-data>
                    <div class="empty-state empty-state--related">
                      <div class="empty-state__icon">
                        <q-icon name="groups" size="28px" />
                      </div>

                      <strong>Nenhum cliente encontrado</strong>
                      <span>
                        Este lojista ainda não possui clientes com projetos vinculados.
                      </span>
                    </div>
                  </template>
                </q-table>
              </div>

              <!-- MOBILE -->
              <div class="clients-mobile">
                <article
                  v-for="cliente in clientesPaginadosMobile"
                  :key="cliente.id"
                  class="client-mobile-card"
                >
                  <div class="client-mobile-card__head">
                    <div class="client-avatar">
                      {{ iniciais(cliente.nome) }}
                    </div>

                    <div>
                      <strong>{{ cliente.nome }}</strong>
                      <span>Cliente #{{ cliente.id }}</span>
                    </div>
                  </div>

                  <div class="client-mobile-card__stats">
                    <div>
                      <span>Projetos</span>
                      <strong>{{ cliente.total_pedidos }}</strong>
                    </div>

                    <div>
                      <span>Volume</span>
                      <strong>{{ formatarMoeda(cliente.valor_total) }}</strong>
                    </div>

                    <div>
                      <span>Último</span>
                      <strong>{{ formatarDataCurta(cliente.ultimo_pedido) }}</strong>
                    </div>
                  </div>
                </article>
              </div>

              <div
                v-if="clientesFiltrados.length"
                class="related-pagination"
              >
                <q-pagination
                  v-model="paginacaoClientes.page"
                  :max="numeroPaginasClientes"
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

    <!-- EXCLUSÃO -->
    <q-dialog
      v-model="modalExclusao"
      persistent
    >
      <q-card class="confirm-dialog">
        <q-card-section class="confirm-dialog__head">
          <div class="confirm-dialog__icon confirm-dialog__icon--danger">
            <q-icon name="delete_outline" size="22px" />
          </div>

          <div>
            <div class="section-kicker section-kicker--danger">
              Ação irreversível
            </div>

            <h3>Excluir lojista?</h3>
          </div>
        </q-card-section>

        <q-card-section class="confirm-dialog__body">
          <p>
            O cadastro de
            <strong>{{ lojistaParaExcluir?.nome }}</strong>
            será removido.
          </p>

          <div class="confirm-note confirm-note--warning">
            <q-icon name="warning_amber" size="18px" />

            <span>
              O backend bloqueará a exclusão caso este lojista possua projetos vinculados.
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
            label="Excluir lojista"
            :loading="excluindo"
            class="danger-btn"
            @click="excluirLojista"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  watch
} from 'vue'

import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'

const props = defineProps({
  podeEditar: {
    type: Boolean,
    default: false
  }
})

const $q = useQuasar()
const authStore = useAuthStore()

const formLojista = ref(null)

const loading = ref(true)
const salvando = ref(false)
const excluindo = ref(false)

const lojistas = ref([])
const todosPedidos = ref([])
const representanteAtual = ref(null)

const busca = ref('')

const modalEdicao = ref(false)
const modalExclusao = ref(false)

const lojistaEditando = ref({})
const lojistaParaExcluir = ref(null)

const tabEdicao = ref('dados')

const ocultarSenha = ref(true)
const ocultarConfirmacao = ref(true)
const confirmarSenha = ref('')

const buscaPedidos = ref('')
const buscaClientes = ref('')
const filtroStatusPedido = ref('todos')

const paginacao = ref({
  sortBy: 'nome',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

const paginacaoPedidos = ref({
  page: 1,
  rowsPerPage: 7
})

const paginacaoClientes = ref({
  page: 1,
  rowsPerPage: 7
})

const headers = computed(() => ({
  Authorization: `Bearer ${authStore.token}`
}))

const colunasBase = [
  {
    name: 'id',
    field: 'id',
    label: 'ID',
    align: 'left',
    sortable: true,
    style: 'width: 72px'
  },
  {
    name: 'lojista',
    field: 'nome',
    label: 'Lojista',
    align: 'left',
    sortable: true
  },
  {
    name: 'contato',
    field: 'telefone',
    label: 'Contato',
    align: 'left'
  },
  {
    name: 'atividade',
    field: 'total_pedidos',
    label: 'Atividade',
    align: 'left'
  },
  {
    name: 'acoes',
    field: 'acoes',
    label: '',
    align: 'right',
    style: 'width: 96px'
  }
]

const colunasLojistas = computed(() =>
  props.podeEditar
    ? colunasBase
    : colunasBase.filter(coluna =>
        coluna.name !== 'acoes'
      )
)

const colunasPedidos = [
  {
    name: 'projeto',
    field: 'nome_projeto',
    label: 'Projeto',
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
    name: 'valor',
    field: 'valor',
    label: 'Valor',
    align: 'left',
    sortable: true
  },
  {
    name: 'datas',
    field: 'data_pedido',
    label: 'Datas',
    align: 'left',
    sortable: true
  }
]

const colunasClientes = [
  {
    name: 'cliente',
    field: 'nome',
    label: 'Cliente',
    align: 'left',
    sortable: true
  },
  {
    name: 'relacionamento',
    field: 'total_pedidos',
    label: 'Relacionamento',
    align: 'left',
    sortable: true
  },
  {
    name: 'ultimo',
    field: 'ultimo_pedido',
    label: 'Último projeto',
    align: 'left',
    sortable: true
  }
]

const lojistasEnriquecidos = computed(() =>
  lojistas.value.map(lojista => {
    const pedidos =
      todosPedidos.value.filter(pedido =>
        String(pedido.id_lojista) ===
        String(lojista.id)
      )

    const clientes =
      new Set(
        pedidos
          .map(pedido => pedido.id_cliente)
          .filter(Boolean)
          .map(String)
      )

    return {
      ...lojista,
      total_pedidos: pedidos.length,
      total_clientes: clientes.size
    }
  })
)

const totalClientesAtendidos = computed(() =>
  new Set(
    todosPedidos.value
      .map(pedido => pedido.id_cliente)
      .filter(Boolean)
      .map(String)
  ).size
)

const lojistasFiltrados = computed(() => {
  const termo =
    String(busca.value || '')
      .trim()
      .toLowerCase()

  const base = lojistasEnriquecidos.value

  if (!termo) {
    return base
  }

  return base.filter(lojista =>
    [
      lojista.id,
      lojista.nome,
      lojista.email,
      lojista.telefone
    ].some(valor =>
      String(valor ?? '')
        .toLowerCase()
        .includes(termo)
    )
  )
})

const numeroDePaginas = computed(() => {
  const limite =
    Number(paginacao.value.rowsPerPage)

  return limite === 0
    ? 1
    : Math.ceil(
        lojistasFiltrados.value.length /
        limite
      ) || 1
})

const lojistasPaginadosMobile = computed(() => {
  const limite =
    Number(paginacao.value.rowsPerPage)

  if (!limite) {
    return lojistasFiltrados.value
  }

  const inicio =
    (Number(paginacao.value.page) - 1) *
    limite

  return lojistasFiltrados.value.slice(
    inicio,
    inicio + limite
  )
})

const regraSenha = computed(() => {
  const senha =
    String(lojistaEditando.value.senha || '')

  return {
    tamanho: senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    minuscula: /[a-z]/.test(senha),
    numero: /\d/.test(senha),
    simbolo: /[\W_]/.test(senha)
  }
})

const senhaValida = computed(() => {
  const senha =
    String(lojistaEditando.value.senha || '')

  if (!senha) return false

  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(
    senha
  )
})

const senhasConferem = computed(() =>
  Boolean(lojistaEditando.value.senha) &&
  lojistaEditando.value.senha ===
    confirmarSenha.value
)

const pedidosDoLojista = computed(() => {
  if (!lojistaEditando.value.id) {
    return []
  }

  return todosPedidos.value.filter(pedido =>
    String(pedido.id_lojista) ===
    String(lojistaEditando.value.id)
  )
})

const valorTotalPedidos = computed(() =>
  pedidosDoLojista.value.reduce(
    (total, pedido) =>
      total + Number(pedido.valor || 0),
    0
  )
)

const opcoesStatusPedido = computed(() => {
  const status =
    [...new Set(
      pedidosDoLojista.value
        .map(pedido => pedido.status)
        .filter(Boolean)
        .map(String)
    )].sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    )

  return [
    {
      label: 'Todos os status',
      value: 'todos'
    },
    ...status.map(item => ({
      label: item,
      value: item
    }))
  ]
})

const pedidosFiltrados = computed(() => {
  const termo =
    String(buscaPedidos.value || '')
      .trim()
      .toLowerCase()

  return pedidosDoLojista.value.filter(pedido => {
    const bateStatus =
      filtroStatusPedido.value === 'todos' ||
      String(pedido.status || '') ===
        String(filtroStatusPedido.value)

    if (!bateStatus) {
      return false
    }

    if (!termo) {
      return true
    }

    return [
      pedido.id,
      pedido.nome_projeto,
      pedido.cliente,
      pedido.status
    ].some(valor =>
      String(valor ?? '')
        .toLowerCase()
        .includes(termo)
    )
  })
})

const numeroPaginasPedidos = computed(() =>
  Math.ceil(
    pedidosFiltrados.value.length /
    Number(paginacaoPedidos.value.rowsPerPage || 7)
  ) || 1
)

const pedidosPaginadosMobile = computed(() => {
  const limite =
    Number(paginacaoPedidos.value.rowsPerPage || 7)

  const inicio =
    (Number(paginacaoPedidos.value.page) - 1) *
    limite

  return pedidosFiltrados.value.slice(
    inicio,
    inicio + limite
  )
})

/*
 * Não usamos GET /clientes aqui.
 * O representante recebe seus próprios pedidos já filtrados pelo backend,
 * então os clientes atendidos são derivados diretamente dos projetos.
 */
const clientesAtendidos = computed(() => {
  const mapa = new Map()

  pedidosDoLojista.value.forEach(pedido => {
    if (!pedido.id_cliente) {
      return
    }

    const id = String(pedido.id_cliente)

    if (!mapa.has(id)) {
      mapa.set(id, {
        id: pedido.id_cliente,
        nome:
          pedido.cliente ||
          `Cliente #${pedido.id_cliente}`,
        total_pedidos: 0,
        valor_total: 0,
        ultimo_pedido: null
      })
    }

    const cliente = mapa.get(id)

    cliente.total_pedidos += 1
    cliente.valor_total +=
      Number(pedido.valor || 0)

    const dataPedido =
      pedido.data_pedido
        ? String(pedido.data_pedido).slice(0, 10)
        : null

    if (
      dataPedido &&
      (
        !cliente.ultimo_pedido ||
        dataPedido > cliente.ultimo_pedido
      )
    ) {
      cliente.ultimo_pedido = dataPedido
    }
  })

  return [...mapa.values()].sort(
    (a, b) =>
      String(a.nome)
        .localeCompare(
          String(b.nome),
          'pt-BR'
        )
  )
})

const clientesFiltrados = computed(() => {
  const termo =
    String(buscaClientes.value || '')
      .trim()
      .toLowerCase()

  if (!termo) {
    return clientesAtendidos.value
  }

  return clientesAtendidos.value.filter(cliente =>
    [
      cliente.id,
      cliente.nome
    ].some(valor =>
      String(valor ?? '')
        .toLowerCase()
        .includes(termo)
    )
  )
})

const numeroPaginasClientes = computed(() =>
  Math.ceil(
    clientesFiltrados.value.length /
    Number(paginacaoClientes.value.rowsPerPage || 7)
  ) || 1
)

const clientesPaginadosMobile = computed(() => {
  const limite =
    Number(paginacaoClientes.value.rowsPerPage || 7)

  const inicio =
    (Number(paginacaoClientes.value.page) - 1) *
    limite

  return clientesFiltrados.value.slice(
    inicio,
    inicio + limite
  )
})

watch(
  () => busca.value,
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

watch(
  [
    () => buscaPedidos.value,
    () => filtroStatusPedido.value
  ],
  () => {
    paginacaoPedidos.value.page = 1
  }
)

watch(
  () => buscaClientes.value,
  () => {
    paginacaoClientes.value.page = 1
  }
)

const validarEmail = email => {
  if (!email) return true

  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    'Formato de e-mail inválido'
  )
}

const validarTelefone = telefone => {
  const limpo =
    String(telefone || '')
      .replace(/\D/g, '')

  return (
    (limpo.length >= 10 &&
      limpo.length <= 11) ||
    'Telefone deve ter DDD + 8 ou 9 dígitos'
  )
}

async function carregarBase() {
  loading.value = true

  try {
    const [
      lojistasResponse,
      pedidosResponse,
      representanteResponse
    ] = await Promise.all([
      api.get('/lojistas', {
        headers: headers.value
      }),

      api.get('/pedidos', {
        headers: headers.value
      }),

      api.get(
        `/representantes/${authStore.userId}`,
        {
          headers: headers.value
        }
      )
    ])

    /*
     * O middleware já filtra:
     * representante -> somente seus lojistas
     */
    lojistas.value =
      lojistasResponse.data.data ||
      lojistasResponse.data ||
      []

    /*
     * O middleware de pedidos também já filtra:
     * representante -> pedidos dos seus lojistas
     */
    todosPedidos.value =
      pedidosResponse.data.data ||
      pedidosResponse.data ||
      []

    representanteAtual.value =
      representanteResponse.data.data ||
      representanteResponse.data ||
      null
  } catch (error) {
    console.error(
      'Erro ao carregar carteira de lojistas:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Erro ao carregar sua carteira de lojistas.',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

async function atualizarBaseRelacionada() {
  const [
    lojistasResponse,
    pedidosResponse
  ] = await Promise.all([
    api.get('/lojistas', {
      headers: headers.value
    }),

    api.get('/pedidos', {
      headers: headers.value
    })
  ])

  lojistas.value =
    lojistasResponse.data.data ||
    lojistasResponse.data ||
    []

  todosPedidos.value =
    pedidosResponse.data.data ||
    pedidosResponse.data ||
    []
}

function handleRowClick(evt, row) {
  abrirVisualizacao(row)
}

function abrirVisualizacao(lojista) {
  abrirEdicao(lojista)
}

async function abrirEdicao(lojista) {
  resetWorkspace()

  lojistaEditando.value =
    JSON.parse(JSON.stringify(lojista))

  tabEdicao.value = 'dados'
  modalEdicao.value = true

  try {
    const response =
      await api.get(
        `/lojistas/${lojista.id}`,
        {
          headers: headers.value
        }
      )

    lojistaEditando.value = {
      ...lojistaEditando.value,
      ...(response.data.data ||
         response.data ||
         {})
    }
  } catch (error) {
    console.error(
      'Erro ao carregar lojista:',
      error
    )
  }
}

function abrirNovo() {
  if (!props.podeEditar) {
    return
  }

  resetWorkspace()

  lojistaEditando.value = {
    nome: '',
    email: '',
    telefone: '',
    senha: ''
  }

  tabEdicao.value = 'dados'
  modalEdicao.value = true
}

function resetWorkspace() {
  confirmarSenha.value = ''
  ocultarSenha.value = true
  ocultarConfirmacao.value = true

  buscaPedidos.value = ''
  buscaClientes.value = ''
  filtroStatusPedido.value = 'todos'

  paginacaoPedidos.value.page = 1
  paginacaoClientes.value.page = 1
}

function fecharModal() {
  if (salvando.value) {
    return
  }

  modalEdicao.value = false
}

async function salvarLojista() {
  if (!props.podeEditar) {
    return
  }

  const formularioValido =
    await formLojista.value.validate()

  if (!formularioValido) {
    $q.notify({
      type: 'warning',
      message:
        'Revise os dados cadastrais antes de continuar.',
      position: 'top-right'
    })

    return
  }

  if (!lojistaEditando.value.id) {
    if (!lojistaEditando.value.senha) {
      $q.notify({
        type: 'warning',
        message:
          'Informe a senha inicial do lojista.',
        position: 'top-right'
      })

      return
    }

    if (!senhaValida.value) {
      $q.notify({
        type: 'warning',
        message:
          'A senha ainda não atende aos requisitos de segurança.',
        position: 'top-right'
      })

      return
    }

    if (!senhasConferem.value) {
      $q.notify({
        type: 'warning',
        message:
          'A confirmação da senha não confere.',
        position: 'top-right'
      })

      return
    }
  }

  salvando.value = true

  try {
    const payload = {
      nome:
        String(lojistaEditando.value.nome || '')
          .trim(),

      email:
        String(lojistaEditando.value.email || '')
          .trim(),

      telefone:
        String(lojistaEditando.value.telefone || '')
          .replace(/\D/g, '')
    }

    /*
     * Não enviamos id_representante.
     * - POST: middleware força o ID do representante logado.
     * - PATCH: controller/middleware preservam o vínculo da carteira.
     */
    if (lojistaEditando.value.id) {
      const response =
        await api.patch(
          `/lojistas/${lojistaEditando.value.id}`,
          payload,
          {
            headers: headers.value
          }
        )

      lojistaEditando.value = {
        ...lojistaEditando.value,
        ...(response.data.data ||
           response.data ||
           {})
      }

      $q.notify({
        type: 'positive',
        message:
          'Lojista atualizado com sucesso.',
        icon: 'check_circle',
        position: 'top-right'
      })
    } else {
      payload.senha =
        lojistaEditando.value.senha

      const response =
        await api.post(
          '/lojistas',
          payload,
          {
            headers: headers.value
          }
        )

      const novoId =
        response.data.id_lojista ||
        response.data.lojista?.id

      if (!novoId) {
        throw new Error(
          'O backend não retornou o ID do novo lojista.'
        )
      }

      lojistaEditando.value = {
        ...(response.data.lojista || {}),
        id: novoId,
        nome: payload.nome,
        email: payload.email,
        telefone: payload.telefone,
        id_representante:
          authStore.userId
      }

      confirmarSenha.value = ''

      $q.notify({
        type: 'positive',
        message:
          'Lojista criado e vinculado à sua carteira.',
        icon: 'check_circle',
        position: 'top-right'
      })
    }

    await atualizarBaseRelacionada()
  } catch (error) {
    console.error(
      'Erro ao salvar lojista:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        error.message ||
        'Falha ao salvar lojista.',
      position: 'top-right'
    })
  } finally {
    salvando.value = false
  }
}

function confirmarExclusao(lojista) {
  if (!props.podeEditar) {
    return
  }

  lojistaParaExcluir.value =
    JSON.parse(JSON.stringify(lojista))

  modalExclusao.value = true
}

async function excluirLojista() {
  if (
    !props.podeEditar ||
    !lojistaParaExcluir.value?.id
  ) {
    return
  }

  excluindo.value = true

  try {
    await api.delete(
      `/lojistas/${lojistaParaExcluir.value.id}`,
      {
        headers: headers.value
      }
    )

    $q.notify({
      type: 'positive',
      message:
        'Lojista removido com sucesso.',
      icon: 'check_circle',
      position: 'top-right'
    })

    modalExclusao.value = false
    lojistaParaExcluir.value = null

    await atualizarBaseRelacionada()
  } catch (error) {
    console.error(
      'Erro ao excluir lojista:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Erro ao excluir o lojista.',
      position: 'top-right'
    })
  } finally {
    excluindo.value = false
  }
}

function iniciais(nome) {
  const partes =
    String(nome || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)

  if (!partes.length) {
    return 'R'
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

function formatarTelefone(valor) {
  if (!valor) {
    return 'Não informado'
  }

  const clean =
    String(valor).replace(/\D/g, '')

  if (clean.length === 11) {
    return clean.replace(
      /(\d{2})(\d{5})(\d{4})/,
      '($1) $2-$3'
    )
  }

  if (clean.length === 10) {
    return clean.replace(
      /(\d{2})(\d{4})(\d{4})/,
      '($1) $2-$3'
    )
  }

  return valor
}

function formatarData(dataISO) {
  if (!dataISO) return '---'

  const data = new Date(dataISO)

  if (Number.isNaN(data.getTime())) {
    return '---'
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

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
  )
}

onMounted(carregarBase)
</script>

<style scoped>
.lojistas-page {
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

.lojistas-panel {
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
.project-cell {
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
.project-cell span {
  display: block;
}

.person-cell strong,
.project-cell strong {
  color: var(--text-strong);
  font-size: 10.5px;
}

.person-cell span,
.project-cell span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8.3px;
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

.mobile-card__contacts {
  display: grid;
  gap: 6px;
  margin-top: 11px;
  padding: 10px 0;
  border-top: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
}

.mobile-card__contacts span,
.mobile-card__stats span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 8.5px;
  overflow-wrap: anywhere;
}

.mobile-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 10px;
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
.lojista-dialog {
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

.premium-field :deep(.q-field__bottom) {
  min-height: 30px;
  padding: 5px 9px 0;
}

.premium-field--no-bottom :deep(.q-field__bottom) {
  display: none;
}

.password-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(230px, 270px);
  gap: 18px;
  align-items: start;
}

.password-fields {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.validation-slot {
  width: 100%;
  height: 34px;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  padding: 5px 9px 0;
  color: transparent;
  box-sizing: border-box;
  font-size: 8.7px;
  line-height: 1.35;
}

.validation-slot--error {
  color: #d95050;
}

.password-rules {
  padding: 15px;
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 11px;
}

.password-rules__head {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--brand);
}

.password-rules__head strong {
  color: var(--text-strong);
  font-size: 9.5px;
}

.password-rules ul {
  display: grid;
  gap: 7px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.password-rules li {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 8.7px;
  font-weight: 650;
}

.password-rules li.rule-ok {
  color: #21ba45;
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

/* REPRESENTANTE READ ONLY */
.current-representative-card {
  padding: 18px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
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

.readonly-link-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 16px;
  padding-top: 15px;
  border-top: 1px solid var(--border-soft);
}

.readonly-link-note__icon {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 10px;
}

.readonly-link-note strong,
.readonly-link-note span {
  display: block;
}

.readonly-link-note strong {
  color: var(--text-strong);
  font-size: 9.5px;
}

.readonly-link-note span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8.5px;
  line-height: 1.45;
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

.related-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
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
  .lojistas-page {
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

  .password-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .lojistas-page {
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

  .lojista-dialog {
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
  .lojistas-page {
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

  .lojista-dialog {
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
  .lojistas-page {
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
}
</style>
