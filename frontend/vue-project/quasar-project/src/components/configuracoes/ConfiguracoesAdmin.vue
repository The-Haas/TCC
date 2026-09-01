<template>
  <q-page class="settings-page">
    <section class="settings-hero">
      <div>
        <div class="settings-eyebrow">
          <span class="settings-eyebrow__dot"></span>
          Administração do sistema
        </div>

        <h1 class="settings-title">
          Configurações <span>globais</span>
        </h1>

        <p class="settings-subtitle">
          Gerencie os parâmetros utilizados pelos serviços internos da Artezza.
          As alterações desta página afetam todos os usuários da plataforma.
        </p>
      </div>

      <q-btn
        flat
        no-caps
        icon="arrow_back"
        label="Voltar ao dashboard"
        to="/dashboard"
        class="back-btn"
      />
    </section>

    <div class="settings-layout">
      <aside class="settings-sidebar">
        <article class="integration-card panel">
          <div class="integration-card__visual">
            <div class="integration-icon">
              <q-icon name="mail_outline" size="27px" />
            </div>

            <span
              class="integration-status-dot"
              :class="{
                'integration-status-dot--ok': configuracaoCompleta,
                'integration-status-dot--warning': !configuracaoCompleta
              }"
            ></span>
          </div>

          <div class="section-kicker">Integração SMTP</div>
          <h2>Servidor de e-mail</h2>

          <p>
            Responsável pelo envio de recuperação de senha, atualizações de
            projetos e demais notificações automáticas.
          </p>

          <div class="integration-state">
            <q-icon
              :name="configuracaoCompleta ? 'check_circle' : 'warning_amber'"
              size="18px"
            />

            <div>
              <strong>
                {{ configuracaoCompleta ? 'Configuração completa' : 'Configuração incompleta' }}
              </strong>
              <span>
                {{
                  configuracaoCompleta
                    ? 'Os principais parâmetros SMTP estão preenchidos.'
                    : 'Existem parâmetros obrigatórios que ainda precisam ser informados.'
                }}
              </span>
            </div>
          </div>

          <div class="integration-card__divider"></div>

          <div class="integration-meta">
            <div>
              <span>Host</span>
              <strong>{{ form.smtp_host || 'Não configurado' }}</strong>
            </div>

            <div>
              <span>Porta</span>
              <strong>{{ form.smtp_port || '—' }}</strong>
            </div>

            <div>
              <span>Segurança</span>
              <strong>{{ form.smtp_secure ? 'SSL / TLS ativo' : 'SSL direto desativado' }}</strong>
            </div>
          </div>
        </article>

        <article class="admin-warning panel">
          <div class="admin-warning__icon">
            <q-icon name="admin_panel_settings" size="20px" />
          </div>

          <div>
            <strong>Acesso administrativo</strong>
            <p>
              Essas configurações são globais. Uma alteração incorreta pode
              interromper o envio de e-mails da plataforma.
            </p>
          </div>
        </article>
      </aside>

      <section class="settings-content panel">
        <q-inner-loading
          :showing="loadingData"
          color="orange"
          label="Carregando configurações..."
          label-class="loading-label"
        />

        <q-form ref="formConfiguracoes" class="settings-form" @submit.prevent="salvar">
          <div class="content-head">
            <div class="content-head__icon">
              <q-icon name="mark_email_read" size="23px" />
            </div>

            <div>
              <div class="section-kicker">E-mail transacional</div>
              <h2>Configuração SMTP</h2>
              <p>
                Credenciais utilizadas para autenticar o servidor responsável
                pelos disparos automáticos da plataforma.
              </p>
            </div>

            <div class="content-head__badge">
              <q-icon :name="configuracaoCompleta ? 'verified' : 'error_outline'" size="15px" />
              {{ configuracaoCompleta ? 'Configurado' : 'Requer atenção' }}
            </div>
          </div>

          <section class="settings-section">
            <div class="settings-section__head">
              <div class="settings-section__number">01</div>
              <div>
                <h3>Servidor</h3>
                <p>Defina o host e a porta utilizados na conexão SMTP.</p>
              </div>
            </div>

            <div class="settings-grid">
              <div class="field-block field-block--host">
                <span class="field-label">Servidor host *</span>
                <q-input
                  v-model="form.smtp_host"
                  outlined
                  dense
                  color="orange"
                  class="settings-field"
                  placeholder="smtp.seuprovedor.com.br"
                  :rules="[val => !!String(val || '').trim() || 'Informe o host do servidor']"
                >
                  <template #prepend>
                    <q-icon name="dns" size="18px" />
                  </template>
                </q-input>
              </div>

              <div class="field-block field-block--port">
                <span class="field-label">Porta *</span>
                <q-input
                  v-model.number="form.smtp_port"
                  outlined
                  dense
                  type="number"
                  color="orange"
                  class="settings-field"
                  placeholder="465"
                  :rules="[val => !!val || 'Informe a porta', validarPorta]"
                >
                  <template #prepend>
                    <q-icon name="tag" size="18px" />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="protocol-hint">
              <q-icon name="info_outline" size="17px" />
              <span>
                Porta informada: <strong>{{ form.smtp_port || '—' }}</strong>.
                {{ dicaPorta }}
              </span>
            </div>
          </section>

          <section class="settings-section">
            <div class="settings-section__head">
              <div class="settings-section__number">02</div>
              <div>
                <h3>Autenticação</h3>
                <p>Informe o usuário e a senha fornecidos pelo provedor SMTP.</p>
              </div>
            </div>

            <div class="settings-grid settings-grid--half">
              <div class="field-block">
                <span class="field-label">E-mail / usuário *</span>
                <q-input
                  v-model="form.smtp_user"
                  outlined
                  dense
                  type="email"
                  color="orange"
                  class="settings-field"
                  placeholder="nao-responda@artezza.com.br"
                  :rules="[
                    val => !!String(val || '').trim() || 'Informe o usuário SMTP',
                    validarEmail
                  ]"
                >
                  <template #prepend>
                    <q-icon name="alternate_email" size="18px" />
                  </template>
                </q-input>
              </div>

              <div class="field-block">
                <span class="field-label">Senha de autenticação *</span>
                <q-input
                  v-model="form.smtp_pass"
                  outlined
                  dense
                  :type="isPwd ? 'password' : 'text'"
                  color="orange"
                  class="settings-field"
                  placeholder="••••••••••••"
                  :rules="[val => !!String(val || '') || 'Informe a senha SMTP']"
                >
                  <template #prepend>
                    <q-icon name="lock" size="18px" />
                  </template>
                  <template #append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="credential-note">
              <div class="credential-note__icon">
                <q-icon name="key" size="18px" />
              </div>
              <div>
                <strong>Credencial do provedor</strong>
                <span>
                  Alguns serviços exigem uma senha de aplicativo específica em
                  vez da senha comum da conta de e-mail.
                </span>
              </div>
            </div>
          </section>

          <section class="settings-section">
            <div class="settings-section__head">
              <div class="settings-section__number">03</div>
              <div>
                <h3>Segurança da conexão</h3>
                <p>Defina se a conexão deve utilizar SSL/TLS desde o início.</p>
              </div>
            </div>

            <label class="secure-card">
              <div class="secure-card__left">
                <div
                  class="secure-card__icon"
                  :class="{ 'secure-card__icon--active': form.smtp_secure }"
                >
                  <q-icon :name="form.smtp_secure ? 'lock' : 'lock_open'" size="20px" />
                </div>

                <div>
                  <strong>Usar conexão criptografada</strong>
                  <span>
                    Recomendado para servidores que exigem SSL/TLS direto,
                    normalmente na porta 465.
                  </span>
                </div>
              </div>

              <div class="secure-card__right">
                <span>{{ form.smtp_secure ? 'Ativado' : 'Desativado' }}</span>
                <q-toggle v-model="form.smtp_secure" color="orange" size="md" />
              </div>
            </label>

            <div
              class="security-summary"
              :class="{
                'security-summary--ok': form.smtp_secure,
                'security-summary--neutral': !form.smtp_secure
              }"
            >
              <q-icon :name="form.smtp_secure ? 'verified_user' : 'info_outline'" size="18px" />
              <span>
                {{
                  form.smtp_secure
                    ? 'A conexão será iniciada utilizando SSL/TLS.'
                    : 'A conexão não usará SSL direto. Certifique-se de que essa configuração corresponde ao seu provedor.'
                }}
              </span>
            </div>
          </section>

          <section class="system-impact">
            <div class="system-impact__icon">
              <q-icon name="hub" size="22px" />
            </div>

            <div>
              <strong>Serviços afetados por esta configuração</strong>
              <p>
                Recuperação de senha, notificações de alteração dos projetos e
                demais mensagens automáticas dependem destes parâmetros.
              </p>
            </div>

            <div class="system-impact__items">
              <span><q-icon name="password" size="15px" />Recuperação</span>
              <span><q-icon name="inventory_2" size="15px" />Projetos</span>
              <span><q-icon name="notifications_active" size="15px" />Notificações</span>
            </div>
          </section>

          <div class="form-actions">
            <div class="form-actions__meta">
              <div class="change-state">
                <q-icon :name="temAlteracoes ? 'edit_note' : 'check_circle'" size="18px" />
                <span>
                  {{
                    temAlteracoes
                      ? 'Existem alterações ainda não salvas.'
                      : 'As configurações exibidas estão salvas.'
                  }}
                </span>
              </div>

              <div class="updated-state">
                Última alteração:
                <strong>{{ formatarData(form.updated_at) }}</strong>
              </div>
            </div>

            <div class="form-actions__buttons">
              <q-btn flat no-caps label="Cancelar" to="/dashboard" class="cancel-btn" />
              <q-btn
                unelevated
                no-caps
                icon="save"
                label="Salvar configurações"
                type="submit"
                :loading="loadingSubmit"
                :disable="!temAlteracoes"
                class="save-btn"
              />
            </div>
          </div>
        </q-form>
      </section>
    </div>

    <q-dialog v-model="modalConfirmacao" persistent>
      <q-card class="confirm-dialog">
        <q-card-section class="confirm-dialog__head">
          <div class="confirm-dialog__icon">
            <q-icon name="settings" size="23px" />
          </div>

          <div>
            <div class="section-kicker">Alteração global</div>
            <h3>Salvar configurações SMTP?</h3>
          </div>
        </q-card-section>

        <q-card-section class="confirm-dialog__body">
          <p>
            Os novos parâmetros serão utilizados imediatamente pelos serviços
            de envio de e-mail da plataforma.
          </p>

          <div class="confirm-dialog__warning">
            <q-icon name="warning_amber" size="19px" />
            <span>
              Configurações incorretas podem interromper recuperações de senha
              e notificações automáticas.
            </span>
          </div>
        </q-card-section>

        <q-card-actions class="confirm-dialog__actions">
          <q-btn
            flat
            no-caps
            label="Continuar editando"
            class="cancel-btn"
            @click="modalConfirmacao = false"
          />
          <q-btn
            unelevated
            no-caps
            icon="check"
            label="Confirmar e salvar"
            :loading="loadingSubmit"
            class="save-btn"
            @click="confirmarSalvar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()

