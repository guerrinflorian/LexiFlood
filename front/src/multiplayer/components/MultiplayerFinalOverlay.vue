<template>
  <div class="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80">
    <div class="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-center">
      <h3 class="text-2xl font-bold text-white">Victoire</h3>
      <p class="mt-2 text-sm text-slate-400">Bravo {{ winnerName }} !</p>
      <ul class="mt-4 space-y-2 text-left text-sm text-slate-200">
        <li v-for="player in finalScoreboard" :key="player.id" class="flex items-center justify-between">
          <span>#{{ player.position }} {{ player.name }}</span>
          <span class="font-semibold text-emerald-300">{{ player.score }} pts</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
type FinalEntry = {
  id: string;
  name: string;
  score: number;
  position: number;
};

defineProps<{
  winnerName: string;
  finalScoreboard: FinalEntry[];
}>();
</script>
