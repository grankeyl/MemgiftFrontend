<template>
  <div class="_wrap pd-page pd-view" :class="{ desktop: isDesktop() }">
    <div class="_view">
      <div class="display">
        <div class="pd-header">
          <button type="button" class="pd-header__back" @click="navigateBack" aria-label="Back">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12.5 4.5L7 10l5.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div v-if="loading" class="pdv-skel">
          <div class="pdv-skel__line"></div>
          <div class="pdv-skel__gifts"></div>
          <div class="pdv-skel__card"></div>
        </div>

        <div v-else-if="!deal" class="pd-empty pd-empty--page">
          <h3>{{ $t('privateDeal.dealNotFound') }}</h3>
          <p>{{ $t('privateDeal.dealNotFoundDescr') }}</p>
          <button type="button" class="pd-empty__btn" @click="$router.push('/')">
            {{ $t('privateDeal.goHome') }}
          </button>
        </div>

        <div v-else class="pdv">
          <div class="pdv__head">
            <h1>{{ dealPriceTon }} <span>TON</span></h1>
            <div class="pdv__status" :class="'is-' + deal.status">{{ statusText }}</div>
          </div>

          <div class="pdv__gifts">
            <div
              v-for="gp in giftPreviews"
              :key="gp.uuid"
              class="pdv__gift"
              :style="giftBg(gp)"
            >
              <img v-if="gp.image" :src="gp.image" alt="" />
            </div>
          </div>

          <div class="pdv__card">
            <div class="pdv__row">
              <div class="pdv__seller">
                <img v-if="deal.seller_photo" :src="deal.seller_photo" alt="" />
                <div v-else class="pdv__ava">{{ sellerInitial }}</div>
                <div>
                  <span>{{ $t('privateDeal.seller') }}</span>
                  <strong>{{ deal.seller_name }}</strong>
                </div>
              </div>
            </div>
            <div class="pdv__row">
              <span>{{ $t('privateDeal.giftsWord') }}</span>
              <strong>{{ deal.gift_count }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="deal" class="pd-dock">
      <template v-if="deal.status === 'pending' && !isOwner">
        <button type="button" class="pd-dock__btn pd-dock__btn--on" @click="acceptDeal" :disabled="accepting">
          <img :src="Image_TonWhite" alt="" />
          <span>{{ $t('privateDeal.acceptDeal') }} {{ dealPriceTon }} TON</span>
        </button>
      </template>

      <template v-else-if="deal.status === 'pending' && isOwner">
        <button type="button" class="pd-dock__btn pd-dock__btn--on" @click="shareDeal">
          {{ $t('privateDeal.shareViaTelegram') }}
        </button>
        <button type="button" class="pd-dock__btn pd-dock__btn--danger" @click="cancelDeal">
          {{ $t('privateDeal.cancelDeal') }}
        </button>
      </template>

      <template v-else-if="deal.status === 'accepted'">
        <div class="pd-dock__badge is-ok">{{ $t('privateDeal.dealCompleted') }}</div>
      </template>

      <template v-else-if="deal.status === 'cancelled'">
        <div class="pd-dock__badge is-bad">{{ $t('privateDeal.statusCancelled') }}</div>
      </template>
    </div>
  </div>
</template>

<script>
import TelegramModule from '../hooks/useTelegram';
import { useCacheStore } from '../stores/pinia/piniaStore';
import { isDesktop } from '../utils/checkDevice';
import { showToast } from '../utils/toastManager';
import { t } from 'i18next';

import * as privateDealApi from '../api/privateDealApi';

import Image_Ton from '@/assets/images/market/ton.svg';
import Image_TonWhite from '@/assets/images/market/ton-white.svg';

export default {
  props: { success: { type: Boolean, default: true } },

  data() {
    return {
      storeCache: useCacheStore(),
      loading: true,
      accepting: false,
      deal: null,
      isDesktop,
      Image_Ton,
      Image_TonWhite,
    };
  },

  computed: {
    isOwner() {
      const myId = String(this.storeCache.TelegramData?.user?.id || '');
      return myId && myId === this.deal?.seller_id;
    },
    sellerInitial() {
      return (this.deal?.seller_name || '?')[0].toUpperCase();
    },
    dealPriceTon() {
      return privateDealApi.nanoToTon(this.deal?.price_nano || 0);
    },
    statusText() {
      const s = this.deal?.status;
      const map = {
        pending: t('privateDeal.statusPending'),
        accepted: t('privateDeal.statusAccepted'),
        cancelled: t('privateDeal.statusCancelled'),
        expired: t('privateDeal.statusExpired'),
      };
      return map[s] || s;
    },
    giftPreviews() {
      if (!this.deal?.gifts) return [];
      return this.deal.gifts.map((g) => {
        const fallbackData = this.storeCache?.NftsAppData?.[g.nft_unique_key];
        return {
          uuid: g.uuid,
          rarity: g.rarity || fallbackData?.Rarity || '',
          image: g.image || fallbackData?.ImageMain || '',
          upgraded: g.upgraded || false,
          bg_center: g.bg_center || '',
          bg_around: g.bg_around || '',
        };
      });
    },
  },

  async mounted() {
    TelegramModule.useBackButton(() => this.navigateBack());
    const dealId = this.$route.params.id;
    if (!dealId) {
      this.loading = false;
      return;
    }
    const deal = await privateDealApi.getById(dealId);
    this.deal = deal || null;
    this.loading = false;
  },

  methods: {
    giftBg(gp) {
      if (gp.upgraded && gp.bg_center) {
        return { background: `radial-gradient(circle at 50% 40%, ${gp.bg_center}, ${gp.bg_around})` };
      }
      const map = {
        rare: 'linear-gradient(180deg, #282867 0%, #131328 100%)',
        veryrare: 'linear-gradient(180deg, #1D6132 0%, #0B2211 100%)',
        epic: 'linear-gradient(180deg, #632475 0%, #19101D 100%)',
        legend: 'linear-gradient(180deg, #6F480E 0%, #1D1710 100%)',
        legendary: 'linear-gradient(180deg, #6F480E 0%, #1D1710 100%)',
        author: 'linear-gradient(180deg, #762121 0%, #221111 100%)',
      };
      return { background: map[gp.rarity] || '#252528' };
    },

    navigateBack() {
      if (this.$route.query.from === 'list') this.$router.push('/private-deal');
      else this.$router.push('/profile');
    },

    async acceptDeal() {
      if (this.accepting) return;
      this.accepting = true;
      const myId = String(this.storeCache.TelegramData?.user?.id || '');
      const myName = this.storeCache.TelegramData?.user?.first_name || 'Buyer';
      try {
        const result = await privateDealApi.accept(this.deal.id, myId, myName);
        if (!result) {
          showToast(t('privateDeal.acceptError'), 'error');
          return;
        }
        if (result.status === 'insufficient_funds') {
          showToast(t('privateDeal.insufficientFunds'), 'error');
          return;
        }
        if (result.status === 'accepted') {
          this.deal.status = 'accepted';
          showToast(t('privateDeal.acceptSuccess'), 'success');
          TelegramModule.useMediumHaptic();
          setTimeout(() => this.$router.push('/profile'), 1200);
        } else {
          showToast(t('privateDeal.acceptError'), 'error');
        }
      } catch {
        showToast(t('privateDeal.acceptError'), 'error');
      } finally {
        this.accepting = false;
      }
    },

    shareDeal() {
      const url = privateDealApi.getDealShareUrl(this.deal.id);
      const priceTon = privateDealApi.nanoToTon(this.deal.price_nano || 0);
      const msg = t('privateDeal.shareMessage', {
        count: this.deal.gift_count,
        price: priceTon,
      });
      TelegramModule.useShare(url, msg);
    },

    async cancelDeal() {
      await privateDealApi.cancel(this.deal.id);
      this.deal.status = 'cancelled';
      showToast(t('privateDeal.cancelSuccess'), 'success');
      TelegramModule.useLightHaptic();
      setTimeout(() => this.navigateBack(), 1200);
    },
  },
};
</script>

<style lang="sass">
@use "@/assets/styles/private_deal/_main.sass"
@use "@/assets/styles/private_deal/_comp.sass"
</style>
