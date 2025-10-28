<template>
    <div class="_direction _comp _item _context">
        <div v-if="isLoading" class="_skeleton">
          <div class="_items">
            <div class="_item">
              <div class="_title"></div>
              <div class="_supply"></div>
            </div>
            <div class="_item">
              <div class="_descr"></div>
            </div>
            <div class="_item">
              <div class="_price">
                <div class="_image"></div>
                <div class="_amount"></div>
              </div>
            </div>
            <div class="_item _itemCalc">
              <div class="_calc"></div>
              <div class="_calcUse"></div>
              <div class="_calcUse"></div>
              <div class="_calcUse"></div>
            </div>
          </div>
        </div>
        <div v-else class="_content">
          <div class="_items">
            <div class="_item">
              <div class="_title">{{ NftName }}</div>
              <div
                v-if="NftSupply && NftSupplyMax"
                class="_supply"
                :class="{ _loading: NftSupply == null || NftSupplyMax == null }"
              >
                <p>{{ Math.max(NftSupply, 0) }} {{ $t(`app.supplySubmission`) }} {{ NftSupplyMax }}</p>
                <div class="load-icon"></div>
              </div>
              <div
                v-if="!NftSupply || !NftSupplyMax"
                class="_supply"
                :class="{ _loading: NftSupply == null || NftSupplyMax == null }"
              >
                <p>0 {{ $t(`app.supplySubmission`) }} {{ NftSupplyMax }}</p>
                <div class="load-icon"></div>
              </div>
              <div class="_rig">
                <div @click="useEmoji(NftCustomEmoji)">
                  <Icon class="kit-icon" v-html="Icon.Emoji"></Icon>
                </div>
                <div @click="useShareCollection()">
                  <Icon class="kit-icon" v-html="Icon.Reply"></Icon>
                </div>
              </div>
            </div>

            <div v-if="NftPrice" class="checker">
              <div class="_item">
                <div class="_price">
                  <div class="_image">
                    <img :src="Image_Stars" />
                  </div>
                  <div class="_amount">
                    <span>{{ checkPriceNumber(NftPrice) }}</span>
                  </div>
                </div>
              </div>

              <div v-if="NftSaleSupport" class="_item _itemUseTickets">
                <div class="_itemUseTicketsInner">
                  <div class="title">
                    <h4>Use</h4>
                  </div>
                  <div class="_taskContextTickets">
                    <img :src="Image_Ticket" alt="tickets" />
                    <p>{{ storeCache.UserData.user.Tickets }}</p>
                  </div>
                  <div 
                    class="switch"
                    :class="{
                      disabled: !isTicketsNotNull,
                      activated: isTicketsNotNull
                    }"
                  >
                    <label class="toggle-switch blue">
                        <input type="checkbox" @change="useTickets">
                        <span class="toggle-switch-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div v-if="!NftSaleSupport && !NftLocked" class="_item _itemUseTickets">
                <div class="_itemUseTicketsInner">
                  <div class="title">
                    <h4>{{ $t('collection.saleNotSupport') }}</h4>
                  </div>
                </div>
              </div>

              <div v-if="!NftLocked" class="_item _itemCalc">
                <div class="_calc">
                  <div @click="useBuyCountMinus(1)" class="_calc_minus">
                    <div class="kit-icon" v-html="Icon.Minus"></div>
                  </div>
                  <div class="_calc_value">
                    <p>{{ NftBuyCount }}</p>
                  </div>
                  <div @click="useBuyCountPlus(1)" class="_calc_plus">
                    <div class="kit-icon" v-html="Icon.Plus"></div>
                  </div>
                </div>
                <div @click="useBuyCountPlus(10)" class="_calcUse">
                  <p>+10</p>
                </div>
                <div @click="useBuyCountPlus(20)" class="_calcUse">
                  <p>+20</p>
                </div>
                <div @click="useBuyCountPlus(50)" class="_calcUse">
                  <p>+50</p>
                </div>
              </div>
            </div>

          </div>
        </div>
    </div>
  </template>
  
  <script>
  import { useCacheStore } from '../../stores/pinia/piniaStore';
  import { checkPriceNumber } from '../../utils/useGift';
  import { showToast } from '../../utils/toastManager';
  import { shootConfetti } from '../../utils/useConfetti';
  import { Icon } from '../Icon';

  import TelegramModule from '../../hooks/useTelegram';

  import Lottie from '../Lottie.vue';
  import Image_Ticket from '@/assets/images/ticket.svg';
  import Image_Stars from '@/assets/images/stars.png';

  import i18next from 'i18next';

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
      Description: {
        type: String,
        required: true,
      },
      NftName: {
        type: String,
        required: true,
      },
      NftSupply: {
        type: Number,
        required: true,
      },
      NftSupplyMax: {
        type: Number,
        required: true,
      },
      NftPrice: {
        type: Number,
        required: true,
      },
      NftBuyCount: {
        type: Number,
        required: true,
      },
      NftCustomEmoji: {
        type: String,
        required: true,
      },
      SupplyTranslate: {
        type: String,
        required: true,
      },
      NftSaleSupport: {
        type: Boolean,
        required: true,
      },
      NftLocked: {
        type: Boolean,
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

        Icon,
        checkPriceNumber,

        Image_Ticket,
        Image_Stars,
      };
    },
  
    mounted() {
      this.loadResources();
    },

    computed: {
      isLoading() {
        return this.Skeleton;
      },
      isTicketsNotNull() {
        return this.storeCache.UserData.user.Tickets > 0;
      },
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

      useBuyCountPlus(summary) {
        TelegramModule.useSoftHaptic();
        this.$emit("buyCountPlus", summary);
      },

      useBuyCountMinus(summary) {
        TelegramModule.useSoftHaptic();
        this.$emit("buyCountMinus", summary);
      },

      useTickets(event) {
          TelegramModule.useMediumHaptic();
          const isChecked = (event.target).checked;
          this.$emit("useTickets", isChecked ? this.storeCache.UserData.user.Tickets : 0);
      },

      useEmoji(emoji) {
        TelegramModule.useMediumHaptic();
        const setEmoji = TelegramModule.useSetEmoji(emoji)
          .then(async (val) => {
            shootConfetti();
          })
          .catch(() => {
          });
      },

      useShareCollection() {
        const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=cln_${this.NftName.replaceAll(' ', '')}`;
        const message = `Check out the "${this.NftName}" collection!`;
        TelegramModule.useShare(url, message);
      },
    }
  };
  </script>