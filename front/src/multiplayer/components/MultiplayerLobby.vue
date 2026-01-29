<template>
  <section class="relative z-10 flex flex-1 items-center justify-center px-6">
    <div class="w-full max-w-3xl space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-lg backdrop-blur">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-white">Lobby</h2>
          <p class="text-sm text-slate-400">Code room : <span class="text-cyan-300">{{ roomCode }}</span></p>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p class="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Joueurs</p>
          <ul class="space-y-2">
            <li
              v-for="player in players"
              :key="player.id"
              class="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/80 px-3 py-2"
            >
              <div>
                <p class="text-sm font-semibold text-white">
                  {{ player.name }}
                  <span v-if="player.id === hostId" class="ml-1 text-[10px] text-cyan-300">(Hôte)</span>
                </p>
                <p class="text-[10px] text-slate-500">{{ player.connected ? 'Connecté' : 'Déconnecté' }}</p>
              </div>
            </li>
          </ul>
        </div>

        <div class="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div>
            <p class="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Infos</p>
            <p class="text-sm text-slate-300">Minimum 2 joueurs pour lancer.</p>
            <p class="mt-2 text-sm text-slate-500">Le timing et les lettres sont synchronisés par le serveur.</p>
          </div>
          <q-btn
            unelevated
            color="primary"
            icon="play_arrow"
            label="Lancer la partie"
            :disable="!canStart"
            @click="emit('start')"
          />
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
