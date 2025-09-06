<template>
  <div class="_direction _comp _item filters">
      <div v-if="isLoading" class="_skeleton">
      </div>
      <div class="_content" :class="{ hide: isLoading }">
        <div class="cont">
            <div class="item">
              <!-- <div class="circle"></div> -->
              <div class="icon">
                <div class="kit-icon" v-html="Icon.Sort"></div>
              </div>
              <div class="title">
                Sort
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <div class="item">
              <!-- <div class="circle"></div> -->
              <div class="icon">
                <div class="kit-icon" v-html="Icon.GiftOth"></div>
              </div>
              <div class="title">
                Model
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <div class="item">
              <!-- <div class="circle"></div> -->
              <div class="icon">
                <div class="kit-icon" v-html="Icon.Symbol"></div>
              </div>
              <div class="title">
                Symbol
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <div class="item">
              <!-- <div class="circle"></div> -->
              <div class="icon">
                <div class="kit-icon" v-html="Icon.Backdrop"></div>
              </div>
              <div class="title">
                Backdrop
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <div class="item">
              <!-- <div class="circle"></div> -->
              <div class="icon">
                <div class="kit-icon" v-html="Icon.Range"></div>
              </div>
              <div class="title">
                Price Range
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
          </div>
        <!-- <div v-if="!isEmptyFilter" class="cheaps">
          <div class="cheap clear" @click="clearAll">
            <h4>{{ $t('profile.clearAll') }}</h4>
            <div class="kit-icon" v-html="Icon.Close"></div>
          </div>
          <div v-if="hasModels" class="cheap model" @click="clearModels">
            <div class="kit-icon" v-html="Icon.Gift"></div>
            <h4>{{ modelsCount === 1 ? `Model: ${SelectedModels[0]}` : `${modelsCount} Models` }}</h4>
            <div class="kit-icon" v-html="Icon.Close"></div>
          </div>
          <div v-if="hasSort" class="cheap sort" @click="clearSort">
            <div class="kit-icon" v-html="Icon.Sort"></div>
            <h4>{{ sortTitle }}</h4>
            <div class="kit-icon" v-html="Icon.Close"></div>
          </div>
        </div> -->
      </div>
  </div>
</template>

<script>
import { Icon } from '../Icon';

import Lottie from '../Lottie.vue';

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
  },

  components: {
    Lottie,
  },

  data() {
    return {
      isLoading: this.Skeleton,

      Icon,
    };
  },

  mounted() {
    this.loadResources();
  },

  computed: {
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

<style lang="sass">
@use "./Filters.sass"
</style>