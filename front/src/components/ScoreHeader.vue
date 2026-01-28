<template>
  <div
    class="relative flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800/80 bg-[color:var(--color-surface)] p-4 pr-24 text-sm text-slate-200 shadow-md backdrop-blur"
  >
    <div class="rounded-full border border-slate-800/80 bg-slate-900/70 px-4 py-2">
      Meilleur score : <span class="font-semibold text-white">{{ highScore }}</span>
    </div>
    <div class="rounded-full border border-slate-800/80 bg-slate-900/70 px-4 py-2">
      Partie en cours
    </div>
    <div
      class="absolute right-4 top-4 flex h-16 w-16 flex-col items-center justify-center rounded-full border border-[color:var(--color-primary)]/60 bg-slate-950/80 text-center shadow-lg"
    >
      <span class="text-[10px] uppercase tracking-[0.25em] text-slate-400">Score</span>
      <span class="text-lg font-semibold text-[color:var(--color-primary)]">{{ score }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/useGameStore';

const store = useGameStore();
const { score, highScore } = storeToRefs(store);
</script>
