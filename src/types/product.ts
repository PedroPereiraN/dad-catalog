export type ProductImage = {
  url: string
  position: number
}

export type ProductVariants = {
  colors?: string[]
  sizes?: string[]
}

export type Product = {
  id: string
  images: ProductImage[]
  name: string
  price: number
  variants: ProductVariants
  description: string
  /** Ids dos documentos da coleção `categories` */
  categories?: string[]
}
