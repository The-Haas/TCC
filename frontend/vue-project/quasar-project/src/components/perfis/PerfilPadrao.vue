<template>
  <q-card style="width: 100%; max-width: 600px; border-radius: 12px;" class="shadow-2">
    <q-card-section class="bg-primary text-white q-pb-md" style="border-radius: 12px 12px 0 0;">
      <div class="text-h6 text-weight-bold">Meu Perfil</div>
      <div class="text-caption">Atualize seus dados de acesso</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="salvar" class="q-gutter-md">
        
        <q-input v-model="form.nome" label="Nome *" outlined dense 
          :rules="[val => !!val || 'Campo obrigatório']" />
          
        <q-input v-model="form.email" label="E-mail *" outlined dense type="email" 
          :rules="[val => !!val || 'Campo obrigatório']" />
          
        <q-input v-model="form.telefone" label="Telefone" outlined dense mask="(##) #####-####" unmasked-value />
        
        <q-separator class="q-my-md" />
        
        <div class="text-subtitle2 text-grey-7">Alterar Senha (deixe em branco para manter a atual)</div>
        <q-input v-model="form.senha" label="Nova Senha" outlined dense type="password" />

        <div class="row justify-end q-mt-lg q-gutter-sm">
          <q-btn label="Cancelar" color="grey-6" flat to="/dashboard" />
          <q-btn label="Salvar" color="primary" type="submit" :loading="loading" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(false)
const form = ref({ nome: '', email: '', telefone: '', senha: '' })

const getEndpoint = () => {
  const tipo = authStore.userTipo
  if (tipo === 'admin') return 'admins'
  if (tipo === 'lojista') return 'lojistas'
  return 'representantes'
}

const carregar = async () => {
  try {
    const { data } = await api.get(`/${getEndpoint()}/${authStore.userId}`)
    form.value = { ...data, senha: '' }
} catch (error) {
  console.error(error) // 👇 Agora a variável é usada, e o ESLint para de reclamar
  $q.notify({ type: 'negative', message: 'Erro ao carregar perfil.' })
}
}

const salvar = async () => {
  try {
    loading.value = true
    const payload = { ...form.value }
    if (!payload.senha) delete payload.senha

    await api.put(`/${getEndpoint()}/${authStore.userId}`, payload)
    authStore.userName = form.value.nome // Atualiza no layout principal
    $q.notify({ type: 'positive', message: 'Perfil atualizado!' })
} catch (error) {
  console.error(error) // 👇 Agora a variável é usada, e o ESLint para de reclamar
  $q.notify({ type: 'negative', message: 'Erro ao carregar perfil.' })
} finally {
    loading.value = false
  }
}

onMounted(carregar)
</script>