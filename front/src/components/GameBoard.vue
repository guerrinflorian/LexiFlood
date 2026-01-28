<template>
  <div class="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent px-4 pb-4 pt-8">
    <div class="mx-auto max-w-7xl">
      <!-- Grille 2 lignes sur desktop, responsive sur mobile -->
      <div class="grid grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-3 md:gap-4">
        <LetterTile
          v-for="(slot, index) in slots"
          :key="slot.id"
          :letter="slot.letter"
          :selected="slot.selected"
          :error="errorIndices.includes(index)"
          :is-new="slot.isNew"
          :disabled="gameOver"
          @toggle="() => toggleSelect(index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/useGameStore';
import LetterTile from './LetterTile.vue';

const store = useGameStore();
const { slots, gameOver, errorIndices } = storeToRefs(store);
const { toggleSelect } = store;
</script>