<template>
    <div v-if="ButtonType === 'sended'" class="_direction _comp _item _button">
        <div v-if="isLoading" class="_skeleton">
          <div class="_button">
            <button></button>
          </div>
        </div>
        <div v-else class="_content">
          <div class="_button" @click="useButton">
            <button @click="openProfile" :class="{ _loading: isLoadingButtonSended }">
              <h4>{{ $t('receive.okButton') }}</h4>
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

    <div v-if="ButtonType === 'purchased'" class="_direction _comp _item _button">
        <div v-if="isLoading" class="_skeleton">
          <div class="_button">
            <button></button>
            <button></button>
          </div>
        </div>
        <div v-else class="_content">
          <div class="_button" @click="useButton">
            <button @click="openProfile" class="default" :class="{ _loading: isLoadingButtonPurchasedOpenProfile }">
              <h4>{{ $t('receive.openProfile') }}</h4>
              <Lottie 
                class="lt" 
                slug="loading-spin" 
                :loop="true"
                width="75"
                height="75"
                renderer="svg"
              />
            </button>
            <!-- <button 
              v-if="!isDeletedButtonPurchasedChooseRecipient"
              @click="chooseRecipient" 
              :class="{ _loading: isLoadingButtonPurchasedChooseRecipient }"
            >
              <h4>{{ $t('receive.chooseRecipient') }}</h4>
              <Lottie 
                class="lt" 
                slug="loading-spin" 
                :loop="true"
                width="75"
                height="75"
                renderer="svg"
              />
            </button> -->
          </div>
        </div>
    </div>

    <div v-if="ButtonType === 'received'" class="_direction _comp _item _button">
        <div v-if="isLoading" class="_skeleton">
          <div class="_button">
            <button></button>
          </div>
        </div>
        <div v-else class="_content">
          <div class="_button" @click="useButton">
            <button 
              @click="openProfile" 
              :class="{ _loading: isLoadingButtonReceived }"
            >
              <h4>{{ $t('receive.openProfile') }}</h4>
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

    <div v-if="ButtonType === 'notfound'" class="_direction _comp _item _button">
        <div v-if="isLoading" class="_skeleton">
          <div class="_button">
            <button></button>
          </div>
        </div>
        <div v-else class="_content">
          <div class="_button" @click="useButton">
            <button @click="openShop" :class="{ _loading: isLoadingButtonNotfound }">
              <h4>{{ $t('receive.openShop') }}</h4>
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

    <div v-if="ButtonType === 'selfed'" class="_direction _comp _item _button">
        <div v-if="isLoading" class="_skeleton">
          <div class="_button">
            <button></button>
          </div>
        </div>
        <div v-else class="_content">
          <div class="_button" @click="useButton">
            <button @click="openShop" :class="{ _loading: isLoadingButtonNotfound }">
              <h4>{{ $t('receive.openShop') }}</h4>
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

  </template>
  
<script>
  import * as nftApi from '../../api/nftApi'
  import * as telegramApi from '../../api/telegramApi'
  import { createInvoiceNft } from '../../api/invoiceApi';
  import { useCacheStore } from '../../stores/pinia/piniaStore';

  import TelegramModule from '../../hooks/useTelegram';
  import Lottie from '../Lottie.vue';

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