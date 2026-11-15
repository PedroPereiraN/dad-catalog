import { computed, ref, watch, watchEffect } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

/** Mesma chave lida pelo script do index.html (evita piscar o tema errado ao abrir) */
export const THEME_STORAGE_KEY = 'theme'

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system'

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeMode(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

// Estado único pro app todo (fora da função, então todo componente compartilha)
const mode = ref<ThemeMode>(readStoredMode())

const systemQuery = window.matchMedia('(prefers-color-scheme: dark)')
const systemPrefersDark = ref(systemQuery.matches)
// Acompanha quando o cliente troca o tema do sistema com o site aberto
systemQuery.addEventListener('change', (event) => (systemPrefersDark.value = event.matches))

const isDark = computed(
  () => mode.value === 'dark' || (mode.value === 'system' && systemPrefersDark.value),
)

watchEffect(() => document.documentElement.classList.toggle('dark', isDark.value))

watch(mode, (value) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, value)
  } catch {
    // Navegação privada/armazenamento bloqueado: vale só até fechar a aba
  }
})

export function useTheme() {
  return {
    /** O que o cliente escolheu (claro, escuro ou seguir o sistema) */
    mode,
    /** Se o tema escuro está ativo agora */
    isDark,
    setMode: (value: ThemeMode) => (mode.value = value),
  }
}
