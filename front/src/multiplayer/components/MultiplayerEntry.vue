<template>
  <section class="relative z-10 flex flex-1 items-center justify-center px-6">
    <div class="w-full max-w-lg space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center shadow-lg backdrop-blur">
      <div>
        <h2 class="text-3xl font-bold text-white">Mode multijoueur</h2>
        <p class="mt-2 text-sm text-slate-400">Crée ou rejoins une room (2 à 20 joueurs).</p>
      </div>
      <div class="space-y-4">
        <div>
          <label class="mb-2 block text-left text-xs uppercase tracking-wide text-slate-400">Code room</label>
          <input
            :value="roomInput"
            type="text"
            maxlength="4"
            placeholder="Ex: X7M4"
            class="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-base text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            @input="handleRoomInput"
          />
        </div>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          class="w-full rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-indigo-500 px-4 py-3 text-lg font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] hover:from-cyan-300 hover:via-cyan-400 hover:to-indigo-400"
          @click="emit('create')"
        >
          Créer une partie
        </button>
        <button
          type="button"
          class="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:border-cyan-400/60 hover:text-cyan-200"
          @click="emit('join')"
        >
          Rejoindre une partie
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  roomInput: string;
}>();

const emit = defineEmits<{
  (event: 'update:roomInput', value: string): void;
  (event: 'create'): void;
  (event: 'join'): void;
}>();

const handleRoomInput = (event: Event) => {
  emit('update:roomInput', (event.target as HTMLInputElement).value);
};
</script>
