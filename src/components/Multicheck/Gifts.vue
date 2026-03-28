<template>
  <div class="_direction _comp _item _multicheckGifts" :class="Key">
      <div v-if="isLoading" class="_skeleton">
          <div class="mc-skel">
            <div class="mc-skel__row" v-for="i in 3" :key="i"></div>
          </div>
      </div>
      
      <div v-else class="_content">
          <div class="mc-tabs">
            <div class="mc-tabs__item" :class="{ active: activeTab === 'purchased' }" @click="switchTab('purchased')">
              {{ $t('multicheck.tabPurchased') }}
            </div>
            <div class="mc-tabs__item" :class="{ active: activeTab === 'received' }" @click="switchTab('received')">
              {{ $t('multicheck.tabReceived') }}
              <span class="mc-tabs__badge">5★</span>
            </div>
            <div class="mc-tabs__bg" :class="{ right: activeTab === 'received' }"></div>
          </div>

          <div v-if="listLoading" class="mc-skel">
            <div class="mc-skel__row" v-for="i in 3" :key="i"></div>
          </div>

          <div v-else-if="GiftsList && GiftsList.length > 0" class="mc-list">
            <div 
              v-for="(gift, idx) in GiftsList" 
              :key="gift.nft_unique_key"
              class="mc-row"
              :class="{ picked: gift.checkCount > 0 }"
              :style="{ animationDelay: idx * 40 + 'ms' }"
            >
              <div class="mc-row__img">
                <img 
                  v-if="getGiftData(gift.nft_unique_key)?.ImageMain"
                  :src="getGiftData(gift.nft_unique_key).ImageMain"
                  alt=""
                />
              </div>

              <div class="mc-row__body">
                <p class="mc-row__name">{{ getGiftData(gift.nft_unique_key)?.Name || gift.nft_unique_key }}</p>
                <span class="mc-row__sub">×{{ gift.nft_counts }} {{ $t('multicheck.available').toLowerCase() }}</span>
              </div>

              <div class="mc-row__ctrls">
                <button class="mc-row__btn" @click="removeCount(gift)" :class="{ off: gift.checkCount === 0 }">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </button>
                <span class="mc-row__num" :class="{ accent: gift.checkCount > 0 }">{{ gift.checkCount }}</span>
                <button class="mc-row__btn" @click="addCount(gift)" :class="{ off: gift.checkCount >= gift.nft_counts }">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="mc-empty">
            <p>{{ $t('multicheck.notfoundText') }}</p>
          </div>

          <div v-if="totalSelected > 0" class="mc-footer">
            <div class="mc-footer__line">
              <span>{{ $t('multicheck.giftsSelected') }}</span>
              <span class="mc-footer__val">{{ totalSelected }}</span>
            </div>
            <div v-if="activeTab === 'received'" class="mc-footer__line mc-footer__line--accent">
              <span>{{ $t('multicheck.costLabel') }}</span>
              <span class="mc-footer__val">{{ totalSelected * 5 }} ★</span>
            </div>
          </div>
      </div>
  </div>
</template>

<script>
import * as nftApi from '../../api/nftApi'
import { useCacheStore } from '../../stores/pinia/piniaStore';

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
      GiftsList: null,
      MulticheckData: {
        userId: null, nftName: null, nftUniqueKey: null,
        nftCount: 0, nftIds: [], tab: 'purchased',
      },
    };
  },

  computed: {
    totalSelected() {
      if (!this.GiftsList) return 0;
      return this.GiftsList.reduce((sum, g) => sum + g.checkCount, 0);
    },
    allSelectedIds() {
      if (!this.GiftsList) return [];
      const ids = [];
      this.GiftsList.forEach(g => {
        if (g.checkCount > 0) {
          ids.push(...g.nft_ids.slice(0, g.checkCount));
        }
      });
      return ids;
    },
    firstSelectedKey() {
      if (!this.GiftsList) return null;
      const found = this.GiftsList.find(g => g.checkCount > 0);
      return found ? found.nft_unique_key : null;
    },
  },

  mounted() {
    this.loadResources();
    this.getGiftsList();
    this.$watch(() => this.storeCache.TelegramData, () => { this.getGiftsList(); });
  },
  
  methods: {
    async loadResources() {
      try { await document.fonts.ready; } catch {}
      this.isLoading = false;
      this.$emit("loadSuccess");
    },

    getGiftData(ukey) {
      return this.storeCache?.NftsAppData?.[ukey] || null;
    },

    switchTab(tab) {
      if (this.activeTab === tab) return;
      this.activeTab = tab;
      this.MulticheckData = {
        userId: null, nftName: null, nftUniqueKey: null,
        nftCount: 0, nftIds: [], tab: tab,
      };
      this.$emit('dataGift', this.MulticheckData);
      this.getGiftsList();
    },

    async getGiftsList() {
      if (!this.storeCache.TelegramData?.user?.id) return;
      this.listLoading = true;
      const response = await nftApi.getPurchasedMulticheck(
        String(this.storeCache.TelegramData.user.id), this.activeTab
      );
      if (!response || !Array.isArray(response)) {
        this.GiftsList = [];
      } else {
        this.GiftsList = response.map(g => ({ ...g, checkCount: 0 }));
      }
      this.listLoading = false;
    },

    addCount(gift) {
      if (gift.checkCount >= gift.nft_counts) return;
      gift.checkCount++;
      this.emitData();
    },

    removeCount(gift) {
      if (gift.checkCount <= 0) return;
      gift.checkCount--;
      this.emitData();
    },

    emitData() {
      const firstKey = this.firstSelectedKey;
      const selectedNames = this.GiftsList
        .filter(g => g.checkCount > 0)
        .map(g => this.getGiftData(g.nft_unique_key)?.Name || g.nft_unique_key);

      const giftsSummary = this.GiftsList
        .filter(g => g.checkCount > 0)
        .map(g => {
          const d = this.getGiftData(g.nft_unique_key);
          return { name: d?.Name || g.nft_unique_key, image: d?.ImageMain || '', count: g.checkCount };
        });

      this.MulticheckData = {
        userId: this.storeCache.TelegramData.user.id,
        nftName: selectedNames.join(', '),
        nftUniqueKey: firstKey || '',
        nftCount: this.totalSelected,
        nftIds: this.allSelectedIds,
        tab: this.activeTab,
        giftsSummary,
      };
      this.$emit('dataGift', this.MulticheckData);
    },
  },
};
</script>
