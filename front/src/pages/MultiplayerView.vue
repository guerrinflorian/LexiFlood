<template>
  <div class="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <GameBackground :image="backgroundGame" />

    <MultiplayerHeader
      :phase="phase"
      :room-code="roomCode"
      :round-index="roundIndex"
      :total-rounds="totalRounds"
      :time-progress="timeProgress"
      :my-score="myScore"
      @quit="confirmQuit"
    />

    <MultiplayerEntry
      v-if="phase === 'entry'"
      v-model:pseudo="pseudo"
      v-model:room-input="roomInput"
      @create="handleCreate"
      @join="handleJoin"
    />

    <MultiplayerLobby
      v-else-if="phase === 'lobby'"
      :room-code="roomCode"
      :players="players"
      :host-id="hostId"
      :can-start="canStart"
      @start="startGame"
    />

    <MultiplayerRoundSection
      v-else
      :scoreboard="scoreboard"
      :player-id="playerId"
      :round-index="roundIndex"
      :total-rounds="totalRounds"
      :time-left-ms="timeLeftMs"
      :duration-ms="durationMs"
      :target-qualified="targetQualified"
      :phase="phase"
      :qualified-ids="roundResult?.qualifiedIds ?? []"
      :eliminated-ids="roundResult?.eliminatedIds ?? []"
      :current-word="currentWord"
      :word-preview="wordPreview"
      @clear="clearSelection"
      @submit="submitWord"
    />

    <MultiplayerRoundEndOverlay
      v-if="phase === 'roundEnd'"
      :round-index="roundIndex"
      :intermission-countdown="intermissionCountdown"
      :qualified-players="qualifiedPlayers"
      :eliminated-players="eliminatedPlayers"
    />

    <MultiplayerFinalOverlay
      v-if="phase === 'finished'"
      :winner-name="winnerName"
      :final-scoreboard="finalScoreboard"
    />

    <div v-if="phase !== 'entry' && phase !== 'lobby'" class="relative z-10 border-t border-slate-800/50 bg-gradient-to-t from-slate-950/98 via-slate-950/95 to-transparent px-3 pb-4 pt-3 backdrop-blur-md md:px-4 md:pb-5">
      <MultiplayerBoard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import backgroundGame from '../assets/background_game.png';
import GameBackground from '../components/GameBackground.vue';
import MultiplayerBoard from '../multiplayer/components/MultiplayerBoard.vue';
import MultiplayerEntry from '../multiplayer/components/MultiplayerEntry.vue';
import MultiplayerFinalOverlay from '../multiplayer/components/MultiplayerFinalOverlay.vue';
import MultiplayerHeader from '../multiplayer/components/MultiplayerHeader.vue';
import MultiplayerLobby from '../multiplayer/components/MultiplayerLobby.vue';
import MultiplayerRoundEndOverlay from '../multiplayer/components/MultiplayerRoundEndOverlay.vue';
import MultiplayerRoundSection from '../multiplayer/components/MultiplayerRoundSection.vue';
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
  intermissionCountdown,
  currentWord,
  wordPreview,
  roundResult,
  finalResult
} = storeToRefs(store);
const { createRoom, joinRoom, startGame, submitWord, clearSelection, leaveRoom } = store;

const pseudo = ref('');
const roomInput = ref('');
const $q = useQuasar();

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
const qualifiedPlayers = computed(() => {
  const qualifiedIds = roundResult.value?.qualifiedIds ?? [];
  return scoreboard.value.filter((player) => qualifiedIds.includes(player.id));
});

const finalScoreboard = computed(() => finalResult.value?.scoreboard ?? scoreboard.value);
const winnerName = computed(() => {
  const winnerId = finalResult.value?.winnerId;
  return finalScoreboard.value.find((player) => player.id === winnerId)?.name ?? 'Champion';
});

const lastRoundNotified = ref<number | null>(null);
watch(
  () => roundResult.value?.roundIndex,
  (roundIndexValue) => {
    if (roundIndexValue === undefined || roundIndexValue === null) {
      return;
    }
    if (lastRoundNotified.value === roundIndexValue) {
      return;
    }
    lastRoundNotified.value = roundIndexValue;
    const eliminatedIds = roundResult.value?.eliminatedIds ?? [];
    const qualifiedIds = roundResult.value?.qualifiedIds ?? [];
    const isEliminated = eliminatedIds.includes(playerId.value);
    const isQualified = qualifiedIds.includes(playerId.value);
    if (isEliminated) {
      $q.notify({
        message: 'Vous êtes éliminé et passez en mode spectateur.',
        color: 'negative',
        position: 'top',
        timeout: 3500
      });
      $q.dialog({
        title: 'Éliminé',
        message: 'Vous êtes éliminé. Vous pouvez continuer à observer la partie en mode spectateur.',
        ok: { label: 'Compris', color: 'negative', unelevated: true, rounded: true },
        dark: true,
        class: 'lexi-dialog'
      });
      return;
    }
    if (isQualified) {
      $q.notify({
        message: 'Qualifié pour le prochain round !',
        color: 'positive',
        position: 'top',
        timeout: 3000
      });
      $q.dialog({
        title: 'Qualifié',
        message: 'Bravo ! Vous êtes qualifié pour le prochain round.',
        ok: { label: 'Continuer', color: 'primary', unelevated: true, rounded: true },
        dark: true,
        class: 'lexi-dialog'
      });
    }
  }
);

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
