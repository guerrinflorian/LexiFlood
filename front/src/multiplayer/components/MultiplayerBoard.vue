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
          :disabled="phase !== 'inRound'"
          @toggle="() => toggleSelect(index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useMultiplayerStore } from '../useMultiplayerStore';
import LetterTile from '../../components/LetterTile.vue';

const store = useMultiplayerStore();
const { slots, errorIndices, phase } = storeToRefs(store);
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
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(6px, 1vw, 12px);
}

.rack-grid :deep(.letter-tile) {
  flex: 0 0 clamp(30px, 8vw, 72px);
}

@media (max-width: 640px) {
  .rack-shell {
    padding: 12px;
  }
}
</style>
