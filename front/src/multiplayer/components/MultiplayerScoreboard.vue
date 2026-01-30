<template>
  <section class="scoreboard-container flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border border-slate-700/50 bg-gradient-to-br from-slate-900/70 to-slate-950/60 p-2.5 backdrop-blur-sm sm:p-3">
    <!-- En-tête -->
    <header class="mb-2 flex flex-shrink-0 items-center justify-between border-b border-slate-700/30 pb-2">
      <div class="flex items-center gap-1.5">
        <span class="text-base">🏆</span>
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Classement</p>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-[10px] text-slate-500">Top</span>
        <span class="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300">
          {{ targetQualified }}
        </span>
      </div>
    </header>

    <!-- Liste des joueurs -->
    <ul class="scoreboard-scroll flex-1 space-y-1 overflow-y-auto pr-0.5">
      <li
        v-for="player in scoreboard"
        :key="player.id"
        class="scoreboard-item"
        :class="getRowClasses(player)"
      >
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <!-- Position -->
          <div class="position-indicator" :class="getPositionClasses(player)">
            <span v-if="player.position && player.position <= 3" class="text-xs">
              {{ player.position === 1 ? '🥇' : player.position === 2 ? '🥈' : '🥉' }}
            </span>
            <span v-else class="text-[10px] font-bold">
              {{ player.position ?? '–' }}
            </span>
          </div>

          <!-- Avatar et infos -->
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <div class="player-avatar" :class="getAvatarClasses(player)">
              {{ player.name.charAt(0).toUpperCase() }}
            </div>
            
            <div class="min-w-0 flex-1">
              <p class="truncate text-xs font-semibold leading-tight" :class="player.id === playerId ? 'text-white' : 'text-slate-200'">
                {{ player.name }}
              </p>
              <div class="flex items-center gap-1">
                <div v-if="!player.ko && !player.eliminated && player.connected" class="status-dot status-dot-active"></div>
                <p class="text-[9px] leading-tight">
                  <span v-if="player.ko" class="status-ko">KO</span>
                  <span v-else-if="player.eliminated" class="status-eliminated">Éliminé</span>
                  <span v-else-if="!player.connected" class="status-disconnected">Déconnecté</span>
                  <span v-else class="status-active">En jeu</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Score -->
        <div class="score-badge" :class="getScoreBadgeClasses(player)">
          <span class="font-mono text-xs font-bold sm:text-sm">{{ player.score }}</span>
        </div>
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

const isQualified = (player: typeof props.scoreboard[0]) => {
  return props.phase === 'roundEnd'
    ? props.qualifiedIds.includes(player.id)
    : (player.position ?? 999) <= props.targetQualified;
};

const getRowClasses = (player: typeof props.scoreboard[0]) => {
  const classes = [];

  if (player.eliminated || props.eliminatedIds.includes(player.id)) {
    classes.push('scoreboard-item-eliminated');
  } else if (player.ko) {
    classes.push('scoreboard-item-ko');
  } else if (player.id === props.playerId) {
    classes.push('scoreboard-item-current');
    if (isQualified(player)) {
      classes.push('scoreboard-item-current-qualified');
    }
  } else if (isQualified(player)) {
    classes.push('scoreboard-item-qualified');
  }

  return classes.join(' ');
};

const getPositionClasses = (player: typeof props.scoreboard[0]) => {
  if (player.position === 1) return 'position-indicator-gold';
  if (player.position === 2) return 'position-indicator-silver';
  if (player.position === 3) return 'position-indicator-bronze';
  return '';
};

const getAvatarClasses = (player: typeof props.scoreboard[0]) => {
  if (player.eliminated || props.eliminatedIds.includes(player.id)) {
    return 'player-avatar-eliminated';
  }
  if (player.id === props.playerId) {
    return 'player-avatar-current';
  }
  if (isQualified(player)) {
    return 'player-avatar-qualified';
  }
  return 'player-avatar-default';
};

const getScoreBadgeClasses = (player: typeof props.scoreboard[0]) => {
  if (player.eliminated || props.eliminatedIds.includes(player.id)) {
    return 'score-badge-eliminated';
  }
  if (isQualified(player)) {
    return 'score-badge-qualified';
  }
  return 'score-badge-default';
};
</script>

