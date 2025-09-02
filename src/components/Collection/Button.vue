<template>
    <div class="_direction _comp _item _button">
        <div v-if="isLoading" class="_skeleton">
          <div class="_button">
            <button></button>
          </div>
        </div>
        <div v-else class="_content">
          <div v-if="NftFree" class="checker">
            <div v-if="!isTermsCompleted && NftGetFree" class="_button">
              <button :class="{ _loading: isLoadingButton }" style="opacity: .3; pointer-events: none;">
                <h4>{{ $t('collection.buttonConditions') }}</h4>
              </button>
            </div>
            <div v-if="isTermsCompleted && NftGetFree" class="_button">
              <button @click="createNftFree" :class="{ _loading: isLoadingButton }">
                <h4>{{ $t('collection.buttonGetFree') }}</h4>
              </button>
            </div>
            <div v-if="!NftGetFree" class="_button">
              <button @click="goToStore()" :class="{ _loading: isLoadingButton }">
                <h4>{{ $t('collection.buttonGoToStore') }}</h4>
              </button>
            </div>
          </div>

          <div v-if="!NftFree" class="checker">
            <div v-if="NftData?.nftSupplyCurrent && NftData?.nftSupplyCurrent > 0" class="_button">
              <button v-if="!isMaxAmount" :class="{ _loading: isLoadingButton }" @click="useButton()">
                <h4>{{ $t('collection.buttonBuy1') }} {{ NftBuyCount }} {{ $t('collection.buttonBuy2') }}</h4>

                <img src="/src/assets/images/stars-white.png" alt="stars" />

                <p>{{ buyGiftCount }}</p>

                <Lottie 
                  class="lt" 
                  slug="loading-spin" 
                  :loop="true"
                  width="75"
                  height="75"
                  renderer="svg"
                />
                
                <div v-if="isTicketsNotNull" class="saleBlock">
                  <h4>- {{ useTicketsCount }}</h4>
                </div>
              </button>
            </div>
            <div v-if="!NftData?.nftSupplyCurrent || NftData?.nftSupplyCurrent <= 0" class="_button">
              <button @click="goToStore()" :class="{ _loading: isLoadingButton }">
                <h4>{{ $t('collection.buttonGoToStore') }}</h4>
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
            <div v-if="isMaxAmount" class="_button">
              <button :class="{ _loading: isLoadingButton }" style="opacity: .3; pointer-events: none;">
                <h4>{{ $t('collection.buttonMaxAmount') }}</h4>
              </button>
            </div>
          </div>
        </div>
    </div>
  </template>
  
<script>
  import { createInvoiceNft, createInvoiceNftToken } from '../../api/invoiceApi';
  import { useCacheStore } from '../../stores/pinia/piniaStore';
  import { usePostHog } from '../../hooks/usePostHog';

  import * as nftApi from '../../api/nftApi';
  import * as tokenApi from '../../api/tokenApi';

  import TelegramModule from '../../hooks/useTelegram';
  import Lottie from '../Lottie.vue';
  
  const { posthog } = usePostHog()

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
      Terms: {
        type: Object,
        required: true,
      },
      isUseTickets: {
        type: Boolean,
        required: true,
      },
      useTicketsCount: {
        type: Number,
        required: true,
      }
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
        return this.Terms.InviteFriends && this.Terms.ShareChats && this.Terms.SubscribedChannel;
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

      isTicketsNotNull() {
        return this.useTicketsCount > 0;
      },

      useTicketsCount() {
        return Math.max(0, Math.min(this.NftData?.nftPriceCurrent, this.useTicketsCount));
      },

      buyGiftCount() {
        if (this.isUseTickets) {
          const tickets = Math.max(1, Math.min(this.NftData?.nftPriceCurrent, this.useTicketsCount));
          const total = Math.max(0, this.NftData?.nftPriceCurrent) - tickets;
          
          return total;
        }

        return this.NftData?.nftPriceCurrent;
      }
    },

    methods: {
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
        if (this.isUseTickets) {
          const tickets = Math.max(1, Math.min(this.NftData?.nftPriceCurrent, this.useTicketsCount));
          const total = Math.max(0, this.NftData?.nftPriceCurrent) - tickets;
          
          return total <= 0;
        }

        return this.NftData?.nftPriceCurrent <= 0;
      },

      async useButtonToken() {
        if (this.isLoadingButton) return;
        this.isLoadingButton = true;

        const finalTickets = this.initTicketsCount();
        const finalPrice = this.initNftPrice();

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
          this.isUseTickets,
          finalTickets
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

        const finalTickets = this.initTicketsCount();
        const finalPrice = this.NftData?.nftPriceCurrent;

        const invoice = await createInvoiceNft(
          this.NftUniqueKey, 
          this.$props.NftBuyCount,
          finalTickets
        );
        if (!invoice) return;

        const initData = TelegramModule.initData();
        if (!initData) return;

        console.log(invoice);

        posthog.capture(`Attempted purchase ${finalPrice} ⭐`, { 
          nft: this.NftUniqueKey, 
          amount: finalPrice, 
          count: this.$props.NftBuyCount 
        })

        if (!invoice.link && invoice.Status === 'success') {
          this.storeCache.UserData.user.Tickets -= invoice.TicketsOut;
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
              posthog.capture(`Purchased NFT ${finalPrice} ⭐`, { nft: this.NftUniqueKey, amount: finalPrice, count: this.$props.NftBuyCount })
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

      initTicketsCount() {
        return Math.max(0, Math.min(this.NftData?.nftPriceCurrent, this.useTicketsCount));
      },

      initNftPrice() {
        if (this.isUseTickets) {
          const tickets = Math.max(1, Math.min(this.NftData?.nftPriceCurrent, this.useTicketsCount));
          const total = Math.max(0, this.NftData?.nftPriceCurrent) - tickets;

          return total;
        }

        return this.NftData?.nftPriceCurrent;
      },

      async checkNftFree() {
        if (!this.$props.NftData) return;
        const NftData = this.$props.NftData;
        const checkNftFree = await nftApi.checkFree();
        console.log(checkNftFree);
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
        console.log(createNftFree);
        if (createNftFree) {
          posthog.capture(`Get free NFT`, { nft: this.NftUniqueKey })
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