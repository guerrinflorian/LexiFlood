<template>
  <section class="relative z-10 flex flex-1 flex-col gap-3 overflow-hidden px-3 pb-3 md:grid md:grid-cols-[280px_minmax(0,1fr)_280px] md:px-4 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
    <!-- Version mobile : Classement et Historique côte à côte en haut -->
    <div class="flex h-40 flex-shrink-0 gap-2 md:hidden">
      <div class="min-w-0 flex-1">
        <MultiplayerScoreboard
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
      <div class="min-w-0 flex-1">
        <MultiplayerWordHistory />
      </div>
    </div>

    <!-- Version desktop : Classement à gauche -->
    <div class="hidden min-h-0 md:block md:col-start-1">
      <MultiplayerScoreboard
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

    <!-- Colonne principale : Mot + Actions (toujours visible) -->
    <div class="flex min-h-0 flex-col items-center justify-center gap-3 md:overflow-y-auto md:scrollbar-thin md:scrollbar-track-slate-950/50 md:scrollbar-thumb-slate-700/50 md:col-start-2">
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
    <div class="hidden min-h-0 md:flex md:col-start-3">
      <MultiplayerWordHistory />
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