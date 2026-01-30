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
        <div
          class="word-display futuristic-glow overflow-hidden px-1 font-bold"
          :class="wordSizeClass"
          style="font-family: 'Orbitron', 'Rajdhani', 'Exo 2', monospace; line-height: 1;"
        >
          <TransitionGroup name="word-letter" tag="div" class="word-letters">
            <span
              v-for="entry in letterEntries"
              :key="entry.id"
              class="word-letter"
              :style="entry.style"
            >
              <span class="word-letter-char">{{ entry.char }}</span>
              <span v-if="entry.burstItems.length" class="word-burst" aria-hidden="true">
                <span
                  v-for="item in entry.burstItems"
                  :key="item.id"
                  class="word-burst-item"
                  :class="item.type === 'tri' ? 'word-burst-tri' : 'word-burst-dot'"
                  :style="item.style"
                ></span>
              </span>
            </span>
          </TransitionGroup>
          <span v-if="!letterEntries.length" class="word-placeholder">—</span>
        </div>
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
import { computed, ref, watch } from 'vue';

type WordPreview = {
  status: 'valid' | 'used' | 'invalid' | 'pending' | string;
  label: string;
  points: number;
};

type BurstItem = {
  id: number;
  type: 'tri' | 'dot';
  style: Record<string, string>;
};

type LetterEntry = {
  id: number;
  char: string;
  style: Record<string, string>;
  burstItems: BurstItem[];
};

const props = defineProps<{
  currentWord: string;
  wordPreview: WordPreview;
  disableSubmit: boolean;
  variant?: 'solo' | 'multi';
}>();

const emit = defineEmits<{ (event: 'clear'): void; (event: 'submit'): void }>();

const letterEntries = ref<LetterEntry[]>([]);
let letterCounter = 0;
let burstCounter = 0;

const letterColor = (char: string) => {
  const index = char.charCodeAt(0) % 4;
  return ['var(--neon-cyan)', 'var(--neon-magenta)', 'var(--neon-yellow)', 'var(--neon-green)'][index];
};

const createBurstItems = () =>
  Array.from({ length: 16 }, (_, index) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 18 + Math.random() * 18;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const scale = 0.4 + Math.random() * 0.8;
    const rotation = Math.random() * 360;
    return {
      id: burstCounter++,
      type: index % 2 === 0 ? 'tri' : 'dot',
      style: {
        '--burst-x': `${x}px`,
        '--burst-y': `${y}px`,
        '--burst-scale': `${scale}`,
        '--burst-rotate': `${rotation}deg`,
      },
    };
  });

const createEntry = (char: string): LetterEntry => {
  const rotation = -50 + Math.random() * 100;
  const bounce = 10 + Math.random() * 12;
  return {
    id: letterCounter++,
    char,
    style: {
      '--letter-rotation': `${rotation}deg`,
      '--letter-bounce': `${bounce}px`,
      '--letter-color': letterColor(char),
    },
    burstItems: createBurstItems(),
  };
};

const scheduleBurstClear = (entryId: number) => {
  window.setTimeout(() => {
    const index = letterEntries.value.findIndex((entry) => entry.id === entryId);
    if (index === -1) {
      return;
    }
    const updated = [...letterEntries.value];
    updated[index] = { ...updated[index], burstItems: [] };
    letterEntries.value = updated;
  }, 650);
};

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

watch(
  () => props.currentWord,
  (word) => {
    const chars = word.split('');
    const previousEntries = letterEntries.value;
    const nextEntries: LetterEntry[] = [];

    chars.forEach((char, index) => {
      const previous = previousEntries[index];
      if (previous && previous.char === char) {
        nextEntries.push(previous);
        return;
      }
      const entry = createEntry(char);
      nextEntries.push(entry);
      scheduleBurstClear(entry.id);
    });

    letterEntries.value = nextEntries;
  },
  { immediate: true }
);
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

.word-display {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.08em;
  color: #ffffff;
}

.word-letters {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.06em;
}

.word-letter {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--letter-color, #ffffff);
  text-shadow:
    0 0 6px rgba(255, 255, 255, 0.9),
    0 0 14px currentColor,
    0 0 30px currentColor;
}

.word-letter-char {
  position: relative;
  z-index: 1;
}

.word-placeholder {
  color: rgba(226, 232, 240, 0.6);
}

.word-letter-enter-active {
  animation: word-letter-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.word-letter-leave-active {
  animation: word-letter-out 0.12s ease-in forwards;
}

.word-burst {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.word-burst-item {
  position: absolute;
  top: 50%;
  left: 50%;
  width: clamp(4px, 0.8vw, 8px);
  height: clamp(4px, 0.8vw, 8px);
  background: var(--letter-color, rgba(255, 255, 255, 0.85));
  transform: translate(-50%, -50%) scale(var(--burst-scale)) rotate(var(--burst-rotate));
  animation: word-burst-out 0.6s ease-in-out forwards;
}

.word-burst-dot {
  border-radius: 999px;
  background: #f8fafc;
}

.word-burst-tri {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

@keyframes word-letter-in {
  0% {
    transform: translateY(0) scale(0) rotate(var(--letter-rotation, 0deg));
    opacity: 0;
  }
  50% {
    transform: translateY(calc(-1 * var(--letter-bounce, 12px))) scale(1.05) rotate(var(--letter-rotation, 0deg));
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes word-letter-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

@keyframes word-burst-out {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(var(--burst-scale)) rotate(var(--burst-rotate));
  }
  100% {
    opacity: 0;
    transform:
      translate(calc(-50% + var(--burst-x)), calc(-50% + var(--burst-y)))
      scale(0)
      rotate(calc(var(--burst-rotate) + 90deg));
  }
}
</style>
