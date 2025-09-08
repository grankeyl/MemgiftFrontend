<template>
  <div class="_direction _comp blocks">
    <div v-if="isLoading" class="_skeleton">
    </div>
    <div class="_content" :class="{ hide: isLoading }">
      <div class="items">
        <div 
          v-for="value in 4" 
          class="item"
        >
          <div class="nft">
            <div
              class="background upg"
              :style="{
                '--center-color': '#76997C',
                '--around-color': '#5E7657',
              }"
            ></div>

            <div class="symbol upg">
              <img :src="'https://app.spicko-quane.shop/s3/symbols/Blaze.png'" :alt="''" />
            </div>

            <div class="model">
              <div class="upg">
                <div v-if="'svg' === 'svg'" class="image">
                  <img :src="'https://app.spicko-quane.shop/s3/models/BestCap/Shinestone.svg'" alt="model" />
                </div>
                <!-- <div v-if="item.gift_media === 'lottie'" class="image">
                  <img :src="getUpgradedModel(item.gift_ukey, item.upgrade.nft_name, 'svg')" alt="model" />
                </div> -->
              </div>
            </div>
          </div>
          <div class="context">
            <div class="head">
              <h4>Louis Verse</h4>
              <p>#1876</p>
            </div>
            <div class="button">
              <button>
                <h4>2500</h4>
                <img src="/market/ton-white.svg" alt="ton" />
              </button>
            </div>
          </div>
          <div class="actions">
            <div class="select">
              <img src="/market/done.svg" alt="done" /> 
            </div>
            <div class="delete">
              <img src="/market/delete.svg" alt="delete" />
            </div>
          </div>
        </div>
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
@use "./Items.sass"
</style>