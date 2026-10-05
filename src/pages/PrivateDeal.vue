<template>
  <div class="_wrap pd-page" :class="{ desktop: isDesktop() }">
    <div class="_view">
      <div class="display">
        <div class="pd-top">
          <h1>{{ $t('privateDeal.title') }}</h1>
          <p>{{ $t('privateDeal.subtitle') }}</p>
        </div>

        <div class="pd-tabs">
          <button
            type="button"
            class="pd-tabs__item"
            :class="{ active: Section === 'Create' }"
            @click="setSection('Create')"
          >
            {{ $t('privateDeal.tabCreate') }}
          </button>
          <button
            type="button"
            class="pd-tabs__item"
            :class="{ active: Section === 'Deals' }"
            @click="setSection('Deals')"
          >
            {{ $t('privateDeal.tabDeals') }}
            <span v-if="deals.length > 0" class="pd-tabs__count">{{ deals.length }}</span>
          </button>
        </div>

        <Create
          v-if="Section === 'Create'"
          :storeCache="storeCache"
          @createDeal="onCreateDeal"
        />

        <Deals
          v-if="Section === 'Deals'"
          :deals="deals"
          :loading="dealsLoading"
          @cancelDeal="onCancelDeal"
          @shareDeal="onShareDeal"
          @openDeal="onOpenDeal"
        />
      </div>
    </div>

    <ShareOverlay
      v-if="shareOverlay.active"
      :deal="shareOverlay.deal"
      @close="shareOverlay.active = false"
      @copy="onCopyLink"
      @share="onTelegramShare"
    />
  </div>
</template>

<script>
import TelegramModule from '../hooks/useTelegram';
import { useCacheStore } from '../stores/pinia/piniaStore';
import { isDesktop } from '../utils/checkDevice';
import { showToast } from '../utils/toastManager';
import { t } from 'i18next';

import * as privateDealApi from '../api/privateDealApi';

import Create from '../components/PrivateDeal/Create.vue';
import Deals from '../components/PrivateDeal/Deals.vue';
import ShareOverlay from '../components/PrivateDeal/ShareOverlay.vue';

export default {
  components: { Create, Deals, ShareOverlay },
  props: { success: { type: Boolean, default: true } },

  data() {
    return {
      storeCache: useCacheStore(),
      Section: 'Create',
      deals: [],
      dealsLoading: false,
      shareOverlay: { active: false, deal: null },
      isDesktop,
    };
  },

  mounted() {
    TelegramModule.useBackButton(() => this.goBack());
    this.loadDeals();
    this.$watch(
      () => this.storeCache.TelegramData,
      () => this.loadDeals()
    );
  },

  methods: {
    goBack() {
      this.$router.push({ name: 'profile' });
    },

    setSection(s) {
      this.Section = s;
      if (s === 'Deals') this.loadDeals();
    },

    async loadDeals() {
      const userId = String(this.storeCache.TelegramData?.user?.id || '');
      if (!userId) return;
      this.dealsLoading = true;
      try {
        this.deals = await privateDealApi.getAll(userId);
      } finally {
        this.dealsLoading = false;
      }
    },

    async onCreateDeal(data) {
      const userId = String(this.storeCache.TelegramData.user.id);
      const userName = this.storeCache.TelegramData.user.first_name || 'User';
      const gifts = data.gifts;

      const deal = await privateDealApi.create(userId, userName, gifts, data.priceNano);
      if (!deal) {
        showToast(t('privateDeal.createError'), 'error');
        return;
      }

      showToast(t('privateDeal.createSuccess'), 'success');
      TelegramModule.useMediumHaptic();

      this.shareOverlay = { active: true, deal };
      await this.loadDeals();
    },

    async onCancelDeal(dealId) {
      await privateDealApi.cancel(dealId);
      showToast(t('privateDeal.cancelSuccess'), 'success');
      TelegramModule.useLightHaptic();
      await this.loadDeals();
    },

    onShareDeal(deal) {
      this.shareOverlay = { active: true, deal };
    },

    onOpenDeal(deal) {
      this.$router.push(`/private-deal/${deal.id}?from=list`);
    },

    onCopyLink(deal) {
      const url = privateDealApi.getDealShareUrl(deal.id);
      navigator.clipboard.writeText(url).then(() => {
        showToast(t('privateDeal.linkCopied'), 'success');
        TelegramModule.useLightHaptic();
      });
    },

    onTelegramShare(deal) {
      const url = privateDealApi.getDealShareUrl(deal.id);
      const priceTon = privateDealApi.nanoToTon(deal.price_nano || 0);
      const msg = t('privateDeal.shareMessage', {
        count: deal.gift_count,
        price: priceTon,
      });
      TelegramModule.useShare(url, msg);
    },
  },
};
</script>

<style lang="sass">
@use "@/assets/styles/private_deal/_main.sass"
@use "@/assets/styles/private_deal/_comp.sass"
</style>
