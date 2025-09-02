<template>
  <div :class="['_direction _comp _item _purchased', Key]">
    <div v-if="isLoading" class="_skeleton">
      <div class="_block">
        <div class="_image"></div>
        <div class="_title"></div>
        <div class="_descr"></div>
      </div>
    </div>
    <div v-else class="_content">
      <div class="_block">
        <div class="_background">
          <img :src="Background" />
        </div>
        <div class="_image">
          <img :src="NftImage" />
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

  data() {
    return {
      isLoading: this.Skeleton,
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
        // this.isLoading = false;
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