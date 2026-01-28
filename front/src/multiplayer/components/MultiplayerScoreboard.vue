<template>
  <section class="flex h-full flex-col gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 shadow-lg backdrop-blur">
    <header class="flex items-center justify-between">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Classement</p>
        <p class="text-xs text-slate-500">Round {{ roundIndex + 1 }} / {{ totalRounds }}</p>
      </div>
      <div class="rounded-full border border-slate-700/70 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-slate-200">
        {{ formattedTimeLeft }}
      </div>
    </header>

    <ul class="scrollbar-thin scrollbar-track-slate-900/30 scrollbar-thumb-slate-600/40 flex-1 space-y-2 overflow-y-auto pr-1">
      <li
        v-for="player in scoreboard"
        :key="player.id"
        class="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/60 px-3 py-2 text-sm"
        :class="{
          'border-cyan-400/70 bg-cyan-500/10 text-cyan-200': player.id === playerId,
          'opacity-60': player.eliminated
        }"
      >
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-400">#{{ player.position }}</span>
          <div>
            <p class="font-semibold text-slate-100">{{ player.name }}</p>
            <p class="text-[10px] text-slate-500">
              <span v-if="player.ko" class="text-rose-300">KO</span>
              <span v-else-if="player.eliminated" class="text-amber-300">Éliminé</span>
              <span v-else-if="!player.connected" class="text-slate-500">Déconnecté</span>
              <span v-else class="text-emerald-300">En jeu</span>
            </p>
          </div>
        </div>
        <span class="font-bold text-emerald-300">{{ player.score }} pts</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  scoreboard: Array<{
    id: string;
    name: string;
    score: number;
    ko: boolean;
    eliminated: boolean;
    connected: boolean;
    position?: number;
  }>;
  playerId: string;
  roundIndex: number;
  totalRounds: number;
  timeLeftMs: number;
}>();

const formattedTimeLeft = computed(() => {
  const totalSeconds = Math.max(Math.ceil(props.timeLeftMs / 1000), 0);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
});
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
