<template>
  <button
    class="letter-tile group relative flex items-center justify-center rounded-lg border transition-all duration-200"
    :class="[
      neonClass,
      {
        'is-selected': selected,
        'is-disabled': disabled,
        'letter-error': error,
        'letter-drop': isNew,
      }
    ]"
    :disabled="disabled"
    type="button"
    @click="$emit('toggle')"
  >
    <span
      v-if="letter"
      class="letter-char text-xl font-bold sm:text-2xl md:text-3xl"
      :class="{ 'letter-char-selected': selected }"
    >
      {{ letter }}
    </span>
    <span v-else class="text-2xl text-slate-700/50 sm:text-3xl">•</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  letter: string | null;
  selected: boolean;
  disabled: boolean;
  error: boolean;
  isNew: boolean;
}>();

defineEmits(['toggle']);

const neonClass = computed(() => {
  if (!props.letter) {
    return '';
  }
  const index = props.letter.charCodeAt(0) % 4;
  return ['neon-cyan', 'neon-magenta', 'neon-yellow', 'neon-green'][index];
});
</script>

<style scoped>
.letter-tile {
  aspect-ratio: 1 / 1;
  min-height: clamp(36px, 6vw, 70px);
  border-color: rgba(34, 211, 238, 0.35);
  background: rgba(5, 12, 24, 0.65);
  box-shadow: inset 0 0 12px rgba(32, 243, 255, 0.08), 0 0 12px rgba(32, 243, 255, 0.08);
}

.letter-tile:hover:not(.is-disabled) {
  box-shadow: inset 0 0 18px rgba(32, 243, 255, 0.2), 0 0 16px rgba(32, 243, 255, 0.2);
}

.letter-tile.is-selected {
  border-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.55), inset 0 0 16px rgba(255, 255, 255, 0.35);
  transform: scale(1.03);
}

.letter-tile.is-disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.letter-char {
  color: currentColor;
  text-shadow:
    0 0 6px rgba(255, 255, 255, 0.9),
    0 0 14px currentColor,
    0 0 30px currentColor;
}

.letter-char-selected {
  color: #ffffff;
  text-shadow:
    0 0 6px rgba(255, 255, 255, 1),
    0 0 18px rgba(255, 255, 255, 0.9),
    0 0 36px rgba(255, 255, 255, 0.8);
}

.neon-cyan {
  color: var(--neon-cyan);
}

.neon-magenta {
  color: var(--neon-magenta);
}

.neon-yellow {
  color: var(--neon-yellow);
}

.neon-green {
  color: var(--neon-green);
}

.letter-drop {
  animation: drop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.letter-error {
  animation: shake 0.4s ease, flash 0.4s ease;
}

@keyframes drop-in {
  0% {
    transform: translateY(-20px) scale(0.8);
    opacity: 0;
  }
  60% {
    transform: translateY(5px) scale(1.05);
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

@keyframes flash {
  0%, 100% {
    box-shadow: 0 0 0 rgba(248, 113, 113, 0);
    border-color: rgba(248, 113, 113, 0);
  }
  50% {
    box-shadow: 0 0 24px rgba(248, 113, 113, 0.8), inset 0 0 12px rgba(248, 113, 113, 0.3);
    border-color: rgba(248, 113, 113, 0.8);
  }
}
</style>
