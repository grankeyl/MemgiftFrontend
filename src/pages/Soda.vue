<template>
  <div 
    class="_wrap _soda flex-grow-scroll" 
    :class="{ desktop: isDesktop() }"
  >
    <div class="_view">
      <div class="stylish">
        <div class="starsed">
          <img src="/soda/stylish.png" alt="stars" />
        </div>
      </div>

      <div class="fixed">
        <Head />
        <Block />
        <Button />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { getConfig } from '../config';
import { useSelector } from '../helpers/helpers';
import { useCacheStore } from '../stores/pinia/piniaStore';
import { isDesktop } from '../utils/checkDevice';

import TelegramModule from '../hooks/useTelegram';

import Head from '../components/Soda/Head.vue';
import HeadImage from '@/assets/images/soda/head.png';
import Button from '@/components/Soda/Button.vue';
import Block from '@/components/Soda/Block.vue';

export default defineComponent({
  components: {
    Head,
    Button,
    Block,
  },

  setup() {
    const pageApp = ref('Profile');
    const configApp = ref(getConfig());
    const storeCache = useCacheStore() as any;
    const userApp = useSelector((state) => state.auth.user);

    TelegramModule.hideBackButton();

    return {
      isDesktop,

      pageApp,
      configApp,
      storeCache,
      userApp,
      HeadImage,
    };
  }
});
</script>

<style lang="sass" scoped>
@use "@/assets/styles/soda/_main.sass"
@use "@/assets/styles/soda/_comp.sass"
</style>