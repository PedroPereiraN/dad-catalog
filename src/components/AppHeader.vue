<script setup lang="ts">
import AutoComplete from 'primevue/autocomplete'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
import { BAG } from '@/utils/paths'
import { useBagStore } from '@/stores/bag.store'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const bag = useBagStore()
</script>

<template>
  <!-- Cabeçalho fixo com fundo translúcido -->
  <header class="sticky top-0 z-20 border-b border-surface-200/80 bg-surface-0/80 backdrop-blur-md">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3 sm:px-6">
      <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2">
        <span
          class="grid size-9 place-items-center rounded-xl bg-primary text-white shadow-sm shadow-primary/30"
        >
          <Icon icon="lucide:shirt" class="size-5" />
        </span>
        <span class="text-xl font-extrabold tracking-tight text-surface-900">
          dad-<span class="text-primary">catalog</span>
        </span>
      </RouterLink>

      <IconField class="order-last w-full sm:order-none sm:w-auto sm:flex-1 sm:max-w-md">
        <InputIcon>
          <Icon icon="lucide:search" class="block" />
        </InputIcon>
        <AutoComplete
          inputId="search"
          placeholder="Procurar peças..."
          class="w-full"
          inputClass="w-full !rounded-full"
          scrollHeight="14rem"
        />
      </IconField>

      <div class="ml-auto flex items-center gap-2">
        <ThemeSwitcher />

        <RouterLink
          :to="{ name: BAG }"
          class="relative inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-bold text-white shadow-sm shadow-primary/30 transition hover:bg-primary-600"
          :aria-label="`Sacola, ${bag.count} ${bag.count === 1 ? 'peça' : 'peças'}`"
        >
          <Icon icon="lucide:shopping-bag" class="size-5" />
          <span class="hidden sm:inline">Sacola</span>
          <!-- Contador de peças -->
          <span
            v-if="bag.count > 0"
            :key="bag.count"
            class="absolute -right-1.5 -top-1.5 grid size-6 animate-[pop_.3s_ease-out] place-items-center rounded-full bg-brand text-xs font-extrabold text-white ring-2 ring-surface-0"
          >
            {{ bag.count }}
          </span>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
@keyframes pop {
  0% {
    transform: scale(0.4);
  }
  70% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
