<template>
  <div class="relative flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
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
      <ScoreHeader @quit="confirmQuit" />
    </div>

    <!-- Contenu principal : Layout flexible selon la taille d'écran -->
    <div class="relative z-10 flex flex-1 flex-col gap-3 overflow-hidden px-3 py-3 md:grid md:grid-cols-[300px_minmax(0,1fr)_300px] md:px-4 lg:grid-cols-[340px_minmax(0,1fr)_340px]">
      <div class="hidden md:block md:col-start-1" aria-hidden="true"></div>
      
      <!-- Colonne principale : Mot + Actions -->
      <div class="flex min-h-0 flex-col items-center justify-center gap-3 md:overflow-y-auto md:scrollbar-thin md:scrollbar-track-slate-950/50 md:scrollbar-thumb-slate-700/50 md:col-start-2">
        <!-- Zone du mot en cours avec boutons de chaque côté -->
        <div class="flex w-full max-w-4xl items-center justify-center gap-4 p-4">
          <!-- Bouton Effacer à gauche -->
          <q-btn
            outline
            round
            color="secondary"
            class="!h-14 !w-14 md:!h-16 md:!w-16"
            icon="backspace"
            size="18px"
            @click="clearSelection"
          >
            <q-tooltip class="text-xs">Effacer</q-tooltip>
          </q-btn>

          <!-- Mot en cours au centre -->
          <div class="futuristic-inner flex-1 space-y-3 p-6 text-center md:p-8">
            <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Mot en cours</p>
            
            <p class="futuristic-glow flex min-h-[3rem] items-center justify-center text-4xl font-bold tracking-wide text-white md:min-h-[3.5rem] md:text-5xl" style="font-family: 'Orbitron', 'Rajdhani', 'Exo 2', monospace;">
              {{ currentWord || '—' }}
            </p>
            
            <div class="flex flex-wrap items-center justify-center gap-2">
              <span
                class="rounded-full px-3 py-1 text-xs font-bold transition-all"
                :class="wordPreviewClasses"
              >
                {{ wordPreview.label }}
              </span>
              <span class="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs font-bold text-slate-200">
                {{ wordPreview.points }} pts
              </span>
            </div>
          </div>

          <!-- Bouton Valider à droite -->
          <q-btn
            unelevated
            round
            color="primary"
            class="futuristic-btn !h-14 !w-14 text-slate-950 md:!h-16 md:!w-16"
            icon="check_circle"
            size="18px"
            :disable="gameOver || currentWord.length === 0"
            @click="submitWord"
          >
            <q-tooltip class="text-xs">Valider</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Historique : hauteur fixe sur mobile, pleine hauteur sur desktop -->
      <div class="flex h-48 min-h-0 flex-shrink-0 md:h-auto md:flex-1 md:col-start-3">
        <WordHistory />
      </div>
    </div>

    <!-- GameBoard fixé en bas -->
    <div class="relative z-10 border-t border-slate-800/50 bg-gradient-to-t from-slate-950/98 via-slate-950/95 to-transparent px-3 pb-4 pt-3 backdrop-blur-md md:px-4 md:pb-5">
      <GameBoard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import backgroundGame from '../assets/background_game.png';
import GameBoard from '../components/GameBoard.vue';
import ScoreHeader from '../components/ScoreHeader.vue';
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
  highScore
} = storeToRefs(store);
const { clearSelection, submitWord, startSolo, resetGame } = store;
const $q = useQuasar();
const dialogVisible = ref(false);

const wordPreviewClasses = computed(() => {
  switch (wordPreview.value.status) {
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

watch(gameOver, (value) => {
  if (value) {
    showGameOverDialog();
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

/* Cartes futuristes */
.futuristic-inner {
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%);
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Effet lumineux futuriste */
.futuristic-glow {
  text-shadow: 0 2px 10px rgba(139, 92, 246, 0.3);
}

/* Bouton futuriste */
.futuristic-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 
    0 4px 6px -1px rgba(59, 130, 246, 0.3),
    0 2px 4px -1px rgba(59, 130, 246, 0.2);
  transition: all 0.2s ease;
}

.futuristic-btn:hover:not(:disabled) {
  box-shadow: 
    0 10px 15px -3px rgba(59, 130, 246, 0.4),
    0 4px 6px -2px rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.futuristic-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>