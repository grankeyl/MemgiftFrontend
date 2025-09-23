<template>
  <div class="overlay" :class="{ 'is-open is-dark': ModalActive }" @click="closeModal" />

    <div v-if="ModalActive" class="balance" @click="openWallet">
      <div class="context">
        <h4>{{ cutNumber(getBalance) }}</h4>
        <img :src="TonImg" alt="ton" />
      </div>
      <div class="button">
        <img :src="PlusImg" alt="plus" />
      </div>
    </div>

  <div 
    v-if="ModalComp.ModalActive"
    class="_direction _comp _item giftModal"
    :class="[Key]"
  >
      <div 
        v-if="isLoading" 
        class="_skeleton"
        :class="{ hide: !ModalActive }"
        @touchstart.passive="onTouchStart($event, 'skeleton')"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
        :style="sheetStyleSkeleton"
      >
        <div @click="closeModal" class="_profileGiftModalClose"></div>
        <div class="_profileGiftModalContent">
          <div class="_profileGiftModalContentImage"></div>
          <div class="_profileGiftModalContentTitle"></div>
        </div>
        <div class="_profileGiftModalTable">
          <div class="_profileGiftModalTableRow"></div>
        </div>
        <div class="_profileGiftModalButtons">
          <div class="_profileGiftModalButtonsCollectable"></div>
          <div class="_profileGiftModalButtonsSend"></div>
        </div>
      </div>
      <div 
        v-if="!isLoading" 
        class="_contentModal"
        :class="{ hide: !ModalActive }"
        @touchstart.passive="onTouchStart($event, 'content')"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
        :style="sheetStyleContent"
      >
        <div @click="closeModal" class="_profileGiftModalClose">
          <div class="kit-icon" v-html="Icon.Close"></div>
        </div>
        <div 
          class="_profileGiftModalContent" 
        >
          <div 
            class="_profileGiftModalGradient"
            :style="{
              '--center-color': ModalComp.Info.core.upgrade.background.colors_center,
              '--around-color': ModalComp.Info.core.upgrade.background.colors_around
            }"
          ></div>

          <div class="_symbols">
             <img :src="ModalComp.Info.core.upgrade.symbol.image" class="_show" alt="rarity" />
          </div>

          <div class="_profileGiftModalContentImage">
            <img 
              v-if="ModalComp.Info.core.gift.media && ModalComp.Info.core.gift.media === 'svg'"
              :src="ModalComp.Info.core.upgrade.nft_name.image"
              alt="nft"
              class="upgradedImage _show"
            />
            <GiftLottie
              v-if="ModalComp.Info.core.gift.media && ModalComp.Info.core.gift.media === 'lottie'"
              class="_lottie upgraded _show"
              :path="ModalComp.Info.core.upgrade.nft_name.image"
              :loop="true"
              width="25"
              height="25"
              renderer="svg"
            />
          </div>

          <div class="_profileGiftModalContentTitle">
            <h4>{{ ModalComp.Info.core.upgrade.nft_name.name }}</h4>
          </div>

          <div class="_profileGiftModalContentNumber">
            <h4>#{{ ModalComp.Info.core.upgrade.seq }}</h4>
          </div>

          <div class="_profileGiftModalContentButtons">
            <button @click="shareGiftLink">
              <img :src="ForwardImg" alt="forward" />
              <span>
                {{ $t('profile.profileShare') }}
              </span>
            </button>
            <button @click="copyGiftLink">
              <img :src="CopyImg" alt="market" />
              <span>
                {{ $t('profile.profileLink') }}
              </span>
            </button>
          </div>
        </div>
        <div class="_profileGiftModalTable _show">
          <div class="_profileGiftModalTableRow">
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>{{ $t('profile.profileGiftPreviewTableMintedItem1') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <p>{{ ModalComp.Info.core.upgrade.nft_name.name }}</p>
                <span>{{ ModalComp.Info.core.upgrade.nft_name.drop_rate }}%</span>
              </div>
            </div>
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>{{ $t('profile.profileGiftPreviewTableMintedItem2') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <p>{{ ModalComp.Info.core.upgrade.symbol.name }}</p>
                <span>{{ ModalComp.Info.core.upgrade.symbol.drop_rate }}%</span>
              </div>
            </div>
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left">
                <h4>{{ $t('profile.profileGiftPreviewTableMintedItem3') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right">
                <p>{{ ModalComp.Info.core.upgrade.background.name }}</p>
                <span>{{ ModalComp.Info.core.upgrade.background.drop_rate }}%</span>
              </div>
            </div>
            <div class="profile_gift_preview_table_item">
              <div class="profile_gift_preview_table_item_left last">
                <h4>{{ $t('profile.profileGiftPreviewTableItem4') }}</h4>
              </div>
              <div class="profile_gift_preview_table_item_right last">
                <p>{{ getSupply }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="_profileGiftModalButtons">
          <div class="_profileGiftModalButtonsClose">
            <button @click="addToBasket(ModalComp.Info)">
              <img :src="BasketWhiteImg" alt="basket" />
              <h4 v-if="ModalComp.BasketStatus">{{ $t('market.modal.removeBasket') }}</h4>
              <h4 v-else>{{ $t('market.modal.addBasket') }}</h4>
              <Lottie 
                class="lt" 
                slug="loading-spin" 
                :loop="true"
                width="75"
                height="75"
                renderer="svg"
              />
            </button>
          </div>
          <div class="_profileGiftModalButtonsBuy">
            <button :class="{ _loading: ActiveButton }" :disabled="!checkBalanceAndPrice" @click="buyGift(ModalComp.Info.id)">
              <h4>{{ $t('market.buy') }} {{ cutNumber(ModalComp.Info.price_ton) }}</h4>
              <img v-if="!ActiveButton" :src="TonWhiteImg" alt="ton" />
              <Lottie 
                class="lt" 
                slug="loading-spin" 
                :loop="true"
                width="75"
                height="75"
                renderer="svg"
              />
            </button>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { Icon } from '../Icon';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { getUpgradedModel } from '../../utils/useGift';
import { showToast } from '../../utils/toastManager';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { cutNumber } from '../../utils/useTon';

import * as MarketLotApi from '@/api/market/lots';

import TelegramModule from '../../hooks/useTelegram';
import Image_Stars from '@/assets/images/stars.png';
import Image_StarsWhite from '@/assets/images/stars-white.png';
import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';
import Lottie from '../Lottie.vue';
import GiftLottie from '../GiftLottie.vue';
import Notiflix from 'notiflix';

// Images
import TonImg from '@/assets/images/market/ton.svg';
import PlusImg from '@/assets/images/market/plus.svg';
import ForwardImg from '@/assets/images/forward.svg';
import CopyImg from '@/assets/images/copy.svg';
import BasketWhiteImg from '@/assets/images/market/basket-white.svg';
import TonWhiteImg from '@/assets/images/market/ton-white.svg';

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
    ModalActive: {
      type: Boolean,
      required: true,
    },
    ModalComp: {
      type: Object,
      required: true,
    },
  },

  components: {
    Lottie,
    GiftLottie,
  },

  data() {
    return {
      TonImg,
      PlusImg,
      ForwardImg,
      CopyImg,
      BasketWhiteImg,
      TonWhiteImg,

      storeCache: useCacheStore(),

      isLoading: this.$props.Skeleton,
      isLoadingModalImage: true,

      isTransferOpen: false,
      isTransferInputSuccess: false,
      isTransferSuccess: false,
      transferTimeout: null,

      OwnerImage: true,
      ActiveButton: false,

      isLoadingUpgrade: false,
      isLoadingUpgradeImage: false,
      isUpgraded: false,

      dragY: 0,
      startY: 0,
      startX: 0,
      isDragging: false,
      dragFrom: null,
      startTimeMs: 0,
      lastY: 0,
      
      Icon,
      Image_Stars,
      Image_StarsWhite,
      Image_GiftBg,

      getUpgradedModel,
      cutNumber,
    };
  },

  mounted() {
    this.loadResources();
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },

  computed: {
    getSupply() {
      return `${Math.max(this.storeCache.NftsAppData[this.ModalComp.Info.core.gift.u_key]?.Supply - this.storeCache.NftsAppData[this.ModalComp.Info.core.gift.u_key]?.SupplyUsers, 0)} of ${this.storeCache.NftsAppData[this.ModalComp.Info.core.gift.u_key]?.Supply}`;
    },
    isLoading() {
      return this.Skeleton;
    },
    isUpgraded() {
      if (!this.ModalComp.NftUpgraded) return false;
      return true;
    },
    sheetStyleContent() {
      if (!this.isDragging || !this.ModalActive || this.dragFrom !== 'content') return null;
      return {
        transform: `translate(-50%, ${Math.max(0, this.dragY)}px)`,
        transition: 'none',
        willChange: 'transform',
      };
    },
    sheetStyleSkeleton() {
      if (!this.isDragging || !this.ModalActive || this.dragFrom !== 'skeleton') return null;
      return {
        transform: `translateY(${Math.max(0, this.dragY)}px)`,
        transition: 'none',
        willChange: 'transform',
      };
    },
    checkBalanceAndPrice() {
      const clearBalance = parseFloat(this.storeCache.UserData.user.Balance.balance_ton);
      const clearPrice = parseFloat(this.ModalComp.Info.price_ton);
      return clearBalance >= clearPrice;
    },
    getBalance() {
      return this.storeCache?.UserData?.user?.Balance?.balance_ton ?? 0;
    },
  },

  methods: {
    handleClickOutside(event) {
      if (!this.$refs.transferInput.contains(event.target)) {
        this.blurTransferInput();
      }
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
      const staticImages = [
        Image_Stars
      ].map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      return Promise.all([...staticImages]);
    },

    closeModal() {
      this.$emit('closeModal');
    },

    handleResize() {
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.clientHeight;
      this.keyboardHeight = fullHeight - viewportHeight;
    },

    async checkUpgradedNft() {
      if (this.UpgradedNft.ModelImage) {
        this.isUpgraded = true;
      };
    },

    shareGiftLink() {
      const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=gift_${this.ModalComp.NftId}`;
      const message = `I recommend checking out "${this.ModalComp.NftName ?? this.UpgradedNft?.ModelName}" NFT.`;
      TelegramModule.useShare(url, message);
    },

    copyGiftLink() {
      const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=gift_${this.ModalComp.NftId}`;
      copyToClipboard(url);
      showToast(this.$t('profile.profileCopiedLink'), 'success');
    },

    addToBasket(gift) {
      this.$emit('addToBasket', gift);
    },
    
    onTouchStart(e, from) {
      if (!this.ModalActive) return;
      const t = e.touches?.[0] ?? e;
      this.dragFrom = from;
      this.isDragging = true;
      this.startY = t.clientY;
      this.startX = t.clientX;
      this.lastY = t.clientY;
      this.dragY = 0;
      this.startTimeMs = performance.now();
    },

    onTouchMove(e) {
      if (!this.isDragging) return;
      const t = e.touches?.[0] ?? e;
      const dy = t.clientY - this.startY;
      const dx = Math.abs(t.clientX - this.startX);

      // Игнорим горизонтальные жесты
      if (dx > Math.abs(dy)) return;

      // Тянем только вниз
      this.dragY = dy > 0 ? dy : 0;
      this.lastY = t.clientY;
    },

    onTouchEnd() {
      if (!this.isDragging) return;

      // Порог/скорость для закрытия
      const elapsed = Math.max(1, performance.now() - this.startTimeMs); // ms
      const distance = Math.max(0, this.dragY); // px
      const velocity = distance / elapsed; // px/ms

      // контентная высота ~ 86vh, возьмём безопасный порог
      const CLOSE_DISTANCE = 120;   // px
      const CLOSE_VELOCITY = 0.6;   // px/ms (~быстрый "флик")

      const shouldClose = distance > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY;

      // Сброс инлайна — вернёт CSS-анимацию
      this.isDragging = false;

      if (shouldClose) {
        this.closeModal();
      } else {
        // Отпружиниваем назад (CSS сам вернёт по transition)
        this.dragY = 0;
        // Небольшой тик, чтобы убрать инлайн-стили после кадра
        requestAnimationFrame(() => {
          this.dragFrom = null;
        });
      }
    },

    buyGift(id) {
      if (!id) return;
      if (!this.checkBalanceAndPrice) return;

      const lot = this.ModalComp.Info;
      this.ActiveButton = true;

      MarketLotApi.buy(id)
        .then(async (data) => {
          if (data.ok) {
            this.ActiveButton = false;
            if (this.storeCache.UserData.user.Balance.balance_ton) {
              this.storeCache.UserData.user.Balance.balance_ton = parseFloat(this.storeCache.UserData.user.Balance.balance_ton) - parseFloat(data.price_ton);
            };
            this.closeModal();
            this.$emit('notifyBuyed', id);
          } else {
            this.ActiveButton = false;
            showToast(data.error, 'error');
          }
        })
        .catch((e) => {
          this.ActiveButton = false;
          showToast(e.error, 'error');
        });
    },

    openWallet() {
      this.$router.push('/wallet');
    },
  },
};
</script>

<style lang="sass" scoped>
@use "./Modal.sass"
</style>