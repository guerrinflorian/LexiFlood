<template>
  <div class="relative flex h-12 items-center gap-2 p-2 md:h-14 md:p-3">
    <!-- Section gauche : Bouton Quitter + Score -->
    <div class="flex items-center gap-3 flex-shrink-0">
      <q-btn
        outline
        rounded
        color="accent"
        class="px-3 py-1.5 text-sm font-semibold md:px-5 md:py-2"
        label="Quitter"
        icon="logout"
        size="sm"
        @click="$emit('quit')"
      />
      
      <!-- Cercle de score collé à droite du bouton -->
      <div class="score-circle">
        <span class="score-label">Score</span>
        <span class="score-value">{{ score }}</span>
      </div>
    </div>

    <!-- Badges info au centre - avec min-width 0 pour permettre le shrink -->
    <div class="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-2">
      <!-- Statut en cours -->
      <div class="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-gradient-to-br from-emerald-900/25 to-emerald-950/20 px-3 py-1.5 text-xs">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        <span class="font-semibold text-emerald-100">Partie en cours</span>
      </div>

      <!-- Progress bar - prend l'espace disponible mais ne dépasse pas -->
      <transition name="progress-expand">
        <div
          v-if="overflowCountdown !== null"
          class="progress-container flex h-7 min-w-0 flex-1 items-center gap-2 rounded-full border border-amber-500/50 bg-gradient-to-r from-orange-900/30 to-orange-950/20 px-3 py-1.5 backdrop-blur"
        >
          <span class="flex-shrink-0 text-lg">⚠️</span>
          <span class="flex-shrink-0 text-xs font-bold tabular-nums text-amber-100">{{ displayCountdown }}s</span>
          <div class="min-w-0 flex-1">
            <q-linear-progress
              rounded
              size="6px"
              color="warning"
              track-color="orange-900"
              :value="overflowProgress"
            />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useGameStore } from '../stores/useGameStore';

defineEmits<{ (event: 'quit'): void }>();

const store = useGameStore();
const { score, overflowCountdown } = storeToRefs(store);

const displayCountdown = computed(() => {
  if (overflowCountdown.value === null) {
    return 0;
  }
  return Math.max(0, overflowCountdown.value - 1);
});

const overflowProgress = computed(() => {
  if (overflowCountdown.value === null) {
    return 0;
  }
  // Utilise displayCountdown au lieu de overflowCountdown pour la progress bar
  return Math.min(1, Math.max(0, displayCountdown.value / 5));
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