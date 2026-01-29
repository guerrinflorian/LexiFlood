<template>
  <div class="word-action-panel flex w-full max-w-4xl items-center justify-center gap-4 p-4" :class="variantClass">
    <q-btn
      outline
      round
      color="secondary"
      class="!h-14 !w-14 md:!h-16 md:!w-16"
      icon="backspace"
      size="18px"
      @click="emit('clear')"
    >
      <q-tooltip class="text-xs">Effacer</q-tooltip>
    </q-btn>

    <div class="futuristic-inner flex-1 space-y-3 p-6 text-center md:p-8">
      <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Mot en cours</p>

      <p
        class="futuristic-glow flex min-h-[3rem] items-center justify-center text-4xl font-bold tracking-wide text-white md:min-h-[3.5rem] md:text-5xl"
        style="font-family: 'Orbitron', 'Rajdhani', 'Exo 2', monospace;"
      >
        {{ currentWord || '—' }}
      </p>

      <div class="flex flex-wrap items-center justify-center gap-2">
        <span class="rounded-full px-3 py-1 text-xs font-bold transition-all" :class="wordPreviewClasses">
          {{ wordPreview.label }}
        </span>
        <span class="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs font-bold text-slate-200">
          {{ wordPreview.points }} pts
        </span>
      </div>
    </div>

    <q-btn
      unelevated
      round
      color="primary"
      class="futuristic-btn !h-14 !w-14 text-slate-950 md:!h-16 md:!w-16"
      icon="check_circle"
      size="18px"
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
  status: 'valid' | 'used' | 'invalid' | string;
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
