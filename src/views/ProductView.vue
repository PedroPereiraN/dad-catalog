<script setup lang="ts">
import Button from 'primevue/button'
import { Icon } from '@iconify/vue'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { getCategories, getProduct, NotFoundError, queryKeys } from '@/services/queries'
import { useBagStore, type Variant } from '@/stores/bag.store'
import { numberMask } from '@/utils/masks'
import { CATEGORY, HOME } from '@/utils/paths'
import type { Product } from '@/types'
import { colorToQuery, productColors, productSizes } from '@/utils/product'
import QueryError from '@/components/QueryError.vue'
import ColorPicker from '@/components/ColorPicker.vue'
import SizePicker from '@/components/SizePicker.vue'

/** Vem do :id da URL (rota com props: true) */
const props = defineProps<{ id: string }>()

const toast = useToast()
const bagStore = useBagStore()
const queryClient = useQueryClient()

const {
  data: product,
  isPending,
  isError,
  error,
  refetch,
} = useQuery({
  queryKey: computed(() => queryKeys.product(props.id)),
  queryFn: () => getProduct(props.id),
  // Vindo da home, a lista já está em cache: mostra na hora enquanto busca a versão completa
  placeholderData: () =>
    queryClient.getQueryData<Product[]>(queryKeys.products)?.find((p) => p.id === props.id),
  // Peça inexistente não adianta tentar de novo
  retry: (failureCount, err) => !(err instanceof NotFoundError) && failureCount < 3,
})

const notFound = computed(() => error.value instanceof NotFoundError)

/** Mesma query da home: se veio de lá, já está em cache */
const { data: allCategories } = useQuery({
  queryKey: queryKeys.categories,
  queryFn: () => getCategories(),
})

/** `product.categories` guarda os ids; troca pelo nome (se não achar, mostra o valor como veio) */
const categoryNames = computed(() => {
  const ids = new Set(product.value?.categories ?? [])
  // Percorre a lista de categorias (já ordenada por posição) e pega só as da peça
  const known = (allCategories.value ?? [])
    .filter((c) => ids.has(c.id))
    .map((c) => ({ id: c.id, name: c.name }))
  // Ids que não existem mais na coleção (ou ainda carregando) vão pro final, como vieram
  const knownIds = new Set(known.map((c) => c.id))
  const unknown = [...ids].filter((id) => !knownIds.has(id)).map((id) => ({ id, name: id }))
  return [...known, ...unknown]
})

/** Já vêm ordenadas por posição (menor primeiro) da API */
const images = computed(() => product.value?.images ?? [])
const colors = computed(() => (product.value ? productColors(product.value) : []))
const sizes = computed(() => (product.value ? productSizes(product.value) : []))

/** Foto em destaque; volta pra primeira quando troca de produto */
const selectedImage = ref(0)
watch(
  () => props.id,
  () => (selectedImage.value = 0),
)

const route = useRoute()
const router = useRouter()

/**
 * Opção escolhida guardada na URL (?color=...&size=...), pra quem receber o link
 * abrir a peça já com a mesma cor e tamanho. Sem nada na URL (ou com uma opção que
 * não existe mais), vale a primeira; null se a peça não tem opções.
 */
function useQueryOption(
  key: 'color' | 'size',
  options: () => string[],
  toQuery: (option: string) => string = (option) => option,
) {
  return computed<string | null>({
    get() {
      const raw = route.query[key]
      const value = Array.isArray(raw) ? raw[0] : raw
      const list = options()
      return list.find((option) => toQuery(option) === value) ?? list[0] ?? null
    },
    set(option) {
      // replace: trocar de cor não enche o histórico (o "voltar" sai da peça)
      router.replace({ query: { ...route.query, [key]: option ? toQuery(option) : undefined } })
    },
  })
}

const selectedColor = useQueryOption('color', () => colors.value, colorToQuery)
const selectedSize = useQueryOption('size', () => sizes.value)

const variant = computed<Variant>(() => ({
  color: selectedColor.value,
  size: selectedSize.value,
}))

/** "Na sacola" vale pra cor + tamanho escolhidos: trocar permite adicionar outra variação */
const inBag = computed(() => bagStore.has(props.id, variant.value))

