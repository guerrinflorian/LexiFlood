<template>
  <div class="flex min-h-[100dvh] flex-col bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-100">
    <div class="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      <div class="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <ScoreHeader />
        <WordHistory />
      </div>

      <div
        v-if="overflowCountdown !== null"
        class="rounded-2xl border border-[color:var(--color-accent)]/40 bg-amber-400/10 px-4 py-3 text-center text-sm font-semibold text-amber-100 shadow-md"
      >
        Rack plein : encore {{ overflowCountdown }}s pour valider un mot !
        <q-linear-progress
          v-if="overflowCountdown <= 5"
          class="mt-3"
          rounded
          size="8px"
          color="warning"
          track-color="dark"
          :value="overflowProgress"
        />
      </div>

      <div class="flex flex-col gap-3">
        <div class="rounded-2xl border border-slate-800/80 bg-[color:var(--color-surface)] p-4 shadow-lg backdrop-blur">
          <div class="flex flex-col gap-4">
            <div class="rounded-2xl border border-slate-800/70 bg-[color:var(--color-surface-strong)] px-6 py-5 text-center shadow-inner">
              <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Mot en cours</p>
              <p class="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                {{ currentWord || '—' }}
              </p>
              <div class="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span
                  class="rounded-full border px-3 py-1 text-[11px] font-semibold"
                  :class="wordPreviewClasses"
                >
                  {{ wordPreview.label }}
                </span>
                <span
                  class="rounded-full border border-slate-800/70 bg-slate-900/70 px-3 py-1 text-[11px] font-semibold text-slate-200"
                >
                  {{ wordPreview.points }} pts
                </span>
              </div>
            </div>
            <div class="flex flex-wrap justify-center gap-2">
              <q-btn
                outline
                rounded
                color="secondary"
                class="px-5"
                label="Effacer"
                @click="clearSelection"
              />
              <q-btn
                outline
                rounded
                color="accent"
                class="px-5"
                label="Quitter"
                @click="confirmQuit"
              />
              <q-btn
                unelevated
                rounded
                color="primary"
                class="px-5 text-slate-950"
                label="Valider"
                :disable="gameOver || currentWord.length === 0"
                @click="submitWord"
              />
            </div>
          </div>
        </div>

        <div v-if="gameOver" class="text-center text-xs text-rose-200">
          Partie terminée
        </div>
      </div>

    </div>

    <div class="shrink-0">
      <GameBoard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
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
  wordPreview,
  score,
  highScore
} = storeToRefs(store);
const { clearSelection, submitWord, startSolo, resetGame } = store;
const $q = useQuasar();
const dialogVisible = ref(false);

const overflowProgress = computed(() => {
  if (overflowCountdown.value === null) {
    return 0;
  }
  return Math.min(1, Math.max(0, overflowCountdown.value / 5));
});

const wordPreviewClasses = computed(() => {
  switch (wordPreview.value.status) {
    case 'valid':
      return 'border-emerald-500/60 bg-emerald-500/10 text-emerald-100';
    case 'used':
      return 'border-amber-400/60 bg-amber-400/10 text-amber-100';
    case 'invalid':
      return 'border-rose-400/60 bg-rose-400/10 text-rose-100';
    default:
      return 'border-slate-700/70 bg-slate-900/70 text-slate-400';
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
