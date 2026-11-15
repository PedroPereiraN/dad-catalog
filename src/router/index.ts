import HomeView from '@/views/HomeView.vue'
import BagView from '@/views/BagView.vue'
import ProductView from '@/views/ProductView.vue'
import CategoryView from '@/views/CategoryView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
      name: 'home',
    },
    {
      path: '/bag',
      component: BagView,
      name: 'bag',
    },
    {
      path: '/products/:id',
      component: ProductView,
      name: 'product',
      // Passa o :id da URL como prop pra tela
      props: true,
    },
    {
      path: '/categories/:id',
      component: CategoryView,
      name: 'category',
      props: true,
    },
  ],
  // Volta ao topo ao trocar de tela, e respeita links com âncora (#products)
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // Só a query mudou (ex: cor/tamanho na página da peça): fica onde está
    if (to.path === from.path && to.hash === from.hash) return false
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
