<template>
  <section class="relative z-10 flex flex-1 flex-col gap-3 overflow-hidden px-3 pb-3 md:grid md:grid-cols-[300px_minmax(0,1fr)_300px] md:px-4 lg:grid-cols-[340px_minmax(0,1fr)_340px]">
    <div class="flex max-h-[180px] gap-2 md:hidden">
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
          class="mobile-compact"
        />
      </div>
      <div class="min-w-0 flex-1">
        <MultiplayerWordHistory class="mobile-compact" />
      </div>
    </div>

    <div class="min-h-0 max-md:hidden md:col-start-1 md:block">
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

    <div class="flex min-h-0 flex-col items-center justify-center gap-3 overflow-y-auto md:col-start-2">
      <WordActionPanel
        :current-word="currentWord"
        :word-preview="wordPreview"
        :disable-submit="phase !== 'inRound' || currentWord.length === 0"
        variant="multi"
        @clear="emit('clear')"
        @submit="emit('submit')"
      />
    </div>

    <div class="min-h-0 max-md:hidden md:col-start-3 md:flex md:min-h-full">
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
};

type WordPreview = {
  status: 'valid' | 'used' | 'invalid' | string;
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
.mobile-compact :deep(section) {
  padding: 0.5rem !important;
  height: 100%;
}

.mobile-compact :deep(header) {
  margin-bottom: 0.25rem !important;
}

.mobile-compact :deep(.text-\[10px\]) {
  font-size: 8px !important;
}

.mobile-compact :deep(.text-xs) {
  font-size: 9px !important;
}

.mobile-compact :deep(.text-sm) {
  font-size: 10px !important;
}

.mobile-compact :deep(ul) {
  gap: 0.25rem !important;
  max-height: 120px !important;
}

.mobile-compact :deep(li) {
  padding: 0.25rem 0.5rem !important;
  font-size: 10px !important;
}

.mobile-compact :deep(.space-y-2) {
  gap: 0.25rem !important;
}

.mobile-compact :deep(.space-y-1\.5) {
  gap: 0.125rem !important;
}

.mobile-compact :deep(p) {
  margin-bottom: 0.125rem !important;
}
</style>
