<template>
  <div class="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div
      class="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-30"
      :style="{ backgroundImage: `url(${backgroundGame})` }"
      aria-hidden="true"
    ></div>
    <div class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent"></div>
    <div class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>

    <header class="relative z-10 flex h-16 items-center gap-4 border-b border-slate-800/50 bg-slate-950/50 px-4 backdrop-blur-md">
      <q-btn
        flat
        round
        dense
        color="secondary"
        icon="logout"
        @click="confirmQuit"
      >
        <q-tooltip>Quitter</q-tooltip>
      </q-btn>

      <div class="flex flex-col">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Room {{ roomCode }}</span>
        <span v-if="phase === 'inRound' || phase === 'roundEnd'" class="text-sm font-bold text-slate-200">
          Round {{ roundIndex + 1 }}<span class="text-slate-500">/{{ totalRounds }}</span>
        </span>
        <span v-else class="text-sm font-bold text-slate-200">Lobby</span>
      </div>

      <div v-if="phase === 'inRound'" class="mx-2 flex flex-1 items-center">
        <q-linear-progress
          :value="timeProgress"
          color="primary"
          track-color="slate-800"
          rounded
          size="8px"
          class="w-full"
        />
      </div>
      <div v-else class="flex-1"></div>

      <div v-if="phase === 'inRound' || phase === 'roundEnd'" class="flex flex-col items-end">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mon Score</span>
        <span class="text-xl font-bold text-emerald-400">{{ myScore }}</span>
      </div>
    </header>

    <section v-if="phase === 'entry'" class="relative z-10 flex flex-1 items-center justify-center px-6">
      <div class="w-full max-w-lg space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center shadow-lg backdrop-blur">
        <div>
          <h2 class="text-3xl font-bold text-white">Mode multijoueur</h2>
          <p class="mt-2 text-sm text-slate-400">Crée ou rejoins une room (2 à 20 joueurs).</p>
        </div>
        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-left text-xs uppercase tracking-wide text-slate-400">Pseudo</label>
            <input
              v-model="pseudo"
              type="text"
              placeholder="Votre pseudo"
              class="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-base text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            />
          </div>
          <div>
            <label class="mb-2 block text-left text-xs uppercase tracking-wide text-slate-400">Code room</label>
            <input
              v-model="roomInput"
              type="text"
              maxlength="4"
              placeholder="Ex: X7M4"
              class="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-base text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            />
          </div>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            class="w-full rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-indigo-500 px-4 py-3 text-lg font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] hover:from-cyan-300 hover:via-cyan-400 hover:to-indigo-400"
            @click="handleCreate"
          >
            Créer une partie
          </button>
          <button
            type="button"
            class="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:border-cyan-400/60 hover:text-cyan-200"
            @click="handleJoin"
          >
            Rejoindre une partie
          </button>
        </div>
      </div>
    </section>

    <section v-else-if="phase === 'lobby'" class="relative z-10 flex flex-1 items-center justify-center px-6">
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
              @click="startGame"
            />
          </div>
        </div>
      </div>
    </section>

    <section v-else class="relative z-10 flex flex-1 flex-col gap-3 overflow-hidden px-3 pb-3 md:grid md:grid-cols-[300px_minmax(0,1fr)_300px] md:px-4 lg:grid-cols-[340px_minmax(0,1fr)_340px]">
      <!-- Mobile: Side-by-side scoreboard + history -->
      <div class="flex max-h-[180px] gap-2 md:hidden">
        <div class="min-w-0 flex-1">
          <MultiplayerScoreboard
            :scoreboard="scoreboard"
            :player-id="playerId"
            :round-index="roundIndex"
            :total-rounds="totalRounds"
            :time-left-ms="timeLeftMs"
            :duration-ms="durationMs"
            :target-qualified="targetQualified"
            class="mobile-compact"
          />
        </div>
        <div class="min-w-0 flex-1">
          <MultiplayerWordHistory class="mobile-compact" />
        </div>
      </div>

      <!-- Desktop: Scoreboard left column -->
      <div class="min-h-0 max-md:hidden md:col-start-1 md:block">
        <MultiplayerScoreboard
          :scoreboard="scoreboard"
          :player-id="playerId"
          :round-index="roundIndex"
          :total-rounds="totalRounds"
          :time-left-ms="timeLeftMs"
          :duration-ms="durationMs"
          :target-qualified="targetQualified"
        />
      </div>

      <div class="flex min-h-0 flex-col items-center justify-center gap-3 overflow-y-auto md:col-start-2">
        <div class="flex w-full max-w-4xl items-center justify-center gap-4 p-4">
          <q-btn
            outline
            round
            color="secondary"
            class="!h-14 !w-14 md:!h-16 md:!w-16"
            icon="backspace"
            size="18px"
            @click="clearSelection"
          >
            <q-tooltip class="text-xs">Effacer</q-tooltip>
          </q-btn>

          <div class="futuristic-inner flex-1 space-y-3 p-6 text-center md:p-8">
            <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Mot en cours</p>
            <p class="futuristic-glow flex min-h-[3rem] items-center justify-center text-4xl font-bold tracking-wide text-white md:min-h-[3.5rem] md:text-5xl" style="font-family: 'Orbitron', 'Rajdhani', 'Exo 2', monospace;">
              {{ currentWord || '—' }}
            </p>
            <div class="flex flex-wrap items-center justify-center gap-2">
              <span class="rounded-full px-3 py-1 text-xs font-bold transition-all" :class="wordPreviewClasses">
                {{ wordPreview.label }}
              </span>
              <span class="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs font-bold text-slate-200">
                {{ wordPreview.points }} pts
              </span>
            </div>
          </div>

          <q-btn
            unelevated
            round
            color="primary"
            class="futuristic-btn !h-14 !w-14 text-slate-950 md:!h-16 md:!w-16"
            icon="check_circle"
            size="18px"
            :disable="phase !== 'inRound' || currentWord.length === 0"
            @click="submitWord"
          >
            <q-tooltip class="text-xs">Valider</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Desktop: Word history right column -->
      <div class="min-h-0 max-md:hidden md:col-start-3 md:flex md:min-h-full">
        <MultiplayerWordHistory />
      </div>

      <div
        v-if="phase === 'roundEnd'"
        class="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80"
      >
        <div class="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-center">
          <h3 class="text-2xl font-bold text-white">Fin du round</h3>
          <p class="mt-2 text-sm text-slate-400">Round {{ roundIndex + 1 }} terminé. Prochain round imminent...</p>
          <div class="mt-4 text-left">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Éliminations</p>
            <ul class="mt-2 space-y-1 text-sm text-slate-200">
              <li v-for="player in eliminatedPlayers" :key="player.id">{{ player.name }}</li>
              <li v-if="!eliminatedPlayers.length" class="text-slate-500">Personne n'est éliminé.</li>
            </ul>
          </div>
        </div>
      </div>

      <div
        v-if="phase === 'finished'"
        class="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80"
      >
        <div class="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-center">
          <h3 class="text-2xl font-bold text-white">Victoire</h3>
          <p class="mt-2 text-sm text-slate-400">Bravo {{ winnerName }} !</p>
          <ul class="mt-4 space-y-2 text-left text-sm text-slate-200">
            <li v-for="player in finalScoreboard" :key="player.id" class="flex items-center justify-between">
              <span>#{{ player.position }} {{ player.name }}</span>
              <span class="font-semibold text-emerald-300">{{ player.score }} pts</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <div v-if="phase !== 'entry' && phase !== 'lobby'" class="relative z-10 border-t border-slate-800/50 bg-gradient-to-t from-slate-950/98 via-slate-950/95 to-transparent px-3 pb-4 pt-3 backdrop-blur-md md:px-4 md:pb-5">
      <MultiplayerBoard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import backgroundGame from '../assets/background_game.png';
