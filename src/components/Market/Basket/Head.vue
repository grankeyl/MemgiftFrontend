<template>
  <div class="_direction _comp head">
    <div v-if="isLoading" class="_skeleton">
    </div>
    <div class="_content" :class="{ hide: isLoading }">
      <div class="context">
        <div class="image">
          <img :src="BasketWhiteImg" alt="basket" />
        </div>
        <div class="title">
          <h4>{{ $t('market.basket.title') }}</h4>
        </div>
        <div class="descr">
          <p>{{ GiftsCount }} {{ $t('market.basket.gifts') }}</p>
        </div>
      </div>
      <div class="selectel" @click="selectAll">
        <div class="descr">
          <p>{{ $t('market.basket.selectAll') }}</p>
        </div>
        <div class="checkbox" :class="{ active: isSelectedAll }">
            <img :src="DoneImg" alt="done" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from '../../Icon';

import Lottie from '../../Lottie.vue';

// Images
import BasketWhiteImg from '@/assets/images/market/basket-white.svg';
import DoneImg from '@/assets/images/market/done.svg';

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
    GiftsCount: {
      type: Number,
      required: true,
    },
    Selected: {
      type: Array,
      required: true,
    },
  },

  components: {
    Lottie,
  },

  data() {
    return {
      BasketWhiteImg,
      DoneImg,

      isLoading: this.Skeleton,

      Icon,
    };
  },

  mounted() {
    this.loadResources();
  },

  computed: {
    isSelected() {
      return this.Selected.length > 0;
    },
    isSelectedAll() {
      return this.Selected.length === this.GiftsCount;
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

    selectAll() {
      if (this.isSelectedAll) {
        this.$emit('unselectAll');
        return;
      };
      this.$emit('selectAll');
    },
  },
};
</script>

<style lang="sass" scoped>
@use "./Head.sass"
</style>