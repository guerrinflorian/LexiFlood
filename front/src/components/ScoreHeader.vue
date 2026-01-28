<template>
  <div class="score-header">
    <div class="info-badges">
      <div class="badge">
        <svg class="badge-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        <span class="badge-label">Meilleur</span>
        <span class="badge-value">{{ highScore }}</span>
      </div>
      
      <div class="badge badge-status">
        <span class="status-dot"></span>
        <span class="badge-text">En cours</span>
      </div>

      <!-- Alerte de débordement inline -->
      <transition name="alert-slide">
        <div v-if="overflowCountdown !== null" class="badge badge-overflow">
          <svg class="overflow-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="overflow-text">
            <strong>{{ overflowCountdown }}s</strong>
          </span>
          <q-linear-progress
            v-if="overflowCountdown <= 5"
            rounded
            size="3px"
            color="warning"
            track-color="orange-900"
            class="overflow-progress"
            :value="overflowProgress"
          />
        </div>
      </transition>
    </div>

    <div class="score-circle">
      <span class="score-label">Score</span>
      <span class="score-value">{{ score }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useGameStore } from '../stores/useGameStore';

const store = useGameStore();
const { score, highScore, overflowCountdown } = storeToRefs(store);

const overflowProgress = computed(() => {
  if (overflowCountdown.value === null) {
    return 0;
  }
  return Math.min(1, Math.max(0, overflowCountdown.value / 5));
});
</script>

<style scoped>
.score-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  padding-right: 4rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(100, 116, 139, 0.3);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
}

.info-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.675rem;
  border-radius: 9999px;
  border: 1px solid rgba(71, 85, 105, 0.4);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  font-size: 0.75rem;
  color: #cbd5e1;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.badge:hover {
  border-color: rgba(100, 116, 139, 0.5);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%);
}

.badge-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: #fbbf24;
  flex-shrink: 0;
}

.badge-label {
  font-weight: 500;
  color: #94a3b8;
}

.badge-value {
  font-weight: 700;
  color: #ffffff;
  font-size: 0.8125rem;
}

.badge-status {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
  border-color: rgba(16, 185, 129, 0.3);
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.badge-text {
  font-weight: 600;
  color: #d1fae5;
}

.score-circle {
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 2px solid rgba(59, 130, 246, 0.5);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(59, 130, 246, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.score-circle:hover {
  border-color: rgba(59, 130, 246, 0.7);
  box-shadow: 
    0 6px 8px -1px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(59, 130, 246, 0.4),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
  transform: translateY(-50%) scale(1.05);
}

.score-label {
  font-size: 0.5625rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  font-weight: 700;
  line-height: 1;
}

.score-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
  margin-top: 0.125rem;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

/* Badge d'alerte de débordement inline */
.badge-overflow {
  position: relative;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.25) 0%, rgba(180, 83, 9, 0.2) 100%);
  border-color: rgba(251, 191, 36, 0.6);
  padding: 0.375rem 0.675rem 0.5rem 0.675rem;
  animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%, 100% {
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
  }
}

.overflow-icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
  color: #fbbf24;
  animation: pulse-warning 2s ease-in-out infinite;
}

@keyframes pulse-warning {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

.overflow-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: #fef3c7;
  white-space: nowrap;
}

.overflow-text strong {
  color: #fbbf24;
  font-size: 0.875rem;
}

.overflow-progress {
  position: absolute;
  bottom: 2px;
  left: 0.5rem;
  right: 0.5rem;
}

/* Transitions */
.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 0.3s ease;
}

.alert-slide-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.alert-slide-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 640px) {
  .score-header {
    padding: 0.75rem 0.875rem;
    padding-right: 4.5rem;
  }

  .badge {
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
  }

  .badge-icon {
    width: 0.875rem;
    height: 0.875rem;
  }

  .badge-value {
    font-size: 0.8125rem;
  }

  .score-circle {
    width: 3.5rem;
    height: 3.5rem;
    right: 0.75rem;
  }

  .score-value {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .badge-label {
    display: none;
  }
  
  .badge {
    gap: 0.375rem;
  }
}
</style>