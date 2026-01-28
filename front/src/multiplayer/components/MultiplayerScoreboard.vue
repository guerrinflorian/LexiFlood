<template>
  <section class="flex h-full flex-col gap-2 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-3 shadow-lg backdrop-blur">
    <header class="flex items-center justify-between pb-2">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Classement</p>
      <div class="text-[10px] font-bold text-slate-500">{{ targetQualified }} qualifiés</div>
    </header>

    <ul class="scrollbar-thin scrollbar-track-slate-900/30 scrollbar-thumb-slate-600/40 flex-1 space-y-1 overflow-y-auto pr-1">
      <li
        v-for="player in scoreboard"
        :key="player.id"
        class="flex items-center justify-between rounded-lg border px-2 py-1.5 text-xs transition-colors"
        :class="getRowClasses(player)"
      >
        <div class="flex items-center gap-2">
          <span class="w-4 text-center font-bold text-slate-500">#{{ player.position }}</span>
          <div class="flex flex-col">
            <span class="font-bold leading-tight" :class="player.id === playerId ? 'text-white' : 'text-slate-200'">{{ player.name }}</span>
            <span class="text-[9px] leading-tight text-slate-400">
              <span v-if="player.ko" class="font-bold text-rose-400">KO</span>
              <span v-else-if="player.eliminated" class="text-amber-400">Éliminé</span>
              <span v-else-if="!player.connected" class="text-slate-600">Déconnecté</span>
              <span v-else class="text-emerald-400/80">En jeu</span>
            </span>
          </div>
        </div>
        <span class="font-mono font-bold text-emerald-300">{{ player.score }}</span>
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
  durationMs: number;
  targetQualified: number;
  phase: 'entry' | 'lobby' | 'inRound' | 'roundEnd' | 'finished';
  qualifiedIds: string[];
  eliminatedIds: string[];
}>();

const timeProgress = computed(() => {
  if (!props.durationMs) return 0;
  return Math.min(Math.max(props.timeLeftMs / props.durationMs, 0), 1);
});

const formattedTimeLeft = computed(() => {
  const totalSeconds = Math.max(Math.ceil(props.timeLeftMs / 1000), 0);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
});

const getRowClasses = (player: typeof props.scoreboard[0]) => {
  const classes = [];

  if (player.eliminated || props.eliminatedIds.includes(player.id)) {
    classes.push('border-rose-500/40 bg-rose-950/40 text-rose-200');
  } else if (player.ko) {
    classes.push('border-rose-500/30 bg-rose-950/30');
  } else {
    const isQualified = props.phase === 'roundEnd'
      ? props.qualifiedIds.includes(player.id)
      : (player.position ?? 999) <= props.targetQualified;

    if (player.id === props.playerId) {
      classes.push('border-cyan-500/50 bg-cyan-500/20');
      if (isQualified) classes.push('shadow-[inset_0_0_12px_rgba(16,185,129,0.2)]');
    } else if (isQualified) {
      classes.push('border-emerald-500/40 bg-emerald-500/15 text-emerald-100');
    } else {
      classes.push('border-slate-800/60 bg-slate-950/60');
    }
  }

  return classes.join(' ');
};

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
