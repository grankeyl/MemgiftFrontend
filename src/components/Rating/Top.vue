<template>
  <div :class="['_direction _comp _item _leaderboard', Key]">
    <div v-if="isLoading" class="_skeleton">
      <div class="sections">
        <div class="section"></div>
        <div class="section"></div>
      </div>

      <div class="topFlexed">
        <div class="top holders">
          <div class="top-three">
            <div class="top-user place-2">
              <div class="avatar-wrapper">
                <div class="avatar avatar_null">
                  <h4>B</h4>
                </div>
                <div class="rank-badge">x</div>
              </div>
              <div class="name">No name</div>
              <div class="gifts">
                0
                {{ pluralizeGift(
                  $t('rating.gifts'),
                  0,
                  storeCache.TelegramData.user.language
                ) }}
              </div>
            </div>
            <div class="top-user place-1">
              <div class="avatar-wrapper">
                <div class="avatar avatar_null">
                  <h4>A</h4>
                </div>
                <div class="rank-badge">x</div>
              </div>
              <div class="name">No name</div>
              <div class="gifts">
                0
                {{ pluralizeGift(
                  $t('rating.gifts'),
                  0,
                  storeCache.TelegramData.user.language
                ) }}
              </div>
            </div>
            <div class="top-user place-3">
              <div class="avatar-wrapper">
                <div class="avatar avatar_null">
                  <h4>C</h4>
                </div>
                <div class="rank-badge">x</div>
              </div>
              <div class="name">No name</div>
              <div class="gifts">
                0
                {{ pluralizeGift(
                  $t('rating.gifts'),
                  0,
                  storeCache.TelegramData.user.language
                ) }}
              </div>
            </div>
          </div>

          <div class="other-list">
            <div
              v-for="index in 5"
              class="other-user"
            >
              <div class="rank">{{ index+3 }}</div>
              <div class="info">
                <div class="name">No Name</div>
                <div class="gifts">
                  0
                  {{ pluralizeGift(
                    $t('rating.gifts'),
                    0,
                    storeCache.TelegramData.user.language
                  ) }}
                </div>
              </div>
              <div class="small-avatar avatar_null">
                <h4>{{ index+3 }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="_content">
      <div class="sections">
        <div class="section" :class="{ active: selectedSection === 'holders' }" @click="selectedSection = 'holders'">
          <h4>{{ $t('rating.section1') }}</h4>
        </div>
        <div class="section" :class="{ active: selectedSection === 'others' }" @click="selectedSection = 'others'">
          <h4>{{ $t('rating.section2') }}</h4>
        </div>
      </div>

      <div class="topFlexed">
        <div class="top holders" :class="{ hide: selectedSection === 'others' }">
          <div class="top-three">
            <div
              v-for="(leader, index) in TopThree"
              @click="routeUser(leader.user_id)"
              :key="leader?.user_id || index"
              :class="`place-${leader?.rankNumber ?? 'x'}`"
              class="top-user"
            >
              <div class="avatar-wrapper">
                <img 
                  v-if="leader && leader?.user_avatar"
                  :src="leader?.user_avatar || ''"
                  alt="avatar"
                  class="avatar"
                />
                <div v-else class="avatar avatar_null">
                  <h4 v-if="leader?.user_full_name">{{ leader?.user_full_name[0] }}</h4>
                  <h4 v-else>N</h4>
                </div>
                <div class="rank-badge">{{ leader?.rankNumber ?? 'x' }}</div>
              </div>
              <div class="name">{{ cleanString(leader?.user_full_name) || 'No Name' }}</div>
              <div class="gifts">
                {{ leader?.countsReceived }} 
                {{ pluralizeGift(
                  $t('rating.gifts'),
                  leader?.countsReceived,
                  storeCache.TelegramData.user.language
                ) }}
              </div>
            </div>
          </div>

          <div class="other-list">
            <div
              v-for="(leader, index) in TopOther"
              @click="routeUser(leader.user_id)"
              :key="leader?.user_id || index"
              :class="`place-${leader?.rankNumber ?? 'x'}`"
              class="other-user"
            >
              <div class="rank">{{ leader?.rankNumber ?? 'x' }}</div>
              <div class="info">
                <div class="name" v-if="cleanString(leader.user_full_name) && cleanString(leader.user_full_name).trim()">{{ cleanString(leader.user_full_name) }}</div>
                <div class="name" v-else>No Name</div>
                <div class="gifts">
                  {{ leader?.countsReceived }} 
                  {{ pluralizeGift(
                    $t('rating.gifts'),
                    leader?.countsReceived,
                    storeCache.TelegramData.user.language
                  ) }}
                </div>
              </div>
              <img 
                v-if="leader.user_avatar"
                :src="leader.user_avatar || ''"
                alt="avatar"
                class="small-avatar"
              />
              <div v-else class="small-avatar avatar_null">
                <h4>{{ leader.user_full_name[0] }}</h4>
              </div>
            </div>
          </div>
        </div>

        <div class="top gifts" :class="{ hide: selectedSection === 'holders' }">
          <div class="top-three">
            <div
              v-for="(leader, index) in TopRefsThree"
              @click="routeUser(leader.tld)"
              :key="leader?.tld || index"
              :class="`place-${leader?.rankNumber ?? 'x'}`"
              class="top-user"
            >
              <div class="avatar-wrapper">
                <img 
                  v-if="leader && leader?.photo"
                  :src="leader?.photo || ''"
                  alt="avatar"
                  class="avatar"
                />
                <div v-else class="avatar avatar_null">
                  <h4 v-if="leader?.name">{{ leader?.name[0] }}</h4>
                  <h4 v-else>N</h4>
                </div>
                <div class="rank-badge">{{ leader?.rankNumber ?? 'x' }}</div>
              </div>
              <div class="name">{{ cleanString(leader?.name) || 'No Name' }}</div>
              <div class="gifts">
                {{ leader?.refCount }}
                {{ pluralizeGift(
                  $t('rating.referrals'),
                  leader?.refCount, 
                  storeCache.TelegramData.user.language
                ) }}
              </div>
            </div>
          </div>

          <div class="other-list">
            <div
              v-for="(leader, index) in TopRefsOther"
              @click="routeUser(leader.tld)"
              :key="leader?.tld || index"
              :class="`place-${leader?.rankNumber ?? 'x'}`"
              class="other-user"
            >
              <div class="rank">{{ leader?.rankNumber ?? 'x' }}</div>
              <div class="info">
                <div class="name" v-if="cleanString(leader.name) && cleanString(leader.name).trim()">{{ cleanString(leader.name) }}</div>
                <div class="name" v-else>No Name</div>
                <div class="gifts">
                  {{ leader?.refCount }} 
                  {{ pluralizeGift(
                    $t('rating.referrals'),
                    leader?.refCount, 
                    storeCache.TelegramData.user.language
                  ) }}
                </div>
              </div>
              <img 
                v-if="leader.photo"
                :src="leader.photo || ''"
                alt="avatar"
                class="small-avatar"
              />
              <div v-else class="small-avatar avatar_null">
                <h4>{{ leader.name[0] }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="storeCache.RatingApp.length"
        :ref="'lastItem'"
        style="height: 1px"
      ></div>
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

      ratingAppOffset: 0,
      ratingAppLimit: 20,
      isFetchingMore: false,

      selectedSection: 'holders',
      topRefs: [],

      topThree: [
        { rank: 2, gifts: 9 },
        { rank: 1, gifts: 10 },
        { rank: 3, gifts: 8 },
      ],

      Icon,

      cleanString,
      pluralizeGift,
      pluralizeReferrals,
    };
  },

  mounted() {
    this.loadResources();
    this.ratingAppOffset = 0;
    this.storeCache.RatingApp = [];
    this.fetchMoreIfNeeded();
    this.getTopRefs();
    this.$watch(
      () => this.storeCache.RatingApp,
      () => {
        this.$nextTick(() => this.observeLastItem());
      },
      { deep: true }
    );
  },

  beforeUnmount() {
    if (this._observer) {
      this._observer.disconnect();
    }
  },

  computed: {
    TopThree() {
      const topThree = this.storeCache.RatingApp.slice(0, 3);
      const center = topThree.find(user => user.rankNumber === 1);
      const sides = topThree.filter(user => user.rankNumber !== 1);
      return [sides[0], center, sides[1]];
    },
    TopOther() {
      return this.storeCache.RatingApp.slice(3).filter(user => user && user.rankNumber !== undefined);
    },
    TopRefsThree() {
      const topThree = this.topRefs.slice(0, 3);
      const center = topThree.find(user => user.rankNumber === 1);
      const sides = topThree.filter(user => user.rankNumber !== 1); 
      return [sides[0], center, sides[1]];
    },
    TopRefsOther() {
      return this.topRefs.slice(3).filter(user => user && user.rankNumber !== undefined);
    },
  },

  methods: {
    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadIcons()]);
        this.observeLastItem();
        this.isLoading = false;
        this.$emit("loadSuccess");
      } catch (error) {
        console.error("Ошибка при загрузке ресурсов:", error);
      }
    },

    loadFonts() {
      return document.fonts.ready;
    },

    loadIcons() {
      return new Promise((resolve, reject) => {
        const div = document.createElement("div");
        div.innerHTML = this.Icon;

        const icons = div.querySelectorAll("img, svg");
        const promises = Array.from(icons).map((icon) => {
          if (icon.tagName === "IMG") {
            return new Promise((resolveImage, rejectImage) => {
              const img = new Image();
              img.src = icon.src;
              img.onload = resolveImage;
              img.onerror = rejectImage;
            });
          } else {
            return Promise.resolve();
          }
        });

        Promise.all(promises).then(resolve).catch(reject);
      });
    },

    observeLastItem() {
      this.$nextTick(() => {
        const refs = this.$refs.lastItem;
        const last = Array.isArray(refs) ? refs[refs.length - 1] : refs;
        if (!last) return;

        if (this._observer) {
          this._observer.disconnect();
        }

        this._observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              this.fetchMoreIfNeeded();
            }
          },
          { threshold: 1.0 }
        );

        this._observer.observe(last);
      });
    },

    async fetchMoreIfNeeded() {
      if (this.isFetchingMore) return;
      if (this.ratingAppOffset >= 100) return;

      this.isFetchingMore = true;

      try {
        const more = await nftsApi.getRating(this.ratingAppOffset, this.ratingAppLimit);
        if (more.items.length) {
          const ids = new Set(this.storeCache.RatingApp.map(i => i.user_id));
          const unique = more.items.filter(i => !ids.has(i.user_id));
          console.log(unique);
          this.storeCache.RatingApp.push(...unique);
          this.ratingAppOffset += this.ratingAppLimit;
        }
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

    routeUser(userId) {
      this.$router.push({
        name: 'view',
        params: {
          id: userId
        }
      });
    },
  },
};
</script>