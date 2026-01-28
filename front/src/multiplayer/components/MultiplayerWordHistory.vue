<template>
  <section
    class="flex min-h-0 flex-1 flex-col overflow-hidden p-3"
    aria-label="Historique des mots"
  >
    <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
      Historique
    </p>

    <ul
      v-if="displayHistory.length"
      class="scrollbar-thin scrollbar-track-slate-900/30 scrollbar-thumb-slate-600/40 flex-1 space-y-1.5 overflow-y-auto pr-1"
    >
      <li
        v-for="entry in displayHistory"
        :key="entry.id"
        class="flex items-center justify-between gap-2 rounded-lg border border-slate-700/50 bg-gradient-to-br from-slate-900/70 to-slate-950/60 px-2.5 py-2 transition-all hover:border-slate-600/60 hover:from-slate-800/80 hover:to-slate-900/70"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-white">{{ entry.playerName }}</p>
          <p class="text-[10px] text-slate-400">{{ entry.time }}</p>
        </div>
        <span class="text-[10px] uppercase tracking-[0.2em] text-slate-500">Mot caché</span>
        <span class="text-sm font-bold text-emerald-300" style="text-shadow: 0 0 8px rgba(110, 231, 183, 0.4)">
          +{{ entry.points }}
        </span>
      </li>
    </ul>

    <p v-else class="py-4 text-center text-xs text-slate-500">
      Aucun mot validé
    </p>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useMultiplayerStore } from '../useMultiplayerStore';

const store = useMultiplayerStore();
const { wordHistory } = storeToRefs(store);

const displayHistory = computed(() => wordHistory.value.slice(0, 15));
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-track-slate-900\/30::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.3);
  border-radius: 2px;
}

.scrollbar-thumb-slate-600\/40::-webkit-scrollbar-thumb {
  background: rgba(71, 85, 105, 0.4);
  border-radius: 2px;
}

.scrollbar-thumb-slate-600\/40::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 85, 105, 0.6);
}
</style>
