<template>
  <div class="_wrap referral" :class="{ desktop: isDesktop() }">
    <div class="bluring-t"></div>
    <div class="bluring-b"></div>

    <div class="_view">
      <div class="display">
        <!-- Skeleton -->
        <template v-if="isPageLoading">
          <div class="rf-top rf-top--skel">
            <div class="rf-skel rf-skel--title"></div>
            <div class="rf-skel rf-skel--text"></div>
          </div>
          <div class="rf-skel rf-skel--main"></div>
          <div class="rf-skel rf-skel--card"></div>
        </template>

        <template v-else>
          <div class="rf-top">
            <h1 class="rf-top__title">{{ $t('referral.title') }}</h1>
            <p class="rf-top__sub">{{ $t('referral.description') }}</p>
          </div>

          <!-- ссылка и действия одной карточкой .blockTasks -->
          <div class="rf-card-main">
            <button type="button" class="rf-link" @click="copyReferral">
              <div class="rf-link__icon">
                <div class="kit-icon" v-html="Icon.Link"></div>
              </div>
              <div class="rf-link__mid">
                <span class="rf-link__label">{{ $t('referral.yourLink') }}</span>
                <span class="rf-link__url">{{ shortLink }}</span>
              </div>
              <div class="rf-link__copy">
                <div class="kit-icon" v-html="Icon.Copy"></div>
              </div>
            </button>

            <div class="rf-actions">
              <button type="button" class="rf-actions__btn" @click="copyReferral">
                <div class="kit-icon" v-html="Icon.Copy"></div>
                <span>{{ $t('referral.copy') }}</span>
              </button>
              <button type="button" class="rf-actions__btn" @click="shareReferral">
                <div class="kit-icon" v-html="Icon.ShareFill"></div>
                <span>{{ $t('referral.share') }}</span>
              </button>
            </div>
          </div>

          <!-- List -->
          <div class="rf-section">
            <div class="rf-section__head">
              <h4>{{ $t('referral.referrals') }}</h4>
              <span class="rf-section__meta">{{ refCount }}</span>
            </div>

            <div class="rf-card" v-if="referralsData.length > 0">
              <button
                v-for="(referral, index) in referralsData"
                :key="referral.tld || index"
                type="button"
                class="rf-row"
                @click="openReferralProfile(referral.tld)"
              >
                <div class="rf-row__ava">
                  <img v-if="referral.photo" :src="referral.photo" alt="" />
                  <span v-else>{{ initialOf(referral.name) }}</span>
                </div>

                <div class="rf-row__mid">
                  <span class="rf-row__name">{{ referral.name || '—' }}</span>
                  <span class="rf-row__id" @click.stop="copyReferralId(referral.tld)">
                    {{ referral.tld }}
                  </span>
                </div>

                <span class="rf-row__go" aria-hidden="true">
                  <svg viewBox="0 0 8 14" fill="none">
                    <path d="M1 1.5L6.5 7 1 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </button>

              <div ref="listEnd" class="rf-card__end"></div>
            </div>

            <div class="rf-empty" v-else>
              <p>{{ $t('referral.noReferrals.descr') }}</p>
              <button type="button" class="rf-empty__btn" @click="shareReferral">
                {{ $t('referral.noReferrals.button') }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import TelegramModule from '../hooks/useTelegram';

import { useCacheStore } from '../stores/pinia/piniaStore';
import { getConfig } from '../config';
import { isDesktop } from '../utils/checkDevice';
import { Icon } from '../components/Icon';
import { copyToClipboard } from '../utils/copyToClipboard';
import { showToast } from '../utils/toastManager';
import { t } from 'i18next';

import * as userApi from '../api/userApi';

export default {
  props: {
    success: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      storeCache: useCacheStore() as any,
      configApp: getConfig(),
      isPageLoading: true,

      referralsData: [] as any[],
      referralsOffset: 0,
      referralsLimit: 20,
      referralsIsFetchingMore: false,
      referralsHasMore: true,

      Icon,
      isDesktop,
      _observer: null as IntersectionObserver | null,
    };
  },

  computed: {
    refCount(): number {
      return Number(this.storeCache?.UserData?.RefCount ?? this.referralsData.length ?? 0);
    },
    referralCode(): string {
      return (
        this.storeCache?.UserData?.user?.Code ||
        this.storeCache?.UserData?.referral_code ||
        ''
      );
    },
    referralLink(): string {
      const base = import.meta.env.VITE_APP_MINI_APP_LINK || 'https://t.me/MemGiftsBot?startapp';
      return `${base}=ref_${this.referralCode}`;
    },
    shortLink(): string {
      const link = this.referralLink.replace(/^https?:\/\//, '');
      if (link.length <= 36) return link;
      return `${link.slice(0, 18)}…${link.slice(-12)}`;
    },
  },

  mounted() {
    TelegramModule.useBackButton(() => this.backToProfile());
    this.boot();
  },

  beforeUnmount() {
    this._observer?.disconnect();
    this._observer = null;
  },

  methods: {
    async boot() {
      this.referralsOffset = 0;
      this.referralsData = [];
      this.referralsHasMore = true;
      await this.fetchReferralsMoreIfNeeded();
      setTimeout(() => {
        this.isPageLoading = false;
        this.$nextTick(() => this.observeListEnd());
      }, this.configApp.skeletonTime || 280);
    },

    backToProfile() {
      this.$router.push({ name: 'profile' });
    },

    initialOf(name?: string) {
      const n = (name || '?').trim();
      return n ? n[0].toUpperCase() : '?';
    },

    copyReferral() {
      copyToClipboard(this.referralLink);
      showToast(t('referral.linkCopied'), 'success');
    },

    shareReferral() {
      const message = t('referral.shareMessage');
      TelegramModule.useShare(this.referralLink, message);
    },

    copyReferralId(id: string | number) {
      if (id == null) return;
      copyToClipboard(String(id));
      showToast(t('referral.idCopied'), 'success');
    },

    openReferralProfile(userId: string | number) {
      if (userId == null) return;
      this.$router.push({
        name: 'view',
        params: { id: String(userId) },
      });
    },

    observeListEnd() {
      this.$nextTick(() => {
        const el = this.$refs.listEnd as HTMLElement | undefined;
        if (!el) return;

        this._observer?.disconnect();
        this._observer = new IntersectionObserver(
          (entries) => {
            if (entries[0]?.isIntersecting) {
              this.fetchReferralsMoreIfNeeded();
            }
          },
          { threshold: 0.1, rootMargin: '80px' }
        );
        this._observer.observe(el);
      });
    },

    async fetchReferralsMoreIfNeeded() {
      if (this.referralsIsFetchingMore || !this.referralsHasMore) return;
      this.referralsIsFetchingMore = true;
      try {
        const res = await userApi.getReferrals(this.referralsOffset, this.referralsLimit);
        if (!res) {
          this.referralsHasMore = false;
          return;
        }
        const items = Array.isArray(res) ? res : (res.items || []);
        if (!items.length) {
          this.referralsHasMore = false;
          return;
        }
        const ids = new Set(this.referralsData.map((i: any) => i.tld));
        const unique = items.filter((i: any) => !ids.has(i.tld));
        this.referralsData.push(...unique);
        this.referralsOffset += this.referralsLimit;
        if (items.length < this.referralsLimit) {
          this.referralsHasMore = false;
        }
        this.$nextTick(() => this.observeListEnd());
      } catch {
        this.referralsHasMore = false;
      } finally {
        this.referralsIsFetchingMore = false;
      }
    },
  },
};
</script>

<style lang="sass">
@use "@/assets/styles/referral/_main.sass"
@use "@/assets/styles/referral/_comp.sass"
</style>
