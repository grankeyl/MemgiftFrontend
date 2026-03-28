<script setup lang="ts">
import TelegramModule from '../../hooks/useTelegram';

import { onMounted, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { MenuJson } from './Menu'

const router = useRouter();

const emit = defineEmits(['loaded']);
const prohibitedRoutes = ['/collection', '/m/basket', '/wallet'];

const openRoute = (routePath: string) => {
  if (routePath !== '/soon') {
    if (routePath === router.currentRoute.value.path) return;
    
    TelegramModule.useSoftHaptic();
    router.push(routePath);
  }
};

onMounted(() => {
  const checkImagesLoaded = () => {
    const images = Array.from(document.images);
    const allImagesLoaded = images.every(img => img.complete);

    if (allImagesLoaded) {
      emit('loaded');
    } else {
      setTimeout(checkImagesLoaded, 100);
    }
  };

  checkImagesLoaded();
});
</script>

<template>
  <nav v-if="!prohibitedRoutes.includes($route.path)" class="menu">
    <div class="menu_pill">
      <div
        v-for="route in MenuJson"
        :key="route.Key"
        :class="{ active: $route.path === route.Route, disable: route.Disable }"
        class="menu_tab"
        @click="openRoute(route.Route)"
      >
        <div class="menu_tab_icon" v-html="route.Icon"></div>
        <span class="menu_tab_label">{{ $t(`menu.${route.Key}`) }}</span>
      </div>
    </div>
  </nav>
</template>

<style scoped>
</style>