<style scoped>
/* FORCE L'AFFICHAGE - Enlève tout display:none */
.scoreboard-container {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Scrollbar personnalisée */
.scoreboard-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(6, 182, 212, 0.3) rgba(15, 23, 42, 0.3);
}

.scoreboard-scroll::-webkit-scrollbar {
  width: 4px;
}

.scoreboard-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.3);
  border-radius: 2px;
}

.scoreboard-scroll::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.3);
  border-radius: 2px;
  transition: background 0.2s ease;
}

.scoreboard-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(6, 182, 212, 0.5);
}

/* Items du classement */
.scoreboard-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%);
  border: 1px solid rgba(71, 85, 105, 0.3);
  transition: all 0.2s ease;
}

.scoreboard-item:hover {
  transform: translateX(2px);
}

.scoreboard-item-qualified {
  border-color: rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%);
}

.scoreboard-item-current {
  border-color: rgba(6, 182, 212, 0.5);
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(15, 23, 42, 0.7) 100%);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
}

.scoreboard-item-current-qualified {
  box-shadow: 
    0 0 15px rgba(6, 182, 212, 0.2),
    inset 0 0 15px rgba(16, 185, 129, 0.15);
}

.scoreboard-item-eliminated {
  border-color: rgba(244, 63, 94, 0.4);
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%);
  opacity: 0.7;
}

.scoreboard-item-ko {
  border-color: rgba(244, 63, 94, 0.3);
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%);
  opacity: 0.8;
}

/* Indicateur de position */
.position-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  border-radius: 0.375rem;
  background: rgba(71, 85, 105, 0.3);
  color: rgb(148, 163, 184);
}

.position-indicator-gold {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%);
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.position-indicator-silver {
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.25) 0%, rgba(100, 116, 139, 0.25) 100%);
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.position-indicator-bronze {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.25) 0%, rgba(180, 83, 9, 0.25) 100%);
  border: 1px solid rgba(205, 127, 50, 0.4);
}

/* Avatar du joueur */
.player-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  border-radius: 50%;
  font-size: 0.625rem;
  font-weight: 700;
  color: white;
}

.player-avatar-default {
  background: linear-gradient(135deg, rgb(71, 85, 105) 0%, rgb(51, 65, 85) 100%);
}

.player-avatar-qualified {
  background: linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

.player-avatar-current {
  background: linear-gradient(135deg, rgb(6, 182, 212) 0%, rgb(99, 102, 241) 100%);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}

.player-avatar-eliminated {
  background: linear-gradient(135deg, rgb(244, 63, 94) 0%, rgb(225, 29, 72) 100%);
  opacity: 0.6;
}

/* Points de statut */
.status-dot-active {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: rgb(16, 185, 129);
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
}

/* Textes de statut */
.status-ko {
  color: rgb(251, 113, 133);
  font-weight: 700;
}

.status-eliminated {
  color: rgb(251, 191, 36);
}

.status-disconnected {
  color: rgb(100, 116, 139);
}

.status-active {
  color: rgb(110, 231, 183);
}

/* Badge de score */
.score-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  flex-shrink: 0;
  min-width: 2.5rem;
}

.score-badge-default {
  background: linear-gradient(135deg, rgba(71, 85, 105, 0.2) 0%, rgba(51, 65, 85, 0.2) 100%);
  border: 1px solid rgba(71, 85, 105, 0.3);
  color: rgb(148, 163, 184);
}

.score-badge-qualified {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: rgb(110, 231, 183);
  text-shadow: 0 0 8px rgba(110, 231, 183, 0.4);
}

.score-badge-eliminated {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(225, 29, 72, 0.15) 100%);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: rgb(251, 113, 133);
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .scoreboard-item {
    padding: 0.4rem;
  }
  
  .player-avatar {
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.5625rem;
  }
  
  .position-indicator {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .score-badge {
    padding: 0.2rem 0.4rem;
    min-width: 2rem;
  }
}
</style>