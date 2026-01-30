<template>
  <aside class="flex h-full items-center">
    <div class="flex flex-col items-center gap-2 rounded-2xl border border-cyan-400/30 bg-slate-950/70 px-2 py-3 shadow-[0_0_18px_rgba(34,211,238,0.25)] backdrop-blur-md">
      <div class="relative flex h-24 w-6 items-end overflow-hidden rounded-full border border-slate-700/60 bg-orange-950/20 sm:h-28 sm:w-7">
        <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-orange-600 via-orange-500 to-amber-300 transition-all duration-300" :style="{ height: fillHeight }"></div>
        <div class="absolute inset-x-0 bottom-0 h-3 w-full bg-orange-950/60"></div>
      </div>
      <div class="text-center">
        <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Multi</p>
        <p class="text-xs font-bold text-cyan-200">x{{ formattedMultiplier }}</p>
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

const minValue = computed(() => props.min ?? 0.75);
const maxValue = computed(() => props.max ?? 5);

const fillRatio = computed(() => {
  const baseline = 1;
  if (props.multiplier <= baseline) {
    return 0;
  }
  const range = Math.max(0.01, maxValue.value - baseline);
  return Math.min(1, (props.multiplier - baseline) / range);
});

const fillHeight = computed(() => `${Math.round(fillRatio.value * 100)}%`);

const formattedMultiplier = computed(() => {
  const raw = props.multiplier.toFixed(2);
  return raw.replace(/\.?0+$/, '');
});
</script>

