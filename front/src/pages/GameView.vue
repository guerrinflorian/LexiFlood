<template>
  <div class="game-container">
    <!-- Contenu scrollable -->
    <div class="game-content">
      <!-- En-tête compact avec juste le score -->
      <div class="score-row">
        <ScoreHeader />
      </div>

      <!-- Layout principal : contenu à gauche, historique à droite -->
      <div class="main-layout">
        <!-- Colonne gauche : Mot + Actions -->
        <div class="left-column">
          <!-- Zone du mot en cours -->
          <div class="word-display-card">
            <div class="word-display-inner">
              <div class="word-display-box">
                <p class="word-label">Mot en cours</p>
                <p class="word-text">
                  {{ currentWord || '—' }}
                </p>
                <div class="word-badges">
                  <span class="word-badge" :class="wordPreviewClasses">
                    {{ wordPreview.label }}
                  </span>
                  <span class="points-badge">
                    {{ wordPreview.points }} pts
                  </span>
                </div>
              </div>

              <!-- Boutons d'action -->
              <div class="action-buttons">
                <q-btn
                  outline
                  rounded
                  color="secondary"
                  class="action-btn"
                  label="Effacer"
                  icon-right="backspace"
                  @click="clearSelection"
                />
                <q-btn
                  outline
                  rounded
                  color="accent"
                  class="action-btn"
                  label="Quitter"
                  icon-right="logout"
                  @click="confirmQuit"
                />
                <q-btn
                  unelevated
                  rounded
                  color="primary"
                  class="action-btn action-btn-primary"
                  label="Valider"
                  icon-right="check_circle"
                  :disable="gameOver || currentWord.length === 0"
                  @click="submitWord"
                />
              </div>
            </div>
          </div>

          <!-- Message de fin de partie -->
          <transition name="fade">
            <div v-if="gameOver" class="game-over-message">
              <svg class="game-over-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Partie terminée
            </div>
          </transition>
        </div>

        <!-- Colonne droite : Historique -->
        <div class="right-column">
          <WordHistory />
        </div>
      </div>

      <!-- Spacer pour pousser le contenu vers le haut -->
      <div class="spacer"></div>
    </div>

    <!-- GameBoard fixé en bas -->
    <div class="gameboard-container">
      <GameBoard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import GameBoard from '../components/GameBoard.vue';
import ScoreHeader from '../components/ScoreHeader.vue';
import WordHistory from '../components/WordHistory.vue';
import { useGameStore } from '../stores/useGameStore';

const emit = defineEmits<{ (event: 'quit'): void }>();

const store = useGameStore();
const {
  currentWord,
  lastValidation,
  gameOver,
  overflowCountdown,
  wordPreview,
  score,
  highScore
} = storeToRefs(store);
const { clearSelection, submitWord, startSolo, resetGame } = store;
const $q = useQuasar();
const dialogVisible = ref(false);

const overflowProgress = computed(() => {
  if (overflowCountdown.value === null) {
    return 0;
  }
  return Math.min(1, Math.max(0, overflowCountdown.value / 5));
});

const wordPreviewClasses = computed(() => {
  switch (wordPreview.value.status) {
    case 'valid':
      return 'badge-valid';
    case 'used':
      return 'badge-used';
    case 'invalid':
      return 'badge-invalid';
    default:
      return 'badge-default';
  }
});

const showGameOverDialog = () => {
  if (dialogVisible.value) {
    return;
  }
  dialogVisible.value = true;
  $q.dialog({
    title: 'Défaite',
    message: `${lastValidation.value ?? 'Partie terminée.'}\nScore : ${score.value}\nMeilleur score : ${highScore.value}`,
    ok: { label: 'Rejouer', color: 'primary', unelevated: true, rounded: true },
    cancel: { label: "Retour à l'accueil", color: 'secondary', outline: true, rounded: true },
    dark: true,
    noFocus: true,
    noRefocus: true,
    persistent: true,
    class: 'lexi-dialog'
  })
    .onOk(() => {
      dialogVisible.value = false;
      startSolo();
    })
    .onCancel(() => {
      dialogVisible.value = false;
      resetGame();
      emit('quit');
    });
};

const confirmQuit = () => {
  $q.dialog({
    title: 'Quitter la partie ?',
    message: 'Votre progression sera perdue.',
    ok: { label: 'Quitter', color: 'negative', unelevated: true, rounded: true },
    cancel: { label: 'Continuer', color: 'secondary', outline: true, rounded: true },
    dark: true,
    noFocus: true,
    noRefocus: true,
    class: 'lexi-dialog'
  }).onOk(() => {
    resetGame();
    emit('quit');
  });
};

watch(gameOver, (value) => {
  if (value) {
    showGameOverDialog();
  }
});
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  color: #f1f5f9;
  overflow: hidden;
  position: relative;
}

