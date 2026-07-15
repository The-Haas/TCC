<template>
  <q-page>
    <!-- Exibe a tela do cliente se for cliente -->
    <PedidosCliente v-if="tipoUsuario === 'cliente'" />
    
    <!-- Exibe a tela do lojista se for lojista -->
    <PedidosLojista v-else-if="tipoUsuario === 'lojista'" />
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from 'stores/auth'

// Importando os componentes
import PedidosCliente from 'components/pedidos/PedidosCliente.vue'
import PedidosLojista from 'components/pedidos/PedidosLojista.vue'

const authStore = useAuthStore()
const tipoUsuario = computed(() => authStore.userTipo)
</script>