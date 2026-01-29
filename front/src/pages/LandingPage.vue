<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-12 text-center text-slate-100">
    <div class="mb-10">
      <h1 class="text-5xl font-bold text-white drop-shadow-[0_0_18px_rgba(56,189,248,0.85)] sm:text-6xl">
        LexiFlood
      </h1>
      <p class="mt-3 text-sm text-slate-400 sm:text-base">
        Un duel de lettres néon entre Tetris et Scrabble, en solo.
      </p>
    </div>

    <div class="w-full max-w-md space-y-6">
      <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg backdrop-blur">
        <label class="mb-2 block text-left text-xs uppercase tracking-wide text-slate-400">Pseudo</label>
        <input
          v-model="pseudo"
          type="text"
          minlength="4"
          maxlength="12"
          placeholder="Votre pseudo"
          class="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-base text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
        />
        <p class="mt-2 text-left text-xs text-slate-400">
          4 à 12 caractères requis.
        </p>
      </div>

      <button
        type="button"
        class="w-full rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-indigo-500 px-4 py-3 text-lg font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] hover:from-cyan-300 hover:via-cyan-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!isPseudoValid"
        @click="handleSolo"
      >
        Lancer la partie solo
      </button>
      <button
        type="button"
        class="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:border-cyan-400/60 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!isPseudoValid"
        @click="handleMulti"
      >
        Multijoueur
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

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
