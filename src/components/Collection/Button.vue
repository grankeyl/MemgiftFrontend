<template>
    <div class="_direction _comp _item _button">
        <div v-if="isLoading" class="_skeleton">
          <div class="_button">
            <div class="pgm-footer">
              <button class="pgm-footer__btn pgm-footer__btn--skel" disabled></button>
            </div>
          </div>
        </div>
        <div v-else class="_content">
          <div v-if="NftFree" class="checker">
            <div v-if="!isTermsCompleted && NftGetFree" class="_button">
              <div class="pgm-footer">
                <button
                  type="button"
                  class="pgm-footer__btn pgm-footer__btn--close"
                  disabled
                >
                  <span>{{ $t('collection.buttonConditions') }}</span>
                </button>
              </div>
            </div>
            <div v-if="isTermsCompleted && NftGetFree" class="_button">
              <div class="pgm-footer">
                <button
                  type="button"
                  class="pgm-footer__btn pgm-footer__btn--primary"
                  :class="{ _loading: isLoadingButton }"
                  :disabled="isLoadingButton"
                  @click="createNftFree"
                >
                  <span v-if="!isLoadingButton">{{ $t('collection.buttonGetFree') }}</span>
                  <Lottie v-else class="pgm-footer__spin" slug="loading-spin" :loop="true" width="26" height="26" renderer="svg" />
                </button>
              </div>
            </div>
            <div v-if="!NftGetFree" class="_button">
              <div class="pgm-footer">
                <button
                  type="button"
                  class="pgm-footer__btn pgm-footer__btn--primary"
                  :class="{ _loading: isLoadingButton }"
                  :disabled="isLoadingButton"
                  @click="goToStore()"
                >
                  <span v-if="!isLoadingButton">{{ $t('collection.buttonGoToStore') }}</span>
                  <Lottie v-else class="pgm-footer__spin" slug="loading-spin" :loop="true" width="26" height="26" renderer="svg" />
                </button>
              </div>
            </div>
          </div>

          <div v-if="!NftFree" class="checker">
            <div v-if="NftData?.nftSupplyCurrent && NftData?.nftSupplyCurrent > 0" class="_button">
              <div class="pgm-footer">
                <div class="pgm-footer__qty">
                  <button
                    type="button"
                    class="pgm-footer__qty-btn"
                    :disabled="NftBuyCount <= 1"
                    @click="onMinus"
                    aria-label="minus"
                  >
                    <span class="kit-icon" v-html="Icon.Minus"></span>
                  </button>
                  <span class="pgm-footer__qty-value">{{ NftBuyCount }}</span>
                  <button
                    type="button"
                    class="pgm-footer__qty-btn"
                    :disabled="isPlusBlocked"
                    @click="onPlus"
                    aria-label="plus"
                  >
                    <span class="kit-icon" v-html="Icon.Plus"></span>
                  </button>
                </div>
                <button
                  type="button"
                  class="pgm-footer__btn"
                  :class="[isMaxAmount ? 'pgm-footer__btn--close' : 'pgm-footer__btn--primary', { _loading: isLoadingButton }]"
                  :disabled="isLoadingButton || isMaxAmount"
                  @click="useButton"
                >
                  <template v-if="isLoadingButton">
                    <Lottie class="pgm-footer__spin" slug="loading-spin" :loop="true" width="26" height="26" renderer="svg" />
                  </template>
                  <template v-else-if="isMaxAmount">
                    <span>{{ $t('collection.buttonMaxAmount') }}</span>
                  </template>
                  <template v-else>
                    <span class="pgm-footer__title">{{ $t('collection.buttonBuy1') }}</span>
                    <span class="pgm-footer__price">
                      <img :src="Image_StarsWhite" alt="stars" />
                      <span>{{ buyGiftCount }}</span>
                    </span>
                  </template>
                </button>
              </div>
            </div>

            <div v-if="!NftData?.nftSupplyCurrent || NftData?.nftSupplyCurrent <= 0" class="_button">
              <div class="pgm-footer">
                <button
                  type="button"
                  class="pgm-footer__btn pgm-footer__btn--primary"
                  :class="{ _loading: isLoadingButton }"
                  :disabled="isLoadingButton"
                  @click="goToStore()"
                >
                  <span v-if="!isLoadingButton">{{ $t('collection.buttonGoToStore') }}</span>
                  <Lottie v-else class="pgm-footer__spin" slug="loading-spin" :loop="true" width="26" height="26" renderer="svg" />
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  </template>
  
