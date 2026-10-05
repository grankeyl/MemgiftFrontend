<template>
  <!-- Single root so page gap doesn't double between filters / gifts -->
  <div class="prf-gifts">
  <!-- Табы: подарки / в кошельке — стеклянный сегмент со скользящим
       индикатором, как пилюля нижнего меню -->
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
  <!-- Filters — same markup pattern as Market/Filters.vue -->
  <div class="_direction _comp _item _filter">
    <div v-if="!isLoading" class="_content">
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
          <div
            class="filtersItemsItem"
            :class="{ disabled: !hasModelsUpgraded }"
            @click="openGiftModelsModal"
          >
            <div class="circle" v-if="hasGiftModels"></div>
            <div class="flexer">
              <div class="title">{{ $t('profile.profileFilters.model') }}</div>
              <div class="border"></div>
              <div class="icon">
                <div class="kit-icon" v-html="Icon.GiftOth"></div>
              </div>
            </div>
          </div>
          <div class="filtersItemsItem" @click="openSymbolModal">
            <div class="circle" v-if="hasSymbols"></div>
            <div class="flexer">
              <div class="title">{{ $t('profile.profileFilters.symbol') }}</div>
              <div class="border"></div>
              <div class="icon">
                <div class="kit-icon" v-html="Icon.Symbol"></div>
              </div>
            </div>
          </div>
          <div class="filtersItemsItem" @click="openBackdropModal">
            <div class="circle" v-if="hasBackdrops"></div>
            <div class="flexer">
              <div class="title">{{ $t('profile.profileFilters.backdrop') }}</div>
              <div class="border"></div>
              <div class="icon">
                <div class="kit-icon" v-html="Icon.Backdrop"></div>
              </div>
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
          <div class="kit-icon" v-html="Icon.Blocks"></div>
          <h4>{{ modelsCount === 1 ? `Model: ${SelectedModels[0]}` : `${modelsCount} Models` }}</h4>
          <div class="kit-icon" v-html="Icon.Close"></div>
        </div>
        <div v-if="hasSort" class="cheap sort" @click="clearSort">
          <div class="kit-icon" v-html="Icon.Sort"></div>
          <h4>{{ sortTitle }}</h4>
          <div class="kit-icon" v-html="Icon.Close"></div>
        </div>
        <div v-if="hasGiftModels" class="cheap model" @click="clearGiftModels">
          <div class="kit-icon" v-html="Icon.Gift"></div>
          <h4>{{ giftModelsCount === 1 ? `Model: ${SelectedGiftModels[0]}` : `${giftModelsCount} Models` }}</h4>
          <div class="kit-icon" v-html="Icon.Close"></div>
        </div>
        <div v-if="hasSymbols" class="cheap symbol" @click="clearSymbols">
          <div class="kit-icon" v-html="Icon.Symbol"></div>
          <h4>{{ symbolsCount === 1 ? `Symbol: ${SelectedSymbols[0]}` : `${symbolsCount} Symbols` }}</h4>
          <div class="kit-icon" v-html="Icon.Close"></div>
        </div>
        <div v-if="hasBackdrops" class="cheap backdrop" @click="clearBackdrops">
          <div class="kit-icon" v-html="Icon.Backdrop"></div>
          <h4>{{ backdropsCount === 1 ? `Backdrop: ${SelectedBackdrops[0]}` : `${backdropsCount} Backdrops` }}</h4>
          <div class="kit-icon" v-html="Icon.Close"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="_direction _comp _item _nfts">
    <div v-if="isLoading" class="_skeleton">
      <div class="item" v-for="i in 9" :key="'gs-' + i"></div>
    </div>
    <div v-if="!isLoading" class="_content">
      <!-- Blocks — home store cards, 3 per row -->
      <TransitionGroup v-if="tabViewNFTs === 'blocks'" :key="'blocks-' + ActiveTab" appear tag="div" name="giftgone" class="items blocks" @before-leave="freezeLeavingCard">
        <div
          v-for="(item, index) in GiftsList"
          :key="item.uuid"
          class="item _gift"
          :class="{ 'is-upgraded': !!item.upgraded, 'is-market': !!item.market }"
          :style="[giftCardStyle(item), { '--gi': index % 12 }]"
          @click="useModal(item.uuid)"
        >
          <div class="_symbols">
            <img
              v-if="item.upgraded && item.upgrade?.symbol_image"
              :src="item.upgrade.symbol_image"
              alt=""
            />
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
          <div
            v-if="item.mint?.status === 'success' || item.status === 'minted' || item.mint?.status === 'processing' || item.status === 'mint_locked'"
            class="_rarity _rarity--sale _rarity--mint"
          >
            <div class="_image"></div>
            <div class="_text">
              <span>{{ (item.mint?.status === 'processing' || item.status === 'mint_locked') ? $t('profile.profileMintFlow.tickerMinting') : $t('profile.profileMintFlow.ribbon') }}</span>
            </div>
          </div>

          <!-- выставлен на маркете: та же лента, что у редкости, своим цветом -->
          <div v-else-if="item.market" class="_rarity _rarity--sale" :style="saleRibbonStyle(item)">
            <div class="_image"></div>
            <div class="_text">
              <span>on sale</span>
            </div>
          </div>

          <!-- Rarity outside clip stack so it sticks out of the card -->
          <div v-else-if="!item.upgraded && giftRarity(item)" class="_rarity">
            <div class="_image">
              <img :src="checkRarityImage(giftRarity(item))" alt="" />
            </div>
            <div class="_text">
              <span>{{ checkRarity(giftRarity(item)) }}</span>
            </div>
          </div>

          <!-- Quick actions — sell / send / mint / remove listing -->
          <!-- <div class="prf-card-actions" @click.stop>
            <button
              v-if="!item.upgraded"
              type="button"
              class="prf-card-actions__btn prf-card-actions__btn--mint"
              @click="onMint(item)"
            >
              <div class="kit-icon" v-html="Icon.Mint"></div>
              <span>{{ $t('profile.profileMint') }}</span>
            </button>
            <button
              v-else-if="!item.market"
              type="button"
              class="prf-card-actions__btn prf-card-actions__btn--sell"
              @click="onSell(item)"
            >
              <div class="kit-icon" v-html="Icon.Market"></div>
              <span>{{ $t('profile.profileSell') }}</span>
            </button>
            <button
              v-else
              type="button"
              class="prf-card-actions__btn prf-card-actions__btn--remove"
              @click="onRemove(item)"
            >
              <div class="kit-icon" v-html="Icon.Close"></div>
              <span>{{ $t('profile.removeListing') }}</span>
            </button>
            <button
              type="button"
              class="prf-card-actions__btn prf-card-actions__btn--send"
              @click="onSend(item)"
            >
              <div class="kit-icon" v-html="Icon.Gift"></div>
              <span>{{ $t('profile.profileGiftPreviewButtonSend') }}</span>
            </button>
          </div> -->
        </div>
      </TransitionGroup>
      <TransitionGroup v-if="tabViewNFTs === 'lists'" :key="'lists-' + ActiveTab" appear tag="div" name="giftgone" class="items lists" @before-leave="freezeLeavingCard">
        <div
          v-for="(item, index) in GiftsList"
          :key="item.uuid"
          @click="useModal(item.uuid)"
          class="item"
          :style="{ '--gi': index % 12 }"
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
      </TransitionGroup>
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
import { t } from 'i18next';
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
import Funcs from './Funcs.vue';
import GiftLottie from '../GiftLottie.vue';

