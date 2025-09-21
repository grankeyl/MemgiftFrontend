<template>
  <div class="_direction _comp _item filters">
      <div v-if="isLoading" class="_skeleton">
      </div>
      <div class="_content" :class="{ hide: isLoading }">
        <div class="cont">
          <div class="items">
            <div class="item" @click="openSortModal">
              <div class="circle" v-if="hasSort"></div>
              <div class="icon">
                <div class="kit-icon" v-html="Icon.Sort"></div>
              </div>
              <div class="title">
                {{ $t('profile.profileFilters.sort') }}
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <div class="item" @click="openModelModal">
              <div class="circle" v-if="hasModels"></div>
              <div class="icon">
                <div class="kit-icon" v-html="Icon.GiftOth"></div>
              </div>
              <div class="title">
                {{ $t('profile.profileFilters.model') }}
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <div class="item" @click="openSymbolModal">
              <div class="circle" v-if="hasSymbols"></div>
              <div class="icon">
                <div class="kit-icon" v-html="Icon.Symbol"></div>
              </div>
              <div class="title">
                {{ $t('profile.profileFilters.symbol') }}
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <div class="item" @click="openBackdropModal">
              <div class="circle" v-if="hasBackdrops"></div>
              <div class="icon">
                <div class="kit-icon" v-html="Icon.Backdrop"></div>
              </div>
              <div class="title">
                {{ $t('profile.profileFilters.backdrop') }}
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <!-- <div class="item">
              <div class="icon">
                <div class="kit-icon" v-html="Icon.Range"></div>
              </div>
              <div class="title">
                Price Range
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div> -->
          </div>

          <div v-if="!isEmptyFilter" class="cheaps">
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
            <div v-if="hasSymbols" class="cheap symbol" @click="clearSymbols">
              <div class="kit-icon" v-html="Icon.Symbol"></div>
              <h4>{{ symbolsCount === 1 ? `Symbol: ${SelectedSymbols[0]}` : `${symbolsCount} Symbols` }}</h4>
              <div class="kit-icon" v-html="Icon.Close"></div>
            </div>
            <div v-if="hasBackdrops" class="cheap backdrop" @click="clearBackdrops">
              <div class="kit-icon" v-html="Icon.Backdrop"></div>
              <h4>{{ backdropsCount === 1 ? `Backdrop: ${SelectedBackdrops[0]}` : `${backdropsCount} Backdrops` }}</h4>
              <div class="kit-icon" v-html="Icon.Close"></div>
            </div>
          </div>
        </div>
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
    GiftsList: {
      type: Array,
      required: true,
    },
    GiftsLoading: {
      type: Boolean,
      required: true,
    },
    SelectedModels: {
      type: Array,
      required: true,
    },
    SelectedSort: {
      type: String,
      required: true,
    },
    SelectedSymbols: {
      type: Array,
      required: true,
    },
    SelectedBackdrops: {
      type: Array,
      required: true,
    },
    SortItems: {
      type: Object,
      required: true,
    },
    Searching: {
      type: Boolean,
      required: true,
    },
    HasMore: {
      type: Boolean,
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
    modelsCount() {
      return this.SelectedModels?.length ?? 0 
    },
    symbolsCount() {
      return this.SelectedSymbols?.length ?? 0 
    },
    backdropsCount() {
      return this.SelectedBackdrops?.length ?? 0 
    },
    hasModels() {
      return this.modelsCount > 0 
    },
    hasSort() {
      return !!this.SelectedSort && !!this.SortItems?.[this.SelectedSort] 
    },
    hasSymbols() {
      return this.symbolsCount > 0 
    },
    hasBackdrops() {
      return this.backdropsCount > 0 
    },
    isEmptyFilter() {
      return !(this.hasModels || this.hasSort || this.hasSymbols || this.hasBackdrops)
    },
    sortTitle() {
      if (this.hasSort) {
        return this.$t(`profile.profileFilterModal.items.${this.SelectedSort}`)
      } else {
        return ''
      }
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

    openModelModal() {
      this.$emit('openModelModal');
    },

    openSortModal() {
      this.$emit('openSortModal');
    },

    openSymbolModal() {
      this.$emit('openSymbolModal');
    },

    openBackdropModal() {
      this.$emit('openBackdropModal');
    },

    clearAll() {
      this.$emit('clearAll');
    },

    clearModels() {
      this.$emit('clearModels');
    },

    clearSort() {
      this.$emit('clearSort');
    },

    clearSymbols() {
      this.$emit('clearSymbols');
    },

    clearBackdrops() {
      this.$emit('clearBackdrops');
    },
  },
};
</script>

<style lang="sass">
@use "./Filters.sass"
</style>