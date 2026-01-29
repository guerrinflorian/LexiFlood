<template>
  <div
    class="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-30"
    :style="{ backgroundImage: `url(${image})` }"
    aria-hidden="true"
  ></div>
  <div class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent"></div>
  <div class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
</template>

<script setup lang="ts">
defineProps<{ image: string }>();
</script>
