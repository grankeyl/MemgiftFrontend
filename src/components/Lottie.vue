<template>
  <div
    ref="lottieContainer"
    :style="{ width: `${animationWidth}`, height: `${animationHeight}` }"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps } from 'vue';
import { giftsMap } from './Gifts';
import lottie from 'lottie-web';

const props = defineProps({
  slug: {
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

const lottieContainer = ref<HTMLElement | null>(null);
const animationData = giftsMap[props.slug];
const animationWidth = ref(props.width);
const animationHeight = ref(props.height);
const rendererType = ref(props.renderer);

if (animationWidth.value === '0') {
  animationWidth.value = '100%';
}

if (animationHeight.value === '0') {
  animationHeight.value = '100%';
}

onMounted(() => {
  if (animationData && lottieContainer.value) {
    const environment = import.meta.env.VITE_APP_ENV;
    
    const animationPath = environment === 'production'
      ? animationData.replace('/src/assets/animations', '/lottie/')
      : animationData;

    lottie.loadAnimation({
      container: lottieContainer.value,
      renderer: rendererType.value === 'svg' ? 'svg' : 'canvas',
      loop: props.loop,
      autoplay: true,
      path: animationPath
    });
  }
});
</script>