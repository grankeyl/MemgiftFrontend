<template>
  <div :class="['_direction _comp _item _leaderboard', Key]">
    <div v-if="isLoading" class="_skeleton">
      <div class="sections">
        <!-- <div class="section"></div> -->
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
      <div class="rt-tabs">
        <div class="rt-tabs__item" :class="{ active: selectedSection === 'holders' }" @click="selectedSection = 'holders'">
          {{ $t('rating.section1') }}
        </div>
        <div class="rt-tabs__item" :class="{ active: selectedSection === 'others' }" @click="selectedSection = 'others'">
          {{ $t('rating.section2') }}
        </div>
        <div class="rt-tabs__bg" :class="{ right: selectedSection === 'others' }"></div>
      </div>

      <div v-if="selectedSection === 'contest'" class="topFlexed">
        <div class="top contest">
          <div class="top-three">
            <div  
              v-if="TopContestThree && TopContestThree.length > 0"
              v-for="(leader, index) in TopContestThree"
              @click="routeUser(leader.tld)"
              :key="leader?.tld || index"
              :class="`place-${leader?.rank ?? 'x'}`"
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
                <div class="gift">
                  <img v-if="leader?.rank && leader?.rank === 1" src="https://storage.googleapis.com/portals-market/gifts/astralshard/models/png/muffin.png" alt="ton" />
                  <img v-if="leader?.rank && leader?.rank === 2" src="https://storage.googleapis.com/portals-market/gifts/toybear/models/png/bluedandy.png" alt="ton" />
                  <img v-if="leader?.rank && leader?.rank === 3" src="https://storage.googleapis.com/portals-market/gifts/ionicdryer/models/png/cyberprism.png" alt="ton" />
                </div>
              </div>
              <div class="name">{{ cleanString(leader?.name) || 'No Name' }}</div>
              <div class="gifts">
                <p>{{ cutNumberNano(leader?.sum_volume_nano) }}</p>
                <img src="/profile/ton.svg" alt="">
              </div>
            </div>
            <div v-else class="sk-block">
            </div>
          </div>

          <div class="progress-contest">
            <div class="progressed-texts">
              <div class="title">
                <h4>100%</h4>
              </div>
              <div class="title">
                <h4><span>Contest cancelled</span></h4>
              </div>
            </div>
            <div class="progress-contest-lined">
              <div class="progress-contest-line" :style="{ width: 100 + '%' }"></div>
            </div>
          </div>

          <!-- <div class="progress-contest">
            <div class="progressed-texts">
              <div class="title">
                <h4>{{ topContest.progress_to_20000_ton_percent }}%</h4>
              </div>
              <div class="title">
                <h4><span>{{ topContest.total_sum_volume_ton }}</span> / 20 000</h4>
                <img src="/profile/ton.svg" alt="ton" />
              </div>
            </div>
            <div class="progress-contest-lined">
              <div class="progress-contest-line" :style="{ width: topContest.progress_to_20000_ton_percent + '%' }"></div>
            </div>
            <div class="info">
              <p>{{ $t('rating.contestDescr') }}</p>
            </div>
          </div> -->

          <div v-if="topContest.me" class="other-list my">
            <div
              class="other-user"
            >
              <div class="info">
                <div v-if="topContest.me" class="name">
                  <h4>{{ topContest.me.name }}</h4>
                  <span>#{{ topContest.me.rank }}</span>
                </div>
                <div v-else class="name">
                  <h4>{{ topContest.me.name }}</h4>
                </div>
                <div class="gifts" v-if="topContest.me">
                  <p>My volume: {{ cutNumberNano(topContest.me.sum_volume_nano) }}</p>
                  <img src="/profile/ton.svg" alt="">
                </div>
              </div>
              <img 
                v-if="topContest.me && topContest.me.photo"
                :src="topContest.me.photo"
                alt="avatar"
                class="small-avatar"
              />
              <div v-else class="small-avatar avatar_null">
                <h4>h</h4>
              </div>
            </div>
          </div>

          <div class="other-list">
            <div
              v-if="TopContestOther && TopContestOther.length > 0"
              v-for="(leader, index) in TopContestOther"
              @click="routeUser(leader.tld)"
              :key="leader?.tld || index"
              :class="`place-${leader?.rank ?? 'x'}`"
              class="other-user"
            >
              <div v-if="leader?.rank && leader?.rank > 10" class="rank">{{ leader?.rank ?? 'x' }}</div>
              <div v-if="leader?.rank && leader?.rank < 11" class="gift">
                <img v-if="leader?.rank && leader?.rank === 4" src="https://storage.googleapis.com/portals-market/gifts/stellarrocket/models/png/spaceveggie.png" alt="ton" />
                <img v-if="leader?.rank && leader?.rank >= 5 && leader?.rank <= 10" src="https://storage.googleapis.com/portals-market/gifts/freshsocks/models/png/gunkfight.png" alt="ton" />
              </div>
              <div class="info">
                <div class="name" v-if="cleanString(leader.name) && cleanString(leader.name).trim()">{{ cleanString(leader.name) }}</div>
                <div class="name" v-else>No Name</div>
                <div class="gifts">
                  <p>{{ cutNumberNano(leader?.sum_volume_nano) }}</p>
                  <img src="/profile/ton.svg" alt="">
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
            <div v-else class="sk-block"></div>
          </div>
        </div>
      </div>

      <div v-if="selectedSection !== 'contest'" class="topFlexed">
        <div class="top holders" :class="{ hide: selectedSection === 'others' }">
          <div class="top-three">
            <div
              v-for="(leader, index) in TopThree"
              @click="routeUser(leader.user_id)"
              :key="leader?.user_id || index"
              :class="`place-${leader?.rankNumber ?? 'x'}`"
              class="top-user rt-podium"
              :style="{ animationDelay: (index === 1 ? '0.1s' : index === 0 ? '0.25s' : '0.35s') }"
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
              class="other-user rt-row"
              :style="{ animationDelay: (index * 0.04) + 's' }"
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
              class="top-user rt-podium"
              :style="{ animationDelay: (index === 1 ? '0.1s' : index === 0 ? '0.25s' : '0.35s') }"
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
                referrals
              </div>
            </div>
          </div>

          <div class="other-list">
            <div
              v-for="(leader, index) in TopRefsOther"
              @click="routeUser(leader.tld)"
              :key="leader?.tld || index"
              :class="`place-${leader?.rankNumber ?? 'x'}`"
              class="other-user rt-row"
              :style="{ animationDelay: (index * 0.04) + 's' }"
            >
              <div class="rank">{{ leader?.rankNumber ?? 'x' }}</div>
              <div class="info">
                <div class="name" v-if="cleanString(leader.name) && cleanString(leader.name).trim()">{{ cleanString(leader.name) }}</div>
                <div class="name" v-else>No Name</div>
                <div class="gifts">
                  {{ leader?.refCount }} 
                  referrals
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
import { cutNumberNano } from '../../utils/useTon';

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
      topContest: [],
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
      cutNumberNano,
    };
  },

  mounted() {
    this.loadResources();
    this.ratingAppOffset = 0;
    this.storeCache.RatingApp = [];
    this.fetchMoreIfNeeded();
    this.getTopRefs();
    this.getTopContest();
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
    TopContestThree() {
      if (!this.topContest.top) return [];
      const topThree = this.topContest.top.slice(0, 3);
      const center = topThree.find(user => user.rank === 1);
      const sides = topThree.filter(user => user.rank !== 1); 
      return [sides[0], center, sides[1]];
    },
    TopContestOther() {
      if (!this.topContest.top) return [];
      return this.topContest.top.slice(3).filter(user => user && user.rank !== undefined);
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

    async getTopContest() {
      try {
        const res = await nftsApi.getTopContest();
        if (!res) return;
        this.topContest = res;
      } catch (error) {}
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