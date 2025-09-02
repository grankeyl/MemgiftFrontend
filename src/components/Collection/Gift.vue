<template>
    <div class="_direction _comp _item _gift">
        <div v-if="isLoading" class="_skeleton">
            <div class="_item"></div>
        </div>
        <div v-else class="_content">
            <div class="_item" :class="NftRarity">
              <div class="_symbols">
                <img :src="NftSymbols" />
              </div>
              <div class="_tickets">
                <img :src="Image_Ticket" alt="tickets" />
                <p>{{ NftTickets }}</p>
              </div>
              <div class="_mark">
                <span>{{ $t('collection.giftCollectable') }}</span>
              </div>
              <div v-if="NftMedia === 'svg'" class="_nft">
                <img :src="NftImage" />
              </div>
              <div v-if="NftMedia === 'lottie'" class="_nft _lottie">
                <GiftLottie
                  class="lt"
                  :path="`/gifts/lottie/${NftKey}.json`"
                  :loop="true"
                  width="25"
                  height="25"
                  renderer="svg"
                />
              </div>
            </div>
        </div>
    </div>
  </template>
  
  <script>
  import Image_Ticket from '@/assets/images/ticket.svg';
  import GiftLottie from '../GiftLottie.vue';

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
      NftSymbols: {
        type: String,
        required: true,
      },
      NftImage: {
        type: String,
        required: true,
      },
      NftRarity: {
        type: String,
        required: true,
      },
      NftTickets: {
        type: String,
        required: true,
      },
      NftMedia: {
        type: String,
        required: true,
      }
    },

    components: {
      GiftLottie,
    },
  
    data() {
      return {
        isLoading: this.Skeleton,

        Image_Ticket,
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