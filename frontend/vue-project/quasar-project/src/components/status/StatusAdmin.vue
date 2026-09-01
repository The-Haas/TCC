<template>
  <q-page class="status-page">
    <!-- HERO -->
    <section class="status-hero">
      <div class="status-hero__copy">
        <div class="status-eyebrow">
          <span class="status-eyebrow__dot"></span>
          Fluxo de produção
        </div>

        <h1 class="status-title">
          Status dos <span>projetos</span>
        </h1>

        <p class="status-subtitle">
          Organize as etapas utilizadas no acompanhamento dos projetos,
          defina a sequência do fluxo e escolha o status inicial do sistema.
        </p>
      </div>

      <div class="status-hero__summary">
        <div class="hero-summary-item">
          <span>Status cadastrados</span>
          <strong>{{ listaStatus.length }}</strong>
        </div>

        <div class="hero-summary-divider"></div>

        <div class="hero-summary-item">
          <span>Etapas do fluxo</span>
          <strong>{{ etapasFluxo.length }}</strong>
        </div>

        <div class="hero-summary-divider"></div>

        <div class="hero-summary-item hero-summary-item--wide">
          <span>Status padrão</span>
          <strong>{{ statusPadrao?.descricao || 'Não definido' }}</strong>
        </div>
      </div>
    </section>

    <!-- VISÃO DO PIPELINE -->
    <section class="panel pipeline-panel">
      <div class="section-heading-row">
        <div>
          <div class="section-kicker">Pipeline</div>
          <h2 class="section-title">Fluxo principal dos projetos</h2>
          <p class="section-copy">
            A ordem define a sequência visual utilizada nas timelines e dashboards.
          </p>
        </div>

        <q-btn
          unelevated
          no-caps
          icon="add"
          label="Novo status"
          class="primary-btn"
          @click="abrirNovo"
        />
      </div>

      <div v-if="loading" class="pipeline-loading">
        <q-spinner size="28px" color="orange" />
        <span>Carregando fluxo...</span>
      </div>

      <div v-else-if="etapasFluxo.length === 0" class="empty-state">
        <div class="empty-state__icon">
          <q-icon name="timeline" size="28px" />
        </div>
        <strong>Nenhuma etapa produtiva cadastrada</strong>
        <span>Cadastre um status com ordem maior que zero para iniciar o fluxo.</span>
      </div>

      <div v-else class="pipeline-scroll">
        <div class="pipeline-track">
          <article
            v-for="(status, index) in etapasFluxo"
            :key="status.id"
            class="pipeline-step"
            @click="abrirEdicao(status)"
          >
            <div
              v-if="index < etapasFluxo.length - 1"
              class="pipeline-line"
              :style="{
                background:
                  `linear-gradient(90deg, ${status.cor || '#ff7b00'}, ${etapasFluxo[index + 1]?.cor || '#ff7b00'})`
              }"
            ></div>

            <div
              class="pipeline-step__node"
              :style="{
                color: status.cor || '#ff7b00',
                borderColor: (status.cor || '#ff7b00') + '55',
                background: (status.cor || '#ff7b00') + '14'
              }"
            >
              <span>{{ status.ordem }}</span>
            </div>

            <div class="pipeline-step__copy">
              <strong>{{ status.descricao }}</strong>

              <span
                v-if="status.padrao"
                class="default-mini-badge"
              >
                Padrão
              </span>
            </div>

            <q-tooltip>
              Clique para editar
            </q-tooltip>
          </article>
        </div>
      </div>

      <div v-if="statusForaFluxo.length" class="outside-flow">
        <div class="outside-flow__head">
          <q-icon name="alt_route" size="18px" />
          <div>
            <strong>Status fora do fluxo principal</strong>
            <span>
              Registros com ordem 0 não entram na sequência produtiva.
            </span>
          </div>
        </div>

        <div class="outside-flow__chips">
          <button
            v-for="status in statusForaFluxo"
            :key="status.id"
            type="button"
            class="outside-chip"
            :style="{
              color: status.cor || '#d95050',
              borderColor: (status.cor || '#d95050') + '40',
              background: (status.cor || '#d95050') + '0d'
            }"
            @click="abrirEdicao(status)"
          >
            <span
              class="outside-chip__dot"
              :style="{ background: status.cor || '#d95050' }"
            ></span>

            {{ status.descricao }}

            <q-icon name="edit" size="13px" />
          </button>
        </div>
      </div>
    </section>

    <!-- LISTAGEM -->
    <section class="panel list-panel">
      <div class="list-toolbar">
        <div>
          <div class="section-kicker">Administração</div>
          <h2 class="section-title">Todos os status</h2>
        </div>

        <div class="list-toolbar__actions">
          <q-input
            v-model="busca"
            debounce="300"
            outlined
            dense
            clearable
            class="search-field"
            placeholder="Pesquisar status..."
          >
            <template #prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>

          <q-btn
            unelevated
            no-caps
            icon="add"
            label="Novo status"
            class="primary-btn primary-btn--compact"
            @click="abrirNovo"
          />
        </div>
      </div>

      <div class="table-scroll-shell">
        <q-table
          hide-bottom
          flat
        :rows="listaStatus"
        :columns="colunasVisiveis"
        row-key="id"
        :loading="loading"
        :filter="busca"
        v-model:pagination="paginacao"
        no-data-label="Nenhum status cadastrado no sistema."
        no-results-label="Nenhum registro corresponde à sua busca."
        class="status-table"
        table-class="status-table__body"
        table-header-class="status-table__header"
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

        <template #body-cell-descricao="props">
          <q-td :props="props">
            <div class="status-name-cell">
              <div
                class="status-color-icon"
                :style="{
                  color: props.row.cor,
                  background: (props.row.cor || '#888888') + '14'
                }"
              >
                <q-icon :name="getStatusIcon(props.row.descricao)" size="18px" />
              </div>

              <div>
                <strong>{{ props.row.descricao }}</strong>

                <span>
                  {{
                    Number(props.row.ordem) === 0
                      ? 'Fora do fluxo principal'
                      : `Etapa ${props.row.ordem} do fluxo`
                  }}
                </span>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-cor="props">
          <q-td :props="props">
            <div class="color-cell">
              <span
                class="color-swatch"
                :style="{ backgroundColor: props.row.cor }"
              ></span>

              <span>{{ props.row.cor }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-ordem="props">
          <q-td :props="props">
            <span
              class="order-badge"
              :class="{ 'order-badge--outside': Number(props.row.ordem) === 0 }"
            >
              {{
                Number(props.row.ordem) === 0
                  ? 'Fora do fluxo'
                  : `Etapa ${props.row.ordem}`
              }}
            </span>
          </q-td>
        </template>

        <template #body-cell-padrao="props">
          <q-td :props="props">
            <span
              v-if="props.row.padrao"
              class="default-badge"
            >
              <q-icon name="flag" size="14px" />
              Status inicial
            </span>

            <span v-else class="muted-text">
              Não
            </span>
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
                <q-tooltip>Editar</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                dense
                icon="delete_outline"
                class="table-action-btn table-action-btn--danger"
                @click.stop="confirmarExclusao(props.row)"
              >
                <q-tooltip>Excluir</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="table-empty">
            <q-icon name="inventory_2" size="30px" />
            <strong>
              {{ busca ? 'Nenhum status encontrado' : 'Nenhum status cadastrado' }}
            </strong>
            <span>
              {{
                busca
                  ? 'Tente pesquisar por outro termo.'
                  : 'Cadastre o primeiro status para iniciar o fluxo.'
              }}
            </span>
          </div>
        </template>
        </q-table>
      </div>

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

    <!-- MODAL CRIAÇÃO / EDIÇÃO -->
    <q-dialog
      v-model="modalEdicao"
      persistent
    >
      <q-card class="status-dialog">
        <q-card-section class="dialog-head">
          <div class="dialog-title-wrap">
            <div class="dialog-icon">
              <q-icon
                :name="statusEditando.id ? 'edit' : 'add'"
                size="22px"
              />
            </div>

            <div>
              <div class="section-kicker">
                {{ statusEditando.id ? 'Editar registro' : 'Novo registro' }}
              </div>

              <h3>
                {{ statusEditando.id ? 'Atualizar status' : 'Cadastrar status' }}
              </h3>

              <p>
                {{
                  statusEditando.id
                    ? `Registro #${statusEditando.id}`
                    : 'Defina como este status será exibido no fluxo.'
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
            @click="modalEdicao = false"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="dialog-body">
          <q-form
            ref="formStatus"
            class="status-form"
            @submit.prevent="salvarStatus"
          >
            <section class="form-section">
              <div class="form-section__head">
                <span class="form-section__number">01</span>

                <div>
                  <strong>Identificação visual</strong>
                  <span>Nome e cor utilizados em toda a plataforma.</span>
                </div>
              </div>

              <div class="form-grid">
                <div class="field-block field-block--full">
                  <span class="field-label">Descrição *</span>

                  <q-input
                    v-model="statusEditando.descricao"
                    outlined
                    dense
                    color="orange"
                    class="premium-field"
                    placeholder="Ex: Em Produção"
                    :rules="[
                      val => !!String(val || '').trim() || 'Informe a descrição do status'
                    ]"
                  >
                    <template #prepend>
                      <q-icon name="label_outline" size="18px" />
                    </template>
                  </q-input>
                </div>

                <div class="field-block field-block--color">
                  <span class="field-label">Cor *</span>

                  <q-input
                    v-model="statusEditando.cor"
                    outlined
                    dense
                    color="orange"
                    class="premium-field"
                    placeholder="#FF7B00"
                    :rules="[
                      val => !!String(val || '').trim() || 'Selecione uma cor',
                      validarCorHex
                    ]"
                  >
                    <template #prepend>
                      <span
                        class="input-color-preview"
                        :style="{
                          background: statusEditando.cor || '#cccccc'
                        }"
                      ></span>
                    </template>

                    <template #append>
                      <q-icon
                        name="palette"
                        size="18px"
                        class="cursor-pointer"
                      />

                      <q-popup-proxy
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-color
                          v-model="statusEditando.cor"
                          format-model="hex"
                          no-header
                          no-footer
                        />
                      </q-popup-proxy>
                    </template>
                  </q-input>
                </div>

                <div class="field-block field-block--order">
                  <span class="field-label">Ordem *</span>

                  <q-input
                    v-model.number="statusEditando.ordem"
                    outlined
                    dense
                    type="number"
                    min="0"
                    color="orange"
                    class="premium-field"
                    placeholder="0"
                    :rules="[
                      val => val !== null && val !== '' || 'Informe a ordem',
                      validarOrdem
                    ]"
                  >
                    <template #prepend>
                      <q-icon name="format_list_numbered" size="18px" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div
                class="order-explanation"
                :class="{
                  'order-explanation--outside':
                    Number(statusEditando.ordem) === 0
                }"
              >
                <q-icon
                  :name="
                    Number(statusEditando.ordem) === 0
                      ? 'alt_route'
                      : 'timeline'
                  "
                  size="18px"
                />

                <span>
                  {{
                    Number(statusEditando.ordem) === 0
                      ? 'Ordem 0: este status ficará fora da sequência principal. Use para estados como recusado ou cancelado.'
                      : `Este status ocupará a etapa ${statusEditando.ordem || '—'} do fluxo principal.`
                  }}
                </span>
              </div>

              <div
                v-if="ordemDuplicadaAtual"
                class="duplicate-warning"
              >
                <q-icon name="warning_amber" size="18px" />

                <span>
                  Já existe outro status utilizando a ordem
                  <strong>{{ statusEditando.ordem }}</strong>.
                </span>
              </div>
            </section>

            <section class="form-section">
              <div class="form-section__head">
                <span class="form-section__number">02</span>

                <div>
                  <strong>Comportamento</strong>
                  <span>Defina se este será o ponto inicial de novos projetos.</span>
                </div>
              </div>

              <label class="default-option">
                <div class="default-option__left">
                  <div
                    class="default-option__icon"
                    :class="{
                      'default-option__icon--active': statusEditando.padrao
                    }"
                  >
                    <q-icon name="flag" size="20px" />
                  </div>

                  <div>
                    <strong>Status padrão do sistema</strong>
                    <span>
                      Novos projetos podem utilizar este status como etapa inicial.
                    </span>
                  </div>
                </div>

                <div class="default-option__right">
                  <span>
                    {{ statusEditando.padrao ? 'Ativado' : 'Desativado' }}
                  </span>

                  <q-toggle
                    v-model="statusEditando.padrao"
                    color="orange"
                  />
                </div>
              </label>

              <div
                v-if="statusEditando.padrao && statusPadrao && statusPadrao.id !== statusEditando.id"
                class="default-warning"
              >
                <q-icon name="info_outline" size="18px" />

                <span>
                  Atualmente <strong>{{ statusPadrao.descricao }}</strong> está marcado
                  como padrão. O backend deve garantir que apenas um permaneça ativo.
                </span>
              </div>
            </section>

            <div
              v-if="statusEditando.id"
              class="metadata-card"
            >
              <div>
                <span>Criado em</span>
                <strong>{{ formatarData(statusEditando.created_at) }}</strong>
              </div>

              <div>
                <span>Última modificação</span>
                <strong>{{ formatarData(statusEditando.updated_at) }}</strong>
              </div>
            </div>

            <div class="dialog-actions">
              <q-btn
                flat
                no-caps
                label="Cancelar"
                class="cancel-btn"
                :disable="salvando"
                @click="modalEdicao = false"
              />

              <q-btn
                unelevated
                no-caps
                type="submit"
                icon="save"
                :label="
                  statusEditando.id
                    ? 'Salvar alterações'
                    : 'Cadastrar status'
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

            <h3>Excluir status?</h3>
          </div>
        </q-card-section>

        <q-card-section class="delete-dialog__body">
          <p>
            Você está prestes a excluir
            <strong>{{ statusParaExcluir?.descricao }}</strong>.
          </p>

          <div class="delete-status-preview">
            <span
              class="delete-status-preview__dot"
              :style="{
                background: statusParaExcluir?.cor || '#d95050'
              }"
            ></span>

            <div>
              <strong>{{ statusParaExcluir?.descricao }}</strong>
              <span>
                {{
                  Number(statusParaExcluir?.ordem) === 0
                    ? 'Fora do fluxo principal'
                    : `Etapa ${statusParaExcluir?.ordem} do fluxo`
                }}
              </span>
            </div>
          </div>

          <div class="delete-warning">
            <q-icon name="warning_amber" size="19px" />

            <span>
              Se este status estiver vinculado a algum projeto, o backend pode
              impedir a exclusão para preservar a integridade dos dados.
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
            label="Excluir status"
            :loading="excluindo"
            class="delete-btn"
            @click="excluirStatus"
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

