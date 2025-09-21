<template>
  <div class="_direction _comp blocks">
    <div v-if="isLoading" class="_skeleton">
    </div>
    <div class="_content" :class="{ hide: isLoading }">
      <div class="items">
        <div 
          v-for="(item, index) in Items"
          :key="index"
          class="item"
        >
          <div class="nft">
            <div
              class="background upg"
              :style="{
                '--center-color': item.core.upgrade.background.colors_center,
                '--around-color': item.core.upgrade.background.colors_around,
              }"
            ></div>

            <div class="symbol upg">
              <img :src="item.core.upgrade.symbol.image" :alt="item.core.upgrade.symbol.name" />
            </div>

            <div class="model">
              <div class="upg">
                <div v-if="item.core.gift.media === 'svg'" class="image">
                  <img :src="item.core.upgrade.nft_name.image" alt="model" />
                </div>
                <div v-if="item.core.gift.media === 'lottie'" class="image">
                  <img :src="getUpgradedModel(item.core.gift.u_key, item.core.upgrade.nft_name.name, 'svg')" alt="model" />
                </div>
              </div>
            </div>
          </div>
          <div class="context">
            <div class="head">
              <h4>{{ item.core.upgrade.nft_name.name }}</h4>
              <p>#{{ item.core.upgrade.seq }}</p>
            </div>
            <div class="button">
              <button>
                <h4>{{ cutNumber(item.price_ton) }}</h4>
                <img src="/market/ton-white.svg" alt="ton" />
              </button>
            </div>
          </div>
          <div class="actions">
            <div class="select" :class="{ active: Selected.includes(item.id) }" @click="selectItem(item.id)">
              <img src="/market/done.svg" alt="done" /> 
            </div>
            <div class="delete" @click="deleteItem(item)">
              <img src="/market/delete.svg" alt="delete" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUpgradedModel } from '../../../utils/useGift';
import { cutNumber } from '../../../utils/useTon';
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
    Items: {
      type: Array,
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
      isLoading: this.Skeleton,

      Icon,
      cutNumber,
      getUpgradedModel,
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

    selectItem(item) {
      this.$emit('select', item);
    },

    deleteItem(item) {
      this.$emit('deleteItem', item);
    },
  },
};
</script>

<style lang="sass" scoped>
@use "./Items.sass"
</style>