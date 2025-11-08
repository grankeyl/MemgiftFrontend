<template>
  <div class="_direction _comp _item _categoriesSelected">
      <div v-if="isLoading" class="_skeleton">
        <div class="_category"></div>
        <div class="_category"></div>
      </div>
      <div v-if="!isLoading" class="_content">
        <div 
          v-for="(category, index) in CategoriesList" 
          @click="setActiveTab(category.Key)"
          :key="index" 
          class="_category" 
          :class="{ _active: activeCategory === category.Key }"
        >
          <h4>{{ category.Title }}</h4>
        </div>
      </div>
  </div>

  <div class="_direction _comp _item _filter">
      <div v-if="isLoading" class="_skeleton">
      </div>
      <div v-if="!isLoading" class="_content">
        <div class="cont">
          <div class="lefted">
            <div class="item" @click="openSortModal">
              <div v-if="hasSort" class="circle"></div>
              <div class="flexer">
                <div class="icon">
                  <div class="kit-icon" v-html="Icon.Sort"></div>
                </div>
                <div class="title">
                  {{ $t('profile.profileFilters.sort') }}
                </div>
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <div class="item" @click="openModelModal">
              <div v-if="hasModels" class="circle"></div>
              <div class="flexer">
                <div class="icon">
                  <div class="kit-icon" v-html="Icon.Blocks"></div>
                </div>
                <div class="title">
                  {{ $t('profile.profileFilters.collection') }}
                </div>
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="information">
          <div class="gifts">
            <h5>
              {{ GiftsCount }}
              {{ pluralizeGift(
                $t('profile.profileFilters.gifts'),
                GiftsCount,
                storeCache.TelegramData.user.language
              ) }}
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
            <div class="kit-icon" v-html="Icon.Gift"></div>
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
    <div v-if="isLoading" class="_skeleton">
    </div>
    <div v-if="!isLoading" class="_content">
      <div v-if="tabViewNFTs === 'blocks'" class="items blocks">
        <div 
          v-for="(item, index) in GiftsList"
          :key="index" 
          @click="useModal(item.uuid)"
          class="item"
        >
          <div v-if="item.upgraded && !item.market" class="mark">
            <p>#{{ item.upgrade.seq }}</p>
          </div>
          <div v-if="item.upgraded && item.market" class="mark">
            <img :src="StoreImg" alt="store" />
            <p>{{ $t('profile.market') }}</p>
          </div>
          <div v-if="!item.upgraded && !item.market" class="rarity">
            <div class="image">
              <img 
                :src="checkRarityImage(storeCache.NftsAppData?.[item.gift_ukey]?.Rarity)" 
                alt="rarity" 
              />
            </div>
            <div class="span">
              <p>{{ checkRarity(storeCache.NftsAppData[item.gift_ukey]?.Rarity) }}</p>
            </div>
          </div>

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
          <div class="button">
            <button v-if="!item.market">
              <h5>{{ item.purchase_price }}</h5>
              <img :src="StarsImg" alt="stars" />
            </button>
            <button v-if="item.market">
              <h5>{{ cutNumber(item.market.price_ton) }}</h5>
              <img :src="TonImg" alt="svg" />
            </button>
          </div>
        </div>
      </div>
      <div v-if="tabViewNFTs === 'lists'" class="items lists">
        <div
          v-for="(item, index) in GiftsList"
          :key="index"
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
              <div v-if="!item.market" class="price">
                <p>{{ item.purchase_price }}</p>
                <img :src="StarsImg" alt="stars" />
              </div>
              <div v-if="item.market" class="market-on">
                <div class="price">
                  <p>{{ cutNumber(item.market.price_ton) }}</p>
                  <img :src="TonImg" alt="svg" />
                </div>
                <div class="marker">
                  <svg width="9" height="10" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.95003 3.66223L8.18925 1.72701C8.07645 1.44008 8.02004 1.2966 7.9292 1.19129C7.84891 1.09821 7.74974 1.02692 7.63964 0.983134C7.51506 0.933594 7.37188 0.933594 7.08552 0.933594H1.91454C1.62818 0.933594 1.485 0.933594 1.36042 0.983134C1.25031 1.02692 1.15114 1.09821 1.07085 1.19129C0.980011 1.2966 0.92361 1.44007 0.810807 1.72701L0.050022 3.66223H8.95003Z" fill="#98989D"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.747463 6.05565C0.952178 6.13754 1.17337 6.18223 1.40416 6.18223C1.78431 6.18223 2.13877 6.06058 2.43611 5.85158C2.73346 6.06058 3.08791 6.18223 3.46807 6.18223C3.84822 6.18223 4.20268 6.06058 4.50002 5.85158C4.79737 6.06058 5.15182 6.18223 5.53198 6.18223C5.91214 6.18223 6.26659 6.06058 6.56393 5.85158C6.86128 6.06058 7.21573 6.18223 7.59589 6.18223C7.82668 6.18223 8.04787 6.13754 8.25259 6.05565V8.6245C8.25259 9.08273 8.25259 9.31184 8.17079 9.48686C8.09884 9.64081 7.98402 9.76598 7.84281 9.84442C7.68226 9.93359 7.4721 9.93359 7.05177 9.93359H1.94828C1.52796 9.93359 1.31779 9.93359 1.15725 9.84442C1.01603 9.76598 0.901218 9.64081 0.829264 9.48686C0.747463 9.31184 0.747463 9.08273 0.747463 8.6245V6.05565ZM1.49796 7.7245C1.49796 7.49539 1.49796 7.38083 1.53886 7.29332C1.57483 7.21635 1.63224 7.15377 1.70285 7.11455C1.78312 7.06996 1.8882 7.06996 2.09837 7.06996H3.52434C3.73451 7.06996 3.83959 7.06996 3.91986 7.11455C3.99047 7.15377 4.04787 7.21635 4.08385 7.29332C4.12475 7.38083 4.12475 7.49539 4.12475 7.7245V8.46087C4.12475 8.68998 4.12475 8.80453 4.08385 8.89204C4.04787 8.96902 3.99047 9.0316 3.91986 9.07082C3.83959 9.11541 3.73451 9.11541 3.52434 9.11541H2.09837C1.8882 9.11541 1.78312 9.11541 1.70285 9.07082C1.63224 9.0316 1.57483 8.96902 1.53886 8.89204C1.49796 8.80453 1.49796 8.68998 1.49796 8.46087V7.7245Z" fill="#98989D"/>
                    <path d="M1.40413 5.63814C0.658477 5.63814 0.0482754 5.00589 0 4.20632H9C8.95172 5.00589 8.34152 5.63814 7.59587 5.63814C7.18814 5.63814 6.82091 5.4491 6.56391 5.14704C6.30691 5.4491 5.93968 5.63814 5.53196 5.63814C5.12423 5.63814 4.757 5.4491 4.5 5.14704C4.243 5.4491 3.87577 5.63814 3.46804 5.63814C3.06032 5.63814 2.69309 5.4491 2.43609 5.14704C2.17909 5.4491 1.81186 5.63814 1.40413 5.63814Z" fill="#98989D"/>
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
    v-if="!Searching && isEmptyList"
    class="_direction _comp _item _empty"
  >
    <div class="null">
      <div class="image">
        <img src="/profile/empty.svg" alt="empty" />
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

