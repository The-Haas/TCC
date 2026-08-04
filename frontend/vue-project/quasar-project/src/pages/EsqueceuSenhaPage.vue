<template>
  <!-- Usamos div fullscreen no lugar de q-page para não depender de layouts -->
  <div class="fullscreen flex flex-center bg-grey-10">
    <EsqueceuSenha />
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
// Verifica se o caminho do componente está exato (letras maiúsculas/minúsculas importam)
import EsqueceuSenha from 'components/esqueceu_senha/EsqueceuSenha.vue'

const $q = useQuasar()
// Garante o dark mode nesta tela também
$q.dark.set(true)
</script>