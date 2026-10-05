<template>
  <div class="mc-body">
    <div v-if="isLoading" class="mc-skel">
      <div class="mc-skel__line"></div>
      <div class="mc-skel__grid">
        <div class="mc-skel__card" v-for="i in 6" :key="i"></div>
      </div>
    </div>

    <template v-else>
      <div class="mc-tabs">
        <button
          type="button"
          class="mc-tabs__item"
          :class="{ active: activeTab === 'purchased' }"
          @click="switchTab('purchased')"
        >
          {{ $t('multicheck.tabPurchased') }}
        </button>
        <button
          type="button"
          class="mc-tabs__item"
          :class="{ active: activeTab === 'received' }"
          @click="switchTab('received')"
        >
          {{ $t('multicheck.tabReceived') }}
        </button>
      </div>

      <div class="mc-bar">
        <span class="mc-bar__count">
          {{ GiftsList.length }}
          {{ $t('profile.profileFilters.gifts') }}
          <template v-if="selectedIds.length">
            · {{ selectedIds.length }} {{ $t('multicheck.selected') }}
          </template>
        </span>
        <button
          v-if="GiftsList.length > 0"
          type="button"
          class="mc-bar__action"
          @click="toggleSelectAll"
        >
          {{ allSelected ? $t('multicheck.clearSel') : $t('multicheck.selectAll') }}
        </button>
      </div>

      <div v-if="listLoading" class="mc-skel__grid">
        <div class="mc-skel__card" v-for="i in 6" :key="i"></div>
      </div>

      <div v-else-if="GiftsList.length > 0" class="mc-grid">
        <button
          v-for="item in GiftsList"
          :key="item.uuid"
          type="button"
          class="mc-gift"
          :class="{
            selected: isSelected(item.uuid),
            'is-upgraded': !!item.upgraded,
          }"
          @click="toggleGift(item)"
        >
          <!-- Style on INNER so rarity/upgrade colors actually show -->
          <div class="mc-gift__inner" :style="giftCardStyle(item)">
            <div class="mc-gift__symbols">
              <img
                v-if="item.upgraded && item.upgrade?.symbol_image"
                :src="item.upgrade.symbol_image"
                alt=""
              />
              <img v-else src="/gift_bg.png" alt="" />
            </div>

            <div v-if="item.upgraded && item.upgrade?.seq != null" class="mc-gift__badge">
              <span>#{{ item.upgrade.seq }}</span>
            </div>

            <div class="mc-gift__nft">
              <img :src="giftImage(item)" alt="" />
            </div>
          </div>

          <!-- Rarity ribbon outside clip (like profile) -->
          <div v-if="!item.upgraded && giftRarity(item)" class="mc-gift__rarity">
            <div class="mc-gift__rarity-img">
              <img :src="checkRarityImage(giftRarity(item))" alt="" />
            </div>
            <div class="mc-gift__rarity-txt">
              <span>{{ checkRarity(giftRarity(item)) }}</span>
            </div>
          </div>

          <div class="mc-gift__pick" v-show="isSelected(item.uuid)" aria-hidden="true">
            <svg viewBox="0 0 12 10" fill="none">
              <path d="M1.2 5.1L4.5 8.3L10.8 1.7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </button>
      </div>

      <div v-else class="mc-empty">
        <h4>{{ $t('multicheck.notfoundText') }}</h4>
      </div>
    </template>
  </div>
</template>