const formConfiguracoes = ref(null)
const loadingData = ref(true)
const loadingSubmit = ref(false)
const isPwd = ref(true)
const modalConfirmacao = ref(false)
const snapshotOriginal = ref('')

const form = ref({
  smtp_host: '',
  smtp_port: 465,
  smtp_user: '',
  smtp_pass: '',
  smtp_secure: true,
  updated_at: null
})

const configuracaoCompleta = computed(() =>
  Boolean(
    String(form.value.smtp_host || '').trim() &&
    Number(form.value.smtp_port) &&
    String(form.value.smtp_user || '').trim() &&
    String(form.value.smtp_pass || '')
  )
)

const dicaPorta = computed(() => {
  const porta = Number(form.value.smtp_port)

  if (porta === 465) return 'Essa porta normalmente utiliza SSL/TLS direto.'
  if (porta === 587) return 'Essa porta normalmente utiliza STARTTLS conforme o provedor.'
  if (!porta) return 'Informe a porta recomendada pelo seu provedor.'

  return 'Confirme essa porta na documentação do seu provedor de e-mail.'
})

function serializarConfiguracao() {
  return JSON.stringify({
    smtp_host: String(form.value.smtp_host || ''),
    smtp_port: Number(form.value.smtp_port || 0),
    smtp_user: String(form.value.smtp_user || ''),
    smtp_pass: String(form.value.smtp_pass || ''),
    smtp_secure: Boolean(form.value.smtp_secure)
  })
}

