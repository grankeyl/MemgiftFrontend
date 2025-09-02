<template>
  <div :class="containerClasses">
    <div v-if="isLoading" class="_skeleton">
      <div class="func"></div>
    </div>
    <div v-else class="_content">
      <div class="func">
        <div class="_left">
          <div class="_title">
            <h4>{{ Text }}</h4>
          </div>
          <div :class="['_mark', { '_soon': !New, '_new': New }]">
            <span>{{ TextMark }}</span>
          </div>
        </div>
        <div class="_right">
          <div class="_image">
            <div class="kit-icon" v-html="Icon"></div>
          </div>
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
    New: {
      type: String,
      default: false,
    },
    Text: {
      type: String,
      required: true,
    },
    TextMark: {
      type: String,
      required: true,
    },
    Icon: {
      type: String,
      required: true,
    },
    Key: {
      type: String,
      required: false,
    },
  },

  data() {
    return {
      isLoading: this.Skeleton,
    };
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },
    containerClasses() {
      return ['_direction', '_comp', '_item', '_funcs', this.Key];
    },
  },

  created() {
    this.loadResources();
  },

  methods: {
    async loadResources() {
      try {
        await Promise.all([this.loadFonts(), this.loadIcons()]);
        this.$emit('loadSuccess');
      } catch (error) {
        console.error('Ошибка при загрузке ресурсов:', error);
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

        Promise.allSettled(promises).then(resolve).catch(reject);
      });
    },
  },
};
</script>