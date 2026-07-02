<template>
  <q-page>
    <PedidosCliente v-if="tipoUsuario === 'cliente'" />
    
    </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from 'stores/auth'

// Importando o componente que movemos
import PedidosCliente from 'components/pedidos/PedidosCliente.vue'

const authStore = useAuthStore()
const tipoUsuario = computed(() => authStore.userTipo)
</script>