<script>
import * as nftApi from '../../api/nftApi';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { checkRarity, checkRarityImage, getUpgradedModel } from '../../utils/useGift';
import TelegramModule from '../../hooks/useTelegram';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
  },

  data() {
    return {
      storeCache: useCacheStore(),
      isLoading: this.$props.Skeleton,
      listLoading: false,
      activeTab: 'purchased',
      GiftsList: [],
      selectedIds: [],
      MulticheckData: {
        userId: null,
        nftName: null,
        nftUniqueKey: null,
        nftCount: 0,
        nftIds: [],
        tab: 'purchased',
        giftsSummary: [],
        selectedItems: [],
      },
      checkRarity,
      checkRarityImage,
    };
  },

  computed: {
    allSelected() {
      return this.GiftsList.length > 0 && this.selectedIds.length === this.GiftsList.length;
    },
  },

  mounted() {
    this.loadResources();
    this.getGiftsList();
    this.$watch(
      () => this.storeCache.TelegramData,
      () => this.getGiftsList()
    );
  },

  methods: {
    async loadResources() {
      try {
        await document.fonts.ready;
      } catch {}
      this.isLoading = false;
      this.$emit('loadSuccess');
    },

    isSelected(uuid) {
      return this.selectedIds.includes(uuid);
    },

    selectionIndex(uuid) {
      const i = this.selectedIds.indexOf(uuid);
      return i >= 0 ? i + 1 : '';
    },

    giftRarity(item) {
      return (
        item?.rarity ||
        this.storeCache?.NftsAppData?.[item.gift_ukey]?.Rarity ||
        ''
      );
    },

    giftImage(item) {
      if (item.upgraded && item.upgrade) {
        if (item.gift_media === 'svg') return item.upgrade.nft_image;
        const name = item.upgrade.nft_name?.name || item.upgrade.nft_name;
        return getUpgradedModel(item.gift_ukey, name, 'svg') || item.upgrade.nft_image || '';
      }
      return item.gift_image || this.storeCache?.NftsAppData?.[item.gift_ukey]?.ImageMain || '';
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

    // Same as profile Profile/Gifts.vue giftCardStyle
    giftCardStyle(item) {
      if (item.upgraded && item.upgrade) {
        const c = item.upgrade.background_colors_center || item.upgrade.background?.colors_center || '#666';
        const a = item.upgrade.background_colors_around || item.upgrade.background?.colors_around || '#1a1a1a';
        const hot = this.boostColor(c, 0.28);
        return {
          background: `radial-gradient(circle at 50% 40%, ${hot} 0%, ${c} 45%, ${a} 100%)`,
        };
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
      return {
        background: map[r] || '#252528',
      };
    },

    switchTab(tab) {
      if (this.activeTab === tab) return;
      this.activeTab = tab;
      this.selectedIds = [];
      this.emitData();
      this.getGiftsList();
      TelegramModule.useSoftHaptic?.();
    },

    async getGiftsList() {
      if (!this.storeCache.TelegramData?.user?.id) return;
      this.listLoading = true;
      try {
        const result = await nftApi.getGifts(this.activeTab, '', '', '', '', '', 0, 100);
        this.GiftsList = result && Array.isArray(result.items) ? result.items : [];
      } catch {
        this.GiftsList = [];
      } finally {
        this.listLoading = false;
      }
    },

    toggleGift(item) {
      const idx = this.selectedIds.indexOf(item.uuid);
      if (idx >= 0) this.selectedIds.splice(idx, 1);
      else this.selectedIds.push(item.uuid);
      TelegramModule.useSoftHaptic?.();
      this.emitData();
    },

    toggleSelectAll() {
      if (this.allSelected) this.selectedIds = [];
      else this.selectedIds = this.GiftsList.map((g) => g.uuid);
      TelegramModule.useSoftHaptic?.();
      this.emitData();
    },

    emitData() {
      const selected = this.GiftsList.filter((g) => this.selectedIds.includes(g.uuid));
      const ordered = this.selectedIds
        .map((id) => selected.find((g) => g.uuid === id))
        .filter(Boolean);
      const first = ordered[0];

      const byKey = {};
      ordered.forEach((g) => {
        const key = g.gift_ukey;
        if (!byKey[key]) {
          const d = this.storeCache?.NftsAppData?.[key];
          byKey[key] = {
            name: d?.Name || key,
            image: d?.ImageMain || g.gift_image || '',
            count: 0,
          };
        }
        byKey[key].count += 1;
      });

      const selectedItems = ordered.map((g) => ({
        uuid: g.uuid,
        image: this.giftImage(g),
        name: this.storeCache?.NftsAppData?.[g.gift_ukey]?.Name || g.gift_ukey,
      }));

      this.MulticheckData = {
        userId: this.storeCache.TelegramData?.user?.id || null,
        nftName: ordered
          .map((g) => this.storeCache?.NftsAppData?.[g.gift_ukey]?.Name || g.gift_ukey)
          .join(', '),
        nftUniqueKey: first?.gift_ukey || '',
        nftCount: ordered.length,
        nftIds: [...this.selectedIds],
        tab: this.activeTab,
        giftsSummary: Object.values(byKey),
        selectedItems,
      };
      this.$emit('dataGift', this.MulticheckData);
    },
  },
};
</script>
