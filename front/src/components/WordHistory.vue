<template>
  <section
    class="fixed left-4 top-4 z-20 w-64 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 text-xs text-slate-200 shadow-lg backdrop-blur"
    aria-label="Historique des mots"
  >
    <p class="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
      Historique
    </p>
    <ul v-if="wordHistory.length" class="space-y-2">
      <li
        v-for="entry in wordHistory"
        :key="entry.id"
        class="flex items-start justify-between gap-2 rounded-lg bg-slate-900/70 px-3 py-2"
      >
        <div>
          <p class="text-sm font-semibold text-white">{{ entry.word }}</p>
          <p class="text-[11px] text-slate-400">{{ entry.time }}</p>
        </div>
        <span class="text-sm font-semibold text-emerald-200">+{{ entry.points }}</span>
      </li>
    </ul>
    <p v-else class="text-[11px] text-slate-500">
      Aucun mot validé pour le moment.
    </p>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/useGameStore';

const store = useGameStore();
const { wordHistory } = storeToRefs(store);
</script>
