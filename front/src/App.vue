<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-slate-900">
      <q-toolbar>
        <q-toolbar-title class="text-lg font-semibold">LexiFlood</q-toolbar-title>
        <div class="text-xs text-slate-300">Tetris × Scrabble</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="p-6">
        <div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <GameHeader />

          <q-card class="bg-slate-900 text-slate-100">
            <q-card-section class="flex flex-col gap-4">
              <div class="flex flex-wrap items-center gap-4">
                <q-btn
                  color="indigo"
                  label="Solo Endless"
                  @click="startSolo"
                />
                <div class="flex items-center gap-2">
                  <q-input
                    v-model.number="playerCount"
                    type="number"
                    min="2"
                    max="20"
                    dense
                    outlined
                    label="Joueurs (2-20)"
                    class="w-32"
                  />
                  <q-btn
                    color="purple"
                    label="Multijoueur"
                    @click="startMultiGame"
                  />
                </div>
                <q-btn flat color="grey-4" label="Nettoyer" @click="clearSelection" />
                <q-btn
                  color="teal"
                  label="Valider"
                  :disable="gameOver || currentWord.length === 0"
                  @click="validateSelection"
                />
              </div>

              <div class="text-sm text-slate-300">
                Rack max : 20 lettres · Spawn toutes les 0.8s · Score = taille²
              </div>
            </q-card-section>
          </q-card>

          <div class="flex flex-col gap-4 rounded-2xl bg-slate-900 p-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="text-lg font-semibold">Mot en cours</div>
              <div class="rounded-full bg-slate-800 px-4 py-2 text-base font-semibold">
                {{ currentWord || '—' }}
              </div>
            </div>
            <GameBoard />
            <div
              v-if="lastValidation"
              class="rounded-xl border border-indigo-500/30 bg-slate-950/60 p-3 text-sm text-indigo-200"
            >
              {{ lastValidation }}
            </div>
            <div v-if="gameOver" class="text-center text-xl font-semibold text-rose-400">
              Partie terminée
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import GameBoard from './components/GameBoard.vue';
import GameHeader from './components/GameHeader.vue';
import { useGameStore } from './stores/useGameStore';

const store = useGameStore();
const { currentWord, gameOver, lastValidation } = storeToRefs(store);
const { startSolo, startMulti, validateSelection, clearSelection } = store;

const playerCount = ref(8);

const startMultiGame = () => {
  startMulti(playerCount.value);
};
</script>
