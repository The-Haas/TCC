<template>
  <q-page class="page q-pa-md column">
    <!-- Cabeçalho da Página -->
    <div class="page-header q-mb-lg row justify-between items-center">
      <div>
        <h1 class="text-h5 text-weight-bold" :class="isDark ? 'text-white' : 'text-grey-9'">
          <q-icon name="people" color="primary" class="q-mr-sm" size="28px" />
          Clientes
        </h1>
        <p class="text-caption" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
          Gerencie o cadastro dos clientes.
        </p>
      </div>
    </div>

    <!-- Componente de Clientes -->
    <!-- Passamos a prop 'podeEditar' dinamicamente baseada no perfil -->
    <ClientesComponent :pode-editar="podeEditar" />

  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth' 
import ClientesComponent from 'components/clientes/ClientesLojista.vue'

const $q = useQuasar()
const authStore = useAuthStore()
const isDark = computed(() => $q.dark.isActive)

// Lógica de controle: Lojista e Admin podem editar. Representante apenas visualiza.
const podeEditar = computed(() => {
  // Pega o perfil atual do usuário logado na sua store
  const perfil = authStore.user?.perfil || authStore.perfil || 'lojista'
  
  return perfil === 'lojista' || perfil === 'admin'
})
</script>

<style scoped>
.page-header {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  padding-bottom: 16px;
}
</style>