<script setup lang="ts">
import { Icon } from '@iconify/vue'
import CategoryHomeButton from '@/components/CategoryHomeButton.vue'
import { useQuery } from '@tanstack/vue-query'
import { getCategories, getProducts, queryKeys } from '@/services/queries'
import QueryError from '@/components/QueryError.vue'
import ProductGrid from '@/components/ProductGrid.vue'

/** Arquivos de /public precisam do base (no GitHub Pages o site fica em /dad-catalog/) */
const baseUrl = import.meta.env.BASE_URL

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
  queryKey: queryKeys.products,
  queryFn: () => getProducts(),
})
</script>

<template>
  <div>
    <!-- Destaque (hero) -->
    <section class="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10">
      <div
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 px-6 py-10 text-white sm:px-12 sm:py-14"
      >
        <!-- Círculos decorativos -->
        <div
          class="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/10"
        ></div>
        <div
          class="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-white/10"
        ></div>

        <div class="relative grid items-center gap-10 md:grid-cols-2">
          <div>
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider"
            >
              <Icon icon="lucide:sparkles" class="size-3.5" />
              Nova coleção
            </span>
            <h2 class="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Estilo pra todo dia, do básico ao social.
            </h2>
            <p class="mt-4 max-w-md text-base text-white/85 sm:text-lg">
              Camisetas, polos, jeans e muito mais. Peças selecionadas com preço justo.
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <a
                href="#products"
                class="inline-flex items-center gap-2 rounded-full bg-surface-0 px-6 py-3 font-bold text-primary-700 shadow-lg shadow-primary-900/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Ver peças
                <Icon icon="lucide:arrow-right" class="size-4" />
              </a>
              <a
                href="#categories"
                class="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3 font-bold text-white transition hover:bg-white/10"
              >
                Categorias
              </a>
            </div>
          </div>

          <!-- Colagem de fotos -->
          <div class="relative hidden h-80 md:block">
            <img
              :src="`${baseUrl}images/polos.webp`"
              alt=""
              class="absolute right-40 top-6 h-64 w-48 -rotate-6 rounded-2xl object-cover shadow-2xl ring-4 ring-white/80"
            />
            <img
              :src="`${baseUrl}images/tshirts.webp`"
              alt=""
              class="absolute right-4 top-0 h-72 w-52 rotate-3 rounded-2xl object-cover shadow-2xl ring-4 ring-white/80"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Categorias -->
    <section id="categories" class="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6">
      <div class="flex items-end justify-between gap-4">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wider text-primary">Explore</p>
          <h2 class="mt-1 text-3xl font-extrabold tracking-tight text-surface-900">Categorias</h2>
        </div>
      </div>

      <QueryError
        v-if="isCategoriesError"
        class="mt-8"
        message="Não foi possível carregar as categorias."
        @retry="refetchCategories()"
      />
      <div
        v-else-if="isLoadingCategories"
        class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="aspect-[3/4] animate-pulse rounded-2xl bg-surface-200"
        ></div>
      </div>
      <div v-else class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <CategoryHomeButton
          v-for="category in categories"
          :key="category.id"
          :id="category.id"
          :name="category.name"
          :image="category.image"
        />
      </div>
    </section>

    <!-- Peças de roupa -->
    <section id="products" class="scroll-mt-24 bg-surface-50 py-14">
      <div class="mx-auto max-w-7xl px-4 sm:px-6">
        <div class="mb-8">
          <p class="text-sm font-semibold uppercase tracking-wider text-primary">Destaques</p>
          <h2 class="mt-1 text-3xl font-extrabold tracking-tight text-surface-900">
            Peças de roupa
          </h2>
        </div>
        <ProductGrid
          :products="products"
          :loading="isLoadingProducts"
          :error="isProductsError"
          error-message="Não foi possível carregar as peças."
          @retry="refetchProducts()"
        />
      </div>
    </section>
  </div>
</template>
