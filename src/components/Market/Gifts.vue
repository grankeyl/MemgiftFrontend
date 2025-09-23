<template>
  <div class="_direction _comp _item gifts" v-if="GiftsList && GiftsList.length > 0">
      <div v-if="isLoading" class="_skeleton">
      </div>
      <div class="_content" :class="{ hide: isLoading }">
        <div class="items">
          <div
            v-for="(gift, index) in GiftsList"
            :key="gift.id || index"
            class="item"
            :ref="el => setLastItemRef(el, index, GiftsList.length)"
          >
            <div class="mark">
              <p>#{{ gift.core.upgrade.seq }}</p>
            </div>

            <div
              @click="openGift(gift)"
              class="background upg"
              :style="{
                '--center-color': gift.core.upgrade.background.colors_center,
                '--around-color': gift.core.upgrade.background.colors_around,
              }"
            ></div>

            <div @click="openGift(gift)" class="symbol upg">
              <img :src="gift.core.upgrade.symbol.image" :alt="gift.core.upgrade.symbol.name" />
            </div>

            <div @click="openGift(gift)" class="model">
              <div class="upg">
                <div v-if="gift.core.gift.media === 'svg'" class="image">
                  <img :src="gift.core.upgrade.nft_name.image" alt="model" />
                </div>
                <div v-if="gift.core.gift.media === 'lottie'" class="image">
                  <img :src="getUpgradedModel(gift.core.gift.u_key, gift.core.upgrade.nft_name.name, 'svg')" alt="model" />
                </div>
              </div>
            </div>

            <div class="name">
              <h4>{{ gift.core.upgrade.nft_name.name }}</h4>
            </div>

            <div class="buttons" :class="{ owner: iOwner(gift.balance_owner_id) }">
              <button @click="openGift(gift)">
                <h5>{{ cutNumber(gift.price_ton) }}</h5> 
                <img :src="TonWhiteImg" alt="ton" />
              </button>
              <button 
                @click="addToBasket(gift)"
                :class="{ added: checkGiftInBasket(gift) }"
              >
                <img :src="BasketWhiteImg" alt="basket" />
                <img :src="DoneImg" alt="basket" />
              </button>
            </div>
          </div>
        </div>
      </div>
  </div>

  <div
    v-if="Searching"
    class="_direction _comp _item _loads"
  >
    <div class="null">
      <div class="load-icon"></div>
    </div>
  </div>

  <div
    v-if="!Searching && isEmptyList"
    class="_direction _comp _item _empty"
  >
    <div class="null">
      <div class="image">
        <img :src="ProfileEmptyImg" alt="empty" />
      </div>
      <div class="title">
        <h4>{{ $t('profile.profileGiftsNull') }}</h4>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { getUpgradedModel } from '../../utils/useGift';
import { cutNumber } from '../../utils/useTon';
import { Icon } from '../Icon';

import Lottie from '../Lottie.vue';

// Images
import TonWhiteImg from '@/assets/images/market/ton-white.svg';
import BasketWhiteImg from '@/assets/images/market/basket-white.svg';
import DoneImg from '@/assets/images/market/done.svg';
import ProfileEmptyImg from '@/assets/images/profile/empty.svg';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    GiftsList: { type: Array, required: true },
    Searching: { type: Boolean, required: true },
    HasMore: { type: Boolean, default: false },
  },
  emits: ['openGift', 'addToBasket', 'loadMore', 'loadSuccess'],

  components: {
    Lottie,
  },

  data() {
    return {
      TonWhiteImg,
      BasketWhiteImg,
      DoneImg,
      ProfileEmptyImg,

      storeCache: useCacheStore(),
      isLoading: this.Skeleton,

      Icon,
      cutNumber,
      getUpgradedModel,
    };
  },

  setup(props, { emit }) {
    const lastItemEl = ref(null);
    let io = null;
    let rootEl = null;
    let lock = false; // защитный замок от мульти-триггеров

    const getScrollParent = (el) => {
      if (!el) return null;
      let p = el.parentElement;
      while (p && p !== document.body) {
        const st = getComputedStyle(p);
        if (st.overflowY === 'auto' || st.overflowY === 'scroll') return p;
        p = p.parentElement;
      }
      return null;
    };

    const observe = () => {
      if (io) { io.disconnect(); io = null; }
      const el = lastItemEl.value;
      if (!el) return;

      if (!rootEl) rootEl = getScrollParent(el);

      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          if (lock) return;                 // уже летит запрос – ждём
          if (props.Searching) return;      // родитель уже грузит
          if (!props.HasMore) return;       // нечего грузить

          lock = true;
          emit('loadMore');
        },
        {
          root: rootEl ?? null,
          rootMargin: '0px 0px 300px 0px',
          threshold: 0,
        }
      );
      io.observe(el);
    };

    // Ставим ref только на последний элемент
    const setLastItemRef = (el, idx, len) => {
      if (idx === len - 1) lastItemEl.value = el || null;
    };

    onMounted(() => nextTick(observe));
    onBeforeUnmount(() => { io?.disconnect(); io = null; });

    // Когда список меняется — перевешиваем наблюдатель на новый «последний элемент»
    watch(() => props.GiftsList?.length, () => nextTick(observe));

    // Когда загрузка закончилась — снимаем «замок»
    watch(() => props.Searching, (now, prev) => {
      if (prev && !now) {
        // загрузка завершилась
        lock = false;
        // если новый хвост уже в зоне — IO сам триггернёт снова
      }
    });

    // Если контента мало и «дно» уже видно — один «пинок»
    const tryKick = () => {
      if (!props.Searching && props.HasMore && lastItemEl.value) {
        const rect = lastItemEl.value.getBoundingClientRect();
        const inView =
          rect.top < (window.innerHeight || document.documentElement.clientHeight) + 300;
        if (inView && !lock) {
          lock = true;
          emit('loadMore');
        }
      }
    };
    watch(() => props.GiftsList?.length, () => nextTick(tryKick));

    return { setLastItemRef };
  },

  mounted() {
    this.loadResources();
  },

  computed: {
    isEmptyList() {
       return !this.GiftsList || this.GiftsList.length === 0;
    },
  },

  methods: {
    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadIcons()]);
        this.isLoading = false;
        this.$emit("loadSuccess");
      } catch (error) {
        console.error("Ошибка при загрузке ресурсов:", error);
      }
    },

    iOwner(id) {
      if (!this.storeCache.UserData.user.Balance) return false;
      if (this.storeCache.UserData.user.Balance.user_uuid === id) return true;
      return false;
    },
    
    checkGiftInBasket(gift) {
      return this.storeCache.Market.Basket.Items.some((item) => item.id === gift.id);
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
          } else if (icon.tagName === "SVG") {
            return new Promise((resolveSvg) => {
              const checkSvgLoaded = () => {
                if (icon.getBBox().width > 0) {
                  resolveSvg();
                } else {
                  requestAnimationFrame(checkSvgLoaded);
                }
              };
              checkSvgLoaded();
            });
          }
        });

        Promise.all(promises).then(resolve).catch(reject);
      });
    },

    openGift(gift) {
      this.$emit('openGift', gift);
    },

    addToBasket(gift) {
      this.$emit('addToBasket', gift);
    },
  },
};
</script>

<style lang="sass">
@use "./Gifts.sass"
</style>