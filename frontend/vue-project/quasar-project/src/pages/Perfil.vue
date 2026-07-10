<template>
  <q-page class="q-pa-md flex flex-center" :class="isDark ? 'bg-dark' : 'bg-grey-1'">
    
    <!-- Renderiza o perfil complexo se for cliente -->
    <PerfilCliente v-if="authStore.userTipo === 'cliente'" />
    
    <!-- Renderiza o perfil simples para admin, lojista ou representante -->
    <PerfilPadrao v-else />

  </q-page>
</template>

<script setup>
defineOptions({
  name: 'PerfilUsuario'
})
import { useAuthStore } from 'stores/auth' // Ajuste o caminho
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import PerfilCliente from 'components/perfis/PerfilCliente.vue'
import PerfilPadrao from 'components/perfis/PerfilPadrao.vue'

const $q = useQuasar()
const authStore = useAuthStore()
const isDark = computed(() => $q.dark.isActive)
</script>