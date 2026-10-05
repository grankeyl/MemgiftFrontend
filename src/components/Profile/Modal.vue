<template>
  <!-- ── платная пересылка в первые сутки ─────────────────────────── -->
  <Teleport to="body">
    <div
      class="overlay pgm-fee-overlay"
      :class="{ 'is-open is-dark': cooldownModalActive }"
      @click="closeCooldownModal"
    />

    <!-- справка собрана из тех же кусков, что и шит подарка:
         круглая кнопка закрытия, заголовок, синяя кнопка внизу -->
    <div
      v-if="cooldownIsRendered"
      class="_direction _comp _item giftModal pgm-modal pgm-fee-modal"
    >
      <div
        class="mgm-dock pgm-dock"
        :class="{ hide: !cooldownModalActive, open: cooldownModalActive }"
        @click.stop
      >
        <div class="mgm-sheet">
          <button type="button" class="mgm-close" @click="closeCooldownModal" aria-label="Close">
            <div class="kit-icon" v-html="Icon.Close"></div>
          </button>

          <div class="mgm-body">
            <div class="mgm-title">
              <div class="mgm-title__left">
                <h3>{{ $t('profile.profileTransferFee.title') }}</h3>
              </div>
            </div>

            <p class="pgm-fee__descr">{{ $t('profile.profileTransferFee.descr') }}</p>

            <div class="pgm-fee__rows">
              <div class="pgm-fee__row">
                <span class="pgm-fee__label">{{ $t('profile.profileTransferFee.now') }}</span>
                <span class="pgm-fee__price">
                  <img :src="Image_StarsWhite" alt="" />
                  <span>25</span>
                </span>
              </div>
              <div class="pgm-fee__row">
                <span class="pgm-fee__label">{{ $t('profile.profileTransferFee.free') }}</span>
                <span class="pgm-fee__val">{{ transferCooldownText }}</span>
              </div>
            </div>

            <div class="mgm-footer market pgm-transfer-footer">
              <button type="button" class="mgm-footer__buy" @click="closeCooldownModal">
                <span class="pgm-send-button__content">
                  <span>{{ $t('profile.profileTransferFee.ok') }}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── возврат NFT в приложение: инструкция ─────────────────────── -->
  <Teleport to="body">
    <div
      class="overlay pgm-fee-overlay"
      :class="{ 'is-open is-dark': returnModalActive }"
      @click="closeReturnModal"
    />

    <!-- собрана из тех же кусков, что справка о платной пересылке:
         лежит поверх шита подарка (слои .pgm-fee-modal) -->
    <div
      v-if="returnIsRendered"
      class="_direction _comp _item giftModal pgm-modal pgm-fee-modal"
    >
      <div
        class="mgm-dock pgm-dock"
        :class="{ hide: !returnModalActive, open: returnModalActive }"
        @click.stop
      >
        <div class="mgm-sheet">
          <button type="button" class="mgm-close" @click="closeReturnModal" aria-label="Close">
            <div class="kit-icon" v-html="Icon.Close"></div>
          </button>

          <div class="mgm-body">
            <div class="mgm-title">
              <div class="mgm-title__left">
                <h3>{{ $t('profile.profileMintFlow.returnTitle') }}</h3>
              </div>
            </div>

            <p class="pgm-fee__descr">{{ $t('profile.profileMintFlow.chainReturnHint') }}</p>

            <!-- та же таблица, что в справке о пересылке: адрес — тап-копия -->
            <div class="pgm-fee__rows">
              <div
                class="pgm-fee__row pgm-chainrow"
                @click="copyMintAddress(ModalComp.Mint?.return_address)"
              >
                <span class="pgm-fee__label">{{ $t('profile.profileMintFlow.chainReturn') }}</span>
                <span class="pgm-fee__val pgm-chainrow__addr">{{ shortAddr(ModalComp.Mint?.return_address) }}</span>
              </div>
              <div class="pgm-fee__row">
                <span class="pgm-fee__label">{{ $t('profile.profileMintFlow.returnNetwork') }}</span>
                <span class="pgm-fee__val">TON</span>
              </div>
              <div class="pgm-fee__row">
                <span class="pgm-fee__label">{{ $t('profile.profileMintFlow.returnUnlock') }}</span>
                <span class="pgm-fee__val">{{ $t('profile.profileMintFlow.returnUnlockVal') }}</span>
              </div>
            </div>

            <div class="mgm-footer market pgm-transfer-footer">
              <button
                type="button"
                class="mgm-footer__buy"
                @click="copyMintAddress(ModalComp.Mint?.return_address)"
              >
                <span class="pgm-send-button__content">
                  <span>{{ $t('profile.profileMintFlow.returnCopy') }}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── минт в кошелёк ───────────────────────────────────────────── -->
  <Teleport to="body">
    <div
      class="overlay pgm-mint-overlay"
      :class="{ 'is-open is-dark': mintModalActive }"
      @click="closeMintModal"
    />

    <div
      v-if="mintIsRendered"
      class="_direction _comp _item giftModal pgm-modal pgm-mint-modal"
    >
      <div
        class="mgm-dock pgm-dock pgm-mint-dock"
        :class="{ hide: !mintModalActive, open: mintModalActive }"
        @click.stop
      >
        <div class="mgm-sheet">
          <button type="button" class="mgm-close" @click="closeMintModal" aria-label="Close">
            <div class="kit-icon" v-html="Icon.Close"></div>
          </button>

          <div class="mgm-body pgm-mint">
            <!-- иконка-статус: стекло + GetGems, при минте — спиннер-кольцо -->
            <div
              class="pgm-mint__badge"
              :class="{
                'is-spin': mintState === 'processing',
                'is-ok': mintState === 'success',
                'is-err': mintState === 'failed',
              }"
            >
              <div class="pgm-mint__badge-ring"></div>
              <div class="kit-icon" v-html="Icon.MintChain"></div>
            </div>

            <h3 class="pgm-mint__title">{{ mintTitle }}</h3>
            <p class="pgm-mint__descr">{{ mintDescr }}</p>

            <!-- детали: плоский блок как списки в фильтр-шитах -->
            <div v-if="mintWalletReady || mintState !== 'none'" class="pgm-mint__rows">
              <div class="pgm-mint__row" @click="copyMintAddress(mintWalletAddress)">
                <span class="pgm-mint__row-label">{{ $t('profile.profileMintFlow.walletLabel') }}</span>
                <span class="pgm-mint__row-val">{{ mintShortAddress }}</span>
              </div>
              <div
                v-if="ModalComp.Mint?.nft_address"
                class="pgm-mint__row"
                @click="copyMintAddress(ModalComp.Mint.nft_address)"
              >
                <span class="pgm-mint__row-label">NFT</span>
                <span class="pgm-mint__row-val">{{ shortAddr(ModalComp.Mint.nft_address) }}</span>
              </div>
              <div v-if="mintState === 'failed' && ModalComp.Mint?.error" class="pgm-mint__row">
                <span class="pgm-mint__row-label">{{ $t('profile.profileMintFlow.failedTitle') }}</span>
                <span class="pgm-mint__row-val is-err">{{ ModalComp.Mint.error }}</span>
              </div>
            </div>

            <div class="pgm-mint__actions">
              <!-- кошелёк не подключён -->
              <button
                v-if="!mintWalletReady && mintState === 'none'"
                type="button"
                class="pgm-mint__cta"
                @click="connectWalletFromMint"
              >
                <span>{{ $t('profile.profileMintFlow.connectButton') }}</span>
              </button>

              <!-- готов к минту / повтор после ошибки -->
              <button
                v-else-if="mintState === 'none' || mintState === 'failed'"
                type="button"
                class="pgm-mint__cta"
                :disabled="isMinting"
                @click="doMint"
              >
                <div class="kit-icon" v-html="Icon.MintChain"></div>
                <span>{{ isMinting ? '…' : (mintState === 'failed' ? $t('profile.profileMintFlow.retryButton') : $t('profile.profileMintFlow.mintButton')) }}</span>
              </button>

              <!-- готово: страница NFT на GetGems -->
              <button
                v-else-if="mintState === 'success' && ModalComp.Mint?.getgems_url"
                type="button"
                class="pgm-mint__cta"
                @click="openGetgems"
              >
                <div class="kit-icon" v-html="Icon.GetGems"></div>
                <span>{{ $t('profile.profileMintFlow.viewButton') }}</span>
              </button>

              <button type="button" class="pgm-mint__ghost" @click="closeMintModal">
                <span>{{ $t('profile.profileGiftButtonOk') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
  <!-- Market-style gift sheet — teleported so menu (z-index 999) cannot cover it -->
  <div class="overlay mgm-overlay" :class="{ 'is-open is-dark': isVisible }" @click="closeModal" />

  <div
    v-if="isRendered"
    class="_direction _comp _item giftModal pgm-modal pgm-own"
  >
    <div
      class="mgm-dock pgm-dock"
      :class="{ hide: !isVisible, open: isVisible }"
      @touchstart.passive="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
      :style="sheetStyle"
    >
      <div class="mgm-sheet">
        <button type="button" class="mgm-close" @click="closeModal" aria-label="Close">
          <div class="kit-icon" v-html="Icon.Close"></div>
        </button>

        <div v-if="isLoading" class="mgm-skel">
          <div class="mgm-skel__card"></div>
          <div class="mgm-skel__block"></div>
          <div class="mgm-skel__btn"></div>
        </div>

        <div v-else class="mgm-body">
          <div class="mgm-card">
            <div
              class="mgm-card__head"
              :class="[isUpgraded ? 'is-upg' : normalizedRarity]"
              :style="cardHeadStyle"
            >
              <div class="mgm-card__bg"></div>
              <div class="mgm-card__symbol">
                <img
                  v-if="isUpgraded && UpgradedNft?.SymbolImage"
                  :src="UpgradedNft.SymbolImage"
                  alt=""
                />
                <img v-else :src="Image_GiftBg" alt="" />
              </div>
              <div v-if="isUpgraded && UpgradedNft?.ModelNumber != null" class="mgm-card__mark">
                <p>#{{ UpgradedNft.ModelNumber }}</p>
              </div>
              <div class="mgm-card__model">
                <GiftLottie
                  v-if="showLottie && lottiePath && isVisible"
                  :key="`${lottiePath}:${isVisible}`"
                  class="mgm-card__lottie"
                  :path="lottiePath"
                  :loop="true"
                  :autoplay="true"
                  width="0"
                  height="0"
                  renderer="canvas"
                />
                <img
                  v-else
                  class="mgm-card__model-img"
                  :src="modelImageSrc"
                  alt="nft"
                />
              </div>
              <div class="mgm-card__tickers">
                <div
                  v-if="!isUpgraded"
                  class="mgm-card__tickers-i"
                  :class="{ disabled: !ModalComp.NftUpgradeSupport, loading: isLoadingUpgrade }"
                  @click="onTickerClick('upgrade')"
                >
                  <Icon class="kit-icon" v-html="Icon.Flash"></Icon>
                  <p>{{ isLoadingUpgrade ? '...' : $t('profile.profileTickers.upgrade') }}</p>
                </div>
                <!-- заминчен: вместо тикера минта — ссылки GetGems и Tonscan -->
                <template v-if="mintState === 'success'">
                  <div class="mgm-card__tickers-i is-mint is-gg" @click="openGetgems">
                    <Icon class="kit-icon" v-html="Icon.GetGems"></Icon>
                    <p>GetGems</p>
                  </div>
                  <div class="mgm-card__tickers-i is-mint" @click="openTonviewer">
                    <Icon class="kit-icon" v-html="Icon.Tonviewer"></Icon>
                    <p>Tonviewer</p>
                  </div>
                </template>
                <!-- минт — слева от «продать». после возврата из кошелька
                     повторный минт недоступен (дубликат номера в коллекции) -->
                <div
                  v-else-if="isUpgraded && ModalComp.Mint?.status !== 'returned'"
                  class="mgm-card__tickers-i is-mint"
                  :class="{ minting: mintState === 'processing' }"
                  @click="onTickerClick('mint')"
                >
                  <Icon class="kit-icon" v-html="Icon.MintChain"></Icon>
                  <p>{{ mintTickerLabel }}</p>
                </div>
                <div
                  v-if="(isUpgraded || ModalComp.Market?.MarketOn) && !isMintedOrMinting"
                  class="mgm-card__tickers-i"
                  :class="{ disabled: isRemovingLot, loading: isRemovingLot }"
                  @click="onTickerClick(ModalComp.Market?.MarketOn ? 'remove' : 'sell')"
                >
                  <Icon class="kit-icon" v-html="ModalComp.Market?.MarketOn ? Icon.MarketOff : Icon.MenuMarket"></Icon>
                  <p>{{ isRemovingLot ? '...' : (ModalComp.Market?.MarketOn ? $t('profile.profileTickers.unlist') : $t('profile.profileTickers.sell')) }}</p>
                </div>
                <div
                  v-if="!isMintedOrMinting"
                  class="mgm-card__tickers-i"
                  :class="{ disabled: ModalComp.Market?.MarketOn }"
                  @click="onTickerClick('send')"
                >
                  <Icon class="kit-icon" v-html="Icon.Direct"></Icon>
                  <p>{{ $t('profile.profileTickers.send') }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Title + tools -->
          <div class="mgm-title">
            <div class="mgm-title__left">
              <h3>{{ displayName }}</h3>
              <div v-if="ModalComp.Market?.MarketOn" class="mgm-title__price">
                <Icon class="kit-icon" v-html="Icon.Gram" />
                <span>{{ cutNumber(ModalComp.Market.TonPrice) }}</span>
              </div>
            </div>
            <div class="mgm-title__tools">
              <button type="button" class="mgm-tool" @click="shareGiftLink">
                <img :src="ForwardImg" alt="" />
              </button>
              <button type="button" class="mgm-tool" @click="copyGiftLink">
                <img :src="CopyImg" alt="" />
              </button>
            </div>
          </div>

          <!-- Статус лота — отдельным блоком над характеристиками -->
          <Transition name="pgm-market">
            <button
              v-if="ModalComp.Market?.MarketOn"
              type="button"
              class="pgm-market"
              @click="$router.push('/m')"
            >
              <span class="pgm-market__tile">
                <Icon class="kit-icon" v-html="Icon.MenuMarket" />
              </span>
              <span class="pgm-market__title">{{ $t('profile.profileMarketOnDesc') }}</span>
              <span class="pgm-market__go" aria-hidden="true">
                <svg viewBox="0 0 8 14" fill="none">
                  <path d="M1 1.5L6.5 7 1 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>
          </Transition>

          <!-- Ончейн-паспорт: подарок заминчен — вместо таблицы характеристик
               показываем адреса контрактов и ссылки на обозреватели -->
          <template v-if="mintState === 'success'">
            <!-- та же таблица, что и у характеристик, только с адресами: тап — копия -->
            <div class="mgm-info">
              <div class="mgm-info__row pgm-chainrow" @click="copyMintAddress(ModalComp.Mint?.nft_address)">
                <span class="mgm-info__label">{{ $t('profile.profileMintFlow.chainItem') }}</span>
                <div class="mgm-info__right">
                  <span class="mgm-info__val pgm-chainrow__addr">{{ shortAddr(ModalComp.Mint?.nft_address) }}</span>
                  <img class="pgm-chainrow__copy" :src="CopyImg" alt="" />
                </div>
              </div>
              <div
                v-if="mintCollectionAddress"
                class="mgm-info__row pgm-chainrow"
                @click="copyMintAddress(mintCollectionAddress)"
              >
                <span class="mgm-info__label">{{ $t('profile.profileMintFlow.chainCollection') }}</span>
                <div class="mgm-info__right">
                  <span class="mgm-info__val pgm-chainrow__addr">{{ shortAddr(mintCollectionAddress) }}</span>
                  <img class="pgm-chainrow__copy" :src="CopyImg" alt="" />
                </div>
              </div>
              <div class="mgm-info__row pgm-chainrow" @click="copyMintAddress(ModalComp.Mint?.wallet_address)">
                <span class="mgm-info__label">{{ $t('profile.profileMintFlow.chainOwner') }}</span>
                <div class="mgm-info__right">
                  <span class="mgm-info__val pgm-chainrow__addr pgm-chainrow__addr--owner">{{ shortAddr(ModalComp.Mint?.wallet_address) }}</span>
                  <img class="pgm-chainrow__copy" :src="CopyImg" alt="" />
                </div>
              </div>
              <div class="mgm-info__row">
                <span class="mgm-info__label">{{ $t('profile.profileMintFlow.chainMinted') }}</span>
                <div class="mgm-info__right">
                  <span class="mgm-info__val">{{ mintedAtText }}</span>
                </div>
              </div>
            </div>

          </template>

          <!-- Info table -->
          <div v-else class="mgm-info">
            <template v-if="isUpgraded">
              <div class="mgm-info__row">
                <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableMintedItem1') }}</span>
                <div class="mgm-info__right">
                  <span class="mgm-info__val">{{ modelNameText }}</span>
                  <span v-if="modelDropRate" class="mgm-info__pct">{{ modelDropRate }}%</span>
                </div>
              </div>
              <div class="mgm-info__row">
                <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableMintedItem2') }}</span>
                <div class="mgm-info__right">
                  <span class="mgm-info__val">{{ symbolNameText }}</span>
                  <span v-if="UpgradedNft?.SymbolDropRate" class="mgm-info__pct">{{ UpgradedNft.SymbolDropRate }}%</span>
                </div>
              </div>
              <div class="mgm-info__row">
                <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableMintedItem3') }}</span>
                <div class="mgm-info__right">
                  <span class="mgm-info__val">{{ backgroundNameText }}</span>
                  <span v-if="UpgradedNft?.BackgroundDropRate" class="mgm-info__pct">{{ UpgradedNft.BackgroundDropRate }}%</span>
                </div>
              </div>
              <div class="mgm-info__row">
                <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableItem4') }}</span>
                <div class="mgm-info__right">
                  <span class="mgm-info__val">{{ Table?.NftSupply || '—' }}</span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="mgm-info__row">
                <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableItem1') }}</span>
                <div class="mgm-info__right">
                  <span class="mgm-info__val">{{ Table?.OwnerName || '—' }}</span>
                </div>
              </div>
              <div class="mgm-info__row">
                <span class="mgm-info__label">{{ $t('profile.profileGiftPreviewTableItem4') }}</span>
                <div class="mgm-info__right">
                  <span class="mgm-info__val">{{ Table?.NftSupply || '—' }}</span>
                </div>
              </div>
            </template>
          </div>

          <!-- Footer: у заминченного — «Закрыть» + «Возврат», иначе только закрыть -->
          <div class="pgm-footer">
            <button
              type="button"
              class="pgm-footer__btn pgm-footer__btn--close"
              @click="closeModal"
            >
              <span>{{ $t('profile.profileGiftButtonOk') }}</span>
            </button>
            <button
              v-if="mintState === 'success' && ModalComp.Mint?.return_address"
              type="button"
              class="pgm-footer__btn pgm-footer__btn--return"
              @click="openReturnModal"
            >
              <span>{{ $t('profile.profileMintFlow.chainReturn') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="transferIsRendered"
    class="overlay mgm-overlay"
    :class="{ 'is-open is-dark': transferIsVisible }"
    @click="closeTransferModal"
  />
  <div
    v-if="transferIsRendered"
    class="_direction _comp _item giftModal pgm-transfer-modal"
  >
    <div
      class="mgm-dock pgm-dock pgm-transfer-dock"
      :class="{ hide: !transferIsVisible, open: transferIsVisible }"
      :style="transferSheetStyle"
      @touchstart.passive="onTransferTouchStart"
      @touchmove.prevent="onTransferTouchMove"
      @touchend="onTransferTouchEnd"
    >
      <div
        class="mgm-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-transfer-title"
        :aria-busy="ActiveButton"
      >
        <button
          type="button"
          class="mgm-close"
          :aria-label="$t('profile.profileTransferClose')"
          :disabled="ActiveButton"
          @click="closeTransferModal"
        >
          <div class="kit-icon" v-html="Icon.Close"></div>
        </button>

        <div v-if="isLoading" class="mgm-skel">
          <div class="mgm-skel__card"></div>
          <div class="mgm-skel__block"></div>
          <div class="mgm-skel__btn"></div>
        </div>

        <div v-else class="mgm-body">
          <div class="mgm-card market">
            <div
              class="mgm-card__head"
              :class="[isUpgraded ? 'is-upg' : normalizedRarity]"
              :style="cardHeadStyle"
            >
              <div class="mgm-card__bg"></div>
              <div class="mgm-card__symbol">
                <img :src="isUpgraded ? UpgradedNft?.SymbolImage : Image_GiftBg" alt="" />
              </div>
              <div v-if="isUpgraded && UpgradedNft?.ModelNumber != null" class="mgm-card__mark">
                <p>#{{ UpgradedNft.ModelNumber }}</p>
              </div>
              <div class="mgm-card__model">
                <GiftLottie
                  v-if="showLottie && lottiePath && transferIsVisible"
                  :key="`${lottiePath}:${transferIsVisible}`"
                  class="mgm-card__lottie"
                  :path="lottiePath"
                  :loop="true"
                  :autoplay="true"
                  width="0"
                  height="0"
                  renderer="canvas"
                />
                <img v-else class="mgm-card__model-img" :src="modelImageSrc" alt="nft" />
              </div>
            </div>
          </div>

          <div class="mgm-title">
            <div class="mgm-title__left">
              <h3 id="profile-transfer-title">{{ displayName }}</h3>
            </div>
          </div>

          <!-- подарок получен меньше суток назад: отправка платная.
               вся плашка — кнопка, по ней открывается справка -->
          <button
            v-if="transferCooldownLeft > 0"
            type="button"
            class="pgm-lock"
            @click="openCooldownModal"
          >
            <span class="pgm-lock__ico" v-html="Icon.Lock"></span>
            <span class="pgm-lock__text">
              <span class="pgm-lock__title">{{ $t('profile.profileTransferFee.lockTitle') }}</span>
              <span class="pgm-lock__hint">{{ $t('profile.profileTransferFee.lockHint', { time: transferCooldownText }) }}</span>
            </span>
            <span class="pgm-lock__chev" v-html="Icon.ChevroneRight"></span>
          </button>

          <section class="pgm-recipient" :aria-label="$t('profile.profileTransferRecipientLabel')">
                <div
                  class="pgm-recipient-search"
                  :class="{
                    selected: isTransferInputSuccess,
                    error: transferYourselfError || transferSearchError,
                  }"
                >
                  <div v-if="isTransferInputSuccess" class="pgm-recipient-selected">
                    <img v-if="transferData.avatar && !showDefaultAvatar" :src="transferData.avatar" alt="" @error="showDefaultAvatar = true" />
                    <span v-else class="pgm-recipient-avatar">{{ transferData.name?.[0] }}</span>
                    <span class="pgm-recipient-selected__name">{{ transferData.name }}</span>
                    <button type="button" :aria-label="$t('profile.profileTransferClear')" :disabled="ActiveButton" @click="closeTransferData">
                      <span class="kit-icon" v-html="Icon.Close"></span>
                    </button>
                  </div>
                  <template v-else>
                    <input
                      id="profile-transfer-input"
                      ref="transferInput"
                      type="text"
                      autocomplete="off"
                      :placeholder="$t('profile.profileTransferSearchPlaceholder')"
                      :disabled="ActiveButton"
                      @input="keyTransferInput"
                      @keyup.enter="blurTransferInput"
                    />
                    <Transition name="pgm-fade">
                      <div v-if="isTransferSearching" class="pgm-recipient-search__loader"></div>
                    </Transition>
                  </template>
                </div>

                <Transition name="pgm-status">
                  <p
                    v-if="transferStatus"
                    class="pgm-recipient-status"
                    :class="transferStatus.error ? 'pgm-recipient-error' : 'pgm-recipient-empty'"
                    aria-live="polite"
                  >{{ transferStatus.text }}</p>
                </Transition>

                <div v-if="!isTransferInputSuccess" class="pgm-recipient-list">
                  <Transition name="pgm-list">
                    <div v-if="isTransferSearching && transferData.query && !isTransferInputSuccess" key="loading" class="pgm-recipient-card pgm-recipient-card--loading" aria-hidden="true">
                      <div v-for="n in 3" :key="`recipient-skeleton-${n}`" class="pgm-recipient-row pgm-recipient-row--skeleton" :style="{ '--i': n - 1 }">
                        <span class="pgm-recipient-row__ava"></span>
                        <span class="pgm-recipient-row__mid">
                          <span class="pgm-recipient-row__skeleton-line"></span>
                          <span class="pgm-recipient-row__skeleton-line small"></span>
                        </span>
                        <span class="pgm-recipient-row__action"></span>
                      </div>
                    </div>

                    <div v-else-if="transferUsers.length && !isTransferInputSuccess" key="list" class="pgm-recipient-card" role="listbox" :aria-label="$t('profile.profileTransferRecipientLabel')">
                      <button
                        v-for="(user, index) in transferUsers"
                        :key="user.user_id"
                        type="button"
                        class="pgm-recipient-row"
                        :class="{ selected: transferUserSelected === user.user_id }"
                        :style="{ '--i': index }"
                        role="option"
                        :aria-selected="transferUserSelected === user.user_id"
                        @click="selectTransferUser(user)"
                      >
                        <span class="pgm-recipient-row__ava">
                          <img v-if="user.user_photo" :src="user.user_photo" alt="" />
                          <span v-else>{{ user.name?.[0] }}</span>
                        </span>
                        <span class="pgm-recipient-row__mid">
                          <span class="pgm-recipient-row__name">{{ user.name }}</span>
                          <span class="pgm-recipient-row__id">
                            {{ user.username ? `@${user.username}` : `ID ${user.user_id}` }}
                          </span>
                        </span>
                        <span class="pgm-recipient-row__action">
                          <template v-if="transferUserSelected === user.user_id">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          </template>
                          <template v-else>
                            {{ $t('profile.profileTransferSelect') }}
                          </template>
                        </span>
                      </button>
                    </div>
                  </Transition>
                </div>
              </section>

              <div class="mgm-footer market pgm-transfer-footer">
                <button
                  type="button"
                  class="mgm-footer__buy"
                  :class="{ _loading: ActiveButton }"
                  :disabled="!transferData.success || ActiveButton"
                  @click="transferGift"
                >
                  <span class="pgm-send-button__content" :class="{ hidden: ActiveButton }">
                    <span>{{ $t('profile.profileGiftPreviewButtonSendFor') }}</span>
                    <span class="pgm-transfer-cost">
                      <img :src="Image_StarsWhite" alt="" />
                      <span>{{ transferPrice }}</span>
                    </span>
                  </span>
                  <span class="pgm-send-button__loading" :class="{ visible: ActiveButton }">
                    <Lottie class="mgm-footer__spin" slug="loading-spin" :loop="true" width="75" height="75" renderer="svg" />
                    <span>{{ $t('profile.profileTransferSending') }}</span>
                  </span>
                </button>
              </div>
        </div>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script>
import * as nftApi from '../../api/nftApi';
import * as invoiceApi from '../../api/invoiceApi';
import * as userApi from '../../api/userApi';
import * as walletApi from '../../api/walletApi';

import { tonConnectUI } from '@/hooks/useTonConnect';
import { toUserFriendlyAddress } from 'ton-ui-vue';

import * as MarketLotsApi from '../../api/market/lots';

import { Icon } from '../Icon';
import { useCacheStore } from '../../stores/pinia/piniaStore';
import { fireFromBottom } from '../../utils/useConfetti';
import { getUpgradedModel } from '../../utils/useGift';
import { showToast } from '../../utils/toastManager';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { cutNumber } from '../../utils/useTon';

import TelegramModule from '../../hooks/useTelegram';

import Image_Stars from '@/assets/images/stars.png';
import Image_StarsWhite from '@/assets/images/stars-white.png';
import Image_GiftBg from '@/assets/gifts/png/gift_bg.png';
import Lottie from '../Lottie.vue';
import GiftLottie from '../GiftLottie.vue';
import Notiflix from 'notiflix';

import ForwardImg from '@/assets/images/forward.svg';
import CopyImg from '@/assets/images/copy.svg';

// задержка поиска получателя: было 1500мс, поле казалось зависшим
const SEARCH_DEBOUNCE_MS = 320;

export default {
  props: {
    Skeleton: { type: Boolean, required: true },
    SkeletonTime: { type: Number, required: true },
    ModalActive: { type: Boolean, required: true },
    ModalTransferActive: { type: Boolean, required: true },
    ModalComp: { type: Object, required: true },
    UpgradedNft: { type: Object, required: true },
    Table: { type: Object, required: true },
  },

  components: {
    Lottie,
    GiftLottie,
  },

  data() {
    return {
      ForwardImg,
      CopyImg,

      storeCache: useCacheStore(),

      isTransferInputSuccess: false,
      transferTimeout: null,

      showDefaultAvatar: false,
      transferUsers: [],
      transferUserSelected: null,
      transferData: { query: null, userId: null, avatar: null, name: null, success: false },
      transferYourselfError: false,
      transferSearchError: '',
      isTransferSearching: false,
      transferRequestId: 0,
      transferSections: {
        active: {
          label: this.$t('profile.profileTransferSections.name'),
          value: 'name',
        },
        items: [
          { label: this.$t('profile.profileTransferSections.name'), value: 'name' },
          { label: this.$t('profile.profileTransferSections.username'), value: 'username' },
          { label: this.$t('profile.profileTransferSections.telegram_id'), value: 'telegram_id' },
        ],
      },

      ActiveButton: false,

      isLoadingUpgrade: false,
      isLoadingUpgradeImage: false,
      isRemovingLot: false,

      // возврат NFT: шит-инструкция
      returnModalActive: false,
      returnIsRendered: false,
      returnCloseTimer: null,

      // минт в кошелёк
      // привязка кошелька по данным бэка: null — ещё не спрашивали
      mintBoundWallet: null,
      mintModalActive: false,
      mintIsRendered: false,
      mintCloseTimer: null,
      isMinting: false,
      mintPollTimer: null,
      mintWalletConnectPoll: null,
      cooldownModalActive: false,
      cooldownIsRendered: false,
      cooldownCloseTimer: null,
      isPayingTransfer: false,
      cooldownNowMs: Date.now(),
      cooldownTimer: null,

      // Sheet animation (market-style)
      dragY: 0,
      startY: 0,
      startX: 0,
      isDragging: false,
      startTimeMs: 0,
      isRendered: false,
      isVisible: false,
      closeTimer: null,
      transferIsRendered: false,
      transferIsVisible: false,
      transferCloseTimer: null,
      transferDragY: 0,
      transferStartY: 0,
      transferStartX: 0,
      transferStartTimeMs: 0,
      transferIsDragging: false,

      Icon,
      Image_Stars,
      Image_StarsWhite,
      Image_GiftBg,
      getUpgradedModel,
      cutNumber,
    };
  },

  mounted() {
    // остаток до бесплатной пересылки должен идти вживую, а не застывать
    this.cooldownTimer = setInterval(() => { this.cooldownNowMs = Date.now(); }, 30000);
    this.loadResources();
    if (this.ModalActive) {
      this.openSheet();
    }
  },

  beforeUnmount() {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    if (this.returnCloseTimer) clearTimeout(this.returnCloseTimer);
    if (this.mintCloseTimer) clearTimeout(this.mintCloseTimer);
    if (this.mintPollTimer) clearInterval(this.mintPollTimer);
    if (this.mintWalletConnectPoll) clearInterval(this.mintWalletConnectPoll);
    if (this.closeTimer) clearTimeout(this.closeTimer);
    if (this.transferCloseTimer) clearTimeout(this.transferCloseTimer);
    if (this.cooldownCloseTimer) clearTimeout(this.cooldownCloseTimer);
    if (this.transferTimeout) clearTimeout(this.transferTimeout);
    this.transferRequestId += 1;
  },

  watch: {
    ModalActive(val) {
      if (val) this.openSheet();
      else if (this.isRendered && this.isVisible) this.startClose(false);
    },
    ModalTransferActive(val) {
      if (val) this.openTransferSheet();
      else if (this.transferIsRendered && this.transferIsVisible) this.startTransferClose(false);
    },
  },

  computed: {
    isLoading() {
      return this.Skeleton;
    },

    // ── минт ──────────────────────────────────────────────────────
    mintState() {
      const s = this.ModalComp.Mint?.status;
      if (s === 'success' || s === 'processing' || s === 'failed') return s;
      return 'none';
    },
    isMintedOrMinting() {
      return this.mintState === 'success' || this.mintState === 'processing';
    },
    mintTickerLabel() {
      if (this.mintState === 'success') return this.$t('profile.profileMintFlow.tickerMinted');
      if (this.mintState === 'processing') return this.$t('profile.profileMintFlow.tickerMinting');
      return this.$t('profile.profileMintFlow.ticker');
    },
    mintDescr() {
      if (this.mintState === 'success') return this.$t('profile.profileMintFlow.mintedDescr');
      if (this.mintState === 'processing') return this.$t('profile.profileMintFlow.mintingDescr');
      if (!this.mintWalletReady) return this.$t('profile.profileMintFlow.connectDescr');
      return this.$t('profile.profileMintFlow.descr');
    },
    mintTitle() {
      if (this.mintState === 'success') return this.$t('profile.profileMintFlow.mintedTitle');
      if (this.mintState === 'processing') return this.$t('profile.profileMintFlow.mintingTitle');
      if (this.mintState === 'failed') return this.$t('profile.profileMintFlow.failedTitle');
      if (!this.mintWalletReady) return this.$t('profile.profileMintFlow.connectTitle');
      return this.$t('profile.profileMintFlow.title');
    },
    // адрес: у существующей заявки — зафиксированный, иначе — привязка с бэка.
    // локальную сессию TonConnect не смотрим: она переживает отвязку кошелька
    mintWalletAddress() {
      if (this.ModalComp.Mint?.wallet_address) return this.ModalComp.Mint.wallet_address;
      return this.mintBoundWallet || '';
    },
    mintWalletReady() {
      return !!this.mintWalletAddress;
    },
    mintShortAddress() {
      const a = this.mintWalletAddress;
      if (!a) return '';
      return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
    },
    // адрес коллекции достаём из ссылки getgems: …/collection/<addr>/<item>
    mintCollectionAddress() {
      const url = this.ModalComp.Mint?.getgems_url || '';
      const m = url.match(/\/collection\/([^/]+)/);
      return m ? m[1] : '';
    },
    mintedAtText() {
      const ms = this.ModalComp.Mint?.created_at;
      if (!ms) return '—';
      try {
        return new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
      } catch {
        return '—';
      }
    },
    // один элемент на все состояния: при смене текста узел не пересоздаётся,
    // поэтому уходящий и приходящий блоки больше не складываются по высоте
    transferStatus() {
      if (this.isTransferInputSuccess) return null;
      if (this.transferYourselfError) {
        return { error: true, text: this.$t('profile.profileGiftModalTransferError') };
      }
      if (this.transferSearchError) {
        return { error: true, text: this.transferSearchError };
      }
      if (this.transferData.query && !this.transferUsers.length && !this.isTransferSearching) {
        return { error: false, text: this.$t('profile.profileTransferEmpty') };
      }
      return null;
    },
    isUpgraded() {
      return !!this.ModalComp?.NftUpgraded;
    },
    normalizedRarity() {
      let rarity = String(this.ModalComp?.NftRarity || '').toLowerCase().replace(/[\s_-]+/g, '');
      if (rarity === 'legendary') rarity = 'legend';
      if (rarity === 'veryrarity') rarity = 'veryrare';
      return rarity;
    },
    sheetStyle() {
      if (!this.isDragging || !this.isVisible) return null;
      return {
        transform: `translate(-50%, ${Math.max(0, this.dragY)}px)`,
        transition: 'none',
        willChange: 'transform',
        animation: 'none',
      };
    },
    transferSheetStyle() {
      if (!this.transferIsDragging || !this.transferIsVisible) return null;
      return {
        transform: `translate(-50%, ${Math.max(0, this.transferDragY)}px)`,
        transition: 'none',
        willChange: 'transform',
        animation: 'none',
      };
    },
    // в заголовке всегда оригинальный подарок: у улучшенных моделей вид
    // может не иметь ничего общего с коллекцией, и люди не понимают,
    // что именно у них в руках. имя модели остаётся в строке «Модель»
    // сколько миллисекунд осталось до бесплатной пересылки
    transferCooldownLeft() {
      const until = Number(this.ModalComp?.FreeTransferAt || 0);
      if (!until) return 0;
      return Math.max(0, until - this.cooldownNowMs);
    },

    // в первые сутки отправка стоит 25 звёзд, дальше бесплатна
    transferPrice() {
      return this.transferCooldownLeft > 0 ? 25 : 0;
    },

    // «3 ч 20 мин» — округляем вверх, чтобы не обещать раньше времени
    transferCooldownText() {
      const left = this.transferCooldownLeft;
      if (left <= 0) return '';
      const totalMin = Math.ceil(left / 60000);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      if (h > 0) return `${h} ${this.$t('profile.profileTransferFee.hours')} ${m} ${this.$t('profile.profileTransferFee.minutes')}`;
      return `${m} ${this.$t('profile.profileTransferFee.minutes')}`;
    },

    displayName() {
      return this.ModalComp.GiftName || this.ModalComp.NftName || '';
    },
    modelNameText() {
      const raw = this.UpgradedNft?.ModelName;
      if (!raw) return this.ModalComp.NftName || '';
      if (typeof raw === 'object') return raw.name || raw.Name || '';
      return String(raw);
    },
    modelDropRate() {
      const raw = this.UpgradedNft?.ModelDropRate ?? this.UpgradedNft?.ModelName?.drop_rate;
      return raw || null;
    },
    symbolNameText() {
      const raw = this.UpgradedNft?.SymbolName;
      if (!raw) return '—';
      if (typeof raw === 'object') return raw.name || raw.Name || '—';
      return String(raw);
    },
    backgroundNameText() {
      const raw = this.UpgradedNft?.BackgroundName;
      if (!raw) return '—';
      if (typeof raw === 'object') return raw.name || raw.Name || '—';
      return String(raw);
    },
    cardHeadStyle() {
      if (!this.isUpgraded) return null;
      const center = this.UpgradedNft?.BackgroundColors?.Center;
      const around = this.UpgradedNft?.BackgroundColors?.Around;
      if (!center && !around) return null;
      return {
        '--center-color': center || '#666',
        '--around-color': around || '#1a1a1a',
      };
    },
    showLottie() {
      const media = this.ModalComp?.NftMedia;
      if (this.isUpgraded) {
        const image = this.UpgradedNft?.ModelImage || '';
        return media === 'lottie' || /\.json(\?|$)/i.test(String(image));
      }
      return media === 'lottie';
    },
    modelImageSrc() {
      if (this.isUpgraded) {
        const apiImage = this.UpgradedNft?.ModelImage || '';
        if (apiImage && !/\.json(\?|$)/i.test(apiImage)) {
          return apiImage;
        }
        const uKey = this.ModalComp.NftUniqueKey;
        const modelName = this.modelNameText;
        return getUpgradedModel(uKey, modelName, 'svg') || apiImage || this.ModalComp.NftImage || '';
      }
      return this.ModalComp.NftImage || '';
    },
    lottiePath() {
      if (this.isUpgraded) {
        const apiImage = this.UpgradedNft?.ModelImage || '';
        if (apiImage && /\.json(\?|$)/i.test(apiImage)) {
          return apiImage;
        }
        if (this.ModalComp.NftMedia !== 'lottie') return '';
        if (apiImage && /\.svg(\?|$)/i.test(apiImage)) {
          return apiImage.replace(/\.svg(\?|$)/i, '.json$1');
        }
        const uKey = this.ModalComp.NftUniqueKey;
        const modelName = this.modelNameText;
        return getUpgradedModel(uKey, modelName, 'json') || '';
      }
      if (this.ModalComp.NftMedia !== 'lottie' || !this.ModalComp.NftKey) return '';
      return `/gifts/lottie/${this.ModalComp.NftKey}.json`;
    },
    canSend() {
      return true;
    },
    showMint() {
      return !this.isUpgraded;
    },
    showSell() {
      return this.isUpgraded && !this.ModalComp?.Market?.MarketOn;
    },
    showRemove() {
      return !!this.ModalComp?.Market?.MarketOn;
    },
  },

  methods: {
    async loadResources() {
      try {
        await Promise.all([document.fonts.ready, this.loadImages()]);
        this.$emit('loadSuccess');
      } catch (error) {
        console.error('Ошибка при загрузке ресурсов:', error);
      }
    },

    loadImages() {
      return Promise.all(
        [Image_Stars].map(
          (src) =>
            new Promise((resolve, reject) => {
              const img = new Image();
              img.src = src;
              img.onload = resolve;
              img.onerror = reject;
            })
        )
      );
    },

    openSheet() {
      if (this.closeTimer) {
        clearTimeout(this.closeTimer);
        this.closeTimer = null;
      }
      this.isRendered = true;
      this.$nextTick(() => {
        requestAnimationFrame(() => {
          this.isVisible = true;
        });
      });
    },

    startClose(emitParent = true) {
      if (!this.isRendered) {
        if (emitParent) this.$emit('closeModal');
        return;
      }
      try { TelegramModule.useSoftHaptic(); } catch {}
      this.isVisible = false;
      this.isDragging = false;
      this.dragY = 0;
      if (this.closeTimer) clearTimeout(this.closeTimer);
      this.closeTimer = setTimeout(() => {
        this.isRendered = false;
        this.closeTimer = null;
        if (emitParent) this.$emit('closeModal');
      }, 340);
    },

    closeModal() {
      this.startClose(true);
    },

    onPrimarySend() {
      this.useTransferModal();
    },

    async transferNft() {
      if (!this.ModalComp.NftUuid) return;

      Notiflix.Confirm.show(
        this.$t('profile.profileConfirmTransfer.title'),
        this.$t('profile.profileConfirmTransfer.descr'),
        this.$t('profile.profileConfirmTransfer.button'),
        this.$t('profile.profileConfirmTransfer.buttonCancel'),
        async () => {
          const UUIDs = [this.ModalComp.NftUuid];
          const updateNft = await nftApi.swap(UUIDs);
          if (!updateNft) return;
          if (updateNft.status === 'received') {
            this.closeModal();
          }

          this.$emit('transferNft');
          this.closeModal();
        },
        () => {}
      );
    },

    async sendNft() {
      if (!this.ModalComp.NftId) return;
      this.useTransferModal();
    },

    // шит платной отправки открывается вместо модалки подарка,
    // ровно как форма отправки: две карточки одновременно на экране
    // выглядят нагромождением
    // справка о платной отправке. открывается поверх формы отправки
    // и ничего не закрывает: человек читает и возвращается к выбору
    openCooldownModal() {
      try { TelegramModule.useSoftHaptic(); } catch {}
      if (this.cooldownCloseTimer) {
        clearTimeout(this.cooldownCloseTimer);
        this.cooldownCloseTimer = null;
      }
      // шит должен выехать снизу, поэтому сначала рисуем его закрытым
      // и только следующим кадром открываем
      this.cooldownIsRendered = true;
      this.$nextTick(() => requestAnimationFrame(() => {
        this.cooldownModalActive = true;
      }));
    },

    closeCooldownModal() {
      this.cooldownModalActive = false;
      if (this.cooldownCloseTimer) clearTimeout(this.cooldownCloseTimer);
      // ждём анимацию ухода, иначе шит пропадает рывком
      this.cooldownCloseTimer = setTimeout(() => {
        this.cooldownIsRendered = false;
        this.cooldownCloseTimer = null;
      }, 260);
    },

    // оплата 25 звёзд: счёт создаёт бэкенд, дальше подарок уходит сам
    async payTransferFee() {
      if (this.isPayingTransfer) return;
      // без получателя счёт выставить не на кого
      if (!this.transferData.userId) return;

      this.isPayingTransfer = true;
      try {
        const invoice = await invoiceApi.createInvoiceNftTransfer(
          this.ModalComp.NftUuid,
          this.ModalComp.NftUniqueKey,
          Number(this.transferData.userId),
        );
        if (!invoice || !invoice.link) {
          showToast(this.$t('profile.profileTransferErrors.common'), 'error');
          return;
        }
        TelegramModule.useInvoice(
          invoice.link,
          () => {
            const uuid = this.ModalComp.NftUuid;
            // имя запоминаем заранее: закрытие формы очищает transferData
            const name = this.transferData.name;
            this.closeCooldownModal();
            // форма отправки могла остаться открытой — уводим её,
            // и только потом убираем карточку из списка
            this.ActiveButton = false;
            if (this.transferIsRendered) this.startTransferClose(true);
            this.storeCache.UserData.sent_user++;
            showToast(this.$t('profile.profileTransferSuccess', { name }), 'success');
            setTimeout(() => this.$emit('useTransfered', uuid), 220);
          },
          () => {},
        );
      } catch {
        showToast(this.$t('profile.profileTransferErrors.common'), 'error');
      } finally {
        this.isPayingTransfer = false;
      }
    },

    useTransferModal() {
      // форма открывается всегда: про платную отправку в первые сутки
      // говорит плашка внутри формы и цена на кнопке отправки
      // Close gift sheet immediately, open transfer
      try { TelegramModule.useSoftHaptic(); } catch {}
      if (this.closeTimer) {
        clearTimeout(this.closeTimer);
        this.closeTimer = null;
      }
      this.isVisible = false;
      this.isRendered = false;
      this.$emit('closeModal');
      this.$emit('useTransferModal');
    },

    openTransferSheet() {
      if (this.transferCloseTimer) clearTimeout(this.transferCloseTimer);
      // сбрасываем прошлый поиск, иначе шит открывается с чужим получателем
      this.resetTransferSearch();
      this.transferIsRendered = true;
      this.$nextTick(() => requestAnimationFrame(() => { this.transferIsVisible = true; }));
    },

    startTransferClose(emitParent = true) {
      this.transferIsVisible = false;
      this.transferIsDragging = false;
      this.transferDragY = 0;
      // справка живёт вместе с формой: закрылась форма — закрылась и она
      if (this.cooldownIsRendered) this.closeCooldownModal();
      this.resetTransferSearch();
      if (this.transferCloseTimer) clearTimeout(this.transferCloseTimer);
      this.transferCloseTimer = setTimeout(() => {
        this.transferIsRendered = false;
        this.transferCloseTimer = null;
        if (emitParent) {
          this.$emit('closeTransferModal');
          this.$emit('closeModal');
        }
      }, 340);
    },

    closeTransferModal() {
      if (this.ActiveButton) return;
      try { TelegramModule.useSoftHaptic(); } catch {}
      this.startTransferClose(true);
    },

    resetTransferSearch() {
      if (this.transferTimeout) {
        clearTimeout(this.transferTimeout);
        this.transferTimeout = null;
      }
      this.transferRequestId += 1;
      this.isTransferSearching = false;
      this.transferUsers = [];
      this.transferUserSelected = null;
      this.isTransferInputSuccess = false;
      this.transferYourselfError = false;
      this.transferSearchError = '';
      this.clearTransferData();
    },

    clearTransferData() {
      try {
        this.transferData = {
          query: null,
          userId: null,
          avatar: null,
          name: null,
          success: false,
        };
      } catch {}
    },

    closeTransferData() {
      this.clearTransferData();
      this.transferUserSelected = null;
      this.isTransferInputSuccess = false;
    },

    keyTransferInput(event) {
      const raw = typeof event?.target?.value === 'string' ? event.target.value : '';
      const eventText = raw.trim();

      this.transferYourselfError = false;
      this.transferSearchError = '';

      // любой новый ввод отменяет запланированный и уже летящий запрос,
      // иначе ответ по старой строке перетирал актуальный список
      if (this.transferTimeout) {
        clearTimeout(this.transferTimeout);
        this.transferTimeout = null;
      }
      this.transferRequestId += 1;

      if (eventText === '') {
        this.isTransferSearching = false;
        this.transferUsers = [];
        this.transferUserSelected = null;
        this.isTransferInputSuccess = false;
        this.clearTransferData();
        return;
      }

      const me = this.storeCache.UserData.user;

      if (eventText.startsWith('@')) {
        this.setActiveTransferTab('username');
        if (eventText === '@' + me.Username) this.transferYourselfError = true;
      } else if (!isNaN(eventText)) {
        this.setActiveTransferTab('telegram_id');
        if (eventText === String(me.Tld)) this.transferYourselfError = true;
      } else {
        this.setActiveTransferTab('name');
        const lower = eventText.toLowerCase();
        if (lower === String(me.Name || '').toLowerCase() ||
            lower === String(me.Username || '').toLowerCase()) {
          this.transferYourselfError = true;
        }
      }

      // раньше здесь стоял return без сброса — отложенный запрос всё равно
      // улетал со старой строкой и подмешивал чужие результаты к ошибке
      if (this.transferYourselfError) {
        this.isTransferSearching = false;
        this.transferUsers = [];
        this.clearTransferData();
        return;
      }

      this.transferData.query = eventText;
      // индикатор включаем сразу, а не через задержку: раньше поле
      // 1.5 секунды выглядело мёртвым
      this.isTransferSearching = true;

      this.transferTimeout = setTimeout(() => {
        this.transferTimeout = null;
        this.getTransferData();
      }, SEARCH_DEBOUNCE_MS);
    },

    async blurTransferInput() {
      // Enter ищет немедленно и снимает отложенный запрос,
      // раньше уходили сразу два: этот и запланированный
      if (this.transferTimeout) {
        clearTimeout(this.transferTimeout);
        this.transferTimeout = null;
      }
      if (this.transferData.query) {
        this.isTransferSearching = true;
        await this.getTransferData();
      }
    },

    async getTransferData() {
      if (!this.transferData.query) return;
      let query = String(this.transferData.query);
      if (query === this.storeCache.UserData.user.Tld.toString()) {
        this.transferYourselfError = true;
        return;
      }
      if (query.startsWith('@')) query = query.slice(1);

      const requestId = ++this.transferRequestId;
      this.isTransferSearching = true;
      this.transferSearchError = '';
      try {
        const response = await userApi.searchUser(query);
        if (requestId !== this.transferRequestId) return;
        this.transferUsers = Array.isArray(response) ? response : [];
        if (!response) this.transferSearchError = this.$t('profile.profileTransferSearchError');
      } catch {
        if (requestId === this.transferRequestId) {
          this.transferUsers = [];
          this.transferSearchError = this.$t('profile.profileTransferSearchError');
        }
      } finally {
        if (requestId === this.transferRequestId) this.isTransferSearching = false;
      }
    },

    async transferGift() {
      if (!this.transferData.success) return;

      // первые сутки после получения отправка платная: вместо
      // бесплатного перевода выставляем счёт на 25 звёзд
      if (this.transferCooldownLeft > 0) {
        if (parseInt(this.transferData.userId) === parseInt(this.storeCache.TelegramData.user.id)) {
          this.transferYourselfError = true;
          return;
        }
        this.ActiveButton = true;
        try {
          await this.payTransferFee();
        } finally {
          this.ActiveButton = false;
        }
        return;
      }

      await this.transferInvoiceSendGift();
    },

    // причины отказа с сервера — человеческим языком
    transferErrorText(reason) {
      const r = String(reason || '');
      if (r.includes('transfer cooldown')) return this.$t('profile.profileTransferErrors.cooldown');
      if (r.includes('recipient is blocked')) return this.$t('profile.profileTransferErrors.blocked');
      if (r.includes('locked in a deal')) return this.$t('profile.profileTransferErrors.locked');
      if (r.includes('listed on the market')) return this.$t('profile.profileTransferErrors.onMarket');
      if (r.includes('target user not found')) return this.$t('profile.profileTransferErrors.noTarget');
      if (r.includes('forbidden') || r.includes('owner')) return this.$t('profile.profileTransferErrors.notOwner');
      return this.$t('profile.profileTransferErrors.common');
    },

    async transferInvoiceSendGift() {
      if (!this.transferData.success) return;

      if (parseInt(this.transferData.userId) === parseInt(this.storeCache.TelegramData.user.id)) {
        this.transferYourselfError = true;
        return;
      }

      this.ActiveButton = true;
      const nftsToTransfer = [this.ModalComp.NftUuid];
      try {
        const transfer = await nftApi.transfer(nftsToTransfer, this.transferData.userId);
        if (!transfer || transfer.error) {
          showToast(this.transferErrorText(transfer?.reason), 'error');
          return;
        }

        this.storeCache.UserData.sent_user++;
        showToast(this.$t('profile.profileTransferSuccess', { name: this.transferData.name }), 'success');

        // closeTransferModal() выходит молча, пока ActiveButton === true,
        // поэтому снимаем флаг до закрытия — иначе шит остаётся висеть
        this.ActiveButton = false;

        // сначала уводим шит, и только потом убираем карточку из списка:
        // иначе она пропадает под ещё открытой модалкой и анимации не видно
        this.closeTransferModal();
        setTimeout(() => this.$emit('useTransfered', nftsToTransfer[0]), 220);
      } catch {
        showToast('Error transferring gift', 'error');
      } finally {
        this.ActiveButton = false;
      }
    },

    async upgradeNft() {
      this.isLoadingUpgrade = true;

      const invoice = await invoiceApi.createInvoiceNftUpgrade(this.ModalComp.NftUuid);
      const paymentId = invoice.payment_upgrade_id;

      if (!invoice.success) {
        const idDontSuccess = invoice?.payment_upgrade_id || invoice?.UUID;
        if (!idDontSuccess) {
          this.isLoadingUpgrade = false;
          return;
        }

        const upgrade = await nftApi.upgrade(idDontSuccess);
        if (!upgrade) {
          this.isLoadingUpgrade = false;
          return;
        }
        if (upgrade.ok) {
          const upgradeData = upgrade.data;
          this.$emit('UPGRADE', {
            GiftUuid: this.ModalComp.NftId,
            GiftMedia: this.ModalComp.NftMedia,
            ...upgradeData,
          });

          setTimeout(() => {
            this.isLoadingUpgrade = false;
            this.isLoadingUpgradeImage = false;
            // объект апгрейда, а не true: иначе продажа получает пустые поля
            this.ModalComp.NftUpgraded = upgradeData;
            this.$emit(
              'upgradedNftModal',
              this.ModalComp.NftId,
              this.UpgradedNft.ModelName,
              this.UpgradedNft.SymbolName,
              this.UpgradedNft.BackgroundName,
              this.UpgradedNft.ModelNumber
            );
            fireFromBottom();
          }, 400);

          return;
        }
      }

      TelegramModule.useInvoice(
        invoice.link,
        async () => {
          const webSocketLink = import.meta.env.VITE_APP_SOCKET_URL;
          const socket = new WebSocket(`${webSocketLink}/payments/ws/${paymentId}`);

          socket.onopen = () => {};
          socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if (!data.nft_id) return;
            if (data.nft_id === this.ModalComp.NftUuid && data.actual_amount === this.ModalComp.NftUpgradePrice) {
              const upgrade = await nftApi.upgrade(paymentId);
              if (!upgrade) return;
              if (upgrade.ok) {
                const upgradeData = upgrade.data;
                this.$emit('UPGRADE', {
                  GiftUuid: this.ModalComp.NftId,
                  GiftMedia: this.ModalComp.NftMedia,
                  ...upgradeData,
                });

                setTimeout(() => {
                  this.isLoadingUpgrade = false;
                  this.isLoadingUpgradeImage = false;
                  // объект апгрейда, а не true: sellGift() его разворачивает
                  // спредом, и с булевым значением лот уходил без модели и номера
                  this.ModalComp.NftUpgraded = upgradeData;
                  this.$emit(
                    'upgradedNftModal',
                    this.ModalComp.NftId,
                    this.UpgradedNft.ModelName,
                    this.UpgradedNft.SymbolName,
                    this.UpgradedNft.BackgroundName,
                    this.UpgradedNft.ModelNumber
                  );
                  fireFromBottom();
                }, 400);
              }
            }
          };
          socket.onclose = () => {};
          socket.onerror = (err) => {
            console.error('WebSocket error:', err);
          };
        },
        () => {
          this.isLoadingUpgrade = false;
        }
      );
    },

    shareGiftLink() {
      const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=gift_${this.ModalComp.NftId}`;
      const message = `I recommend checking out "${this.displayName}" NFT.`;
      TelegramModule.useShare(url, message);
    },

    copyGiftLink() {
      const url = import.meta.env.VITE_APP_MINI_APP_LINK + `=gift_${this.ModalComp.NftId}`;
      copyToClipboard(url);
      showToast(this.$t('profile.profileCopiedLink'), 'success');
    },

    setActiveTransferTab(value) {
      const section = this.transferSections.items.find((item) => item.value === value);
      if (!section || this.transferSections.active.value === value) return;
      this.transferSections.active.label = section.label;
      this.transferSections.active.value = value;
      if (this.transferTimeout) clearTimeout(this.transferTimeout);
      this.transferRequestId += 1;
      this.isTransferSearching = false;
      this.transferSearchError = '';
      this.transferUsers = [];
      this.transferUserSelected = null;
      this.isTransferInputSuccess = false;
      this.clearTransferData();
    },

    selectTransferUser(user) {
      this.transferUserSelected = user.user_id;
      this.transferData.userId = Number(user.user_id);
      this.transferData.avatar = user.user_photo;
      this.transferData.name = user.name;
      this.transferData.success = true;
      this.$refs.transferInput?.blur();
      this.isTransferInputSuccess = true;
      },

    onTouchStart(e) {
      if (!this.isVisible) return;
      const t = e.touches?.[0] ?? e;
      this.isDragging = true;
      this.startY = t.clientY;
      this.startX = t.clientX;
      this.dragY = 0;
      this.startTimeMs = performance.now();
    },

    onTouchMove(e) {
      if (!this.isDragging) return;
      const t = e.touches?.[0] ?? e;
      const dy = t.clientY - this.startY;
      if (Math.abs(t.clientX - this.startX) > Math.abs(dy)) return;
      this.dragY = dy > 0 ? dy : 0;
    },

    onTouchEnd() {
      if (!this.isDragging) return;
      const elapsed = Math.max(1, performance.now() - this.startTimeMs);
      const distance = Math.max(0, this.dragY);
      this.isDragging = false;
      if (distance > 120 || distance / elapsed > 0.6) {
        this.closeModal();
      } else {
        this.dragY = 0;
      }
    },

    onTransferTouchStart(e) {
      if (!this.transferIsVisible || this.ActiveButton) return;
      const t = e.touches?.[0] ?? e;
      this.transferIsDragging = true;
      this.transferStartY = t.clientY;
      this.transferStartX = t.clientX;
      this.transferDragY = 0;
      this.transferStartTimeMs = performance.now();
    },

    onTransferTouchMove(e) {
      if (!this.transferIsDragging) return;
      const t = e.touches?.[0] ?? e;
      const dy = t.clientY - this.transferStartY;
      if (Math.abs(t.clientX - this.transferStartX) > Math.abs(dy)) return;
      this.transferDragY = Math.max(0, dy);
    },

    onTransferTouchEnd() {
      if (!this.transferIsDragging) return;
      const elapsed = Math.max(1, performance.now() - this.transferStartTimeMs);
      const distance = this.transferDragY;
      this.transferIsDragging = false;
      if (distance > 120 || distance / elapsed > 0.6) this.closeTransferModal();
      else this.transferDragY = 0;
    },

    onTickerClick(action) {
      try { TelegramModule.useSoftHaptic(); } catch {}

      switch (action) {
        case 'upgrade':
          if (!this.ModalComp.NftUpgradeSupport) {
            showToast(this.$t('profile.profileUpgradeNotSupported'), 'error');
            return;
          }
          this.upgradeNft();
          break;

        case 'mint':
          this.onMintButton();
          break;

        case 'sell':
          if (this.isMintedOrMinting) return;
          if (!this.isUpgraded) {
            showToast(this.$t('profile.profileSellUpgradeRequired'), 'error');
            return;
          }
          this.sellGift();
          break;

        case 'remove':
          this.removeGiftLot();
          break;

        case 'send':
          if (this.isMintedOrMinting) return;
          if (this.ModalComp.Market?.MarketOn) {
            showToast(this.$t('profile.profileSendRemoveFromMarket'), 'error');
            return;
          }
          this.useTransferModal();
          break;

        default:
          break;
      }
    },

    // ── возврат NFT: инструкция ────────────────────────────────────
    openReturnModal() {
      try { TelegramModule.useSoftHaptic(); } catch {}
      if (this.returnCloseTimer) { clearTimeout(this.returnCloseTimer); this.returnCloseTimer = null; }
      this.returnIsRendered = true;
      requestAnimationFrame(() => { this.returnModalActive = true; });
    },

    closeReturnModal() {
      this.returnModalActive = false;
      this.returnCloseTimer = setTimeout(() => { this.returnIsRendered = false; }, 360);
    },

    // ── минт в кошелёк ─────────────────────────────────────────────
    // минт-шит заменяет шит подарка: старый закрываем, новый — поверх
    onMintButton() {
      try { TelegramModule.useSoftHaptic(); } catch {}
      // с маркета минтить нельзя — лот повиснет без предмета
      if (this.ModalComp.Market?.MarketOn && this.mintState === 'none') {
        showToast(this.$t('profile.profileMintFlow.marketBlock'), 'error');
        return;
      }
      this.closeModal();
      this.openMintModal();
    },

    copyMintAddress(addr) {
      if (!addr) return;
      try {
        copyToClipboard(addr);
        try { TelegramModule.useSoftHaptic(); } catch {}
        showToast(this.$t('profile.profileMintFlow.chainCopied'), 'success');
      } catch {}
    },

    shortAddr(a) {
      if (!a) return '';
      return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
    },

    openMintModal() {
      if (this.mintCloseTimer) { clearTimeout(this.mintCloseTimer); this.mintCloseTimer = null; }
      this.mintIsRendered = true;
      requestAnimationFrame(() => { this.mintModalActive = true; });
      // если минт уже идёт — сразу продолжаем следить за статусом
      if (this.mintState === 'processing') this.startMintPoll();
      // актуальная привязка кошелька с бэка
      this.refreshBoundWallet();
    },

    async refreshBoundWallet() {
      const res = await walletApi.get();
      if (res && res.ok) this.mintBoundWallet = res.wallet_address || '';
    },

    closeMintModal() {
      this.mintModalActive = false;
      this.stopMintPoll();
      if (this.mintWalletConnectPoll) { clearInterval(this.mintWalletConnectPoll); this.mintWalletConnectPoll = null; }
      this.mintCloseTimer = setTimeout(() => { this.mintIsRendered = false; }, 360);
    },

    // подключение кошелька, не выходя из минт-шита (механика — как в User.vue)
    connectWalletFromMint() {
      try { TelegramModule.useMediumHaptic(); } catch {}
      tonConnectUI.openModal();
      if (this.mintWalletConnectPoll) clearInterval(this.mintWalletConnectPoll);
      this.mintWalletConnectPoll = setInterval(async () => {
        if (!tonConnectUI.connected || !tonConnectUI.account?.address) return;
        clearInterval(this.mintWalletConnectPoll);
        this.mintWalletConnectPoll = null;
        try {
          const addr = toUserFriendlyAddress(tonConnectUI.account.address);
          if (addr) {
            const res = await walletApi.create(addr);
            if (res && res.WalletAddress) this.mintBoundWallet = res.WalletAddress;
            else this.mintBoundWallet = addr;
          }
        } catch { /* следующий refreshBoundWallet подтянет */ }
      }, 1000);
    },

    async doMint() {
      if (this.isMinting) return;
      this.isMinting = true;
      try { TelegramModule.useMediumHaptic(); } catch {}
      try {
        const res = await nftApi.mintNft(this.ModalComp.NftUuid);
        if (!res || res.ok === false) {
          showToast(res?.error || this.$t('profile.profileMintFlow.failedTitle'), 'error');
          return;
        }
        this.$emit('mintUpdated', this.ModalComp.NftUuid, res.mint);
        this.startMintPoll();
      } finally {
        this.isMinting = false;
      }
    },

    startMintPoll() {
      this.stopMintPoll();
      this.mintPollTimer = setInterval(async () => {
        const res = await nftApi.mintStatus(this.ModalComp.NftUuid);
        if (!res || !res.mint) return;
        this.$emit('mintUpdated', this.ModalComp.NftUuid, res.mint);
        if (res.mint.status === 'success') {
          this.stopMintPoll();
          try { fireFromBottom(); } catch {}
        } else if (res.mint.status === 'failed') {
          this.stopMintPoll();
        }
      }, 4000);
    },

    stopMintPoll() {
      if (this.mintPollTimer) { clearInterval(this.mintPollTimer); this.mintPollTimer = null; }
    },

    openTonviewer() {
      const addr = this.ModalComp.Mint?.nft_address;
      if (!addr) return;
      const url = `https://tonviewer.com/${addr}`;
      try { TelegramModule.useSoftHaptic(); } catch {}
      try {
        window.Telegram?.WebApp?.openLink ? window.Telegram.WebApp.openLink(url) : window.open(url, '_blank');
      } catch {
        window.open(url, '_blank');
      }
    },

    openTonscan() {
      const addr = this.ModalComp.Mint?.nft_address;
      if (!addr) return;
      const url = `https://tonscan.org/nft/${addr}`;
      try { TelegramModule.useSoftHaptic(); } catch {}
      try {
        window.Telegram?.WebApp?.openLink ? window.Telegram.WebApp.openLink(url) : window.open(url, '_blank');
      } catch {
        window.open(url, '_blank');
      }
    },

    openGetgems() {
      const url = this.ModalComp.Mint?.getgems_url;
      if (!url) return;
      try { TelegramModule.useSoftHaptic(); } catch {}
      try {
        window.Telegram?.WebApp?.openLink ? window.Telegram.WebApp.openLink(url) : window.open(url, '_blank');
      } catch {
        window.open(url, '_blank');
      }
    },

    sellGift() {
      if (!this.ModalComp.NftUpgraded) return;
      this.closeModal();
      const obj = {
        ton_price: 0,
        gift_media: this.ModalComp.NftMedia,
        gift_ukey: this.ModalComp.NftUniqueKey,
        gift_uuid: this.ModalComp.NftUuid,
        ...this.ModalComp.NftUpgraded,
      };
      this.$emit('openSellModal', obj);
    },

    async removeGiftLot() {
      if (!this.ModalComp.Market?.LotId || this.isRemovingLot) return;
      this.isRemovingLot = true;
      try {
        const res = await MarketLotsApi.remove(this.ModalComp.Market.LotId);
        if (!res) {
          showToast('Could not remove this gift from the market', 'error');
          return;
        }
        this.$emit('removeGiftLot', this.ModalComp.NftUuid);
      } catch {
        showToast('Could not remove this gift from the market', 'error');
      } finally {
        this.isRemovingLot = false;
      }
    },
  },
};
</script>

<style lang="sass" scoped>
@use "../Market/Modal.sass"
@use "./ProfileGiftModal.sass"

// Герой только своей модалки. Класс .pgm-own есть лишь здесь — модалка чужого
// профиля (.vgm-modal) и модалка маркета этих правил не видят.
.pgm-own .mgm-card__model
    width: 52%
    height: 52%
    // базовые 35% плюс ровно 10px вниз
    top: calc(35% + 10px)
</style>