import MultiplayerBoard from '../multiplayer/components/MultiplayerBoard.vue';
import MultiplayerScoreboard from '../multiplayer/components/MultiplayerScoreboard.vue';
import MultiplayerWordHistory from '../multiplayer/components/MultiplayerWordHistory.vue';
import { useMultiplayerStore } from '../multiplayer/useMultiplayerStore';

const emit = defineEmits<{ (event: 'quit'): void }>();

const store = useMultiplayerStore();
const {
  phase,
  roomCode,
  players,
  hostId,
  scoreboard,
  playerId,
  roundIndex,
  totalRounds,
  targetQualified,
  timeLeftMs,
  durationMs,
  currentWord,
  wordPreview,
  roundResult,
  finalResult
} = storeToRefs(store);
const { createRoom, joinRoom, startGame, submitWord, clearSelection, leaveRoom } = store;

const pseudo = ref('');
const roomInput = ref('');
const $q = useQuasar();

const wordPreviewClasses = computed(() => {
  switch (wordPreview.value.status) {
    case 'valid':
      return 'border border-emerald-500/60 bg-emerald-500/20 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    case 'used':
      return 'border border-amber-400/60 bg-amber-400/20 text-amber-100 shadow-[0_0_15px_rgba(251,191,36,0.2)]';
    case 'invalid':
      return 'border border-rose-400/60 bg-rose-400/20 text-rose-100 shadow-[0_0_15px_rgba(251,113,133,0.2)]';
    default:
      return 'border border-slate-700/70 bg-slate-900/70 text-slate-400';
  }
});

