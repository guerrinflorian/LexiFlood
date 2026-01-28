<template>
  <div class="grid w-full grid-cols-4 gap-3 sm:grid-cols-5">
    <LetterTile
      v-for="(slot, index) in slots"
      :key="slot.id"
      :letter="slot.letter"
      :selected="slot.selected"
      :disabled="gameOver"
      @toggle="() => toggleSelect(index)"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useGameStore } from '../stores/useGameStore';
import LetterTile from './LetterTile.vue';

const store = useGameStore();
const { slots, gameOver } = storeToRefs(store);
const { toggleSelect } = store;
</script>
