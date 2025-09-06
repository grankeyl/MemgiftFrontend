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
          @click="Tabs.Active = tab.id"
        >
          <h4>{{ $t(`market.tabs.${tab.id}`) }}</h4>
        </div>
      </div>
      <div class="balance">
        <div class="context">
          <h4>0.00</h4>
          <img src="/market/ton.svg" alt="ton" />
        </div>
        <div class="button">
          <img src="/market/plus.svg" alt="plus" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from '../Icon';

import Lottie from '../Lottie.vue';

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

<style lang="sass">
@use "./Tabs.sass"
</style>