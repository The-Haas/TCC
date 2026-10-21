<template>
  <q-page class="page q-pa-md column">

    <!-- Componente de Status (Acesso Exclusivo Admin) -->
    <StatusAdmin 
      v-if="tipoUsuario === 'admin'" 
    />

    <!-- Fallback de Acesso Restrito -->
    <div v-else class="flex flex-center col-grow">
      <div class="text-center q-pa-lg border-light-sharp radius-8" :class="isDark ? 'bg-dark-card' : 'bg-slate-light'">
        <q-icon name="security" size="48px" :color="isDark ? 'grey-6' : 'grey-5'" />
        <div class="text-h6 q-mt-md text-weight-bold" :class="isDark ? 'text-grey-4' : 'text-grey-7'">
          Acesso Restrito
        </div>
        <div class="text-caption q-mt-sm" :class="isDark ? 'text-grey-5' : 'text-grey-6'">
          Somente usuários administradores podem configurar os status do sistema.
        </div>
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'

// Importando o componente (Ajuste o caminho para a sua pasta real)
import StatusAdmin from 'components/status/StatusAdmin.vue'

const $q = useQuasar()
const authStore = useAuthStore()
const isDark = computed(() => $q.dark.isActive)

// Pega o tipo de usuário para checagem de permissão
const tipoUsuario = computed(() => authStore.userTipo || authStore.user?.perfil)
</script>

<style scoped>
.page-header {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  padding-bottom: 16px;
}

/* Classes utilitárias pro fallback de restrição */
.border-light-sharp { border: 1px solid rgba(0, 0, 0, 0.06); }
.bg-dark-card { background-color: #1d222b !important; }
.bg-slate-light { background-color: #f8fafc; }
.radius-8 { border-radius: 8px; }
</style>