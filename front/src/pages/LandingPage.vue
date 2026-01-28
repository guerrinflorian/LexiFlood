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
          placeholder="Votre pseudo"
          class="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-base text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
        />
      </div>

      <button
        type="button"
        class="w-full rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-indigo-500 px-4 py-3 text-lg font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] hover:from-cyan-300 hover:via-cyan-400 hover:to-indigo-400"
        @click="handleSolo"
      >
        Lancer la partie solo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (event: 'start-solo', pseudo: string): void;
}>();

const pseudo = ref('');

const handleSolo = () => {
  emit('start-solo', pseudo.value);
};
</script>
