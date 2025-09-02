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
            <div class="item" @click="openModelModal">
              <div v-if="hasModels" class="circle"></div>
              <div class="icon">
                <div class="kit-icon" v-html="Icon.Gift"></div>
              </div>
              <div class="title">
                {{ $t('profile.profileFilters.model') }}
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <div class="item" @click="openSortModal">
              <div v-if="hasSort" class="circle"></div>
              <div class="icon">
                <div class="kit-icon" v-html="Icon.Sort"></div>
              </div>
              <div class="title">
                {{ $t('profile.profileFilters.sort') }}
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
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
        </div>
        <div v-if="!isEmptyFilter" class="cheaps">
          <div class="cheap clear" @click="clearAll">
            <h4>Clear all</h4>
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
          <div v-if="item.upgraded" class="mark">
            <p>#{{ item.upgrade.seq }}</p>
          </div>
          <div v-else class="rarity">
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
            <button>
              <h5>{{ item.purchase_price }}</h5>
              <img src="/profile/stars.png" alt="stars" />
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
              <div class="price">
                <p>{{ item.purchase_price }}</p>
                <img src="/profile/stars.png" alt="stars" />
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
        <h4>You have no gifts(</h4>
      </div>
      <div class="description">
        <p>You can buy gifts from the store</p>
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
      return this.hasSort ? this.SortItems[this.SelectedSort].Title : ''
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
  },
};
</script>