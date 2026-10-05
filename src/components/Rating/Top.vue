<template>
  <div class="_direction _comp _item _leaderboard">
    <!-- ── skeleton ── -->
    <div v-if="isLoading" class="_skeleton">
      <div class="rt-seg-skel"></div>
      <div class="rt-hero-skel">
        <div class="rt-hero-skel__u small"></div>
        <div class="rt-hero-skel__u"></div>
        <div class="rt-hero-skel__u small"></div>
      </div>
      <div class="rt-list-skel">
        <div v-for="i in 6" :key="'rs' + i" class="rt-list-skel__row"></div>
      </div>
    </div>

    <div v-else class="_content">
      <!-- сегмент-таб: тот же стеклянный слайдер, что в профиле -->
      <div class="rt-seg" :class="{ 'is-right': selectedSection === 'others' }">
        <div class="rt-seg__indicator"></div>
        <button type="button" class="rt-seg__tab" :class="{ active: selectedSection === 'holders' }" @click="setSection('holders')">
          <span>{{ $t('rating.section1') }}</span>
        </button>
        <button type="button" class="rt-seg__tab" :class="{ active: selectedSection === 'others' }" @click="setSection('others')">
          <span>{{ $t('rating.section2') }}</span>
        </button>
      </div>

      <!-- контент активного таба -->
      <div :key="selectedSection" class="rt-board">
        <!-- ── подиум топ-3 ── -->
        <div class="rt-hero">
          <div
            v-for="(u, i) in heroThree"
            :key="heroKey(u) || i"
            class="rt-hero__u"
            :class="`is-${heroRank(u)}`"
            :style="{ '--hi': i }"
            @click="routeUser(heroKey(u))"
          >
            <div class="rt-hero__ava">
              <img v-if="heroPhoto(u)" :src="heroPhoto(u)" alt="" />
              <div v-else class="rt-hero__ava-null"><h4>{{ heroInitial(u) }}</h4></div>
              <div class="rt-hero__rank">{{ heroRank(u) }}</div>
            </div>
            <div class="rt-hero__name">{{ heroName(u) }}</div>
            <div class="rt-hero__count">
              <div class="kit-icon" v-html="countIcon"></div>
              <span>{{ heroCount(u) }}</span>
            </div>
          </div>
        </div>

        <!-- ── список 4+ ── -->
        <div class="rt-list">
          <div
            v-for="(u, index) in listRest"
            :key="heroKey(u) || index"
            class="rt-list__row"
            :style="{ '--ri': Math.min(index, 14) }"
            @click="routeUser(heroKey(u))"
          >
            <div class="rt-list__rank">{{ heroRank(u) }}</div>
            <img v-if="heroPhoto(u)" class="rt-list__ava" :src="heroPhoto(u)" alt="" />
            <div v-else class="rt-list__ava rt-list__ava--null"><h4>{{ heroInitial(u) }}</h4></div>
            <div class="rt-list__name">{{ heroName(u) }}</div>
            <div class="rt-list__count">
              <div class="kit-icon" v-html="countIcon"></div>
              <span>{{ heroCount(u) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── твоё место: компактная пилюля по центру над меню ── -->
      <div v-if="me" class="rt-me">
        <div class="rt-me__ava">
          <img v-if="myPhoto" :src="myPhoto" alt="" />
          <div v-else class="rt-me__ava-null"><h4>{{ myName ? myName[0] : 'U' }}</h4></div>
        </div>
        <div class="rt-me__name">{{ myName || 'You' }}</div>
        <div class="rt-me__right">
          <span class="rt-me__rank">#{{ myRank }}</span>
          <div class="rt-me__dot"></div>
          <div class="kit-icon" v-html="countIcon"></div>
          <span class="rt-me__count">{{ myCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from '../Icon';
import { cleanString, pluralizeReferrals } from '../../utils/useApp';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { pluralizeGift } from '../../utils/useGift';

import * as nftsApi from '../../api/nftApi';

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
  },

  data() {
    return {
      isLoading: this.Skeleton,

      storeCache: useCacheStore(),

      isFetchingMore: false,

      selectedSection: 'holders',
      topRefs: [],
      me: null,

      Icon,
      cleanString,
      pluralizeGift,
      pluralizeReferrals,
    };
  },

  mounted() {
    this.loadResources();
    this.storeCache.RatingApp = [];
    this.fetchTop();
    this.getTopRefs();
    this.getMe();
  },

  computed: {
    isHolders() {
      return this.selectedSection === 'holders';
    },
    // подиум: 2 — 1 — 3
    heroThree() {
      const src = this.isHolders ? this.storeCache.RatingApp : this.topRefs;
      const top = src.slice(0, 3);
      const first = top.find(u => u.rankNumber === 1);
      const sides = top.filter(u => u.rankNumber !== 1);
      return [sides[0], first, sides[1]].filter(Boolean);
    },
    listRest() {
      const src = this.isHolders ? this.storeCache.RatingApp : this.topRefs;
      return src.slice(3).filter(u => u && u.rankNumber !== undefined);
    },
    myRank() {
      if (!this.me) return 0;
      return this.isHolders ? this.me.nft_rank : this.me.ref_rank;
    },
    myCount() {
      if (!this.me) return 0;
      return this.isHolders ? this.me.nft_count : this.me.ref_count;
    },
    myName() {
      return cleanString(this.storeCache.TelegramData?.user?.firstName || '');
    },
    myPhoto() {
      return this.storeCache.TelegramData?.user?.photoUrl || '';
    },
    countIcon() {
      return this.isHolders ? Icon.Gift : Icon.Friends;
    },
  },

  methods: {
    // оба источника (холдеры/рефералы) в одном шаблоне: поля разные,
    // поэтому доступ через хелперы
    heroKey(u) { return u?.user_id ?? u?.tld; },
    heroPhoto(u) { return u?.user_avatar ?? u?.photo ?? ''; },
    heroRank(u) { return u?.rankNumber ?? 'x'; },
    heroCount(u) { return u?.countsReceived ?? u?.refCount ?? 0; },
    heroName(u) {
      const n = cleanString(u?.user_full_name ?? u?.name ?? '');
      return n && n.trim() ? n : 'No Name';
    },
    heroInitial(u) {
      const n = this.heroName(u);
      return n && n !== 'No Name' ? n[0] : 'U';
    },
    countLabel(count) {
      const lang = this.storeCache.TelegramData?.user?.language || 'en';
      return this.isHolders
        ? pluralizeGift(this.$t('rating.gifts'), count, lang)
        : pluralizeReferrals(this.$t('rating.referrals'), count, lang);
    },
    setSection(s) {
      if (this.selectedSection === s) return;
      this.selectedSection = s;
    },

    async loadResources() {
      try {
        await document.fonts.ready;
        this.isLoading = false;
        this.$emit('loadSuccess');
      } catch (error) {
        console.error('Ошибка при загрузке ресурсов:', error);
      }
    },

    // весь топ-100 одним запросом: дозагрузка по скроллу дёргала список
    async fetchTop() {
      if (this.isFetchingMore) return;
      this.isFetchingMore = true;
      try {
        const top = await nftsApi.getRating(0, 100);
        if (top && top.items) this.storeCache.RatingApp = top.items;
      } catch (err) {} finally {
        this.isFetchingMore = false;
      }
    },

    async getTopRefs() {
      try {
        const users = await nftsApi.getTopRefs();
        if (!users) return;
        this.topRefs = users.items;
      } catch (error) {}
    },

    async getMe() {
      try {
        const res = await nftsApi.getRatingMe();
        if (res && res.ok) this.me = res.me;
      } catch (error) {}
    },

    routeUser(userId) {
      if (!userId) return;
      this.$router.push({ name: 'view', params: { id: userId } });
    },
  },
};
</script>
