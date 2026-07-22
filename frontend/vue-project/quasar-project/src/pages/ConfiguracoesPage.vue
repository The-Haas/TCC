<template>
  <q-page class="q-pa-md flex flex-center" :class="isDark ? 'bg-dark' : 'bg-grey-1'">
    
    <!-- Renderiza as configurações apenas se for admin -->
    <ConfiguracoesAdmin v-if="authStore.userTipo === 'admin'" />

  </q-page>
</template>

<script setup>
defineOptions({
  name: 'ConfiguracoesPage'
})
import { useAuthStore } from 'stores/auth'
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import ConfiguracoesAdmin from 'components/configuracoes/ConfiguracoesAdmin.vue'

const $q = useQuasar()
const authStore = useAuthStore()
const isDark = computed(() => $q.dark.isActive)
</script>