<script>
  import { createInvoiceNft, createInvoiceNftToken } from '../../api/invoiceApi';
  import { useCacheStore } from '../../stores/pinia/piniaStore';

  import * as nftApi from '../../api/nftApi';
  import * as tokenApi from '../../api/tokenApi';

  import TelegramModule from '../../hooks/useTelegram';
  import Lottie from '../Lottie.vue';
  import { Icon } from '../Icon';

  import Image_StarsWhite from '@/assets/images/stars-white.png';

  // потолок суммы одного счёта в Telegram Stars
  const STARS_LIMIT = 100000;


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
      NftUniqueKey: {
        type: String,
        required: true,
      },
      NftData: {
        type: Object,
        required: true,
      },
      NftBuyCount: {
        type: Number,
        required: true,
      },
      NftPriceCurrent: {
        type: Number,
        required: true,
      },
      NftFree: {
        type: Boolean,
        required: true,
      },
      NftKey: {
        type: String,
        required: false,
        default: '',
      },
      Terms: {
        type: Object,
        required: true,
      },
    },

    components: {
      Lottie
    },
  
    data() {
      return {
        storeCache: useCacheStore(),
        isLoading: this.Skeleton,

        NftGetFree: false,

        isLoadingButton: false,

        Icon,
        Image_StarsWhite,
      };
    },
  
    mounted() {
      this.loadResources();

      this.$nextTick(() => this.checkNftFree());
      this.$watch(() => this.$props.NftData, () => {
        this.$props.NftData = this.NftData;
      });
    },

    computed: {
      isScooby() {
        return this.NftKey === 'nft_scooby';
      },
      isTermsCompleted() {
        if (this.isScooby) {
          return this.Terms.VpnSubscription && this.Terms.ShareChats;
        }
        return this.Terms.InviteFriends && this.Terms.ShareChats && this.Terms.SubscribedChannel;
      },
      // лимит Telegram Stars на один счёт
      isMaxAmount() {
        return Number(this.NftData?.nftPriceCurrent) > STARS_LIMIT;
      },

      // не даём перешагнуть лимит: следующий шаг увёл бы сумму выше потолка
      isPlusBlocked() {
        const unit = Number(this.NftData?.Price) || 0;
        const current = Number(this.NftData?.nftPriceCurrent) || 0;
        if (!unit) return this.isMaxAmount;
        return current + unit > STARS_LIMIT;
      },

      isLoading() {
        return this.Skeleton;
      },

      NftPriceCurrent() {
        return this.NftData?.nftPriceCurrent;
      },

      buyGiftCount() {
        return this.NftData?.nftPriceCurrent;
      }
    },

    methods: {
      onPlus() {
        TelegramModule.useSoftHaptic();
        this.$emit('buyCountPlus', 1);
      },
      onMinus() {
        TelegramModule.useSoftHaptic();
        this.$emit('buyCountMinus', 1);
      },
      async loadResources() {
        try {
          await Promise.all([this.loadFonts(), this.loadIcons()]);
          this.isLoading = false;
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

      checkToNullTokenBuy() {
        return this.NftData?.nftPriceCurrent <= 0;
      },

      async useButtonToken() {
        if (this.isLoadingButton) return;
        this.isLoadingButton = true;

        const finalPrice = this.NftData?.nftPriceCurrent;

        const token = await tokenApi.createTokenStars(
          this.storeCache.TelegramData.user.id,
          this.NftUniqueKey, 
          finalPrice,
          this.$props.NftBuyCount
        );
        if (!token) return;

        const invoice = await createInvoiceNftToken(
          this.storeCache.TelegramData.user.id,
          this.NftUniqueKey, 
          finalPrice,
          this.NftData.nftUniqueKey,
          this.$props.NftBuyCount,
          token,
          false,
          0
        );
        if (!invoice) return;

        const initData = TelegramModule.initData();
        if (!initData) return;

        if (invoice) {
          this.isLoadingButton = false;
          this.$router.push({ 
            name: 'receive', 
            params: { 
              nft: this.nftUniqueKey, 
              nftType: 'purchased'
            }
          });
        } else {
          this.isLoadingButton = false;
        }
      },

      async useButton() {
        if (this.isLoadingButton || this.isMaxAmount) return;
        this.isLoadingButton = true;
        TelegramModule.useSoftHaptic();

        const invoice = await createInvoiceNft(
          this.NftUniqueKey,
          this.$props.NftBuyCount,
          0
        );

        // раньше эти выходы не снимали загрузку — кнопка залипала навсегда
        if (!invoice) {
          this.isLoadingButton = false;
          return;
        }

        const initData = TelegramModule.initData();
        if (!initData) {
          this.isLoadingButton = false;
          return;
        }

        if (!invoice.link && invoice.Status === 'success') {
          this.isLoadingButton = false;
          this.$router.push({
            name: 'receive',
            params: {
              nft: invoice.UKey,
              nftType: 'purchased'
            }
          });
          return;
        }

        if (invoice.link) {
          TelegramModule.useInvoice(
            invoice.link,
            () => {
              this.isLoadingButton = false;
              this.$router.push({
                name: 'receive',
                params: {
                  nft: this.NftUniqueKey,
                  nftType: 'purchased'
                }
              });
            },
            () => {
              this.isLoadingButton = false;
            }
          );
          return;
        }

        this.isLoadingButton = false;
      },

      async goToStore() {
        this.$router.push('/');
      },

      async checkNftFree() {
        if (!this.$props.NftData) return;
        const checkFn = this.isScooby ? nftApi.checkFreeScooby : nftApi.checkFree;
        const checkNftFree = await checkFn();
        if (checkNftFree.ok && !checkNftFree.claimed) {
          this.NftGetFree = true;
          this.$emit('checkNftFree', true, this.Terms);
          return;
        }

        this.NftGetFree = false;
        this.$emit('checkNftFree', false, this.Terms);
      },

      async createNftFree() {
        const claimFn = this.isScooby ? nftApi.giftFreeScooby : nftApi.giftFree;
        const result = await claimFn();
        if (result) {
          this.isLoadingButton = false;
          this.$router.push({
            name: 'receive',
            params: {
              nft: this.NftUniqueKey,
              nftType: 'purchased'
            }
          });
        }
      },

      buyStars() {
        const link = "https://t.me/MemGiftStarBot"
        TelegramModule.useLink(link);
      }
    },
  };
  </script>
