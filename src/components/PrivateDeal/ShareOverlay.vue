<template>
  <div class="pd-share-overlay" @click.self="$emit('close')">
    <div class="pd-share">
      <div class="pd-share__head">
        <h3>{{ $t('privateDeal.shareTitle') }}</h3>
        <button class="pd-share__close" @click="$emit('close')">
          <div class="kit-icon" v-html="Icon.Close"></div>
        </button>
      </div>

      <div class="pd-share__info">
        <div class="pd-share__row">
          <span>{{ $t('privateDeal.giftsWord') }}</span>
          <strong>{{ deal.gift_count }}</strong>
        </div>
        <div class="pd-share__row">
          <span>{{ $t('privateDeal.label1') }}</span>
          <strong>
            <img :src="Image_Ton" alt="TON" class="pd-share__star" />
            {{ nanoToTon(deal.price_nano) }} TON
          </strong>
        </div>
      </div>

      <div class="pd-share__link">
        <input :value="shareUrl" readonly @focus="$event.target.select()" />
        <button @click="$emit('copy', deal)">
          <div class="kit-icon" v-html="Icon.Copy"></div>
        </button>
      </div>

      <div class="pd-share__buttons">
        <button class="pd-share__tg" @click="$emit('share', deal)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          {{ $t('privateDeal.shareViaTelegram') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from '../Icon';
import { getDealShareUrl, nanoToTon } from '../../api/privateDealApi';
import Image_Ton from '@/assets/images/market/ton.svg';

export default {
  props: {
    deal: { type: Object, required: true },
  },
  emits: ['close', 'copy', 'share'],

  data() {
    return { Icon, Image_Ton, nanoToTon };
  },

  computed: {
    shareUrl() {
      return getDealShareUrl(this.deal.id);
    },
  },
};
</script>
