<template>
  <div :class="containerClasses">
    <div v-if="isLoading" class="_skeleton">
      <div class="_wSlide">
        <div class="_slide"></div>
        <div class="_slide"></div>
      </div>
    </div>
    <div v-else class="_content" ref="swiperContainer">
      <swiper v-bind="swiperOptions">
        <swiper-slide v-for="(slide, index) in slides" :key="index">
          <div v-if="index === 0" @click="handleButtonClick(slide)" :style="{ backgroundImage: `url(${slide.BgImage})`, width: '110%', }" class="slideBg">
            <div class="_left">
              <div class="_title">
                <h1 :style="slide.ButtonKey === 'Scooby' ? { color: '#111' } : {}">{{ slide.Title }}</h1>
              </div>
              <div class="_button">
                <button @click="handleButtonClick(slide)" :class="slide.Button.toLowerCase()" :style="slide.ButtonKey === 'Scooby' ? { background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' } : {}">
                  <img v-if="slide.Button === 'Buy'" src="/src/assets/images/stars.png" alt="stars" />
                  <p>{{ slide.ButtonText }}</p>
                  <div v-if="slide.Button === 'Reading'" class="kit-icon" v-html="slide.ButtonIcon"></div>
                </button>
              </div>
            </div>
            <div class="_right">
              <div v-if="slide.ImageContent" :class="['_image', { '_first-slide': index === 0 }]" :style="{ marginLeft: index === 0 ? '-25%' : '0' }">
                <img :src="slide.ImageContent" alt="content-image" />
              </div>
            </div>
          </div>

          <div v-else :style="{ backgroundImage: `url(${slide.BgImage})` }" class="slideBg">
            <div class="_left">
              <div class="_title">
                <h1>{{ slide.Title }}</h1>
              </div>
              <div class="_button">
                <button @click="handleButtonClick(slide)" :class="slide.Button.toLowerCase()">
                  <img v-if="slide.Button === 'Buy'" src="/src/assets/images/stars.png" alt="stars" />
                  <p>{{ slide.ButtonText }}</p>
                  <div v-if="slide.Button === 'Reading'" class="kit-icon" v-html="slide.ButtonIcon"></div>
                </button>
              </div>
            </div>
            <div class="_right">
              <div v-if="slide.ImageContent" :class="['_image', { '_first-slide': index === 1 }]" :style="{ marginLeft: index === 1 ? '-15%' : '0' }">
                <img :src="slide.ImageContent" alt="content-image" />
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper>
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
      swiperOptions: {
        modules: [Autoplay],
        slidesPerView: 'auto',
        spaceBetween: 12,
        centeredSlidesBounds: true,
        initialSlide: 0,
        autoplay: {
          delay: 6100,
          disableOnInteraction: false,
        },
        speed: 440,
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
  },
};
</script>

<style>
</style>