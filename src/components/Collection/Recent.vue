<template>
    <div class="_direction _comp _item _recents">
        <div v-if="isLoading" class="_skeleton">
          <div class="_items">
            <div class="_item"></div>
            <div class="_item"></div>
            <div class="_item"></div>
          </div>
        </div>
        <div v-else class="_content">
          <div class="_items">
            <div 
              v-if="RecentList.length > 0" 
              v-for="recent in RecentList"
              class="_item"
            >
              <div class="_avatar">
                <img
                  v-if="recent.userPhoto"
                  @load="recent.userPhoto"
                  @error="recent.userPhoto = false"
                  :src="recent.userPhoto"
                />
                <div v-else class="_avatar_null">
                  <h4>{{ recent.userName[0] }}</h4>
                </div>
              </div>
              <div class="_context">
                <div class="_title">
                  <h4>
                    <span>{{ cleanString(recent.userName).trim() }}</span>
                    <b>{{ $t('collection.recentsAction3') }}</b>
                  </h4>
                </div>
                <div class="_descr">
                  <p>{{ unixToRelative(recent.time) }}</p>
                </div>
              </div>
              <div class="_price">
                <div class="_image">
                  <img :src="Image_Stars" />
                </div>
                <div class="_amount">
                  <span>{{ checkPriceNumber(recent.price) || 0 }}</span>
                </div>
              </div>
            </div>
            <div v-else class="_item _nullRecents">
                <h4>{{ $t('collection.recentsNull') }}</h4>
            </div>
          </div>
        </div>
    </div>
  </template>
  
  <script>
  import * as historyApi from '../../api/historyApi';
  import { checkPriceNumber } from '../../utils/useGift';
  import { unixToRelative } from '../../utils/useApp';
  import { cleanString } from '../../utils/useApp';

  import Image_Stars from '@/assets/images/stars.png';

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
      NftKey: {
        type: String,
        required: true,
      },
      RecentList: {
        type: Array,
        required: true,
      },
    },
  
    data() {
      return {
        isLoading: this.Skeleton,

        HistoryList: {},

        cleanString,
        
        checkPriceNumber,
        unixToRelative,

        Image_Stars,
      };
    },
  
    mounted() {
      this.loadResources();
    },

    computed: {
      isLoading() {
        return this.Skeleton;
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
    }
  };
  </script>