<template>
  <div class="relative flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <transition name="multiplier-pop">
      <div
        v-if="multiplierPopupVisible"
        class="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
        aria-hidden="true"
      >
        <div class="rounded-3xl border border-orange-300/30 bg-slate-950/30 px-8 py-5 text-center shadow-[0_0_40px_rgba(251,146,60,0.35)] backdrop-blur-sm">
          <p class="text-[10px] font-bold uppercase tracking-[0.35em] text-orange-200/80">Multiplicateur</p>
          <p class="mt-1 text-5xl font-black text-orange-200 drop-shadow-[0_0_18px_rgba(251,146,60,0.45)] sm:text-6xl">
            x{{ multiplierPopupLabel }}
          </p>
        </div>
      </div>
    </transition>
    <div
      class="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-30"
      :style="{ backgroundImage: `url(${backgroundGame})` }"
      aria-hidden="true"
    ></div>
    <!-- Effet de fond futuriste -->
    <div class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent"></div>
    <div class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>

    <!-- Header fixe en haut -->
    <div class="relative z-10 px-3 pt-3 md:px-4 md:pt-4">
      <ScoreHeader @quit="confirmQuit" @pause="openPauseDialog" />
    </div>

    <!-- Contenu principal : Layout flexible selon la taille d'écran -->
    <div class="relative z-10 flex flex-1 flex-col gap-3 overflow-hidden px-3 py-3 md:grid md:grid-cols-[300px_minmax(0,1fr)_300px] md:px-4 lg:grid-cols-[340px_minmax(0,1fr)_340px]">
      <div class="hidden md:block md:col-start-1" aria-hidden="true"></div>
      
      <!-- Colonne principale : Mot + Actions -->
      <div class="flex min-h-0 flex-col items-center justify-center gap-3 md:overflow-y-auto md:scrollbar-thin md:scrollbar-track-slate-950/50 md:scrollbar-thumb-slate-700/50 md:col-start-2">
        <!-- Utilisation du composant WordActionPanel -->
        <WordActionPanel
          :current-word="currentWord"
          :word-preview="wordPreview"
          :disable-submit="gameOver || currentWord.length === 0"
          variant="solo"
          @clear="clearSelection"
          @submit="submitWord"
        />
      </div>

      <!-- Historique : hauteur fixe sur mobile, pleine hauteur sur desktop -->
      <div class="flex h-48 min-h-0 flex-shrink-0 md:h-auto md:flex-1 md:col-start-3">
        <WordHistory />
      </div>
    </div>

    <!-- GameBoard fixé en bas -->
    <div class="relative z-10 border-t border-slate-800/50 bg-gradient-to-t from-slate-950/98 via-slate-950/95 to-transparent px-3 pb-4 pt-3 backdrop-blur-md md:px-4 md:pb-5">
      <div class="flex items-end gap-2 md:gap-3">
        <ScoreMultiplierGauge :multiplier="scoreMultiplier" />
        <div class="flex-1">
          <GameBoard />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import backgroundGame from '../assets/background_game.png';
import GameBoard from '../components/GameBoard.vue';
import ScoreMultiplierGauge from '../components/ScoreMultiplierGauge.vue';
import ScoreHeader from '../components/ScoreHeader.vue';
import WordActionPanel from '../components/WordActionPanel.vue';
import WordHistory from '../components/WordHistory.vue';
import { useGameStore } from '../stores/useGameStore';

const emit = defineEmits<{ (event: 'quit'): void }>();

const store = useGameStore();
const {
  currentWord,
  lastValidation,
  gameOver,
  wordPreview,
  score,
  highScore,
  pauseEndsAt,
  scoreMultiplier
} = storeToRefs(store);
const { clearSelection, submitWord, startSolo, resetGame, pauseGame, resumeGame, selectLetterFromKeyboard, removeLastSelectedLetter } = store;
const $q = useQuasar();
const dialogVisible = ref(false);
const pauseDialogVisible = ref(false);
let pauseCountdownInterval: ReturnType<typeof setInterval> | null = null;
const multiplierPopupVisible = ref(false);
const multiplierPopupValue = ref(1);
let multiplierPopupTimeout: ReturnType<typeof setTimeout> | null = null;

const multiplierPopupLabel = computed(() => {
  const raw = multiplierPopupValue.value.toFixed(2);
  return raw.replace(/\.?0+$/, '');
});

const handleKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
    return;
  }
  if (event.key === 'Backspace') {
    event.preventDefault();
    removeLastSelectedLetter();
    return;
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    submitWord();
    return;
  }
  if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
    event.preventDefault();
    selectLetterFromKeyboard(event.key);
  }
};

