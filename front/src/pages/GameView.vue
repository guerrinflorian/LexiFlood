<template>
  <div class="min-h-[100dvh] bg-slate-950 px-4 py-4 text-slate-100">
    <div class="mx-auto flex w-full max-w-6xl flex min-h-[100dvh] flex-col gap-4 pb-6">
      <ScoreHeader />

      <div
        v-if="roundBanner"
        class="rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-center text-base font-semibold text-cyan-200 shadow-md"
      >
        {{ roundBanner }}
      </div>

      <div class="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="flex flex-col gap-4">
          <div class="rounded-2xl bg-slate-900/70 p-4 shadow-lg backdrop-blur">
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
                  class="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
                  @click="clearSelection"
                >
                  Effacer
                </button>
                <button
                  type="button"
                  class="rounded-xl bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700"
                  :disabled="gameOver || currentWord.length === 0"
                  @click="submitWord"
                >
                  Valider
                </button>
              </div>
            </div>
            <div class="mt-2 flex flex-1 items-end">
              <GameBoard />
            </div>
          </div>

          <div
            v-if="lastValidation"
            class="rounded-2xl border px-4 py-3 text-sm"
            :class="lastValidationStatus === 'success'
              ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
              : 'border-rose-400/40 bg-rose-400/10 text-rose-200'"
          >
            {{ lastValidation }}
          </div>

          <div
            v-if="gameOver"
            class="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-center text-base font-semibold text-rose-200 sm:text-lg"
          >
            Partie terminée
          </div>
        </div>

        <div class="lg:sticky lg:top-6">
          <PlayerList v-if="mode === 'multi'" />
        </div>
      </div>

      <div v-if="mode === 'solo'" class="rounded-2xl bg-slate-900/70 p-4 text-xs text-slate-400">
        Astuce : choisissez rapidement vos lettres pour éviter que la grille ne se remplisse.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import GameBoard from '../components/GameBoard.vue';
import PlayerList from '../components/PlayerList.vue';
import ScoreHeader from '../components/ScoreHeader.vue';
import { useGameStore } from '../stores/useGameStore';

const store = useGameStore();
const { currentWord, lastValidation, lastValidationStatus, gameOver, mode, roundBanner } =
  storeToRefs(store);
const { clearSelection, submitWord } = store;
</script>
