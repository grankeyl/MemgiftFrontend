<template>
  <div :class="containerClasses">
    <div v-if="isLoading" class="_skeleton">
      <div class="_wSlide">
        <div class="_slide"></div>
        <div class="_slide"></div>
      </div>
      <div class="slider-pagination">
        <button class="dot big">
          <span class="fill"></span>
        </button>
        <button class="dot">
          <span class="fill"></span>
        </button>
      </div>
    </div>
    <div v-else class="_content">
      <swiper
        v-bind="swiperOptions"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
        @autoplayTimeLeft="onAutoplayTimeLeft"
      >
        <swiper-slide
          v-for="(slide, index) in slides"
          :key="index"
          :class="{ last: index === slides.length - 1 }"
        >
          <div
            class="slideBg"
            :class="{ clickable: !!slide.Link }"
            :style="{ backgroundImage: `url(${slide.BgImage})` }"
            @click="openSlide(slide)"
          />
        </swiper-slide>
      </swiper>

      <div class="slider-pagination">
        <button
          v-for="(_, i) in slides"
          :key="i"
          class="dot"
          :class="{ active: activeSlide === i }"
          @click="goToSlide(i)"
        >
          <span
            class="fill"
            :style="{
              width: `${
                (activeSlide === i
                  ? progress
                  : activeSlide > i
                  ? 1
                  : 0) * 100
              }%`
            }"
          ></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

import TelegramModule from '../../hooks/useTelegram';
import Lottie from '../Lottie.vue';

export default {
  props: {
    Skeleton: Boolean,
    SkeletonTime: Number,
    Key: String,
    slides: Array,
  },

  data() {
    return {
      swiper: null,
      activeSlide: 0,
      progress: 0,
      autoplayDelay: 6100,
      swiperOptions: {
        modules: [Autoplay],
        slidesPerView: 'auto',
        spaceBetween: 12,
        speed: 440,
        autoplay: {
          delay: 3700,
          disableOnInteraction: false,
        },
      },
    };
  },

  components: {
    Swiper,
    SwiperSlide,
    Lottie,
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
    containerClasses() {
      return ['_direction', '_comp', '_item', '_slider', this.Key];
    },
  },

  methods: {
    // ссылка есть не у каждого слайда — молча ничего не делаем
    openSlide(slide) {
      if (!slide?.Link) return;
      TelegramModule.useLink(slide.Link);
    },

    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadImages()]);
        this.$emit('loadSuccess');
      } catch (error) {
        console.error('Ошибка при загрузке ресурсов:', error);
      }
    },

    loadFonts() {
      return document.fonts.ready;
    },

    loadImages() {
      const imagePromises = this.slides.flatMap(slide => {
        return [slide.ImageContent, slide.BgImage].map(imageSrc => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = imageSrc;
            img.onload = resolve;
            img.onerror = reject;
          });
        });
      });

      return Promise.allSettled(imagePromises);
    },

    handleButtonClick(slide) {
      if (slide.Button === 'Buy' || slide.Button === 'Author') {
        this.openCollection(slide.ButtonKey);
      } else if (slide.Button === 'Reading') {
        if (slide.ButtonKey && !slide.ButtonLink) {
          this.openCollection(slide.ButtonKey);
        } else {
          this.goToReading(slide.ButtonLink);
        }
      }
    },

    openCollection(collectionKey) {
      this.$router.push(`/collection/${collectionKey}`);
    },

    goToReading(link) {
      TelegramModule.useLink(link);
    },

    onSwiper(swiper) {
      this.swiper = swiper;
    },

    onSlideChange(swiper) {
      this.activeSlide = swiper.realIndex;
    },

    onAutoplayTimeLeft(swiper, time, percentage) {
      this.progress = 1 - percentage;
    },

    goToSlide(i) {
      if (this.swiper) this.swiper.slideTo(i);
    },
  },
};
</script>

<style>
.slider-pagination {
  position: relative;
  margin-top: 21px;
  justify-content: center;
  align-items: center;
  width: 100%;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(255,255,255,.22);
  border: none;
  padding: 0;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: width .22s cubic-bezier(.22,1,.36,1), transform .18s ease, background .18s ease;
  -webkit-tap-highlight-color: transparent;

  &.big {
    width: 22px;
  }
}

.dot.active {
  width: 22px;
  background: rgba(255,255,255,.18);
}

.fill {
  position: absolute;
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
  width: 0%;
  background: #fff;
  border-radius: 9999px;
  transition: width .04s linear;
}

.dot {
    overflow: hidden;
}

.fill::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: inherit;
}

.dot:hover { transform:scale(1.08); }
.dot:active { transform:scale(.96); }
</style>