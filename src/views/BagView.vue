<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { Icon } from '@iconify/vue'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { type Product } from '@/types'
import { numberMask } from '@/utils/masks'
import { MAX_QUANTITY, useBagStore, type BagItem, type Variant } from '@/stores/bag.store'
import { useQuery } from '@tanstack/vue-query'
import { getProducts, queryKeys } from '@/services/queries'
import QueryError from '@/components/QueryError.vue'
import ColorPicker from '@/components/ColorPicker.vue'
import SizePicker from '@/components/SizePicker.vue'
import { HOME, PRODUCT } from '@/utils/paths'
import { coverImage, productColors, productSizes, variantToQuery } from '@/utils/product'

const toast = useToast()
const bagStore = useBagStore()

const {
  data: products,
  isPending,
  isError,
  refetch,
} = useQuery({
  queryKey: queryKeys.products,
  queryFn: () => getProducts(),
})

type BagLine = {
  /** Chave estável da linha no v-for */
  key: string
  product: Product
  colors: string[]
  sizes: string[]
  /** Peça tem cores mas nenhuma (válida) foi escolhida */
  missingColor: boolean
  /** Peça tem tamanhos mas nenhum (válido) foi escolhido */
  missingSize: boolean
  subtotal: number
} & BagItem

/** Falta escolher: a peça tem opções e o valor está vazio ou não existe mais */
const isMissing = (value: string | null, options: string[]) =>
  options.length > 0 && (!value || !options.includes(value))

/** Junta o que está na sacola (id, cor, tamanho, quantidade) com os dados da peça vindos da API */
const lines = computed<BagLine[]>(() => {
  const byId = new Map(products.value?.map((p) => [p.id, p]))
  /** Quantas linhas de cada peça já apareceram (pra montar a chave) */
  const seen = new Map<string, number>()
  return bagStore.items.flatMap((item) => {
    const product = byId.get(item.productId)
    if (!product) return [] // peça saiu do catálogo
    const colors = productColors(product)
    const sizes = productSizes(product)
    const nth = seen.get(item.productId) ?? 0
    seen.set(item.productId, nth + 1)
    return [
      {
        ...item,
        // Sem cor/tamanho na chave: escolher não recria a linha (nem anima saída/entrada)
        key: `${item.productId}:${nth}`,
        product,
        colors,
        sizes,
        missingColor: isMissing(item.color, colors),
        missingSize: isMissing(item.size, sizes),
        subtotal: product.price * item.quantity,
      },
    ]
  })
})

/** Opção única não tem o que escolher: preenche sozinho se estiver faltando */
watch(
  lines,
  (list) => {
    for (const line of list) {
      const changes: Partial<Variant> = {}
      if (line.missingColor && line.colors.length === 1) changes.color = line.colors[0]!
      if (line.missingSize && line.sizes.length === 1) changes.size = line.sizes[0]!
      if (Object.keys(changes).length) bagStore.setVariant(line.productId, line, changes)
    }
  },
  { immediate: true },
)

const totalPieces = computed(() => lines.value.reduce((sum, l) => sum + l.quantity, 0))
const total = computed(() => lines.value.reduce((sum, l) => sum + l.subtotal, 0))
const incompleteCount = computed(
  () => lines.value.filter((l) => l.missingColor || l.missingSize).length,
)
const canCheckout = computed(() => lines.value.length > 0 && incompleteCount.value === 0)

/** Texto do erro de cada linha, conforme o que falta */
function missingMessage(line: BagLine) {
  if (line.missingColor && line.missingSize) return 'Escolha a cor e o tamanho desta peça'
  if (line.missingColor) return 'Escolha a cor desta peça'
  return 'Escolha o tamanho desta peça'
}

function removeLine(line: BagLine) {
  bagStore.remove(line.productId, line)
  toast.add({
    severity: 'secondary',
    summary: 'Removido da sacola',
    detail: line.product.name,
    life: 2500,
  })
}

function choose(line: BagLine, changes: Partial<Variant>) {
  bagStore.setVariant(line.productId, line, changes)
}

