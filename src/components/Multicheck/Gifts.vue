<template>
  <div class="_direction _comp _item _multicheckGifts" :class="Key">
      <div v-if="isLoading" class="_skeleton">
          <div class="_items">
            <div class="_item"></div>
            <div class="_item"></div>
            <div class="_item"></div>
            <div class="_item"></div>
            <div class="_item"></div>
          </div>
      </div>
      
      <div v-else class="_content">
          <div class="_items">
            <div 
              v-if="GiftsList && GiftsList.length > 0"
              v-for="gift in GiftsList" 
              class="_gifts"
            >
              <div 
                class="_item"
                :class="{ hide: !gift.checkStatus }"
              >
                <div class="_itemLeft">
                  <div class="_itemLeftImage">
                    <img 
                      :src="storeCache?.NftsAppData[gift.nft_unique_key].nftImages.imageArticle"
                      alt="gift_plane_stars"
                    />
                  </div>
                </div>
                <div class="_itemRight">
                  <div class="_itemRightContext">
                    <div class="_itemRightTitle">
                      <h4>{{ storeCache?.NftsAppData[gift.nft_unique_key].nftName }}</h4>
                    </div>
                    <div class="_itemRightCounts">
                      <p>x{{ gift.nft_counts }}</p> 
                      <b v-if="gift.checkCount > 0">-{{ gift.checkCount }}</b>
                    </div>
                  </div>
                  <div class="_itemRightButtons">
                    <button @click="selectAll(gift)">
                      <h4>{{ $t('multicheck.selectAll') }}</h4>
                    </button>
                    <div class="_calc">
                      <div @click="removeCount(gift)" class="_calc_minus">
                        <div class="kit-icon" v-html="Icon.Minus"></div>
                      </div>
                      <div class="_calc_value">
                        <p>{{ gift.checkCount }}</p>
                      </div>
                      <div @click="addCount(gift)" class="_calc_plus">
                        <div class="kit-icon" v-html="Icon.Plus"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
      </div>
      
      <div v-if="!isLoading && (!GiftsList || GiftsList.length === 0)" class="_notfound">
        <img src="../../assets/images/not-found.png" alt="notfound" />
        <h4>{{ $t('multicheck.notfoundText') }}</h4>
      </div>
  </div>
</template>

<script>
import * as nftApi from '../../api/nftApi'

import { useCacheStore } from '../../stores/pinia/piniaStore';
import { unixToRelative } from '../../utils/useApp';
import { cleanString } from '../../utils/useApp';
import { Icon } from '../Icon';

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
    },
  },

  components: {
    Lottie,
  },

  data() {
    return {
      storeCache: useCacheStore(),
      isLoading: this.$props.Skeleton,

      GiftsList: null,
      GiftsListUuds: [],

      MulticheckData: {
        userId: null,
        nftName: null,
        nftUniqueKey: null,
        nftCount: 0,
        nftIds: []
      },

      unixToRelative,
      cleanString,

      Icon,
    };
  },

  mounted() {
    this.loadResources();
    this.getGiftsList();

    this.$watch(() => this.storeCache.TelegramData, () => {
      this.getGiftsList();
    });
  },

  computed: {
    isLoading() {
      return this.Skeleton;
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

    loadFonts() {
      return document.fonts.ready;
    },

    loadImages() {
      const giftsImages = (Array.isArray(this.storeCache?.NftsApp) ? this.storeCache?.NftsApp : Object.values(this.storeCache?.NftsApp || {})).map((gift) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = gift.nftImages.imageArticle;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

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

      return Promise.all([...giftsImages, ...staticImages]);
    },

    async getGiftsList() {
      if (!this.storeCache.TelegramData.user.id) return;

      const response = await nftApi.getPurchasedMulticheck(
        this.storeCache.TelegramData.user.id
      );

      this.GiftsList = response.map(gift => ({
        ...gift,
        checkStatus: true,
        checkCount: 0,
      }));
    },

    async selectAll(gift) {
      if (gift.checkCount < gift.nft_counts) {
        this.GiftsList.forEach(g => g.checkStatus = false);
        gift.checkStatus = true;
        gift.checkCount = gift.nft_counts;
      }

      this.GiftsListUuds = [...gift.nft_ids];
      this.updateMulticheckData(gift);
    },

    async removeCount(gift) {
      if (gift.checkCount > 0) {
        gift.checkCount -= 1;
        this.GiftsListUuds.pop();
      }

      if (gift.checkCount === 0) {
        this.GiftsList.forEach(g => g.checkStatus = true);
      }

      this.updateMulticheckData(gift);
    },

    async addCount(gift) {
      if (gift.checkCount < gift.nft_counts) {
        this.GiftsList.forEach(g => g.checkStatus = false);
        gift.checkStatus = true;
        gift.checkCount += 1;

        if (gift.nft_ids.length > gift.checkCount - 1) {
          this.GiftsListUuds.push(gift.nft_ids[gift.checkCount - 1]);
        }

        this.updateMulticheckData(gift);
      }
    },

    updateMulticheckData(gift) {
      this.MulticheckData = {
        userId: this.storeCache.TelegramData.user.id,
        nftName: this.storeCache.NftsAppData[gift.nft_unique_key]?.nftName || '',
        nftUniqueKey: gift.nft_unique_key,
        nftCount: gift.checkCount,
        nftIds: [...this.GiftsListUuds],
      };

      this.$emit('dataGift', this.MulticheckData);
    }
  },
};
</script>