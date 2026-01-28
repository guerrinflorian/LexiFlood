<template>
  <button
    class="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-xl font-bold text-slate-100 shadow-lg transition duration-200"
    :class="{
      'ring-2 ring-indigo-400 shadow-glow scale-105': selected,
      'opacity-40 cursor-not-allowed': disabled,
      'hover:ring-2 hover:ring-indigo-500 hover:shadow-glow': !disabled && !selected
    }"
    :disabled="disabled"
    type="button"
    @click="$emit('toggle')"
  >
    <span v-if="letter">{{ letter }}</span>
    <span v-else class="text-slate-600">•</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  letter: string | null;
  selected: boolean;
  disabled: boolean;
}>();

defineEmits(['toggle']);
</script>
