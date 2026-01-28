<template>
  <button
    class="letter-tile group relative flex items-center justify-center rounded-lg border transition-all duration-200"
    :class="{
      // État sélectionné
      'border-amber-400/60 bg-gradient-to-br from-amber-500/20 to-amber-600/10 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20 scale-[1.02]': selected,
      // État normal
      'border-slate-700/50 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800/80 hover:shadow-md': !selected && !disabled,
      // État désactivé
      'opacity-30 cursor-not-allowed': disabled,
      // Animations
      'letter-error': error,
      'letter-drop': isNew,
    }"
    :disabled="disabled"
    type="button"
    @click="$emit('toggle')"
  >
    <span 
      v-if="letter" 
      class="text-xl font-bold text-white drop-shadow-sm sm:text-2xl md:text-3xl"
      :class="{ 'text-amber-100': selected }"
    >
      {{ letter }}
    </span>
    <span v-else class="text-2xl text-slate-700/50 sm:text-3xl">•</span>
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
  min-height: 60px;
}

@media (min-width: 640px) {
  .letter-tile {
    min-height: 70px;
  }
}

@media (min-width: 768px) {
  .letter-tile {
    min-height: 80px;
  }
}

@media (min-width: 1024px) {
  .letter-tile {
    min-height: 90px;
  }
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