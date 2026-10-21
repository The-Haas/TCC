<template>
  <q-page class="page q-pa-md column">

    <!-- Componente de Lojistas -->
    
    <!-- Exibe a tela do representante se for representante -->
    <LojistasRepresentante 
      v-if="tipoUsuario === 'representante'" 
      :pode-editar="podeEditar" 
    />

    <!-- Exibe a tela do admin se for admin -->
    <LojistasAdmin 
      v-else-if="tipoUsuario === 'admin'" 
    />

  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from 'stores/auth'

// Importando os componentes
import LojistasRepresentante from 'components/lojistas/LojistasRepresentante.vue'
import LojistasAdmin from 'components/lojistas/LojistasAdmin.vue'

const authStore = useAuthStore()

// Pega o tipo de usuário para renderizar o componente correto
const tipoUsuario = computed(() => authStore.userTipo || authStore.user?.perfil)

// Lógica de controle: Define se o usuário atual pode editar o lojista
// O Admin gerencia as edições de forma independente no próprio componente,
// mas mantemos a variável para uso no componente do Representante caso necessário.
const podeEditar = computed(() => {
  return tipoUsuario.value === 'representante' || tipoUsuario.value === 'admin'
})
</script>
