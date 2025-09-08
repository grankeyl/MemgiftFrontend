<template>
  <div class="_direction _comp head">
    <div v-if="isLoading" class="_skeleton">
    </div>
    <div class="_content" :class="{ hide: isLoading }">
      <div class="context">
        <div class="image">
          <img src="/market/basket-white.svg" alt="basket" />
        </div>
        <div class="title">
          <h4>Basket</h4>
        </div>
        <div class="descr">
          <p>{{ GiftsCount }} gifts</p>
        </div>
      </div>
      <div class="selectel">
        <div class="descr">
          <p>Select All</p>
        </div>
        <div class="checkbox"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from '../../Icon';

import Lottie from '../../Lottie.vue';

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
  },

  components: {
    Lottie,
  },

  data() {
    return {
      isLoading: this.Skeleton,

      Icon,
    };
  },

  mounted() {
    this.loadResources();
  },

  computed: {
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
  },
};
</script>

<style lang="sass" scoped>
@use "./Head.sass"
</style>