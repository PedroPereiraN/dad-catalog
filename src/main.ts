import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import ToastService from 'primevue/toastservice'
import { VueQueryPlugin } from '@tanstack/vue-query'

import './index.css'
import App from './App.vue'
import router from './router'
// Aplica o tema salvo (claro/escuro/sistema) antes de montar
import './composables/useTheme'

/** No escuro o Aura clareia o primary e usa texto escuro nos botões; aqui mantém igual ao claro */
const AppPreset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      dark: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.400}',
          activeColor: '{primary.300}',
        },
      },
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: AppPreset,
    options: {
      darkModeSelector: '.dark',
      cssLayer: { name: 'primevue', order: 'theme, base, primevue' },
    },
  },
})
app.use(ToastService)
app.use(VueQueryPlugin)

app.mount('#app')
