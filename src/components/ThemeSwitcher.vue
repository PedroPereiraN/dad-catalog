<script setup lang="ts">
import { computed, ref } from 'vue'
import Menu from 'primevue/menu'
import { Icon } from '@iconify/vue'
import { useTheme, type ThemeMode } from '@/composables/useTheme'

const { mode, setMode } = useTheme()

const OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'light', label: 'Claro', icon: 'lucide:sun' },
  { mode: 'dark', label: 'Escuro', icon: 'lucide:moon' },
  { mode: 'system', label: 'Sistema', icon: 'lucide:monitor' },
]

const current = computed(() => OPTIONS.find((option) => option.mode === mode.value) ?? OPTIONS[2]!)

const items = OPTIONS.map((option) => ({
  ...option,
  command: () => setMode(option.mode),
}))

const menu = ref<InstanceType<typeof Menu>>()
</script>

<template>
  <button
    type="button"
    class="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-surface-600 ring-1 ring-surface-200 transition hover:text-primary hover:ring-primary-200"
    :aria-label="`Tema: ${current.label}. Trocar tema`"
    aria-haspopup="true"
    aria-controls="theme-menu"
    @click="menu?.toggle($event)"
  >
    <Icon :icon="current.icon" class="size-5" />
  </button>

  <Menu id="theme-menu" ref="menu" :model="items" popup>
    <template #item="{ item, props }">
      <a v-bind="props.action" class="flex items-center gap-2">
        <Icon :icon="item.icon ?? ''" class="size-4" />
        <span class="flex-1">{{ item.label }}</span>
        <Icon v-if="item.mode === mode" icon="lucide:check" class="size-4 text-primary" />
      </a>
    </template>
  </Menu>
</template>
