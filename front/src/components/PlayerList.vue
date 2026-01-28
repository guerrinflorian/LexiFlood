<template>
  <div class="rounded-2xl bg-slate-900/70 p-4 text-sm text-slate-200 shadow-md backdrop-blur">
    <div class="mb-3 flex items-center justify-between">
      <span class="text-base font-semibold text-white">Classement</span>
      <span class="text-xs text-slate-400">{{ players.length }} joueurs</span>
    </div>
    <div class="space-y-2">
      <div
        v-for="player in orderedPlayers"
        :key="player.id"
        class="flex items-center justify-between rounded-xl border border-transparent px-3 py-2"
        :class="player.eliminated
          ? 'border-rose-500/30 bg-rose-500/10 text-rose-200 line-through'
          : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'"
      >
        <div class="flex items-center gap-2">
          <span class="font-semibold">{{ player.name }}</span>
          <span v-if="player.id === 'you'" class="text-[10px] uppercase tracking-wide text-amber-300">
            Vous
          </span>
        </div>
        <div class="font-semibold">{{ player.score }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/useGameStore';

const store = useGameStore();
const { players } = storeToRefs(store);

const orderedPlayers = computed(() => [...players.value].sort((a, b) => b.score - a.score));
</script>
