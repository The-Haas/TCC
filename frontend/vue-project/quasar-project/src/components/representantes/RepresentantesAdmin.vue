<template>
  <q-page class="representantes-page">
    <!-- HERO -->
    <section class="page-hero">
      <div class="page-hero__copy">
        <div class="eyebrow">
          <span class="eyebrow__dot"></span>
          Gestão comercial
        </div>

        <h1>
          Representantes <span>comerciais</span>
        </h1>

        <p>
          Cadastre representantes, gerencie os lojistas vinculados a cada carteira
          e acompanhe seus projetos em uma única área administrativa.
        </p>
      </div>

      <div class="hero-summary">
        <div class="hero-summary__item">
          <span>Representantes</span>
          <strong>{{ representantes.length }}</strong>
        </div>

        <div class="hero-summary__divider"></div>

        <div class="hero-summary__item">
          <span>Lojistas vinculados</span>
          <strong>{{ totalLojistas }}</strong>
        </div>

        <div class="hero-summary__divider"></div>

        <div class="hero-summary__item">
          <span>Projetos</span>
          <strong>{{ totalPedidos }}</strong>
        </div>
      </div>
    </section>

    <!-- LISTAGEM PRINCIPAL -->
    <section class="panel representantes-panel">
      <div class="list-toolbar">
        <div>
          <div class="section-kicker">Cadastros</div>
          <h2>Representantes cadastrados</h2>
          <p>
            Clique em um representante para acessar dados, lojistas e projetos.
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
            unelevated
            no-caps
            icon="person_add"
            label="Novo representante"
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
          :rows="representantesFiltrados"
          :columns="colunasRepresentantes"
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

          <template #body-cell-representante="props">
            <q-td :props="props">
              <div class="person-cell">
                <div class="person-avatar">
                  {{ iniciais(props.row.nome) }}
                </div>

                <div>
                  <strong>{{ props.row.nome }}</strong>
                  <span>Representante comercial</span>
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

          <template #body-cell-carteira="props">
            <q-td :props="props">
              <div class="portfolio-cell">
                <span>
                  <q-icon name="storefront" size="15px" />
                  {{ Number(props.row.total_lojistas || 0) }}
                  {{ Number(props.row.total_lojistas || 0) === 1 ? 'lojista' : 'lojistas' }}
                </span>

                <span>
                  <q-icon name="inventory_2" size="15px" />
                  {{ Number(props.row.total_pedidos || 0) }}
                  {{ Number(props.row.total_pedidos || 0) === 1 ? 'projeto' : 'projetos' }}
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
                  @click.stop="abrirEdicao(props.row)"
                >
                  <q-tooltip>Abrir cadastro</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  class="table-action-btn table-action-btn--danger"
                  @click.stop="confirmarExclusaoRepresentante(props.row)"
                >
                  <q-tooltip>Excluir representante</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template #no-data>
            <div class="empty-state">
              <div class="empty-state__icon">
                <q-icon name="badge" size="29px" />
              </div>

              <strong>
                {{
                  busca
                    ? 'Nenhum representante encontrado'
                    : 'Nenhum representante cadastrado'
                }}
              </strong>

              <span>
                {{
                  busca
                    ? 'Tente pesquisar utilizando outro termo.'
                    : 'Cadastre o primeiro representante para começar.'
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
          <span>Carregando representantes...</span>
        </div>

        <div
          v-else-if="representantesPaginadosMobile.length === 0"
          class="empty-state"
        >
          <div class="empty-state__icon">
            <q-icon name="badge" size="29px" />
          </div>

          <strong>
            {{
              busca
                ? 'Nenhum representante encontrado'
                : 'Nenhum representante cadastrado'
            }}
          </strong>
        </div>

        <article
          v-for="rep in representantesPaginadosMobile"
          :key="rep.id"
          class="mobile-card"
          @click="abrirEdicao(rep)"
        >
          <div class="mobile-card__head">
            <div class="person-avatar person-avatar--mobile">
              {{ iniciais(rep.nome) }}
            </div>

            <div class="mobile-card__identity">
              <strong>{{ rep.nome }}</strong>
              <span>#{{ rep.id }} · Representante</span>
            </div>

            <q-icon name="chevron_right" size="20px" />
          </div>

          <div class="mobile-card__contacts">
            <div>
              <q-icon name="mail_outline" size="16px" />
              <span>{{ rep.email || 'E-mail não informado' }}</span>
            </div>

            <div>
              <q-icon name="phone" size="16px" />
              <span>{{ formatarTelefone(rep.telefone) }}</span>
            </div>
          </div>

          <div class="mobile-card__stats">
            <span>
              <q-icon name="storefront" size="15px" />
              {{ Number(rep.total_lojistas || 0) }} lojistas
            </span>

            <span>
              <q-icon name="inventory_2" size="15px" />
              {{ Number(rep.total_pedidos || 0) }} projetos
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

    <!-- WORKSPACE DO REPRESENTANTE -->
    <q-dialog
      v-model="modalEdicao"
      persistent
    >
      <q-card class="representante-dialog">
        <!-- CABEÇALHO -->
        <q-card-section class="workspace-head">
          <div class="workspace-identity">
            <div class="workspace-avatar">
              {{ iniciais(representanteEditando.nome) }}
            </div>

            <div>
              <div class="section-kicker">
                {{
                  representanteEditando.id
                    ? `Representante #${representanteEditando.id}`
                    : 'Novo representante'
                }}
              </div>

              <h2>
                {{
                  representanteEditando.nome ||
                  'Cadastrar representante'
                }}
              </h2>

              <p>
                {{
                  representanteEditando.email ||
                  'Preencha os dados para criar o novo acesso.'
                }}
              </p>
            </div>
          </div>

          <div
            v-if="representanteEditando.id"
            class="workspace-summary"
          >
            <div>
              <span>Lojistas</span>
              <strong>{{ lojistasVinculados.length }}</strong>
            </div>

            <div>
              <span>Projetos</span>
              <strong>{{ pedidosRepresentante.length }}</strong>
            </div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="salvando || processandoVinculo"
            class="workspace-close"
            @click="fecharModal"
          />
        </q-card-section>

        <!-- NAVEGAÇÃO DO CADASTRO -->
        <div class="workspace-tabbar-shell">
          <nav
            class="workspace-tabbar"
            aria-label="Seções do representante"
          >
            <button
              type="button"
              class="workspace-tab-card"
              :class="{ 'workspace-tab-card--active': tabEdicao === 'dados' }"
              @click="tabEdicao = 'dados'"
            >
              <span class="workspace-tab-card__icon">
                <q-icon name="person_outline" size="21px" />
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
              :class="{
                'workspace-tab-card--active': tabEdicao === 'lojistas',
                'workspace-tab-card--disabled': !representanteEditando.id
              }"
              :disabled="!representanteEditando.id"
              @click="representanteEditando.id && (tabEdicao = 'lojistas')"
            >
              <span class="workspace-tab-card__icon">
                <q-icon name="storefront" size="21px" />
              </span>

              <span class="workspace-tab-card__copy">
                <span class="workspace-tab-card__title-row">
                  <strong>Lojistas</strong>

                  <span
                    v-if="representanteEditando.id"
                    class="workspace-tab-count"
                  >
                    {{ lojistasVinculados.length }}
                  </span>
                </span>

                <small>
                  {{
                    representanteEditando.id
                      ? 'Gerenciar carteira'
                      : 'Disponível após salvar'
                  }}
                </small>
              </span>

              <q-icon
                v-if="!representanteEditando.id"
                name="lock_outline"
                size="15px"
                class="workspace-tab-lock"
              />
            </button>

            <button
              type="button"
              class="workspace-tab-card"
              :class="{
                'workspace-tab-card--active': tabEdicao === 'pedidos',
                'workspace-tab-card--disabled': !representanteEditando.id
              }"
              :disabled="!representanteEditando.id"
              @click="representanteEditando.id && (tabEdicao = 'pedidos')"
            >
              <span class="workspace-tab-card__icon">
                <q-icon name="inventory_2" size="21px" />
              </span>

              <span class="workspace-tab-card__copy">
                <span class="workspace-tab-card__title-row">
                  <strong>Projetos</strong>

                  <span
                    v-if="representanteEditando.id"
                    class="workspace-tab-count"
                  >
                    {{ pedidosRepresentante.length }}
                  </span>
                </span>

                <small>
                  {{
                    representanteEditando.id
                      ? 'Consulta da carteira'
                      : 'Disponível após salvar'
                  }}
                </small>
              </span>

              <q-icon
                v-if="!representanteEditando.id"
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
                ref="formRepresentante"
                @submit.prevent="salvarRepresentante"
              >
                <div class="tab-heading">
                  <div>
                    <div class="section-kicker">Cadastro</div>
                    <h3>Dados do representante</h3>
                    <p>
                      Atualize os dados de identificação e contato deste acesso.
                    </p>
                  </div>

                  <span
                    v-if="representanteEditando.id"
                    class="record-badge"
                  >
                    Registro #{{ representanteEditando.id }}
                  </span>
                </div>

                <section class="form-card">
                  <div class="form-card__head">
                    <div class="form-card__number">01</div>

                    <div>
                      <strong>Identificação e contato</strong>
                      <span>Dados utilizados em toda a plataforma.</span>
                    </div>
                  </div>

                  <div class="form-grid">
                    <div class="field-block field-block--full">
                      <span class="field-label">Nome do representante *</span>

                      <q-input
                        v-model="representanteEditando.nome"
                        outlined
                        dense
                        color="orange"
                        class="premium-field"
                        placeholder="Nome completo"
                        :rules="[
                          val => !!String(val || '').trim() || 'Informe o nome',
                          val => String(val || '').trim().length >= 3 || 'O nome é muito curto'
                        ]"
                      >
                        <template #prepend>
                          <q-icon name="person_outline" size="18px" />
                        </template>
                      </q-input>
                    </div>

                    <div class="field-block">
                      <span class="field-label">E-mail *</span>

                      <q-input
                        v-model="representanteEditando.email"
                        outlined
                        dense
                        type="email"
                        color="orange"
                        class="premium-field"
                        placeholder="representante@empresa.com"
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
                        v-model="representanteEditando.telefone"
                        outlined
                        dense
                        color="orange"
                        class="premium-field"
                        mask="(##) #####-####"
                        unmasked-value
                        placeholder="(00) 00000-0000"
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

                <!-- SENHA SÓ NO CADASTRO -->
                <section
                  v-if="!representanteEditando.id"
                  class="form-card"
                >
                  <div class="form-card__head">
                    <div class="form-card__number">02</div>

                    <div>
                      <strong>Senha inicial</strong>
                      <span>
                        A senha será utilizada no primeiro acesso do representante.
                      </span>
                    </div>
                  </div>

                  <div class="password-layout">
                    <div class="password-fields">
                      <div class="password-field-block">
                        <span class="field-label">Senha de acesso *</span>

                        <q-input
                          v-model="representanteEditando.senha"
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
                              representanteEditando.senha && !senhaValida
                          }"
                        >
                          <template
                            v-if="representanteEditando.senha && !senhaValida"
                          >
                            <q-icon name="error_outline" size="14px" />
                            <span>
                              A senha ainda não atende a todos os requisitos.
                            </span>
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
                          <template
                            v-if="confirmarSenha && !senhasConferem"
                          >
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

                <!-- INFO EDIÇÃO -->
                <div
                  v-else
                  class="info-banner"
                >
                  <q-icon name="info_outline" size="19px" />

                  <div>
                    <strong>Alteração de senha</strong>
                    <span>
                      Nesta ficha administrativa a senha atual é preservada.
                      O representante pode alterá-la pelo próprio perfil ou recuperação de senha.
                    </span>
                  </div>
                </div>

                <div
                  v-if="representanteEditando.id"
                  class="metadata-card"
                >
                  <div>
                    <span>Criado em</span>
                    <strong>{{ formatarData(representanteEditando.created_at) }}</strong>
                  </div>

                  <div>
                    <span>Última modificação</span>
                    <strong>{{ formatarData(representanteEditando.updated_at) }}</strong>
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
                    unelevated
                    no-caps
                    type="submit"
                    icon="save"
                    :label="
                      representanteEditando.id
                        ? 'Salvar alterações'
                        : 'Cadastrar representante'
                    "
                    :loading="salvando"
                    class="save-btn"
                  />
                </div>
              </q-form>
            </q-tab-panel>

            <!-- LOJISTAS -->
            <q-tab-panel
              name="lojistas"
              class="workspace-panel"
            >
              <div class="tab-heading tab-heading--with-actions">
                <div>
                  <div class="section-kicker">Carteira comercial</div>
                  <h3>Lojistas vinculados</h3>
                  <p>
                    Gerencie a carteira utilizando apenas os endpoints atuais de lojistas.
                  </p>
                </div>

                <q-btn
                  unelevated
                  no-caps
                  icon="swap_horiz"
                  label="Vincular / transferir lojista"
                  class="primary-btn"
                  @click="abrirModalVincular"
                />
              </div>

              <div class="related-summary related-summary--two">
                <article>
                  <div class="related-summary__icon">
                    <q-icon name="storefront" size="20px" />
                  </div>

                  <div>
                    <span>Lojistas na carteira</span>
                    <strong>{{ lojistasVinculados.length }}</strong>
                  </div>
                </article>

                <article>
                  <div class="related-summary__icon">
                    <q-icon name="inventory_2" size="20px" />
                  </div>

                  <div>
                    <span>Projetos desses lojistas</span>
                    <strong>{{ totalPedidosLojistasVinculados }}</strong>
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
                  placeholder="Pesquisar lojista..."
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

              <div
                v-if="false"
                class="related-loading"
              >
                <q-spinner color="orange" size="28px" />
                <span>Carregando carteira...</span>
              </div>

              <template v-else>
                <!-- DESKTOP -->
                <div class="related-desktop">
                  <q-table
                    flat
                    hide-bottom
                    row-key="id"
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
                          <div class="store-icon">
                            <q-icon name="storefront" size="18px" />
                          </div>

                          <div>
                            <strong>{{ props.row.nome }}</strong>
                            <span>#{{ props.row.id }}</span>
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

                    <template #body-cell-pedidos="props">
                      <q-td :props="props">
                        <span class="count-badge">
                          {{ Number(props.row.total_pedidos || 0) }}
                          {{
                            Number(props.row.total_pedidos || 0) === 1
                              ? 'projeto'
                              : 'projetos'
                          }}
                        </span>
                      </q-td>
                    </template>

                    <template #body-cell-acoes="props">
                      <q-td :props="props" class="text-right">
                        <q-btn
                          flat
                          no-caps
                          icon="swap_horiz"
                          label="Transferir"
                          class="unlink-btn"
                          @click="abrirTransferenciaSaida(props.row)"
                        />
                      </q-td>
                    </template>

                    <template #no-data>
                      <div class="empty-state empty-state--related">
                        <div class="empty-state__icon">
                          <q-icon name="link_off" size="28px" />
                        </div>

                        <strong>Nenhum lojista vinculado</strong>
                        <span>
                          Use “Vincular / transferir lojista” para trazer uma loja para esta carteira.
                        </span>
                      </div>
                    </template>
                  </q-table>
                </div>

                <!-- MOBILE -->
                <div class="related-mobile">
                  <article
                    v-for="lojista in lojistasPaginadosMobile"
                    :key="lojista.id"
                    class="related-mobile-card"
                  >
                    <div class="related-mobile-card__head">
                      <div class="store-icon">
                        <q-icon name="storefront" size="18px" />
                      </div>

                      <div>
                        <strong>{{ lojista.nome }}</strong>
                        <span>#{{ lojista.id }}</span>
                      </div>
                    </div>

                    <div class="related-mobile-card__body">
                      <span>
                        <q-icon name="mail_outline" size="15px" />
                        {{ lojista.email || 'Não informado' }}
                      </span>

                      <span>
                        <q-icon name="phone" size="15px" />
                        {{ formatarTelefone(lojista.telefone) }}
                      </span>

                      <span>
                        <q-icon name="inventory_2" size="15px" />
                        {{ Number(lojista.total_pedidos || 0) }} projetos
                      </span>
                    </div>

                    <q-btn
                      flat
                      no-caps
                      icon="swap_horiz"
                      label="Transferir"
                      class="unlink-btn unlink-btn--mobile"
                      @click="abrirTransferenciaSaida(lojista)"
                    />
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
              </template>
            </q-tab-panel>

            <!-- PEDIDOS -->
            <q-tab-panel
              name="pedidos"
              class="workspace-panel"
            >
              <div class="tab-heading">
                <div>
                  <div class="section-kicker">Somente leitura</div>
                  <h3>Projetos do representante</h3>
                  <p>
                    Visualização resumida dos projetos pertencentes aos lojistas da carteira atual.
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
                    <strong>{{ resumoPedidos.total_pedidos }}</strong>
                  </div>
                </article>

                <article>
                  <div class="related-summary__icon">
                    <q-icon name="payments" size="20px" />
                  </div>

                  <div>
                    <span>Volume financeiro</span>
                    <strong>{{ formatarMoeda(resumoPedidos.valor_total) }}</strong>
                  </div>
                </article>

                <article>
                  <div class="related-summary__icon">
                    <q-icon name="storefront" size="20px" />
                  </div>

                  <div>
                    <span>Lojistas com projetos</span>
                    <strong>{{ resumoPedidos.total_lojistas }}</strong>
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
                  placeholder="Pesquisar projeto, lojista ou cliente..."
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

              <div
                v-if="false"
                class="related-loading"
              >
                <q-spinner color="orange" size="28px" />
                <span>Carregando projetos...</span>
              </div>

              <template v-else>
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

                    <template #body-cell-rede="props">
                      <q-td :props="props">
                        <div class="network-cell">
                          <strong>{{ props.row.lojista || 'Lojista não informado' }}</strong>
                          <span>{{ props.row.cliente || 'Cliente não informado' }}</span>
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
                        <span>
                          Não há projetos para os filtros informados.
                        </span>
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
                        <span>Lojista</span>
                        <strong>{{ pedido.lojista || '—' }}</strong>
                      </div>

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
              </template>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- MODAL VINCULAR LOJISTA -->
    <q-dialog
      v-model="modalVincular"
      persistent
    >
      <q-card class="link-dialog">
        <q-card-section class="link-dialog__head">
          <div>
            <div class="section-kicker">Carteira comercial</div>
            <h3>Vincular ou transferir lojista</h3>
            <p>
              Todos os lojistas já possuem representante. Escolha uma loja de outra carteira para transferi-la para este representante.
            </p>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="processandoVinculo"
            @click="modalVincular = false"
          />
        </q-card-section>

        <q-card-section class="link-dialog__toolbar">
          <q-input
            v-model="buscaDisponiveis"
            outlined
            dense
            clearable
            debounce="250"
            class="search-field search-field--link"
            placeholder="Pesquisar lojista..."
          >
            <template #prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-section class="link-dialog__body">
          <div
            v-if="false"
            class="related-loading"
          >
            <q-spinner color="orange" size="28px" />
            <span>Buscando lojistas...</span>
          </div>

          <div
            v-else-if="lojistasDisponiveisFiltrados.length === 0"
            class="empty-state empty-state--link"
          >
            <div class="empty-state__icon">
              <q-icon name="storefront" size="28px" />
            </div>

            <strong>Nenhum lojista disponível</strong>
            <span>
              Não existem lojas em outras carteiras que correspondam à busca.
            </span>
          </div>

          <article
            v-for="lojista in lojistasDisponiveisFiltrados"
            v-else
            :key="lojista.id"
            class="available-store-card"
          >
            <div class="available-store-card__identity">
              <div class="store-icon">
                <q-icon name="storefront" size="18px" />
              </div>

              <div>
                <strong>{{ lojista.nome }}</strong>
                <span>{{ lojista.email || formatarTelefone(lojista.telefone) }}</span>
              </div>
            </div>

            <div class="available-store-card__meta">
              <span
                class="availability-badge availability-badge--linked"
              >
                Atualmente com {{ lojista.nome_representante || 'outro representante' }}
              </span>

              <span class="order-count">
                {{ Number(lojista.total_pedidos || 0) }} projetos
              </span>
            </div>

            <q-btn
              unelevated
              no-caps
              icon="swap_horiz"
              label="Transferir para cá"
              class="link-btn"
              @click="confirmarVinculo(lojista)"
            />
          </article>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- CONFIRMAÇÃO VÍNCULO/DESVÍNCULO -->
    <q-dialog
      v-model="modalConfirmarVinculo"
      persistent
    >
      <q-card class="confirm-dialog">
        <q-card-section class="confirm-dialog__head">
          <div class="confirm-dialog__icon">
            <q-icon name="swap_horiz" size="22px" />
          </div>

          <div>
            <div class="section-kicker">
              Transferência de carteira
            </div>

            <h3>Transferir lojista?</h3>
          </div>
        </q-card-section>

        <q-card-section class="confirm-dialog__body">
          <p>
            <strong>{{ acaoVinculo.lojista?.nome }}</strong>
          </p>

          <div class="confirm-note confirm-note--warning">
            <q-icon name="swap_horiz" size="18px" />

            <span>
              Atualmente pertence a
              <strong>{{ acaoVinculo.lojista?.nome_representante || 'outro representante' }}</strong>.
              A loja e seus projetos passarão a compor a carteira de
              <strong>{{ representanteEditando.nome }}</strong>.
            </span>
          </div>
        </q-card-section>

        <q-card-actions class="confirm-dialog__actions">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            class="secondary-btn"
            :disable="processandoVinculo"
            @click="modalConfirmarVinculo = false"
          />

          <q-btn
            unelevated
            no-caps
            icon="check"
            label="Confirmar transferência"
            :loading="processandoVinculo"
            class="save-btn"
            @click="executarAcaoVinculo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- TRANSFERIR LOJISTA PARA OUTRO REPRESENTANTE -->
    <q-dialog
      v-model="modalTransferenciaSaida"
      persistent
    >
      <q-card class="link-dialog transfer-dialog">
        <q-card-section class="link-dialog__head">
          <div>
            <div class="section-kicker">Alterar vínculo</div>
            <h3>Transferir lojista</h3>
            <p>
              Selecione o novo representante para remover a loja da carteira atual sem deixar o vínculo vazio.
            </p>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="processandoVinculo"
            @click="modalTransferenciaSaida = false"
          />
        </q-card-section>

        <q-card-section class="transfer-current-store">
          <div class="store-icon">
            <q-icon name="storefront" size="18px" />
          </div>

          <div>
            <span>Lojista</span>
            <strong>{{ lojistaParaTransferir?.nome }}</strong>
          </div>
        </q-card-section>

        <q-card-section class="link-dialog__toolbar">
          <q-input
            v-model="buscaRepresentanteDestino"
            outlined
            dense
            clearable
            debounce="250"
            class="search-field search-field--link"
            placeholder="Pesquisar representante de destino..."
          >
            <template #prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-section class="link-dialog__body">
          <div
            v-if="representantesDestinoFiltrados.length === 0"
            class="empty-state empty-state--link"
          >
            <div class="empty-state__icon">
              <q-icon name="badge" size="28px" />
            </div>

            <strong>Nenhum representante disponível</strong>
          </div>

          <article
            v-for="rep in representantesDestinoFiltrados"
            v-else
            :key="rep.id"
            class="available-store-card"
          >
            <div class="available-store-card__identity">
              <div class="person-avatar">
                {{ iniciais(rep.nome) }}
              </div>

              <div>
                <strong>{{ rep.nome }}</strong>
                <span>{{ rep.email || formatarTelefone(rep.telefone) }}</span>
              </div>
            </div>

            <div class="available-store-card__meta">
              <span class="order-count">
                {{ Number(rep.total_lojistas || 0) }} lojistas
              </span>
            </div>

            <q-btn
              unelevated
              no-caps
              icon="swap_horiz"
              label="Transferir"
              class="link-btn"
              :loading="processandoVinculo && representanteDestinoSelecionado === rep.id"
              @click="transferirParaRepresentante(rep)"
            />
          </article>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- EXCLUSÃO REPRESENTANTE -->
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
            <h3>Excluir representante?</h3>
          </div>
        </q-card-section>

        <q-card-section class="confirm-dialog__body">
          <p>
            O cadastro de
            <strong>{{ representanteParaExcluir?.nome }}</strong>
            será removido.
          </p>

          <div class="confirm-note confirm-note--warning">
            <q-icon name="warning_amber" size="18px" />

            <span>
              A exclusão será bloqueada se existirem lojistas vinculados ou histórico
              de projetos enviados pelo representante.
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
            label="Excluir representante"
            :loading="excluindo"
            class="danger-btn"
            @click="excluirRepresentante"
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