const loading = ref(true)
const salvando = ref(false)
const excluindo = ref(false)

const listaStatus = ref([])
const busca = ref('')

const modalEdicao = ref(false)
const modalExclusao = ref(false)

const formStatus = ref(null)
const statusEditando = ref({})
const statusParaExcluir = ref(null)

const paginacao = ref({
  sortBy: 'ordem',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

const etapasFluxo = computed(() =>
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

const statusPadrao = computed(() =>
  listaStatus.value.find(status => Boolean(status.padrao)) || null
)

const proximaOrdemDisponivel = computed(() => {
  const ordens = new Set(
    listaStatus.value
      .map(status => Number(status.ordem))
      .filter(ordem => ordem > 0)
  )

  let ordem = 1

  while (ordens.has(ordem)) {
    ordem++
  }

  return ordem
})

const ordemDuplicadaAtual = computed(() => {
  const ordemAtual = Number(statusEditando.value.ordem)

  if (!ordemAtual || ordemAtual === 0) {
    return false
  }

  return listaStatus.value.some(status => {
    const mesmoId =
      statusEditando.value.id &&
      Number(status.id) === Number(statusEditando.value.id)

    return (
      !mesmoId &&
      Number(status.ordem) === ordemAtual
    )
  })
})

const numeroDePaginas = computed(() => {
  let total = listaStatus.value.length

  if (busca.value) {
    const termo = String(busca.value).toLowerCase()

    total = listaStatus.value.filter(row =>
      Object.values(row).some(val =>
        val !== null &&
        val !== undefined &&
        String(val).toLowerCase().includes(termo)
      )
    ).length
  }

  const limite = Number(paginacao.value.rowsPerPage)

  return limite === 0
    ? 1
    : Math.ceil(total / limite) || 1
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

const colunasVisiveis = [
  {
    name: 'id',
    field: 'id',
    label: 'ID',
    align: 'left',
    sortable: true,
    style: 'width: 76px'
  },
  {
    name: 'descricao',
    field: 'descricao',
    label: 'Status',
    align: 'left',
    sortable: true
  },
  {
    name: 'cor',
    field: 'cor',
    label: 'Cor',
    align: 'left',
    sortable: true
  },
  {
    name: 'ordem',
    field: 'ordem',
    label: 'Posição',
    align: 'left',
    sortable: true
  },
  {
    name: 'padrao',
    field: 'padrao',
    label: 'Padrão',
    align: 'left',
    sortable: true
  },
  {
    name: 'acoes',
    field: 'acoes',
    label: '',
    align: 'right',
    style: 'width: 92px'
  }
]

async function carregarStatus() {
  loading.value = true

  try {
    const response = await api.get(
      '/status',
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    listaStatus.value =
      response.data.data ||
      response.data ||
      []
  } catch (error) {
    console.error(
      'Erro ao carregar status:',
      error
    )

    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar a lista de status.',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

function handleRowClick(evt, row) {
  abrirEdicao(row)
}

function abrirEdicao(statusItem) {
  statusEditando.value =
    JSON.parse(JSON.stringify(statusItem))

  modalEdicao.value = true
}

function abrirNovo() {
  statusEditando.value = {
    descricao: '',
    cor: '#FF7B00',
    padrao: false,
    ordem: proximaOrdemDisponivel.value
  }

  modalEdicao.value = true
}

const validarCorHex = cor => {
  if (!cor) return true

  return (
    /^#[0-9A-F]{6}$/i.test(cor) ||
    'Use uma cor hexadecimal válida, como #FF7B00'
  )
}

const validarOrdem = ordem => {
  const numero = Number(ordem)

  if (!Number.isInteger(numero) || numero < 0) {
    return 'A ordem deve ser um número inteiro maior ou igual a zero'
  }

  if (numero !== 0 && ordemDuplicadaAtual.value) {
    return 'Essa ordem já está sendo utilizada'
  }

  return true
}

async function salvarStatus() {
  const formularioValido =
    await formStatus.value.validate()

  if (!formularioValido) {
    $q.notify({
      type: 'warning',
      message:
        'Revise os campos do formulário antes de continuar.',
      position: 'top-right'
    })

    return
  }

  const ordemAtual =
    Number(statusEditando.value.ordem)

  if (
    ordemAtual !== 0 &&
    ordemDuplicadaAtual.value
  ) {
    $q.notify({
      type: 'warning',
      message:
        'Já existe um status com esse número de ordem. Utilize 0 ou um número livre.',
      position: 'top-right'
    })

    return
  }

  salvando.value = true

  try {
    const payload = {
      descricao:
        String(statusEditando.value.descricao || '').trim(),

      cor:
        String(statusEditando.value.cor || '#FF7B00').toUpperCase(),

      padrao:
        Boolean(statusEditando.value.padrao),

      ordem:
        ordemAtual
    }

    if (statusEditando.value.id) {
      await api.patch(
        `/status/${statusEditando.value.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      $q.notify({
        type: 'positive',
        message: 'Status atualizado com sucesso.',
        icon: 'check_circle',
        position: 'top-right'
      })
    } else {
      await api.post(
        '/status',
        payload,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      $q.notify({
        type: 'positive',
        message: 'Novo status adicionado com sucesso.',
        icon: 'check_circle',
        position: 'top-right'
      })
    }

    modalEdicao.value = false

    await carregarStatus()
  } catch (error) {
    console.error(
      'Erro ao salvar status:',
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

function confirmarExclusao(statusItem) {
  statusParaExcluir.value =
    JSON.parse(JSON.stringify(statusItem))

  modalExclusao.value = true
}

async function excluirStatus() {
  if (!statusParaExcluir.value?.id) {
    return
  }

  excluindo.value = true

  try {
    await api.delete(
      `/status/${statusParaExcluir.value.id}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    $q.notify({
      type: 'positive',
      message: 'Status excluído com sucesso.',
      icon: 'check_circle',
      position: 'top-right'
    })

    modalExclusao.value = false
    statusParaExcluir.value = null

    await carregarStatus()
  } catch (error) {
    console.error(
      'Erro ao excluir status:',
      error
    )

    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Erro ao excluir o status. Verifique se ele não está em uso.',
      position: 'top-right'
    })
  } finally {
    excluindo.value = false
  }
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

function getStatusIcon(status) {
  const texto =
    String(status || '').toLowerCase()

  if (texto.includes('pendente')) {
    return 'hourglass_empty'
  }

  if (texto.includes('aprovado')) {
    return 'thumb_up'
  }

  if (
    texto.includes('recusado') ||
    texto.includes('cancelado')
  ) {
    return 'cancel'
  }

  if (
    texto.includes('produção') ||
    texto.includes('producao')
  ) {
    return 'engineering'
  }

  if (texto.includes('qualidade')) {
    return 'inventory'
  }

  if (texto.includes('entrega')) {
    return 'local_shipping'
  }

  if (
    texto.includes('entregue') ||
    texto.includes('concluído') ||
    texto.includes('concluido') ||
    texto.includes('finalizado')
  ) {
    return 'check_circle'
  }

  return 'label'
}

onMounted(carregarStatus)
</script>

<style scoped>
.status-page {
  padding: 28px 28px 52px;
  color: var(--text-base);
}

.panel {
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-soft);
}

.status-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.status-hero__copy {
  min-width: 0;
}

.status-eyebrow,
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

.status-eyebrow__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 0 4px var(--brand-soft);
}

.status-title {
  margin: 10px 0 8px;
  color: var(--text-strong);
  font-size: clamp(28px, 3vw, 39px);
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -.04em;
}

.status-title span {
  color: var(--brand);
}

.status-subtitle {
  max-width: 760px;
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.status-hero__summary {
  display: flex;
  align-items: stretch;
  flex: 0 0 auto;
  min-width: 440px;
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
  min-width: 140px;
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

.pipeline-panel,
.list-panel {
  border-radius: 18px;
}

.pipeline-panel {
  padding: 24px;
  margin-bottom: 18px;
}

.section-heading-row,
.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.section-title {
  margin: 7px 0 0;
  color: var(--text-strong);
  font-size: 17px;
  line-height: 1.25;
  font-weight: 800;
}

.section-copy {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.5;
}

.primary-btn {
  flex: 0 0 auto;
  min-height: 40px;
  padding: 0 16px;
  color: #fff !important;
  background: linear-gradient(135deg, var(--brand), #ff9634) !important;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(255, 123, 0, .18);
  font-weight: 750;
}

.primary-btn--compact {
  min-height: 38px;
  padding: 0 13px;
}

.pipeline-loading,
.empty-state {
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 9px;
  text-align: center;
}

.pipeline-loading {
  color: var(--text-muted);
  font-size: 10px;
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
  font-size: 12px;
}

.empty-state span {
  color: var(--text-muted);
  font-size: 10px;
}

.pipeline-scroll {
  margin-top: 26px;
  overflow-x: auto;
  padding: 5px 6px 9px;
}

.pipeline-track {
  display: flex;
  align-items: flex-start;
  min-width: max-content;
  padding: 0 12px;
}

.pipeline-step {
  position: relative;
  width: 145px;
  flex: 0 0 145px;
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
  cursor: pointer;
}

.pipeline-line {
  position: absolute;
  top: 20px;
  left: calc(50% + 24px);
  width: calc(100% - 48px);
  height: 3px;
  opacity: .55;
  border-radius: 999px;
}

.pipeline-step__node {
  position: relative;
  z-index: 2;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid;
  border-radius: 13px;
  font-size: 12px;
  font-weight: 850;
}

.pipeline-step__copy {
  min-height: 52px;
  margin-top: 10px;
}

.pipeline-step__copy strong {
  display: block;
  max-width: 130px;
  color: var(--text-strong);
  font-size: 10px;
  line-height: 1.35;
}

.default-mini-badge {
  display: inline-block;
  margin-top: 5px;
  padding: 3px 6px;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 999px;
  font-size: 7.5px;
  font-weight: 800;
  text-transform: uppercase;
}

.outside-flow {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--border-soft);
}

.outside-flow__head {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  color: var(--text-muted);
}

.outside-flow__head .q-icon {
  color: var(--brand);
}

.outside-flow__head strong,
.outside-flow__head span {
  display: block;
}

.outside-flow__head strong {
  color: var(--text-strong);
  font-size: 10px;
}

.outside-flow__head span {
  margin-top: 3px;
  font-size: 8.8px;
  line-height: 1.45;
}

.outside-flow__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.outside-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 31px;
  padding: 0 9px;
  border: 1px solid;
  border-radius: 9px;
  font: inherit;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}

.outside-chip__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.list-panel {
  overflow: hidden;
}

.list-toolbar {
  padding: 20px 22px;
  border-bottom: 1px solid var(--border-soft);
}

.list-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.search-field {
  width: 280px;
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

.status-table {
  background: transparent;
}

:deep(.status-table__header) {
  background: var(--surf-2);
}

:deep(.status-table__header th) {
  padding: 12px 16px !important;
  color: var(--text-muted) !important;
  border-bottom: 1px solid var(--border-soft) !important;
  font-size: 8.5px;
  font-weight: 800 !important;
  letter-spacing: .07em;
  text-transform: uppercase;
}

:deep(.status-table__body tbody td) {
  padding: 12px 16px !important;
  color: var(--text-base);
  border-bottom: 1px solid var(--border-soft) !important;
}

:deep(.status-table__body tbody tr) {
  cursor: pointer;
  transition: background .16s ease;
}

:deep(.status-table__body tbody tr:hover) {
  background: var(--surf-2) !important;
}

.id-badge {
  color: var(--text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  font-weight: 750;
}

.status-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-color-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
}

.status-name-cell strong,
.status-name-cell span {
  display: block;
}

.status-name-cell strong {
  color: var(--text-strong);
  font-size: 10.5px;
}

.status-name-cell span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8.5px;
}

.color-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text-muted);
  font-size: 9px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-transform: uppercase;
}

.color-swatch {
  width: 14px;
  height: 14px;
  border: 2px solid var(--surf-1);
  border-radius: 5px;
  box-shadow: 0 0 0 1px var(--border-soft);
}

.order-badge,
.default-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 8.5px;
  font-weight: 750;
}

.order-badge {
  color: var(--text-base);
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
}

.order-badge--outside {
  color: #d95050;
  background: rgba(217, 80, 80, .08);
  border-color: rgba(217, 80, 80, .15);
}

.default-badge {
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .14);
}

.muted-text {
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
}

.table-action-btn:hover {
  color: var(--brand);
  background: var(--brand-soft);
}

.table-action-btn--danger:hover {
  color: #d95050;
  background: rgba(217, 80, 80, .09);
}

.table-empty {
  width: 100%;
  min-height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  color: var(--text-muted);
}

.table-empty .q-icon {
  color: var(--brand);
}

.table-empty strong {
  color: var(--text-strong);
  font-size: 11px;
}

.table-empty span {
  font-size: 9px;
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

.status-dialog {
  width: min(650px, calc(100vw - 28px));
  max-height: min(90vh, 820px);
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
  font-weight: 800;
}

.dialog-title-wrap p {
  margin: 0;
  color: var(--text-muted);
  font-size: 9px;
}

.dialog-body {
  max-height: calc(90vh - 110px);
  padding: 20px 22px 22px;
  overflow-y: auto;
}

.status-form {
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

.form-section__head div > span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8.5px;
}

.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 160px;
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
  box-shadow: 0 0 0 3px rgba(255, 123, 0, .08);
}

.premium-field :deep(.q-field__bottom) {
  min-height: 28px;
  padding: 5px 9px 0;
}

.premium-field :deep(.q-field__messages) {
  line-height: 1.3;
  white-space: normal;
}

.input-color-preview {
  width: 16px;
  height: 16px;
  border: 2px solid var(--surf-1);
  border-radius: 5px;
  box-shadow: 0 0 0 1px var(--border-soft);
}

.order-explanation,
.duplicate-warning,
.default-warning {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 2px;
  padding: 9px 10px;
  border-radius: 9px;
  font-size: 8.5px;
  line-height: 1.45;
}

.order-explanation {
  color: var(--text-muted);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
}

.order-explanation .q-icon {
  color: var(--brand);
  flex: 0 0 auto;
}

.order-explanation--outside {
  color: #b34a4a;
  background: rgba(217, 80, 80, .06);
  border-color: rgba(217, 80, 80, .12);
}

.order-explanation--outside .q-icon {
  color: #d95050;
}

.duplicate-warning {
  margin-top: 8px;
  color: #a86700;
  background: rgba(242, 160, 7, .08);
  border: 1px solid rgba(242, 160, 7, .15);
}

.duplicate-warning .q-icon {
  flex: 0 0 auto;
}

.default-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px;
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 11px;
  cursor: pointer;
}

.default-option__left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.default-option__icon {
  width: 37px;
  height: 37px;
  flex: 0 0 37px;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  background: var(--surf-2);
  border-radius: 10px;
}

.default-option__icon--active {
  color: var(--brand);
  background: var(--brand-soft);
}

.default-option__left strong,
.default-option__left span {
  display: block;
}

.default-option__left strong {
  color: var(--text-strong);
  font-size: 9.5px;
}

.default-option__left span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8.3px;
  line-height: 1.4;
}

.default-option__right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.default-option__right > span {
  color: var(--text-muted);
  font-size: 8px;
  font-weight: 700;
}

.default-warning {
  margin-top: 8px;
  color: var(--text-muted);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .12);
}

.default-warning .q-icon {
  color: var(--brand);
  flex: 0 0 auto;
}

.metadata-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  padding-top: 2px;
}