function toggleBag(item: Product) {
  if (inBag.value) {
    bagStore.remove(item.id, variant.value)
    toast.add({
      severity: 'secondary',
      summary: 'Removido da sacola',
      detail: item.name,
      life: 2500,
    })
  } else {
    bagStore.add(item.id, variant.value)
    toast.add({
      severity: 'success',
      summary: 'Adicionado à sacola',
      detail: item.name,
      life: 2500,
    })
  }
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
    <RouterLink
      :to="{ name: HOME, hash: '#products' }"
      class="inline-flex items-center gap-1.5 text-sm font-semibold text-surface-500 transition hover:text-primary"
    >
      <Icon icon="lucide:arrow-left" class="size-4" />
      Voltar para as peças
    </RouterLink>

    <!-- Peça não existe (link antigo ou id errado) -->
    <div
      v-if="notFound"
      class="mt-8 flex flex-col items-center rounded-3xl border-2 border-dashed border-surface-200 bg-surface-50 px-6 py-16 text-center"
    >
      <span class="grid size-16 place-items-center rounded-full bg-primary-50 text-primary">
        <Icon icon="lucide:search-x" class="size-8" />
      </span>
      <h1 class="mt-5 text-xl font-bold text-surface-900">Peça não encontrada</h1>
      <p class="mt-2 max-w-sm text-surface-500">
        Essa peça pode ter saído do catálogo. Dê uma olhada nas outras.
      </p>
      <RouterLink
        :to="{ name: HOME, hash: '#products' }"
        class="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary-600"
      >
        Ver peças
        <Icon icon="lucide:arrow-right" class="size-4" />
      </RouterLink>
    </div>

    <QueryError
      v-else-if="isError"
      class="mt-8"
      message="Não foi possível carregar essa peça."
      @retry="refetch()"
    />

    <!-- Carregando (sem nada em cache) -->
    <div
      v-else-if="isPending"
      class="mt-4 grid gap-8 md:grid-cols-[minmax(0,auto)_minmax(16rem,1fr)] lg:gap-12"
    >
      <div
        class="aspect-[4/5] animate-pulse rounded-3xl bg-surface-200 md:h-[calc(100dvh-10.5rem)] md:max-h-[44rem] md:min-h-80"
      ></div>
      <div class="space-y-4">
        <div class="h-8 w-3/4 animate-pulse rounded bg-surface-200"></div>
        <div class="h-10 w-1/3 animate-pulse rounded bg-surface-200"></div>
        <div class="h-12 w-full animate-pulse rounded-full bg-surface-200"></div>
      </div>
    </div>

    <div
      v-else-if="product"
      class="mt-4 grid items-start gap-8 md:grid-cols-[minmax(0,auto)_minmax(16rem,1fr)] lg:gap-12"
    >
      <!--
        Galeria. No desktop a altura acompanha a tela (100dvh menos header e espaçamentos),
        assim foto + miniaturas cabem sem rolar. Miniaturas ficam numa coluna à esquerda.
      -->
      <div
        class="flex flex-col gap-3 md:h-[calc(100dvh-10.5rem)] md:max-h-[44rem] md:min-h-80 md:flex-row-reverse"
      >
        <div
          class="aspect-[4/5] overflow-hidden rounded-3xl bg-surface-100 ring-1 ring-surface-200 md:h-full md:max-w-full md:min-w-0"
        >
          <img
            :src="(images[selectedImage] ?? images[0])?.url"
            :alt="product.name"
            class="size-full object-cover"
          />
        </div>
        <div
          v-if="images.length > 1"
          class="flex shrink-0 gap-3 overflow-x-auto p-1 md:flex-col md:overflow-y-auto md:overflow-x-hidden"
        >
          <button
            v-for="(image, index) in images"
            :key="image.url"
            class="size-20 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-surface-100 ring-2 transition"
            :class="
              index === selectedImage
                ? 'ring-primary'
                : 'ring-transparent opacity-70 hover:opacity-100'
            "
            :aria-label="`Ver foto ${index + 1} de ${images.length}`"
            :aria-pressed="index === selectedImage"
            @click="selectedImage = index"
          >
            <img :src="image.url" alt="" class="size-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Informações -->
      <div class="flex flex-col gap-6 md:sticky md:top-24">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">
            {{ product.name }}
          </h1>
          <p class="mt-3 text-3xl font-extrabold text-primary">
            {{ numberMask(product.price, 2) }}
          </p>
          <!-- Categorias da peça -->
          <ul v-if="categoryNames.length" class="mt-4 flex flex-wrap gap-2" aria-label="Categorias">
            <li v-for="category in categoryNames" :key="category.id">
              <RouterLink
                :to="{ name: CATEGORY, params: { id: category.id } }"
                class="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-200 transition hover:bg-primary-100"
              >
                {{ category.name }}
              </RouterLink>
            </li>
          </ul>
          <!-- whitespace-pre-line respeita as quebras de linha digitadas no Firebase -->
          <p
            v-if="product.description"
            class="mt-4 whitespace-pre-line leading-relaxed text-surface-600"
          >
            {{ product.description }}
          </p>
        </div>

        <!-- Escolha da cor -->
        <div v-if="colors.length">
          <h2 class="text-sm font-semibold text-surface-700">
            Cor
            <span class="font-normal text-surface-500">
              · {{ colors.length }}
              {{ colors.length === 1 ? 'disponível' : 'disponíveis' }}
            </span>
          </h2>
          <ColorPicker
            v-model="selectedColor"
            :colors="colors"
            label="Escolha a cor"
            class="mt-3"
          />
        </div>

        <!-- Escolha do tamanho -->
        <div v-if="sizes.length">
          <h2 class="text-sm font-semibold text-surface-700">
            Tamanho
            <span class="font-normal text-surface-500">
              · {{ sizes.length }}
              {{ sizes.length === 1 ? 'disponível' : 'disponíveis' }}
            </span>
          </h2>
          <SizePicker
            v-model="selectedSize"
            :sizes="sizes"
            label="Escolha o tamanho"
            class="mt-3"
          />
        </div>

        <Button
          v-if="!inBag"
          rounded
          class="w-full !py-3 font-bold sm:w-auto sm:self-start sm:!px-8"
          @click="toggleBag(product)"
        >
          <Icon icon="lucide:shopping-bag" class="size-5" />
          Adicionar à sacola
        </Button>
        <button
          v-else
          class="group/remove inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary-50 px-8 py-3 font-bold text-primary-700 ring-1 ring-primary-200 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-200 sm:w-auto sm:self-start"
          :aria-label="`${product.name} está na sacola. Remover`"
          @click="toggleBag(product)"
        >
          <Icon icon="lucide:check" class="size-5 group-hover/remove:hidden" />
          <Icon icon="lucide:x" class="hidden size-5 group-hover/remove:block" />
          <span class="group-hover/remove:hidden">Na sacola</span>
          <span class="hidden group-hover/remove:inline">Remover da sacola</span>
        </button>
      </div>
    </div>
  </section>
</template>
