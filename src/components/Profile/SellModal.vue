<template>
  <div 
    class="_direction _comp _item _modelModal sell"
    :class="[Key]"
  >
      <div 
        v-if="isLoading" 
        class="_skeleton"
        :class="{ hide: !ModalActive }"
      >
        <div @click="closeModal" class="close"></div>
      </div>
      <div 
        v-if="!isLoading" 
        class="_content"
        :class="{ hide: !ModalActive }"
      >
        <div class="head">
          <div class="centered">
            <div class="kit-icon" v-html="Icon.Gift"></div>
            <h4>Sell Gift on Market</h4>
          </div>
          <div @click="closeModal" class="close">
            <div class="kit-icon" v-html="Icon.Close"></div>
          </div>
        </div>
        <div class="sells">
          <div
            v-for="(sell, index) in ModalSellList"
            :key="index"
            class="sell"
          >
            <div class="nft">
              <div
                class="background upg"
                :style="{
                  '--center-color': sell.background_colors_center,
                  '--around-color': sell.background_colors_around,
                }"
              ></div>
              <div class="symbol upg">
                <img :src="sell.symbol_image" :alt="sell.symbol_name" />
              </div>
              <div class="model">
                <div class="upg">
                  <div v-if="sell.gift_media === 'svg'" class="image">
                    <img :src="sell.nft_image" alt="model" />
                  </div>
                  <div v-if="sell.gift_media === 'lottie'" class="image">
                    <img :src="getUpgradedModel(sell.gift_ukey, sell.nft_name, 'svg')" alt="model" />
                  </div>
                </div>
              </div>
            </div>
            <div class="content">
              <div class="naming">
                <h4>{{ sell.nft_name }}</h4>
                <p>#{{ sell.seq }}</p>
              </div>
            </div>
            <div class="blocker">
              <div class="input-amount">
                <input
                  type="text"
                  inputmode="decimal"
                  autocomplete="off"
                  placeholder="Your Price"
                  :value="sell.ton_price === 0 ? '' : String(sell.ton_price)"
                  @input="onPriceInput($event, sell, 2)"
                  @blur="onPriceBlur($event, sell, 2)"
                />
                <img :src="TonImg" alt="ton" />
              </div>
              <div class="summary" v-if="!checkAmount">
                <p>Min: {{ cutNumber(minimumPrice) }} TON</p>
              </div>
            </div>
          </div>
        </div>
        <div class="buttons" :class="sellType">
          <button @click="cancel">
            <h4>Close</h4>
          </button>
          <button @click="apply" :disabled="!checkAmount">
            <h4>Sell for {{ cutNumber(comissionAmount) }}</h4>
            <img :src="TonWhiteImg" alt="ton" />
            <IOSLoader />
            <img :src="DoneImg" alt="done" />
          </button>
        </div>
      </div>
  </div>
</template>

<script>
import { Icon } from '../Icon';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { cutNumber, cutNumberNano } from '../../utils/useTon';
import { getUpgradedModel } from '../../utils/useGift';

import IOSLoader from '../IOSLoader.vue';

import * as MarketNftApi from '@/api/market/nft';

import Image_Stars from '@/assets/images/stars.png';
import Image_StarsWhite from '@/assets/images/stars-white.png';
import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';
import Lottie from '../Lottie.vue';

// Images
import TonImg from '@/assets/images/market/ton.svg';
import TonWhiteImg from '@/assets/images/market/ton-white.svg';
import DoneImg from '@/assets/images/market/done.svg';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    ModalActive: { type: Boolean, required: true },
    ModalSellList: { type: Array, required: true },
  },

  components: {
    Lottie,
    IOSLoader,
  },

  data() {
    return {
      TonImg,
      TonWhiteImg,
      DoneImg,

      storeCache: useCacheStore(),
      isLoadingModalImage: true,

      OwnerImage: true,
      ActiveButton: false,

      sellType: 'notactive', // notactive | processed | success
      sellPrice: 0,

      minimumPrice: 5,

      Icon,
      Image_Stars,
      Image_StarsWhite,
      Image_GiftBg,

      getUpgradedModel,
      cutNumber,
    };
  },

  watch: {
  },

  mounted() {
    this.loadResources();
    this.getMinimumPrice();

    this.$watch(
      () => this.ModalSellList,
      () => {
        this.getMinimumPrice();
      }
    );
  },

  computed: {
    isSkeleton() {
      return this.Skeleton;
    },
    comissionAmount() {
      return parseFloat(this.sellPrice) * 1.05;
    },
    checkAmount() {
      if (
        this.sellPrice > 0.05 && this.sellPrice < 15000 &&
        this.sellPrice >= this.minimumPrice
      ) {
        return true;
      } else {
        return false;
      }
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
      
    sanitizePrice(str, maxDecimals = 2) {
      if (!str) return '';
      str = str.replace(',', '.').replace(/[^\d.]/g, '');
      const firstDot = str.indexOf('.');
      if (firstDot !== -1) {
        str =
          str.slice(0, firstDot + 1) +
          str.slice(firstDot + 1).replace(/\./g, '');
      }
      let [int = '', frac = ''] = str.split('.');
      int = int.replace(/^0+(?=\d)/, '') || (str.startsWith('0') ? '0' : '');
      frac = frac.slice(0, maxDecimals);
      if (frac.length > 0) {
        return `${int || '0'}.${frac}`;
      }
      if (str.endsWith('.')) {
        return `${int || '0'}.`;
      }
      return int;
    },

    onPriceInput(e, sell, maxDecimals = 2) {
      const cleaned = this.sanitizePrice(e.target.value, maxDecimals);
      e.target.value = cleaned;
      sell.ton_price = cleaned.endsWith('.') ? Number(cleaned.slice(0, -1) || 0) : Number(cleaned || 0);
      this.sellPrice = sell.ton_price;
    },

    onPriceBlur(e, sell, decimals = 2) {
      const s = this.sanitizePrice(e.target.value, decimals);
      const normalized = s ? cutNumber(s, decimals) : '';
      e.target.value = normalized;
      sell.ton_price = normalized === '' ? 0 : Number(normalized);
      this.sellPrice = sell.ton_price;
    },
      
    closeModal() {
      this.$emit('closeModal');
    },

    async getMinimumPrice() {
      const response = await MarketNftApi.minPrice(
        this.ModalSellList[0].gift_ukey
      );
      if (!response) return;
      this.minimumPrice = response.min;
    },

    async apply() {
      if (!this.checkAmount) return;

      const nft = this.ModalSellList[0];
      if (!nft) return;

      this.sellType = 'processed';
      const response = await MarketNftApi.create(
        nft.gift_uuid,
        this.storeCache.UserData.user.Balance.user_uuid,
        nft.ton_price,
        false
      );
      if (!response) return;

      this.sellType = 'success';

      setTimeout(() => {
        this.sellType = 'notactive';
        this.minimumPrice = 5;
        this.sellPrice = 0;
      }, 1200);

      const price = cutNumberNano(response.lot.price_nano_com);
      this.$emit('apply', { 
        lot_id: response.lot.id,
        gift_uuid: nft.gift_uuid, 
        price_ton: price
      });
    },

    cancel() {
      this.$emit('closeModal');
    },
  },
};
</script>

<style>
</style>