const $q = useQuasar()
const authStore = useAuthStore()

const formRepresentante = ref(null)

const loading = ref(true)
const salvando = ref(false)
const excluindo = ref(false)
const processandoVinculo = ref(false)

const representantes = ref([])
const todosLojistas = ref([])
const todosPedidos = ref([])

const busca = ref('')

const modalEdicao = ref(false)
const modalExclusao = ref(false)
const modalVincular = ref(false)
const modalConfirmarVinculo = ref(false)
const modalTransferenciaSaida = ref(false)

const representanteEditando = ref({})
const representanteParaExcluir = ref(null)

const tabEdicao = ref('dados')

const ocultarSenha = ref(true)
const ocultarConfirmacao = ref(true)
const confirmarSenha = ref('')

const buscaLojistas = ref('')
const buscaDisponiveis = ref('')
const buscaPedidos = ref('')
const filtroStatusPedido = ref('todos')

const acaoVinculo = ref({
  lojista: null
})

const lojistaParaTransferir = ref(null)
const buscaRepresentanteDestino = ref('')
const representanteDestinoSelecionado = ref(null)

const paginacao = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 10
})

const paginacaoLojistas = ref({
  page: 1,
  rowsPerPage: 6
})

const paginacaoPedidos = ref({
  page: 1,
  rowsPerPage: 7
})

