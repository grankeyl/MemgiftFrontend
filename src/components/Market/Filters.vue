<template>
  <div class="_direction _comp _item _filters">
      <div class="_content">
        <div class="cont">
          <div class="filtersItems">
            <div class="filtersItemsItem" @click="openSortModal">
              <div class="circle" v-if="hasSort"></div>
              <div class="flexer">
                <div class="icon">
                  <div class="kit-icon" v-html="Icon.Sort"></div>
                </div>
                <div class="title">
                  {{ $t('profile.profileFilters.sort') }}
                </div>
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <div class="filtersItemsItem" @click="openStatusModal" v-if="ActiveTab === 'listings'">
              <div class="circle" v-if="hasStatus"></div>
              <div class="flexer">
                <div class="icon pen">
                  <div class="kit-icon" v-html="Icon.Pen"></div>
                </div>
                <div class="title">
                  {{ $t('profile.profileFilters.status') }}
                </div>
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <div class="filtersItemsItem" @click="openModelModal">
              <div class="circle" v-if="hasModels"></div>
              <div class="flexer">
                <div class="icon">
                  <div class="kit-icon" v-html="Icon.Blocks"></div>
                </div>
                <div class="title">
                  {{ $t('profile.profileFilters.collection') }}
                </div>
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <div class="filtersItemsItem" @click="openGiftModelsModal" :class="{ disabled: !hasModels }">
              <div class="circle" v-if="hasGiftModels"></div>
              <div class="flexer">
                <div class="icon">
                  <div class="kit-icon" v-html="Icon.GiftOth"></div>
                </div>
                <div class="title">
                  {{ $t('profile.profileFilters.model') }}
                </div>
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <div class="filtersItemsItem" @click="openSymbolModal">
              <div class="circle" v-if="hasSymbols"></div>
              <div class="flexer">
                <div class="icon">
                  <div class="kit-icon" v-html="Icon.Symbol"></div>
                </div>
                <div class="title">
                  {{ $t('profile.profileFilters.symbol') }}
                </div>
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <div class="filtersItemsItem" @click="openBackdropModal">
              <div class="circle" v-if="hasBackdrops"></div>
              <div class="flexer">
                <div class="icon">
                  <div class="kit-icon" v-html="Icon.Backdrop"></div>
                </div>
                <div class="title">
                  {{ $t('profile.profileFilters.backdrop') }}
                </div>
              </div>
              <div class="dropdown">
                <div class="kit-icon" v-html="Icon.ChevroneTop"></div>
              </div>
            </div>
            <!-- <div class="filtersItemsItem">
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

          <div v-if="ActiveTab === 'gifts'" class="filtersSearch">
            <div class="number">
              <div class="hash">
                <h4>#</h4>
              </div>
              <input
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                autocomplete="off"
                :placeholder="$t('market.searchNumber')"
                @input="onInputSearchNumber"
              />
            </div>
          </div>

          <div v-if="!isEmptyFilter" class="cheaps">
            <div class="cheap clear" @click="clearAll">
              <h4>{{ $t('profile.clearAll') }}</h4>
              <div class="kit-icon" v-html="Icon.Close"></div>
            </div>
            <div v-if="hasModels" class="cheap model" @click="clearModels">
              <div class="kit-icon" v-html="Icon.Blocks"></div>
              <h4>{{ modelsCount === 1 ? `Collection: ${SelectedModels[0]}` : `${modelsCount} Collections` }}</h4>
              <div class="kit-icon" v-html="Icon.Close"></div>
            </div>
            <div v-if="hasGiftModels" class="cheap giftModel" @click="clearGiftModels">
              <div class="kit-icon" v-html="Icon.Gift"></div>
              <h4>{{ giftModelsCount === 1 ? `Model: ${SelectedGiftModels[0]}` : `${giftModelsCount} Models` }}</h4>
              <div class="kit-icon" v-html="Icon.Close"></div>
            </div>
            <div v-if="hasSort" class="cheap sort" @click="clearSort">
              <div class="kit-icon" v-html="Icon.Sort"></div>
              <h4>{{ sortTitle }}</h4>
              <div class="kit-icon" v-html="Icon.Close"></div>
            </div>
            <div v-if="hasStatus" class="cheap status" @click="clearStatus">
              <div class="kit-icon" v-html="Icon.Pen"></div>
              <h4>{{ statusTitle }}</h4>
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
    GiftsList: {
      type: Array,
      required: true,
    },
    GiftsLoading: {
      type: Boolean,
      required: true,
    },
    ActiveTab: {
      type: String,
      required: true,
    },
    SelectedModels: {
      type: Array,
      required: true,
    },
    SelectedGiftModels: {
      type: Array,
      required: true,
    },
    SelectedSort: {
      type: String,
      required: true,
    },
    SelectedStatus: {
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
    StatusItems: {
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
    SearchNumber: {
      type: String,
      required: true,
    },
  },

  components: {
    Lottie,
  },

  data() {
    return {
      isLoading: false,

      searchNumber: this.SearchNumber,
      _searchTimeout: null,

      Icon,
    };
  },

  mounted() {
    this.searchNumber = this.SearchNumber;

    this.loadResources();
  },

  computed: {
    modelsCount() {
      return this.SelectedModels?.length ?? 0 
    },
    giftModelsCount() {
      return this.SelectedGiftModels?.length ?? 0 
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
    hasGiftModels() {
      return this.giftModelsCount > 0 
    },
    hasSort() {
      return !!this.SelectedSort && !!this.SortItems?.[this.SelectedSort]
    },
    hasStatus() {
      return !!this.SelectedStatus && !!this.StatusItems?.[this.SelectedStatus]
    },
    hasSymbols() {
      return this.symbolsCount > 0 
    },
    hasBackdrops() {
      return this.backdropsCount > 0 
    },
    isEmptyFilter() {
      return !(this.hasModels || this.hasGiftModels || this.hasSort || this.hasStatus || this.hasSymbols || this.hasBackdrops)
    },
    sortTitle() {
      if (this.hasSort) {
        return this.$t(`profile.profileFilterModal.items.${this.SelectedSort}`)
      } else {
        return ''
      }
    },
    statusTitle() {
      if (this.hasStatus) {
        return this.$t(`profile.profileStatusModal.items.${this.SelectedStatus}`)
      } else {
        return ''
      }
    },
  },

  methods: {
    async loadResources() {
      this.$emit("loadSuccess");
    },

    onInputSearchNumber(e) {
      const onlyDigits = e.target.value.replace(/\D/g, '')
      e.target.value = onlyDigits
      this.searchNumber = onlyDigits

      clearTimeout(this._searchTimeout)
      this._searchTimeout = setTimeout(() => {
        this.$emit('searchNumber', this.searchNumber)
      }, 1500)
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

    openGiftModelsModal() {
      this.$emit('openGiftModelsModal');
    },

    openSortModal() {
      this.$emit('openSortModal');
    },

    openStatusModal() {
      this.$emit('openStatusModal');
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

    clearGiftModels() {
      this.$emit('clearGiftModels');
    },

    clearSort() {
      this.$emit('clearSort');
    },

    clearStatus() {
      this.$emit('clearStatus');
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

<style lang="sass" scoped>
@use "./Filters.sass"
</style>