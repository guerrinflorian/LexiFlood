<template>
  <header class="relative z-10 flex flex-col border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md">
    <!-- Ligne 1 : Tous les éléments principaux -->
    <div class="flex h-12 items-center gap-2 px-2 sm:h-14 sm:gap-3 sm:px-3 md:h-16 md:gap-4 md:px-4 lg:gap-6 lg:px-6">
      <!-- Bouton Quitter -->
      <q-btn
        flat
        round
        dense
        color="secondary"
        icon="logout"
        size="sm"
        @click="emit('quit')"
        class="shrink-0"
      >
        <q-tooltip>Quitter</q-tooltip>
      </q-btn>

      <!-- Room/Round Info -->
      <div class="flex shrink-0 flex-col">
        <span class="text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:text-[10px]">
          Room {{ roomCode }}
        </span>
        <span v-if="phase === 'inRound' || phase === 'roundEnd'" class="text-xs font-bold text-slate-200 sm:text-sm">
          Round {{ roundIndex + 1 }}<span class="text-slate-500">/{{ totalRounds }}</span>
        </span>
        <span v-else class="text-xs font-bold text-slate-200 sm:text-sm">Lobby</span>
      </div>

      <!-- Barre de progression - cachée sur mobile, visible sur PC -->
      <div v-if="phase === 'inRound'" class="mx-2 hidden flex-1 items-center sm:flex md:mx-4 lg:mx-6">
        <q-linear-progress
          :value="timeProgress"
          color="primary"
          track-color="slate-800"
          rounded
          size="8px"
          class="w-full max-w-2xl"
        />
      </div>
      <div v-else class="hidden flex-1 sm:block"></div>

      <!-- Spacer mobile -->
      <div class="flex-1 sm:hidden"></div>

      <!-- Stats compactes sur mobile, complètes sur PC -->
      <div v-if="phase === 'inRound' || phase === 'roundEnd'" class="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-5">
        <!-- Classement - toujours visible -->
        <div class="flex flex-col items-end">
          <span class="hidden text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:block sm:text-[10px]">
            Classement
          </span>
          <span class="text-xs font-bold text-slate-200 sm:text-sm lg:text-base">
            {{ rankLabel }}
          </span>
        </div>

        <!-- Statut - toujours visible -->
        <div class="flex flex-col items-end">
          <span class="hidden text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:block sm:text-[10px]">
            Statut
          </span>
          <span 
            class="flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold sm:gap-1 sm:px-2 sm:text-xs lg:px-3 lg:text-sm" 
            :class="qualificationClass"
          >
            <q-icon :name="qualificationIcon" size="12px" class="sm:size-3.5 lg:size-4" />
            <span class="hidden sm:inline">{{ qualificationLabel }}</span>
            <span class="sm:hidden">{{ qualificationLabelShort }}</span>
          </span>
        </div>

        <!-- Temps - toujours visible -->
        <div class="flex flex-col items-end">
          <span class="hidden text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:block sm:text-[10px]">
            Temps
          </span>
          <span class="font-mono text-sm font-bold text-cyan-200 sm:text-base lg:text-xl">
            {{ formattedTimeLeft }}
          </span>
        </div>
        
        <!-- Score - toujours visible avec emphase -->
        <div class="flex flex-col items-end">
          <span class="hidden text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:block sm:text-[10px]">
            Mon Score
          </span>
          <span class="text-base font-bold text-emerald-400 sm:text-lg lg:text-2xl">
            {{ myScore }}
          </span>
        </div>
      </div>
    </div>

    <!-- Ligne 2 : Barre de progression mobile uniquement -->
    <div v-if="phase === 'inRound'" class="flex h-8 items-center gap-2 border-t border-slate-800/30 px-2 sm:hidden">
      <q-linear-progress
        :value="timeProgress"
        color="primary"
        track-color="slate-800"
        rounded
        size="6px"
        class="w-full"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  phase: string;
  roomCode: string;
  roundIndex: number;
  totalRounds: number;
  timeProgress: number;
  timeLeftMs: number;
  myScore: number;
  myRank: number | null;
  totalPlayers: number;
  qualificationLabel: string;
  qualificationIcon: string;
  qualificationClass: string;
}>();

const emit = defineEmits<{ (event: 'quit'): void }>();

const formattedTimeLeft = computed(() => {
  const totalSeconds = Math.max(Math.ceil(props.timeLeftMs / 1000), 0);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
});

const rankLabel = computed(() => {
  if (!props.myRank || props.totalPlayers <= 0) {
    return '—';
  }
  return `${props.myRank}/${props.totalPlayers}`;
});

// Version courte du label pour mobile
const qualificationLabelShort = computed(() => {
  const shortLabels: Record<string, string> = {
    'Qualifié': 'Q',
    'Éliminé': 'E',
    'En danger': 'D',
    'Sûr': 'S',
    'Qualified': 'Q',
    'Eliminated': 'E',
    'At risk': 'R',
    'Safe': 'S'
  };
  return shortLabels[props.qualificationLabel] || props.qualificationLabel.charAt(0);
});
</script>