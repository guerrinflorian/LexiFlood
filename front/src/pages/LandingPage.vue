<template>
  <div class="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 text-center text-slate-100 sm:px-6">
    <!-- Image de fond avec opacité -->
    <div
      class="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-10"
      :style="{ backgroundImage: `url(${backgroundMain})` }"
      aria-hidden="true"
    ></div>
    
    <!-- Effets de fond futuristes -->
    <div class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>
    <div class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent"></div>

    <!-- Contenu principal -->
    <div class="relative z-10 w-full max-w-md space-y-6 md:max-w-lg md:space-y-8">
      <!-- Logo -->
      <div class="flex justify-center">
        <img 
          :src="logo" 
          alt="LexiFlood Logo" 
          class="h-40 w-40 drop-shadow-[0_0_25px_rgba(56,189,248,0.6)] transition-transform hover:scale-105 sm:h-50 sm:w-50"
        />
      </div>
      
      <!-- Description -->
      <p class="text-sm text-slate-300 sm:text-base">
        Un duel de lettres néon entre <span class="font-semibold text-cyan-400">Tetris</span> et <span class="font-semibold text-indigo-400">Scrabble</span>
      </p>

      <!-- Formulaire -->
      <div class="space-y-4 md:space-y-5">
        <!-- Champ pseudo -->
        <div class="game-card space-y-2 p-4 sm:p-5">
          <label class="block text-left text-xs font-bold uppercase tracking-wider text-slate-400">
            Pseudo
          </label>
          <input
            v-model="pseudo"
            type="text"
            minlength="4"
            maxlength="12"
            placeholder="Entrez votre pseudo"
            class="w-full rounded-xl border border-slate-700/50 bg-slate-950/80 px-4 py-3 text-base text-white placeholder:text-slate-600 transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:ring-offset-2 focus:ring-offset-slate-900"
          />
          <p class="text-left text-xs text-slate-500">
            Entre 4 et 12 caractères
          </p>
        </div>

        <!-- Boutons -->
        <div class="space-y-3">
          <!-- Bouton Solo -->
          <button
            type="button"
            class="group w-full rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-600 to-indigo-600 px-5 py-3 text-base font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 sm:px-6 sm:py-3.5 sm:text-lg"
            :disabled="!isPseudoValid"
            @click="handleSolo"
          >
            <span class="flex items-center justify-center gap-2">
              <span>🎮</span>
              <span>Lancer la partie solo</span>
            </span>
          </button>

          <!-- Bouton Multijoueur -->
          <button
            type="button"
            class="group w-full rounded-xl border-2 border-slate-700/70 bg-slate-900/50 px-5 py-3 text-base font-bold text-slate-200 backdrop-blur transition-all hover:border-cyan-400/60 hover:bg-slate-800/50 hover:text-cyan-200 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-700/70 disabled:hover:bg-slate-900/50 disabled:hover:text-slate-200 sm:px-6 sm:py-3.5 sm:text-lg"
            :disabled="!isPseudoValid"
            @click="handleMulti"
          >
            <span class="flex items-center justify-center gap-2">
              <span>👥</span>
              <span>Multijoueur</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import logo from '../assets/logo.png';
import backgroundMain from '../assets/background_main.png';

const emit = defineEmits<{
  (event: 'start-solo', pseudo: string): void;
  (event: 'start-multi', pseudo: string): void;
}>();

const pseudo = ref('');
const trimmedPseudo = computed(() => pseudo.value.trim());
const isPseudoValid = computed(() => trimmedPseudo.value.length >= 4 && trimmedPseudo.value.length <= 12);
const STORAGE_KEY = 'lexiflood_player_name';

onMounted(() => {
  const storedPseudo = localStorage.getItem(STORAGE_KEY);
  if (storedPseudo) {
    pseudo.value = storedPseudo;
  }
});

watch(
  () => trimmedPseudo.value,
  (value) => {
    if (value.length >= 4 && value.length <= 12) {
      localStorage.setItem(STORAGE_KEY, value);
    }
  }
);

const handleSolo = () => {
  if (!isPseudoValid.value) {
    return;
  }
  emit('start-solo', trimmedPseudo.value);
};

const handleMulti = () => {
  if (!isPseudoValid.value) {
    return;
  }
  emit('start-multi', trimmedPseudo.value);
};
</script>

<style scoped>
/* Import Google Fonts pour le titre */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@700&display=swap');

/* Carte de jeu avec effet futuriste */
.game-card {
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%);
  border: 1px solid rgba(71, 85, 105, 0.5);
  box-shadow: 
    inset 0 2px 10px rgba(0, 0, 0, 0.3),
    0 4px 6px -1px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.game-card:hover {
  border-color: rgba(6, 182, 212, 0.3);
  box-shadow: 
    inset 0 2px 10px rgba(0, 0, 0, 0.3),
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(6, 182, 212, 0.15);
}
</style>