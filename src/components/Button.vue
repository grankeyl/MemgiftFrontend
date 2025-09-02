<script setup lang="ts">
import { ref, onMounted } from 'vue';
import starImage from '@/assets/images/stars-3.png';

const generateStars = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3.2}s`,
  }));
};

const stars = ref(generateStars(20));

onMounted(() => {
  const animateStars = () => {
    stars.value.forEach(() => {});
    requestAnimationFrame(animateStars);
  };
  animateStars();
});
</script>

<template>
  <div class="stars-container">
    <div 
      v-for="star in stars" 
      :key="star.id" 
      class="star" 
      :style="{
        top: star.top,
        left: star.left,
        animationDelay: star.animationDelay,
      }">
      <img :src="starImage" alt="star">
    </div>
  </div>
</template>

<style scoped>
.stars-container {
  position: fixed;
  width: 100%;
  height: 34px;
  overflow: hidden;
  z-index: -1;
  border-radius: 50px;
}

.star {
  position: absolute;
  width: 0.4rem;
  height: 0.4rem;
  opacity: 0;
  animation: flyStar 2.7s linear infinite;
  will-change: transform, opacity;
}

.star img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translateY(-11px);
}

@keyframes flyStar {
  0%, 100% {
    transform: translateY(12px);
    opacity: 0;
  }
  25% {
    opacity: 0.3;
  }
  50% {
    transform: translateY(10%);
  }
  75% {
    transform: translateY(100%);
    opacity: 0.8;
  }
}
</style>