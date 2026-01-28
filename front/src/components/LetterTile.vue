<template>
  <button
    class="letter-tile group flex w-full items-center justify-center rounded-lg border border-slate-700/70 bg-slate-900/70 text-2xl font-bold text-white shadow-md backdrop-blur transition duration-200"
    :class="{
      'ring-2 ring-amber-300/80 shadow-[0_0_15px_rgba(251,191,36,0.45)] scale-[1.03]': selected,
      'opacity-40 cursor-not-allowed': disabled,
      'letter-error': error,
      'letter-drop': isNew,
      'hover:ring-2 hover:ring-amber-300/70 hover:shadow-[0_0_12px_rgba(251,191,36,0.35)]': !disabled && !selected
    }"
    :disabled="disabled"
    type="button"
    @click="$emit('toggle')"
  >
    <span v-if="letter" class="drop-shadow-[0_2px_8px_rgba(56,189,248,0.35)]">
      {{ letter }}
    </span>
    <span v-else class="text-slate-600/60">•</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  letter: string | null;
  selected: boolean;
  disabled: boolean;
  error: boolean;
  isNew: boolean;
}>();

defineEmits(['toggle']);
</script>

<style scoped>
.letter-tile {
  aspect-ratio: 1 / 1;
}

.letter-drop {
  animation: drop-in 0.35s ease;
}

.letter-error {
  animation: flash 0.35s ease;
}

@keyframes drop-in {
  0% {
    transform: translateY(-12px) scale(0.95);
    opacity: 0.4;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes flash {
  0%,
  100% {
    box-shadow: 0 0 0 rgba(248, 113, 113, 0);
  }
  50% {
    box-shadow: 0 0 20px rgba(248, 113, 113, 0.9);
    border-color: rgba(248, 113, 113, 0.9);
  }
}
</style>
