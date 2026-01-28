<template>
  <div class="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-100">
    <WordHistory />
    <!-- Contenu principal avec padding bottom pour la grille fixe -->
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 pb-48 sm:pb-56">
      <ScoreHeader />

      <div
        v-if="overflowCountdown !== null"
        class="rounded-2xl border border-amber-400/50 bg-amber-400/10 px-4 py-3 text-center text-base font-semibold text-amber-200 shadow-md"
      >
        Rack plein : encore {{ overflowCountdown }}s pour valider un mot !
      </div>

      <div class="flex flex-col gap-4">
        <!-- Zone de contrôle -->
        <div class="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-lg backdrop-blur">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-400">Mot en cours</p>
              <p class="text-lg font-semibold text-white sm:text-xl">
                {{ currentWord || '—' }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-xl border border-slate-700/70 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                @click="clearSelection"
              >
                Effacer
              </button>
              <button
                type="button"
                class="rounded-xl border border-slate-700/70 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                @click="confirmQuit"
              >
                Quitter
              </button>
              <button
                type="button"
                class="rounded-xl bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-400/20 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
                :disabled="gameOver || currentWord.length === 0 || hasSubmittedThisRound"
                @click="submitWord"
              >
                Valider
              </button>
            </div>
          </div>
          <p class="text-xs text-slate-400">
            Limite : un seul mot validé par round.
          </p>
        </div>

        <div v-if="gameOver" class="text-center text-sm text-rose-200">
          Partie terminée
        </div>
      </div>

      <div class="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 text-xs text-slate-400">
        Astuce : choisissez rapidement vos lettres pour éviter que la grille ne se remplisse.
      </div>
    </div>

    <!-- Grille de lettres fixée en bas -->
    <GameBoard />
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
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
  overflowCountdown,
  hasSubmittedThisRound,
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
    ok: { label: 'Rejouer', color: 'primary' },
    cancel: { label: "Retour à l'accueil", color: 'secondary' },
    noFocus: true,
    noRefocus: true,
    persistent: true
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
    ok: { label: 'Quitter', color: 'negative' },
    cancel: { label: 'Continuer', color: 'secondary' },
    noFocus: true,
    noRefocus: true
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
