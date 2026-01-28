<template>
  <section
    class="flex h-48 flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-[color:var(--color-surface)] p-4 text-xs text-slate-200 shadow-lg backdrop-blur"
    aria-label="Historique des mots"
  >
    <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
      Historique
    </p>
    <ul v-if="displayHistory.length" class="flex-1 space-y-2 overflow-y-auto pr-1">
      <li
        v-for="entry in displayHistory"
        :key="entry.id"
        class="flex items-start justify-between gap-2 rounded-lg border border-slate-800/60 bg-slate-900/70 px-3 py-2"
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
import { computed } from 'vue';
import { useGameStore } from '../stores/useGameStore';

const store = useGameStore();
const { wordHistory } = storeToRefs(store);

const displayHistory = computed(() => wordHistory.value.slice(0, 6));
</script>
