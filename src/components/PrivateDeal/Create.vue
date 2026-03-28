<template>
  <div class="pd-create">
    <!-- Price input -->
    <div class="pd-create__field">
      <label>{{ $t('privateDeal.label1') }}</label>
      <div class="pd-create__input-wrap">
        <img :src="Image_Ton" alt="TON" />
        <input
          :value="priceStr"
          @input="onPriceInput"
          type="text"
          inputmode="decimal"
          :placeholder="$t('privateDeal.pricePlaceholder')"
        />
      </div>
    </div>

    <!-- Tabs: purchased / received -->
    <div class="_direction _comp _item _categoriesSelected pd-cats">
      <div class="_content">
        <div
          class="_category"
          :class="{ _active: activeTab === 'purchased' }"
          @click="switchTab('purchased')"
        >
          <h4>{{ $t('profile.profileGiftsCategory2') }}</h4>
        </div>
        <div
          class="_category"
          :class="{ _active: activeTab === 'received' }"
          @click="switchTab('received')"
        >
          <h4>{{ $t('profile.profileGiftsCategory1') }}</h4>
        </div>
      </div>
    </div>

    <!-- Info bar -->
    <div class="pd-info" v-if="!loading && GiftsList.length > 0">
      <span class="pd-info__count">{{ giftsCount }} {{ $t('profile.profileFilters.gifts') }}</span>
      <span v-if="selectedIds.length > 0" class="pd-info__sel">{{ selectedIds.length }} {{ $t('multicheck.selected') }}</span>
    </div>

    <!-- Gift grid (copied from profile blocks view) -->
    <div class="_direction _comp _item _nfts pd-nfts">
      <div v-if="loading" class="pd-skel">
        <div class="pd-skel__grid">
          <div v-for="i in 9" :key="i" class="pd-skel__card">
            <div class="pd-skel__badge"></div>
            <div class="pd-skel__circle"></div>
            <div class="pd-skel__price"></div>
          </div>
        </div>
      </div>
      <div v-else-if="GiftsList.length > 0" class="_content">
        <div class="items blocks">
          <div
            v-for="item in GiftsList"
            :key="item.uuid"
            class="item"
            :class="{ 'pd-selected': selectedIds.includes(item.uuid) }"
            @click="toggleGift(item)"
          >
            <!-- Selection checkbox -->
            <div class="pd-check">
              <div class="pd-check__box" :class="{ on: selectedIds.includes(item.uuid) }">
                <svg v-if="selectedIds.includes(item.uuid)" width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5L4.5 8.5L11 1.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>

            <!-- Rarity / seq badge -->
            <div v-if="item.upgraded && !item.market" class="mark">
              <p>#{{ item.upgrade.seq }}</p>
            </div>
            <div v-if="item.upgraded && item.market" class="mark">
              <img :src="StoreImg" alt="store" />
              <p>{{ $t('profile.market') }}</p>
            </div>
            <div v-if="!item.upgraded && !item.market" class="rarity">
              <div class="image">
                <img :src="checkRarityImage(storeCache.NftsAppData?.[item.gift_ukey]?.Rarity)" alt="" />
              </div>
              <div class="span">
                <p>{{ checkRarity(storeCache.NftsAppData[item.gift_ukey]?.Rarity) }}</p>
              </div>
            </div>

            <!-- Background -->
            <div
              v-if="item.upgraded && item.upgrade"
              class="background upg"
              :style="{
                '--center-color': item.upgrade.background_colors_center,
                '--around-color': item.upgrade.background_colors_around,
              }"
            ></div>
            <div
              v-else
              class="background no-upg"
              :class="storeCache.NftsAppData[item.gift_ukey]?.Rarity"
            ></div>

            <!-- Symbol -->
            <div v-if="item.upgraded" class="symbol upg">
              <img :src="item.upgrade.symbol_image" :alt="item.upgrade.symbol_name" />
            </div>
            <div v-else class="symbol no-upg">
              <img src="/gift_bg.png" alt="gift_bg" />
            </div>

            <!-- Model -->
            <div class="model">
              <div v-if="item.upgraded && item.upgrade" class="upg">
                <div v-if="item.gift_media === 'svg'" class="image">
                  <img :src="item.upgrade.nft_image" alt="" />
                </div>
                <div v-else-if="item.gift_media === 'lottie'" class="image">
                  <img :src="getUpgradedModel(item.gift_ukey, item.upgrade.nft_name, 'svg')" alt="" />
                </div>
                <div v-else class="image">
                  <img :src="item.upgrade.nft_image || getUpgradedModel(item.gift_ukey, item.upgrade.nft_name, 'svg')" alt="" />
                </div>
              </div>
              <div v-else class="no-upg">
                <div class="image">
                  <img :src="item.gift_image || storeCache.NftsAppData?.[item.gift_ukey]?.ImageMain" alt="" />
                </div>
              </div>
            </div>

            <!-- Price -->
            <div class="button">
              <button v-if="!item.market">
                <h5>{{ item.purchase_price }}</h5>
                <img :src="StarsImg" alt="stars" />
              </button>
              <button v-else>
                <h5>{{ cutNumber(item.market.price_ton) }}</h5>
                <img :src="TonImg" alt="ton" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && GiftsList.length === 0" class="pd-create__empty">
      <p>{{ $t('privateDeal.notfoundText') }}</p>
    </div>

    <!-- Bottom fixed buttons -->
    <div class="pd-create__bottom">
      <button
        v-if="canCreate"
        class="pd-create__btn pd-create__btn--active"
        :class="{ loading: creating }"
        @click="handleCreate"
        :disabled="creating"
      >
        <img :src="Image_TonWhite" alt="TON" />
        <span>{{ $t('privateDeal.create') }} {{ selectedIds.length }} {{ $t('privateDeal.createGift') }} {{ priceStr }} TON</span>
      </button>
      <button v-else-if="selectedIds.length > 0 && !priceNum" class="pd-create__btn pd-create__btn--off" disabled>
        {{ $t('privateDeal.enterPrice') }}
      </button>
      <button v-else class="pd-create__btn pd-create__btn--off" disabled>
        {{ $t('privateDeal.chooseNumberGifts') }}
      </button>
    </div>
  </div>
