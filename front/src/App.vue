<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <LandingPage v-if="view === 'landing'" @start-solo="handleSolo" @start-multi="handleMulti" />
    <GameView v-else />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LandingPage from './pages/LandingPage.vue';
import GameView from './pages/GameView.vue';
import { useGameStore } from './stores/useGameStore';

const store = useGameStore();
const { startSolo, startMulti, setPlayerName } = store;
const view = ref<'landing' | 'game'>('landing');

const handleSolo = (pseudo: string) => {
  setPlayerName(pseudo);
  startSolo();
  view.value = 'game';
};

const handleMulti = (pseudo: string) => {
  setPlayerName(pseudo);
  startMulti(20);
  view.value = 'game';
};
</script>
