<script setup lang="ts">
import TelegramModule from '../../hooks/useTelegram';

import { onMounted, onBeforeUnmount, defineEmits, computed, ref, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { MenuItems } from './Menu'
import { Icon } from "../Icon.ts"

const router = useRouter();
const route = useRoute();

const emit = defineEmits(['loaded']);

// кнопка ведёт на коллекцию MemGift на GetGems
const GETGEMS_COLLECTION_URL = 'https://getgems.io/collection/EQCPsQRvWEw2XgG7ZRYj7AdQ_CDAlIgefiNZv9OtuJfzbeVw';

const onGetGemsClick = () => {
  try { TelegramModule.useSoftHaptic(); } catch {}
  const w = window as any;
  w.Telegram?.WebApp?.openLink ? w.Telegram.WebApp.openLink(GETGEMS_COLLECTION_URL) : window.open(GETGEMS_COLLECTION_URL, '_blank');
};

const pillRef = ref<HTMLElement | null>(null);
const indicatorVars = ref<Record<string, string>>({
  '--menu-indicator-x': '0px',
  '--menu-indicator-w': '0px',
});

// Exact paths + prefixes where bottom nav should hide (full-screen flows)
const prohibitedExact = ['/collection', '/m/basket', '/multicheck', '/private-deal'];
const prohibitedPrefix = ['/collection/', '/private-deal/', '/gift/', '/receive/', '/activate-multicheck/'];

const hideMenu = computed(() => {
  const p = route.path;
  if (prohibitedExact.includes(p)) return true;
  return prohibitedPrefix.some((pre) => p.startsWith(pre));
});

const activeIndex = computed(() =>
  MenuItems.findIndex((item) => item.Route === route.path)
);

const syncIndicator = () => {
  const pill = pillRef.value;
  const idx = activeIndex.value;
  if (!pill || idx < 0) {
    indicatorVars.value = {
      '--menu-indicator-x': '0px',
      '--menu-indicator-w': '0px',
    };
    return;
  }

  const tabs = pill.querySelectorAll<HTMLElement>('.menu_tab');
  const tab = tabs[idx];
  if (!tab) return;

  const pillRect = pill.getBoundingClientRect();
  const tabRect = tab.getBoundingClientRect();

  indicatorVars.value = {
    '--menu-indicator-x': `${tabRect.left - pillRect.left}px`,
    '--menu-indicator-w': `${tabRect.width}px`,
  };
};

let resizeObserver: ResizeObserver | undefined;

watch(
  () => [route.path, hideMenu.value] as const,
  () => nextTick(syncIndicator),
);

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

  nextTick(() => {
    syncIndicator();
    if (typeof ResizeObserver !== 'undefined' && pillRef.value) {
      resizeObserver = new ResizeObserver(() => syncIndicator());
      resizeObserver.observe(pillRef.value);
    }
  });
  window.addEventListener('resize', syncIndicator);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  window.removeEventListener('resize', syncIndicator);
});
</script>

<template>
  <nav v-if="!hideMenu" class="menu">
    <div
      ref="pillRef"
      class="menu_pill"
      :class="{ 'menu_pill--has-active': activeIndex >= 0 }"
      :style="indicatorVars"
    >
      <div
        v-show="activeIndex >= 0"
        class="menu_indicator"
        aria-hidden="true"
      />
      <div
        v-for="item in MenuItems"
        :key="item.Key"
        :class="{ active: $route.path === item.Route, disable: item.Disable }"
        class="menu_tab"
        @click="openRoute(item.Route)"
      >
        <div class="menu_tab_icon" v-html="item.Icon"></div>
        <!-- <span class="menu_tab_label">{{ $t(`menu.${item.Key}`) }}</span> -->
      </div>
    </div>
    <div class="menu_pill low is-live" @click="onGetGemsClick">
      <div class="menu_tab">
        <div class="menu_tab_icon" v-html="Icon.GetGems"></div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
</style>
