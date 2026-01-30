<template>
  <section
    class="history-container flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border border-slate-700/50 bg-gradient-to-br from-slate-900/70 to-slate-950/60 p-2.5 backdrop-blur-sm sm:p-3"
    aria-label="Historique des mots"
  >
    <!-- Titre -->
    <div class="mb-2 flex flex-shrink-0 items-center gap-1.5 border-b border-slate-700/30 pb-2">
      <span class="text-base">📝</span>
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        Historique
      </p>
      <span v-if="displayHistory.length" class="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-bold text-cyan-300">
        {{ displayHistory.length }}
      </span>
    </div>

    <!-- Liste des mots -->
    <ul
      v-if="displayHistory.length"
      class="history-scroll flex-1 space-y-1 overflow-y-auto pr-0.5"
    >
      <li
        v-for="entry in displayHistory"
        :key="entry.id"
        class="history-item"
      >
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <!-- Avatar du joueur -->
          <div class="player-avatar">
            {{ entry.playerName.charAt(0).toUpperCase() }}
          </div>
          
          <!-- Contenu -->
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-semibold text-white sm:text-sm">{{ entry.playerName }}</p>
            <p class="text-[9px] text-slate-500 sm:text-[10px]">{{ entry.time }}</p>
          </div>
        </div>
        
        <!-- Mot et points -->
        <div class="flex items-center gap-1.5">
          <span class="word-badge">
            <span
              v-for="(letter, index) in entry.word.split('')"
              :key="`${entry.id}-${index}`"
              :class="entry.wildcardIndices.includes(index) ? 'wildcard-letter' : ''"
            >
              {{ letter }}
            </span>
          </span>
          <span class="points-badge">
            +{{ entry.points }}
          </span>
        </div>
      </li>
    </ul>

    <!-- Message vide -->
    <div v-else class="flex flex-1 items-center justify-center">
      <div class="text-center">
        <span class="mb-2 block text-2xl opacity-30">📭</span>
        <p class="text-xs text-slate-500">Aucun mot validé</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useMultiplayerStore } from '../useMultiplayerStore';

const store = useMultiplayerStore();
const { wordHistory } = storeToRefs(store);

const displayHistory = computed(() => wordHistory.value.slice(0, 20));
</script>

<style scoped>
/* FORCE L'AFFICHAGE - Enlève tout display:none */
.history-container {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Scrollbar personnalisée */
.history-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(6, 182, 212, 0.3) rgba(15, 23, 42, 0.3);
}

.history-scroll::-webkit-scrollbar {
  width: 4px;
}

.history-scroll::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.3);
  border-radius: 2px;
}

.history-scroll::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.3);
  border-radius: 2px;
  transition: background 0.2s ease;
}

.history-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(6, 182, 212, 0.5);
}

/* Items de l'historique */
.history-item {
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

.history-item:hover {
  border-color: rgba(6, 182, 212, 0.4);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  transform: translateX(2px);
}

/* Avatar du joueur */
.player-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(6, 182, 212) 0%, rgb(99, 102, 241) 100%);
  font-size: 0.625rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
}

/* Badge mot */
.word-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.05rem;
  padding: 0.2rem 0.45rem;
  border-radius: 0.4rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.4);
  font-size: 0.7rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}

.wildcard-letter {
  color: #fb923c;
}

/* Badge de points */
.points-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-size: 0.75rem;
  font-weight: 700;
  color: rgb(110, 231, 183);
  text-shadow: 0 0 8px rgba(110, 231, 183, 0.4);
  white-space: nowrap;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .history-item {
    padding: 0.4rem;
  }
  
  .player-avatar {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.5625rem;
  }
  
  .points-badge {
    padding: 0.2rem 0.4rem;
    font-size: 0.625rem;
  }
  
  .word-badge {
    font-size: 0.6rem;
  }
}
</style>
