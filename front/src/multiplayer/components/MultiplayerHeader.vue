<template>
  <header class="relative z-10 flex h-16 items-center gap-4 border-b border-slate-800/50 bg-slate-950/50 px-4 backdrop-blur-md">
    <q-btn
      flat
      round
      dense
      color="secondary"
      icon="logout"
      @click="emit('quit')"
    >
      <q-tooltip>Quitter</q-tooltip>
    </q-btn>

    <div class="flex flex-col">
      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Room {{ roomCode }}</span>
      <span v-if="phase === 'inRound' || phase === 'roundEnd'" class="text-sm font-bold text-slate-200">
        Round {{ roundIndex + 1 }}<span class="text-slate-500">/{{ totalRounds }}</span>
      </span>
      <span v-else class="text-sm font-bold text-slate-200">Lobby</span>
    </div>

    <div v-if="phase === 'inRound'" class="mx-2 flex flex-1 items-center">
      <q-linear-progress
        :value="timeProgress"
        color="primary"
        track-color="slate-800"
        rounded
        size="8px"
        class="w-full"
      />
    </div>
    <div v-else class="flex-1"></div>

    <div v-if="phase === 'inRound' || phase === 'roundEnd'" class="flex flex-col items-end">
      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mon Score</span>
      <span class="text-xl font-bold text-emerald-400">{{ myScore }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  phase: string;
  roomCode: string;
  roundIndex: number;
  totalRounds: number;
  timeProgress: number;
  myScore: number;
}>();

const emit = defineEmits<{ (event: 'quit'): void }>();
</script>
