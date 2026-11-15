<script setup lang="ts">
/** Bolinhas de cor clicáveis; funciona como um grupo de "radio" (só uma escolhida) */
const props = withDefaults(
  defineProps<{
    colors: string[]
    /** Texto lido pelo leitor de tela pro grupo */
    label?: string
    size?: 'sm' | 'md'
    /** Destaca em vermelho (ex: cor obrigatória não escolhida) */
    invalid?: boolean
  }>(),
  { label: 'Cor', size: 'md', invalid: false },
)

const selected = defineModel<string | null>({ default: null })
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="props.label"
    :aria-invalid="props.invalid || undefined"
    class="flex flex-wrap gap-2.5"
  >
    <button
      v-for="color in props.colors"
      :key="color"
      type="button"
      role="radio"
      :aria-checked="selected === color"
      :aria-label="`Cor ${color}`"
      :title="color"
      class="cursor-pointer rounded-full ring-offset-2 ring-offset-surface-0 transition hover:scale-110"
      :class="[
        props.size === 'sm' ? 'size-6' : 'size-8',
        selected === color
          ? 'ring-2 ring-primary'
          : props.invalid
            ? 'ring-1 ring-red-400'
            : 'ring-1 ring-surface-300',
      ]"
      :style="{ backgroundColor: color }"
      @click="selected = color"
    />
  </div>
</template>
