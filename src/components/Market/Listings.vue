<template>
  <div class="_direction _comp _item listings">
      <div v-if="isLoading" class="_skeleton">
      </div>
      <div class="_content" :class="{ hide: isLoading }">
        <div class="items">
          <div 
            v-for="(item, index) in ListingsList" 
            :key="index" 
            class="item"
          >
            <div class="nft">
              <div
                class="background upg"
                :style="{
                  '--center-color': item.nftbg_center,
                  '--around-color': item.nftbg_around,
                }"
              ></div>

              <div class="symbol upg">
                <img :src="item.nft_symbol_image" alt="symbol" />
              </div>

              <div class="model">
                <div class="upg">
                  <div v-if="item.nft_media === 'svg'" class="image">
                    <img :src="item.nft_image" alt="model" />
                  </div>
                  <div v-if="item.nft_media === 'lottie'" class="image">
                    <img :src="getUpgradedModel(item.gift_name, item.nft_name, 'svg')" alt="model" />
                  </div>
                </div>
              </div>
            </div>
            <div class="context">
              <div class="head">
                <div class="info">
                  <h4>{{ item.nft_name }}</h4>
                  <p>#{{ item.nft_seq }}</p>
                </div>
                <div class="date">
                  <p>{{ unixToRelative(item.created_at) }}</p>
                </div>
              </div>
              <div class="spanner purchased" v-if="item.nft_status === 'removed'">
                <div class="icon">
                  <img src="/market/gift.svg" alt="gift" />
                </div>
                <div class="text">
                  <h4>Removed from sale</h4>
                </div>
              </div>
              <div class="spanner sold" v-if="item.nft_status === 'sold'">
                <div class="icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M17.7284 4.1568C18.2572 4.69919 18.2572 5.57859 17.7284 6.12098L8.24921 15.8432C7.72037 16.3856 6.86296 16.3856 6.33413 15.8432L2.27163 11.6765C1.74279 11.1341 1.74279 10.2547 2.27163 9.71235C2.80046 9.16996 3.65787 9.16996 4.18671 9.71235L7.29167 12.8969L15.8133 4.1568C16.3421 3.6144 17.1995 3.6144 17.7284 4.1568Z" fill="white"/>
                  </svg>
                </div>
                <div class="text">
                  <h4>Sold for</h4>
                </div>
                <div class="price">
                  <h4>{{ cutNumberNano(item.nft_price_nano) }}</h4>
                  <img src="/market/ton.svg" alt="ton" />
                </div>
              </div>
              <div class="spanner onsale" v-if="item.nft_status === 'listed'">
                <div class="icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.9389 5.335L14.0091 2.96973C13.8712 2.61904 13.8023 2.44367 13.6912 2.31496C13.5931 2.20119 13.4719 2.11406 13.3373 2.06055C13.1851 2 13.0101 2 12.6601 2H6.33999C5.98999 2 5.81499 2 5.66273 2.06055C5.52816 2.11406 5.40695 2.20119 5.30882 2.31496C5.19779 2.44368 5.12886 2.61903 4.99099 2.96973L4.06114 5.335H14.9389Z" fill="#6691FF"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.91357 8.26029C5.16377 8.36037 5.43412 8.415 5.71619 8.415C6.18083 8.415 6.61405 8.26632 6.97747 8.01087C7.34089 8.26632 7.77411 8.415 8.23875 8.415C8.70339 8.415 9.13661 8.26632 9.50003 8.01087C9.86345 8.26632 10.2967 8.415 10.7613 8.415C11.2259 8.415 11.6592 8.26632 12.0226 8.01087C12.386 8.26632 12.8192 8.415 13.2839 8.415C13.5659 8.415 13.8363 8.36037 14.0865 8.26029V11.4C14.0865 11.9601 14.0865 12.2401 13.9865 12.454C13.8986 12.6422 13.7583 12.7951 13.5857 12.891C13.3894 13 13.1326 13 12.6188 13H6.38124C5.8675 13 5.61064 13 5.41442 12.891C5.24182 12.7951 5.10149 12.6422 5.01354 12.454C4.91357 12.2401 4.91357 11.9601 4.91357 11.4V8.26029ZM5.83084 10.3C5.83084 10.02 5.83084 9.87996 5.88083 9.773C5.9248 9.67892 5.99496 9.60243 6.08126 9.5545C6.17937 9.5 6.3078 9.5 6.56467 9.5H8.30753C8.56439 9.5 8.69283 9.5 8.79094 9.5545C8.87724 9.60243 8.9474 9.67892 8.99137 9.773C9.04136 9.87996 9.04136 10.02 9.04136 10.3V11.2C9.04136 11.48 9.04136 11.62 8.99137 11.727C8.9474 11.8211 8.87724 11.8976 8.79094 11.9455C8.69283 12 8.56439 12 8.30753 12H6.56467C6.3078 12 6.17937 12 6.08126 11.9455C5.99496 11.8976 5.9248 11.8211 5.88083 11.727C5.83084 11.62 5.83084 11.48 5.83084 11.2V10.3Z" fill="#6691FF"/>
                    <path d="M5.71616 7.75C4.80481 7.75 4.059 6.97725 4 6H15C14.941 6.97725 14.1952 7.75 13.2838 7.75C12.7855 7.75 12.3367 7.51896 12.0226 7.14977C11.7084 7.51896 11.2596 7.75 10.7613 7.75C10.2629 7.75 9.81412 7.51896 9.5 7.14977C9.18589 7.51896 8.73705 7.75 8.23872 7.75C7.74039 7.75 7.29156 7.51896 6.97744 7.14977C6.66333 7.51896 6.2145 7.75 5.71616 7.75Z" fill="#6691FF"/>
                  </svg>
                </div>
                <div class="text">
                  <h4>On Sale for</h4>
                </div>
                <div class="price">
                  <h4>{{ cutNumberNano(item.nft_price_nano) }}</h4>
                  <img src="/market/ton.svg" alt="ton" />
                </div>
              </div>
            </div>
            <div class="actions">
              <div class="next">
                <img src="/market/chevrone-right.svg" alt="done" /> 
              </div>
            </div>
          </div>

        </div>

        <div
          v-if="Searching || ListingsList.length === 0"
          class="_direction _comp _item _loads"
        >
          <div class="null">
            <div class="load-icon"></div>
          </div>
        </div>
        
        <div v-show="HasMore" ref="sentinel" style="height: 1px;"></div>
      </div>
  </div>
