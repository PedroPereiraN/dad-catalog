<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { getCategories, getProductsByCategory, queryKeys } from '@/services/queries'
import ProductGrid from '@/components/ProductGrid.vue'
import QueryError from '@/components/QueryError.vue'
import { CATEGORY, HOME } from '@/utils/paths'

export type Props = { id: string }
/** Vem do :id da URL (rota com props: true) */
const props = defineProps<Props>()

/** Mesma lista da home: vindo de lá já está em cache. Serve pro título e pras outras categorias */
const {
  data: categories,
  isPending: isLoadingCategories,
  isError: isCategoriesError,
  refetch: refetchCategories,
} = useQuery({
  queryKey: queryKeys.categories,
  queryFn: () => getCategories(),
})

const {
  data: products,
  isPending: isLoadingProducts,
  isError: isProductsError,
  refetch: refetchProducts,
} = useQuery({
  queryKey: computed(() => queryKeys.productsByCategory(props.id)),
  queryFn: () => getProductsByCategory(props.id),
})

const category = computed(() => categories.value?.find((c) => c.id === props.id))
/** Só dá pra afirmar que não existe depois que a lista carregou */
const notFound = computed(() => !!categories.value && !category.value)
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
    <RouterLink
      :to="{ name: HOME, hash: '#categories' }"
      class="inline-flex items-center gap-1.5 text-sm font-semibold text-surface-500 transition hover:text-primary"
    >
      <Icon icon="lucide:arrow-left" class="size-4" />
      Voltar para as categorias
    </RouterLink>

    <QueryError
      v-if="isCategoriesError"
      class="mt-8"
      message="Não foi possível carregar a categoria."
      @retry="refetchCategories()"
    />

    <!-- Categoria não existe (link antigo ou id errado) -->
    <div
      v-else-if="notFound"
      class="mt-8 flex flex-col items-center rounded-3xl border-2 border-dashed border-surface-200 bg-surface-50 px-6 py-16 text-center"
    >
      <span class="grid size-16 place-items-center rounded-full bg-primary-50 text-primary">
        <Icon icon="lucide:search-x" class="size-8" />
      </span>
      <h1 class="mt-5 text-xl font-bold text-surface-900">Categoria não encontrada</h1>
      <p class="mt-2 max-w-sm text-surface-500">
        Essa categoria pode ter saído do catálogo. Dê uma olhada nas outras.
      </p>
      <RouterLink
        :to="{ name: HOME, hash: '#categories' }"
        class="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary-600"
      >
        Ver categorias
        <Icon icon="lucide:arrow-right" class="size-4" />
      </RouterLink>
    </div>

    <template v-else>
      <!-- Cabeçalho -->
      <div class="mt-4">
        <p class="text-sm font-semibold uppercase tracking-wider text-primary">Categoria</p>
        <div
          v-if="isLoadingCategories"
          class="mt-2 h-9 w-56 animate-pulse rounded bg-surface-200"
        ></div>
        <template v-else-if="category">
          <h1 class="mt-1 text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">
            {{ category.name }}
          </h1>
          <p
            v-if="category.description"
            class="mt-2 max-w-2xl whitespace-pre-line text-surface-500"
          >
            {{ category.description }}
          </p>
        </template>
      </div>

      <!-- Atalho pras outras categorias, na ordem de posição -->
      <nav
        v-if="categories && categories.length > 1"
        class="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0"
        aria-label="Outras categorias"
      >
        <ul class="flex gap-2 sm:flex-wrap">
          <li v-for="item in categories" :key="item.id" class="shrink-0">
            <RouterLink
              :to="{ name: CATEGORY, params: { id: item.id } }"
              class="inline-flex rounded-full px-4 py-2 text-sm font-semibold ring-1 transition"
              :class="
                item.id === props.id
                  ? 'bg-primary text-white ring-primary'
                  : 'bg-surface-0 text-surface-600 ring-surface-200 hover:text-primary hover:ring-primary-200'
              "
              :aria-current="item.id === props.id ? 'page' : undefined"
            >
              {{ item.name }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <ProductGrid
        class="mt-8"
        :products="products"
        :loading="isLoadingProducts"
        :error="isProductsError"
        error-message="Não foi possível carregar as peças dessa categoria."
        @retry="refetchProducts()"
      >
        <template #empty>
          <div
            class="mt-8 flex flex-col items-center rounded-3xl border-2 border-dashed border-surface-200 bg-surface-50 px-6 py-16 text-center"
          >
            <span class="grid size-16 place-items-center rounded-full bg-primary-50 text-primary">
              <Icon icon="lucide:shirt" class="size-8" />
            </span>
            <h2 class="mt-5 text-xl font-bold text-surface-900">Nenhuma peça por aqui ainda</h2>
            <p class="mt-2 max-w-sm text-surface-500">
              Essa categoria ainda não tem peças. Dê uma olhada nas outras.
            </p>
          </div>
        </template>
      </ProductGrid>
    </template>
  </section>
</template>