/*
 * Envio do pedido pelo WhatsApp: desativado no protótipo. Pra reativar, preencha
 * VITE_WHATSAPP_NUMBER no .env, descomente aqui e o botão do WhatsApp no template.
 *
 * const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER
 *
 * // Mensagem pronta com as peças, cores, tamanhos, quantidades e total (o *texto* fica em negrito no WhatsApp)
 * const whatsappMessage = computed(() => {
 *   const rows = lines.value.map((l) => {
 *     const details = [l.color && `cor ${l.color}`, l.size && `tam. ${l.size}`].filter(Boolean)
 *     const suffix = details.length ? ` (${details.join(', ')})` : ''
 *     return `• ${l.quantity}x ${l.product.name}${suffix}: ${numberMask(l.subtotal, 2)}`
 *   })
 *   return [
 *     'Olá! Gostaria de fazer este pedido:',
 *     '',
 *     ...rows,
 *     '',
 *     `*Total: ${numberMask(total.value, 2)}*`,
 *   ].join('\n')
 * })
 *
 * // wa.me abre o app do WhatsApp (celular/PC) se instalado, senão o WhatsApp Web
 * const whatsappUrl = computed(
 *   () => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage.value)}`,
 * )
 */

const router = useRouter()

/** Resumo do pedido finalizado, guardado antes de esvaziar a sacola (null = modal fechado) */
const completedOrder = ref<{ pieces: number; total: number } | null>(null)
const showSuccess = computed({
  get: () => completedOrder.value !== null,
  set: (open) => {
    if (!open) completedOrder.value = null
  },
})

function finishOrder() {
  if (!canCheckout.value) return
  completedOrder.value = { pieces: totalPieces.value, total: total.value }
  bagStore.clear()
}

