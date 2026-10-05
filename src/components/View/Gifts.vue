<template>
  <div class="prf-gifts">
    <!-- Табы: подарки / NFT — тот же стеклянный сегмент, что в своём профиле -->
    <div class="_direction _comp _item prf-tabs">
      <div class="prf-tabs__pill" :class="{ 'is-wallet': ActiveTab === 'wallet' }">
        <div class="prf-tabs__indicator"></div>
        <button
          type="button"
          class="prf-tabs__tab"
          :class="{ active: ActiveTab === 'all' }"
          @click="$emit('useTab', 'all')"
        >
          <span>{{ $t('profile.profileTabs.all') }}</span>
        </button>
        <button
          type="button"
          class="prf-tabs__tab"
          :class="{ active: ActiveTab === 'wallet' }"
          @click="$emit('useTab', 'wallet')"
        >
          <span>{{ $t('profile.profileTabs.wallet') }}</span>
          <div class="kit-icon" v-html="Icon.MintChain"></div>
        </button>
      </div>
    </div>

    <div class="_direction _comp _item _filter">
      <div v-if="isLoading" class="_skeleton"></div>
      <div v-else class="_content">
        <div class="cont">
          <div class="filtersItems">
            <div class="filtersItemsItem" @click="openSortModal">
              <div class="circle" v-if="hasSort"></div>
              <div class="flexer">
                <div class="title">{{ $t('profile.profileFilters.sort') }}</div>
                <div class="border"></div>
                <div class="icon">
                  <div class="kit-icon" v-html="Icon.Sort"></div>
                </div>
              </div>
            </div>
            <div class="filtersItemsItem" @click="openModelModal">
              <div class="circle" v-if="hasModels"></div>
              <div class="flexer">
                <div class="title">{{ $t('profile.profileFilters.collection') }}</div>
                <div class="border"></div>
                <div class="icon">
                  <div class="kit-icon" v-html="Icon.Blocks"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="information">
          <div class="gifts">
            <h5>
              {{ GiftsCount }}
              {{ pluralizeGift($t('profile.profileFilters.gifts'), GiftsCount, storeCache.TelegramData.user.language || 'en') }}
            </h5>
          </div>
          <div class="righted">
            <div v-if="tabViewNFTs === 'blocks'" class="display" @click="setTabViewNFTs('lists')">
              <div class="kit-icon" v-html="Icon.List"></div>
            </div>
            <div v-if="tabViewNFTs === 'lists'" class="display" @click="setTabViewNFTs('blocks')">
              <div class="kit-icon" v-html="Icon.Blocks"></div>
            </div>
          </div>
        </div>

        <div v-if="!isEmptyFilter" class="cheaps">
          <div class="cheap clear" @click="clearAll">
            <h4>{{ $t('profile.clearAll') }}</h4>
            <div class="kit-icon" v-html="Icon.Close"></div>
          </div>
          <div v-if="hasModels" class="cheap model" @click="clearModels">
            <div class="kit-icon" v-html="Icon.Blocks"></div>
            <h4>{{ modelsCount === 1 ? `Model: ${SelectedModels[0]}` : `${modelsCount} Models` }}</h4>
            <div class="kit-icon" v-html="Icon.Close"></div>
          </div>
          <div v-if="hasSort" class="cheap sort" @click="clearSort">
            <div class="kit-icon" v-html="Icon.Sort"></div>
            <h4>{{ sortTitle }}</h4>
            <div class="kit-icon" v-html="Icon.Close"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="_direction _comp _item _nfts">
      <!-- скелетон держим и пока идёт загрузка списка: раньше здесь
           мелькало «подарков нет», потому что пустой список неотличим
           от незагруженного -->
      <div v-if="isLoading || isLoadingGifts" class="_skeleton">
        <div class="item" v-for="i in 9" :key="'gs-' + i"></div>
      </div>
      <div v-if="!isLoading && !isLoadingGifts" class="_content">
        <div v-if="tabViewNFTs === 'blocks'" :key="'blocks-' + ActiveTab" class="items blocks">
          <div
            v-for="(item, index) in GiftsList"
            :key="item.uuid"
            class="item _gift"
            :class="{ 'is-upgraded': !!item.upgraded, 'is-market': !!item.market }"
            :style="giftCardStyle(item)"
            @click="useModal(item.uuid)"
          >
            <div class="_symbols">
              <img v-if="item.upgraded && item.upgrade?.symbol_image" :src="item.upgrade.symbol_image" alt="" />
              <img v-else src="/gift_bg.png" alt="" />
            </div>

            <div v-if="item.upgraded && item.upgrade?.seq != null" class="_badge _badge--num">
              <span>#{{ item.upgrade.seq }}</span>
            </div>

            <div class="_nft">
              <img
                v-if="item.upgraded && item.gift_media === 'svg'"
                :src="item.upgrade.nft_image"
                alt=""
              />
              <img
                v-else-if="item.upgraded"
                :src="getUpgradedModel(item.gift_ukey, item.upgrade.nft_name?.name || item.upgrade.nft_name, 'svg')"
                alt=""
              />
              <img v-else :src="item.gift_image" alt="" />
            </div>

            <!-- заминчен в кошелёк: та же лента-маска, TON-синим -->
            <div v-if="isMintedItem(item)" class="_rarity _rarity--sale _rarity--mint">
              <div class="_image"></div>
              <div class="_text">
                <span>{{ (item.mint?.status === 'processing' || item.status === 'mint_locked') ? $t('profile.profileMintFlow.tickerMinting') : $t('profile.profileMintFlow.ribbon') }}</span>
              </div>
            </div>

            <div v-else-if="!item.upgraded && giftRarity(item)" class="_rarity">
              <div class="_image">
                <img :src="checkRarityImage(giftRarity(item))" alt="" />
              </div>
              <div class="_text">
                <span>{{ checkRarity(giftRarity(item)) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="tabViewNFTs === 'lists'" :key="'lists-' + ActiveTab" class="items lists">
          <div
            v-for="(item, index) in GiftsList"
            :key="item.uuid"
            @click="useModal(item.uuid)"
            class="item"
          >
            <div class="nft">
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

              <div v-if="item.upgraded" class="symbol upg">
                <img :src="item.upgrade.symbol_image" :alt="item.upgrade.symbol_name" />
              </div>
              <div v-else class="symbol no-upg">
                <img src="/gift_bg.png" alt="gift_bg" />
              </div>

              <div class="model">
                <div v-if="item.upgraded" class="upg">
                  <div v-if="item.gift_media === 'svg'" class="image">
                    <img :src="item.upgrade.nft_image" alt="model" />
                  </div>
                  <div v-if="item.gift_media === 'lottie'" class="image">
                    <img :src="getUpgradedModel(item.gift_ukey, item.upgrade.nft_name, 'svg')" alt="model" />
                  </div>
                </div>
                <div v-else class="no-upg">
                  <div class="image">
                    <img :src="item.gift_image" alt="model" />
                  </div>
                </div>
              </div>
            </div>
            <div class="content">
              <div class="naming">
                <h4>{{ item.gift_name }}</h4>
                <p v-if="item.upgraded">#{{ item.upgrade.seq }}</p>
              </div>
              <div class="info">
                <div v-if="isMintedItem(item)" class="mint-on">
                  <div class="kit-icon" v-html="Icon.MintChain"></div>
                  <p>{{ $t('profile.profileMintFlow.ribbon') }}</p>
                </div>
                <div v-if="!item.market && !isMintedItem(item)" class="price">
                  <p>{{ item.purchase_price }}</p>
                  <img :src="StarsImg" alt="stars" />
                </div>
                <div v-if="item.market" class="market-on">
                  <div class="price">
                    <p>{{ cutNumber(item.market.price_ton) }}</p>
                    <div class="kit-icon gram" v-html="Icon.Gram"></div>
                  </div>
                  <div class="marker">
                    <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                      <path d="M8.95 3.662L8.189 1.727C8.076 1.44 8.02 1.297 7.929 1.191C7.849 1.098 7.75 1.027 7.64.983C7.515.934 7.372.934 7.086.934H1.915C1.628.934 1.485.934 1.36.983C1.25 1.027 1.151 1.098 1.071 1.191C0.98 1.297 0.924 1.44.811 1.727L.05 3.662H8.95Z" fill="#98989D"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M.747 6.056C.952 6.138 1.173 6.182 1.404 6.182 1.784 6.182 2.139 6.061 2.436 5.852 2.733 6.061 3.088 6.182 3.468 6.182 3.848 6.182 4.203 6.061 4.5 5.852 4.797 6.061 5.152 6.182 5.532 6.182 5.912 6.182 6.267 6.061 6.564 5.852 6.861 6.061 7.216 6.182 7.596 6.182 7.827 6.182 8.048 6.138 8.253 6.056V8.625 8.252 9.083 8.252 9.312 8.252 9.486 8.171 9.641 8.099 9.766 7.985 9.844 7.843 9.934 7.682 9.934 7.472 9.934 1.948 9.934 1.528 9.934 1.318 9.934 1.157 9.844 1.016 9.766.901 9.641.829 9.486.747 9.312.747 9.083.747 8.625V6.056zm1.751 1.669c0 .23 0 .35.051.457.033.076.091.153.167.2.079.05.192.05.411.05h1.426c.23 0 .349 0 .406-.05.076-.033.153-.091.2-.167.05-.079.05-.192.05-.411v-.78c0-.23 0-.35-.051-.457-.033-.076-.091-.153-.167-.2-.079-.05-.192-.05-.411-.05h-1.426c-.23 0-.349 0-.406.05-.076.033-.153.091-.2.167-.05.079-.05.192-.05.411v.78zm-1.51 1.724c0 .28 0 .4.051.492.033.063.091.12.167.157.079.05.192.05.411.05h1.426c.23 0 .349 0 .406-.05.076-.033.153-.091.2-.167.05-.079.05-.192.05-.411v-.78c0-.23 0-.35-.051-.457-.033-.076-.091-.153-.167-.2-.079-.05-.192-.05-.411-.05h-1.426c-.23 0-.349 0-.406.05-.076.033-.153.091-.2.167-.05.079-.05.192-.05.411v.78zM1.404 5.638C.658 5.638.048 5.006 0 4.206h9c.051.977.658 1.75 1.404 1.75.808 0 1.177-.201 1.436-.502.259.301.627.49 1.036.49.808 0 1.177-.201 1.436-.502.259.301.627.49 1.036.49.808 0 1.177-.201 1.436-.502.259.301.627.49 1.036.49.808 0 1.177-.201 1.404-.502v.93c0 .56 0 .79-.051.903-.033.076-.091.153-.167.2-.079.05-.192.05-.411.05H1.948c-.524 0-.735 0-.891-.05-.076-.033-.153-.091-.2-.167-.05-.079-.05-.192-.05-.411V5.638zM1.404 5.638" fill="#98989D"/>
                    </svg>
                    <p>{{ $t('profile.market') }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="dropdown">
              <div class="kit-icon" v-html="Icon.ChevroneRight"></div>
            </div>
          </div>
        </div>

        <div v-if="hasMore" ref="sentinel" class="_sentinel"></div>
        <div v-if="Searching" class="_bottomLoader">
          <div class="load-icon"></div>
        </div>
      </div>
    </div>

    <div
      v-if="!Searching && isEmptyList && !isLoading && !isLoadingGifts"
      class="_direction _comp _item _empty"
    >
      <div class="null">
        <div class="image">
          <img :src="ProfileEmptyImg" alt="empty" />
        </div>
        <div class="title">
          <h4>{{ $t('profile.profileGiftsNull') }}</h4>
        </div>
        <div class="description">
          <p>{{ $t('profile.profileGiftsNullButtonAsking') }}</p>
          <span @click="openStore">
            <div class="kit-icon" v-html="Icon.Store"></div>
            <p>Market</p>
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="Searching"
      class="_direction _comp _item _loads"
    >
      <div class="null">
        <div class="load-icon"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { checkRarity, checkRariryNumber, pluralizeGift, getUpgradedModel, getUpgradedSymbol, clearBackgroundName } from '../../utils/useGift';
import { getConfig } from '../../config';
import { ref, watch, onMounted } from 'vue';
import { checkRarityImage } from '../../utils/useGift';
import { Icon } from '../Icon';
import { getImageUrl, getUserLanguage, splitCamelCase } from '../../utils/useApp';
import { cutNumber } from '../../utils/useTon';

import TelegramModule from '../../hooks/useTelegram';
import * as nftApi from '../../api/nftApi';
import * as telegramApi from '../../api/telegramApi';

import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';
import Image_RarirySended from '@/assets/images/sended.svg';
import Image_Ticket from '@/assets/images/ticket.svg';
import Image_Stars from '@/assets/images/stars.png';

import Lottie from '../Lottie.vue';
import Button from '../Button.vue';
import GiftLottie from '../GiftLottie.vue';

import StoreImg from '@/assets/images/market/store.svg';
import TonImg from '@/assets/images/market/ton.svg';
import StarsImg from '@/assets/images/profile/stars.png';
import ProfileEmptyImg from '@/assets/images/profile/empty.svg';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    GiftsList: { type: Array, required: true },
    GiftsCount: { type: Number, required: true },
    GiftsLoading: { type: Boolean, required: true },
    SelectedModels: { type: Array, required: true },
    SelectedSort: { type: String, required: true },
    SortItems: { type: Object, required: true },
    Searching: { type: Boolean, required: true },
    ActiveTab: { type: String, default: 'all' },
  },
  components: { Lottie, GiftLottie, Button },
  data() {
    return {
      TonImg, StarsImg, StoreImg, ProfileEmptyImg,
      configApp: getConfig(),
      storeCache: useCacheStore(),
      storeNftsApp: {},
      isLoading: this.Skeleton,
      isLoadingGifts: this.GiftsLoading,
      activeGift: null,
      tabViewNFTs: 'blocks',
      observer: null,
      checkRarity, checkRariryNumber, checkRarityImage,
      getImageUrl, splitCamelCase, pluralizeGift,
      getUpgradedModel, getUpgradedSymbol, clearBackgroundName,
      cutNumber, Icon,
      Image_GiftBg, Image_RarirySended, Image_Ticket, Image_Stars,
    };
  },
  mounted() {
    this.loadResources();
    this.storeNftsApp = this.storeCache.NftsAppData;
    this.$watch(() => this.storeCache.NftsAppData, () => {
      this.storeNftsApp = this.storeCache.NftsAppData;
    });
    this.$nextTick(() => {
      const items = this.$el.querySelectorAll('._gifts');
      items.forEach(el => el.style.setProperty('--max-height', el.scrollHeight + 'px'));
      this.initObserver();
    });
  },
  onBeforeUnmount() { this.destroyObserver(); },
  computed: {
    isLoading() { return this.Skeleton; },
    isLoadingGifts() { return this.GiftsLoading; },
    isEmptyList() { return !this.GiftsList || this.GiftsList.length === 0; },
    modelsCount() { return this.SelectedModels?.length ?? 0; },
    hasModels() { return this.modelsCount > 0; },
    hasSort() { return !!this.SelectedSort && !!this.SortItems?.[this.SelectedSort]; },
    sortTitle() {
      return this.hasSort ? this.$t(`profile.profileFilterModal.items.${this.SelectedSort}`) : '';
    },
    isEmptyFilter() { return !(this.hasModels || this.hasSort); },
    hasMore() { return (this.GiftsList?.length || 0) < (this.GiftsCount || 0); },
  },
  watch: {
    GiftsList() { this.$nextTick(() => this.resetObserver()); },
  },
  methods: {
    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadImages()]);
        this.isLoading = false;
        this.$emit('loadSuccess');
      } catch (e) { console.error(e); }
    },
    loadFonts() { return document.fonts.ready; },
    loadImages() {
      const giftsImages = (Array.isArray(this.storeCache?.NftsApp) ? this.storeCache?.NftsApp : Object.values(this.storeCache?.NftsApp || {})).map((gift) => {
        return new Promise((resolve, reject) => {
          const img = new Image(); img.src = gift.ImageArticle; img.onload = resolve; img.onerror = reject;
        });
      });
      const staticImages = [Image_GiftBg].map((src) => new Promise((resolve, reject) => {
        const img = new Image(); img.src = src; img.onload = resolve; img.onerror = reject;
      }));
      return Promise.all([...giftsImages, ...staticImages]);
    },
    openStore() { this.$router.push('/m'); },
    initObserver() {
      if (this.observer) return;
      const sentinel = this.$refs.sentinel;
      if (!sentinel) return;
      this.observer = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (this.Searching || !this.hasMore) return;
        this.requestMore();
      }, { root: null, rootMargin: '300px 0px 300px 0px', threshold: 0.01 });
      this.observer.observe(sentinel);
    },
    destroyObserver() { if (this.observer) { this.observer.disconnect(); this.observer = null; } },
    resetObserver() { this.destroyObserver(); this.initObserver(); },
    requestMore() {
      this.$emit('loadMore', {
        sort: this.SelectedSort,
        models: this.SelectedModels,
        offset: this.GiftsList.length,
        limit: 20,
      });
    },
    useModal(NftId) {
      TelegramModule.useSoftHaptic();
      this.$emit('useModal', { id: NftId });
    },
    // подарок уже в блокчейне (или минтится прямо сейчас)
    isMintedItem(item) {
      return item?.mint?.status === 'success' || item?.status === 'minted'
        || item?.mint?.status === 'processing' || item?.status === 'mint_locked';
    },
    setTabViewNFTs(tab) { this.tabViewNFTs = (tab === 'lists') ? 'lists' : 'blocks'; },
    openModelModal() { this.$emit('openModelModal'); },
    openSortModal() { this.$emit('openSortModal'); },
    clearAll() { this.$emit('clearAll'); },
    clearModels() { this.$emit('clearModels'); },
    clearSort() { this.$emit('clearSort'); },
    giftCatalog(item) {
      const data = this.storeCache?.NftsAppData;
      if (!data || !item) return null;
      const key = item.gift_ukey || item.nft_unique_key || item.u_key;
      if (key && data[key]) return data[key];
      const list = Array.isArray(data) ? data : Object.values(data || {});
      return list.find((g) => g?.UKey === key || g?.u_key === key || g?.Key === key || g?.key === key) || null;
    },
    giftRarity(item) {
      const cat = this.giftCatalog(item);
      let raw = cat?.Rarity || cat?.rarity || item?.gift_rarity || item?.rarity || '';
      raw = String(raw).toLowerCase().replace(/[\s_-]+/g, '');
      if (raw === 'legendary') return 'legend';
      if (raw === 'veryrare' || raw === 'veryrarity') return 'veryrare';
      return raw;
    },
    boostColor(hex, amount = 0.22) {
      try {
        let h = String(hex || '').replace('#', '').trim();
        if (h.length === 3) h = h.split('').map((c) => c + c).join('');
        if (h.length !== 6) return hex || '#666';
        const n = parseInt(h, 16);
        let r = Math.min(255, Math.round(((n >> 16) & 255) + (255 - ((n >> 16) & 255)) * amount));
        let g = Math.min(255, Math.round(((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * amount));
        let b = Math.min(255, Math.round((n & 255) + (255 - (n & 255)) * amount));
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      } catch { return hex || '#666'; }
    },
    giftCardStyle(item) {
      if (item.upgraded && item.upgrade) {
        const c = item.upgrade.background_colors_center || item.upgrade.background?.colors_center || '#666';
        const a = item.upgrade.background_colors_around || item.upgrade.background?.colors_around || '#1a1a1a';
        const hot = this.boostColor(c, 0.28);
        return { background: `radial-gradient(circle at 50% 40%, ${hot} 0%, ${c} 45%, ${a} 100%)`, boxShadow: 'none' };
      }
      const r = this.giftRarity(item);
      const map = {
        rare: 'linear-gradient(180deg, #282867 0%, #131328 100%)',
        veryrare: 'linear-gradient(180deg, #1D6132 0%, #0B2211 100%)',
        epic: 'linear-gradient(180deg, #632475 0%, #19101D 100%)',
        legend: 'linear-gradient(180deg, #6F480E 0%, #1D1710 100%)',
        author: 'linear-gradient(180deg, #762121 0%, #221111 100%)',
      };
      return { background: map[r] || '#252028' };
    },
  }
};
</script>

<style lang="sass" scoped>
._filter .filtersItemsItem
    flex: 0 0 auto
    width: fit-content
    min-width: fit-content
    max-width: fit-content
</style>

<style lang="sass" scoped>
._filter .filtersItemsItem
    flex: 0 0 auto
    width: fit-content
    min-width: fit-content
    max-width: fit-content
</style>
