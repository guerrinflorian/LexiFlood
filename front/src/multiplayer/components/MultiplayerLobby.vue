<template>
  <section class="relative z-10 flex flex-1 items-center justify-center px-4 py-4 sm:px-6">
    <div class="w-full max-w-3xl space-y-3">
      <!-- En-tête du lobby -->
      <div class="futuristic-card p-3 sm:p-4">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-bold text-white drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] sm:text-xl" style="font-family: 'Orbitron', sans-serif;">
              Lobby Multijoueur
            </h2>
            <div class="mt-0.5 flex items-center gap-2">
              <span class="text-xs text-slate-400">Code :</span>
              <div class="room-code-badge">
                <span class="font-mono text-xs font-bold tracking-wider text-cyan-300 sm:text-sm">{{ roomCode }}</span>
              </div>
            </div>
          </div>
          
          <!-- Indicateur de statut -->
          <div class="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-gradient-to-br from-cyan-900/25 to-cyan-950/20 px-2.5 py-1">
            <span class="relative flex h-1.5 w-1.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
            </span>
            <span class="text-xs font-semibold text-cyan-100">En attente</span>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="grid gap-3 md:grid-cols-[1.5fr_1fr]">
        <!-- Liste des joueurs -->
        <div class="futuristic-card max-h-[calc(100vh-16rem)] overflow-y-auto p-3 sm:p-4">
          <div class="mb-2 flex items-center gap-2">
            <span class="text-lg">👥</span>
            <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Joueurs</h3>
            <span class="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300">
              {{ players.length }}
            </span>
          </div>
          
          <div class="space-y-1.5">
            <div
              v-for="player in players"
              :key="player.id"
              class="player-card"
            >
              <div class="flex items-center gap-2">
                <!-- Avatar -->
                <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-sm font-bold text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                  {{ player.name.charAt(0).toUpperCase() }}
                </div>
                
                <!-- Info joueur -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1">
                    <p class="truncate font-semibold text-white text-xs sm:text-sm">{{ player.name }}</p>
                    <span v-if="player.id === hostId" class="host-badge flex-shrink-0">
                      👑
                    </span>
                  </div>
                  <div class="flex items-center gap-1">
                    <div :class="player.connected ? 'status-dot-online' : 'status-dot-offline'"></div>
                    <p class="text-[10px] sm:text-xs" :class="player.connected ? 'text-emerald-400' : 'text-slate-500'">
                      {{ player.connected ? 'Connecté' : 'Déconnecté' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bouton de démarrage -->
        <div class="futuristic-card flex flex-col justify-center p-3 sm:p-4">
          <button
            type="button"
            class="start-game-btn"
            :class="{ 'start-game-btn-disabled': !canStart }"
            :disabled="!canStart"
            @click="emit('start')"
          >
            <span class="flex items-center justify-center gap-2">
              <span class="text-lg">▶️</span>
              <span class="font-bold text-sm">Lancer la partie</span>
            </span>
          </button>
          
          <p v-if="!canStart" class="mt-2 text-center text-xs text-amber-400">
            ⚠️ Minimum 2 joueurs requis
          </p>
          <p v-else class="mt-2 text-center text-xs text-emerald-400">
            ✓ Prêt à démarrer !
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type Player = {
  id: string;
  name: string;
  connected: boolean;
};

defineProps<{
  roomCode: string;
  players: Player[];
  hostId: string;
  canStart: boolean;
}>();

const emit = defineEmits<{ (event: 'start'): void }>();
</script>

<style scoped>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

/* Carte futuriste */
.futuristic-card {
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(71, 85, 105, 0.5);
  box-shadow: 
    inset 0 2px 10px rgba(0, 0, 0, 0.3),
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(6, 182, 212, 0.1);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

.futuristic-card:hover {
  border-color: rgba(6, 182, 212, 0.3);
  box-shadow: 
    inset 0 2px 10px rgba(0, 0, 0, 0.3),
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 0 25px rgba(6, 182, 212, 0.2);
}

/* Badge du code de room */
.room-code-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);
  border: 1px solid rgba(6, 182, 212, 0.3);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
}

/* Carte de joueur */
.player-card {
  padding: 0.625rem;
  border-radius: 0.625rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  border: 1px solid rgba(71, 85, 105, 0.4);
  transition: all 0.2s ease;
}

.player-card:hover {
  border-color: rgba(6, 182, 212, 0.4);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%);
  transform: translateX(4px);
}

/* Badge hôte */
.host-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%);
  border: 1px solid rgba(251, 191, 36, 0.3);
  font-size: 0.625rem;
}

/* Indicateurs de statut */
.status-dot-online {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background-color: rgb(52, 211, 153);
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.6);
}

.status-dot-offline {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background-color: rgb(100, 116, 139);
}

/* Bouton de démarrage */
.start-game-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.625rem;
  background: linear-gradient(135deg, #06b6d4 0%, #6366f1 100%);
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: 
    0 4px 6px -1px rgba(6, 182, 212, 0.3),
    0 2px 4px -1px rgba(6, 182, 212, 0.2),
    0 0 20px rgba(6, 182, 212, 0.4);
  transition: all 0.3s ease;
}

.start-game-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 10px 15px -3px rgba(6, 182, 212, 0.4),
    0 4px 6px -2px rgba(6, 182, 212, 0.3),
    0 0 30px rgba(6, 182, 212, 0.5);
}

.start-game-btn:active:not(:disabled) {
  transform: translateY(0);
}

.start-game-btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.5) 0%, rgba(71, 85, 105, 0.5) 100%);
  box-shadow: none;
}

.start-game-btn-disabled:hover {
  transform: none;
}

/* Scrollbar personnalisée */
.futuristic-card::-webkit-scrollbar {
  width: 6px;
}

.futuristic-card::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 3px;
}

.futuristic-card::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.3);
  border-radius: 3px;
}

.futuristic-card::-webkit-scrollbar-thumb:hover {
  background: rgba(6, 182, 212, 0.5);
}
</style>