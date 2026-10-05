<template>
  <div class="_direction _comp _item _pageGiftContext" :class="[Key]">
    <div v-if="isLoading" class="_skeleton">
      <div class="mgm-skel">
        <div class="mgm-skel__card"></div>
        <div class="mgm-skel__block"></div>
        <div class="mgm-skel__btn"></div>
      </div>
    </div>

    <!-- та же вёрстка, что в модалке подарка на странице профиля -->
    <div v-else class="_content mgm-body pg-body">
      <div class="mgm-card">
        <div
          class="mgm-card__head"
          :class="[NftData.upgraded ? 'is-upg' : normalizedRarity]"
          :style="cardHeadStyle"
        >
          <div class="mgm-card__bg"></div>

          <div class="mgm-card__symbol">
            <img v-if="NftData.upgraded && NftData?.SymbolImage" :src="NftData.SymbolImage" alt="" />
            <img v-else :src="Image_GiftBg" alt="" />
          </div>

          <div v-if="NftData.upgraded && NftData?.ModelNumber != null" class="mgm-card__mark">
            <p>#{{ NftData.ModelNumber }}</p>
          </div>

          <div class="mgm-card__model">
            <GiftLottie
              v-if="showLottie"
              class="mgm-card__lottie"
              :path="lottiePath"
              :loop="true"
              :autoplay="true"
              width="0"
              height="0"
              renderer="canvas"
            />
            <img v-else class="mgm-card__model-img" :src="modelImageSrc" alt="nft" />
          </div>
        </div>
      </div>

      <div class="mgm-title">
        <div class="mgm-title__left">
          <h3>{{ displayName }}</h3>
        </div>
        <div class="mgm-title__tools">
          <button type="button" class="mgm-tool" @click="shareGiftLink">
            <img :src="ForwardImg" alt="" />
          </button>
          <button type="button" class="mgm-tool" @click="copyGiftLink">
            <img :src="CopyImg" alt="" />
          </button>
        </div>
      </div>

      <div class="mgm-info">
        <template v-if="NftData.upgraded">
          <div class="mgm-info__row">
            <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableMintedItem1') }}</span>
            <div class="mgm-info__right">
              <span class="mgm-info__val">{{ NftData?.ModelName || '—' }}</span>
              <span v-if="NftData?.ModelDropRate" class="mgm-info__pct">{{ NftData.ModelDropRate }}%</span>
            </div>
          </div>
          <div class="mgm-info__row">
            <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableMintedItem2') }}</span>
            <div class="mgm-info__right">
              <span class="mgm-info__val">{{ NftData?.SymbolName || '—' }}</span>
              <span v-if="NftData?.SymbolDropRate" class="mgm-info__pct">{{ NftData.SymbolDropRate }}%</span>
            </div>
          </div>
          <div class="mgm-info__row">
            <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableMintedItem3') }}</span>
            <div class="mgm-info__right">
              <span class="mgm-info__val">{{ NftData?.BackgroundName || '—' }}</span>
              <span v-if="NftData?.BackgroundDropRate" class="mgm-info__pct">{{ NftData.BackgroundDropRate }}%</span>
            </div>
          </div>
        </template>

        <div class="mgm-info__row">
          <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableItem1') }}</span>
          <div class="mgm-info__right">
            <span class="mgm-info__val">{{ Table?.OwnerName || '—' }}</span>
          </div>
        </div>
        <div v-if="!NftData.upgraded" class="mgm-info__row">
          <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableItem3') }}</span>
          <div class="mgm-info__right">
            <span class="mgm-info__val">{{ Table?.NftPrice || '—' }}</span>
          </div>
        </div>
        <div class="mgm-info__row">
          <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableItem4') }}</span>
          <div class="mgm-info__right">
            <span class="mgm-info__val">{{ Table?.NftSupply || '—' }}</span>
          </div>
        </div>
      </div>

      <div class="pgm-footer">
        <button type="button" class="pgm-footer__btn pgm-footer__btn--close" @click="openProfile">
          <span>{{ $t('profile.profileProfile') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
  
  <script>
  import { checkPriceNumber, clearBackgroundName } from '../../utils/useGift';
  import { cleanString } from '../../utils/useApp';
  import { Icon } from '../Icon';
  import { getImageUrl, unixToRelative } from '../../utils/useApp';
  import { useCacheStore } from '../../stores/pinia/piniaStore';

  import TelegramModule from '../../hooks/useTelegram';

  import GiftLottie from '../GiftLottie.vue';

  import Image_Stars from '@/assets/images/stars.png';
  import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';
  import ForwardImg from '@/assets/images/forward.svg';
  import CopyImg from '@/assets/images/copy.svg';

  import { copyToClipboard } from '../../utils/copyToClipboard';
  import { showToast } from '../../utils/toastManager';

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
      NftData: {
        type: Object,
        required: true,
      },
      Table: {
        type: Object,
        required: true,
      },
    },

    components: {
      GiftLottie,
    },

    data() {
      return {
        storeCache: useCacheStore(),

        isLoading: this.Skeleton,

        cleanString,
        
        checkPriceNumber,
        unixToRelative,
        getImageUrl,

        Icon,
        Image_Stars,
        Image_GiftBg,
        ForwardImg,
        CopyImg,
      };
    },

    computed: {
      isLoading() {
        return this.Skeleton;
      },

      // редкость приходит в разном написании — приводим к классам фона
      normalizedRarity() {
        let rarity = String(this.NftData?.NftRarity || '').toLowerCase().replace(/[\s_-]+/g, '');
        if (rarity === 'legendary') rarity = 'legend';
        if (rarity === 'veryrarity') rarity = 'veryrare';
        return rarity;
      },

      // у улучшенного подарка фон рисуется его собственными цветами
      cardHeadStyle() {
        if (!this.NftData?.upgraded) return null;
        const center = this.NftData?.BackgroundColors?.Center;
        const around = this.NftData?.BackgroundColors?.Around;
        if (!center && !around) return null;
        return {
          '--center-color': center || '#666',
          '--around-color': around || '#1a1a1a',
        };
      },

      // заголовок — оригинальное название подарка; имя модели остаётся
      // в строке «Модель», иначе по улучшенным непонятно, что за подарок
      displayName() {
        return this.NftData?.GiftName || this.NftData?.NftName;
      },

      showLottie() {
        return this.NftData?.NftMedia === 'lottie' && !!this.lottiePath;
      },

      lottiePath() {
        if (this.NftData?.upgraded) return this.NftData?.ModelImage || '';
        return this.NftData?.NftKey ? `/gifts/lottie/${this.NftData.NftKey}.json` : '';
      },

      modelImageSrc() {
        return this.NftData?.upgraded ? this.NftData?.ModelImage : this.NftData?.NftImage;
      },
    },
  
    mounted() {
      this.loadResources();
    },

    methods: {
      async loadResources() {
        try {
          await Promise.all([this.loadFonts(), this.loadIcons()]);
          this.$emit("loadSuccess");
        } catch (error) {
          console.error("Ошибка при загрузке ресурсов:", error);
        }
      },

      loadFonts() {
        return document.fonts.ready;
      },

      loadIcons() {
        return new Promise((resolve, reject) => {
          const div = document.createElement("div");
          div.innerHTML = this.Icon;

          const icons = div.querySelectorAll("img, svg");
          const promises = Array.from(icons).map((icon) => {
            if (icon.tagName === "IMG") {
              return new Promise((resolveImage, rejectImage) => {
                const img = new Image();
                img.src = icon.src;
                img.onload = resolveImage;
                img.onerror = rejectImage;
              });
            } else {
              return Promise.resolve();
            }
          });

          Promise.all(promises).then(resolve).catch(reject);
        });
      },

      copyGiftLink() {
        const link = `${import.meta.env.VITE_APP_MINI_APP_LINK}=gift_${this.$route.params.id}`;
        copyToClipboard(link);
        showToast(this.$t('profile.profileCopiedLink'), 'success');
      },

      shareGiftLink() {
        const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=gift_${this.NftData.id}`;
        const message = `I recommend checking out "${this.NftData.NftName}" NFT.`;
        TelegramModule.useShare(url, message);
      },

      openProfile() {
        this.$router.push({
          name: 'view',
          params: { id: this.NftData.user_id },
          query: {
            type: 'giftPage',
            key: this.NftData.id,
          },
        });
      },
    }
  };
  </script>