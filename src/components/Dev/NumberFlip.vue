<template>
  <span class="numflip">
    <transition name="flip" mode="out-in">
      <span :key="value" class="numflip__value">{{ value }}</span>
    </transition>
  </span>
</template>

<script setup lang="ts">
defineProps<{ value: number }>()
</script>

<style scoped lang="scss">
.numflip {
  display: inline-flex;
  min-width: 1.5ch;
  justify-content: center;
}
.flip-enter-active,
.flip-leave-active {
  transition: transform .22s ease, opacity .22s ease;
  will-change: transform, opacity;
}
.flip-enter-from   { transform: translateY(8px);  opacity: 0 }
.flip-enter-to     { transform: translateY(0);    opacity: 1 }
.flip-leave-from   { transform: translateY(0);    opacity: 1 }
.flip-leave-to     { transform: translateY(-8px); opacity: 0 }
</style>