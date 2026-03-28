<template>
  <div class="bulk" :class="{ open: isExpanded }">
    <!-- Collapsed row -->
    <div class="bulk__row" @click="isExpanded = true">
      <span class="bulk__trigger">{{ $t('market.bulk.title') }}</span>
      <span class="bulk__hint">{{ $t('market.bulk.from') }} {{ cutNumber(cheapestPrice) }} TON</span>
      <svg class="bulk__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- Expanded panel (always in DOM, animated via CSS) -->
    <div class="bulk__panel">
      <div class="bulk__inner">
        <div class="bulk__slide">
          <input
            type="range"
            class="bulk__input"
            :min="1"
            :max="maxQuantity"
            :value="quantity"
            @input="onSlide"
            :style="rangeStyle"
          />
        </div>

        <div class="bulk__stats">
          <div class="bulk__qty">
            <span class="bulk__qty-num">{{ quantity }}</span>
            <span class="bulk__qty-unit">{{ quantity === 1 ? $t('market.bulk.gift') : $t('market.bulk.gifts') }}</span>
          </div>
          <div class="bulk__price">
            <span class="bulk__price-val">{{ cutNumber(totalPrice) }}</span>
            <img :src="TonImg" alt="ton" />
          </div>
        </div>

        <div class="bulk__actions">
          <button 
            class="bulk__buy"
            :class="{ _loading: isBuying, _done: isDone, _disabled: !canBuy }"
            :disabled="!canBuy || isBuying"
            @click="startBuy"
          >
            <template v-if="isDone">{{ $t('market.bulk.done') }} ({{ lastBoughtCount }})</template>
            <template v-else-if="isBuying">
              <span class="bulk__buy-progress">{{ buyProgress }}/{{ quantity }}</span>
              <span class="bulk__buy-bar" :style="{ width: progressPct + '%' }"></span>
            </template>
            <template v-else>
              {{ $t('market.bulk.buyFor') }} {{ cutNumber(totalPrice) }} TON
            </template>
          </button>
          <button class="bulk__close" @click="collapse">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <p v-if="!canBuy && !isBuying" class="bulk__warn">{{ $t('market.bulk.noBalance') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { cutNumber } from '../../utils/useTon';
import { showToast } from '../../utils/toastManager';
import * as MarketLotApi from '@/api/market/lots';

import TonImg from '@/assets/images/market/ton.svg';
import TonWhiteImg from '@/assets/images/market/ton-white.svg';

export default {
  props: {
    GiftsList: { type: Array, required: true },
  },
  emits: ['bought'],

  data() {
    return {
      TonImg, TonWhiteImg,
      storeCache: useCacheStore(),
      isExpanded: false,
      quantity: 1,
      isBuying: false,
      isDone: false,
      buyProgress: 0,
      lastBoughtCount: 0,
      cutNumber,
    };
  },

  computed: {
    sortedGifts() {
      return [...this.GiftsList].sort((a, b) => parseFloat(a.price_ton) - parseFloat(b.price_ton));
    },
    maxQuantity() {
      return Math.min(this.sortedGifts.length, 50);
    },
    selectedGifts() {
      return this.sortedGifts.slice(0, this.quantity);
    },
    cheapestPrice() {
      if (!this.sortedGifts.length) return '0';
      return this.sortedGifts[0].price_ton;
    },
    totalPrice() {
      return this.selectedGifts.reduce((s, g) => s + parseFloat(g.price_ton), 0).toString();
    },
    balance() {
      return parseFloat(this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0);
    },
    canBuy() {
      return this.balance >= parseFloat(this.totalPrice);
    },
    progressPct() {
      if (!this.quantity) return 0;
      return Math.round((this.buyProgress / this.quantity) * 100);
    },
    rangeStyle() {
      const pct = ((this.quantity - 1) / Math.max(this.maxQuantity - 1, 1)) * 100;
      return { '--bulk-pct': pct + '%' };
    },
  },

  watch: {
    GiftsList() {
      if (this.quantity > this.maxQuantity) {
        this.quantity = Math.max(1, this.maxQuantity);
      }
    },
  },

  methods: {
    onSlide(e) {
      this.quantity = parseInt(e.target.value, 10);
      this.isDone = false;
    },
    collapse() {
      this.isExpanded = false;
      this.quantity = 1;
      this.isDone = false;
    },
    async startBuy() {
      if (!this.canBuy || this.isBuying) return;
      this.isBuying = true;
      this.buyProgress = 0;
      this.isDone = false;
      this.lastBoughtCount = 0;

      const toBuy = [...this.selectedGifts];
      const boughtIds = [];

      for (const gift of toBuy) {
        try {
          const data = await MarketLotApi.buy(gift.id);
          if (data.ok) {
            boughtIds.push(gift.id);
            if (this.storeCache.UserData.user.Balance.balance_ton) {
              this.storeCache.UserData.user.Balance.balance_ton =
                parseFloat(this.storeCache.UserData.user.Balance.balance_ton) - parseFloat(data.price_ton);
            }
          } else {
            showToast(data.error || 'Error', 'error');
            break;
          }
        } catch (e) {
          showToast(e?.error || 'Error', 'error');
          break;
        }
        this.buyProgress++;
      }

      this.isBuying = false;
      this.lastBoughtCount = boughtIds.length;

      if (boughtIds.length > 0) {
        this.isDone = true;
        this.$emit('bought', boughtIds);
        setTimeout(() => { this.isDone = false; }, 3000);
      }

      this.quantity = 1;
    },
  },
};
</script>

<style lang="sass" scoped>
@use "./BulkBar.sass"
</style>
