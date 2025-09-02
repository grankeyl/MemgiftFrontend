<script setup lang="ts">
import { ref } from 'vue';
import Lottie from './Lottie.vue';

const lottieLoad = ref(false);

setTimeout(() => {
  lottieLoad.value = true;
}, 350);
</script>

<template>

    <div class="loading">
      <div class="loading_inner">
        
        <Lottie class="lt" :class="{ loaded: lottieLoad }" slug="stars-plane" :loop="true" width="75" height="75" />

      </div>
    </div>

</template>