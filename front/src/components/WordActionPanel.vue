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
          ref="wordDisplayRef"
          class="word-display futuristic-glow overflow-visible px-1 font-bold"
          :class="wordSizeClass"
          style="font-family: 'Orbitron', 'Rajdhani', 'Exo 2', monospace; line-height: 1;"
        >
          <svg ref="svgRef" class="word-svg">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </svg>
          
          <div class="word-letters">
            <span
              v-for="entry in letterEntries"
              :key="entry.id"
              :ref="el => setLetterRef(el, entry.id)"
              class="word-letter"
              :style="{ color: entry.color }"
            >
              {{ entry.char }}
            </span>
          </div>
          
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
import { computed, ref, watch, nextTick, onMounted } from 'vue';
import { gsap } from 'gsap';

type WordPreview = {
  status: 'valid' | 'used' | 'invalid' | 'pending' | string;
  label: string;
  points: number;
};

type LetterEntry = {
  id: number;
  char: string;
  color: string;
};

const props = defineProps<{
  currentWord: string;
  wordPreview: WordPreview;
  disableSubmit: boolean;
  variant?: 'solo' | 'multi';
}>();

const emit = defineEmits<{ (event: 'clear'): void; (event: 'submit'): void }>();

const letterEntries = ref<LetterEntry[]>([]);
const letterRefs = ref<Map<number, HTMLElement>>(new Map());
const wordDisplayRef = ref<HTMLElement | null>(null);
const svgRef = ref<SVGSVGElement | null>(null);
let letterCounter = 0;

const colors = [
  { main: '#FBDB4A', shades: ['#FAE073', '#FCE790', '#FADD65', '#E4C650'] },
  { main: '#F3934A', shades: ['#F7B989', '#F9CDAA', '#DD8644', '#F39C59'] },
  { main: '#EB547D', shades: ['#EE7293', '#F191AB', '#D64D72', '#C04567'] },
  { main: '#9F6AA7', shades: ['#B084B6', '#C19FC7', '#916198', '#82588A'] },
  { main: '#5476B3', shades: ['#6382B9', '#829BC7', '#4D6CA3', '#3E5782'] },
  { main: '#2BB19B', shades: ['#4DBFAD', '#73CDBF', '#27A18D', '#1F8171'] },
  { main: '#70B984', shades: ['#7FBE90', '#98CBA6', '#68A87A', '#5E976E'] }
];

const setLetterRef = (el: any, id: number) => {
  if (el) {
    letterRefs.value.set(id, el);
  }
};

const getLetterColor = (index: number): { main: string; shades: string[] } => {
  return colors[index % colors.length];
};

const createEntry = (char: string, index: number): LetterEntry => {
  return {
    id: letterCounter++,
    char,
    color: getLetterColor(index).main,
  };
};

const animateLetterIn = (element: HTMLElement, textSize: number) => {
  const yOffset = (0.5 + Math.random() * 0.5) * textSize;
  const rotation = -50 + Math.random() * 100;

  gsap.fromTo(element, 
    { scale: 0, opacity: 0, rotation: rotation },
    { 
      scale: 1, 
      opacity: 1, 
      duration: 0.4,
      ease: 'back.out(1.7)'
    }
  );

  gsap.fromTo(element,
    { y: 0 },
    {
      y: -yOffset,
      duration: 0.2,
      ease: 'power3.inOut',
      yoyo: true,
      repeat: 1
    }
  );

  gsap.to(element, {
    rotation: 0,
    duration: 0.4,
    ease: 'power3.inOut'
  });
};

const animateLetterOut = (element: HTMLElement) => {
  return gsap.to(element, {
    scale: 0,
    opacity: 0,
    duration: 0.1,
    ease: 'power2.in'
  });
};

const createSVGElement = (type: string): SVGElement => {
  return document.createElementNS('http://www.w3.org/2000/svg', type) as SVGElement;
};

const addTri = (x0: number, y0: number, shade: string, textSize: number) => {
  if (!svgRef.value) return;

  const tri = createSVGElement('polygon');
  const a = Math.random();
  const a2 = a + (-0.2 + Math.random() * 0.4);
  const r = textSize * 0.52;
  const r2 = r + textSize * Math.random() * 0.2;
  const x = x0 + r * Math.cos(2 * Math.PI * a);
  const y = y0 + r * Math.sin(2 * Math.PI * a);
  const x2 = x0 + r2 * Math.cos(2 * Math.PI * a2);
  const y2 = y0 + r2 * Math.sin(2 * Math.PI * a2);
  const triSize = textSize * 0.1;
  const scale = 0.3 + Math.random() * 0.7;
  const offset = triSize * scale;

  tri.setAttribute('points', `0,0 ${triSize * 2},0 ${triSize},${triSize * 2}`);
  tri.style.fill = shade;
  svgRef.value.appendChild(tri);

  gsap.fromTo(tri,
    {
      rotation: Math.random() * 360,
      scale: scale,
      x: x - offset,
      y: y - offset,
      opacity: 1
    },
    {
      x: x2 - offset,
      y: y2 - offset,
      opacity: 0,
      duration: 0.6,
      ease: 'power1.inOut',
      onComplete: () => {
        if (svgRef.value && tri.parentNode === svgRef.value) {
          svgRef.value.removeChild(tri);
        }
      }
    }
  );
};