const showGameOverDialog = () => {
  if (dialogVisible.value) {
    return;
  }
  dialogVisible.value = true;
  $q.dialog({
    title: 'Défaite',
    message: `${lastValidation.value ?? 'Partie terminée.'}\nScore : ${score.value}\nMeilleur score : ${highScore.value}`,
    ok: { label: 'Rejouer', color: 'primary', unelevated: true, rounded: true },
    cancel: { label: "Retour à l'accueil", color: 'secondary', outline: true, rounded: true },
    dark: true,
    noFocus: true,
    noRefocus: true,
    persistent: true,
    class: 'lexi-dialog'
  })
    .onOk(() => {
      dialogVisible.value = false;
      startSolo();
    })
    .onCancel(() => {
      dialogVisible.value = false;
      resetGame();
      emit('quit');
    });
};

const confirmQuit = () => {
  $q.dialog({
    title: 'Quitter la partie ?',
    message: 'Votre progression sera perdue.',
    ok: { label: 'Quitter', color: 'negative', unelevated: true, rounded: true },
    cancel: { label: 'Continuer', color: 'secondary', outline: true, rounded: true },
    dark: true,
    noFocus: true,
    noRefocus: true,
    class: 'lexi-dialog'
  }).onOk(() => {
    resetGame();
    emit('quit');
  });
};

const openPauseDialog = () => {
  if (pauseDialogVisible.value || gameOver.value) {
    return;
  }
  const didPause = pauseGame();
  if (!didPause) {
    return;
  }
  pauseDialogVisible.value = true;
  const dialog = $q.dialog({
    title: 'Partie en pause',
    message: 'Reprise automatique dans 10s.',
    ok: { label: 'Reprendre', color: 'primary', unelevated: true, rounded: true },
    dark: true,
    noFocus: true,
    noRefocus: true,
    persistent: true,
    class: 'lexi-dialog'
  });
  const clearPauseCountdown = () => {
    if (pauseCountdownInterval) {
      clearInterval(pauseCountdownInterval);
      pauseCountdownInterval = null;
    }
  };
  const finalizeResume = () => {
    if (!pauseDialogVisible.value) {
      return;
    }
    pauseDialogVisible.value = false;
    clearPauseCountdown();
    resumeGame();
  };
  const updateCountdown = () => {
    const remaining = pauseEndsAt.value
      ? Math.max(0, Math.ceil((pauseEndsAt.value - Date.now()) / 1000))
      : 0;
    dialog.update({ message: `Reprise automatique dans ${remaining}s.` });
    if (remaining <= 0) {
      dialog.hide();
      finalizeResume();
    }
  };
  pauseCountdownInterval = setInterval(updateCountdown, 250);
  updateCountdown();
  dialog.onOk(() => {
    dialog.hide();
    finalizeResume();
  });
};

watch(gameOver, (value) => {
  if (value) {
    showGameOverDialog();
  }
});

watch(
  scoreMultiplier,
  (next, prev) => {
    if (typeof prev !== 'number' || typeof next !== 'number') {
      return;
    }
    if (next <= prev) {
      return;
    }
    multiplierPopupValue.value = next;
    multiplierPopupVisible.value = true;
    if (multiplierPopupTimeout) {
      clearTimeout(multiplierPopupTimeout);
      multiplierPopupTimeout = null;
    }
    multiplierPopupTimeout = setTimeout(() => {
      multiplierPopupVisible.value = false;
      multiplierPopupTimeout = null;
    }, 1500);
  },
  { flush: 'post' }
);

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (pauseCountdownInterval) {
    clearInterval(pauseCountdownInterval);
    pauseCountdownInterval = null;
  }
  if (multiplierPopupTimeout) {
    clearTimeout(multiplierPopupTimeout);
    multiplierPopupTimeout = null;
  }
});
</script>

<style scoped>
/* Import Google Fonts pour le mot en cours */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@700&family=Exo+2:wght@700&display=swap');

/* Scrollbar personnalisée */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-track-slate-950\/50::-webkit-scrollbar-track {
  background: rgba(2, 6, 23, 0.5);
  border-radius: 3px;
}

.scrollbar-thumb-slate-700\/50::-webkit-scrollbar-thumb {
  background: rgba(51, 65, 85, 0.5);
  border-radius: 3px;
}

.scrollbar-thumb-slate-700\/50::-webkit-scrollbar-thumb:hover {
  background: rgba(51, 65, 85, 0.7);
}

.multiplier-pop-enter-active,
.multiplier-pop-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.multiplier-pop-enter-from,
.multiplier-pop-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
