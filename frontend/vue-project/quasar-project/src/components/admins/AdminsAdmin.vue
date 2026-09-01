<template>
  <q-page class="admins-page">
    <!-- HERO -->
    <section class="admins-hero">
      <div class="admins-hero__copy">
        <div class="admins-eyebrow">
          <span class="admins-eyebrow__dot"></span>
          Gestão de acessos
        </div>

        <h1 class="admins-title">
          Administradores do <span>sistema</span>
        </h1>

        <p class="admins-subtitle">
          Cadastre e mantenha os usuários com acesso administrativo à plataforma Artezza.
          Essas contas possuem permissões elevadas sobre projetos, cadastros e configurações.
        </p>
      </div>

      <div class="admins-hero__summary">
        <div class="hero-summary-item">
          <span>Total de admins</span>
          <strong>{{ admins.length }}</strong>
        </div>

        <div class="hero-summary-divider"></div>

        <div class="hero-summary-item">
          <span>Com telefone</span>
          <strong>{{ adminsComTelefone }}</strong>
        </div>

        <div class="hero-summary-divider"></div>

        <div class="hero-summary-item hero-summary-item--wide">
          <span>Acesso</span>
          <strong>Administrativo</strong>
        </div>
      </div>
    </section>

    <!-- AVISO -->
    <section class="access-warning panel">
      <div class="access-warning__icon">
        <q-icon name="admin_panel_settings" size="22px" />
      </div>

      <div class="access-warning__copy">
        <strong>Contas com acesso privilegiado</strong>
        <span>
          Administradores podem acessar configurações globais e funções sensíveis do sistema.
          Cadastre apenas usuários autorizados.
        </span>
      </div>
    </section>

    <!-- LISTAGEM -->
    <section class="panel admins-panel">
      <div class="list-toolbar">
        <div>
          <div class="section-kicker">Usuários administrativos</div>
          <h2>Administradores cadastrados</h2>
          <p>
            Clique em um registro para visualizar ou atualizar seus dados.
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
            label="Novo admin"
            class="primary-btn primary-btn--compact"
            @click="abrirNovo"
          />
        </div>
      </div>

      <!-- DESKTOP / TABLET GRANDE -->
      <div class="desktop-admin-table">
        <q-table
          hide-bottom
          flat
          :rows="adminsFiltrados"
          :columns="colunasVisiveis"
          row-key="admin_id"
          :loading="loading"
          v-model:pagination="paginacao"
          no-data-label="Nenhum administrador cadastrado."
          class="admins-table"
          table-class="admins-table__body"
          table-header-class="admins-table__header"
          @row-click="handleRowClick"
        >
          <template #loading>
            <q-inner-loading showing color="orange" />
          </template>

          <template #body-cell-id="props">
            <q-td :props="props">
              <span class="id-badge">#{{ props.row.admin_id }}</span>
            </q-td>
          </template>

          <template #body-cell-nome="props">
            <q-td :props="props">
              <div class="admin-name-cell">
                <div class="admin-avatar">
                  {{ iniciais(props.row.nome) }}
                </div>

                <div class="admin-name-cell__copy">
                  <div class="admin-name-line">
                    <strong>{{ props.row.nome }}</strong>

                    <span
                      v-if="ehUsuarioAtual(props.row)"
                      class="you-badge"
                    >
                      Você
                    </span>
                  </div>

                  <span>Administrador</span>
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

          <template #body-cell-atualizado="props">
            <q-td :props="props">
              <div class="updated-cell">
                <q-icon name="schedule" size="15px" />
                <span>
                  {{ formatarDataCurta(props.row.updated_at || props.row.created_at) }}
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
                  icon="edit"
                  class="table-action-btn"
                  @click.stop="abrirEdicao(props.row)"
                >
                  <q-tooltip>Editar administrador</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  class="table-action-btn table-action-btn--danger"
                  @click.stop="confirmarDelecao(props.row)"
                >
                  <q-tooltip>Excluir administrador</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template #no-data>
            <div class="table-empty">
              <div class="table-empty__icon">
                <q-icon name="manage_accounts" size="29px" />
              </div>

              <strong>
                {{
                  busca
                    ? 'Nenhum administrador encontrado'
                    : 'Nenhum administrador cadastrado'
                }}
              </strong>

              <span>
                {{
                  busca
                    ? 'Tente pesquisar utilizando outro termo.'
                    : 'Cadastre um administrador para começar.'
                }}
              </span>
            </div>
          </template>
        </q-table>
      </div>

      <!-- MOBILE -->
      <div class="mobile-admin-list">
        <div v-if="loading" class="mobile-loading">
          <q-spinner color="orange" size="28px" />
          <span>Carregando administradores...</span>
        </div>

        <div
          v-else-if="adminsPaginadosMobile.length === 0"
          class="mobile-empty"
        >
          <div class="table-empty__icon">
            <q-icon name="manage_accounts" size="29px" />
          </div>

          <strong>
            {{
              busca
                ? 'Nenhum administrador encontrado'
                : 'Nenhum administrador cadastrado'
            }}
          </strong>

          <span>
            {{
              busca
                ? 'Tente pesquisar utilizando outro termo.'
                : 'Cadastre um administrador para começar.'
            }}
          </span>
        </div>

        <article
          v-for="admin in adminsPaginadosMobile"
          :key="admin.admin_id"
          class="mobile-admin-card"
          @click="abrirEdicao(admin)"
        >
          <div class="mobile-admin-card__head">
            <div class="admin-avatar admin-avatar--mobile">
              {{ iniciais(admin.nome) }}
            </div>

            <div class="mobile-admin-card__identity">
              <div>
                <strong>{{ admin.nome }}</strong>

                <span
                  v-if="ehUsuarioAtual(admin)"
                  class="you-badge"
                >
                  Você
                </span>
              </div>

              <span>Administrador #{{ admin.admin_id }}</span>
            </div>

            <q-icon
              name="chevron_right"
              size="20px"
              class="mobile-admin-card__chevron"
            />
          </div>

          <div class="mobile-admin-card__contacts">
            <div>
              <q-icon name="mail_outline" size="16px" />
              <span>{{ admin.email || 'E-mail não informado' }}</span>
            </div>

            <div>
              <q-icon name="phone" size="16px" />
              <span>{{ formatarTelefone(admin.telefone) }}</span>
            </div>
          </div>

          <div class="mobile-admin-card__footer">
            <span>
              <q-icon name="schedule" size="14px" />
              {{ formatarDataCurta(admin.updated_at || admin.created_at) }}
            </span>

            <div class="mobile-card-actions">
              <q-btn
                flat
                round
                dense
                icon="edit"
                class="table-action-btn"
                @click.stop="abrirEdicao(admin)"
              />

              <q-btn
                flat
                round
                dense
                icon="delete_outline"
                class="table-action-btn table-action-btn--danger"
                @click.stop="confirmarDelecao(admin)"
              />
            </div>
          </div>
        </article>
      </div>

      <!-- PAGINAÇÃO -->
      <div class="pagination-footer">
        <div class="pagination-footer__left">
          <span>Mostrar</span>

          <q-select
            v-model="paginacao.rowsPerPage"
            :options="[5, 10, 20, 50]"
            dense
            outlined
            class="rows-select"
          />

          <span>por página</span>
        </div>

        <div class="pagination-footer__right">
          <span class="results-count">
            {{ adminsFiltrados.length }}
            {{ adminsFiltrados.length === 1 ? 'registro' : 'registros' }}
          </span>

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
      </div>
    </section>

    <!-- MODAL CRIAÇÃO / EDIÇÃO -->
    <q-dialog
      v-model="modalEdicao"
      persistent
    >
      <q-card class="admin-dialog">
        <q-card-section class="dialog-head">
          <div class="dialog-title-wrap">
            <div class="dialog-icon">
              <q-icon
                :name="adminEditando.admin_id ? 'manage_accounts' : 'person_add'"
                size="23px"
              />
            </div>

            <div>
              <div class="section-kicker">
                {{
                  adminEditando.admin_id
                    ? 'Editar administrador'
                    : 'Novo administrador'
                }}
              </div>

              <h3>
                {{
                  adminEditando.admin_id
                    ? 'Atualizar dados da conta'
                    : 'Cadastrar acesso administrativo'
                }}
              </h3>

              <p>
                {{
                  adminEditando.admin_id
                    ? `Registro #${adminEditando.admin_id}`
                    : 'Preencha os dados para criar uma nova conta.'
                }}
              </p>
            </div>
          </div>

          <q-btn
            icon="close"
            flat
            round
            dense
            :disable="salvando"
            @click="fecharModal"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="dialog-body">
          <q-form
            ref="formAdmin"
            class="admin-form"
            @submit.prevent="salvarAdmin"
          >
            <!-- IDENTIFICAÇÃO -->
            <section class="form-section">
              <div class="form-section__head">
                <div class="form-section__number">01</div>

                <div>
                  <strong>Identificação e contato</strong>
                  <span>Dados utilizados para identificar o administrador no sistema.</span>
                </div>
              </div>

              <div class="form-grid">
                <div class="field-block field-block--full">
                  <span class="field-label">Nome completo *</span>

                  <q-input
                    v-model="adminEditando.nome"
                    outlined
                    dense
                    color="orange"
                    class="premium-field"
                    placeholder="Nome e sobrenome"
                    :rules="[
                      val => !!String(val || '').trim() || 'Informe o nome completo',
                      validarNomeCompleto
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
                    v-model="adminEditando.email"
                    outlined
                    dense
                    type="email"
                    color="orange"
                    class="premium-field"
                    placeholder="admin@artezza.com.br"
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
                  <span class="field-label">Telefone</span>

                  <q-input
                    v-model="adminEditando.telefone"
                    outlined
                    dense
                    color="orange"
                    class="premium-field"
                    mask="(##) #####-####"
                    unmasked-value
                    placeholder="(00) 00000-0000"
                    :rules="[validarTelefone]"
                  >
                    <template #prepend>
                      <q-icon name="phone" size="18px" />
                    </template>
                  </q-input>
                </div>
              </div>
            </section>

            <!-- SEGURANÇA SOMENTE CRIAÇÃO -->
            <section
              v-if="!adminEditando.admin_id"
              class="form-section"
            >
              <div class="form-section__head">
                <div class="form-section__number">02</div>

                <div>
                  <strong>Senha inicial</strong>
                  <span>
                    O novo administrador utilizará esta senha no primeiro acesso.
                  </span>
                </div>
              </div>

              <div class="password-layout">
                <div class="password-fields">
                  <div class="field-block password-field-block">
                    <span class="field-label">Senha de acesso *</span>

                    <q-input
                      v-model="adminEditando.senha"
                      outlined
                      dense
                      color="orange"
                      class="premium-field"
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
                          adminEditando.senha && !senhaValida
                      }"
                    >
                      <template v-if="adminEditando.senha && !senhaValida">
                        <q-icon name="error_outline" size="14px" />
                        <span>
                          A senha ainda não atende a todos os requisitos.
                        </span>
                      </template>
                    </div>
                  </div>

                  <div class="field-block password-field-block">
                    <span class="field-label">Confirmar senha *</span>

                    <q-input
                      v-model="confirmarSenha"
                      outlined
                      dense
                      color="orange"
                      class="premium-field"
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
                    <q-icon name="verified_user" size="20px" />
                    <strong>Requisitos da senha</strong>
                  </div>

                  <ul>
                    <li :class="{ 'rule-ok': regraSenha.tamanho }">
                      <q-icon
                        :name="regraSenha.tamanho ? 'check_circle' : 'radio_button_unchecked'"
                      />
                      Pelo menos 8 caracteres
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

            <!-- INFORMAÇÃO EDIÇÃO -->
            <section
              v-else
              class="edit-security-note"
            >
              <div class="edit-security-note__icon">
                <q-icon name="shield" size="20px" />
              </div>

              <div>
                <strong>Senha não alterada nesta tela</strong>
                <span>
                  A edição deste cadastro atualiza apenas nome, e-mail e telefone,
                  preservando a senha atual do administrador.
                </span>
              </div>
            </section>

            <!-- METADADOS -->
            <div
              v-if="adminEditando.admin_id"
              class="metadata-card"
            >
              <div>
                <span>Criado em</span>
                <strong>{{ formatarData(adminEditando.created_at) }}</strong>
              </div>

              <div>
                <span>Última modificação</span>
                <strong>{{ formatarData(adminEditando.updated_at) }}</strong>
              </div>
            </div>

            <div class="dialog-actions">
              <q-btn
                flat
                no-caps
                label="Cancelar"
                class="cancel-btn"
                :disable="salvando"
                @click="fecharModal"
              />

              <q-btn
                unelevated
                no-caps
                icon="save"
                type="submit"
                :label="
                  adminEditando.admin_id
                    ? 'Salvar alterações'
                    : 'Cadastrar administrador'
                "
                :loading="salvando"
                class="save-btn"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- MODAL EXCLUSÃO -->
    <q-dialog
      v-model="modalExclusao"
      persistent
    >
      <q-card class="delete-dialog">
        <q-card-section class="delete-dialog__head">
          <div class="delete-dialog__icon">
            <q-icon name="delete_outline" size="24px" />
          </div>

          <div>
            <div class="section-kicker section-kicker--danger">
              Ação irreversível
            </div>

            <h3>Excluir administrador?</h3>
          </div>
        </q-card-section>

        <q-card-section class="delete-dialog__body">
          <p>
            O acesso administrativo de
            <strong>{{ adminParaExcluir?.nome }}</strong>
            será removido permanentemente.
          </p>

          <div class="delete-admin-preview">
            <div class="admin-avatar admin-avatar--delete">
              {{ iniciais(adminParaExcluir?.nome) }}
            </div>

            <div>
              <strong>{{ adminParaExcluir?.nome }}</strong>
              <span>{{ adminParaExcluir?.email || 'E-mail não informado' }}</span>
            </div>
          </div>

          <div
            v-if="ehUsuarioAtual(adminParaExcluir)"
            class="self-delete-warning"
          >
            <q-icon name="warning_amber" size="19px" />

            <span>
              Este registro corresponde à conta que está utilizando o sistema
              neste momento.
            </span>
          </div>

          <div class="delete-warning">
            <q-icon name="info_outline" size="18px" />

            <span>
              A exclusão depende das regras do backend e pode ser bloqueada caso
              o administrador esteja vinculado a informações que precisem ser preservadas.
            </span>
          </div>
        </q-card-section>

        <q-card-actions class="delete-dialog__actions">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            class="cancel-btn"
            :disable="excluindo"
            @click="modalExclusao = false"
          />

          <q-btn
            unelevated
            no-caps
            icon="delete_outline"
            label="Excluir administrador"
            :loading="excluindo"
            class="delete-btn"
            @click="excluirAdmin"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const formAdmin = ref(null)

