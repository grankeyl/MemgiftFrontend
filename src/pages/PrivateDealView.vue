<template>
  <section class="_wrap _privateDealView" :class="{ desktop: isDesktop() }">
    <div class="_view">
      <div class="pd-bg">
        <div class="pd-orb pd-orb--1"></div>
        <div class="pd-orb pd-orb--2"></div>
      </div>

      <div class="display">
        <!-- Loading skeleton -->
        <div v-if="loading" class="pdv-loader _lefting">
          <div class="pdv-skel pdv-skel--ava"></div>
          <div class="pdv-skel pdv-skel--gifts"></div>
          <div class="pdv-skel pdv-skel--info"></div>
        </div>

        <!-- Not found -->
        <div v-else-if="!deal" class="pdv-empty _lefting">
          <div class="pdv-empty__icon" v-html="Icon.Close"></div>
          <h3>{{ $t('privateDeal.dealNotFound') }}</h3>
          <p>{{ $t('privateDeal.dealNotFoundDescr') }}</p>
          <button class="pdv-empty__btn" @click="$router.push('/')">
            {{ $t('privateDeal.goHome') }}
          </button>
        </div>

        <!-- Deal content -->
        <div v-else class="pdv2 _lefting">
          <!-- Seller row -->
          <div class="pdv2__seller">
            <img v-if="deal.seller_photo" :src="deal.seller_photo" alt="" class="pdv2__seller-photo" />
            <div v-else class="pdv2__seller-ava">{{ sellerInitial }}</div>
            <div class="pdv2__seller-txt">
              <span>{{ $t('privateDeal.seller') }}</span>
              <strong>{{ deal.seller_name }}</strong>
            </div>
          </div>

          <!-- Gift showcase -->
          <div class="pdv2__showcase">
            <div
              v-for="gp in giftPreviews"
              :key="gp.uuid"
              class="pdv2__gift"
            >
              <!-- Background layer -->
              <div
                v-if="gp.upgraded && gp.bg_center"
                class="pdv2__gift-bg pdv2__gift-bg--upg"
                :style="{ background: `radial-gradient(circle at center, ${gp.bg_center}, ${gp.bg_around})` }"
              ></div>
              <div v-else class="pdv2__gift-bg" :class="gp.rarity"></div>

              <!-- Symbol layer -->
              <img v-if="gp.upgraded && gp.symbol" :src="gp.symbol" alt="" class="pdv2__gift-symbol" />
              <img v-else-if="!gp.upgraded" src="/gift_bg.png" alt="" class="pdv2__gift-symbol" />

              <!-- Model layer -->
              <img v-if="gp.image" :src="gp.image" alt="gift" class="pdv2__gift-img" />
            </div>
          </div>

          <!-- Deal info card -->
          <div class="pdv2__info">
            <div class="pdv2__info-row">
              <span>{{ $t('privateDeal.giftsWord') }}</span>
              <strong>{{ deal.gift_count }}</strong>
            </div>
            <div class="pdv2__info-divider"></div>
            <div class="pdv2__info-row pdv2__info-row--price">
              <span>{{ $t('privateDeal.label1') }}</span>
              <strong>
                <img :src="Image_Ton" alt="TON" />
                {{ dealPriceTon }}
              </strong>
            </div>
          </div>

          <!-- Status -->
          <div class="pdv2__status" :class="'pdv2__status--' + deal.status">
            <div class="pdv2__status-dot"></div>
            {{ statusText }}
          </div>
        </div>
      </div>

      <!-- Fixed bottom buttons -->
      <div v-if="deal" class="pdv2__bottom _lefting">
        <template v-if="deal.status === 'pending' && !isOwner">
          <button class="pdv2__btn pdv2__btn--primary" @click="acceptDeal" :disabled="accepting">
            <img :src="Image_TonWhite" alt="TON" />
            <span>{{ $t('privateDeal.acceptDeal') }} {{ dealPriceTon }} TON</span>
          </button>
        </template>

        <template v-else-if="deal.status === 'pending' && isOwner">
          <button class="pdv2__btn pdv2__btn--primary" @click="shareDeal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {{ $t('privateDeal.shareViaTelegram') }}
          </button>
          <button class="pdv2__btn pdv2__btn--danger" @click="cancelDeal">
            {{ $t('privateDeal.cancelDeal') }}
          </button>
        </template>

        <template v-else-if="deal.status === 'accepted'">
          <div class="pdv2__badge pdv2__badge--success">
            <div class="kit-icon" v-html="Icon.Done"></div>
            {{ $t('privateDeal.dealCompleted') }}
          </div>
        </template>

        <template v-else-if="deal.status === 'cancelled'">
          <div class="pdv2__badge pdv2__badge--cancelled">
            {{ $t('privateDeal.statusCancelled') }}
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script>
import TelegramModule from '../hooks/useTelegram';
import { useCacheStore } from '../stores/pinia/piniaStore';
import { isDesktop } from '../utils/checkDevice';
import { showToast } from '../utils/toastManager';
import { Icon } from '../components/Icon';
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
      Icon,
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
          symbol: g.symbol || '',
          upgraded: g.upgraded || false,
          bg_center: g.bg_center || '',
          bg_around: g.bg_around || '',
        };
      });
    },
  },

  async mounted() {
    TelegramModule.useBackButton(() => this.$router.push('/private-deal'));

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
    navigateBack() {
      if (this.$route.query.from === 'list') {
        this.$router.push('/private-deal');
      } else {
        this.$router.push('/profile');
      }
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
