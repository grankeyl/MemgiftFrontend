<template>
  <div 
    class="_direction _comp _item _referralContext"
    :class="[Key]"
  >
      <div 
        v-if="isLoading" 
        class="_skeleton"
      >
        <div class="_section">
          <div class="_title">
            <div class="_h">
              <h4></h4>
            </div>
          </div>
          <div class="_descr">
            <p></p>
          </div>
          <div class="_blocker">
            <div class="_link">
              <p></p>
            </div>
            <div class="_buttons">
              <button>
                <h4></h4>
              </button>
              <button>
                <h4></h4>
              </button>
            </div>
          </div>
        </div>
        <div class="_section">
          <div class="_title">
            <div class="_h">
              <h4></h4>
            </div>
          </div>
          <div class="_referrals">
            <div class="_referral"></div>
            <div class="_referral"></div>
          </div>
        </div>
      </div>
      <div 
        v-if="!isLoading" 
        class="_content"
      >
        <div class="vector">
          <img src="/referral/context-image.png" alt="">
        </div>
        <div class="title">
          <h4>{{ $t('referral.title') }}</h4>
        </div>
        <div class="descr">
          <p>
            {{ $t('referral.description') }}
            <Icon class="kit-icon" v-html="Icon.Instagram"></Icon>
            <Icon class="kit-icon" v-html="Icon.TikTok"></Icon>
            <Icon class="kit-icon" v-html="Icon.Youtube"></Icon>
          </p>
        </div>
        <div class="rewards">
          <h4>{{ $t('referral.descriptionSpan') }}</h4>
          <span>{{ $t('referral.descriptionSpanSoon') }}</span>
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
  import { copyToClipboard } from '../../utils/copyToClipboard';
  import { showToast } from '../../utils/toastManager';

  import * as userApi from '../../api/userApi';

  import TelegramModule from '../../hooks/useTelegram';
  import GiftLottie from '../GiftLottie.vue';

  import Image_Stars from '@/assets/images/stars.png';
  import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';

  export default {
    props: {
      Skeleton: {
        type: Boolean,
        required: true,
      },
      SkeletonTime: {
        type: Number,
        required: true,
      }
    },

    components: {
      GiftLottie,
    },

    data() {
      return {
        storeCache: useCacheStore(),

        isLoading: this.Skeleton,

        referralsData: null,
        referralsOffset: 0,
        referralsLimit: 6,
        referralsIsFetchingMore: false,

        cleanString,
        
        checkPriceNumber,
        unixToRelative,
        getImageUrl,

        Icon,
        Image_Stars,
        Image_GiftBg,
      };
    },

    computed: {
      isLoading() {
        return this.Skeleton;
      },
      referralLink() {
        return import.meta.env.VITE_APP_MINI_APP_LINK + `=ref_${this.storeCache.UserData.referral_code}`;
      }
    },
  
    mounted() {
      this.loadResources();
      this.referralsOffset = 0;
      this.referralsData = [];
      this.fetchReferralsMoreIfNeeded();
      this.$watch(
        () => this.referralsData,
        () => {
          this.$nextTick(() => this.observeLastItem());
        },
        { deep: true }
      );
    },

    beforeUnmount() {
      if (this._observer) {
        this._observer.disconnect();
      }
    },

    methods: {
      async loadResources() {
        try {
          await Promise.all([this.loadFonts(), this.loadIcons()]);
          this.$emit("loadSuccess");
          this.observeLastItem();
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

      copyReferral() {
        copyToClipboard(this.referralLink);
        showToast('Link copied', 'success');
      },

      shareReferral() {
        const message = `The best app for meme gifts and NFTs ❤️`;
        TelegramModule.useShare(this.referralLink, message);
      },

      async getReferrals() {
        try {
          const referrals = await userApi.getReferrals(
            this.referralsOffset,
            this.referralsLimit
          );
          if (!referrals) return;
          this.referrals = referrals;
        } catch (error) {
          console.error("Ошибка при загрузке ресурсов:", error);
        }
      },

      observeLastItem() {
        this.$nextTick(() => {
          const refs = this.$refs.lastItem;
          const last = Array.isArray(refs) ? refs[refs.length - 1] : refs;
          if (!last) return;

          if (this._observer) {
            this._observer.disconnect();
          }

          this._observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting) {
                this.fetchMoreIfNeeded();
              }
            },
            { threshold: 1.0 }
          );

          this._observer.observe(last);
        });
      },

      async fetchReferralsMoreIfNeeded() {
        if (this.referralsIsFetchingMore) return;
        this.referralsIsFetchingMore = true;
        try {
          const more = await userApi.getReferrals(this.referralsOffset, this.referralsLimit);
          if (more.length) {
            const ids = new Set(this.referralsData.map(i => i.user_id));
            const unique = more.filter(i => !ids.has(i.user_id));
            this.referralsData.push(...unique);
            this.referralsOffset += this.referralsLimit;
          }
        } catch (err) {} finally {
          this.referralsIsFetchingMore = false;
        }
      },

      copyReferralId(id) {
        copyToClipboard(id);
        showToast('ID copied', 'success');
      },

      openReferralProfile(userId) {
        this.$router.push({
          name: 'view',
          params: {
            id: userId,
          }
        });
      },
    }
  };
  </script>