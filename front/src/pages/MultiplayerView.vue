<template>
  <div class="relative flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <transition name="multiplier-pop">
      <div
        v-if="multiplierPopupVisible"
        class="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
        aria-hidden="true"
      >
        <div class="rounded-3xl border border-orange-300/30 bg-slate-950/30 px-8 py-5 text-center shadow-[0_0_40px_rgba(251,146,60,0.35)] backdrop-blur-sm">
          <p class="text-[10px] font-bold uppercase tracking-[0.35em] text-orange-200/80">Multiplicateur</p>
          <p class="mt-1 text-5xl font-black text-orange-200 drop-shadow-[0_0_18px_rgba(251,146,60,0.45)] sm:text-6xl">
            x{{ multiplierPopupLabel }}
          </p>
        </div>
      </div>
    </transition>
    <div
      class="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-30"
      :style="{ backgroundImage: `url(${backgroundGame})` }"
      aria-hidden="true"
    ></div>
    <!-- Effet de fond futuriste -->
    <div class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent"></div>
    <div class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>

    <MultiplayerHeader
      v-if="phase !== 'entry'"
      :phase="phase"
      :room-code="roomCode"
      :round-index="roundIndex"
      :total-rounds="totalRounds"
      :time-progress="timeProgress"
      :time-left-ms="timeLeftMs"
      :my-score="myScore"
      :my-rank="myRank"
      :total-players="totalPlayers"
      :qualification-label="qualificationState.label"
      :qualification-icon="qualificationState.icon"
      :qualification-class="qualificationState.className"
      @quit="confirmQuit"
    />

    <MultiplayerEntry
      v-if="phase === 'entry'"
      v-model:room-input="roomInput"
      @create="handleCreate"
      @join="handleJoin"
      @quit="confirmQuit"
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
      :outcome="finalOutcome"
      :final-scoreboard="finalScoreboard"
      @back-to-menu="returnToMenu"
    />

    <div v-if="phase !== 'entry' && phase !== 'lobby'" class="relative z-10 border-t border-slate-800/50 bg-gradient-to-t from-slate-950/98 via-slate-950/95 to-transparent px-3 pb-4 pt-3 backdrop-blur-md md:px-4 md:pb-5">
      <div class="flex items-end gap-2 md:gap-3">
        <ScoreMultiplierGauge :multiplier="scoreMultiplier" />
        <div class="flex-1">
          <MultiplayerBoard />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import backgroundGame from '../assets/background_game.png';
import MultiplayerBoard from '../multiplayer/components/MultiplayerBoard.vue';
import MultiplayerEntry from '../multiplayer/components/MultiplayerEntry.vue';
import MultiplayerFinalOverlay from '../multiplayer/components/MultiplayerFinalOverlay.vue';
import MultiplayerHeader from '../multiplayer/components/MultiplayerHeader.vue';
import MultiplayerLobby from '../multiplayer/components/MultiplayerLobby.vue';
import MultiplayerRoundEndOverlay from '../multiplayer/components/MultiplayerRoundEndOverlay.vue';
import MultiplayerRoundSection from '../multiplayer/components/MultiplayerRoundSection.vue';
import ScoreMultiplierGauge from '../components/ScoreMultiplierGauge.vue';
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
  finalResult,
  playerName,
  scoreMultiplier
} = storeToRefs(store);
const {
  createRoom,
  joinRoom,
  startGame,
  submitWord,
  clearSelection,
  leaveRoom,
  returnToLobby,
  selectLetterFromKeyboard,
  removeLastSelectedLetter
} = store;

const roomInput = ref('');
const $q = useQuasar();
const multiplierPopupVisible = ref(false);
const multiplierPopupValue = ref(1);
let multiplierPopupTimeout: ReturnType<typeof setTimeout> | null = null;

const multiplierPopupLabel = computed(() => {
  const raw = multiplierPopupValue.value.toFixed(2);
  return raw.replace(/\.?0+$/, '');
});
const handleKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
    return;
  }
  if (event.key === 'Backspace') {
    event.preventDefault();
    removeLastSelectedLetter();
    return;
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    submitWord();
    return;
  }
  if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
    event.preventDefault();
    selectLetterFromKeyboard(event.key);
  }
};

const myScore = computed(() => {
  const me = scoreboard.value.find((p) => p.id === playerId.value);
  return me?.score ?? 0;
});

const myRank = computed(() => {
  const me = scoreboard.value.find((p) => p.id === playerId.value);
  if (!me) {
    return null;
  }
  if (me.position) {
    return me.position;
  }
  const sorted = [...scoreboard.value].sort((a, b) => b.score - a.score);
  const index = sorted.findIndex((player) => player.id === playerId.value);
  return index === -1 ? null : index + 1;
});

const totalPlayers = computed(() => scoreboard.value.length);

const qualificationState = computed(() => {
  const base = {
    label: 'En attente',
    icon: 'hourglass_top',
    className: 'border-slate-600/60 bg-slate-900/50 text-slate-200'
  };
  const me = scoreboard.value.find((player) => player.id === playerId.value);
  if (!me) {
    return base;
  }
  if (me.eliminated || me.ko) {
    return {
      label: 'Éliminé',
      icon: 'cancel',
      className: 'border-rose-500/60 bg-rose-500/10 text-rose-200'
    };
  }
  if (phase.value === 'roundEnd' && roundResult.value) {
    if (roundResult.value.qualifiedIds.includes(playerId.value)) {
      return {
        label: 'Qualifié',
        icon: 'check_circle',
        className: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200'
      };
    }
    if (roundResult.value.eliminatedIds.includes(playerId.value)) {
      return {
        label: 'Éliminé',
        icon: 'cancel',
        className: 'border-rose-500/60 bg-rose-500/10 text-rose-200'
      };
    }
  }
  if (phase.value === 'inRound' && targetQualified.value > 0 && myRank.value !== null) {
    if (myRank.value <= targetQualified.value) {
      return {
        label: 'Qualifié',
        icon: 'check_circle',
        className: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200'
      };
    }
    return {
      label: 'Non qualifié',
      icon: 'priority_high',
      className: 'border-amber-400/60 bg-amber-400/10 text-amber-200'
    };
  }
  return base;
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
const finalOutcome = computed(() => {
  if (finalResult.value?.isDraw) {
    return 'draw';
  }
  if (finalResult.value?.winnerId && finalResult.value?.winnerId === playerId.value) {
    return 'victory';
  }
  return 'defeat';
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

watch(
  scoreMultiplier,
  (next, prev) => {
    if (typeof prev !== 'number' || typeof next !== 'number') {
      return;
    }
    if (next <= prev) {
      return;
    }
    multiplierPopupValue.value = next;
    multiplierPopupVisible.value = true;
    if (multiplierPopupTimeout) {
      clearTimeout(multiplierPopupTimeout);
      multiplierPopupTimeout = null;
    }
    multiplierPopupTimeout = setTimeout(() => {
      multiplierPopupVisible.value = false;
      multiplierPopupTimeout = null;
    }, 1500);
  },
  { flush: 'post' }
);

const handleCreate = () => {
  createRoom(playerName.value);
};

const handleJoin = () => {
  if (!roomInput.value.trim()) {
    return;
  }
  joinRoom(roomInput.value, playerName.value);
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

const returnToMenu = () => {
  returnToLobby();
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (multiplierPopupTimeout) {
    clearTimeout(multiplierPopupTimeout);
    multiplierPopupTimeout = null;
  }
});
</script>

<style scoped>
.multiplier-pop-enter-active,
.multiplier-pop-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.multiplier-pop-enter-from,
.multiplier-pop-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
