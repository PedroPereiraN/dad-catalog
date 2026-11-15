import type { Product } from '@/types'
import type { Variant } from '@/stores/bag.store'

/** Ordena pela posição: o menor número vem primeiro; sem posição vai pro final */
export const sortByPosition = <T extends { position?: number }>(items: T[] = []) =>
  [...items].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))

/** Foto de capa: a de menor posição (as imagens já chegam ordenadas da API) */
export const coverImage = (product: Product) => product.images[0]?.url ?? ''

/** Opções de uma variante (sem repetir); vazio se o produto não tiver */
const collectVariantOptions = (product: Product, key: 'colors' | 'sizes') => [
  ...new Set(product.variants?.[key] ?? []),
]

export const productColors = (product: Product) => collectVariantOptions(product, 'colors')

export const productSizes = (product: Product) => collectVariantOptions(product, 'sizes')

/** Na URL a cor vai sem "#" (que marca âncora) e minúscula: "#AAB4C7" -> "aab4c7" */
export const colorToQuery = (color: string) => color.replace(/^#/, '').toLowerCase()

/** Query da página do produto com a cor/tamanho escolhidos (pra links e compartilhamento) */
export const variantToQuery = ({ color, size }: Partial<Variant>) => ({
  ...(color && { color: colorToQuery(color) }),
  ...(size && { size }),
})
