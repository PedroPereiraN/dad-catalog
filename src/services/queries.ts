import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type { Category, Product } from '@/types'
import { sortByPosition } from '@/utils/product'

/** Chaves centralizadas: evita erro de digitação e facilita invalidar o cache depois */
export const queryKeys = {
  categories: ['categories'] as const,
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  productsByCategory: (categoryId: string) => ['products', 'category', categoryId] as const,
}

/** Nomes das coleções no Firestore */
const COLLECTIONS = {
  categories: 'categories',
  products: 'products',
} as const

/** Lançado quando o documento não existe (link antigo ou id errado) */
export class NotFoundError extends Error {}

/** Garante as fotos sempre em ordem de posição, pra quem consome não precisar se preocupar */
const toProduct = (product: Product): Product => ({
  ...product,
  images: sortByPosition(product.images),
})

/** O id do documento no Firestore vira o `id` do objeto */
const getCollection = async <T extends { id: string }>(name: string) => {
  const snapshot = await getDocs(collection(db, name))

  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as T)
}

/** Já vêm ordenadas por posição (menor primeiro) */
export const getCategories = async () =>
  sortByPosition(await getCollection<Category>(COLLECTIONS.categories))

export const getProducts = async () =>
  (await getCollection<Product>(COLLECTIONS.products)).map(toProduct)

/** Só as peças que têm a categoria no array `categories` (filtrado no próprio Firestore) */
export const getProductsByCategory = async (categoryId: string) => {
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.products), where('categories', 'array-contains', categoryId)),
  )

  return snapshot.docs.map((d) => toProduct({ ...d.data(), id: d.id } as Product))
}

export const getProduct = async (id: string) => {
  const snapshot = await getDoc(doc(db, COLLECTIONS.products, id))

  if (!snapshot.exists()) {
    throw new NotFoundError(`Produto ${id} não encontrado`)
  }

  return toProduct({ ...snapshot.data(), id: snapshot.id } as Product)
}