const temAlteracoes = computed(() => {
  if (loadingData.value) return false
  return serializarConfiguracao() !== snapshotOriginal.value
})

function formatarData(dataISO) {
  if (!dataISO) return 'Nunca alterado'

  const data = new Date(dataISO)
  if (Number.isNaN(data.getTime())) return 'Data não disponível'

  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const validarEmail = email => {
  if (!email) return true
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email) || 'Formato de e-mail inválido'
}

const validarPorta = porta => {
  const numero = Number(porta)

  if (!Number.isInteger(numero)) return 'Informe uma porta válida'
  if (numero < 1 || numero > 65535) return 'A porta deve estar entre 1 e 65535'

  return true
}

const carregar = async () => {
  try {
    loadingData.value = true

    const { data } = await api.get('/configuracoes')
    const config = data.data || data

    if (config) {
      form.value.smtp_host = config.smtp_host || ''
      form.value.smtp_port = Number(config.smtp_port || 465)
      form.value.smtp_user = config.smtp_user || ''
      form.value.smtp_pass = config.smtp_pass || ''
      form.value.smtp_secure = config.smtp_secure ?? true
      form.value.updated_at = config.updated_at || null
    }

    snapshotOriginal.value = serializarConfiguracao()
  } catch (error) {
    console.error('Erro ao carregar configurações:', error)

    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar configurações do sistema.',
      position: 'top-right'
    })
  } finally {
    loadingData.value = false
  }
}

