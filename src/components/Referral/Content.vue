<template>
  <div 
    class="_direction _comp _item _referral"
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
        <div class="_section">
          <div class="_blocker">
            <div class="_link" @click="copyReferral">
              <p>{{ referralLink }}</p>
              <Icon class="kit-icon" v-html="Icon.Copy"></Icon>
            </div>
            <div class="_buttons">
              <button @click="shareReferral">
                <h4>{{ $t('referral.share') }}</h4>
              </button>
            </div>
          </div>
        </div>
        <div class="_section">
          <div class="_title">
            <div class="_h">
              <h4>{{ $t('referral.referrals') }}</h4>
            </div>
            <div class="_span">
              <span>{{ storeCache.UserData.RefCount }}</span>
            </div>
          </div>
          <div v-if="referralsData?.length > 0" class="_referrals">
            <div 
              v-for="(referral, index) in referralsData"
              :key="referral.tld"
              class="_referral"
            >
              <div class="_avatar">
                <img 
                  v-if="referral.photo"
                  :src="referral.photo" 
                  alt="avatar" 
                />
                <div v-else class="avatar_null">
                  <h4>{{ referral.name[0] }}</h4>
                </div>
              </div>
              <div class="_info" @click="copyReferralId(referral.tld)">
                <div class="_name">
                  <h4>{{ referral.name }}</h4>
                </div>
                <div class="_descr">
                  <p>{{ referral.tld }}</p>
                  <Icon class="kit-icon" v-html="Icon.Copy"></Icon>
                </div>
              </div>
              <div class="_count" @click="openReferralProfile(referral.tld)">
                <p>{{ $t('referral.view') }}</p>
                <Icon class="kit-icon" v-html="Icon.ChevroneRight"></Icon>
              </div>
            </div>
          </div>
          <div v-else class="_referralsNull">
            <div class="_left">
              <h4>{{ $t('referral.noReferrals.title') }}</h4>
              <p>{{ $t('referral.noReferrals.descr') }}</p>
            </div>
            <div class="_right">
              <button @click="shareReferral">
                <h4>{{ $t('referral.noReferrals.button') }}</h4>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Invisible observer ref -->
      <div
        v-if="referralsData?.length"
        :ref="'lastItem'"
        style="height: 1px"
      ></div>
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
        referralsLimit: 15,
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
        return import.meta.env.VITE_APP_MINI_APP_LINK + `=ref_${this.storeCache.UserData.user.Code}`;
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
          this.referrals = referrals.items;
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
                this.fetchReferralsMoreIfNeeded();
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
          const { items = [] } = await userApi.getReferrals(this.referralsOffset, this.referralsLimit);
          if (items.length) {
            const ids = new Set(this.referralsData.map(i => i.tld));
            const unique = items.filter(i => !ids.has(i.tld));
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