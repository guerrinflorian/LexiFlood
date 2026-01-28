<template>
  <div class="rack-wrapper">
    <div class="rack-shell">
      <div class="rack-grid">
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

<style scoped>
.rack-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 12px 16px 20px;
  background: linear-gradient(180deg, rgba(5, 8, 18, 0) 0%, rgba(5, 8, 18, 0.7) 100%);
}

.rack-shell {
  width: min(1200px, 100%);
  padding: 18px;
  border-radius: 28px;
  background: rgba(8, 14, 26, 0.75);
  border: 1px solid rgba(32, 243, 255, 0.35);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55), 0 0 40px rgba(34, 211, 238, 0.3);
  backdrop-filter: blur(14px);
  transform: perspective(900px) rotateX(6deg);
}

.rack-grid {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: clamp(6px, 1vw, 12px);
}

@media (max-width: 640px) {
  .rack-shell {
    padding: 12px;
  }
}
</style>
