<template>
  <div :class="['_direction _comp _item _pageContent', Key]">
    <div v-if="isLoading" class="_skeleton">
      <div class="_text"><p></p></div>
    </div>
    <div v-else class="_content">
      <div class="_inputBlock">
        <label for="input">{{ InputLabel }}</label>
        <div class="_inputContent">
          <img :src="InputImage" alt="image" />
          <input @input="updatePrivateDealData" ref="priceDeal" type="text" :placeholder="InputPlaceholder" />
        </div>
      </div>
      <div v-if="GiftsList && GiftsList.length > 0" class="_inputBlock">
        <div class="_flexed">
          <label for="input">{{ $t('privateDeal.label2') }}</label>
          <span @click="selectAllGifts" v-if="GiftsListUuds.length <= 0">{{ $t('privateDeal.selectAll') }}</span>
          <span @click="selectAllGifts" v-if="GiftsListUuds.length === GiftsList.length">{{ $t('privateDeal.unselectAll') }}</span>
        </div>
        <div class="_gifts">
          <div 
            v-for="gift in GiftsList"
            @click="selectGift(gift)"
            class="_gift"
            :class="storeCache?.NftsAppData[gift.nft_unique_key].nftRarity"
          >
            <div class="_checkbox">
              <input type="checkbox" :checked="GiftsListUuds.includes(gift.uuid)" />
              <div class="kit-icon" :class="{ active: GiftsListUuds.includes(gift.uuid) }" v-html="Icon.Done"></div>
            </div>
            <div class="_symbols">
              <img :src="Image_GiftBg" alt="rarity" />
            </div>
            <div class="_nft">
              <img :src="storeCache?.NftsAppData[gift.nft_unique_key].nftImages.imageMain" alt="nft" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as nftApi from '../../api/nftApi';

import { Icon } from '../Icon';
import { useCacheStore } from '../../stores/pinia/piniaStore';

import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';

export default {
  props: {
    Skeleton: {
      type: Boolean,
      required: true
    },
    SkeletonTime: {
      type: Number,
      required: true
    },
    InputLabel: {
      type: String,
      required: false
    },
    InputImage: {
      type: String,
      required: false
    },
    InputPlaceholder: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      storeCache: useCacheStore(),

      isLoading: this.$props.Skeleton,
      
      GiftsList: null,
      GiftsListUuds: [],

      PrivateDealData: {
        userId: null,
        nftCount: 0,
        nftIds: []
      },

      Icon,
      Image_GiftBg,
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
        await Promise.all([this.loadFonts(), this.loadImage()]);
        this.$emit("loadSuccess");
      } catch {}
    },

    loadFonts() {
      return document.fonts.ready;
    },

    loadImage() {
      if (!this.ImageShow || !this.Image) return Promise.resolve();

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = this.Image;
        img.onload = resolve;
        img.onerror = reject;
      });
    },

    async getNftCount() {
      try {
        const userId = this.storeCache.TelegramData.user.id;
        const data = await nftApi.getNftsUser(userId);
        return data;
      } catch (error) {
        return { received: { count: 0, items: [] }, purchased: { count: 0, items: [] } };
      }
    },

    async getGiftsList() {
      if (!this.storeCache.TelegramData.user.id) return;
      const gifts = await this.getNftCount();
      const giftsPurchased = gifts.purchased.items;
      this.GiftsList = giftsPurchased;
    },

    async selectAllGifts() {
      if (this.GiftsListUuds.length === this.GiftsList.length) {
        this.GiftsListUuds = [];
      } else {
        this.GiftsListUuds = this.GiftsList.map((gift) => gift.uuid);
      }

      this.updatePrivateDealData();
    },

    async selectGift(gift) {
      if (this.GiftsListUuds.includes(gift.uuid)) {
        this.GiftsListUuds = this.GiftsListUuds.filter((id) => id !== gift.uuid);
      } else {
        this.GiftsListUuds = [...this.GiftsListUuds, gift.uuid];
      }

      this.updatePrivateDealData();
    },

    updatePrivateDealData() {
      this.PrivateDealData = {
        userId: this.storeCache.TelegramData.user.id,
        price: this.$refs.priceDeal.value,
        nftCount: this.GiftsListUuds.length,
        nftIds: [...this.GiftsListUuds],
      };

      this.$emit('dataGift', this.PrivateDealData);
    }
  },
};
</script>