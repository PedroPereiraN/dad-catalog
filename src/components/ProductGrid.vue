<script setup lang="ts">
import ProductCard from '@/components/ProductCard.vue'
import QueryError from '@/components/QueryError.vue'
import type { Product } from '@/types'
import { coverImage, productColors, productSizes } from '@/utils/product'

export type Props = {
  products?: Product[]
  loading: boolean
  error: boolean
  errorMessage: string
}

/** Grade de peças com os estados de carregando e erro (usada na home e nas categorias) */
const props = defineProps<Props>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <QueryError v-if="error" :message="errorMessage" @retry="$emit('retry')" />
  <div v-else-if="loading" class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
    <div
      v-for="n in 8"
      :key="n"
      class="overflow-hidden rounded-2xl bg-surface-0 ring-1 ring-surface-200"
    >
      <div class="aspect-[4/5] animate-pulse bg-surface-200"></div>
      <div class="space-y-3 p-4">
        <div class="h-4 w-3/4 animate-pulse rounded bg-surface-200"></div>
        <div class="h-6 w-1/2 animate-pulse rounded bg-surface-200"></div>
      </div>
    </div>
  </div>
  <!-- Nenhuma peça: quem usa decide o que mostrar -->
  <slot v-else-if="!products?.length" name="empty" />
  <div v-else class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :id="product.id"
      :image="coverImage(product)"
      :name="product.name"
      :price="product.price"
      :colors="productColors(product)"
      :sizes="productSizes(product)"
    />
  </div>
</template>
