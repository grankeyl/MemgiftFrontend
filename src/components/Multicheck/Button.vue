<template>
  <div class="_direction _comp _item _multicheckButton" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_blockButton">
          <button>
          </button>
          <button>
          </button>
        </div>
      </div>
      <div v-else class="_content">
        <div class="_blockButton">
          <button @click="openStore" class="_noprimary">
            <img :src="Image_Stars" alt="">
            <h4>{{ $t('multicheck.buyMoreGifts') }}</h4>
          </button>
          <button 
            v-if="CompDataGift.nftCount > 1"
            @click="createMulticheck()"
            class="_primary"
            :class="{ _loading: isLoadingCreateButton }"
          >
            <h4>{{ $t('multicheck.createMulticheck') }} (x{{ CompDataGift.nftCount }} {{ CompDataGift.nftName }})</h4>
            <Lottie 
              class="lt" 
              slug="loading-spin" 
              :loop="true"
              width="75"
              height="75"
              renderer="svg"
            />
          </button>
          <button 
            v-if="CompDataGift.nftCount === 1"
            class="_opacity"
          >
            <h4>{{ $t('multicheck.atLeastGifts') }}</h4>
          </button>
          <button 
            v-if="CompDataGift.nftCount === 0"
            class="_opacity"
          >
            <h4>{{ $t('multicheck.chooseNumberGifts') }}</h4>
          </button>
        </div>
      </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';

import * as multicheckApi from '../../api/multicheckApi';
import * as telegramApi from '../../api/telegramApi';

import TelegramModule from '../../hooks/useTelegram';
import Lottie from '../Lottie.vue';

import Image_Stars from '@/assets/images/stars.png';

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
    CompDataGift: {
      type: Object,
      required: true,
    }
  },

  components: {
    Lottie,
  },

  data() {
    return {
      storeCache: useCacheStore(),

      isLoading: this.$props.Skeleton,
      isLoadingCreateButton: false,

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
        Image_Stars,
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

    openStore() {
      this.$router.push('/');
    },
    
    openReceive(nft, nftType, checkType) {
      let name = 'receive';

      if (checkType === 'check') { name = 'receive' }
      if (checkType === 'multicheck') { name = 'activate-multicheck' }

      this.$router.push({
        name: name,
        params: {
          nft: nft,
          nftType: nftType
        }
      });
    },

    createMulticheck() {
      if (this.isLoadingCreateButton) return;
      if (!this.CompDataGift.nftCount) return;
      this.isLoadingCreateButton = true;

      const userId = this.storeCache.TelegramData.user.id;
      const nftUniqueKey = this.CompDataGift.nftUniqueKey;
      const nftsIds = [...this.CompDataGift.nftIds];
      const nftsCount = this.CompDataGift.nftCount;

      multicheckApi.create(userId, nftUniqueKey, nftsIds, nftsCount).then(async (data) => {
        await this.chooseRecipient(data.uuid);
      });
    },

    async chooseRecipient(multicheckUuid) {
      TelegramModule.useMediumHaptic();

      const preparedMessage = await telegramApi.createPrepareMulticheckMessage(
        this.storeCache.TelegramData.user.id,
        this.CompDataGift.nftUniqueKey,
        multicheckUuid,
        this.CompDataGift.nftCount
      );
      if (!preparedMessage) return;

      this.storeCache.UserData.sendedGiftsCount += parseInt(preparedMessage.sendedGiftsCount);

      TelegramModule.useShareMessage(preparedMessage.prepareMessage.id)
        .then(async (sharedMessage) => {
          this.isLoadingCreateButton = false;
          this.openReceive(this.CompDataGift.nftUniqueKey, 'sended', 'multicheck');
        })
        .catch(() => {
          this.isLoadingCreateButton = false;
        });
    },
  },
};
</script>