</template>

<script>
import * as nftApi from '../../api/nftApi';
import { tonToNano } from '../../api/privateDealApi';
import { checkRarity, checkRarityImage, getUpgradedModel } from '../../utils/useGift';
import { cutNumber } from '../../utils/useTon';

import Image_Ton from '@/assets/images/market/ton.svg';
import Image_TonWhite from '@/assets/images/market/ton-white.svg';
import StarsImg from '@/assets/images/profile/stars.png';
import TonImg from '@/assets/images/market/ton.svg';
import StoreImg from '@/assets/images/market/store.svg';

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
      giftsCount: 0,
      selectedIds: [],
      priceStr: '',
      Image_Ton,
      Image_TonWhite,
      StarsImg,
      TonImg,
      StoreImg,
      checkRarity,
      checkRarityImage,
      getUpgradedModel,
      cutNumber,
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
  },

  mounted() {
    this.loadGifts();
    this.$watch(
      () => this.storeCache.TelegramData,
      () => this.loadGifts(),
    );
  },

  methods: {
    onPriceInput(e) {
      let val = e.target.value.replace(/[^0-9.]/g, '');
      const parts = val.split('.');
      if (parts.length > 2) {
        val = parts[0] + '.' + parts.slice(1).join('');
      }
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
    },

    async loadGifts() {
      const userId = this.storeCache.TelegramData?.user?.id;
      if (!userId) return;

      this.loading = true;
      try {
        const result = await nftApi.getGifts(
          this.activeTab, '', '', '', '', '', 0, 50
        );
        if (result && result.items) {
          this.GiftsList = result.items;
          this.giftsCount = result.count || result.items.length;
        } else {
          this.GiftsList = [];
          this.giftsCount = 0;
        }
      } catch {
        this.GiftsList = [];
        this.giftsCount = 0;
      } finally {
        this.loading = false;
      }
    },

    toggleGift(item) {
      const idx = this.selectedIds.indexOf(item.uuid);
      if (idx >= 0) {
        this.selectedIds.splice(idx, 1);
      } else {
        this.selectedIds.push(item.uuid);
      }
    },

    handleCreate() {
      if (!this.canCreate || this.creating) return;
      this.creating = true;

      const gifts = this.GiftsList
        .filter(g => this.selectedIds.includes(g.uuid))
        .map(g => {
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
            bg_center: isUpgraded ? (g.upgrade?.background_colors_center || '') : '',
            bg_around: isUpgraded ? (g.upgrade?.background_colors_around || '') : '',
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
