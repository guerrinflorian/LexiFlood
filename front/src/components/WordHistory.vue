<template>
  <section
    class="word-history"
    aria-label="Historique des mots"
  >
    <p class="history-title">
      Historique
    </p>
    <ul v-if="displayHistory.length" class="history-list">
      <li
        v-for="entry in displayHistory"
        :key="entry.id"
        class="history-item"
      >
        <div class="history-info">
          <p class="word-text">{{ entry.word }}</p>
          <p class="time-text">{{ entry.time }}</p>
        </div>
        <span class="points-text">+{{ entry.points }}</span>
      </li>
    </ul>
    <p v-else class="empty-message">
      Aucun mot validé
    </p>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useGameStore } from '../stores/useGameStore';

const store = useGameStore();
const { wordHistory } = storeToRefs(store);

const displayHistory = computed(() => wordHistory.value.slice(0, 10));
</script>

<style scoped>
.word-history {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  border-radius: 0.75rem;
  border: 1px solid rgba(100, 116, 139, 0.3);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
  padding: 0.5rem 0.75rem;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  min-height: 0;
}

.history-title {
  margin-bottom: 0.375rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #94a3b8;
}

.history-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  overflow-y: auto;
  padding-right: 0.25rem;
  min-height: 0;
}

/* Scrollbar personnalisée */
.history-list::-webkit-scrollbar {
  width: 4px;
}

.history-list::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.3);
  border-radius: 2px;
}

.history-list::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.4);
  border-radius: 2px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.6);
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(71, 85, 105, 0.4);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%);
  transition: all 0.2s ease;
}

.history-item:hover {
  border-color: rgba(100, 116, 139, 0.5);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
}

.history-info {
  flex: 1;
  min-width: 0;
}

.word-text {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 0.125rem;
}

.time-text {
  font-size: 0.625rem;
  color: #94a3b8;
  line-height: 1;
}

.points-text {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #6ee7b7;
  white-space: nowrap;
  text-shadow: 0 0 8px rgba(110, 231, 183, 0.3);
}

.empty-message {
  font-size: 0.6875rem;
  color: #64748b;
  text-align: center;
  padding: 0.5rem 0;
}

/* Responsive */
@media (max-width: 640px) {
  .word-history {
    padding: 0.4rem 0.625rem;
  }

  .history-title {
    font-size: 0.5625rem;
    margin-bottom: 0.3rem;
  }

  .history-list {
    gap: 0.3rem;
  }

  .history-item {
    padding: 0.3rem 0.4rem;
  }

  .word-text {
    font-size: 0.75rem;
  }

  .time-text {
    font-size: 0.5625rem;
  }

  .points-text {
    font-size: 0.75rem;
  }
}
</style>