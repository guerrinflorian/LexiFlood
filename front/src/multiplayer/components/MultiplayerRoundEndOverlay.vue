<template>
  <div class="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm px-4">
    <div class="futuristic-overlay w-full max-w-2xl">
      <!-- En-tête -->
      <div class="border-b border-slate-700/50 pb-4 text-center">
        <div class="mb-2 flex justify-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-[0_0_25px_rgba(6,182,212,0.5)]">
            <span class="text-2xl">⏸️</span>
          </div>
        </div>
        <h3 class="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] sm:text-3xl" style="font-family: 'Orbitron', sans-serif;">
          Fin du Round {{ roundIndex + 1 }}
        </h3>
        <div class="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-gradient-to-br from-cyan-900/25 to-cyan-950/20 px-4 py-2">
          <span class="text-sm text-slate-300">Prochain round dans</span>
          <span class="countdown-badge">
            {{ intermissionCountdown ?? 0 }}s
          </span>
        </div>
      </div>

      <!-- Contenu -->
      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <!-- Qualifiés -->
        <div class="result-card result-card-qualified">
          <div class="mb-3 flex items-center gap-2">
            <span class="text-xl">✅</span>
            <h4 class="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Qualifiés</h4>
          </div>
          <ul class="space-y-2">
            <li
              v-for="player in qualifiedPlayers"
              :key="player.id"
              class="player-item player-item-qualified"
            >
              <span class="player-avatar player-avatar-qualified">
                {{ player.name.charAt(0).toUpperCase() }}
              </span>
              <span class="text-sm font-medium text-white">{{ player.name }}</span>
            </li>
            <li v-if="!qualifiedPlayers.length" class="py-3 text-center text-sm text-slate-500">
              Aucun qualifié
            </li>
          </ul>
        </div>

        <!-- Éliminés -->
        <div class="result-card result-card-eliminated">
          <div class="mb-3 flex items-center gap-2">
            <span class="text-xl">❌</span>
            <h4 class="text-xs font-bold uppercase tracking-[0.2em] text-rose-300">Éliminations</h4>
          </div>
          <ul class="space-y-2">
            <li
              v-for="player in eliminatedPlayers"
              :key="player.id"
              class="player-item player-item-eliminated"
            >
              <span class="player-avatar player-avatar-eliminated">
                {{ player.name.charAt(0).toUpperCase() }}
              </span>
              <span class="text-sm font-medium text-white">{{ player.name }}</span>
            </li>
            <li v-if="!eliminatedPlayers.length" class="py-3 text-center text-sm text-slate-500">
              Personne éliminé
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Player = {
  id: string;
  name: string;
};

defineProps<{
  roundIndex: number;
  intermissionCountdown: number | null;
  qualifiedPlayers: Player[];
  eliminatedPlayers: Player[];
}>();
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
    0 0 40px rgba(6, 182, 212, 0.2);
  backdrop-filter: blur(16px);
}

/* Badge du compte à rebours */
.countdown-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%);
  border: 1px solid rgba(6, 182, 212, 0.4);
  font-size: 1rem;
  font-weight: 700;
  font-family: monospace;
  color: rgb(103, 232, 249);
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}

/* Cartes de résultats */
.result-card {
  border-radius: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  border: 1px solid rgba(71, 85, 105, 0.4);
}

.result-card-qualified {
  border-color: rgba(16, 185, 129, 0.3);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%);
}

.result-card-eliminated {
  border-color: rgba(244, 63, 94, 0.3);
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%);
}

/* Items de joueurs */
.player-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem;
  border-radius: 0.5rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  transition: all 0.2s ease;
}

.player-item:hover {
  transform: translateX(4px);
}

.player-item-qualified {
  border-color: rgba(16, 185, 129, 0.2);
}

.player-item-qualified:hover {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.05);
}

.player-item-eliminated {
  border-color: rgba(244, 63, 94, 0.2);
}

.player-item-eliminated:hover {
  border-color: rgba(244, 63, 94, 0.4);
  background: rgba(244, 63, 94, 0.05);
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

.player-avatar-qualified {
  background: linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}

.player-avatar-eliminated {
  background: linear-gradient(135deg, rgb(244, 63, 94) 0%, rgb(225, 29, 72) 100%);
  box-shadow: 0 0 12px rgba(244, 63, 94, 0.4);
}

@media (min-width: 640px) {
  .futuristic-overlay {
    padding: 2rem;
  }
}
</style>