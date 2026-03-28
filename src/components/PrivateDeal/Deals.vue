<template>
  <div class="pd-deals">
    <div v-if="loading" class="pd-deals__loading">
      <div v-for="i in 3" :key="i" class="pd-deal-skel">
        <div class="pd-deal-skel__row">
          <div class="pd-deal-skel__icon"></div>
          <div class="pd-deal-skel__lines">
            <div class="pd-deal-skel__line pd-deal-skel__line--w60"></div>
            <div class="pd-deal-skel__line pd-deal-skel__line--w40"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="deals.length === 0" class="pd-deals__empty">
      <div class="pd-deals__empty-ic" v-html="Icon.Trade"></div>
      <p>{{ $t('privateDeal.noDeals') }}</p>
    </div>

    <div v-else class="pd-deals__list">
      <div
        v-for="deal in deals"
        :key="deal.id"
        class="pd-deal2"
        @click="$emit('openDeal', deal)"
      >
        <!-- Gift thumbnails row -->
        <div class="pd-deal2__thumbs">
          <div
            v-for="gp in getGiftPreviews(deal)"
            :key="gp.uuid"
            class="pd-deal2__thumb"
            :class="{ [gp.rarity]: !gp.upgraded }"
            :style="gp.upgraded && gp.bg_center ? {
              background: `radial-gradient(circle at center, ${gp.bg_center}, ${gp.bg_around})`
            } : {}"
          >
            <img v-if="gp.image" :src="gp.image" alt="" />
            <div v-else class="pd-deal2__thumb-ph"></div>
          </div>
          <div v-if="deal.gift_count > 3" class="pd-deal2__thumb-more">
            +{{ deal.gift_count - 3 }}
          </div>
        </div>

        <!-- Deal info -->
        <div class="pd-deal2__body">
          <div class="pd-deal2__top">
            <div class="pd-deal2__info">
              <h4>{{ deal.gift_count }} {{ $t('privateDeal.giftsWord') }}</h4>
              <span class="pd-deal2__status" :class="'pd-deal2__status--' + deal.status">
                {{ statusText(deal.status) }}
              </span>
            </div>
            <div class="pd-deal2__price">
              <img :src="Image_Ton" alt="TON" />
              <span>{{ nanoToTon(deal.price_nano) }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="pd-deal2__actions" @click.stop v-if="deal.status === 'pending'">
          <button class="pd-deal2__act pd-deal2__act--share" @click.stop="$emit('shareDeal', deal)">
            <div class="kit-icon" v-html="Icon.Reply"></div>
          </button>
          <button class="pd-deal2__act pd-deal2__act--cancel" @click.stop="$emit('cancelDeal', deal.id)">
            <div class="kit-icon" v-html="Icon.Trash"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from '../Icon';
import { t } from 'i18next';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import Image_Ton from '@/assets/images/market/ton.svg';
import { nanoToTon } from '../../api/privateDealApi';

export default {
  props: {
    deals: { type: Array, required: true },
    loading: { type: Boolean, default: false },
  },
  emits: ['cancelDeal', 'shareDeal', 'openDeal'],

  data() {
    return { Icon, Image_Ton, storeCache: useCacheStore(), nanoToTon };
  },

  methods: {
    statusText(s) {
      const map = {
        pending: t('privateDeal.statusPending'),
        accepted: t('privateDeal.statusAccepted'),
        cancelled: t('privateDeal.statusCancelled'),
        expired: t('privateDeal.statusExpired'),
      };
      return map[s] || s;
    },
    getGiftPreviews(deal) {
      if (!deal.gifts) return [];
      return deal.gifts.slice(0, 3).map((g) => {
        const fallback = this.storeCache?.NftsAppData?.[g.nft_unique_key];
        return {
          uuid: g.uuid,
          rarity: g.rarity || fallback?.Rarity || '',
          image: g.image || fallback?.ImageMain || '',
          upgraded: g.upgraded || false,
          bg_center: g.bg_center || '',
          bg_around: g.bg_around || '',
        };
      });
    },
  },
};
</script>
