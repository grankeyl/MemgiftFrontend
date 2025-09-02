<template>
  <div :class="['_direction _comp _item _funcs', Key]">
    <div v-if="isLoading" class="_skeleton">
      <div class="funcs">
        <div 
          class="func"
          v-for="(func, index) in FuncsComp"
          :class="{ 
            first: func.First, 
            last: func.Last
          }"
        ></div>
      </div>
    </div>
    <div v-else class="_content">
      <div class="funcs">
        <div 
          v-for="(func, index) in FuncsComp"
          class="func"
          :class="{ 
            first: func.First, 
            last: func.Last
          }"
        >
          <div class="_left">
            <div class="_title">
              <h4>{{ func.Text }}</h4>
            </div>
            <div v-if="func.New" class="_mark _new">
              <span>{{ func.TextMark }}</span>
            </div>
            <div v-if="func.Soon" class="_mark _soon">
              <span>{{ $t('app.soon') }}</span>
            </div>
          </div>
          <div class="_right">
            <div class="_image">
              <div class="kit-icon" v-html="Icon.ChevroneRight"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCacheStore } from '../../stores/pinia/piniaStore';
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
    FuncsComp: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      storeCache: useCacheStore(),
      isLoading: this.Skeleton,

      Icon,
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
  },
};
</script>