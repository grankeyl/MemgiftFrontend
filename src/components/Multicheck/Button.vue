<template>
  <div class="_direction _comp _item _multicheckButton" :class="Key">
      <div v-if="isLoading" class="_skeleton">
        <div class="_blockButton">
          <button></button>
        </div>
      </div>
      <div v-else class="_content">
        <div class="_blockButton">

          <div v-if="CompDataGift.nftCount >= 2" class="mc-btn-info">
            <div class="mc-btn-info__row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>{{ CompDataGift.nftCount }} {{ $t('multicheck.giftsSelected').toLowerCase() }}</span>
            </div>
            <div v-if="isPaidFlow" class="mc-btn-info__row mc-btn-info__row--accent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>{{ $t('multicheck.costLabel') }} {{ CompDataGift.nftCount * 5 }} Stars</span>
            </div>
            <div v-else class="mc-btn-info__row mc-btn-info__row--free">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>{{ $t('multicheck.freeToSend') }}</span>
            </div>
          </div>

          <div v-else class="mc-btn-hint">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <span>{{ $t('multicheck.hintOneLinkSend') }}</span>
          </div>

          <button 
            v-if="CompDataGift.nftCount >= 2"
            @click="createMulticheck()"
            class="_primary"
            :class="{ _loading: isLoadingCreateButton }"
          >
            <h4>
              {{ $t('multicheck.createMulticheck') }} (x{{ CompDataGift.nftCount }})
            </h4>
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

    };
  },

  computed: {
    isPaidFlow() {
      return this.CompDataGift.tab === 'received';
    },
  },

  mounted() {
    this.loadResources();
  },
  
  methods: {
    async loadResources() {
      try {
        await document.fonts.ready;
        this.isLoading = false;
        this.$emit("loadSuccess");
      } catch (error) {
        this.isLoading = false;
        this.$emit("loadSuccess");
      }
    },

    openReceive(nft, nftType) {
      this.$router.push({
        name: 'activate-multicheck',
        params: {
          nft: nft,
          nftType: nftType
        }
      });
    },

    async createMulticheck() {
      if (this.isLoadingCreateButton) return;
      if (!this.CompDataGift.nftCount || this.CompDataGift.nftCount < 2) return;
      this.isLoadingCreateButton = true;

      const userId = String(this.storeCache.TelegramData.user.id);
      const nftUniqueKey = this.CompDataGift.nftUniqueKey;
      const nftsIds = [...this.CompDataGift.nftIds];
      const nftsCount = this.CompDataGift.nftCount;

      const data = await multicheckApi.create(userId, nftUniqueKey, nftsIds, nftsCount);
      if (!data || !data.uuid) {
        this.isLoadingCreateButton = false;
        return;
      }

      if (data.is_paid && data.status === 'pending') {
        await this.handlePaidFlow(data.uuid, nftsCount, nftUniqueKey);
      } else {
        await this.chooseRecipient(data.uuid);
      }
    },

    async handlePaidFlow(multicheckUuid, nftsCount, nftUniqueKey) {
      const invoice = await multicheckApi.createMulticheckInvoice(multicheckUuid, nftsCount);
      if (!invoice || !invoice.link) {
        this.isLoadingCreateButton = false;
        return;
      }

      TelegramModule.useInvoice(
        invoice.link,
        async () => {
          await multicheckApi.confirmPayment(multicheckUuid);
          await this.chooseRecipient(multicheckUuid);
        },
        () => {
          this.isLoadingCreateButton = false;
          multicheckApi.cancel(multicheckUuid);
        }
      );
    },

    async chooseRecipient(multicheckUuid) {
      TelegramModule.useMediumHaptic();

      const preparedMessage = await telegramApi.createPrepareMulticheckMessage(
        String(this.storeCache.TelegramData.user.id),
        this.CompDataGift.nftUniqueKey,
        multicheckUuid,
        String(this.CompDataGift.nftCount)
      );
      if (!preparedMessage) {
        this.isLoadingCreateButton = false;
        multicheckApi.cancel(multicheckUuid);
        return;
      }

      if (preparedMessage.sendedGiftsCount) {
        this.storeCache.UserData.sendedGiftsCount += parseInt(preparedMessage.sendedGiftsCount);
      }

      TelegramModule.useShareMessage(preparedMessage.prepareMessage.id)
        .then(async () => {
          this.isLoadingCreateButton = false;
          this.storeCache.LastMulticheckSummary = this.CompDataGift.giftsSummary || [];
          this.openReceive(this.CompDataGift.nftUniqueKey, 'sended');
        })
        .catch(() => {
          this.isLoadingCreateButton = false;
          multicheckApi.cancel(multicheckUuid);
        });
    },
  },
};
</script>
