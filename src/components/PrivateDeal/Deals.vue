<template>
  <div class="pd-deals">
    <div v-if="loading" class="pd-deals__skel">
      <div v-for="i in 3" :key="i" class="pd-deals__skel-row"></div>
    </div>

    <div v-else-if="deals.length === 0" class="pd-empty">
      <p>{{ $t('privateDeal.noDeals') }}</p>
    </div>

    <div v-else class="pd-list">
      <div
        v-for="deal in deals"
        :key="deal.id"
        class="pd-row"
        @click="$emit('openDeal', deal)"
      >
        <div class="pd-row__thumbs">
          <div
            v-for="gp in getGiftPreviews(deal)"
            :key="gp.uuid"
            class="pd-row__thumb"
            :class="{ [gp.rarity]: !gp.upgraded }"
            :style="
              gp.upgraded && gp.bg_center
                ? { background: `radial-gradient(circle at center, ${gp.bg_center}, ${gp.bg_around})` }
                : {}
            "
          >
            <img v-if="gp.image" :src="gp.image" alt="" />
          </div>
          <div v-if="deal.gift_count > 3" class="pd-row__more">+{{ deal.gift_count - 3 }}</div>
        </div>

        <div class="pd-row__mid">
          <span class="pd-row__title">{{ deal.gift_count }} {{ $t('privateDeal.giftsWord') }}</span>
          <span class="pd-row__status" :class="'is-' + deal.status">{{ statusText(deal.status) }}</span>
        </div>

        <div class="pd-row__right">
          <div class="pd-row__price">
            <img :src="Image_Ton" alt="" />
            <span>{{ nanoToTon(deal.price_nano) }}</span>
          </div>
          <div class="pd-row__acts" @click.stop v-if="deal.status === 'pending'">
            <button type="button" class="pd-row__act" @click="$emit('shareDeal', deal)" aria-label="Share">
              <div class="kit-icon" v-html="Icon.Reply"></div>
            </button>
            <button type="button" class="pd-row__act is-danger" @click="$emit('cancelDeal', deal.id)" aria-label="Cancel">
              <div class="kit-icon" v-html="Icon.Trash"></div>
            </button>
          </div>
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
