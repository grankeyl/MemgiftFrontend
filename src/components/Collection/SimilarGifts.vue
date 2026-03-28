<template>
  <div class="_direction _comp _item _similar">
    <div v-if="isLoading" class="_skeleton">
      <div class="_items">
        <div class="_item"></div>
        <div class="_item"></div>
        <div class="_item"></div>
      </div>
    </div>
    <div v-else-if="similarGifts.length > 0" class="_content">
      <div class="_items">
        <div
          v-for="gift in similarGifts"
          :key="gift.UKey"
          class="_item"
          @click="openCollection(gift.UKey)"
        >
          <div class="_preview" :class="gift.Rarity">
            <img :src="gift.ImageMain" loading="lazy" />
          </div>
          <div class="_info">
            <h4>{{ gift.Name }}</h4>
            <p v-if="gift.Price">⭐ {{ checkPriceNumber(gift.Price) }}</p>
            <p v-else>{{ $t('app.price_free') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { checkPriceNumber } from '../../utils/useGift';
import TelegramModule from '../../hooks/useTelegram';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    NftRarity: { type: String, required: false, default: '' },
    NftKey: { type: String, required: false, default: '' },
  },

  data() {
    return {
      storeCache: useCacheStore(),
      isLoading: this.Skeleton,
      checkPriceNumber,
    };
  },

  mounted() {
    this.loadResources();
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
    similarGifts() {
      const all = this.storeCache.NftsApp;
      if (!all) return [];
      const arr = Array.isArray(all) ? all : Object.values(all);
      return arr
        .filter(g => g.Rarity === this.NftRarity && g.Key !== this.NftKey && !g.soldOut)
        .slice(0, 6);
    },
  },

  methods: {
    async loadResources() {
      try {
        await document.fonts.ready;
        this.isLoading = false;
        this.$emit('loadSuccess');
      } catch {}
    },
    openCollection(UKey) {
      TelegramModule.useSoftHaptic();
      this.$router.push({ name: 'collection', params: { nft: UKey } });
    },
  },
};
</script>
