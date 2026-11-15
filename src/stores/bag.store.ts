import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/** O que o cliente escolhe numa peça; null = ainda não escolhido (ex: adicionada pelo card) */
export type Variant = {
  /** Hex da cor escolhida */
  color: string | null
  /** Tamanho escolhido (ex: "M", "40") */
  size: string | null
}

export type BagItem = {
  /** Usado pra buscar a peça (nome, preço, fotos) na API */
  productId: string
  quantity: number
} & Variant

export const MAX_QUANTITY = 99

/**
 * Uma linha da sacola é identificada por peça + cor + tamanho: a mesma peça pode entrar
 * em variações diferentes, e repetir a mesma variação só soma a quantidade.
 */
export const useBagStore = defineStore('bag', () => {
  const items = ref<BagItem[]>([])

  /** Total de peças (somando quantidades), usado no contador do header */
  const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  function find(productId: string, { color, size }: Variant) {
    return items.value.find(
      (item) => item.productId === productId && item.color === color && item.size === size,
    )
  }

  function clampQuantity(quantity: number) {
    return Math.min(Math.max(Math.round(quantity), 1), MAX_QUANTITY)
  }

  /** Tem essa peça na sacola? Sem `variant`, vale qualquer cor/tamanho */
  function has(productId: string, variant?: Variant) {
    if (!variant) return items.value.some((item) => item.productId === productId)
    return find(productId, variant) !== undefined
  }

  function add(productId: string, variant: Variant, quantity = 1) {
    const existing = find(productId, variant)
    if (existing) {
      existing.quantity = clampQuantity(existing.quantity + quantity)
    } else {
      items.value.push({ productId, ...variant, quantity: clampQuantity(quantity) })
    }
  }

  function remove(productId: string, variant: Variant) {
    const item = find(productId, variant)
    items.value = items.value.filter((i) => i !== item)
  }

  /** Remove a peça em todas as variações (usado no card, que não sabe cor/tamanho) */
  function removeProduct(productId: string) {
    items.value = items.value.filter((item) => item.productId !== productId)
  }

  function setQuantity(productId: string, variant: Variant, quantity: number) {
    const item = find(productId, variant)
    if (item) item.quantity = clampQuantity(quantity)
  }

  /**
   * Muda a cor e/ou o tamanho de uma linha. Se a peça já está na sacola
   * com a variação nova, junta as quantidades numa linha só.
   */
  function setVariant(productId: string, from: Variant, changes: Partial<Variant>) {
    const item = find(productId, from)
    if (!item) return
    const to: Variant = { color: item.color, size: item.size, ...changes }
    const target = find(productId, to)
    if (target === item) return
    if (target) {
      target.quantity = clampQuantity(target.quantity + item.quantity)
      items.value = items.value.filter((i) => i !== item)
    } else {
      item.color = to.color
      item.size = to.size
    }
  }

  function clear() {
    items.value = []
  }

  return {
    items,
    count,
    has,
    add,
    remove,
    removeProduct,
    setQuantity,
    setVariant,
    clear,
  }
})
