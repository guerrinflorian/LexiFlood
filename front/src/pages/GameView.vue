<template>
  <div class="relative flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <GameBackground :image="backgroundGame" />

    <!-- Header fixe en haut -->
    <div class="relative z-10 px-3 pt-3 md:px-4 md:pt-4">
      <ScoreHeader @quit="confirmQuit" />
    </div>

    <!-- Contenu principal : Layout flexible selon la taille d'écran -->
    <div class="relative z-10 flex flex-1 flex-col gap-3 overflow-hidden px-3 py-3 md:grid md:grid-cols-[300px_minmax(0,1fr)_300px] md:px-4 lg:grid-cols-[340px_minmax(0,1fr)_340px]">
      <div class="hidden md:block md:col-start-1" aria-hidden="true"></div>
      
      <!-- Colonne principale : Mot + Actions -->
      <div class="flex min-h-0 flex-col items-center justify-center gap-3 overflow-y-auto scrollbar-thin scrollbar-track-slate-950/50 scrollbar-thumb-slate-700/50 md:col-start-2">
        <!-- Zone du mot en cours avec boutons de chaque côté -->
        <WordActionPanel
          :current-word="currentWord"
          :word-preview="wordPreview"
          :disable-submit="gameOver || currentWord.length === 0"
          variant="solo"
          @clear="clearSelection"
          @submit="submitWord"
        />
      </div>

      <!-- Historique : Toujours visible, adapté selon la taille -->
      <div class="flex min-h-0 md:col-start-3 md:min-h-full">
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
import { ref, watch } from 'vue';
import backgroundGame from '../assets/background_game.png';
import GameBackground from '../components/GameBackground.vue';
import GameBoard from '../components/GameBoard.vue';
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
  highScore
} = storeToRefs(store);
const { clearSelection, submitWord, startSolo, resetGame } = store;
const $q = useQuasar();
const dialogVisible = ref(false);

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

</style>
