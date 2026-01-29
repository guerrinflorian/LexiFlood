<template>
  <div class="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80">
    <div class="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-center">
      <h3 class="text-2xl font-bold text-white">Fin du round</h3>
      <p class="mt-2 text-sm text-slate-400">
        Round {{ roundIndex + 1 }} terminé. Prochain round dans
        <span class="font-semibold text-cyan-300">{{ intermissionCountdown ?? 0 }}</span>s.
      </p>
      <div class="mt-5 grid gap-4 text-left md:grid-cols-2">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-emerald-300">Qualifiés</p>
          <ul class="mt-2 space-y-1 text-sm text-slate-200">
            <li v-for="player in qualifiedPlayers" :key="player.id">{{ player.name }}</li>
            <li v-if="!qualifiedPlayers.length" class="text-slate-500">Aucun qualifié.</li>
          </ul>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-rose-300">Éliminations</p>
          <ul class="mt-2 space-y-1 text-sm text-slate-200">
            <li v-for="player in eliminatedPlayers" :key="player.id">{{ player.name }}</li>
            <li v-if="!eliminatedPlayers.length" class="text-slate-500">Personne n'est éliminé.</li>
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
