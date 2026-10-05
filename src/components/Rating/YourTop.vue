<template>
  <div :class="['_direction _comp _item _yourTop', Key]">
    <div v-if="isLoading" class="_skeleton">
      <div class="_block"></div>
    </div>
    <div v-else class="_content">
      <div class="_block">
        <div class="_user">
          <div class="_user_left">
            <div v-if="Comp.YourPhoto" class="_user_avatar">
              <img 
                @error="Comp.YourPhoto = false"
                :src="Comp.YourPhoto"
                alt="avatar"
              />
            </div>
            <div v-else class="_user_avatar avatar_null">
              <h4>{{ Comp.YourName ? Comp.YourName[0] : 'U' }}</h4>
            </div>
          </div>
          <div class="_user_center">
            <div class="_user_center_name">
              <h4>{{ Comp.YourName && Comp.YourName.trim() ? Comp.YourName : 'You' }}</h4>
              <span class="_you_badge">YOU</span>
            </div>
            <div class="_user_center_gifts">
              <div class="kit-icon" v-html="Icon.Gift"></div>
              <p>
                {{ UserNftsCount }} 
                {{ pluralizeGift(
                    $t('app.sendGiftText'),
                    UserNftsCount, 
                    storeCache.TelegramData?.user?.language || 'en'
                  ) 
                }}
              </p>
            </div>
          </div>
          <div class="_user_right" v-if="storeCache?.UserData?.Rating?.rankNumber">
            <div class="_rank_tag">
              <span>#{{ storeCache.UserData.Rating.rankNumber }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { pluralizeGift } from '../../utils/useGift';
import { Icon } from '../Icon';

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
    Comp: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      storeCache: useCacheStore(),

      isLoading: this.Skeleton,

      Icon,
      pluralizeGift,
    };
  },

  mounted() {
    this.loadResources();
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
    UserNftsCount() {
      return this.storeCache.UserData.nftsCountReceived + this.storeCache.UserData.nftsCountPurchased;
    }
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
  },
};
</script>