<template>
  <div class="mc-dock">
    <button
      v-if="isLoading"
      type="button"
      class="mc-dock__btn mc-dock__btn--off"
      disabled
    />
    <button
      v-else-if="CompDataGift.nftCount >= 2"
      type="button"
      class="mc-dock__btn mc-dock__btn--on"
      :class="{ loading: isLoadingCreateButton }"
      :disabled="isLoadingCreateButton"
      @click="createMulticheck"
    >
      <template v-if="!isLoadingCreateButton">
        <span class="mc-dock__label">{{ $t('multicheck.createMulticheck') }}</span>
        <span class="mc-dock__dot">·</span>
        <span class="mc-dock__n">{{ CompDataGift.nftCount }}</span>
        <template v-if="isPaidFlow">
          <span class="mc-dock__dot">·</span>
          <span class="mc-dock__stars">{{ CompDataGift.nftCount * 5 }} ★</span>
        </template>
      </template>
      <Lottie
        v-else
        class="lt"
        slug="loading-spin"
        :loop="true"
        :width="28"
        :height="28"
        renderer="svg"
      />
    </button>
    <button
      v-else
      type="button"
      class="mc-dock__btn mc-dock__btn--off"
      disabled
    >
      {{
        CompDataGift.nftCount === 1
          ? $t('multicheck.atLeastGifts')
          : $t('multicheck.chooseNumberGifts')
      }}
    </button>
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
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    CompDataGift: { type: Object, required: true },
  },

  components: { Lottie },

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
      } catch {}
      this.isLoading = false;
      this.$emit('loadSuccess');
    },

    openReceive(nft, nftType) {
      this.$router.push({
        name: 'activate-multicheck',
        params: { nft, nftType },
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
