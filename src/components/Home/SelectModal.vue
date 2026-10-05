<template>
  <div class="_direction _comp _item _modelModal">
    <div
      class="_content"
      :class="{ hide: !ModalActive }"
    >
      <div class="head">
        <div class="centered">
          <div v-if="IconHtml" class="kit-icon" v-html="IconHtml"></div>
          <h4>{{ Title }}</h4>
        </div>
        <div class="close" @click="closeModal">
          <div class="kit-icon" v-html="Icon.Close"></div>
        </div>
      </div>

      <div class="items">
        <div
          v-for="item in Items"
          :key="item.id"
          class="item"
          @click="localSelected = item.id"
        >
          <div class="left">
            <h5>{{ item.label }}</h5>
          </div>
          <div class="select" :class="{ active: localSelected === item.id }">
            <div class="circle"></div>
          </div>
        </div>
      </div>

      <div class="buttons">
        <button type="button" @click="cancel">
          <h4>{{ $t('profile.profileFilterModal.cancel') }}</h4>
        </button>
        <button type="button" @click="apply">
          <h4>{{ $t('profile.profileFilterModal.apply') }}</h4>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from '../Icon';

export default {
  props: {
    ModalActive: { type: Boolean, required: true },
    Title: { type: String, required: true },
    IconHtml: { type: String, default: '' },
    Items: { type: Array, required: true },
    Selected: { type: String, default: '' },
  },

  data() {
    return {
      localSelected: '',
      Icon,
    };
  },

  watch: {
    ModalActive(val) {
      if (val) this.localSelected = this.Selected;
    },
    Selected: {
      immediate: true,
      handler(val) {
        this.localSelected = val;
      },
    },
  },

  methods: {
    closeModal() {
      this.$emit('closeModal');
    },
    cancel() {
      this.closeModal();
    },
    apply() {
      this.$emit('apply', this.localSelected);
      this.$emit('closeModal');
    },
  },
};
</script>
