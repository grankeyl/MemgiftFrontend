<template>
    <div v-if="ButtonType === 'sended'" class="_direction _comp _item _button">
        <div v-if="isLoading" class="_skeleton">
          <div class="_button">
            <div class="pgm-footer">
              <div class="pgm-footer__btn rcv-btn-skel"></div>
            </div>
          </div>
        </div>
        <div v-else class="_content">
          <div class="_button">
            <div class="pgm-footer">
              <button type="button" class="pgm-footer__btn pgm-footer__btn--close" @click="openProfile">
                <span>{{ $t('receive.okButton') }}</span>
              </button>
            </div>
          </div>
        </div>
    </div>

    <div v-if="ButtonType === 'purchased'" class="_direction _comp _item _button">
        <div v-if="isLoading" class="_skeleton">
          <div class="_button">
            <div class="pgm-footer">
              <div class="pgm-footer__btn rcv-btn-skel"></div>
              <div class="pgm-footer__btn rcv-btn-skel rcv-share"></div>
            </div>
          </div>
        </div>
        <div v-else class="_content">
          <div class="_button">
            <!-- та же кнопка, что «Ок» в модалке подарка на чужом профиле -->
            <div class="pgm-footer">
              <button type="button" class="pgm-footer__btn pgm-footer__btn--close" @click="openProfile">
                <span>{{ $t('receive.openProfile') }}</span>
              </button>
              <button
                type="button"
                class="pgm-footer__btn pgm-footer__btn--close rcv-share"
                :aria-label="$t('receive.shareGift')"
                @click="$emit('shareGift')"
              >
                <span class="kit-icon" v-html="Icon.ShareFill"></span>
              </button>
            </div>
          </div>
        </div>
    </div>

    <div v-if="ButtonType === 'received'" class="_direction _comp _item _button">
        <div v-if="isLoading" class="_skeleton">
          <div class="_button">
            <div class="pgm-footer">
              <div class="pgm-footer__btn rcv-btn-skel"></div>
              <div class="pgm-footer__btn rcv-btn-skel rcv-share"></div>
            </div>
          </div>
        </div>
        <div v-else class="_content">
          <div class="_button">
            <div class="pgm-footer">
              <button type="button" class="pgm-footer__btn pgm-footer__btn--close" @click="openProfile">
                <span>{{ $t('receive.openProfile') }}</span>
              </button>
              <button
                type="button"
                class="pgm-footer__btn pgm-footer__btn--close rcv-share"
                :aria-label="$t('receive.shareGift')"
                @click="$emit('shareGift')"
              >
                <span class="kit-icon" v-html="Icon.ShareFill"></span>
              </button>
            </div>
          </div>
        </div>
    </div>

    <div v-if="ButtonType === 'notfound'" class="_direction _comp _item _button">
        <div v-if="isLoading" class="_skeleton">
          <div class="_button">
            <div class="pgm-footer">
              <div class="pgm-footer__btn rcv-btn-skel"></div>
            </div>
          </div>
        </div>
        <div v-else class="_content">
          <div class="_button">
            <div class="pgm-footer">
              <button type="button" class="pgm-footer__btn pgm-footer__btn--close" @click="openShop">
                <span>{{ $t('receive.openShop') }}</span>
              </button>
            </div>
          </div>
        </div>
    </div>

    <div v-if="ButtonType === 'selfed'" class="_direction _comp _item _button">
        <div v-if="isLoading" class="_skeleton">
          <div class="_button">
            <div class="pgm-footer">
              <div class="pgm-footer__btn rcv-btn-skel"></div>
            </div>
          </div>
        </div>
        <div v-else class="_content">
          <div class="_button">
            <div class="pgm-footer">
              <button type="button" class="pgm-footer__btn pgm-footer__btn--close" @click="openShop">
                <span>{{ $t('receive.openShop') }}</span>
              </button>
            </div>
          </div>
        </div>
    </div>

  </template>
  
