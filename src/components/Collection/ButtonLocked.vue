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
          <div class="checker">
            <div v-if="!isTermsCompleted" class="_button">
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
            <div v-if="isTermsCompleted" class="_button">
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
                    @click="onPlus"
                    aria-label="plus"
                  >
                    <span class="kit-icon" v-html="Icon.Plus"></span>
                  </button>
                </div>
                <button
                  type="button"
                  class="pgm-footer__btn pgm-footer__btn--primary"
                  :class="{ _loading: isLoadingButton }"
                  :disabled="isLoadingButton"
                  @click="useButton()"
                >
                  <template v-if="!isLoadingButton">
                    <span class="pgm-footer__title">{{ $t('collection.buttonBuy1') }}</span>
                    <span class="pgm-footer__price">
                      <img :src="Image_StarsWhite" alt="stars" />
                      <span>{{ buyGiftCount }}</span>
                    </span>
                  </template>
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
      isTermsCompleted() {
        return this.Terms.all_success;
      },
      isMaxAmount() {
        if (this.NftData?.nftPriceCurrent > 100000) {
          return true;
        }
        return false;
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
        if (this.isLoadingButton) return;
        this.isLoadingButton = true;

        const finalPrice = this.NftData?.nftPriceCurrent;

        const invoice = await createInvoiceNft(
          this.NftUniqueKey, 
          this.$props.NftBuyCount,
          0
        );
        if (!invoice) return;

        const initData = TelegramModule.initData();
        if (!initData) return;

        if (!invoice.link && invoice.Status === 'success') {
          this.$router.push({ 
            name: 'receive', 
            params: { 
              nft: invoice.UKey, 
              nftType: 'purchased'
            }
          });
        }

        if (invoice.link) {
          TelegramModule.useInvoice(
            invoice.link, 
            () => {
              this.isLoadingButton = false;
              this.$router.push({ 
                name: 'receive', 
                params: { 
                  nft: this.nftUniqueKey, 
                  nftType: 'purchased'
                }
              });
            }, 
            () => {
              this.isLoadingButton = false;
            }
          );
        }
      },

      async goToStore() {
        this.$router.push('/');
      },

      async checkNftFree() {
        if (!this.$props.NftData) return;
        const NftData = this.$props.NftData;
        const checkNftFree = await nftApi.checkFree();
        if (checkNftFree.ok && !checkNftFree.claimed) {
          this.NftGetFree = true;
          this.$emit('checkNftFree', true, this.Terms);
          return;
        }

        this.NftGetFree = false;
        this.$emit('checkNftFree', false, this.Terms);
      },

      async createNftFree() {
        const createNftFree = await nftApi.giftFree();
        if (createNftFree) {
          this.isLoadingButton = false;
          this.$router.push({ 
            name: 'receive', 
            params: { 
              nft: this.nftUniqueKey, 
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
