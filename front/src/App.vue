<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-100">
    <LandingPage v-if="view === 'landing'" @start-solo="handleSolo" @start-multi="handleMulti" />
    <GameView v-else-if="view === 'solo'" @quit="handleQuit" />
    <MultiplayerView v-else @quit="handleQuit" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LandingPage from './pages/LandingPage.vue';
import GameView from './pages/GameView.vue';
import MultiplayerView from './pages/MultiplayerView.vue';
import { useGameStore } from './stores/useGameStore';

const store = useGameStore();
const { startSolo, setPlayerName, resetGame } = store;
const view = ref<'landing' | 'solo' | 'multi'>('landing');

const handleSolo = (pseudo: string) => {
  setPlayerName(pseudo);
  startSolo();
  view.value = 'solo';
};

const handleMulti = () => {
  view.value = 'multi';
};

const handleQuit = () => {
  resetGame();
  view.value = 'landing';
};
</script>
