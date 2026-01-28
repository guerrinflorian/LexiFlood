<template>
  <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 text-sm text-slate-200 shadow-md backdrop-blur">
    <div class="rounded-full bg-slate-800/80 px-4 py-2">
      Score : <span class="font-semibold text-white">{{ score }}</span>
    </div>
    <div
      class="rounded-full bg-slate-800/80 px-4 py-2"
    >
      Round : <span class="font-semibold text-white">{{ round }}</span>
    </div>
    <div
      class="rounded-full bg-slate-800/80 px-4 py-2"
    >
      High Score : <span class="font-semibold text-white">{{ highScore }}</span>
    </div>
    <div
      class="rounded-full bg-slate-800/80 px-4 py-2"
      :class="hasSubmittedThisRound ? 'text-amber-200' : 'text-emerald-200'"
    >
      {{ hasSubmittedThisRound ? 'Mot joué' : 'Mot disponible' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/useGameStore';

const store = useGameStore();
const { score, round, highScore, hasSubmittedThisRound } = storeToRefs(store);
</script>
