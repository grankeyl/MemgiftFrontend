<template>
  <div class="_direction _comp _item listings" v-if="showSkeleton || (ListingsList && ListingsList.length > 0) || Searching">
    <div class="listings-card" :class="{ 'is-loading': showSkeleton }">
      <div v-if="showSkeleton" class="listings-skel">
        <div class="skel-row" v-for="n in 6" :key="'sk-' + n">
          <div class="skel-nft"></div>
          <div class="skel-ctx">
            <div class="skel-line skel-wide"></div>
            <div class="skel-line skel-short"></div>
          </div>
          <div class="skel-price"></div>
        </div>
      </div>

      <div v-else class="listings-content">
        <div class="listings-list">
          <div
            v-for="(item, index) in ListingsList"
            :key="item.id || index"
            class="listings-row"
            :class="statusClass(item.nft_status)"
          >
            <div class="listings-row__thumb">
              <div
                class="listings-row__bg"
                :style="{
                  '--center-color': item.nftbg_center,
                  '--around-color': item.nftbg_around,
                }"
              ></div>
              <div class="listings-row__symbol">
                <img :src="item.nft_symbol_image" alt="" />
              </div>
              <div class="listings-row__model">
                <img
                  v-if="item.nft_media === 'svg'"
                  :src="item.nft_image"
                  alt=""
                />
                <img
                  v-else
                  :src="getUpgradedModel(item.gift_name, item.nft_name, 'svg')"
                  alt=""
                />
              </div>
            </div>

            <div class="listings-row__mid">
              <div class="listings-row__title">
                <span class="listings-row__name">{{ item.nft_name }}</span>
                <span class="listings-row__seq">#{{ item.nft_seq }}</span>
              </div>
              <div class="listings-row__meta">
                <span class="listings-row__chip" :class="statusClass(item.nft_status)">
                  {{ statusLabel(item) }}
                </span>
                <span
                  v-if="item.nft_status === 'sold' || item.nft_status === 'listed'"
                  class="listings-row__price"
                  :class="statusClass(item.nft_status)"
                >
                  {{ cutNumberNano(item.nft_price_nano) }}
                  <img :src="TonImg" alt="" />
                </span>
              </div>
            </div>

            <div class="listings-row__side">
              <span class="listings-row__date">{{ unixToRelative(item.created_at) }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="Searching && ListingsList.length > 0"
          class="listings-loadmore"
        >
          <div class="listings-loadmore__icon"></div>
        </div>

        <div v-show="HasMore" ref="sentinel" class="listings-sentinel"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { unixToDefault, unixToRelative } from '../../utils/useApp';
import { getUpgradedModel } from '../../utils/useGift';
import { cutNumberNano } from '../../utils/useTon';
import { Icon } from '../Icon';

import Lottie from '../Lottie.vue';

import GiftImg from '@/assets/images/market/gift.svg';
import TonImg from '@/assets/images/market/ton.svg';
import ChevroneRightImg from '@/assets/images/market/chevrone-right.svg';

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
      GiftImg,
      TonImg,
      ChevroneRightImg,
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
    showSkeleton() {
      return this.isLoading || (this.Searching && (!this.ListingsList || this.ListingsList.length === 0));
    },
  },

  methods: {
    statusClass(status) {
      if (status === 'sold') return 'is-sold';
      if (status === 'listed') return 'is-listed';
      if (status === 'removed') return 'is-removed';
      return '';
    },
    statusLabel(item) {
      const s = item.nft_status;
      if (['removed', 'sold', 'listed'].includes(s)) return this.$t(`market.listings.${s}`);
      return '';
    },
    async loadResources() {
      try {
        await Promise.all([document.fonts.ready]);
        this.isLoading = false;
        this.$emit('loadSuccess');
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style lang="sass" scoped>
@use "./Listings.sass"
</style>