// Images
import StoreImg from '@/assets/images/market/store.svg';
import TonImg from '@/assets/images/market/ton.svg';
import StarsImg from '@/assets/images/profile/stars.png';
import ProfileEmptyImg from '@/assets/images/profile/empty.svg';

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
    CategoriesList: {
      type: Array,
      required: true,
    },
    GiftsList: {
      type: Array,
      required: true,
    },
    GiftsCount: {
      type: Number,
      required: true,
    },
    GiftsLoading: {
      type: Boolean,
      required: true,
    },
    ActiveTab: {
      type: String,
      required: true,
    },
    SelectedModels: {
      type: Array,
      required: true,
    },
    SelectedSort: {
      type: String,
      required: true,
    },
    SortItems: {
      type: Object,
      required: true,
    },
    Searching: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    Lottie,
    GiftLottie,
    Button,
  },

  data() {
    return {
      TonImg,
      StarsImg,
      StoreImg,
      ProfileEmptyImg,

      configApp: getConfig(),
      storeCache: useCacheStore(),
      storeNftsApp: {},

      isLoading: this.$props.Skeleton,
      isLoadingGifts: this.$props.GiftsLoading,

      activeReceivedTab: true,
      activePurchasedTab: false,

      activeCategory: this.$props.ActiveTab,
      activeGift: null,

      tabViewNFTs: "blocks",
      observer: null,

      checkRarity,
      checkRariryNumber,
      checkRarityImage,
      getImageUrl,
      splitCamelCase,
      pluralizeGift,
      getUpgradedModel,
      getUpgradedSymbol,
      clearBackgroundName,
      cutNumber,
      
      Icon,
      Image_GiftBg,
      Image_RarirySended,
      Image_Ticket,
      Image_Stars,
    };
  },

  mounted() {
    this.loadResources();
    this.storeNftsApp = this.storeCache.NftsAppData;

    this.$watch(() => this.storeCache.NftsAppData, () => {
      this.storeNftsApp = this.storeCache.NftsAppData;
    });

    this.setActiveCategoryFromHash();
    this.$nextTick(() => {
      const items = this.$el.querySelectorAll('._gifts');
      items.forEach(el => {
        el.style.setProperty('--max-height', el.scrollHeight + 'px');
      });
      this.initObserver();
    });
  },

  onBeforeUnmount() {
    this.destroyObserver();
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
    isLoadingGifts() {
      return this.GiftsLoading;
    },
    isEmptyList() {
       return !this.GiftsList || this.GiftsList.length === 0;
    },
    modelsCount() {
      return this.SelectedModels?.length ?? 0 
    },
    hasModels() {
      return this.modelsCount > 0 
    },
    hasSort() {
      return !!this.SelectedSort && !!this.SortItems?.[this.SelectedSort] 
    },
    sortTitle() {
      if (this.hasSort) {
        return this.$t(`profile.profileFilterModal.items.${this.SelectedSort}`)
      } else {
        return ''
      }
    },
    isEmptyFilter() {
      return !(this.hasModels || this.hasSort) 
    },
    hasMore() {
      return (this.GiftsList?.length || 0) < (this.GiftsCount || 0);
    },
  },

  watch: {
    ActiveTab() {
      this.activeCategory = this.ActiveTab;
      this.$nextTick(() => this.resetObserver());
    },
    GiftsList(newValue) {
      if (!this.GiftsList || this.GiftsList.length === 0) return;
      this.GiftsList.splice(0, this.GiftsList.length, ...newValue);
      this.$nextTick(() => this.resetObserver());
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
          img.src = gift.ImageArticle;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      const staticImages = [
        Image_GiftBg
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

    setActiveCategoryFromHash() {
      if (this.$route.hash) {
        const hash = this.$route.hash.replace('#', '');
        if (hash !== 'received' && hash !== 'purchased') {
          this.activeCategory = 'received';
          this.$emit('useTab', 'received');
          return;
        }
        this.activeCategory = this.$route.hash.replace('#', '') || 'received';
        this.$emit('useTab', this.$route.hash.replace('#', '') || 'received');
      }

      watch(() => this.$route.hash, (newHash) => {
        const hash = newHash.replace('#', '');
        if (hash !== 'received' && hash !== 'purchased') {
          this.activeCategory = 'received';
          this.$emit('useTab', 'received');
          return;
        }
        this.activeCategory = newHash.replace('#', '') || 'received';
        this.$emit('useTab', newHash.replace('#', '') || 'received');
      });
    },

    setActiveTab(arg) {
      if (arg === this.activeCategory) return;
      
      this.activeCategory = arg;
      this.$emit('useTab', arg);
    },

    setActiveTabAccordion(arg) {
      if (arg === 'received') this.activeReceivedTab = !this.activeReceivedTab;
      if (arg === 'purchased') this.activePurchasedTab = !this.activePurchasedTab;
    },

    openStore() {
      this.$router.push('/');
    },

    openMulticheck() {
      this.$router.push('/multicheck');
    },

    openGifts(nft) {
      this.$router.push(`/profile/gifts/${nft}`);
    },

    appLanguage() {
      return this.storeCache.TelegramData.user.language || getUserLanguage();
    },

    async sendNft(giftId, giftUniqueKey, giftUuid) {
      if (!giftId) return;
      this.activeGift = giftId;

      TelegramModule.useMediumHaptic();

      const preparedMessage = await telegramApi.createPrepareMessage(
        this.storeCache.TelegramData.user.id,
        giftUniqueKey,
        giftUuid,
        this.appLanguage()
      );
      if (!preparedMessage) return;

      const giftToUpdate = this.GiftsPurchasedList.find(gift => gift.id === giftId);
      if (!giftToUpdate) return;

      TelegramModule.useShareMessage(preparedMessage.id)
        .then(async (sharedMessage) => {
          await nftApi.updateStatusSended(this.storeCache.TelegramData.user.id, giftToUpdate.id);

          this.activeGift = null;

          if (giftToUpdate.status !== 'sended') {
            this.storeCache.UserData.sendedGiftsCount += 1;
          }
           
          giftToUpdate.status = 'sended';
        })
        .catch(() => {
          this.activeGift = null;
        });
    },

    initObserver() {
      if (this.observer) return;
      const sentinel = this.$refs.sentinel;
      if (!sentinel) return;

      this.observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (!entry?.isIntersecting) return;
          if (this.Searching) return;      // уже грузим — выходим
          if (!this.hasMore) return;       // всё загрузили — выходим
          this.requestMore();               // просим родителя догрузить
        },
        { root: null, rootMargin: '300px 0px 300px 0px', threshold: 0.01 }
      );

      this.observer.observe(sentinel);
    },

    destroyObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },

    resetObserver() {
      this.destroyObserver();
      this.initObserver();
    },

    requestMore() {
      // Родитель должен добавить следующую порцию в GiftsList и обновить GiftsCount
      this.$emit('loadMore', {
        tab: this.activeCategory,
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

    setTabViewNFTs(tab) {
      this.tabViewNFTs = (tab === 'lists') ? 'lists' : 'blocks';
    },

    openModelModal() {
      this.$emit('openModelModal');
    },

    openSortModal() {
      this.$emit('openSortModal');
    },

    clearAll() {
      this.$emit('clearAll');
    },

    clearModels() {
      this.$emit('clearModels');
    },

    clearSort() {
      this.$emit('clearSort');
    },

    openStore() {
      this.$router.push('/m');
    },
  },
};
</script>