<script setup lang="ts">
import { Icon } from '@iconify/vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-surface-200 bg-surface-0">
    <div
      class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-surface-500 sm:flex-row sm:px-6"
    >
      <p class="flex items-center gap-2 font-semibold text-surface-700">
        <Icon icon="lucide:shirt" class="size-4 text-primary" />
        dad-catalog
      </p>
      <p>© {{ year }} · Todos os direitos reservados</p>
    </div>
  </footer>
</template>