const colunasRepresentantes = [
  {
    name: 'id',
    field: 'id',
    label: 'ID',
    align: 'left',
    sortable: true,
    style: 'width: 72px'
  },
  {
    name: 'representante',
    field: 'nome',
    label: 'Representante',
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
    name: 'carteira',
    field: 'total_lojistas',
    label: 'Carteira',
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

const colunasLojistas = [
  {
    name: 'lojista',
    field: 'nome',
    label: 'Lojista',
    align: 'left',
    sortable: true
  },
  {
    name: 'contato',
    field: 'email',
    label: 'Contato',
    align: 'left'
  },
  {
    name: 'pedidos',
    field: 'total_pedidos',
    label: 'Projetos',
    align: 'left',
    sortable: true
  },
  {
    name: 'acoes',
    field: 'acoes',
    label: '',
    align: 'right',
    style: 'width: 150px'
  }
]

const colunasPedidos = [
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
    label: 'Lojista / Cliente',
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

const representantesEnriquecidos = computed(() =>
  representantes.value.map(rep => {
    const lojistasIds =
      todosLojistas.value
        .filter(lojista =>
          String(lojista.id_representante) ===
          String(rep.id)
        )
        .map(lojista => Number(lojista.id))

    const idsSet = new Set(lojistasIds)

    const totalPedidosRep =
      todosPedidos.value.filter(pedido =>
        idsSet.has(Number(pedido.id_lojista))
      ).length

    return {
      ...rep,
      total_lojistas: lojistasIds.length,
      total_pedidos: totalPedidosRep
    }
  })
)

const totalLojistas = computed(() =>
  todosLojistas.value.length
)

const totalPedidos = computed(() =>
  todosPedidos.value.length
)

const representantesFiltrados = computed(() => {
  const termo =
    String(busca.value || '')
      .trim()
      .toLowerCase()

  const base =
    representantesEnriquecidos.value

  if (!termo) {
    return base
  }

  return base.filter(rep =>
    [
      rep.id,
      rep.nome,
      rep.email,
      rep.telefone
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
        representantesFiltrados.value.length /
        limite
      ) || 1
})

const representantesPaginadosMobile = computed(() => {
  const limite =
    Number(paginacao.value.rowsPerPage)

  if (!limite) {
    return representantesFiltrados.value
  }

  const inicio =
    (Number(paginacao.value.page) - 1) *
    limite

  return representantesFiltrados.value.slice(
    inicio,
    inicio + limite
  )
})

const regraSenha = computed(() => {
  const senha =
    String(representanteEditando.value.senha || '')

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
    String(representanteEditando.value.senha || '')

  if (!senha) return false

  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(
    senha
  )
})

const senhasConferem = computed(() =>
  Boolean(representanteEditando.value.senha) &&
  representanteEditando.value.senha ===
    confirmarSenha.value
)

/*
 * IMPORTANTE:
 * o banco legado obriga id_representante NOT NULL.
 * Portanto todos os lojistas sempre pertencem a algum representante.
 */
const lojistasVinculados = computed(() => {
  if (!representanteEditando.value.id) {
    return []
  }

  return todosLojistas.value
    .filter(lojista =>
      String(lojista.id_representante) ===
      String(representanteEditando.value.id)
    )
    .map(lojista => ({
      ...lojista,
      total_pedidos:
        todosPedidos.value.filter(pedido =>
          String(pedido.id_lojista) ===
          String(lojista.id)
        ).length
    }))
})

const lojistasDisponiveis = computed(() => {
  if (!representanteEditando.value.id) {
    return []
  }

  return todosLojistas.value
    .filter(lojista =>
      String(lojista.id_representante) !==
      String(representanteEditando.value.id)
    )
    .map(lojista => {
      const representanteAtual =
        representantes.value.find(rep =>
          String(rep.id) ===
          String(lojista.id_representante)
        )

      return {
        ...lojista,
        nome_representante:
          lojista.nome_representante ||
          representanteAtual?.nome ||
          'Outro representante',

        total_pedidos:
          todosPedidos.value.filter(pedido =>
            String(pedido.id_lojista) ===
            String(lojista.id)
          ).length
      }
    })
})

const pedidosRepresentante = computed(() => {
  if (!representanteEditando.value.id) {
    return []
  }

  /*
   * O service atual de GET /pedidos já devolve id_representante.
   * Se por algum motivo vier sem esse campo, há fallback pela FK do lojista.
   */
  const idsLojistas =
    new Set(
      lojistasVinculados.value.map(
        lojista => String(lojista.id)
      )
    )

  return todosPedidos.value.filter(pedido => {
    if (
      pedido.id_representante !== null &&
      pedido.id_representante !== undefined
    ) {
      return (
        String(pedido.id_representante) ===
        String(representanteEditando.value.id)
      )
    }

    return idsLojistas.has(
      String(pedido.id_lojista)
    )
  })
})

const lojistasFiltrados = computed(() => {
  const termo =
    String(buscaLojistas.value || '')
      .trim()
      .toLowerCase()

  if (!termo) {
    return lojistasVinculados.value
  }

  return lojistasVinculados.value.filter(lojista =>
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

const totalPedidosLojistasVinculados = computed(() =>
  lojistasVinculados.value.reduce(
    (total, lojista) =>
      total + Number(lojista.total_pedidos || 0),
    0
  )
)

const numeroPaginasLojistas = computed(() =>
  Math.ceil(
    lojistasFiltrados.value.length /
    Number(paginacaoLojistas.value.rowsPerPage || 6)
  ) || 1
)

const lojistasPaginadosMobile = computed(() => {
  const limite =
    Number(paginacaoLojistas.value.rowsPerPage || 6)

  const inicio =
    (Number(paginacaoLojistas.value.page) - 1) *
    limite

  return lojistasFiltrados.value.slice(
    inicio,
    inicio + limite
  )
})

const lojistasDisponiveisFiltrados = computed(() => {
  const termo =
    String(buscaDisponiveis.value || '')
      .trim()
      .toLowerCase()

  if (!termo) {
    return lojistasDisponiveis.value
  }

  return lojistasDisponiveis.value.filter(lojista =>
    [
      lojista.nome,
      lojista.email,
      lojista.telefone,
      lojista.nome_representante
    ].some(valor =>
      String(valor ?? '')
        .toLowerCase()
        .includes(termo)
    )
  )
})

const representantesDestinoFiltrados = computed(() => {
  const termo =
    String(buscaRepresentanteDestino.value || '')
      .trim()
      .toLowerCase()

  const base =
    representantesEnriquecidos.value.filter(rep =>
      String(rep.id) !==
      String(representanteEditando.value.id)
    )

  if (!termo) {
    return base
  }

  return base.filter(rep =>
    [
      rep.nome,
      rep.email,
      rep.telefone
    ].some(valor =>
      String(valor ?? '')
        .toLowerCase()
        .includes(termo)
    )
  )
})

const opcoesStatusPedido = computed(() => {
  const mapa = new Map()

  pedidosRepresentante.value.forEach(pedido => {
    if (pedido.status) {
      mapa.set(
        String(pedido.status),
        String(pedido.status)
      )
    }
  })

  return [
    {
      label: 'Todos os status',
      value: 'todos'
    },
    ...[...mapa.values()]
      .sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      )
      .map(status => ({
        label: status,
        value: status
      }))
  ]
})

const pedidosFiltrados = computed(() => {
  const termo =
    String(buscaPedidos.value || '')
      .trim()
      .toLowerCase()

  return pedidosRepresentante.value.filter(pedido => {
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
      pedido.lojista,
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

const resumoPedidos = computed(() => ({
  total_pedidos:
    pedidosRepresentante.value.length,

  valor_total:
    pedidosRepresentante.value.reduce(
      (total, pedido) =>
        total + Number(pedido.valor || 0),
      0
    ),

  total_lojistas:
    new Set(
      pedidosRepresentante.value
        .map(pedido => pedido.id_lojista)
        .filter(Boolean)
    ).size
}))

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
  () => buscaLojistas.value,
  () => {
    paginacaoLojistas.value.page = 1
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

const headers = computed(() => ({
  Authorization:
    `Bearer ${authStore.token}`
}))

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

/*
 * CARREGAMENTO FRONT-ONLY
 *
 * /representantes -> cadastros
 * /lojistas        -> vínculo atual
 * /pedidos         -> admin recebe todos, front filtra
 */
async function carregarBase() {
  loading.value = true

  try {
    const [
      repsResponse,
      lojistasResponse,
      pedidosResponse
    ] = await Promise.all([
      api.get('/representantes', {
        headers: headers.value
      }),

      api.get('/lojistas', {
        headers: headers.value
      }),

      api.get('/pedidos', {
        headers: headers.value
      })
    ])

    representantes.value =
      repsResponse.data.data ||
      repsResponse.data ||
      []

    todosLojistas.value =
      lojistasResponse.data.data ||
      lojistasResponse.data ||
      []

    todosPedidos.value =
      pedidosResponse.data.data ||
      pedidosResponse.data ||
      []
  } catch (error) {
    console.error(
      'Erro ao carregar representantes:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Erro ao carregar os dados da tela de representantes.',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

async function atualizarRelacionamentos() {
  try {
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

    todosLojistas.value =
      lojistasResponse.data.data ||
      lojistasResponse.data ||
      []

    todosPedidos.value =
      pedidosResponse.data.data ||
      pedidosResponse.data ||
      []
  } catch (error) {
    console.error(
      'Erro ao atualizar vínculos:',
      error
    )

    throw error
  }
}

function handleRowClick(evt, row) {
  abrirEdicao(row)
}

async function abrirEdicao(representante) {
  resetWorkspace()

  representanteEditando.value =
    JSON.parse(
      JSON.stringify(representante)
    )

  tabEdicao.value = 'dados'
  modalEdicao.value = true

  try {
    const response =
      await api.get(
        `/representantes/${representante.id}`,
        {
          headers: headers.value
        }
      )

    representanteEditando.value = {
      ...representanteEditando.value,
      ...(response.data.data ||
         response.data ||
         {})
    }
  } catch (error) {
    console.error(
      'Erro ao carregar representante:',
      error
    )
  }
}

function abrirNovo() {
  resetWorkspace()

  representanteEditando.value = {
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

  buscaLojistas.value = ''
  buscaDisponiveis.value = ''
  buscaPedidos.value = ''
  filtroStatusPedido.value = 'todos'

  paginacaoLojistas.value.page = 1
  paginacaoPedidos.value.page = 1

  modalVincular.value = false
  modalConfirmarVinculo.value = false
  modalTransferenciaSaida.value = false

  acaoVinculo.value = {
    lojista: null
  }

  lojistaParaTransferir.value = null
  buscaRepresentanteDestino.value = ''
  representanteDestinoSelecionado.value = null
}

function fecharModal() {
  if (
    salvando.value ||
    processandoVinculo.value
  ) {
    return
  }

  modalEdicao.value = false
}

async function salvarRepresentante() {
  const valido =
    await formRepresentante.value.validate()

  if (!valido) {
    $q.notify({
      type: 'warning',
      message:
        'Existem campos inválidos. Verifique os dados preenchidos.',
      position: 'top-right'
    })

    return
  }

  if (!representanteEditando.value.id) {
    if (!representanteEditando.value.senha) {
      $q.notify({
        type: 'warning',
        message:
          'Informe a senha inicial do representante.',
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
        String(
          representanteEditando.value.nome ||
          ''
        ).trim(),

      email:
        String(
          representanteEditando.value.email ||
          ''
        ).trim(),

      telefone:
        String(
          representanteEditando.value.telefone ||
          ''
        ).replace(/\D/g, '')
    }

    if (representanteEditando.value.id) {
      const response =
        await api.patch(
          `/representantes/${representanteEditando.value.id}`,
          payload,
          {
            headers: headers.value
          }
        )

      representanteEditando.value = {
        ...representanteEditando.value,
        ...(response.data.data ||
           response.data ||
           {})
      }

      $q.notify({
        type: 'positive',
        message:
          'Representante atualizado com sucesso.',
        icon: 'check_circle',
        position: 'top-right'
      })
    } else {
      payload.senha =
        representanteEditando.value.senha

      const response =
        await api.post(
          '/representantes',
          payload,
          {
            headers: headers.value
          }
        )

      const novoId =
        response.data.id_representante ||
        response.data.representante?.id

      if (!novoId) {
        throw new Error(
          'O backend não retornou o ID do novo representante.'
        )
      }

      representanteEditando.value = {
        ...(response.data.representante || {}),
        id: novoId
      }

      confirmarSenha.value = ''

      $q.notify({
        type: 'positive',
        message:
          'Representante criado. As abas de lojistas e projetos foram liberadas.',
        icon: 'check_circle',
        position: 'top-right'
      })
    }

    await carregarBase()
  } catch (error) {
    console.error(
      'Erro ao salvar representante:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        error.message ||
        'Falha ao salvar representante.',
      position: 'top-right'
    })
  } finally {
    salvando.value = false
  }
}

function abrirModalVincular() {
  buscaDisponiveis.value = ''
  modalVincular.value = true
}

function confirmarVinculo(lojista) {
  acaoVinculo.value = {
    lojista
  }

  modalConfirmarVinculo.value = true
}

/*
 * Usa exclusivamente o PATCH já existente:
 * PATCH /lojistas/:id
 * { id_representante: <representante aberto> }
 */
async function executarAcaoVinculo() {
  const representanteId =
    representanteEditando.value.id

  const lojista =
    acaoVinculo.value.lojista

  if (!representanteId || !lojista?.id) {
    return
  }

  processandoVinculo.value = true

  try {
    await api.patch(
      `/lojistas/${lojista.id}`,
      {
        id_representante:
          representanteId
      },
      {
        headers: headers.value
      }
    )

    $q.notify({
      type: 'positive',
      message:
        `${lojista.nome} agora pertence à carteira de ${representanteEditando.value.nome}.`,
      icon: 'check_circle',
      position: 'top-right'
    })

    modalConfirmarVinculo.value = false
    modalVincular.value = false

    await atualizarRelacionamentos()
  } catch (error) {
    console.error(
      'Erro ao transferir lojista:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Erro ao alterar o representante do lojista.',
      position: 'top-right'
    })
  } finally {
    processandoVinculo.value = false
  }
}

/*
 * "Desvincular" no banco legado precisa significar transferir.
 * id_representante é NOT NULL, então não é possível deixar a loja sem representante.
 */
function abrirTransferenciaSaida(lojista) {
  lojistaParaTransferir.value =
    JSON.parse(JSON.stringify(lojista))

  buscaRepresentanteDestino.value = ''
  representanteDestinoSelecionado.value = null
  modalTransferenciaSaida.value = true
}

async function transferirParaRepresentante(repDestino) {
  if (
    !lojistaParaTransferir.value?.id ||
    !repDestino?.id
  ) {
    return
  }

  processandoVinculo.value = true
  representanteDestinoSelecionado.value =
    repDestino.id

  try {
    await api.patch(
      `/lojistas/${lojistaParaTransferir.value.id}`,
      {
        id_representante:
          repDestino.id
      },
      {
        headers: headers.value
      }
    )

    $q.notify({
      type: 'positive',
      message:
        `${lojistaParaTransferir.value.nome} foi transferido para ${repDestino.nome}.`,
      icon: 'swap_horiz',
      position: 'top-right'
    })

    modalTransferenciaSaida.value = false
    lojistaParaTransferir.value = null

    await atualizarRelacionamentos()
  } catch (error) {
    console.error(
      'Erro ao transferir lojista:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Erro ao transferir o lojista.',
      position: 'top-right'
    })
  } finally {
    processandoVinculo.value = false
    representanteDestinoSelecionado.value = null
  }
}

function confirmarExclusaoRepresentante(
  representante
) {
  representanteParaExcluir.value =
    JSON.parse(
      JSON.stringify(representante)
    )

  modalExclusao.value = true
}

async function excluirRepresentante() {
  if (
    !representanteParaExcluir.value?.id
  ) {
    return
  }

  excluindo.value = true

  try {
    await api.delete(
      `/representantes/${representanteParaExcluir.value.id}`,
      {
        headers: headers.value
      }
    )

    $q.notify({
      type: 'positive',
      message:
        'Representante removido com sucesso.',
      icon: 'check_circle',
      position: 'top-right'
    })

    modalExclusao.value = false
    representanteParaExcluir.value = null

    await carregarBase()
  } catch (error) {
    console.error(
      'Erro ao excluir representante:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Erro ao excluir o representante.',
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

  const data = new Date(
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
.representantes-page {
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

.representantes-panel {
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
.available-store-card__identity {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.person-avatar {
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
.portfolio-cell {
  display: grid;
  gap: 5px;
}

.contact-cell div,
.portfolio-cell span {
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
.mobile-loading,
.related-loading {
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
.mobile-loading span,
.related-loading span {
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

.person-avatar--mobile {
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
  gap: 7px;
  margin-top: 12px;
  padding: 11px 0;
  border-top: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
}

.mobile-card__contacts div,
.mobile-card__stats span {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  color: var(--text-muted);
  font-size: 9px;
}

.mobile-card__contacts span {
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
.representante-dialog {
  width: min(1120px, calc(100vw - 28px));
  height: min(860px, calc(100vh - 28px));
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
  font-size: 14px;
  font-weight: 850;
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
  overflow-wrap: anywhere;
}

.workspace-summary {
  display: flex;
  align-items: stretch;
  gap: 0;
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


/* TABS PREMIUM */
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
  width: 100%;
  min-width: 0;
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
    background .16s ease,
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
  transition:
    color .16s ease,
    background .16s ease,
    border-color .16s ease;
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

.workspace-tab-card--disabled .workspace-tab-card__icon {
  background: var(--surf-1);
}

/* notebook/tablet */
@media (max-width: 900px) {
  .workspace-tabbar-shell {
    padding: 11px 12px;
  }

  .workspace-tab-card {
    min-height: 60px;
    grid-template-columns: 34px minmax(0, 1fr) auto;
    gap: 8px;
    padding: 9px 10px;
  }

  .workspace-tab-card__icon {
    width: 34px;
    height: 34px;
  }

  .workspace-tab-card__copy strong {
    font-size: 9.5px;
  }

  .workspace-tab-card__copy small {
    font-size: 7.5px;
  }
}

/* mobile: cards compactos com scroll interno */
@media (max-width: 680px) {
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
    grid-template-columns: repeat(3, 150px);
    width: max-content;
    min-width: max-content;
    gap: 7px;
  }

  .workspace-tab-card {
    min-height: 55px;
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 8px;
    padding: 8px 9px;
    border-radius: 11px;
  }

  .workspace-tab-card__icon {
    width: 32px;
    height: 32px;
    border-radius: 9px;
  }

  .workspace-tab-card__copy strong {
    font-size: 9px;
  }

  .workspace-tab-card__copy small {
    margin-top: 2px;
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
    border-radius: 6px;
  }

  .workspace-tab-count {
    min-width: 18px;
    height: 18px;
    padding-inline: 5px;
    font-size: 7px;
  }
}

@media (max-width: 430px) {
  .workspace-tabbar {
    grid-template-columns: repeat(3, 138px);
  }
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

.tab-heading--with-actions {
  align-items: center;
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

.password-field-block {
  min-width: 0;
}

.validation-slot {
  width: 100%;
  height: 34px;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  box-sizing: border-box;
  padding: 5px 9px 0;
  color: transparent;
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
  line-height: 1.45;
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

.save-btn,
.link-btn {
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

/* RELACIONADOS */
.related-summary {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
}

.related-summary--two {
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
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

.related-loading {
  min-height: 260px;
}

.store-icon,
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

.count-badge {
  display: inline-flex;
  padding: 5px 8px;
  color: var(--text-base);
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  font-size: 8.5px;
  font-weight: 700;
}

.unlink-btn {
  color: #d95050;
  background: rgba(217, 80, 80, .07);
  border-radius: 8px;
  font-size: 8.5px;
}

.related-mobile,
.orders-mobile {
  display: none;
}

.related-mobile-card,
.order-mobile-card {
  margin-bottom: 9px;
  padding: 13px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
}

.related-mobile-card__head,
.order-mobile-card__top {
  display: flex;
  align-items: center;
  gap: 9px;
}

.related-mobile-card__head strong,
.related-mobile-card__head span,
.order-mobile-card__top strong,
.order-mobile-card__top span {
  display: block;
}

.related-mobile-card__head strong,
.order-mobile-card__top strong {
  color: var(--text-strong);
  font-size: 10px;
}

.related-mobile-card__head span,
.order-mobile-card__top span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8px;
}

.related-mobile-card__body {
  display: grid;
  gap: 6px;
  margin: 10px 0;
  padding: 10px 0;
  border-top: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
}

.related-mobile-card__body span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 8.5px;
  overflow-wrap: anywhere;
}

.unlink-btn--mobile {
  width: 100%;
}

.related-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}

.network-cell strong,
.network-cell span {
  display: block;
}

.network-cell strong {
  color: var(--text-strong);
  font-size: 9.5px;
}

.network-cell span {
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

.order-mobile-card > .status-badge {
  margin-top: 10px;
}

.order-mobile-card__grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 11px;
  padding-top: 10px;
  border-top: 1px solid var(--border-soft);
}

.order-mobile-card__grid span,
.order-mobile-card__grid strong {
  display: block;
}

.order-mobile-card__grid span {
  color: var(--text-muted);
  font-size: 7.5px;
  text-transform: uppercase;
}

.order-mobile-card__grid strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 8.7px;
  overflow-wrap: anywhere;
}

/* LINK MODAL */
.link-dialog {
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

.link-dialog__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px 14px;
}

.link-dialog__head h3 {
  margin: 6px 0 3px;
  color: var(--text-strong);
  font-size: 17px;
  font-weight: 800;
}

.link-dialog__head p {
  margin: 0;
  color: var(--text-muted);
  font-size: 9px;
}

.link-dialog__toolbar {
  padding: 10px 20px;
  background: var(--surf-2);
  border-top: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
}

.search-field--link {
  width: 100%;
}

.link-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 12px;
  overflow-y: auto;
}

.available-store-card {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    auto
    auto;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  padding: 11px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 11px;
}

.available-store-card__identity > div:last-child {
  min-width: 0;
}

.available-store-card__identity strong,
.available-store-card__identity span {
  display: block;
}

.available-store-card__identity strong {
  color: var(--text-strong);
  font-size: 9.5px;
}

.available-store-card__identity span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8px;
  overflow-wrap: anywhere;
}

.available-store-card__meta {
  display: grid;
  justify-items: end;
  gap: 5px;
}

.availability-badge {
  padding: 4px 7px;
  border-radius: 999px;
  font-size: 7.5px;
  font-weight: 750;
}

.availability-badge--free {
  color: #168c36;
  background: rgba(33, 186, 69, .09);
}

.availability-badge--linked {
  color: #a86700;
  background: rgba(242, 160, 7, .1);
}

.order-count {
  color: var(--text-muted);
  font-size: 7.8px;
}

.link-btn {
  min-width: 100px;
  font-size: 8.5px;
}

/* CONFIRM */
.confirm-dialog {
  width: min(460px, calc(100vw - 24px));
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
  .representantes-page {
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

  .password-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .representantes-page {
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

  .representante-dialog {
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

  .related-desktop,
  .orders-desktop {
    display: none;
  }

  .related-mobile,
  .orders-mobile {
    display: block;
  }
}

@media (max-width: 680px) {
  .representantes-page {
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

  .representante-dialog {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    border: 0;
  }

  .workspace-head {
    min-height: 78px;
    padding: 13px 12px;
  }

  .workspace-avatar {
    width: 43px;
    height: 43px;
    flex-basis: 43px;
    border-radius: 12px;
  }

  .workspace-identity h2 {
    font-size: 15px;
  }

  .workspace-identity p {
    display: none;
  }

  .workspace-panel {
    padding: 16px 12px 22px;
  }

  .tab-heading,
  .tab-heading--with-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .tab-heading--with-actions .primary-btn {
    width: 100%;
  }

  .form-grid,
  .related-summary--two,
  .related-summary--three {
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

  .order-mobile-card__grid {
    grid-template-columns: 1fr;
  }

  .link-dialog {
    width: calc(100vw - 14px);
    max-height: calc(100vh - 14px);
    border-radius: 14px;
  }

  .available-store-card {
    grid-template-columns: 1fr;
  }

  .available-store-card__meta {
    justify-items: start;
  }

  .link-btn {
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
  .representantes-page {
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

  .mobile-card {
    padding: 12px;
  }

  .workspace-identity {
    gap: 9px;
  }

  .workspace-close {
    align-self: start;
  }
}

.transfer-current-store {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: var(--surf-2);
  border-top: 1px solid var(--border-soft);
}

.transfer-current-store span,
.transfer-current-store strong {
  display: block;
}

.transfer-current-store span {
  color: var(--text-muted);
  font-size: 7.8px;
  text-transform: uppercase;
}

.transfer-current-store strong {
  margin-top: 2px;
  color: var(--text-strong);
  font-size: 10px;
}

@media (max-width: 680px) {
  .transfer-dialog {
    width: calc(100vw - 14px);
  }
}
</style>
