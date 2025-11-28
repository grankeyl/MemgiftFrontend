<template>
  <div class="_direction _comp _item _button" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_blockButton">
          <button @click="back">
            <h4>{{ $t('soda.button.back') }}</h4>
          </button>
        </div>
      </div>
      <div v-else class="_content">
        <div class="giveaway">
          <div v-if="!sodaEvent" class="inner">
            <div class="kit-icon" v-html="Icon.Close"></div>
            <h4>{{ $t('soda.button.youAreNotParticipant') }}</h4>
          </div>
          <div v-if="sodaEvent" class="inner">
            <div class="kit-icon" v-html="Icon.Done"></div>
            <h4>{{ $t('soda.button.youParticipated') }}</h4>
          </div>
        </div>
        <div class="_blockButton">
          <button @click="back">
            <h4>{{ $t('soda.button.back') }}</h4>
          </button>
        </div>
      </div>
  </div>
</template>

<script>
import { Icon } from '../Icon';
import { useCacheStore } from '../../stores/pinia/piniaStore';

import * as nftApi from '../../api/nftApi';

import Lottie from '../Lottie.vue';

import Image_Avatar from '@/assets/images/avatar.png';

export default {
  props: {
    Skeleton: {
      type: Boolean,
      required: true,
    },
    SkeletonTime: {
      type: Number,
      required: true,
    }
  },

  components: {
    Lottie,
  },

  data() {
    return {
      storeCache: useCacheStore(),
      isLoading: this.$props.Skeleton,

      sodaEvent: {},

      Icon,
    };
  },

  mounted() {
    this.loadResources();
    this.getSodaEvent();
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
    checkGiveaway() {
      return this.storeCache.UserData.user.Giveaway;
    },
  },
  
  methods: {
    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadImages()]);
        this.isLoading = false;
        this.$emit("loadSuccess");
      } catch (error) {
        console.error("Ошибка при загрузке ресурсов:", error);
      }
    },

    async getSodaEvent() {
      const sodaEvent = await nftApi.sodaEvent();
      if (!sodaEvent) return;

      this.sodaEvent = sodaEvent;
      this.storeCache.UserSodaEvent = sodaEvent;
    },

    loadFonts() {
      return document.fonts.ready;
    },

    loadImages() {
      const staticImages = [
        Image_Avatar,
      ].map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      return Promise.all([...staticImages]);
    },

    back() {
      this.$router.push({ path: '/' });
    },
  },
};
</script>

<style lang="sass" scoped>
@use "@/assets/styles/soda/_comp.sass"
</style>