const salvar = async () => {
  const valido = await formConfiguracoes.value.validate()

  if (!valido) {
    $q.notify({
      type: 'warning',
      message: 'Existem campos inválidos ou não preenchidos.',
      position: 'top-right'
    })
    return
  }

  if (!configuracaoCompleta.value) {
    $q.notify({
      type: 'warning',
      message: 'Preencha todos os campos obrigatórios do servidor SMTP.',
      position: 'top-right'
    })
    return
  }

  modalConfirmacao.value = true
}

const confirmarSalvar = async () => {
  try {
    loadingSubmit.value = true

    const payload = {
      smtp_host: form.value.smtp_host.trim(),
      smtp_port: Number(form.value.smtp_port),
      smtp_user: form.value.smtp_user.trim(),
      smtp_pass: form.value.smtp_pass,
      smtp_secure: Boolean(form.value.smtp_secure)
    }

    await api.patch('/configuracoes', payload)

    modalConfirmacao.value = false

    $q.notify({
      type: 'positive',
      message: 'Configurações salvas com sucesso!',
      position: 'top-right',
      icon: 'check_circle'
    })

    await carregar()
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)

    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Erro ao salvar as configurações.',
      position: 'top-right'
    })
  } finally {
    loadingSubmit.value = false
  }
}

onMounted(carregar)
</script>

<style scoped>
.settings-page {
  padding: 28px 28px 52px;
  color: var(--text-base);
}

.panel {
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-soft);
}

.settings-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.settings-eyebrow,
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

.settings-eyebrow__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 0 4px var(--brand-soft);
}

.settings-title {
  margin: 10px 0 8px;
  color: var(--text-strong);
  font-size: clamp(27px, 3vw, 38px);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -.035em;
}

.settings-title span { color: var(--brand); }

.settings-subtitle {
  max-width: 760px;
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.back-btn {
  flex: 0 0 auto;
  color: var(--text-muted);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  background: var(--surf-1);
}

.back-btn:hover {
  color: var(--brand);
  background: var(--brand-soft);
}

.settings-layout {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.settings-sidebar {
  position: sticky;
  top: 18px;
  display: grid;
  gap: 14px;
}

.integration-card,
.admin-warning,
.settings-content { border-radius: 18px; }

.integration-card { padding: 22px 20px 20px; }

.integration-card__visual {
  position: relative;
  width: fit-content;
  margin-bottom: 17px;
}

.integration-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .18);
  border-radius: 17px;
}

.integration-status-dot {
  position: absolute;
  right: -3px;
  bottom: 2px;
  width: 14px;
  height: 14px;
  border: 3px solid var(--surf-1);
  border-radius: 50%;
}

.integration-status-dot--ok { background: #21ba45; }
.integration-status-dot--warning { background: #f2a007; }

.integration-card h2 {
  margin: 8px 0 7px;
  color: var(--text-strong);
  font-size: 18px;
  font-weight: 800;
}

.integration-card > p {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.6;
}

.integration-state {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 17px;
  padding: 11px 12px;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .13);
  border-radius: 11px;
}

.integration-state strong,
.integration-state span { display: block; }

.integration-state strong {
  color: var(--text-strong);
  font-size: 10px;
}

.integration-state span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9px;
  line-height: 1.45;
}

.integration-card__divider {
  height: 1px;
  margin: 17px 0;
  background: var(--border-soft);
}

.integration-meta {
  display: grid;
  gap: 11px;
}

.integration-meta div { min-width: 0; }
.integration-meta span,
.integration-meta strong { display: block; }