</template>

<script>
import { unixToDefault, unixToRelative } from '../../utils/useApp';
import { getUpgradedModel } from '../../utils/useGift';
import { cutNumberNano } from '../../utils/useTon';
import { Icon } from '../Icon';

import Lottie from '../Lottie.vue';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    ListingsList: { type: Array, required: true },
    Searching: { type: Boolean, required: true },
    HasMore: { type: Boolean, required: true },
  },

  components: {
    Lottie,
  },

  data() {
    return {
      isLoading: this.Skeleton,
      observer: null,

      Icon,
      unixToDefault,
      getUpgradedModel,
      cutNumberNano,
      unixToRelative,
    };
  },

  mounted() {
    this.loadResources();
      
    // OBSERVER
    this.$nextTick(() => {
      const el = this.$refs.sentinel;
      if (!el) return;
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && this.HasMore && !this.Searching && !this.isLoading) {
            this.$emit('loadMore');
          }
        },
        { root: null, threshold: 0.1, rootMargin: '0px 0px 200px 0px' }
      );
      this.observer.observe(el);
    });
  },

  beforeUnmount() {
    this.observer?.disconnect();
    this.observer = null;
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

    openGift() {
      this.$emit('openGift', {});
    },
  },
};
</script>

<style lang="sass">
@use "./Listings.sass"
</style>