// Images
import StoreImg from '@/assets/images/market/store.svg';
import StarsImg from '@/assets/images/profile/stars.png';
import ProfileEmptyImg from '@/assets/images/profile/empty.svg';

export default {
  props: {
    ActiveTab: {
      type: String,
      default: 'all',
    },
    Skeleton: {
      type: Boolean,
      required: true,
    },
    SkeletonTime: {
      type: Number,
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
    SelectedModels: {
      type: Array,
      required: true,
    },
    SelectedSort: {
      type: String,
      required: true,
    },
    SelectedGiftModels: {
      type: Array,
      required: true,
    },
    SelectedSymbols: {
      type: Array,
      required: true,
    },
     SelectedBackdrops: {
      type: Array,
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
    HasMore: {
      type: Boolean,
      required: true,
    },
  },

  components: {
    Lottie,
    GiftLottie,
    Button,
    Funcs,
  },

  data() {
    return {
      StoreImg,

      StarsImg,
      ProfileEmptyImg,

      configApp: getConfig(),
      storeCache: useCacheStore(),
      storeNftsApp: {},

      isLoading: this.$props.Skeleton,
      isLoadingGifts: this.$props.GiftsLoading,

      activeGift: null,

      tabViewNFTs: "blocks",
      observer: null,
      _ioBusy: false,
      _ioLock: false,

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
      cutNumber,
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
    hasModelsUpgraded() {
      for (const model of this.SelectedModels) {
        const modelName = this.storeCache.NftsAppData[model];
        if (modelName?.UpgradeSupport) return true;
      }
      return false;
    },
    hasSort() {
      return !!this.SelectedSort && !!this.SortItems?.[this.SelectedSort] 
    },
    hasGiftModels() {
      return this.giftModelsCount > 0 
    },
    hasSymbols() {
      return this.symbolsCount > 0 
    },
    hasBackdrops() {
      return this.backdropsCount > 0 
    },
    isEmptyFilter() {
      return !(this.hasModels || this.hasGiftModels || this.hasSort || this.hasSymbols || this.hasBackdrops)
    },
    sortTitle() {
      if (this.hasSort) {
        return this.$t(`profile.profileFilterModal.items.${this.SelectedSort}`)
      } else {
        return ''
      }
    },
    hasMore() {
      if (this.HasMore !== null) return this.HasMore;
      return this.GiftsCount > (this.GiftsList?.length || 0);
    },
    lastCursor() {
      const last = this.GiftsList?.[this.GiftsList.length - 1];
      // выбери, чем пагинироваться: uuid или created_at
      return last ? { uuid: last.uuid, created_at: last.created_at } : null;
    },

    giftModelsCount() {
      return this.SelectedGiftModels?.length ?? 0 
    },
    symbolsCount() {
      return this.SelectedSymbols?.length ?? 0 
    },
    backdropsCount() {
      return this.SelectedBackdrops?.length ?? 0 
    },
  },

  watch: {
    GiftsList(newValue) {
      this.$nextTick(() => this.resetObserver());
    },
  },

  methods: {
    // подарок уже в блокчейне (или минтится прямо сейчас)
    isMintedItem(item) {
      return item?.mint?.status === 'success' || item?.status === 'minted'
        || item?.mint?.status === 'processing' || item?.status === 'mint_locked';
    },

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

    findScrollRoot(el) {
      let n = el.parentElement;
      while (n) {
        const style = getComputedStyle(n);
        const oy = style.overflowY;
        if (oy === 'auto' || oy === 'scroll') return n;
        n = n.parentElement;
      }
      return null;
    },

    // замените initObserver / resetObserver на это
    initObserver() {
      this.destroyObserver();

      // sentinel может ещё не дорендериться — подождём DOM
      this.$nextTick(() => {
        const sentinel = this.$refs.sentinel;
        if (!sentinel) return; // появится — вотчеры ниже дёрнут повторно

        // 1) определяем корректный root
        const rootEl = this.findScrollRoot(this.$el) || null; // null = окно

        this.observer = new IntersectionObserver(
          (entries) => {
            const e = entries[0];
            if (!e?.isIntersecting) return;
            if (this.Searching || !this.hasMore || this._ioLock) return;

            this._ioLock = true;
            Promise.resolve(this.requestMore())
              .catch(() => {}) // проглотим, лог уже есть снаружи
              .finally(() => { this._ioLock = false; });
          },
          {
            root: rootEl,
            // чуть «жирнее» маргин, чтобы триггерилось пораньше
            rootMargin: '0px 0px 200px 0px',
            threshold: 0,
          }
        );

        this.observer.observe(sentinel);

        // 3) если контента мало — «продреним» вручную
        this.autoDrainIfShort(rootEl);
      });
    },

    destroyObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },

    resetObserver() {
      this.initObserver();
    },

    autoDrainIfShort(rootEl) {
      const tryDrain = () => {
        if (this.Searching || !this.hasMore || this._ioLock) return;
        const viewportH = rootEl
          ? (rootEl).clientHeight
          : window.innerHeight;
        const contentH = this.$el.getBoundingClientRect().height;

        if (contentH < viewportH && this.hasMore) {
          this._ioLock = true;
          Promise.resolve(this.requestMore())
            .finally(() => {
              this._ioLock = false;
              // подождём дорендер и проверим снова
              this.$nextTick(() => requestAnimationFrame(tryDrain));
            });
        }
      };

      this.$nextTick(() => requestAnimationFrame(tryDrain));
    },

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

    giftCatalog(item) {
      const data = this.storeCache?.NftsAppData;
      if (!data || !item) return null;
      const key = item.gift_ukey || item.nft_unique_key || item.u_key;
      if (key && data[key]) return data[key];
      const list = Array.isArray(data) ? data : Object.values(data || {});
      return (
        list.find(
          (g) =>
            g?.UKey === key ||
            g?.u_key === key ||
            g?.Key === key ||
            g?.key === key
        ) || null
      );
    },

    giftRarity(item) {
      const cat = this.giftCatalog(item);
      let raw =
        cat?.Rarity ||
        cat?.rarity ||
        item?.gift_rarity ||
        item?.rarity ||
        '';
      raw = String(raw).toLowerCase().replace(/[\s_-]+/g, '');
      // normalize aliases
      if (raw === 'legendary') return 'legend';
      if (raw === 'veryrare' || raw === 'veryrarity') return 'veryrare';
      return raw;
    },

    // Boost hex color toward white for a juicier center glow
    // лента «on sale» красится цветами самого подарка: у улучшенных — фон
    // модели, у обычных — градиент его редкости. так метка всегда в тон карточке
    saleRibbonStyle(item) {
      let from = '';
      let to = '';

      if (item?.upgraded && item?.upgrade) {
        from = item.upgrade.background_colors_center || item.upgrade.background?.colors_center || '';
        to = item.upgrade.background_colors_around || item.upgrade.background?.colors_around || '';
      } else {
        const map = {
          rare: ['#4F4FC0', '#2B2B80'],
          veryrare: ['#2E9A55', '#134C24'],
          epic: ['#9B3FB4', '#4A1D57'],
          legend: ['#C9902A', '#6F480E'],
          author: ['#C43C3C', '#6B1F1F'],
        };
        const pair = map[this.giftRarity(item)] || ['#4A4A52', '#26262C'];
        from = pair[0];
        to = pair[1];
      }

      if (!from) from = '#4A4A52';
      if (!to) to = from;

      // лента должна читаться темнее карточки, а не ярче её:
      // осветляем начало чуть-чуть, а конец наоборот притемняем
      // лента светлая и насыщенная: тёмный конец берём не из фонового
      // цвета подарка (он почти чёрный), а из основного — иначе градиент
      // уходит в грязь и «цветность» пропадает
      const base = this.saturateColor(from, 0.34);
      return {
        '--sale-from': this.boostColor(base, 0.14),
        '--sale-to': this.darkenColor(base, 0.26),
        '--sale-text': '#FFFFFF',
      };
    },

    // подмешиваем насыщенности в HSL: простое осветление в RGB
    // одновременно обесцвечивает, и лента получается блёклой
    saturateColor(hex, amount = 0.3) {
      try {
        let h = String(hex || '').replace('#', '').trim();
        if (h.length === 3) h = h.split('').map((c) => c + c).join('');
        if (h.length !== 6) return hex || '#4A4A52';
        const n = parseInt(h, 16);
        const r = ((n >> 16) & 255) / 255;
        const g = ((n >> 8) & 255) / 255;
        const b = (n & 255) / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        if (max === min) return hex;
        const d = max - min;
        let sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        let hue = 0;
        if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) hue = ((b - r) / d + 2) / 6;
        else hue = ((r - g) / d + 4) / 6;
        sat = Math.min(1, sat + amount);
        const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
        const pp = 2 * l - q;
        const conv = (t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return pp + (q - pp) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return pp + (q - pp) * (2 / 3 - t) * 6;
          return pp;
        };
        const to255 = (v) => Math.round(Math.min(1, Math.max(0, v)) * 255);
        const rr = to255(conv(hue + 1 / 3));
        const gg = to255(conv(hue));
        const bb = to255(conv(hue - 1 / 3));
        return `#${((1 << 24) + (rr << 16) + (gg << 8) + bb).toString(16).slice(1)}`;
      } catch {
        return hex || '#4A4A52';
      }
    },

    darkenColor(hex, amount = 0.3) {
      try {
        let h = String(hex || '').replace('#', '').trim();
        if (h.length === 3) h = h.split('').map((c) => c + c).join('');
        if (h.length !== 6) return hex || '#1E1E23';
        const n = parseInt(h, 16);
        const k = 1 - amount;
        const r = Math.max(0, Math.round(((n >> 16) & 255) * k));
        const g = Math.max(0, Math.round(((n >> 8) & 255) * k));
        const b = Math.max(0, Math.round((n & 255) * k));
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      } catch {
        return hex || '#1E1E23';
      }
    },

    // светлая заливка требует тёмного текста, иначе надпись пропадает
    isLightColor(hex) {
      try {
        let h = String(hex || '').replace('#', '').trim();
        if (h.length === 3) h = h.split('').map((c) => c + c).join('');
        if (h.length !== 6) return false;
        const n = parseInt(h, 16);
        const r = (n >> 16) & 255;
        const g = (n >> 8) & 255;
        const b = n & 255;
        // яркость по восприятию, а не среднее по каналам
        return (0.299 * r + 0.587 * g + 0.114 * b) > 165;
      } catch {
        return false;
      }
    },

    boostColor(hex, amount = 0.22) {
      try {
        let h = String(hex || '').replace('#', '').trim();
        if (h.length === 3) h = h.split('').map((c) => c + c).join('');
        if (h.length !== 6) return hex || '#666';
        const n = parseInt(h, 16);
        let r = (n >> 16) & 255;
        let g = (n >> 8) & 255;
        let b = n & 255;
        r = Math.min(255, Math.round(r + (255 - r) * amount));
        g = Math.min(255, Math.round(g + (255 - g) * amount));
        b = Math.min(255, Math.round(b + (255 - b) * amount));
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      } catch {
        return hex || '#666';
      }
    },

    // Inline backgrounds — upgraded juicy color, no vignette/shadow edges
    // уходящая карточка становится absolute и теряет размеры,
    // которые ей давала сетка: без этого она схлопывается в тёмный
    // прямоугольник и мигает. запоминаем её коробку до отрыва из потока
    freezeLeavingCard(el) {
      el.style.left = el.offsetLeft + 'px';
      el.style.top = el.offsetTop + 'px';
      el.style.width = el.offsetWidth + 'px';
      el.style.height = el.offsetHeight + 'px';
    },

    giftCardStyle(item) {
      if (item.upgraded && item.upgrade) {
        const c = item.upgrade.background_colors_center || item.upgrade.background?.colors_center || '#666';
        const a = item.upgrade.background_colors_around || item.upgrade.background?.colors_around || '#1a1a1a';
        const hot = this.boostColor(c, 0.28);
        return {
          background: `radial-gradient(circle at 50% 40%, ${hot} 0%, ${c} 45%, ${a} 100%)`,
          boxShadow: 'none',
        };
      }
      const r = this.giftRarity(item);
      const map = {
        rare: 'linear-gradient(180deg, #282867 0%, #131328 100%)',
        veryrare: 'linear-gradient(180deg, #1D6132 0%, #0B2211 100%)',
        epic: 'linear-gradient(180deg, #632475 0%, #19101D 100%)',
        legend: 'linear-gradient(180deg, #6F480E 0%, #1D1710 100%)',
        author: 'linear-gradient(180deg, #762121 0%, #221111 100%)',
      };
      return {
        background: map[r] || '#252528',
      };
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

    openGiftModelsModal() {
      this.$emit('openGiftModelsModal');
    },

    openSymbolModal() {
      this.$emit('openSymbolModal');
    },

    openBackdropModal() {
      this.$emit('openBackdropModal');
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

    clearSymbols() {
      this.$emit('clearSymbols');
    },

    clearBackdrops() {
      this.$emit('clearBackdrops');
    },

    clearGiftModels() {
      this.$emit('clearGiftModels');
    },

    // Quick-action handlers on gift cards
    onMint(item) {
      this.useModal(item.uuid);
      this.$emit('quickMint', item);
    },

    onSell(item) {
      this.useModal(item.uuid);
      this.$emit('quickSell', item);
    },

    onRemove(item) {
      this.$emit('quickRemove', item);
    },

    onSend(item) {
      this.useModal(item.uuid);
      this.$emit('quickSend', item);
    },
  },
};
</script>
