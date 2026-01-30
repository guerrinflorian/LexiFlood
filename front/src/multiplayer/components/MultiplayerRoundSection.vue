<template>
  <section class="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2 md:grid md:grid-cols-[280px_minmax(0,1fr)_280px] md:grid-rows-[minmax(0,1fr)] md:gap-3 md:px-4 md:pb-3 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
    
    <!-- Version mobile : Classement et Historique côte à côte en haut -->
    <!-- Visible UNIQUEMENT sur mobile avec md:hidden -->
    <div class="flex min-h-0 flex-1 gap-1.5 overflow-hidden md:hidden">
      <div class="min-h-0 min-w-0 flex-1 overflow-hidden">
        <MultiplayerScoreboard
          class="h-full"
          :scoreboard="scoreboard"
          :player-id="playerId"
          :round-index="roundIndex"
          :total-rounds="totalRounds"
          :time-left-ms="timeLeftMs"
          :duration-ms="durationMs"
          :target-qualified="targetQualified"
          :phase="phase"
          :qualified-ids="qualifiedIds"
          :eliminated-ids="eliminatedIds"
        />
      </div>
      <div class="min-h-0 min-w-0 flex-1 overflow-hidden">
        <MultiplayerWordHistory class="h-full" />
      </div>
    </div>

    <!-- Version desktop : Classement à gauche -->
    <!-- CHANGEMENT ICI : max-md:hidden au lieu de hidden md:flex -->
    <div class="w-full min-h-0 overflow-hidden max-md:hidden md:col-start-1">
      <MultiplayerScoreboard
        class="h-full"
        :scoreboard="scoreboard"
        :player-id="playerId"
        :round-index="roundIndex"
        :total-rounds="totalRounds"
        :time-left-ms="timeLeftMs"
        :duration-ms="durationMs"
        :target-qualified="targetQualified"
        :phase="phase"
        :qualified-ids="qualifiedIds"
        :eliminated-ids="eliminatedIds"
      />
    </div>

    <!-- Colonne principale : Mot + Actions -->
    <div class="flex flex-shrink-0 items-center justify-center py-2 md:col-start-2 md:w-full md:flex-1 md:py-0">
      <WordActionPanel
        :current-word="currentWord"
        :word-preview="wordPreview"
        :disable-submit="phase !== 'inRound' || currentWord.length === 0"
        variant="multi"
        @clear="emit('clear')"
        @submit="emit('submit')"
      />
    </div>

    <!-- Version desktop : Historique à droite -->
    <!-- CHANGEMENT ICI : max-md:hidden au lieu de hidden md:flex -->
    <div class="w-full min-h-0 overflow-hidden max-md:hidden md:col-start-3">
      <MultiplayerWordHistory class="h-full" />
    </div>
  </section>
</template>

<script setup lang="ts">
import MultiplayerScoreboard from './MultiplayerScoreboard.vue';
import MultiplayerWordHistory from './MultiplayerWordHistory.vue';
import WordActionPanel from '../../components/WordActionPanel.vue';

type ScoreboardEntry = {
  id: string;
  name: string;
  score: number;
  position: number;
  ko: boolean;
  eliminated: boolean;
  connected: boolean;
};

type WordPreview = {
  status: 'valid' | 'used' | 'invalid' | 'pending';
  label: string;
  points: number;
};

defineProps<{
  scoreboard: ScoreboardEntry[];
  playerId: string;
  roundIndex: number;
  totalRounds: number;
  timeLeftMs: number;
  durationMs: number;
  targetQualified: number;
  phase: string;
  qualifiedIds: string[];
  eliminatedIds: string[];
  currentWord: string;
  wordPreview: WordPreview;
}>();

const emit = defineEmits<{ (event: 'clear'): void; (event: 'submit'): void }>();
</script>

<style scoped>
/* Scrollbar personnalisée */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-track-slate-950\/50::-webkit-scrollbar-track {
  background: rgba(2, 6, 23, 0.5);
  border-radius: 3px;
}

.scrollbar-thumb-slate-700\/50::-webkit-scrollbar-thumb {
  background: rgba(51, 65, 85, 0.5);
  border-radius: 3px;
}

.scrollbar-thumb-slate-700\/50::-webkit-scrollbar-thumb:hover {
  background: rgba(51, 65, 85, 0.7);
}
</style>
