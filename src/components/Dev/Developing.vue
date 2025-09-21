<template>
  <div :class="['_direction _comp _item _dev', Key]">
    <div class="_content">
      <div class="_block">
        <div class="image">
          <img :src="LogotypeImg" alt="logotype" />
        </div>
        <div class="countdown">
          <div class="countdown-item">
            <div class="countdown-item-number"><NumberFlip :value="time.days" /></div>
            <div class="countdown-item-text"><span>days</span></div>
          </div>
          <div class="countdown-item">
            <div class="countdown-item-number"><NumberFlip :value="time.hours" /></div>
            <div class="countdown-item-text"><span>hours</span></div>
          </div>
          <div class="countdown-item">
            <div class="countdown-item-number"><NumberFlip :value="time.minutes" /></div>
            <div class="countdown-item-text"><span>minutes</span></div>
          </div>
          <div class="countdown-item">
            <div class="countdown-item-number"><NumberFlip :value="time.seconds" /></div>
            <div class="countdown-item-text"><span>seconds</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Lottie from '../Lottie.vue';
import NumberFlip from './NumberFlip.vue'

// Images
import LogotypeImg from '@/assets/images/market/logotype.svg';

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    Text: { type: String, required: true },
    Descr: { type: String, required: true },
  },

  components: { Lottie, NumberFlip },

  data() {
    const startSec = 1757164938;
    const startMs  = startSec * 1000;
    const targetMs = startMs + (12*24*60*60*1000) - (5*60*60*1000);

    return {
      LogotypeImg,

      isLoading: this.Skeleton,
      loadingLottie: true,
      time: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      timer: null,
      startDate: startMs,
      targetDate: targetMs,
    };
  },

  mounted() {
    this.loadResources();
    setTimeout(() => (this.loadingLottie = false), 1200);

    this.startCountdown();
  },

  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  },

  methods: {
    startCountdown() {
      this.updateCountdown();
      this.timer = setInterval(this.updateCountdown, 1000);
    },

    updateCountdown() {
      const now = Date.now();
      const diff = Math.max(0, this.targetDate - now);

      this.time.days    = Math.floor(diff / (1000*60*60*24));
      this.time.hours   = Math.floor((diff / (1000*60*60)) % 24);
      this.time.minutes = Math.floor((diff / (1000*60)) % 60);
      this.time.seconds = Math.floor((diff / 1000) % 60);
      if (diff === 0) clearInterval(this.timer);
    },

    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadIcons()]);
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
        div.innerHTML = this.Icon || "";

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
                if (icon.getBBox().width > 0) resolveSvg();
                else requestAnimationFrame(checkSvgLoaded);
              };
              checkSvgLoaded();
            });
          }
        });

        Promise.all(promises).then(resolve).catch(reject);
      });
    },
  },
};
</script>