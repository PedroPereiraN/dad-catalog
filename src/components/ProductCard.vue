<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
import { numberMask } from '@/utils/masks'
import { useBagStore } from '@/stores/bag.store'
import { PRODUCT } from '@/utils/paths'

export type Props = {
  id: string
  /** Foto de capa (a de menor posição) */
  image: string
  name: string
  price: number
  colors?: string[]
  sizes?: string[]
}

const MAX_VISIBLE_COLORS = 3
const MAX_VISIBLE_SIZES = 3

const props = withDefaults(defineProps<Props>(), { colors: () => [], sizes: () => [] })

const visibleColors = computed(() => props.colors.slice(0, MAX_VISIBLE_COLORS))
const hiddenColorsCount = computed(() => Math.max(props.colors.length - MAX_VISIBLE_COLORS, 0))
const visibleSizes = computed(() => props.sizes.slice(0, MAX_VISIBLE_SIZES))
const hiddenSizesCount = computed(() => Math.max(props.sizes.length - MAX_VISIBLE_SIZES, 0))

const toast = useToast()
const bagStore = useBagStore()

function addToCart(product: Props) {
  if (bagStore.has(product.id)) return
  // Pelo card não dá pra escolher cor/tamanho: se só existe uma opção, já vai com ela;
  // senão entra sem e o cliente escolhe na sacola
  bagStore.add(product.id, {
    color: props.colors.length === 1 ? props.colors[0]! : null,
    size: props.sizes.length === 1 ? props.sizes[0]! : null,
  })
  toast.add({
    severity: 'success',
    summary: 'Adicionado à sacola',
    detail: product.name,
    life: 2500,
  })
}

function removeFromCart(product: Props) {
  bagStore.removeProduct(product.id)
  toast.add({
    severity: 'secondary',
    summary: 'Removido da sacola',
    detail: product.name,
    life: 2500,
  })
}
</script>

<template>
  <article
    class="group relative flex flex-col overflow-hidden rounded-2xl bg-surface-0 shadow-sm ring-1 ring-surface-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
  >
    <div class="relative aspect-[4/5] overflow-hidden bg-surface-100">
      <img
        :src="props.image"
        :alt="props.name"
        class="size-full object-cover transition duration-500 ease-out group-hover:scale-105"
      />
    </div>

    <div class="flex flex-1 flex-col gap-3 p-4">
      <h3 class="line-clamp-2 font-semibold text-surface-800">
        <!-- O ::after estica o link pelo card todo: clicar em qualquer lugar abre a peça -->
        <RouterLink
          :to="{ name: PRODUCT, params: { id: props.id } }"
          class="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-primary"
        >
          {{ props.name }}
        </RouterLink>
      </h3>
      <!-- Só informativo: mostra até 3 cores e indica quantas faltam -->
      <div
        v-if="props.colors.length"
        class="flex items-center gap-1.5"
        :aria-label="`Disponível em ${props.colors.length} ${props.colors.length === 1 ? 'cor' : 'cores'}`"
      >
        <span
          v-for="color in visibleColors"
          :key="color"
          class="size-4 rounded-full ring-1 ring-surface-300 ring-offset-1 ring-offset-surface-0"
          :style="{ backgroundColor: color }"
          aria-hidden="true"
        />
        <span
          v-if="hiddenColorsCount"
          class="text-xs font-medium text-surface-500"
          aria-hidden="true"
        >
          +{{ hiddenColorsCount }} {{ hiddenColorsCount === 1 ? 'cor' : 'cores' }}
        </span>
      </div>
      <!-- Só informativo: mostra até 3 tamanhos e indica quantos faltam -->
      <div
        v-if="props.sizes.length"
        class="flex flex-wrap items-center gap-1"
        :aria-label="`Tamanhos: ${props.sizes.join(', ')}`"
      >
        <span
          v-for="option in visibleSizes"
          :key="option"
          class="grid h-5 min-w-6 place-items-center rounded px-1 text-[0.6875rem] font-bold text-surface-600 ring-1 ring-surface-300"
          aria-hidden="true"
        >
          {{ option }}
        </span>
        <span
          v-if="hiddenSizesCount"
          class="text-xs font-medium text-surface-500"
          aria-hidden="true"
        >
          +{{ hiddenSizesCount }}
        </span>
      </div>
      <!-- Celular: preço em cima e botão largo embaixo; telas maiores: lado a lado -->
      <div
        class="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
      >
        <p class="whitespace-nowrap text-lg font-extrabold text-surface-900">
          {{ numberMask(props.price, 2) }}
        </p>
        <Button
          v-if="!bagStore.has(props.id)"
          rounded
          class="relative z-10 !h-10 w-full shrink-0 !py-0 transition sm:!w-10 sm:!px-0 sm:group-hover:scale-110"
          :aria-label="`Adicionar ${props.name} à sacola`"
          @click="addToCart(props)"
        >
          <Icon icon="lucide:shopping-bag" class="size-4 shrink-0" />
        </Button>
        <!-- Já na sacola: ao passar o mouse vira "Remover" -->
        <button
          v-else
          class="group/remove relative z-10 inline-flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full sm:w-auto bg-primary-50 px-3 text-sm font-bold text-primary-700 ring-1 ring-primary-200 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-200"
          :aria-label="`${props.name} está na sacola. Remover`"
          @click="removeFromCart(props)"
        >
          <Icon icon="lucide:check" class="size-4 group-hover/remove:hidden" />
          <Icon icon="lucide:x" class="hidden size-4 group-hover/remove:block" />
          <span class="group-hover/remove:hidden">Na sacola</span>
          <span class="hidden group-hover/remove:inline">Remover</span>
        </button>
      </div>
    </div>
  </article>
</template>
