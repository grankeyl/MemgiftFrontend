<template>
  <div :class="['_direction _comp _item _purchased', Key]">
    <div v-if="isLoading" class="_skeleton">
      <div class="_block">
        <div class="_image"></div>
        <div class="_title"></div>
        <div class="_descr"></div>
      </div>
    </div>
    <div class="_content" :class="{ hide: isLoading }">
      <div class="_block">
        <div 
          style="margin-bottom: 10px;"
          class="_image"
        >
          <Lottie
            class="lt"
            slug="duck-self"
            :loop="true"
            width="150"
            height="150"
          />
        </div>
        <div class="_title">
          <h4>{{ Text }}</h4>
        </div>
        <div class="_descr">
          <p>{{ Descr }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Lottie from '@/components/Lottie.vue';

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
    Background: {
      type: String,
      required: true,
    },
    NftImage: {
      type: String,
      required: true,
    },
    Text: {
      type: String,
      required: true,
    },
    Descr: {
      type: String,
      required: true,
    },
  },

  components: {
    Lottie,
  },

  data() {
    return {
      isLoading: this.Skeleton,

      loadingLottie: true,
    };
  },

  mounted() {
    this.loadResources();

    setTimeout(() => {
      this.loadingLottie = false;
    }, 1200);
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
  },
};
</script>