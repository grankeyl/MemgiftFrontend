<template>
  <div class="pd-create">
    <div class="pd-price">
      <img :src="Image_Ton" alt="" class="pd-price__ton" />
      <input
        :value="priceStr"
        @input="onPriceInput"
        type="text"
        inputmode="decimal"
        :placeholder="$t('privateDeal.pricePlaceholder')"
      />
      <span class="pd-price__unit">TON</span>
    </div>

    <div class="pd-tabs pd-tabs--sm">
      <button
        type="button"
        class="pd-tabs__item"
        :class="{ active: activeTab === 'purchased' }"
        @click="switchTab('purchased')"
      >
        {{ $t('profile.profileGiftsCategory2') }}
      </button>
      <button
        type="button"
        class="pd-tabs__item"
        :class="{ active: activeTab === 'received' }"
        @click="switchTab('received')"
      >
        {{ $t('profile.profileGiftsCategory1') }}
      </button>
    </div>

    <div class="pd-bar">
      <span class="pd-bar__count">
        {{ GiftsList.length }} {{ $t('profile.profileFilters.gifts') }}
        <template v-if="selectedIds.length">
          · {{ selectedIds.length }} {{ $t('multicheck.selected') }}
        </template>
      </span>
      <button
        v-if="GiftsList.length > 0"
        type="button"
        class="pd-bar__action"
        @click="toggleSelectAll"
      >
        {{ allSelected ? $t('multicheck.clearSel') : $t('multicheck.selectAll') }}
      </button>
    </div>

    <div v-if="loading" class="pd-grid-skel">
      <div v-for="i in 6" :key="i" class="pd-grid-skel__item"></div>
    </div>

    <div v-else-if="GiftsList.length > 0" class="pd-grid">
      <button
        v-for="item in GiftsList"
        :key="item.uuid"
        type="button"
        class="pd-gift"
        :class="{ selected: selectedIds.includes(item.uuid), 'is-upgraded': !!item.upgraded }"
        @click="toggleGift(item)"
      >
        <div class="pd-gift__inner" :style="giftCardStyle(item)">
          <div class="pd-gift__symbols">
            <img
              v-if="item.upgraded && item.upgrade?.symbol_image"
              :src="item.upgrade.symbol_image"
              alt=""
            />
            <img v-else src="/gift_bg.png" alt="" />
          </div>
          <div v-if="item.upgraded && item.upgrade?.seq != null" class="pd-gift__badge">
            <span>#{{ item.upgrade.seq }}</span>
          </div>
          <div class="pd-gift__nft">
            <img :src="giftImage(item)" alt="" />
          </div>
        </div>
        <div class="pd-gift__pick" v-show="selectedIds.includes(item.uuid)" aria-hidden="true">
          <svg viewBox="0 0 12 10" fill="none">
            <path d="M1.2 5.1L4.5 8.3L10.8 1.7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </button>
    </div>

    <div v-else class="pd-empty">
      <p>{{ $t('privateDeal.notfoundText') }}</p>
    </div>

    <div class="pd-dock">
      <button
        v-if="canCreate"
        type="button"
        class="pd-dock__btn pd-dock__btn--on"
        :class="{ loading: creating }"
        :disabled="creating"
        @click="handleCreate"
      >
        <img :src="Image_TonWhite" alt="" />
        <span>{{ $t('privateDeal.create') }} · {{ selectedIds.length }} · {{ priceStr }} TON</span>
      </button>
      <button v-else type="button" class="pd-dock__btn pd-dock__btn--off" disabled>
        {{
          selectedIds.length > 0 && !priceNum
            ? $t('privateDeal.enterPrice')
            : $t('privateDeal.chooseNumberGifts')
        }}
      </button>
    </div>
  </div>
</template>

<script>
import * as nftApi from '../../api/nftApi';
import { tonToNano } from '../../api/privateDealApi';
import { getUpgradedModel } from '../../utils/useGift';
import TelegramModule from '../../hooks/useTelegram';

import Image_Ton from '@/assets/images/market/ton.svg';
import Image_TonWhite from '@/assets/images/market/ton-white.svg';