.integration-meta span {
  color: var(--text-muted);
  font-size: 8.5px;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.integration-meta strong {
  margin-top: 3px;
  color: var(--text-strong);
  font-size: 10.5px;
  overflow-wrap: anywhere;
}

.admin-warning {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 14px;
}

.admin-warning__icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 10px;
}

.admin-warning strong {
  display: block;
  color: var(--text-strong);
  font-size: 10.5px;
}

.admin-warning p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 9px;
  line-height: 1.5;
}

.settings-content {
  min-width: 0;
  overflow: hidden;
}

.settings-form {
  width: 100%;
  min-width: 0;
}

.content-head {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 13px;
  padding: 24px 26px;
  border-bottom: 1px solid var(--border-soft);
}

.content-head__icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .16);
  border-radius: 12px;
}

.content-head h2 {
  margin: 5px 0 4px;
  color: var(--text-strong);
  font-size: 20px;
  font-weight: 800;
}

.content-head p {
  margin: 0;
  color: var(--text-muted);
  font-size: 10.5px;
  line-height: 1.5;
}

.content-head__badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .15);
  border-radius: 999px;
  font-size: 8.5px;
  font-weight: 800;
  text-transform: uppercase;
}

.settings-section {
  padding: 24px 26px;
  border-bottom: 1px solid var(--border-soft);
}

.settings-section__head {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin-bottom: 18px;
}

.settings-section__number {
  width: 31px;
  height: 31px;
  flex: 0 0 31px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 9px;
  font-size: 9px;
  font-weight: 800;
}

.settings-section__head h3 {
  margin: 0;
  color: var(--text-strong);
  font-size: 14px;
  font-weight: 800;
}

.settings-section__head p {
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 9.5px;
  line-height: 1.45;
}

.settings-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  gap: 16px;
}

.settings-grid--half {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field-block { min-width: 0; }

.field-label {
  display: block;
  margin: 0 0 6px 2px;
  color: var(--text-base);
  font-size: 10.5px;
  font-weight: 700;
}

.settings-field {
  width: 100%;
  min-width: 0;
}

.settings-field :deep(.q-field__control) {
  min-height: 43px;
  color: var(--text-strong);
  background: var(--surf-2);
  border-radius: 10px;
}

.settings-field :deep(.q-field__native),
.settings-field :deep(.q-field__input),
.settings-field :deep(.q-field__prepend),
.settings-field :deep(.q-field__append) {
  color: var(--text-strong);
}

.settings-field :deep(.q-field__prepend) { color: var(--text-muted); }
.settings-field :deep(.q-field__control:before) { border-color: var(--border-soft); }
.settings-field :deep(.q-field__control:hover:before) { border-color: rgba(255, 123, 0, .35); }

.settings-field.q-field--focused :deep(.q-field__control) {
  background: var(--surf-1);
  box-shadow: 0 0 0 3px rgba(255, 123, 0, .08);
}

.settings-field :deep(.q-field__bottom) {
  min-height: 31px;
  padding: 5px 10px 0;
}

.settings-field :deep(.q-field__messages) {
  min-height: 20px;
  white-space: normal;
  line-height: 1.3;
}

.protocol-hint,
.credential-note,
.security-summary {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 6px;
  padding: 10px 11px;
  color: var(--text-muted);
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  font-size: 9px;
  line-height: 1.45;
}

.protocol-hint .q-icon,
.credential-note__icon {
  color: var(--brand);
  flex: 0 0 auto;
}

.protocol-hint strong { color: var(--text-strong); }
.credential-note { margin-top: 3px; }
.credential-note strong,
.credential-note span { display: block; }
.credential-note strong { color: var(--text-strong); font-size: 9.5px; }
.credential-note span { margin-top: 2px; }

.secure-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 15px;
  background: var(--surf-2);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  cursor: pointer;
}

.secure-card__left {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.secure-card__icon {
  width: 39px;
  height: 39px;
  flex: 0 0 39px;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  background: var(--surf-1);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
}

.secure-card__icon--active {
  color: #21ba45;
  background: rgba(33, 186, 69, .1);
  border-color: rgba(33, 186, 69, .14);
}

.secure-card strong,
.secure-card span { display: block; }
.secure-card strong { color: var(--text-strong); font-size: 10.5px; }
.secure-card__left span { margin-top: 3px; color: var(--text-muted); font-size: 9px; line-height: 1.45; }

.secure-card__right {
  display: flex;
  align-items: center;
  gap: 7px;
  flex: 0 0 auto;
}

.secure-card__right > span {
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 700;
}

.security-summary--ok {
  color: #168c36;
  background: rgba(33, 186, 69, .08);
  border-color: rgba(33, 186, 69, .13);
}

.security-summary--neutral { color: var(--text-muted); }

.system-impact {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  margin: 20px 26px;
  padding: 15px;
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .13);
  border-radius: 12px;
}

