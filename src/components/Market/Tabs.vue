<template>
  <div class="_direction _comp _item tabs">
    <div v-if="isLoading" class="_skeleton">
      <div class="items">
        <div class="item"></div>
        <div class="item"></div>
      </div>
    </div>
    <div class="_content" :class="{ hide: isLoading }">
      <div class="items">
        <div
          v-for="(tab, index) in Tabs.List"
          :key="index"
          class="item"
          :class="{ active: Tabs.Active === tab.id }"
          @click="setActiveTab(tab.id)"
        >
          <h4>{{ $t(`market.tabs.${tab.id}`) }}</h4>
        </div>
      </div>
      <div class="balance" @click="openWallet">
        <Icon class="kit-icon" v-html="Icon.Gram" />
        <span>{{ cutNumber(getBalance.toString()) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { cutNumber } from '../../utils/useTon';
import { Icon } from '../Icon';

import Lottie from '../Lottie.vue';

// Images
import TonImg from '@/assets/images/market/ton.svg';
import PlusImg from '@/assets/images/market/plus.svg';

export default {
  props: {
    Skeleton: {
      type: Boolean,
      required: true,
    },
    SkeletonTime: {
      type: Number,
      required: true,
    },
    Tabs: {
      type: Object,
      required: true,
    },
  },

  components: {
    Lottie,
  },

  data() {
    return {
      TonImg,
      PlusImg,


      storeCache: useCacheStore(),
      isLoading: this.Skeleton,

      Icon,
      cutNumber,
    };
  },

  mounted() {
    this.loadResources();
  },

  computed: {
    getBalance() {
      return this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
    },
  },

  methods: {
    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadIcons()]);
        this.isLoading = false;
        this.$emit("loadSuccess");
      } catch (error) {
        console.error("Ошибка при загрузке ресурсов:", error);
      }
    },

    loadFonts() {
      return document.fonts.ready;
    },

    loadIcons() {
      return new Promise((resolve, reject) => {
        const div = document.createElement("div");
        div.innerHTML = this.Icon;

        const icons = div.querySelectorAll("img, svg");
        const promises = Array.from(icons).map((icon) => {
          if (icon.tagName === "IMG") {
            return new Promise((resolveImage, rejectImage) => {
              const img = new Image();
              img.src = icon.src;
              img.onload = resolveImage;
              img.onerror = rejectImage;
            });
          } else if (icon.tagName === "SVG") {
            return new Promise((resolveSvg) => {
              const checkSvgLoaded = () => {
                if (icon.getBBox().width > 0) {
                  resolveSvg();
                } else {
                  requestAnimationFrame(checkSvgLoaded);
                }
              };
              checkSvgLoaded();
            });
          }
        });

        Promise.all(promises).then(resolve).catch(reject);
      });
    },

    setActiveTab(arg) {
      this.$emit('useTab', arg);
    },

    openWallet() {
      this.$router.push('/wallet');
    },
  },
};
</script>

<style lang="sass" scoped>
@use "./Tabs.sass"
</style>