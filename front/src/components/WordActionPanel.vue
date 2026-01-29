<template>
  <div class="word-action-panel flex w-full max-w-4xl flex-nowrap items-center justify-center gap-1.5 p-2 sm:gap-3 sm:p-3 md:gap-4 md:p-4" :class="variantClass">
    <q-btn
      outline
      round
      color="secondary"
      class="!h-10 !w-10 flex-shrink-0 sm:!h-12 sm:!w-12 md:!h-14 md:!w-14 lg:!h-16 lg:!w-16"
      icon="backspace"
      size="14px"
      @click="emit('clear')"
    >
      <q-tooltip class="text-xs">Effacer</q-tooltip>
    </q-btn>

    <div class="futuristic-inner min-w-0 flex-1 overflow-hidden p-2 text-center sm:p-3 md:p-4 lg:p-6">
      <p class="mb-1 text-[7px] font-bold uppercase tracking-[0.1em] text-slate-400 sm:text-[8px] md:mb-1.5 md:text-[9px] lg:text-[10px] lg:tracking-[0.3em]">Mot en cours</p>

      <div class="flex h-8 items-center justify-center sm:h-10 md:h-12 lg:h-16">
        <p
          class="futuristic-glow overflow-hidden px-1 font-bold text-white"
          :class="wordSizeClass"
          style="font-family: 'Orbitron', 'Rajdhani', 'Exo 2', monospace; line-height: 1;"
        >
          {{ currentWord || '—' }}
        </p>
      </div>

      <div class="mt-1 flex flex-nowrap items-center justify-center gap-1 md:mt-1.5">
        <span class="whitespace-nowrap rounded-full px-1.5 py-0.5 text-[8px] font-bold transition-all sm:text-[9px] md:px-2 md:text-[10px] lg:px-3 lg:text-xs" :class="wordPreviewClasses">
          {{ wordPreview.label }}
        </span>
        <span class="whitespace-nowrap rounded-full border border-slate-700/70 bg-slate-900/70 px-1.5 py-0.5 text-[8px] font-bold text-slate-200 sm:text-[9px] md:px-2 md:text-[10px] lg:px-3 lg:text-xs">
          {{ wordPreview.points }}p
        </span>
      </div>
    </div>

    <q-btn
      unelevated
      round
      color="primary"
      class="futuristic-btn !h-10 !w-10 flex-shrink-0 text-slate-950 sm:!h-12 sm:!w-12 md:!h-14 md:!w-14 lg:!h-16 lg:!w-16"
      icon="check_circle"
      size="14px"
      :disable="disableSubmit"
      @click="emit('submit')"
    >
      <q-tooltip class="text-xs">Valider</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type WordPreview = {
  status: 'valid' | 'used' | 'invalid' | 'pending' | string;
  label: string;
  points: number;
};

const props = defineProps<{
  currentWord: string;
  wordPreview: WordPreview;
  disableSubmit: boolean;
  variant?: 'solo' | 'multi';
}>();

const emit = defineEmits<{ (event: 'clear'): void; (event: 'submit'): void }>();

const wordPreviewClasses = computed(() => {
  switch (props.wordPreview.status) {
    case 'valid':
      return 'border border-emerald-500/60 bg-emerald-500/20 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    case 'used':
      return 'border border-amber-400/60 bg-amber-400/20 text-amber-100 shadow-[0_0_15px_rgba(251,191,36,0.2)]';
    case 'invalid':
      return 'border border-rose-400/60 bg-rose-400/20 text-rose-100 shadow-[0_0_15px_rgba(251,113,133,0.2)]';
    default:
      return 'border border-slate-700/70 bg-slate-900/70 text-slate-400';
  }
});

const wordSizeClass = computed(() => {
  const wordLength = props.currentWord.length;
  
  // Taille dynamique selon la longueur du mot - paliers plus doux
  if (wordLength === 0) return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl';
  if (wordLength <= 6) return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl';
  if (wordLength <= 8) return 'text-lg sm:text-xl md:text-2xl lg:text-3xl';
  if (wordLength <= 10) return 'text-base sm:text-lg md:text-xl lg:text-2xl';
  if (wordLength <= 11) return 'text-sm sm:text-base md:text-lg lg:text-xl';
  if (wordLength <= 12) return 'text-xs sm:text-sm md:text-base lg:text-lg';
  return 'text-[11px] sm:text-xs md:text-sm lg:text-base';
});

const variantClass = computed(() => props.variant ?? 'solo');
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@700&family=Exo+2:wght@700&display=swap');

.futuristic-inner {
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%);
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
}

.futuristic-glow {
  text-shadow: 0 2px 10px rgba(139, 92, 246, 0.3);
}

.futuristic-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow:
    0 4px 6px -1px rgba(59, 130, 246, 0.3),
    0 2px 4px -1px rgba(59, 130, 246, 0.2);
  transition: all 0.2s ease;
}

.word-action-panel.solo .futuristic-btn:hover:not(:disabled) {
  box-shadow:
    0 10px 15px -3px rgba(59, 130, 246, 0.4),
    0 4px 6px -2px rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.word-action-panel.multi .futuristic-btn:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.03);
  box-shadow:
    0 8px 15px -1px rgba(59, 130, 246, 0.35),
    0 4px 6px -1px rgba(59, 130, 246, 0.25);
}

.futuristic-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>