export default {
  props: {
    storeCache: { type: Object, required: true },
  },
  emits: ['createDeal'],

  data() {
    return {
      loading: true,
      creating: false,
      activeTab: 'purchased',
      GiftsList: [],
      selectedIds: [],
      priceStr: '',
      Image_Ton,
      Image_TonWhite,
    };
  },

  computed: {
    priceNum() {
      const n = parseFloat(this.priceStr);
      return Number.isFinite(n) && n > 0 ? n : 0;
    },
    canCreate() {
      return this.selectedIds.length > 0 && this.priceNum > 0 && !this.creating;
    },
    allSelected() {
      return this.GiftsList.length > 0 && this.selectedIds.length === this.GiftsList.length;
    },
  },

  mounted() {
    this.loadGifts();
    this.$watch(
      () => this.storeCache.TelegramData,
      () => this.loadGifts()
    );
  },

  methods: {
    giftRarity(item) {
      return item?.rarity || this.storeCache?.NftsAppData?.[item.gift_ukey]?.Rarity || '';
    },

    giftImage(item) {
      if (item.upgraded && item.upgrade) {
        if (item.gift_media === 'svg') return item.upgrade.nft_image;
        const name = item.upgrade.nft_name?.name || item.upgrade.nft_name;
        return getUpgradedModel(item.gift_ukey, name, 'svg') || item.upgrade.nft_image || '';
      }
      return item.gift_image || this.storeCache.NftsAppData?.[item.gift_ukey]?.ImageMain || '';
    },

    boostColor(hex, amount = 0.28) {
      try {
        let h = String(hex || '').replace('#', '');
        if (h.length === 3) h = h.split('').map((c) => c + c).join('');
        if (h.length !== 6) return hex || '#666';
        let r = parseInt(h.slice(0, 2), 16);
        let g = parseInt(h.slice(2, 4), 16);
        let b = parseInt(h.slice(4, 6), 16);
        r = Math.min(255, Math.round(r + (255 - r) * amount));
        g = Math.min(255, Math.round(g + (255 - g) * amount));
        b = Math.min(255, Math.round(b + (255 - b) * amount));
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      } catch {
        return hex || '#666';
      }
    },

    giftCardStyle(item) {
      if (item.upgraded && item.upgrade) {
        const c = item.upgrade.background_colors_center || item.upgrade.background?.colors_center || '#666';
        const a = item.upgrade.background_colors_around || item.upgrade.background?.colors_around || '#1a1a1a';
        const hot = this.boostColor(c, 0.28);
        return { background: `radial-gradient(circle at 50% 40%, ${hot} 0%, ${c} 45%, ${a} 100%)` };
      }
      const r = this.giftRarity(item);
      const map = {
        rare: 'linear-gradient(180deg, #282867 0%, #131328 100%)',
        veryrare: 'linear-gradient(180deg, #1D6132 0%, #0B2211 100%)',
        epic: 'linear-gradient(180deg, #632475 0%, #19101D 100%)',
        legend: 'linear-gradient(180deg, #6F480E 0%, #1D1710 100%)',
        legendary: 'linear-gradient(180deg, #6F480E 0%, #1D1710 100%)',
        author: 'linear-gradient(180deg, #762121 0%, #221111 100%)',
      };
      return { background: map[r] || '#252528' };
    },

    onPriceInput(e) {
      let val = e.target.value.replace(/[^0-9.]/g, '');
      const parts = val.split('.');
      if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
      if (parts.length === 2 && parts[1].length > 2) {
        val = parts[0] + '.' + parts[1].slice(0, 2);
      }
      this.priceStr = val;
      e.target.value = val;
    },

    switchTab(tab) {
      if (this.activeTab === tab) return;
      this.activeTab = tab;
      this.selectedIds = [];
      this.loadGifts();
      TelegramModule.useSoftHaptic?.();
    },

    async loadGifts() {
      if (!this.storeCache.TelegramData?.user?.id) return;
      this.loading = true;
      try {
        const result = await nftApi.getGifts(this.activeTab, '', '', '', '', '', 0, 100);
        this.GiftsList = result?.items || [];
      } catch {
        this.GiftsList = [];
      } finally {
        this.loading = false;
      }
    },

    toggleGift(item) {
      const idx = this.selectedIds.indexOf(item.uuid);
      if (idx >= 0) this.selectedIds.splice(idx, 1);
      else this.selectedIds.push(item.uuid);
      TelegramModule.useSoftHaptic?.();
    },

    toggleSelectAll() {
      if (this.allSelected) this.selectedIds = [];
      else this.selectedIds = this.GiftsList.map((g) => g.uuid);
      TelegramModule.useSoftHaptic?.();
    },

    handleCreate() {
      if (!this.canCreate || this.creating) return;
      this.creating = true;

      const gifts = this.GiftsList.filter((g) => this.selectedIds.includes(g.uuid)).map((g) => {
        const nftData = this.storeCache.NftsAppData?.[g.gift_ukey];
        const isUpgraded = !!g.upgraded;
        let image = '';
        let symbol = '';
        if (isUpgraded && g.upgrade) {
          if (g.gift_media === 'lottie') {
            image = getUpgradedModel(g.gift_ukey, g.upgrade.nft_name, 'svg');
          } else {
            image = g.upgrade.nft_image || getUpgradedModel(g.gift_ukey, g.upgrade.nft_name, 'svg') || '';
          }
          symbol = g.upgrade.symbol_image || '';
        } else {
          image = g.gift_image || nftData?.ImageMain || '';
        }
        return {
          uuid: g.uuid,
          nft_unique_key: g.gift_ukey,
          image,
          symbol,
          rarity: nftData?.Rarity || '',
          upgraded: isUpgraded,
          bg_center: isUpgraded ? g.upgrade?.background_colors_center || '' : '',
          bg_around: isUpgraded ? g.upgrade?.background_colors_around || '' : '',
        };
      });

      this.$emit('createDeal', { gifts, priceNano: tonToNano(this.priceNum) });

      setTimeout(() => {
        this.creating = false;
        this.selectedIds = [];
        this.priceStr = '';
      }, 600);
    },
  },
};
</script>
