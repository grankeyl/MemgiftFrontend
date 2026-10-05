<template>
  <Teleport to="body">
    <!-- Same dark overlay as gift / filter sheets -->
    <div
      class="overlay"
      :class="{ 'is-open is-dark': ModalActive }"
      @click="closeModal"
    />

    <!-- Reuse shared filter-modal sheet (_modelModal from _filter-modals.sass) -->
    <div class="_direction _comp _item _modelModal pdm">
      <div
        class="_content"
        :class="{ hide: !ModalActive }"
        @click.stop
      >
        <div class="head">
          <div class="centered">
            <div class="kit-icon" v-html="Icon.Gram"></div>
            <h4>{{ $t('profile.profileDisconnectModalTitle') }}</h4>
          </div>
          <div class="close" @click="closeModal">
            <div class="kit-icon" v-html="Icon.Close"></div>
          </div>
        </div>

        <p class="pdm-descr">{{ $t('profile.profileDisconnectModalDescr') }}</p>

        <div class="buttons">
          <button type="button" @click="closeModal">
            <h4>{{ $t('profile.profileFilterModal.cancel') }}</h4>
          </button>
          <button type="button" @click="walletDisconnect">
            <h4>{{ $t('profile.profileDisconnectModalButton') }}</h4>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { Icon } from '../Icon';
import { tonConnectUI } from '@/hooks/useTonConnect';
import { showToast } from '../../utils/toastManager';
import * as walletApi from '../../api/walletApi';
import TelegramModule from '../../hooks/useTelegram';

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
    ModalActive: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      Icon,
    };
  },

  methods: {
    closeModal() {
      this.$emit('closeModal');
    },

    async walletDisconnect() {
      TelegramModule.useMediumHaptic();
      try {
        await tonConnectUI.disconnect();
      } catch (e) {
        console.error(e);
      }
      try {
        await walletApi.disconnect();
      } catch (e) {
        console.error(e);
      }
      showToast('Wallet disconnected', 'success');
      this.$emit('disconnected');
      this.closeModal();
    },
  },
};
</script>

<style lang="sass" scoped>
// Only description — sheet / head / buttons come from global _filter-modals
.pdm-descr
  margin: 8px 4px 20px
  text-align: center
  font-size: 14px
  font-weight: 400
  line-height: 1.45
  color: rgba(255, 255, 255, 0.55)
</style>