const myScore = computed(() => {
  const me = scoreboard.value.find((p) => p.id === playerId.value);
  return me?.score ?? 0;
});

const timeProgress = computed(() => {
  if (!durationMs.value) return 0;
  return Math.min(Math.max(timeLeftMs.value / durationMs.value, 0), 1);
});

const canStart = computed(() => {
  const connectedPlayers = players.value.filter((player) => player.connected);
  return connectedPlayers.length >= 2 && playerId.value === hostId.value;
});

const eliminatedPlayers = computed(() => {
  const eliminatedIds = roundResult.value?.eliminatedIds ?? [];
  return scoreboard.value.filter((player) => eliminatedIds.includes(player.id));
});

const finalScoreboard = computed(() => finalResult.value?.scoreboard ?? scoreboard.value);
const winnerName = computed(() => {
  const winnerId = finalResult.value?.winnerId;
  return finalScoreboard.value.find((player) => player.id === winnerId)?.name ?? 'Champion';
});

const handleCreate = () => {
  if (!pseudo.value.trim()) {
    $q.notify({
      message: 'Veuillez entrer un pseudo.',
      color: 'negative',
      position: 'top',
      timeout: 2000
    });
    return;
  }
  createRoom(pseudo.value);
};

const handleJoin = () => {
  if (!pseudo.value.trim()) {
    $q.notify({
      message: 'Veuillez entrer un pseudo.',
      color: 'negative',
      position: 'top',
      timeout: 2000
    });
    return;
  }
  if (!roomInput.value.trim()) {
    return;
  }
  joinRoom(roomInput.value, pseudo.value);
};


const confirmQuit = () => {
  if (phase.value === 'entry') {
    emit('quit');
    return;
  }
  $q.dialog({
    title: 'Quitter la partie ?',
    message: 'Vous quitterez la room multijoueur.',
    ok: { label: 'Quitter', color: 'negative', unelevated: true, rounded: true },
    cancel: { label: 'Rester', color: 'secondary', outline: true, rounded: true },
    dark: true,
    class: 'lexi-dialog'
  }).onOk(() => {
    leaveRoom();
    emit('quit');
  });
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@700&family=Exo+2:wght@700&display=swap');

.futuristic-inner {
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%);
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
}

.futuristic-glow {
  text-shadow: 0 2px 10px rgba(139, 92, 246, 0.3);
}

.futuristic-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow:
    0 4px 6px -1px rgba(59, 130, 246, 0.3),
    0 2px 4px -1px rgba(59, 130, 246, 0.2);
  transition: all 0.2s ease;
}

.futuristic-btn:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.03);
  box-shadow:
    0 8px 15px -1px rgba(59, 130, 246, 0.35),
    0 4px 6px -1px rgba(59, 130, 246, 0.25);
}

.mobile-compact :deep(section) {
  padding: 0.5rem !important;
  height: 100%;
}

.mobile-compact :deep(header) {
  margin-bottom: 0.25rem !important;
}

.mobile-compact :deep(.text-\[10px\]) {
  font-size: 8px !important;
}

.mobile-compact :deep(.text-xs) {
  font-size: 9px !important;
}

.mobile-compact :deep(.text-sm) {
  font-size: 10px !important;
}

.mobile-compact :deep(ul) {
  gap: 0.25rem !important;
  max-height: 120px !important;
}

.mobile-compact :deep(li) {
  padding: 0.25rem 0.5rem !important;
  font-size: 10px !important;
}

.mobile-compact :deep(.space-y-2) {
  gap: 0.25rem !important;
}

.mobile-compact :deep(.space-y-1\.5) {
  gap: 0.125rem !important;
}

.mobile-compact :deep(p) {
  margin-bottom: 0.125rem !important;
}
</style>
