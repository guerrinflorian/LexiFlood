<template>
  <aside class="flex h-full items-center">
    <div class="multiplier-gauge">
      <div class="gauge-container">
        <!-- Forme en trapèze avec clip-path -->
        <div class="gauge-bg"></div>
        <div class="gauge-fill" :style="{ height: fillHeight }"></div>
        <div class="gauge-border-left"></div>
        <div class="gauge-border-right"></div>
      </div>
      
      <div class="multiplier-label">
        <p class="label-text">MULTI</p>
        <p class="multiplier-value">×{{ formattedMultiplier }}</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  multiplier: number;
  min?: number;
  max?: number;
}>();

const fillRatio = computed(() => {
  const minVal = props.min ?? 0.75;
  const maxVal = props.max ?? 4;
  
  // Si on est en dessous du minimum, jauge vide
  if (props.multiplier <= minVal) return 0;
  
  // Si on est au dessus du maximum, jauge pleine
  if (props.multiplier >= maxVal) return 1;
  
  // Calculer le pourcentage entre min et max
  // À x1 : (1 - 0.75) / (4 - 0.75) = 0.25 / 3.25 ≈ 0.077 (7.7%)
  // On multiplie par 1.5 pour rendre plus visible : ~11.5%
  const range = maxVal - minVal;
  const rawRatio = (props.multiplier - minVal) / range;
  
  // Augmenter la sensibilité au début pour mieux voir
  return Math.min(1, rawRatio * 1.3);
});

const fillHeight = computed(() => `${Math.round(fillRatio.value * 100)}%`);

const formattedMultiplier = computed(() => {
  const raw = props.multiplier.toFixed(2);
  return raw.replace(/\.?0+$/, '');
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');

.multiplier-gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.375rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(6, 182, 212, 0.3);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 0 20px rgba(6, 182, 212, 0.15);
  backdrop-filter: blur(12px);
  width: 3.5rem;
}

.gauge-container {
  position: relative;
  width: 1.75rem;
  height: 7rem;
}

.gauge-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
  clip-path: polygon(25% 0%, 75% 0%, 65% 100%, 35% 100%);
  box-shadow: 
    inset 0 2px 8px rgba(0, 0, 0, 0.6),
    inset 0 -2px 4px rgba(71, 85, 105, 0.3);
}

.gauge-bg::before {
  content: '';
  position: absolute;
  inset: 2px;
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.6) 0%, rgba(2, 6, 23, 0.9) 100%);
  clip-path: polygon(25% 0%, 75% 0%, 65% 100%, 35% 100%);
}

.gauge-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    #dc2626 0%,
    #ef4444 15%,
    #f97316 30%,
    #fb923c 45%,
    #fbbf24 60%,
    #fcd34d 80%,
    #fde047 100%
  );
  clip-path: polygon(25% 0%, 75% 0%, 65% 100%, 35% 100%);
  transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 0 15px rgba(251, 191, 36, 0.7),
    inset 0 2px 6px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
}

.gauge-fill::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  clip-path: polygon(25% 0%, 75% 0%, 65% 100%, 35% 100%);
  animation: shine-pulse 2s ease-in-out infinite;
}

.gauge-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    135deg,
    transparent,
    transparent 3px,
    rgba(0, 0, 0, 0.08) 3px,
    rgba(0, 0, 0, 0.08) 6px
  );
  clip-path: polygon(25% 0%, 75% 0%, 65% 100%, 35% 100%);
}

@keyframes shine-pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.gauge-border-left,
.gauge-border-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(
    to bottom,
    rgba(6, 182, 212, 0.9) 0%,
    rgba(6, 182, 212, 0.6) 30%,
    rgba(6, 182, 212, 0.4) 50%,
    rgba(6, 182, 212, 0.6) 70%,
    rgba(6, 182, 212, 0.9) 100%
  );
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.9)) drop-shadow(0 0 12px rgba(6, 182, 212, 0.5));
  border-radius: 2px;
}

.gauge-border-left {
  left: calc(25% - 1.5px);
  transform: skewY(-3deg);
}

.gauge-border-right {
  right: calc(25% - 1.5px);
  transform: skewY(3deg);
}

.multiplier-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 0.25rem 0.375rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);
  border: 1px solid rgba(6, 182, 212, 0.3);
  width: 100%;
  min-height: 2.5rem;
}

.label-text {
  font-size: 0.4375rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(148, 163, 184);
  text-align: center;
  line-height: 1;
}

.multiplier-value {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgb(103, 232, 249);
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
  font-family: 'Orbitron', monospace;
  text-align: center;
  line-height: 1;
  width: 100%;
}

@media (min-width: 640px) {
  .multiplier-gauge {
    width: 4rem;
    gap: 0.5rem;
    padding: 0.75rem 0.5rem;
  }
  
  .gauge-container {
    width: 2.25rem;
    height: 7.5rem;
  }
  
  .multiplier-label {
    min-height: 2.75rem;
  }
  
  .label-text {
    font-size: 0.5rem;
  }
  
  .multiplier-value {
    font-size: 0.875rem;
  }
}

@media (min-width: 768px) {
  .multiplier-gauge {
    width: 4.5rem;
  }
  
  .gauge-container {
    width: 2.5rem;
    height: 8.5rem;
  }
  
  .multiplier-value {
    font-size: 1rem;
  }
}
</style>