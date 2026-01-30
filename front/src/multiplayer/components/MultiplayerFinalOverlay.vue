<template>
  <div class="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm px-4">
    <div class="futuristic-overlay w-full max-w-2xl">
      <!-- En-tête -->
      <div class="border-b border-slate-700/50 pb-5 text-center">
        <div class="mb-3 flex justify-center">
          <div class="trophy-icon" :class="headerIconClass">
            <span class="text-4xl">{{ headerIcon }}</span>
          </div>
        </div>
        <h3 class="text-3xl font-bold text-white drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] sm:text-4xl" style="font-family: 'Orbitron', sans-serif;">
          {{ headerTitle }}
        </h3>
        <p class="mt-2 text-base text-slate-300 sm:text-lg">
          <span v-if="outcome === 'draw'">Le dernier round se termine sur un match nul.</span>
          <span v-else-if="outcome === 'victory'">
            Félicitations <span class="font-bold text-amber-400">{{ winnerName }}</span> ! 🎉
          </span>
          <span v-else>
            Victoire de <span class="font-bold text-amber-400">{{ winnerName }}</span>. Courage pour la revanche !
          </span>
        </p>
      </div>

      <!-- Classement final -->
      <div class="mt-5">
        <div class="mb-3 flex items-center justify-center gap-2">
          <span class="text-xl">📊</span>
          <h4 class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Classement Final</h4>
        </div>

        <ul class="space-y-2">
          <li
            v-for="player in finalScoreboard"
            :key="player.id"
            class="scoreboard-item"
            :class="{
              'scoreboard-item-winner': player.position === 1,
              'scoreboard-item-podium': player.position === 2 || player.position === 3
            }"
          >
            <div class="flex items-center gap-3">
              <!-- Position -->
              <div class="position-badge" :class="getPositionClass(player.position)">
                <span v-if="player.position === 1">🥇</span>
                <span v-else-if="player.position === 2">🥈</span>
                <span v-else-if="player.position === 3">🥉</span>
                <span v-else class="text-xs font-bold">#{{ player.position }}</span>
              </div>

              <!-- Avatar et nom -->
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <div class="player-avatar" :class="getAvatarClass(player.position)">
                  {{ player.name.charAt(0).toUpperCase() }}
                </div>
                <span class="truncate text-sm font-semibold text-white sm:text-base">{{ player.name }}</span>
              </div>

              <!-- Score -->
              <div class="score-badge">
                <span class="font-bold">{{ player.score }}</span>
                <span class="text-xs opacity-75">pts</span>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Bouton retour -->
      <div class="mt-6 flex justify-center border-t border-slate-700/50 pt-5">
        <q-btn
          unelevated
          no-caps
          class="back-btn"
          size="md"
          @click="emit('back-to-menu')"
        >
          <span class="flex items-center gap-2">
            <q-icon name="home" size="18px" />
            <span class="font-bold">Retour au menu</span>
          </span>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
type FinalEntry = {
  id: string;
  name: string;
  score: number;
  position: number;
};

const props = defineProps<{
  winnerName: string;
  finalScoreboard: FinalEntry[];
  outcome: 'victory' | 'defeat' | 'draw';
}>();

const emit = defineEmits<{ (event: 'back-to-menu'): void }>();

const getPositionClass = (position: number) => {
  if (position === 1) return 'position-badge-gold';
  if (position === 2) return 'position-badge-silver';
  if (position === 3) return 'position-badge-bronze';
  return 'position-badge-default';
};

const getAvatarClass = (position: number) => {
  if (position === 1) return 'player-avatar-gold';
  if (position === 2) return 'player-avatar-silver';
  if (position === 3) return 'player-avatar-bronze';
  return 'player-avatar-default';
};

const headerTitle = computed(() => {
  if (props.outcome === 'draw') {
    return 'Match nul';
  }
  return props.outcome === 'victory' ? 'Victoire !' : 'Défaite';
});

const headerIcon = computed(() => {
  if (props.outcome === 'draw') {
    return '🤝';
  }
  return props.outcome === 'victory' ? '🏆' : '🎯';
});

