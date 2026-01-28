<template>
  <div class="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-900/70 p-4 text-sm text-slate-200 shadow-md backdrop-blur">
    <div class="rounded-full bg-slate-800/80 px-4 py-2">
      Score : <span class="font-semibold text-white">{{ score }}</span>
    </div>
    <div class="rounded-full bg-slate-800/80 px-4 py-2">
      Temps : <span class="font-semibold text-white">{{ roundTimeLeft }}s</span>
    </div>
    <div
      v-if="mode === 'multi'"
      class="rounded-full bg-slate-800/80 px-4 py-2"
    >
      Round : <span class="font-semibold text-white">{{ round }}</span>
    </div>
    <div
      v-if="mode === 'multi'"
      class="rounded-full bg-slate-800/80 px-4 py-2"
    >
      Survivants : <span class="font-semibold text-white">{{ activePlayers }}</span>
    </div>
    <div
      v-if="mode === 'solo'"
      class="rounded-full bg-slate-800/80 px-4 py-2"
    >
      High Score : <span class="font-semibold text-white">{{ highScore }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/useGameStore';

const store = useGameStore();
const { score, roundTimeLeft, round, mode, players, highScore } = storeToRefs(store);

const activePlayers = computed(() => players.value.filter((player) => !player.eliminated).length);
</script>