function keepShopping() {
  completedOrder.value = null
  router.push({ name: HOME, hash: '#products' })
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
    <RouterLink
      :to="{ name: HOME }"
      class="inline-flex items-center gap-1.5 text-sm font-semibold text-surface-500 transition hover:text-primary"
    >
      <Icon icon="lucide:arrow-left" class="size-4" />
      Continuar vendo peças
    </RouterLink>

    <div class="mt-4 flex items-end justify-between gap-4">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wider text-primary">Suas escolhas</p>
        <h1 class="mt-1 text-3xl font-extrabold tracking-tight text-surface-900">Sacola</h1>
      </div>
      <button
        v-if="bagStore.items.length > 0"
        class="cursor-pointer text-sm font-semibold text-surface-500 underline-offset-4 transition hover:text-red-600 hover:underline"
        @click="bagStore.clear()"
      >
        Limpar sacola
      </button>
    </div>

    <!-- Carregando os dados das peças -->
    <div
      v-if="bagStore.items.length > 0 && isPending"
      class="mt-8 flex items-center justify-center gap-2 py-16 text-surface-500"
    >
      <Icon icon="lucide:loader-circle" class="size-5 animate-spin" />
      Carregando sua sacola...
    </div>

    <QueryError
      v-else-if="bagStore.items.length > 0 && isError"
      class="mt-8"
      message="Não foi possível carregar as peças da sua sacola."
      @retry="refetch()"
    />

    <!-- Sacola vazia -->
    <div
      v-else-if="lines.length === 0"
      class="mt-8 flex flex-col items-center rounded-3xl border-2 border-dashed border-surface-200 bg-surface-50 px-6 py-16 text-center"
    >
      <span class="grid size-16 place-items-center rounded-full bg-primary-50 text-primary">
        <Icon icon="lucide:shopping-bag" class="size-8" />
      </span>
      <h2 class="mt-5 text-xl font-bold text-surface-900">Sua sacola está vazia</h2>
      <p class="mt-2 max-w-sm text-surface-500">
        Dê uma olhada nas peças e toque no
        <Icon icon="lucide:shopping-bag" class="inline size-4 align-[-2px] text-primary" />
        para adicionar.
      </p>
      <RouterLink
        :to="{ name: HOME, hash: '#products' }"
        class="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary-600"
      >
        Ver peças
        <Icon icon="lucide:arrow-right" class="size-4" />
      </RouterLink>
    </div>

    <!-- Sacola com itens -->
    <div v-else class="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
      <ul class="relative flex flex-col gap-4">
        <TransitionGroup
          enter-from-class="opacity-0 -translate-y-2"
          leave-to-class="opacity-0 translate-x-8"
          enter-active-class="transition duration-300"
          leave-active-class="transition duration-300 absolute w-full"
          move-class="transition duration-300"
        >
          <li
            v-for="line in lines"
            :key="line.key"
            class="flex gap-4 rounded-2xl bg-surface-0 p-3 shadow-sm ring-1 transition sm:gap-5 sm:p-4"
            :class="line.missingColor || line.missingSize ? 'ring-red-300' : 'ring-surface-200'"
          >
            <RouterLink
              :to="{ name: PRODUCT, params: { id: line.productId }, query: variantToQuery(line) }"
              class="shrink-0 self-start"
            >
              <img
                :src="coverImage(line.product)"
                :alt="line.product.name"
                class="size-20 rounded-xl bg-surface-100 object-cover sm:size-24"
              />
            </RouterLink>

            <div class="flex min-w-0 flex-1 flex-col gap-3">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <RouterLink
                    :to="{
                      name: PRODUCT,
                      params: { id: line.productId },
                      query: variantToQuery(line),
                    }"
                    class="line-clamp-2 font-semibold text-surface-800 hover:text-primary"
                  >
                    {{ line.product.name }}
                  </RouterLink>
                  <p class="mt-0.5 text-sm text-surface-500">
                    {{ numberMask(line.product.price, 2) }} cada
                  </p>
                </div>
                <button
                  class="-mr-1 -mt-1 grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-surface-400 transition hover:bg-red-50 hover:text-red-600"
                  :aria-label="`Remover ${line.product.name} da sacola`"
                  @click="removeLine(line)"
                >
                  <Icon icon="lucide:trash-2" class="size-5" />
                </button>
              </div>

              <!-- Cor e tamanho -->
              <div v-if="line.colors.length || line.sizes.length" class="flex flex-col gap-2.5">
                <ColorPicker
                  v-if="line.colors.length"
                  :model-value="line.color"
                  :colors="line.colors"
                  :label="`Cor de ${line.product.name}`"
                  :invalid="line.missingColor"
                  size="sm"
                  @update:model-value="$event && choose(line, { color: $event })"
                />
                <SizePicker
                  v-if="line.sizes.length"
                  :model-value="line.size"
                  :sizes="line.sizes"
                  :label="`Tamanho de ${line.product.name}`"
                  :invalid="line.missingSize"
                  size="sm"
                  @update:model-value="$event && choose(line, { size: $event })"
                />
                <p
                  v-if="line.missingColor || line.missingSize"
                  class="flex items-center gap-1 text-sm font-medium text-red-600"
                  role="alert"
                >
                  <Icon icon="lucide:circle-alert" class="size-4 shrink-0" />
                  {{ missingMessage(line) }}
                </p>
              </div>

              <!-- Quantidade + subtotal -->
              <div class="flex items-center justify-between gap-3">
                <div
                  class="inline-flex items-center rounded-full ring-1 ring-surface-200"
                  role="group"
                  :aria-label="`Quantidade de ${line.product.name}`"
                >
                  <button
                    class="grid size-9 cursor-pointer place-items-center rounded-full text-surface-600 transition hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                    :disabled="line.quantity <= 1"
                    aria-label="Diminuir quantidade"
                    @click="bagStore.setQuantity(line.productId, line, line.quantity - 1)"
                  >
                    <Icon icon="lucide:minus" class="size-4" />
                  </button>
                  <span class="w-8 text-center font-bold text-surface-900" aria-live="polite">
                    {{ line.quantity }}
                  </span>
                  <button
                    class="grid size-9 cursor-pointer place-items-center rounded-full text-surface-600 transition hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                    :disabled="line.quantity >= MAX_QUANTITY"
                    aria-label="Aumentar quantidade"
                    @click="bagStore.setQuantity(line.productId, line, line.quantity + 1)"
                  >
                    <Icon icon="lucide:plus" class="size-4" />
                  </button>
                </div>
                <p class="text-lg font-extrabold text-surface-900">
                  {{ numberMask(line.subtotal, 2) }}
                </p>
              </div>
            </div>
          </li>
        </TransitionGroup>
      </ul>

      <!-- Resumo -->
      <aside class="rounded-3xl bg-surface-50 p-6 ring-1 ring-surface-200 lg:sticky lg:top-24">
        <h2 class="text-lg font-bold text-surface-900">Resumo</h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div class="flex justify-between text-surface-600">
            <dt>{{ totalPieces }} {{ totalPieces === 1 ? 'peça' : 'peças' }}</dt>
            <dd class="font-semibold text-surface-800">
              {{ numberMask(total, 2) }}
            </dd>
          </div>
          <div class="flex justify-between border-t border-surface-200 pt-3">
            <dt class="text-base font-bold text-surface-900">Total</dt>
            <dd class="text-2xl font-extrabold text-primary">
              {{ numberMask(total, 2) }}
            </dd>
          </div>
        </dl>

        <!-- Bloqueia o pedido enquanto faltar cor ou tamanho -->
        <p
          v-if="incompleteCount > 0"
          class="mt-6 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
        >
          <Icon icon="lucide:circle-alert" class="mt-0.5 size-4 shrink-0" />
          {{
            incompleteCount === 1
              ? 'Escolha a cor e o tamanho de 1 peça para finalizar o pedido.'
              : `Escolha a cor e o tamanho de ${incompleteCount} peças para finalizar o pedido.`
          }}
        </p>

        <!--
          Envio pelo WhatsApp (desativado no protótipo, ver o comentário no <script>):
          <Button
            v-if="canCheckout"
            as="a"
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-6 w-full !rounded-full !py-3 font-bold"
          >
            <Icon icon="ic:baseline-whatsapp" class="size-5" />
            Finalizar pedido no WhatsApp
          </Button>
          <p class="mt-3 text-center text-xs text-surface-500">
            Você será direcionado para o WhatsApp com o pedido já escrito.
          </p>
        -->
        <Button
          :disabled="!canCheckout"
          class="w-full !rounded-full !py-3 font-bold"
          :class="canCheckout ? 'mt-6' : 'mt-4'"
          @click="finishOrder"
        >
          <Icon icon="lucide:circle-check" class="size-5" />
          Finalizar pedido
        </Button>
      </aside>
    </div>

    <!-- Confirmação do pedido -->
    <Dialog
      v-model:visible="showSuccess"
      modal
      dismissable-mask
      :draggable="false"
      header="Pedido realizado"
      class="mx-4 w-full max-w-md"
    >
      <div v-if="completedOrder" class="flex flex-col items-center text-center">
        <span class="grid size-16 place-items-center rounded-full bg-primary-50 text-primary">
          <Icon icon="lucide:party-popper" class="size-8" />
        </span>
        <p class="mt-4 text-xl font-bold text-surface-900">Obrigado pela compra!</p>
        <p class="mt-2 text-surface-500">
          Recebemos seu pedido de {{ completedOrder.pieces }}
          {{ completedOrder.pieces === 1 ? 'peça' : 'peças' }}, no total de
          <strong class="text-surface-800">{{ numberMask(completedOrder.total, 2) }}</strong
          >.
        </p>
        <p
          class="mt-4 rounded-xl bg-surface-50 px-3 py-2 text-xs text-surface-500 ring-1 ring-surface-200"
        >
          Este site é um protótipo: nenhum pedido real foi enviado.
        </p>
      </div>
      <template #footer>
        <Button rounded class="w-full !py-3 font-bold" @click="keepShopping">
          Continuar comprando
          <Icon icon="lucide:arrow-right" class="size-4" />
        </Button>
      </template>
    </Dialog>
  </section>
</template>
