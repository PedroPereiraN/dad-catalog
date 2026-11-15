<script setup lang="ts">
/** Botões de tamanho; funciona como um grupo de "radio" (só um escolhido) */
const props = withDefaults(
  defineProps<{
    sizes: string[]
    /** Texto lido pelo leitor de tela pro grupo */
    label?: string
    size?: 'sm' | 'md'
    /** Destaca em vermelho (ex: tamanho obrigatório não escolhido) */
    invalid?: boolean
  }>(),
  { label: 'Tamanho', size: 'md', invalid: false },
)

const selected = defineModel<string | null>({ default: null })
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="props.label"
    :aria-invalid="props.invalid || undefined"
    class="flex flex-wrap gap-2"
  >
    <button
      v-for="option in props.sizes"
      :key="option"
      type="button"
      role="radio"
      :aria-checked="selected === option"
      class="cursor-pointer rounded-full font-bold transition"
      :class="[
        props.size === 'sm' ? 'h-7 min-w-9 px-2.5 text-xs' : 'h-10 min-w-12 px-4 text-sm',
        selected === option
          ? 'bg-primary text-white ring-2 ring-primary'
          : props.invalid
            ? 'bg-surface-0 text-surface-700 ring-1 ring-red-400 hover:bg-red-50'
            : 'bg-surface-0 text-surface-700 ring-1 ring-surface-300 hover:ring-primary',
      ]"
      @click="selected = option"
    >
      {{ option }}
    </button>
  </div>
</template>
