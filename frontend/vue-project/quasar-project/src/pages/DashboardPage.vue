<template>
  <DashboardCliente v-if="authStore.isCliente" />

  <!-- Os outros virão aqui conforme formos fazendo -->
  <!-- <DashboardLojista       v-else-if="authStore.isLojista" /> -->
  <!-- <DashboardRepresentante v-else-if="authStore.isRepresentante" /> -->
  <!-- <DashboardAdmin         v-else-if="authStore.isAdmin" /> -->
</template>

<script setup>
import { useAuthStore } from 'stores/auth'
import DashboardCliente from 'components/dashboard/DashboardCliente.vue'

const authStore = useAuthStore()
</script>