const headerIconClass = computed(() => {
  if (props.outcome === 'draw') {
    return 'trophy-icon-draw';
  }
  return props.outcome === 'victory' ? 'trophy-icon-win' : 'trophy-icon-defeat';
});
</script>

<style scoped>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

/* Overlay futuriste */
.futuristic-overlay {
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%);
  border: 1px solid rgba(71, 85, 105, 0.6);
  padding: 1.5rem;
  box-shadow: 
    inset 0 2px 10px rgba(0, 0, 0, 0.3),
    0 20px 25px -5px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(251, 191, 36, 0.2);
  backdrop-filter: blur(16px);
}

/* Icône trophée */
.trophy-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%);
  border: 2px solid rgba(251, 191, 36, 0.4);
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.3);
  animation: pulse-trophy 2s ease-in-out infinite;
}

.trophy-icon-win {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%);
  border-color: rgba(251, 191, 36, 0.4);
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.3);
}

.trophy-icon-defeat {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
  border-color: rgba(56, 189, 248, 0.35);
  box-shadow: 0 0 24px rgba(56, 189, 248, 0.25);
}

.trophy-icon-draw {
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(100, 116, 139, 0.2) 100%);
  border-color: rgba(148, 163, 184, 0.35);
  box-shadow: 0 0 24px rgba(148, 163, 184, 0.25);
}

@keyframes pulse-trophy {
  0%, 100% {
    box-shadow: 0 0 30px rgba(251, 191, 36, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(251, 191, 36, 0.5);
  }
}

/* Items du classement */
.scoreboard-item {
  padding: 0.875rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  border: 1px solid rgba(71, 85, 105, 0.4);
  transition: all 0.2s ease;
}

.scoreboard-item:hover {
  transform: translateX(4px);
  border-color: rgba(6, 182, 212, 0.4);
}

.scoreboard-item-winner {
  border-color: rgba(251, 191, 36, 0.5);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%);
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
}

.scoreboard-item-podium {
  border-color: rgba(6, 182, 212, 0.3);
}

/* Badges de position */
.position-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.position-badge-gold {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.3) 100%);
  border: 1px solid rgba(251, 191, 36, 0.5);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
}

.position-badge-silver {
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.3) 0%, rgba(100, 116, 139, 0.3) 100%);
  border: 1px solid rgba(148, 163, 184, 0.5);
  box-shadow: 0 0 15px rgba(148, 163, 184, 0.3);
}

.position-badge-bronze {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.3) 0%, rgba(180, 83, 9, 0.3) 100%);
  border: 1px solid rgba(205, 127, 50, 0.5);
  box-shadow: 0 0 15px rgba(205, 127, 50, 0.3);
}

.position-badge-default {
  background: rgba(71, 85, 105, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: rgb(148, 163, 184);
}

/* Avatars */
.player-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
}

.player-avatar-gold {
  background: linear-gradient(135deg, rgb(251, 191, 36) 0%, rgb(245, 158, 11) 100%);
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.5);
}

.player-avatar-silver {
  background: linear-gradient(135deg, rgb(148, 163, 184) 0%, rgb(100, 116, 139) 100%);
  box-shadow: 0 0 12px rgba(148, 163, 184, 0.5);
}

.player-avatar-bronze {
  background: linear-gradient(135deg, rgb(205, 127, 50) 0%, rgb(180, 83, 9) 100%);
  box-shadow: 0 0 12px rgba(205, 127, 50, 0.5);
}

.player-avatar-default {
  background: linear-gradient(135deg, rgb(71, 85, 105) 0%, rgb(51, 65, 85) 100%);
}

/* Badge de score */
.score-badge {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: rgb(103, 232, 249);
  font-size: 0.875rem;
  white-space: nowrap;
}

/* Bouton retour */
:deep(.back-btn) {
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(71, 85, 105, 0.5) 0%, rgba(51, 65, 85, 0.5) 100%) !important;
  border: 2px solid rgba(71, 85, 105, 0.7) !important;
  color: rgb(226, 232, 240) !important;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
}

:deep(.back-btn:hover) {
  border-color: rgba(6, 182, 212, 0.6) !important;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%) !important;
  color: rgb(103, 232, 249) !important;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
}

@media (min-width: 640px) {
  .futuristic-overlay {
    padding: 2rem;
  }
}
</style>
