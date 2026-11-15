<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{ message: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    class="flex flex-col items-center gap-3 rounded-2xl bg-red-50 px-6 py-10 text-center text-red-700 ring-1 ring-red-200"
  >
    <Icon icon="lucide:wifi-off" class="size-8" />
    <p class="font-semibold">{{ message }}</p>
    <button
      class="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-surface-0 px-4 py-2 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
      @click="$emit('retry')"
    >
      <Icon icon="lucide:rotate-cw" class="size-4" />
      Tentar de novo
    </button>
  </div>
</template>
