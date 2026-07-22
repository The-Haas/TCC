<template>
  <q-page class="page q-pa-md column">
    <!-- Cabeçalho da Página -->
    <div class="page-header q-mb-lg row justify-between items-center">
      <div>
        <h1 class="text-h5 text-weight-bold" :class="isDark ? 'text-white' : 'text-grey-9'">
          <q-icon name="storefront" color="primary" class="q-mr-sm" size="28px" />
          Lojistas
        </h1>
        <p class="text-caption" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
          {{ tipoUsuario === 'admin' 
            ? 'Gerencie todos os lojistas e vincule representantes no sistema.' 
            : 'Gerencie o cadastro da sua carteira de lojistas.' 
          }}
        </p>
      </div>
    </div>

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
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

// Importando os componentes
import LojistasRepresentante from 'components/lojistas/LojistasRepresentante.vue'
import LojistasAdmin from 'components/lojistas/LojistasAdmin.vue'

const $q = useQuasar()
const authStore = useAuthStore()
const isDark = computed(() => $q.dark.isActive)

// Pega o tipo de usuário para renderizar o componente correto
const tipoUsuario = computed(() => authStore.userTipo || authStore.user?.perfil)

// Lógica de controle: Define se o usuário atual pode editar o lojista
// O Admin gerencia as edições de forma independente no próprio componente,
// mas mantemos a variável para uso no componente do Representante caso necessário.
const podeEditar = computed(() => {
  return tipoUsuario.value === 'representante' || tipoUsuario.value === 'admin'
})
</script>

<style scoped>
.page-header {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  padding-bottom: 16px;
}
</style>