<script>
  import * as nftApi from '../../api/nftApi'
  import * as telegramApi from '../../api/telegramApi'
  import { createInvoiceNft } from '../../api/invoiceApi';
  import { useCacheStore } from '../../stores/pinia/piniaStore';

  import TelegramModule from '../../hooks/useTelegram';
  import Lottie from '../Lottie.vue';
  import { Icon } from '../Icon';

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
      ButtonType: {
        type: String,
        required: true,
      },
      NftUniqueKey: {
        type: String,
        required: true,
      },
      NftPrice: {
        type: Number,
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

        isLoadingButton: false,
        isLoadingButtonSended: false,
        Icon,
        isLoadingButtonPurchasedOpenProfile: false,
        isLoadingButtonPurchasedChooseRecipient: false,
        isDeletedButtonPurchasedChooseRecipient: false,
        isLoadingButtonReceived: false,
        isLoadingButtonNotfound: false,
      };
    },
  
    mounted() {
      this.loadResources();
    },

    computed: {
      isLoading() {
        return this.Skeleton;
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

      openProfile() {
        if (this.$props.ButtonType === 'received') {
          this.$router.push({ 
            name: 'profile', 
            hash: '#received' 
          });
        }

        if (this.$props.ButtonType === 'purchased') {
          this.$router.push({ 
            name: 'profile', 
            hash: '#purchased' 
          });
        }
      },

      openShop() {
        this.$router.push('/');
      },

      async useButton() {
        if (this.isLoadingButton) return;
        this.isLoadingButton = true;
      },

      async chooseRecipient() {
        if (this.isLoadingButtonPurchasedChooseRecipient) return;
        this.isLoadingButtonPurchasedChooseRecipient = true;

        const getLastGift = await nftApi.getLast(this.storeCache.userId);
        if (!getLastGift) return;

        TelegramModule.useMediumHaptic();

        const preparedMessage = await telegramApi.createPrepareMessage(
          this.storeCache.TelegramData.user.id,
          getLastGift[0].nft_unique_key,
          getLastGift[0].uuid
        );
        if (!preparedMessage) return;

        TelegramModule.useShareMessage(preparedMessage.id)
          .then(async (sharedMessage) => {
            await nftApi.updateStatusSended(this.storeCache.TelegramData.user.id, getLastGift[0].id);
            this.isLoadingButtonPurchasedChooseRecipient = false;
            this.isDeletedButtonPurchasedChooseRecipient = true;
          })
          .catch(() => {
            this.isLoadingButtonPurchasedChooseRecipient = false;
          });
      },
    },
  };
  </script>

<style lang="sass" scoped>
@use "../Profile/ProfileGiftModal.sass"
@use "@/assets/styles/_variables" as *

// collection/_comp.sass глобально красит .pgm-footer__btn--close плоским #252528
// цепочкой (0,5,0) — перебиваем её здесь, чтобы кнопка была материалом модалки
._comp._item._button ._content ._button
    .pgm-footer__btn--close
        background: $app-background-secondary-2
        box-shadow: $app-glass-shadow
        -webkit-box-shadow: $app-glass-shadow

    .pgm-footer__btn--close.rcv-share,
    .rcv-btn-skel.rcv-share
        flex: 0 0 56px
        width: 56px
        padding: 0 !important
        border-radius: 50% !important

        .kit-icon
            display: flex
            align-items: center
            justify-content: center

            :deep(svg)
                width: 22px
                height: 22px

            :deep(path)
                fill: $app-text-color

    .rcv-btn-skel
        pointer-events: none
        background: $app-background-secondary
        background-image: linear-gradient(90deg, $app-background-secondary 25%, rgba($app-text-color, .06) 50%, $app-background-secondary 75%)
        background-size: 200% 100%
        animation: shimmer 1.8s ease-in-out infinite
</style>
