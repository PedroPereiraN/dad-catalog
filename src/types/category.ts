export type Category = {
  id: string
  image: string
  name: string
  description: string
  /** Ordem de exibição: o menor número vem primeiro */
  position?: number
}
