<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
import { CATEGORY } from '@/utils/paths'

export type Props = {
  id: string
  image: string
  name: string
}

const { id, image, name } = defineProps<Props>()
</script>

<template>
  <RouterLink
    :to="{ name: CATEGORY, params: { id } }"
    class="group relative block aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl bg-surface-100 shadow-sm transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
  >
    <img
      :src="image"
      :alt="name"
      class="absolute inset-0 size-full object-cover transition duration-500 ease-out group-hover:scale-110"
    />
    <!-- Degradê para o texto ficar legível -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"></div>
    <div class="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-white">
      <span class="text-left text-lg font-bold leading-tight">{{ name }}</span>
      <span
        class="grid size-8 shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-primary"
      >
        <Icon icon="lucide:arrow-up-right" class="size-4" />
      </span>
    </div>
  </RouterLink>
</template>
