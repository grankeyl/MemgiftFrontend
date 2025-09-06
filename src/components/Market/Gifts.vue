<template>
  <div class="_direction _comp _item gifts">
      <div v-if="isLoading" class="_skeleton">
      </div>
      <div class="_content" :class="{ hide: isLoading }">
        <div class="items">

          <div v-for="value in 12" :key="value" class="item">
            <div class="mark">
              <p>#1456</p>
            </div>

            <div
              class="background upg"
              :style="{
                '--center-color': '#EAB843',
                '--around-color': '#B24C6E',
              }"
            ></div>

            <div class="symbol upg">
              <img src="https://app.spicko-quane.shop/assets/gift_bg-RDiJf5BU.png" alt="symbol" />
            </div>

            <div class="model">
              <div class="upg">
                <div class="image">
                  <img src="https://app.spicko-quane.shop/s3/nft_miss_hammy.svg" alt="model" />
                </div>
                
                <!-- <div v-if="item.gift_media === 'svg'" class="image">
                  <img :src="item.upgrade.nft_image" alt="model" />
                </div> -->
                <!-- <div v-if="item.gift_media === 'lottie'" class="image">
                  <img :src="getUpgradedModel(item.gift_ukey, item.upgrade.nft_name, 'svg')" alt="model" />
                </div> -->
              </div>
            </div>

            <div class="name">
              <h4>Miss Hammy</h4>
            </div>

            <div class="buttons">
              <button>
                <h5>2500</h5>
                <img src="/market/ton-white.svg" alt="ton" />
              </button>
              <button>
                <img src="/market/basket-white.svg" alt="basket" />
              </button>
            </div>
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
@use "./Gifts.sass"
</style>