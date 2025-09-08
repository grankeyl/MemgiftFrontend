<script setup lang="ts">
import TelegramModule from '../../hooks/useTelegram';

import { onMounted, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { MenuJson } from './Menu'

const router = useRouter();

const emit = defineEmits(['loaded']);
const prohibitedRoutes = ['/collection', '/market/basket'];

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
      <div v-if="!prohibitedRoutes.includes($route.path)" class="menu">
        <div class="menu_inner">
            <div class="menu_routes">
                <div 
                  v-for="route in MenuJson" 
                  :class="{ active: $route.path === route.Route, disable: route.Disable }"
                  class="menuRoute"
                >
                    <div @click="openRoute(route.Route)" class="menu_route">
                        <div class="kit-icon" v-html="route.Icon"></div>
                        <p>{{ $t(`menu.${route.Key}`) }}</p>
                    </div>
                  </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>