const addCirc = (x0: number, y0: number, textSize: number) => {
  if (!svgRef.value) return;

  const circ = createSVGElement('circle');
  const a = Math.random();
  const r = textSize * 0.52;
  const r2 = r + textSize;
  const x = x0 + r * Math.cos(2 * Math.PI * a);
  const y = y0 + r * Math.sin(2 * Math.PI * a);
  const x2 = x0 + r2 * Math.cos(2 * Math.PI * a);
  const y2 = y0 + r2 * Math.sin(2 * Math.PI * a);
  const circSize = textSize * 0.05 * Math.random();

  circ.setAttribute('r', circSize.toString());
  circ.style.fill = '#eee';
  svgRef.value.appendChild(circ);

  gsap.fromTo(circ,
    {
      x: x - circSize,
      y: y - circSize,
      opacity: 1
    },
    {
      x: x2 - circSize,
      y: y2 - circSize,
      opacity: 0,
      duration: 0.6,
      ease: 'power1.inOut',
      onComplete: () => {
        if (svgRef.value && circ.parentNode === svgRef.value) {
          svgRef.value.removeChild(circ);
        }
      }
    }
  );
};

const addDecor = (element: HTMLElement, colorData: { main: string; shades: string[] }, textSize: number) => {
  setTimeout(() => {
    const rect = element.getBoundingClientRect();
    const parentRect = wordDisplayRef.value?.getBoundingClientRect();
    if (!parentRect) return;

    const x0 = rect.left - parentRect.left + rect.width / 2;
    const y0 = rect.top - parentRect.top + rect.height / 2;
    const shade = colorData.shades[Math.floor(Math.random() * 4)];

    for (let i = 0; i < 8; i++) addTri(x0, y0, shade, textSize);
    for (let i = 0; i < 8; i++) addCirc(x0, y0, textSize);
  }, 150);
};

const getTextSize = (): number => {
  if (!wordDisplayRef.value) return 24;
  const computedStyle = window.getComputedStyle(wordDisplayRef.value);
  return parseFloat(computedStyle.fontSize);
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
  async (newWord, oldWord) => {
    const newChars = newWord.split('');
    const oldChars = oldWord ? oldWord.split('') : [];

    // Gérer les suppressions
    for (let i = letterEntries.value.length - 1; i >= newChars.length; i--) {
      const entry = letterEntries.value[i];
      const element = letterRefs.value.get(entry.id);
      if (element) {
        await animateLetterOut(element);
      }
      letterRefs.value.delete(entry.id);
    }
    letterEntries.value = letterEntries.value.slice(0, newChars.length);

    // Gérer les ajouts et modifications
    const nextEntries: LetterEntry[] = [];
    newChars.forEach((char, index) => {
      const existing = letterEntries.value[index];
      if (existing && existing.char === char) {
        nextEntries.push(existing);
      } else {
        const newEntry = createEntry(char, index);
        nextEntries.push(newEntry);
        
        nextTick(() => {
          const element = letterRefs.value.get(newEntry.id);
          if (element) {
            const textSize = getTextSize();
            animateLetterIn(element, textSize);
            addDecor(element, getLetterColor(index), textSize);
          }
        });
      }
    });

    letterEntries.value = nextEntries;
  },
  { immediate: true }
);

onMounted(() => {
  if (svgRef.value && wordDisplayRef.value) {
    const rect = wordDisplayRef.value.getBoundingClientRect();
    svgRef.value.setAttribute('width', rect.width.toString());
    svgRef.value.setAttribute('height', rect.height.toString());
  }
});
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
  color: #ffffff;
}

.word-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.word-letters {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.06em;
  z-index: 1;
}

.word-letter {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-shadow:
    0 0 6px rgba(255, 255, 255, 0.9),
    0 0 14px currentColor,
    0 0 30px currentColor;
}

.word-placeholder {
  color: rgba(226, 232, 240, 0.6);
}
</style>