<template>
  <div class="relative flex h-16 items-center justify-between gap-4 border-b border-slate-800/50 bg-slate-950/50 px-4 backdrop-blur-md">
    <!-- Left Group: Quit + Info -->
    <div class="flex items-center gap-4">
      <q-btn
        flat
        round
        dense
        color="secondary"
        icon="logout"
        @click="$emit('quit')"
      >
        <q-tooltip>Quitter</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        color="primary"
        icon="pause_circle"
        :disable="!pauseAvailable || gameOver"
        @click="$emit('pause')"
      >
        <q-badge v-if="pauseAvailable" color="positive" floating>
          <q-icon name="check_circle" size="14px" />
        </q-badge>
        <q-badge v-else color="grey-7" text-color="white" floating :label="pauseCooldownLabel" />
        <q-tooltip>Pause</q-tooltip>
      </q-btn>

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 text-xs">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span class="font-semibold text-emerald-100 hidden sm:inline">Partie en cours</span>
        </div>
      </div>
    </div>

    <!-- Center: Progress Bar (Overflow) -->
    <div class="flex flex-1 items-center justify-center px-4">
      <transition name="fade">
        <div v-if="overflowCountdown !== null" class="w-full max-w-md flex items-center gap-3 rounded-full border border-amber-500/30 bg-amber-950/20 px-3 py-1">
          <span class="text-xs font-bold text-amber-200 whitespace-nowrap">⚠️ {{ displayCountdown }}s</span>
          <q-linear-progress
            rounded
            size="8px"
            color="warning"
            track-color="orange-900"
            :value="overflowProgress"
            class="w-full"
          />
        </div>
      </transition>
    </div>

    <!-- Right: Score + Time -->
    <div class="flex flex-col items-end">
      <div class="flex items-center gap-3">
        <div class="flex flex-col items-end">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Temps</span>
          <span class="text-sm font-bold text-slate-300">{{ elapsedTimeFormatted }}</span>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Score</span>
          <span class="text-xl font-bold text-blue-400">{{ score }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useGameStore } from '../stores/useGameStore';

defineEmits<{ (event: 'quit'): void; (event: 'pause'): void }>();

const store = useGameStore();
const { score, overflowCountdown, elapsedTimeFormatted, gameOver, paused, pauseCooldownUntil } = storeToRefs(store);

const clockNow = ref(Date.now());
let clockInterval: ReturnType<typeof setInterval> | null = null;

const displayCountdown = computed(() => {
  if (overflowCountdown.value === null) {
    return 0;
  }
  return overflowCountdown.value;
});

const overflowProgress = computed(() => {
  if (overflowCountdown.value === null) {
    return 0;
  }
  // Progress starts full (1.0) and decreases to 0
  return overflowCountdown.value / 5;
});

const pauseCooldownRemaining = computed(() => {
  if (!pauseCooldownUntil.value) {
    return 0;
  }
  return Math.max(0, Math.ceil((pauseCooldownUntil.value - clockNow.value) / 1000));
});

const pauseAvailable = computed(() => !paused.value && pauseCooldownRemaining.value === 0);

const pauseCooldownLabel = computed(() => {
  const remaining = pauseCooldownRemaining.value;
  const minutes = Math.floor(remaining / 60);
  const seconds = (remaining % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
});

onMounted(() => {
  clockInterval = setInterval(() => {
    clockNow.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => {
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }
});
</script>

<style scoped>
/* Cercle de score */
.score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 2px solid rgba(59, 130, 246, 0.6);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(59, 130, 246, 0.4),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.score-circle:hover {
  border-color: rgba(59, 130, 246, 0.8);
  box-shadow: 
    0 6px 8px -1px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(59, 130, 246, 0.5),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.score-label {
  font-size: 0.5625rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  font-weight: 700;
  line-height: 1;
}

.score-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
  margin-top: 0.125rem;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

/* Animation de pulsation pour l'alerte */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Container pour la progress bar avec transition */
.progress-container {
  overflow: hidden;
}

/* Transitions - utilise max-width au lieu de width pour éviter le push */
.progress-expand-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.progress-expand-enter-from {
  opacity: 0;
  max-width: 0;
  padding-left: 0;
  padding-right: 0;
  border-width: 0;
}

.progress-expand-leave-to {
  opacity: 0;
  max-width: 0;
  padding-left: 0;
  padding-right: 0;
  border-width: 0;
}

/* Responsive */
@media (min-width: 640px) {
  .score-circle {
    width: 3.5rem;
    height: 3.5rem;
  }

  .score-value {
    font-size: 1.25rem;
  }
}
</style>
