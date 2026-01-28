<template>
  <div class="flex flex-wrap items-center gap-4 text-sm sm:text-base">
    <div class="rounded-full bg-slate-800 px-4 py-2">
      Pseudo : <span class="font-semibold">{{ playerName }}</span>
    </div>
    <div class="rounded-full bg-slate-800 px-4 py-2">Score : <span class="font-semibold">{{ score }}</span></div>
    <div
      v-if="mode === 'solo'"
      class="rounded-full bg-slate-800 px-4 py-2"
    >
      High Score : <span class="font-semibold">{{ highScore }}</span>
    </div>
    <div
      v-if="mode === 'multi'"
      class="rounded-full bg-slate-800 px-4 py-2"
    >
      Round {{ round }} · {{ activePlayers }} survivants
    </div>
    <div
      v-if="mode === 'multi'"
      class="rounded-full bg-slate-800 px-4 py-2"
    >
      Temps : {{ roundTimeLeft }}s
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useGameStore } from '../stores/useGameStore';

const store = useGameStore();
const { score, highScore, mode, round, roundTimeLeft, players, playerName } = storeToRefs(store);

const activePlayers = computed(() => players.value.filter((player) => !player.eliminated).length);
</script>
