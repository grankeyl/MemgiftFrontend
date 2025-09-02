<template>
  <div
    ref="giftLottieContainer"
    class="lottie-gift"
    :style="{ width: animationWidth, height: animationHeight }"
  ></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineProps, onBeforeUnmount } from 'vue';
import lottie from 'lottie-web';
import type { AnimationItem } from 'lottie-web';

const props = defineProps({
  path: {
    type: String,
    required: true,
  },
  loop: {
    type: Boolean,
    required: true,
  },
  width: {
    type: String,
    required: true,
  },
  height: {
    type: String,
    required: true,
  },
  renderer: {
    type: String,
    required: false,
  },
});

const giftLottieContainer = ref<HTMLElement | null>(null);
const animationWidth = props.width === '0' ? '100%' : props.width;
const animationHeight = props.height === '0' ? '100%' : props.height;
const rendererType = props.renderer === 'svg' ? 'svg' : 'canvas';

let animationInstance: AnimationItem | null = null;

const loadAnimation = async () => {
  if (!giftLottieContainer.value) return;

  if (animationInstance) {
    animationInstance.destroy(); // Очищаем старую анимацию
  }

  try {
    const res = await fetch(props.path);
    const animationJson = await res.json();

    animationInstance = lottie.loadAnimation({
      container: giftLottieContainer.value,
      renderer: rendererType,
      loop: props.loop,
      autoplay: true,
      animationData: animationJson,
    });
  } catch (error) {
    console.error('Ошибка загрузки анимации:', error);
  }
};

onMounted(loadAnimation);

watch(() => props.path, () => {
  loadAnimation(); // Перезагружаем при изменении пути
});

onBeforeUnmount(() => {
  if (animationInstance) {
    animationInstance.destroy();
  }
});
</script>