.cancel-btn {
  color: var(--text-muted);
  border-radius: 9px;
}

.save-btn {
  color: #fff !important;
  background: linear-gradient(135deg, var(--brand), #ff9634) !important;
  border-radius: 9px;
  box-shadow: 0 7px 18px rgba(255, 123, 0, .17);
}

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

.delete-status-preview {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 12px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
}

.delete-status-preview__dot {
  width: 10px;
  height: 10px;
  flex: 0 0 10px;
  border-radius: 50%;
}

.delete-status-preview strong,
.delete-status-preview span {
  display: block;
}

.delete-status-preview strong {
  color: var(--text-strong);
  font-size: 10px;
}

.delete-status-preview span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8.5px;
}

.delete-warning {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 11px;
  padding: 10px 11px;
  color: #a86700;
  background: rgba(242, 160, 7, .08);
  border: 1px solid rgba(242, 160, 7, .15);
  border-radius: 10px;
  font-size: 8.8px;
  line-height: 1.45;
}

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

@media (max-width: 1180px) {
  .status-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .status-hero__summary {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 900px) {
  .status-page {
    padding: 22px 16px 40px;
  }

  .outside-flow {
    grid-template-columns: 1fr;
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
}

@media (max-width: 680px) {
  .status-page {
    padding-left: 10px;
    padding-right: 10px;
  }

  .status-title {
    font-size: 28px;
  }

  .status-hero__summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .hero-summary-divider {
    display: none;
  }

  .hero-summary-item {
    min-width: 0;
    padding: 7px;
  }

  .hero-summary-item--wide {
    grid-column: 1 / -1;
  }

  .pipeline-panel {
    padding: 18px 14px;
  }

  .section-heading-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-heading-row .primary-btn {
    width: 100%;
  }

  .list-toolbar {
    padding: 16px 14px;
  }

  .list-toolbar__actions {
    flex-direction: column;
  }

  .search-field,
  .primary-btn--compact {
    width: 100%;
  }

  .pagination-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field-block--full {
    grid-column: auto;
  }

  .default-option {
    align-items: flex-start;
    flex-direction: column;
  }

  .default-option__right {
    width: 100%;
    justify-content: space-between;
  }

  .metadata-card {
    grid-template-columns: 1fr;
  }

  .dialog-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .dialog-actions .q-btn {
    width: 100%;
  }
}


/* =========================================================
   RESPONSIVIDADE REFORÇADA
   ========================================================= */

.status-page,
.status-hero,
.pipeline-panel,
.list-panel,
.status-dialog,
.delete-dialog,
.settings-layout,
.section-heading-row,
.list-toolbar,
.list-toolbar__actions,
.form-grid,
.default-option,
.metadata-card,
.pagination-footer,
.status-hero__summary {
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.status-hero__copy,
.section-heading-row > div,
.list-toolbar > div,
.dialog-title-wrap > div,
.default-option__left > div,
.delete-status-preview > div {
  min-width: 0;
}

.status-subtitle,
.section-copy,
.status-name-cell strong,
.status-name-cell span,
.dialog-title-wrap h3,
.dialog-title-wrap p,
.default-option__left span,
.delete-dialog__body,
.hero-summary-item strong {
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* tabela */
.table-scroll-shell {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.table-scroll-shell :deep(.q-table__container) {
  min-width: 860px;
  background: transparent;
}

.table-scroll-shell::-webkit-scrollbar {
  height: 6px;
}

.table-scroll-shell::-webkit-scrollbar-track {
  background: transparent;
}

.table-scroll-shell::-webkit-scrollbar-thumb {
  background: var(--border-soft);
  border-radius: 999px;
}

/* evita q-pagination estourando */
.pagination-footer :deep(.q-pagination) {
  max-width: 100%;
  flex-wrap: wrap;
}

/* pipeline mais flexível */
.pipeline-scroll {
  width: 100%;
  max-width: 100%;
}

.pipeline-track {
  width: max-content;
  min-width: max-content;
}

/* desktop médio / notebook */
@media (max-width: 1180px) {
  .status-page {
    padding: 24px 20px 44px;
  }

  .status-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .status-hero__summary {
    width: 100%;
    min-width: 0;
  }

  .hero-summary-item {
    flex: 1 1 0;
    min-width: 0;
  }

  .hero-summary-item--wide {
    flex: 1.4 1 0;
    min-width: 0;
  }

  .pipeline-panel,
  .list-panel {
    width: 100%;
  }

  .list-toolbar__actions {
    max-width: 480px;
  }
}

/* tablet */
@media (max-width: 900px) {
  .status-page {
    padding: 20px 14px 36px;
  }

  .status-hero {
    gap: 16px;
  }

  .status-hero__summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    padding: 12px;
  }

  .hero-summary-divider {
    display: none;
  }

  .hero-summary-item,
  .hero-summary-item--wide {
    min-width: 0;
    padding: 7px 10px;
  }

  .hero-summary-item:not(:last-child) {
    border-right: 1px solid var(--border-soft);
  }

  .pipeline-panel {
    padding: 20px 16px;
  }

  .section-heading-row {
    align-items: flex-start;
  }

  .pipeline-step {
    width: 128px;
    flex-basis: 128px;
  }

  .pipeline-step__copy strong {
    max-width: 116px;
  }

  .outside-flow {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .list-toolbar {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }

  .list-toolbar__actions {
    width: 100%;
    max-width: none;
  }

  .search-field {
    flex: 1 1 auto;
    width: auto;
    min-width: 0;
  }

  .primary-btn--compact {
    flex: 0 0 auto;
  }

  .pagination-footer {
    align-items: center;
    flex-wrap: wrap;
  }

  .pagination-footer__left {
    flex: 1 1 auto;
  }

  .status-dialog {
    width: min(650px, calc(100vw - 20px));
    max-height: calc(100vh - 20px);
  }

  .dialog-body {
    max-height: calc(100vh - 120px);
  }
}

/* celular */
@media (max-width: 680px) {
  .status-page {
    padding: 16px 10px 30px;
  }

  .status-title {
    font-size: 27px;
  }

  .status-subtitle {
    font-size: 11.5px;
    line-height: 1.6;
  }

  .status-hero__summary {
    grid-template-columns: 1fr 1fr;
    border-left-width: 2px;
  }

  .hero-summary-item {
    padding: 8px;
  }

  .hero-summary-item:nth-child(1),
  .hero-summary-item:nth-child(3) {
    border-right: 0;
  }

  .hero-summary-item--wide {
    grid-column: 1 / -1;
    border-top: 1px solid var(--border-soft);
    margin-top: 2px;
    padding-top: 10px;
  }

  .hero-summary-item span {
    font-size: 7.5px;
  }

  .hero-summary-item strong {
    font-size: 13px;
  }

  .pipeline-panel {
    padding: 16px 12px;
  }

  .section-heading-row {
    align-items: stretch;
    flex-direction: column;
  }

  .section-heading-row .primary-btn {
    width: 100%;
  }

  .pipeline-scroll {
    margin-top: 20px;
    margin-inline: -2px;
    padding-inline: 2px;
  }

  .pipeline-track {
    padding-inline: 8px;
  }

  .pipeline-step {
    width: 112px;
    flex-basis: 112px;
  }

  .pipeline-line {
    left: calc(50% + 21px);
    width: calc(100% - 42px);
  }

  .pipeline-step__node {
    width: 38px;
    height: 38px;
    border-radius: 11px;
  }

  .pipeline-step__copy {
    min-height: 46px;
    margin-top: 8px;
  }

  .pipeline-step__copy strong {
    max-width: 100px;
    font-size: 9px;
  }

  .outside-flow {
    margin-top: 16px;
    padding-top: 14px;
  }

  .outside-flow__chips {
    display: grid;
    grid-template-columns: 1fr;
  }

  .outside-chip {
    width: 100%;
    justify-content: flex-start;
  }

  .list-toolbar {
    padding: 15px 12px;
  }

  .list-toolbar__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field,
  .primary-btn--compact {
    width: 100%;
  }

  .table-scroll-shell {
    position: relative;
  }

  .table-scroll-shell::after {
    content: 'Deslize para ver mais';
    position: sticky;
    left: 12px;
    display: inline-block;
    margin: 8px 0 4px 12px;
    padding: 4px 7px;
    color: var(--text-muted);
    background: var(--surf-2);
    border: 1px solid var(--border-soft);
    border-radius: 999px;
    font-size: 7.5px;
    font-weight: 700;
    pointer-events: none;
  }

  .table-scroll-shell :deep(.q-table__container) {
    min-width: 760px;
  }

  :deep(.status-table__header th) {
    padding: 10px 12px !important;
    font-size: 8px;
  }

  :deep(.status-table__body tbody td) {
    padding: 10px 12px !important;
  }

  .status-name-cell {
    gap: 8px;
  }

  .status-color-icon {
    width: 31px;
    height: 31px;
    flex-basis: 31px;
  }

  .pagination-footer {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
  }

  .pagination-footer__left {
    width: 100%;
    justify-content: flex-start;
  }

  .pagination-footer :deep(.q-pagination) {
    width: 100%;
    justify-content: center;
  }

  .status-dialog,
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

  .field-block--full,
  .field-block--color,
  .field-block--order {
    grid-column: 1;
  }

  .default-option {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
  }

  .default-option__right {
    width: 100%;
    justify-content: space-between;
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

/* celulares estreitos */
@media (max-width: 430px) {
  .status-page {
    padding-inline: 8px;
  }

  .status-hero__summary {
    grid-template-columns: 1fr;
  }

  .hero-summary-item,
  .hero-summary-item--wide {
    grid-column: 1;
    border-right: 0 !important;
    border-top: 1px solid var(--border-soft);
    margin: 0;
  }

  .hero-summary-item:first-child {
    border-top: 0;
  }

  .pipeline-step {
    width: 104px;
    flex-basis: 104px;
  }

  .pipeline-step__copy strong {
    max-width: 92px;
  }

  .pagination-footer__left {
    flex-wrap: wrap;
  }

  .rows-select {
    width: 64px;
  }

  .dialog-title-wrap p {
    display: none;
  }
}

</style>
