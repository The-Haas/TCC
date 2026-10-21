<template>
  <q-page class="page q-pa-md column">

    <!-- Componente de Clientes -->
    <!-- Passamos a prop 'podeEditar' dinamicamente baseada no perfil -->
    <ClientesComponent :pode-editar="podeEditar" />

  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from 'stores/auth' 
import ClientesComponent from 'components/clientes/ClientesGeral.vue'

const authStore = useAuthStore()

// Lógica de controle: Lojista e Admin podem editar. Representante apenas visualiza.
const podeEditar = computed(() => {
  // Pega o perfil atual do usuário logado na sua store
  const perfil = authStore.user?.perfil || authStore.perfil || 'lojista'
  
  return perfil === 'lojista' || perfil === 'admin'
})
</script>