.system-impact__icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--surf-1);
  border-radius: 10px;
}

.system-impact strong { display: block; color: var(--text-strong); font-size: 10.5px; }
.system-impact p { margin: 3px 0 0; color: var(--text-muted); font-size: 9px; line-height: 1.45; }

.system-impact__items {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.system-impact__items span {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  color: var(--brand);
  background: var(--surf-1);
  border: 1px solid rgba(255, 123, 0, .13);
  border-radius: 999px;
  font-size: 8.5px;
  font-weight: 700;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 76px;
  padding: 14px 20px;
  background: var(--surf-2);
  border-top: 1px solid var(--border-soft);
}

.form-actions__meta { display: grid; gap: 4px; }

.change-state {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 600;
}

.change-state .q-icon { color: var(--brand); }
.updated-state { color: var(--text-muted); font-size: 8.5px; }
.updated-state strong { color: var(--text-base); }

.form-actions__buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-btn { color: var(--text-muted); border-radius: 9px; }

.save-btn {
  color: #fff !important;
  background: linear-gradient(135deg, var(--brand), #ff9a3d) !important;
  border-radius: 9px;
  box-shadow: 0 7px 18px rgba(255, 123, 0, .18);
}

.save-btn.q-btn--disable { opacity: .45 !important; }

.confirm-dialog {
  width: min(450px, calc(100vw - 28px));
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
  gap: 12px;
  padding: 20px 20px 14px;
}

.confirm-dialog__icon {
  width: 43px;
  height: 43px;
  flex: 0 0 43px;
  display: grid;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(255, 123, 0, .16);
  border-radius: 12px;
}

.confirm-dialog h3 {
  margin: 5px 0 0;
  color: var(--text-strong);
  font-size: 17px;
  font-weight: 800;
}

.confirm-dialog__body { padding: 0 20px 18px; }
.confirm-dialog__body > p { margin: 0 0 13px; color: var(--text-muted); font-size: 10.5px; line-height: 1.55; }

.confirm-dialog__warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 11px 12px;
  color: #a86700;
  background: rgba(242, 160, 7, .08);
  border: 1px solid rgba(242, 160, 7, .18);
  border-radius: 10px;
  font-size: 9.5px;
  line-height: 1.45;
}

.confirm-dialog__warning .q-icon { flex: 0 0 auto; }

.confirm-dialog__actions {
  justify-content: flex-end;
  gap: 6px;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--border-soft);
}

.loading-label { color: var(--brand); font-weight: 700; }

@media (max-width: 1120px) {
  .settings-layout { grid-template-columns: 250px minmax(0, 1fr); }
  .system-impact { grid-template-columns: 40px 1fr; }
  .system-impact__items { grid-column: 2; justify-content: flex-start; }
}

@media (max-width: 900px) {
  .settings-page { padding: 22px 16px 40px; }
  .settings-layout { grid-template-columns: 1fr; }
  .settings-sidebar { position: static; }
  .settings-grid,
  .settings-grid--half { grid-template-columns: 1fr; }
  .content-head { grid-template-columns: 44px 1fr; }
  .content-head__badge { grid-column: 2; width: fit-content; }
}

@media (max-width: 680px) {
  .settings-hero { align-items: flex-start; flex-direction: column; }
  .settings-title { font-size: 27px; }
  .back-btn { width: 100%; }
  .settings-section,
  .content-head { padding-left: 16px; padding-right: 16px; }
  .secure-card { align-items: flex-start; flex-direction: column; }
  .secure-card__right { width: 100%; justify-content: space-between; }
  .system-impact { margin-left: 16px; margin-right: 16px; grid-template-columns: 1fr; }
  .system-impact__icon,
  .system-impact__items { grid-column: auto; }
  .system-impact__items { justify-content: flex-start; }
  .form-actions { align-items: stretch; flex-direction: column; }
  .form-actions__buttons { display: grid; grid-template-columns: 1fr; }
  .form-actions__buttons .q-btn { width: 100%; }
}

@media (max-width: 420px) {
  .settings-page { padding: 16px 10px 32px; }
  .integration-card { padding: 18px; }
}
</style>