.game-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at bottom, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.game-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
  min-height: 0;
}

/* Scrollbar personnalisée */
.game-content::-webkit-scrollbar {
  width: 8px;
}

.game-content::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 4px;
}

.game-content::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.5);
  border-radius: 4px;
}

.game-content::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.7);
}

/* Ligne du score en haut - pleine largeur */
.score-row {
  width: 100%;
}

/* Layout principal : 2 colonnes */
.main-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  flex: 1;
  min-height: 0;
}

@media (min-width: 768px) {
  .main-layout {
    grid-template-columns: 1fr 320px;
  }
}

@media (min-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr 360px;
  }
}

/* Colonne gauche */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 0;
}

/* Colonne droite - historique qui peut descendre */
.right-column {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

@media (max-width: 767px) {
  .right-column {
    order: -1; /* Met l'historique en haut sur mobile */
  }
}

/* Carte du mot en cours */
.word-display-card {
  border-radius: 1.25rem;
  border: 1px solid rgba(100, 116, 139, 0.3);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
  padding: 1.25rem;
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.3),
    0 4px 6px -2px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
}

.word-display-inner {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.word-display-box {
  border-radius: 1rem;
  border: 1px solid rgba(71, 85, 105, 0.5);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%);
  padding: 1.25rem 1rem;
  text-align: center;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
}

.word-label {
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 700;
  margin: 0;
}

.word-text {
  margin: 0.75rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(139, 92, 246, 0.3);
  letter-spacing: 0.05em;
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 640px) {
  .word-text {
    font-size: 2.5rem;
    min-height: 3rem;
  }
}

.word-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.word-badge,
.points-badge {
  border-radius: 9999px;
  padding: 0.4rem 1rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.025em;
  transition: all 0.2s ease;
}

.badge-valid {
  border: 1.5px solid rgba(16, 185, 129, 0.6);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
  color: #d1fae5;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
}

.badge-used {
  border: 1.5px solid rgba(251, 191, 36, 0.6);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%);
  color: #fef3c7;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.2);
}

.badge-invalid {
  border: 1.5px solid rgba(251, 113, 133, 0.6);
  background: linear-gradient(135deg, rgba(251, 113, 133, 0.15) 0%, rgba(225, 29, 72, 0.1) 100%);
  color: #fecdd3;
  box-shadow: 0 0 15px rgba(251, 113, 133, 0.2);
}

.badge-default {
  border: 1.5px solid rgba(71, 85, 105, 0.5);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%);
  color: #94a3b8;
}

.points-badge {
  border: 1.5px solid rgba(71, 85, 105, 0.5);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%);
  color: #cbd5e1;
}

/* Boutons d'action */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.action-btn {
  flex: 1 1 auto;
  min-width: 120px;
  max-width: 200px;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;
}

@media (max-width: 640px) {
  .action-btn {
    min-width: 100px;
    font-size: 0.8rem;
    padding: 0.6rem 1.2rem;
  }
}

.action-btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #0f172a;
  font-weight: 700;
  box-shadow: 
    0 4px 6px -1px rgba(59, 130, 246, 0.3),
    0 2px 4px -1px rgba(59, 130, 246, 0.2);
}

.action-btn-primary:hover:not(:disabled) {
  box-shadow: 
    0 10px 15px -3px rgba(59, 130, 246, 0.4),
    0 4px 6px -2px rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.action-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Message de fin de partie */
.game-over-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #fecdd3;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(225, 29, 72, 0.15) 0%, rgba(190, 18, 60, 0.1) 100%);
  border: 1px solid rgba(251, 113, 133, 0.3);
  box-shadow: 0 0 20px rgba(251, 113, 133, 0.2);
}

.game-over-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #fb7185;
}

/* Spacer pour pousser le contenu */
.spacer {
  flex: 1;
  min-height: 1rem;
}

/* GameBoard fixé en bas */
.gameboard-container {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.95) 70%, transparent 100%);
  backdrop-filter: blur(10px);
  padding: 1rem 1rem 1.5rem 1rem;
  border-top: 1px solid rgba(100, 116, 139, 0.2);
  box-shadow: 
    0 -4px 6px -1px rgba(0, 0, 0, 0.2),
    0 -2px 4px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

@media (min-width: 640px) {
  .game-content {
    padding: 1rem;
  }
  
  .gameboard-container {
    padding: 1.25rem 1.25rem 1.5rem 1.25rem;
  }
}

@media (min-width: 1024px) {
  .game-content {
    max-width: 1280px;
    margin: 0 auto;
    width: 100%;
    padding: 1.25rem;
  }
  
  .gameboard-container {
    padding: 1.5rem 1.5rem 2rem 1.5rem;
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>