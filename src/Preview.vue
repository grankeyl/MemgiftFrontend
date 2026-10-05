<template>
  <div class="preview-root">
    <ProfileModal
      :Skeleton="false"
      :SkeletonTime="0"
      :ModalActive="ModalComp.ModalActive"
      :ModalTransferActive="ModalComp.ModalTransferActive"
      :ModalComp="ModalComp"
      :UpgradedNft="UpgradedNft"
      :Table="Table"
    />
  </div>
</template>

<script>
import ProfileModal from './components/Profile/Modal.vue';

export default {
  components: { ProfileModal },

  data() {
    return {
      // подарок получен 3 часа 20 минут назад — до бесплатной отправки
      // остаётся 20 часов 40 минут
      ModalComp: {
        ModalActive: false,
        ModalTransferActive: false,
        NftUniqueKey: 'snow-mittens',
        NftImage: '',
        NftName: 'Snow Mittens',
        GiftName: 'Snow Mittens',
        NftId: 'preview',
        NftKey: 'preview',
        NftUuid: '00000000-0000-0000-0000-000000000000',
        FreeTransferAt: Date.now() + (20 * 60 + 40) * 60 * 1000,
        NftPrice: 0,
        NftRarity: 'rarity_2',
        NftStatus: 'received',
        NftMedia: '',
        NftUpgradeSupport: false,
        NftUpgradePrice: 0,
        NftUpgraded: false,
        Market: { MarketOn: false, TonPrice: null, LotId: null },
      },
      UpgradedNft: {
        ModelName: null, ModelImage: null, ModelDropRate: null,
        BackgroundName: null, BackgroundColors: { Center: null, Around: null },
        BackgroundDropRate: null, SymbolName: null, SymbolImage: null,
        SymbolDropRate: null, ModelNumber: null,
      },
      Table: {},
    };
  },

  mounted() {
    // сразу открываем форму отправки — ради неё стенд и нужен
    this.ModalComp.ModalTransferActive = true;
  },
};
</script>

<style lang="sass">
@use "@/assets/styles/_variables.sass"
@use "@/assets/styles/_root.sass"
@use "@/assets/styles/_base.sass"
@use "@/assets/styles/_filter-modals.sass"
@use "@/assets/styles/profile/_main.sass"
@use "@/assets/styles/profile/_comp.sass"

.preview-root
    min-height: 100vh
</style>