const loading = ref(true)
const salvando = ref(false)
const excluindo = ref(false)

const admins = ref([])
const busca = ref('')

const modalEdicao = ref(false)
const modalExclusao = ref(false)

const adminEditando = ref({})
const adminParaExcluir = ref(null)

const ocultarSenha = ref(true)
const ocultarConfirmacao = ref(true)
const confirmarSenha = ref('')

const paginacao = ref({
  sortBy: 'admin_id',
  descending: true,
  page: 1,
  rowsPerPage: 10
})

const colunasVisiveis = [
  {
    name: 'id',
    field: 'admin_id',
    label: 'ID',
    align: 'left',
    sortable: true,
    style: 'width: 74px'
  },
  {
    name: 'nome',
    field: 'nome',
    label: 'Administrador',
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
    name: 'atualizado',
    field: 'updated_at',
    label: 'Última atualização',
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

const adminsFiltrados = computed(() => {
  const termo = String(busca.value || '')
    .trim()
    .toLowerCase()

  if (!termo) {
    return admins.value
  }

  return admins.value.filter(admin => {
    const valores = [
      admin.admin_id,
      admin.nome,
      admin.email,
      admin.telefone
    ]

    return valores.some(valor =>
      String(valor ?? '')
        .toLowerCase()
        .includes(termo)
    )
  })
})

const numeroDePaginas = computed(() => {
  const total = adminsFiltrados.value.length
  const limite = Number(paginacao.value.rowsPerPage)

  return limite === 0
    ? 1
    : Math.ceil(total / limite) || 1
})

const adminsPaginadosMobile = computed(() => {
  const limite = Number(paginacao.value.rowsPerPage)

  if (limite === 0) {
    return adminsFiltrados.value
  }

  const inicio =
    (Number(paginacao.value.page) - 1) * limite

  return adminsFiltrados.value.slice(
    inicio,
    inicio + limite
  )
})

const adminsComTelefone = computed(() =>
  admins.value.filter(admin =>
    String(admin.telefone || '')
      .replace(/\D/g, '')
      .length >= 10
  ).length
)

const regraSenha = computed(() => {
  const senha =
    String(adminEditando.value.senha || '')

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
    String(adminEditando.value.senha || '')

  if (!senha) return false

  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(
    senha
  )
})

const senhasConferem = computed(() => {
  if (!adminEditando.value.senha) {
    return false
  }

  return confirmarSenha.value ===
    adminEditando.value.senha
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

const validarNomeCompleto = nome => {
  const partes =
    String(nome || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)

  return (
    partes.length >= 2 ||
    'Informe nome e sobrenome'
  )
}

const validarEmail = email => {
  const valor = String(email || '').trim()

  if (!valor) return true

  const regex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return (
    regex.test(valor) ||
    'Formato de e-mail inválido'
  )
}

const validarTelefone = telefone => {
  if (!telefone) return true

  const limpo =
    String(telefone).replace(/\D/g, '')

  return (
    (limpo.length >= 10 &&
      limpo.length <= 11) ||
    'Telefone deve ter DDD + 8 ou 9 dígitos'
  )
}

async function carregarAdmins() {
  loading.value = true

  try {
    const response = await api.get(
      '/admins',
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    admins.value =
      response.data.data ||
      response.data ||
      []
  } catch (error) {
    console.error(
      'Erro ao carregar administradores:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        'Erro ao carregar a lista de administradores.',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

function handleRowClick(evt, row) {
  abrirEdicao(row)
}

function abrirEdicao(admin) {
  adminEditando.value =
    JSON.parse(JSON.stringify(admin))

  confirmarSenha.value = ''
  ocultarSenha.value = true
  ocultarConfirmacao.value = true

  modalEdicao.value = true
}

function abrirNovo() {
  adminEditando.value = {
    nome: '',
    email: '',
    telefone: '',
    senha: ''
  }

  confirmarSenha.value = ''
  ocultarSenha.value = true
  ocultarConfirmacao.value = true

  modalEdicao.value = true
}

function fecharModal() {
  if (salvando.value) return

  modalEdicao.value = false
  confirmarSenha.value = ''
}

function confirmarDelecao(admin) {
  adminParaExcluir.value =
    JSON.parse(JSON.stringify(admin))

  modalExclusao.value = true
}

async function excluirAdmin() {
  if (!adminParaExcluir.value?.admin_id) {
    return
  }

  excluindo.value = true

  try {
    await api.delete(
      `/admins/${adminParaExcluir.value.admin_id}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    $q.notify({
      type: 'positive',
      message:
        'Administrador removido com sucesso.',
      icon: 'check_circle',
      position: 'top-right'
    })

    modalExclusao.value = false
    adminParaExcluir.value = null

    await carregarAdmins()
  } catch (error) {
    console.error(
      'Erro ao excluir administrador:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Erro ao excluir o administrador.',
      position: 'top-right'
    })
  } finally {
    excluindo.value = false
  }
}

async function salvarAdmin() {
  const formularioValido =
    await formAdmin.value.validate()

  if (!formularioValido) {
    $q.notify({
      type: 'warning',
      message:
        'Existem campos inválidos. Verifique os dados informados.',
      position: 'top-right'
    })

    return
  }

  if (!adminEditando.value.admin_id) {
    if (!adminEditando.value.senha) {
      $q.notify({
        type: 'warning',
        message:
          'Informe uma senha para o novo administrador.',
        position: 'top-right'
      })

      return
    }

    if (!senhaValida.value) {
      $q.notify({
        type: 'warning',
        message:
          'A senha ainda não atende a todos os requisitos de segurança.',
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
        String(adminEditando.value.nome || '').trim(),

      email:
        String(adminEditando.value.email || '').trim(),

      telefone:
        adminEditando.value.telefone
          ? String(adminEditando.value.telefone)
              .replace(/\D/g, '')
          : ''
    }

    if (adminEditando.value.admin_id) {
      await api.patch(
        `/admins/${adminEditando.value.admin_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      $q.notify({
        type: 'positive',
        message:
          'Administrador atualizado com sucesso.',
        icon: 'check_circle',
        position: 'top-right'
      })
    } else {
      payload.senha =
        adminEditando.value.senha

      await api.post(
        '/admins',
        payload,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      $q.notify({
        type: 'positive',
        message:
          'Novo administrador adicionado com sucesso.',
        icon: 'check_circle',
        position: 'top-right'
      })
    }

    modalEdicao.value = false
    confirmarSenha.value = ''

    await carregarAdmins()
  } catch (error) {
    console.error(
      'Erro ao salvar administrador:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Falha ao salvar dados.',
      position: 'top-right'
    })
  } finally {
    salvando.value = false
  }
}

function iniciais(nome) {
  const partes =
    String(nome || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)

  if (!partes.length) return 'A'

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

function ehUsuarioAtual(admin) {
  if (!admin) return false

  return (
    String(admin.admin_id) ===
    String(authStore.userId)
  )
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
  if (!dataISO) return 'Sem registro'

  const data = new Date(dataISO)

  if (Number.isNaN(data.getTime())) {
    return 'Sem registro'
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

function formatarTelefone(valor) {
  if (!valor) return 'Não informado'

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

onMounted(carregarAdmins)
</script>

<style scoped>
.admins-page {
  padding: 28px 28px 52px;
  color: var(--text-base);
}

.panel {
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-soft);
}

/* HERO */
.admins-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.admins-hero__copy {
  min-width: 0;
}

.admins-eyebrow,
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

.admins-eyebrow__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 0 4px var(--brand-soft);
}

.admins-title {
  margin: 10px 0 8px;
  color: var(--text-strong);
  font-size: clamp(28px, 3vw, 39px);
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -.04em;
}

.admins-title span {
  color: var(--brand);
}

.admins-subtitle {
  max-width: 770px;
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.admins-hero__summary {
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

.hero-summary-item {
  min-width: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-summary-item--wide {
  min-width: 130px;
}

.hero-summary-item span {
  color: var(--text-muted);
  font-size: 8px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: .07em;
}

.hero-summary-item strong {
  margin-top: 5px;
  color: var(--text-strong);
  font-size: 15px;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.hero-summary-divider {
  width: 1px;
  margin: 0 14px;
  background: var(--border-soft);
}

/* WARNING */
.access-warning {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: center;
  gap: 13px;
  margin-bottom: 18px;
  padding: 15px 17px;
  border-radius: 14px;
}

.access-warning__icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 11px;
}

.access-warning__copy {
  min-width: 0;
}

.access-warning__copy strong,
.access-warning__copy span {
  display: block;
}

.access-warning__copy strong {
  color: var(--text-strong);
  font-size: 10.5px;
}

.access-warning__copy span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9px;
  line-height: 1.5;
}

.primary-btn {
  min-height: 40px;
  padding: 0 15px;
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

.primary-btn--compact {
  min-height: 38px;
  padding: 0 12px;
}

/* PANEL */
.admins-panel {
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
.rows-select :deep(.q-field__control) {
  color: var(--text-strong);
  background: var(--surf-2);
  border-radius: 9px;
}

.search-field :deep(.q-field__native),
.search-field :deep(.q-field__input),
.search-field :deep(.q-field__prepend),
.rows-select :deep(.q-field__native),
.rows-select :deep(.q-field__input) {
  color: var(--text-strong);
}

.search-field :deep(.q-field__control:before),
.rows-select :deep(.q-field__control:before) {
  border-color: var(--border-soft);
}

/* TABLE */
.admins-table {
  background: transparent;
}

:deep(.admins-table__header) {
  background: var(--surf-2);
}

:deep(.admins-table__header th) {
  padding: 12px 16px !important;
  color: var(--text-muted) !important;
  border-bottom: 1px solid var(--border-soft) !important;
  font-size: 8.5px;
  font-weight: 800 !important;
  letter-spacing: .07em;
  text-transform: uppercase;
}

:deep(.admins-table__body tbody td) {
  padding: 12px 16px !important;
  color: var(--text-base);
  border-bottom: 1px solid var(--border-soft) !important;
}

:deep(.admins-table__body tbody tr) {
  cursor: pointer;
  transition: background .16s ease;
}

:deep(.admins-table__body tbody tr:hover) {
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

.admin-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.admin-avatar {
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

.admin-name-cell__copy {
  min-width: 0;
}

.admin-name-line {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.admin-name-line strong {
  min-width: 0;
  color: var(--text-strong);
  font-size: 10.5px;
  overflow-wrap: anywhere;
}

.admin-name-cell__copy > span {
  display: block;
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8.3px;
}

.you-badge {
  flex: 0 0 auto;
  padding: 3px 6px;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 999px;
  font-size: 7px;
  font-weight: 850;
  text-transform: uppercase;
}

.contact-cell {
  display: grid;
  gap: 5px;
}

.contact-cell div {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: var(--text-muted);
  font-size: 9px;
}

.contact-cell .q-icon {
  flex: 0 0 auto;
  color: var(--text-muted);
}

.contact-cell span {
  overflow-wrap: anywhere;
}

.updated-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 9px;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 3px;
}

.table-action-btn {
  color: var(--text-muted);
  transition:
    color .16s ease,
    background .16s ease;
}

.table-action-btn:hover {
  color: var(--brand);
  background: var(--brand-soft);
}

.table-action-btn--danger:hover {
  color: #d95050;
  background: rgba(217, 80, 80, .09);
}

.table-empty,
.mobile-empty,
.mobile-loading {
  width: 100%;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  color: var(--text-muted);
  text-align: center;
}

.table-empty__icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 14px;
}

.table-empty strong,
.mobile-empty strong {
  color: var(--text-strong);
  font-size: 11px;
}

.table-empty span,
.mobile-empty span,
.mobile-loading span {
  font-size: 9px;
}

/* MOBILE LIST */
.mobile-admin-list {
  display: none;
  padding: 12px;
  background: var(--surf-2);
}

.mobile-admin-card {
  margin-bottom: 10px;
  padding: 14px;
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 13px;
  box-shadow: var(--shadow-soft);
  cursor: pointer;
}

.mobile-admin-card:last-child {
  margin-bottom: 0;
}

.mobile-admin-card__head {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 10px;
}

.admin-avatar--mobile {
  width: 42px;
  height: 42px;
  flex-basis: 42px;
  border-radius: 12px;
}

.mobile-admin-card__identity {
  min-width: 0;
}

.mobile-admin-card__identity > div {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.mobile-admin-card__identity strong {
  min-width: 0;
  color: var(--text-strong);
  font-size: 11px;
  overflow-wrap: anywhere;
}

.mobile-admin-card__identity > span {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8.5px;
}

.mobile-admin-card__chevron {
  color: var(--text-muted);
}

.mobile-admin-card__contacts {
  display: grid;
  gap: 7px;
  margin-top: 12px;
  padding: 11px 0;
  border-top: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
}

.mobile-admin-card__contacts div {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  color: var(--text-muted);
  font-size: 9px;
}

.mobile-admin-card__contacts span {
  overflow-wrap: anywhere;
}

.mobile-admin-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 34px;
  padding-top: 8px;
}

.mobile-admin-card__footer > span {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-muted);
  font-size: 8px;
}

.mobile-card-actions {
  display: flex;
  gap: 2px;
}

/* PAGINATION */
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

.pagination-footer__left,
.pagination-footer__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-footer__left {
  color: var(--text-muted);
  font-size: 8.5px;
  font-weight: 650;
}

.pagination-footer__right {
  min-width: 0;
}

.results-count {
  color: var(--text-muted);
  font-size: 8.5px;
}

.rows-select {
  width: 68px;
}

/* DIALOG */
.admin-dialog {
  width: min(690px, calc(100vw - 28px));
  max-height: min(92vh, 850px);
  color: var(--text-base);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-strong);
}

.dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 20px 22px;
}

.dialog-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.dialog-title-wrap > div:last-child {
  min-width: 0;
}

.dialog-icon {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .15);
  border-radius: 12px;
}

.dialog-title-wrap h3 {
  margin: 5px 0 2px;
  color: var(--text-strong);
  font-size: 18px;
  line-height: 1.25;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.dialog-title-wrap p {
  margin: 0;
  color: var(--text-muted);
  font-size: 9px;
}

.dialog-body {
  max-height: calc(92vh - 105px);
  padding: 20px 22px 22px;
  overflow-y: auto;
}

.admin-form {
  display: grid;
  gap: 18px;
}

.form-section {
  padding: 16px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 13px;
}

.form-section__head {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-bottom: 14px;
}

.form-section__number {
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

.form-section__head strong,
.form-section__head span {
  display: block;
}

.form-section__head strong {
  color: var(--text-strong);
  font-size: 10.5px;
}

.form-section__head span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8.5px;
  line-height: 1.4;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

.premium-field :deep(.q-field__messages) {
  line-height: 1.3;
  white-space: normal;
}

/* PASSWORD */
.password-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(230px, 260px);
  gap: 18px;
  align-items: start;
  min-width: 0;
}

.password-fields {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.password-field-block {
  width: 100%;
  min-width: 0;
}

.password-field-block .premium-field :deep(.q-field__bottom) {
  display: none;
}

.validation-slot {
  width: 100%;
  min-width: 0;
  height: 34px;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  box-sizing: border-box;
  padding: 5px 9px 0;
  color: transparent;
  font-size: 8.7px;
  line-height: 1.35;
  overflow: hidden;
}

.validation-slot--error {
  color: #d95050;
}

.validation-slot .q-icon {
  flex: 0 0 auto;
  margin-top: 1px;
}

.validation-slot span {
  min-width: 0;
  overflow-wrap: anywhere;
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

.password-rules li .q-icon {
  font-size: 14px;
}

.password-rules li.rule-ok {
  color: #21ba45;
}

.edit-security-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 14px;
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .12);
  border-radius: 11px;
}

.edit-security-note__icon {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--surf-1);
  border-radius: 10px;
}

.edit-security-note strong,
.edit-security-note span {
  display: block;
}

.edit-security-note strong {
  color: var(--text-strong);
  font-size: 9.5px;
}

.edit-security-note span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8.5px;
  line-height: 1.45;
}

.metadata-card {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 12px 13px;
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
  letter-spacing: .05em;
}

.metadata-card strong {
  margin-top: 3px;
  color: var(--text-base);
  font-size: 8.7px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-btn {
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
  box-shadow:
    0 7px 18px rgba(255, 123, 0, .17);
}

/* DELETE */
.delete-dialog {
  width: min(450px, calc(100vw - 28px));
  color: var(--text-base);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-strong);
}

.delete-dialog__head {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 20px 20px 14px;
}

.delete-dialog__icon {
  width: 43px;
  height: 43px;
  flex: 0 0 43px;
  display: grid;
  place-items: center;
  color: #d95050;
  background: rgba(217, 80, 80, .09);
  border: 1px solid rgba(217, 80, 80, .13);
  border-radius: 12px;
}

.section-kicker--danger {
  color: #d95050;
}

.delete-dialog h3 {
  margin: 5px 0 0;
  color: var(--text-strong);
  font-size: 17px;
  font-weight: 800;
}

.delete-dialog__body {
  padding: 0 20px 18px;
}

.delete-dialog__body > p {
  margin: 0 0 13px;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.5;
}

.delete-dialog__body > p strong {
  color: var(--text-strong);
}

.delete-admin-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
}

.admin-avatar--delete {
  width: 40px;
  height: 40px;
  flex-basis: 40px;
}

.delete-admin-preview strong,
.delete-admin-preview span {
  display: block;
}

.delete-admin-preview strong {
  color: var(--text-strong);
  font-size: 10px;
}

.delete-admin-preview span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8.5px;
  overflow-wrap: anywhere;
}

.self-delete-warning,
.delete-warning {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 10px;
  padding: 10px 11px;
  border-radius: 10px;
  font-size: 8.7px;
  line-height: 1.45;
}

.self-delete-warning {
  color: #a86700;
  background: rgba(242, 160, 7, .08);
  border: 1px solid rgba(242, 160, 7, .15);
}

.delete-warning {
  color: var(--text-muted);
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
}

.self-delete-warning .q-icon,
.delete-warning .q-icon {
  flex: 0 0 auto;
}

.delete-dialog__actions {
  justify-content: flex-end;
  gap: 7px;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--border-soft);
}

.delete-btn {
  color: #fff !important;
  background: #d95050 !important;
  border-radius: 9px;
}

/* RESPONSIVE */
@media (max-width: 1180px) {
  .admins-page {
    padding: 24px 20px 44px;
  }

  .admins-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .admins-hero__summary {
    width: 100%;
    min-width: 0;
  }

  .hero-summary-item {
    flex: 1 1 0;
    min-width: 0;
  }

  .hero-summary-item--wide {
    flex: 1.3 1 0;
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
  .admins-page {
    padding: 20px 14px 36px;
  }

  .access-warning {
    grid-template-columns: 42px 1fr;
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

  .desktop-admin-table {
    display: none;
  }

  .mobile-admin-list {
    display: block;
  }

  .pagination-footer {
    flex-wrap: wrap;
  }

  .pagination-footer__right {
    margin-left: auto;
  }
}

@media (max-width: 680px) {
  .admins-page {
    padding: 16px 10px 30px;
  }

  .admins-title {
    font-size: 27px;
  }

  .admins-subtitle {
    font-size: 11.5px;
    line-height: 1.6;
  }

  .admins-hero__summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 12px;
    border-left-width: 2px;
  }

  .hero-summary-divider {
    display: none;
  }

  .hero-summary-item {
    padding: 8px;
  }

  .hero-summary-item--wide {
    grid-column: 1 / -1;
    padding-top: 10px;
    border-top: 1px solid var(--border-soft);
  }

  .access-warning {
    padding: 13px;
  }

  .list-toolbar {
    padding: 15px 12px;
  }

  .list-toolbar__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .search-field,
  .primary-btn--compact {
    width: 100%;
  }

  .pagination-footer {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
  }

  .pagination-footer__left,
  .pagination-footer__right {
    width: 100%;
  }

  .pagination-footer__right {
    justify-content: space-between;
  }

  .results-count {
    display: none;
  }

  .pagination-footer :deep(.q-pagination) {
    width: 100%;
    justify-content: center;
  }

  .admin-dialog,
  .delete-dialog {
    width: calc(100vw - 16px);
    max-width: none;
    border-radius: 14px;
  }

  .dialog-head,
  .delete-dialog__head {
    padding: 16px 14px;
  }

  .dialog-title-wrap {
    align-items: flex-start;
  }

  .dialog-icon,
  .delete-dialog__icon {
    width: 39px;
    height: 39px;
    flex-basis: 39px;
  }

  .dialog-title-wrap h3 {
    font-size: 16px;
  }

  .dialog-body,
  .delete-dialog__body {
    padding-left: 14px;
    padding-right: 14px;
  }

  .form-section {
    padding: 13px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field-block--full {
    grid-column: auto;
  }

  .metadata-card {
    grid-template-columns: 1fr;
  }

  .dialog-actions,
  .delete-dialog__actions {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
  }

  .dialog-actions .q-btn,
  .delete-dialog__actions .q-btn {
    width: 100%;
  }
}

@media (max-width: 430px) {
  .admins-page {
    padding-inline: 8px;
  }

  .admins-hero__summary {
    grid-template-columns: 1fr;
  }

  .hero-summary-item,
  .hero-summary-item--wide {
    grid-column: 1;
    border-top: 1px solid var(--border-soft);
  }

  .hero-summary-item:first-child {
    border-top: 0;
  }

  .mobile-admin-card {
    padding: 12px;
  }

  .mobile-admin-card__footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .mobile-card-actions {
    align-self: flex-end;
  }

  .dialog-title-wrap p {
    display: none;
  }
}
</style>
