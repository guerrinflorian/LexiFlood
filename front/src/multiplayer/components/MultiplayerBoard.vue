<template>
  <div class="rack-wrapper">
    <div v-if="hasOverflow" class="overflow-bar flex items-center justify-center">
      <div class="absolute inset-0 bg-rose-600/20" :style="{ width: `${overflowProgress * 100}%`, transition: 'width 1s linear' }"></div>
      <span class="relative z-10 text-xs font-bold uppercase tracking-widest text-rose-200">Surcharge imminent !</span>
    </div>
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
import { computed } from 'vue';
import { useMultiplayerStore } from '../useMultiplayerStore';
import LetterTile from '../../components/LetterTile.vue';

const store = useMultiplayerStore();
const { slots, errorIndices, phase, overflowCountdown } = storeToRefs(store);
const { toggleSelect } = store;

const hasOverflow = computed(() => overflowCountdown.value !== null);
const overflowProgress = computed(() => {
  if (overflowCountdown.value === null) return 0;
  return overflowCountdown.value / 5; // 5 seconds max
});
</script>

<style scoped>
.rack-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 16px 20px;
  background: linear-gradient(180deg, rgba(5, 8, 18, 0) 0%, rgba(5, 8, 18, 0.7) 100%);
}

.overflow-bar {
  width: min(600px, 100%);
  height: 24px;
  background: rgba(225, 29, 72, 0.2);
  border: 1px solid rgba(225, 29, 72, 0.5);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 15px rgba(225, 29, 72, 0.3);
  animation: pulse-red 1s infinite;
}

@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 15px rgba(225, 29, 72, 0.3); border-color: rgba(225, 29, 72, 0.5); }
  50% { box-shadow: 0 0 25px rgba(225, 29, 72, 0.6); border-color: rgba(225, 29, 72, 0.8); }
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
