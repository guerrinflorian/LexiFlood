<template>
  <section class="relative z-10 flex flex-1 items-center justify-center px-4 py-4 sm:px-6">
    <div class="w-full max-w-md space-y-4">
      <!-- En-tête -->
      <div class="futuristic-card p-4 text-center sm:p-5">
        <div class="mb-2 flex justify-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-[0_0_25px_rgba(6,182,212,0.5)] sm:h-14 sm:w-14">
            <span class="text-2xl sm:text-3xl">👥</span>
          </div>
        </div>
        <h2 class="text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] sm:text-2xl" style="font-family: 'Orbitron', sans-serif;">
          Mode Multijoueur
        </h2>
        <p class="mt-1.5 text-xs text-slate-300 sm:text-sm">
          Crée ou rejoins une room <span class="font-semibold text-cyan-400">(2 à 20 joueurs)</span>
        </p>
      </div>

      <!-- Formulaire -->
      <div class="futuristic-card space-y-3 p-4 sm:p-5">
        <!-- Champ code room -->
        <div>
          <label class="mb-1.5 block text-left text-xs font-bold uppercase tracking-wider text-slate-400">
            Code de la room
          </label>
          <q-input
            :model-value="roomInput"
            outlined
            dense
            maxlength="4"
            placeholder="Ex: X7M4"
            class="room-input"
            input-class="text-center text-lg font-bold tracking-widest uppercase"
            @update:model-value="emit('update:roomInput', $event)"
          >
            <template v-slot:prepend>
              <q-icon name="tag" color="cyan-5" />
            </template>
          </q-input>
          <p class="mt-1 text-left text-xs text-slate-500">
            Code à 4 caractères (lettres et chiffres)
          </p>
        </div>

        <!-- Boutons d'action -->
        <div class="space-y-2.5 pt-1">
          <!-- Bouton Créer -->
          <q-btn
            unelevated
            no-caps
            class="create-btn w-full"
            size="md"
            @click="emit('create')"
          >
            <span class="flex items-center justify-center gap-2">
              <q-icon name="add_circle" size="18px" />
              <span class="font-bold text-sm">Créer une partie</span>
            </span>
          </q-btn>

          <!-- Bouton Rejoindre -->
          <q-btn
            outline
            no-caps
            class="join-btn w-full"
            size="md"
            :disable="roomInput.length !== 4"
            @click="emit('join')"
          >
            <span class="flex items-center justify-center gap-2">
              <q-icon name="login" size="18px" />
              <span class="font-bold text-sm">Rejoindre la partie</span>
            </span>
          </q-btn>
        </div>
      </div>

      <!-- Info supplémentaire -->
      <div class="text-center">
        <p class="text-xs text-slate-500">
          💡 Partage le code avec tes amis pour jouer ensemble
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  roomInput: string;
}>();

const emit = defineEmits<{
  (event: 'update:roomInput', value: string): void;
  (event: 'create'): void;
  (event: 'join'): void;
}>();
</script>

<style scoped>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');

/* Carte futuriste */
.futuristic-card {
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(71, 85, 105, 0.5);
  box-shadow: 
    inset 0 2px 10px rgba(0, 0, 0, 0.3),
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(6, 182, 212, 0.1);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

.futuristic-card:hover {
  border-color: rgba(6, 182, 212, 0.3);
  box-shadow: 
    inset 0 2px 10px rgba(0, 0, 0, 0.3),
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 0 25px rgba(6, 182, 212, 0.2);
}

/* Input personnalisé */
:deep(.room-input .q-field__control) {
  border-radius: 0.75rem;
  border: 1px solid rgba(71, 85, 105, 0.5);
  background: rgba(2, 6, 23, 0.8);
  height: 3.5rem;
  color: white;
  transition: all 0.3s ease;
}

:deep(.room-input .q-field__control:hover) {
  border-color: rgba(6, 182, 212, 0.4);
  background: rgba(2, 6, 23, 0.9);
}

:deep(.room-input.q-field--focused .q-field__control) {
  border-color: rgb(6, 182, 212);
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1), 0 0 20px rgba(6, 182, 212, 0.3);
  background: rgba(2, 6, 23, 0.95);
}

:deep(.room-input input) {
  color: rgb(103, 232, 249);
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
}

:deep(.room-input input::placeholder) {
  color: rgb(71, 85, 105);
}

:deep(.room-input .q-field__native) {
  min-height: 3rem;
}

/* Bouton Créer */
:deep(.create-btn) {
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #06b6d4 0%, #6366f1 100%) !important;
  color: white !important;
  padding: 0.75rem 1rem;
  box-shadow: 
    0 4px 6px -1px rgba(6, 182, 212, 0.3),
    0 2px 4px -1px rgba(6, 182, 212, 0.2),
    0 0 20px rgba(6, 182, 212, 0.4);
  transition: all 0.3s ease;
}

:deep(.create-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 
    0 10px 15px -3px rgba(6, 182, 212, 0.4),
    0 4px 6px -2px rgba(6, 182, 212, 0.3),
    0 0 30px rgba(6, 182, 212, 0.5);
}

:deep(.create-btn:active) {
  transform: translateY(0);
}

/* Bouton Rejoindre */
:deep(.join-btn) {
  border-radius: 0.75rem;
  border: 2px solid rgba(71, 85, 105, 0.7) !important;
  background: rgba(15, 23, 42, 0.5) !important;
  color: rgb(226, 232, 240) !important;
  padding: 0.75rem 1rem;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

:deep(.join-btn:not(.disabled):hover) {
  border-color: rgba(6, 182, 212, 0.6) !important;
  background: rgba(15, 23, 42, 0.7) !important;
  color: rgb(103, 232, 249) !important;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
}

:deep(.join-btn.disabled) {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>