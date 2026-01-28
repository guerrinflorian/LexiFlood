<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-100">
    <LandingPage v-if="view === 'landing'" @start-solo="handleSolo" />
    <GameView v-else />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LandingPage from './pages/LandingPage.vue';
import GameView from './pages/GameView.vue';
import { useGameStore } from './stores/useGameStore';

const store = useGameStore();
const { startSolo, setPlayerName } = store;
const view = ref<'landing' | 'game'>('landing');

const handleSolo = (pseudo: string) => {
  setPlayerName(pseudo);
  startSolo();
  view.value = 'game';
};
</script>
