<template>
  <DashboardCliente v-if="authStore.isCliente" />
  <DashboardLojista v-else-if="authStore.isLojista" />
  <DashboardRepresentante v-else-if="authStore.isRepresentante" />
  <DashboardAdmin v-else-if="authStore.isAdmin" />
</template>

<script setup>
import { useAuthStore } from 'stores/auth'
import DashboardCliente from 'components/dashboard/DashboardCliente.vue'
import DashboardLojista from 'components/dashboard/DashboardLojista.vue'
import DashboardRepresentante from 'components/dashboard/DashboardRepresentante.vue'
import DashboardAdmin from 'components/dashboard/DashboardAdmin.vue'

const authStore = useAuthStore()
</script>