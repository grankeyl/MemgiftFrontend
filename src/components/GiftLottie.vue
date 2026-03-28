<template>
  <div
    ref="giftLottieContainer"
    class="lottie-gift"
    :style="{ width: animationWidth, height: animationHeight }"
  ></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
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
  autoplay: {
    type: Boolean,
    default: true,
    required: false,
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
let observer: IntersectionObserver | null = null;
let jsonCache: Record<string, any> = {};

const loadAnimation = async () => {
  if (!giftLottieContainer.value) return;

  if (animationInstance) {
    animationInstance.destroy();
    animationInstance = null;
  }

  try {
    let animationJson = jsonCache[props.path];
    if (!animationJson) {
      const res = await fetch(props.path);
      animationJson = await res.json();
      jsonCache[props.path] = animationJson;
    }

    animationInstance = lottie.loadAnimation({
      container: giftLottieContainer.value,
      renderer: rendererType,
      loop: props.loop,
      autoplay: props.autoplay,
      animationData: animationJson,
    });

    setupVisibilityObserver();
  } catch (error) {
    console.error('Ошибка загрузки анимации:', error);
  }
};

const setupVisibilityObserver = () => {
  if (observer) observer.disconnect();
  if (!giftLottieContainer.value || !animationInstance) return;

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!animationInstance) return;
      if (entry.isIntersecting) {
        animationInstance.play();
      } else {
        animationInstance.pause();
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(giftLottieContainer.value);
};

onMounted(loadAnimation);

watch(() => props.path, () => {
  loadAnimation();
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (animationInstance) {
    animationInstance.destroy();
    animationInstance = null;
  }
});
</script>