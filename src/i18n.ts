import { getUserLanguage } from './utils/useApp';

import i18next from 'i18next';

i18next.init({
  lng: getUserLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
        translation: {
            app: {
                rarity_1: "Rare",
                rarity_2: "Very rare",
                rarity_3: "Epic",
                rarity_4: "Legend",
                rarity_5: "Sold out",
                rarity_6: "Author",

                price_free: "Free",

                supplySubmission: "of",
                giftsSubmission: "gifts",
                giftSubmission: "Gift",

                sendGift: "Send",
                sendGiftText: "gift",

                newMark: "New",
                soon: "Soon",
            },
            menu: {
                home: "Home",
                rating: "Rating",
                profile: "Profile",
                market: "Market",
                tickets: "Tickets",
                tasks: "Tasks",
                soon: "Soon",
            },
            home: {
                title: "Memgift",

                slider_0: "Memgift x Pepel Nahudi",
                slider_1: "Favorite gift",
                slider_2: "Affiliate program",
                slider_3: "Project Roadmap",
                slider_4: "Meme-tickets",
                slider_5: "Summer Collection",

                slider_button_0: "Go",
                slider_button_5: "Buy",
                slider_button: "Learn more",

                create_own_gift_title: "Create own gift",
                create_own_gift_mark: "Soon",

                gift_store_title: "Gift Store",
                gift_store_null: "No gifts found",
                gift_store_null_button: "Reload",

                hideGifts: "Hide sold gifts",

                category_1: "All Gifts",
                category_2: "New Gifts",
                category_3: "Rare",
                category_4: "Very rare",
                category_5: "Epic",
                category_6: "Legend",
                category_7: "Sold out",
                category_8: "Author",

                sortby_1: "New",
                sortby_2: "Old",
                sortby_3: "By rarity",
                sortby_4: "By price (high to low)",
                sortby_5: "By price (low to high)",
                sortby_6: "By supply (high to low)",
                sortby_7: "By supply (low to high)",

                giftNew: "New",

                buyed: "purchased",
                sended: "sended",

                nullGiftsTitle: "No gifts",
                nullGiftsDescr: "Edit gift rarity or reset",
                nullGiftsButton: "Reset",
            },
            collection: {
                giftCollectable: "Collectible",

                description: "Buy a gift to send to a friend or contact",

                recentsTitle: "Recent actions",
                recentsNull: "No history",
                recentsAction1: "sent gift",
                recentsAction2: "received gift",
                recentsAction3: "purchased gift",

                buttonBuy1: "Buy",
                buttonBuy2: "Gifts for",
                buttonBuyStars: "Buy Stars",

                saleNotSupport: "Tickets not supported",

                terms: {
                    termsTitle: "Conditions",
                    inviteFriends: "Invite 5 friends",
                    inviteFriendsDesc: "Send messages",
                    shareChats: "Share 3 chats",
                    shareChatsDesc: "Send messages in chats",
                    subscribedChannel: "Subscribe",
                    subscribedChannelDesc: "Subscribe to channel",
                },
                buttonConditions: "Fulfill the conditions",
                buttonGetFree: "Get gift",
                buttonGoToStore: "Go to store",
                buttonMaxAmount: "Max amount",
            },
            rating: {
                title: "Rating",
                description: "Receive gifts by friends and boost your rating!",
                section1: "Holders",
                section2: "Referrals",
                gifts: "gifts",
                referrals: "referrals",
            },
            profile: {
                profileGiftsCount: "gifts", // 0 gifts

                profileGiftsTitle: "My gifts",
                profileGiftsViewTitle: "Gifts",

                profileGiftSended: "Sended",

                profileGiftsCategory1: "Received",
                profileGiftsCategory2: "Purchased",

                profileGiftsNull: "No gifts(",
                profileGiftsNullButtonAsking: "Gifts can be bought in the store",
                profileGiftsNullButtonBuy: "Buy",
                profileGiftsGiftSended: "Sent",
                profileGiftsGiftSupply: "of", // 130 of 1000
                profileGiftsGiftSend: "Send",

                profileGiftPreviewTableItem1: "Owner",
                profileGiftPreviewTableItem0: "Previous owner",
                profileGiftPreviewTableItem1Set: "Set status",
                profileGiftPreviewTableItem2: "Date",
                profileGiftPreviewTableItem3: "Value",
                profileGiftPreviewTableItem4: "Supply",
                profileGiftPreviewTableItem4Supply: "of", // 130 of 1000

                profileGiftPreviewTableMintedItem1: "Model",
                profileGiftPreviewTableMintedItem2: "Symbol",
                profileGiftPreviewTableMintedItem3: "Background",

                profileGiftPreviewButtonCollectable: "Upgrade gift",
                profileGiftPreviewButtonCollectableMark1: "Soon",
                profileGiftPreviewButtonTransfer: "Transfer to received",
                profileGiftPreviewButtonSend: "Send Gift",
                profileGiftPreviewButtonSendFor: "Send for",
                profileGiftPreviewButtonOk: "Ok",

                profileGiftButtonOk: "Close",

                profileTransferSections: {
                    name: "Name",
                    username: "Username",
                    telegram_id: "Tg ID",
                },
                profileTransferLabel: "Search by",
                profileTransferInputPlaceholder: "Enter",
                profileGiftModalTransferError: "You can't send yourself.",

                profileReferralProgram: "Referral Program",
                profileCreatePrivateDeal: "Private Deal",
                profileCreateMulticheck: "Multicheck",

                profileConnect: "Connect wallet",
                profileDisconnectModalTitle: "Disconnect your wallet",
                profileDisconnectModalDescr: "Click the button to confirm the wallet unbinding.",
                profileDisconnectModalButton: "Disconnect",

                profileAllGifts: "All gifts",

                profileActions: "Actions",
                profileOpenLink: "Show info",

                profileMint: "Mint",
                profileTransfer: "Move",
                profileShare: "Share",
                profileLink: "Link",
                profileProfile: "Profile",
                profileSell: "Sell",
                profileCopiedLink: "Link copied to clipboard",
                profileTransfersAll: "Transfer all to \"Received\"",
                profileConfirmTransfer: {
                    title: "Confirmation",
                    descr: 'Transfer gift to "Received"?',
                    button: "Yes",
                    buttonCancel: "Cancel",
                    success: '{{count}} NFT transferred to "Received"!',
                    error: 'Error transferring to "Received"',
                },
                profileConfirmTransfers: {
                    title: "Confirmation",
                    descr: 'Transfer gifts to "Received"?',
                    button: "Yes",
                    buttonCancel: "Cancel",
                    success: '{{count}} NFT transferred to "Received"!',
                    error: 'Error transferring to "Received"',
                },
                profileFilters: {
                    model: "Model",
                    sort: "Sort",
                    symbol: "Symbol",
                    backdrop: "Backdrop",
                    gifts: "gifts",
                },
                profileModelModal: {
                    title: "Gift Model",
                    cancel: "Cancel",
                    apply: "Apply",
                },
                profileFilterModal: {
                    title: "Sort",
                    items: {
                        latest: "Latest",
                        oldest: "Oldest",
                        price_high: "Price: High to Low",
                        price_low: "Price: Low to High",
                        upgraded: "Upgraded",
                        not_upgraded: "Not Upgraded",
                    },
                    cancel: "Cancel",
                    apply: "Apply",
                },
                clearAll: "Clear all",
                market: "Market",
                sellFor: "Sell for",
                removeListing: "Remove Listing",
            },
            receive: {
                purchasedText: "Gift purchased",
                sendedText: "Gift Sent",
                receivedText: "Gift received",
                notfoundText: "Gift not found",
                selfedText: "It's forbidden",

                purchasedDescr: "Hurry up and give it to your friend!",
                sendedDescr: "Hurry up and give it to your friend!",
                receivedDescr: "Gift has arrived to your profile",
                notfoundDescr: "You can purchase a gift at the store",
                selfedDescr: "You can't activate your gift!",

                openProfile: "Open Profile",
                openShop: "Open Store",
                chooseRecipient: "Choose a recipient",
                okButton: "Ok",
            },
            receiveMulticheck: {
                sendedText: "Multicheck Sent",
                receivedText: "Gift received",
                notfoundText: "Multicheck is out",
                selfedText: "It's forbidden",

                sendedDescr: "",
                receivedDescr: "Gift has arrived to your profile",
                notfoundDescr: "You can purchase a gifts at the store to create a multicheck",
                selfedDescr: "You've already received a gift",

                openProfile: "Open Profile",
                openShop: "Open Store",
                chooseRecipient: "Choose a recipient",
                okButton: "Ok",
            },
            view: {
                viewGiftsCount: "gifts",
                viewGiftsTitle: "Gifts",
            },
            tickets: {
                title: "Tasks",
                description: "Earn Meme-tickets by your activity",
                descriptionSpan: "Learn more",

                recentsTitle: "Recent actions",
                recentsNull: "No history",
                recentsAction1: "sent gift",
                recentsAction2: "received gift",
                recentsAction3: "purchased gift",

                taskNoName: "No name",
                taskName1: "Create Story",
                taskName2: "Set Emoji",

                partnersTitle: "Tasks",
                partnersSpan: "Become a partner",

                othersTitle: "Special",

                taskButtonStart: "Start",
                taskButtonClaim: "Claim",
                taskButtonDone: "Done!",

                storyTaskDescription: "🎁 Get your airdrop for memefied gifts",

                stickerGift: "{{count}} gift",
            },
            multicheck: {
                title: "Multicheck",

                selectAll: "Select all",
                buyMoreGifts: "Buy more gifts",
                createMulticheck: "Create",
                chooseNumberGifts: "Choose the number of gifts",
                atLeastGifts: "At least 2 gifts must be selected",
                notfoundText: "No gifts found",
            },
            privateDeal: {
                title: "Private Deal",
                description: "Only gifts from the purchased category can be used to create a transaction",

                label1: "Price",
                label2: "Select gifts",

                selectAll: "Select all",
                unselectAll: "Unselect all",

                create: "Send",
                createGift: "gift for",
                chooseNumberGifts: "Choose the number of gifts",
                notfoundText: "No gifts found",
            },
            deposit: {
                title: "Deposit",
                description: "Deposit your TON to your wallet",

                available: "Available:",
                label1: "Amount to deposit",

                buttonDeposit: "Deposit",
            },
            referral: {
                title: "Gifts for invites!",
                description: "Invite your friends to Telegram, or promote the link via",
                descriptionSpan: "Gift distribution",
                descriptionSpanSoon: "Soon",
                share: "Share",
                referrals: "Referrals",
                view: "View",
                noReferrals: {
                    title: "No referrals",
                    descr: "You have no referrals yet",
                    button: "Share link",
                }
            },
            market: {
                developmentTitle: "In development",
                developmentDescription: "The page is currently under construction.",

                tabs: {
                    gifts: "Gifts",
                    listings: "Listings",
                },

                modal: {
                    removeBasket: "Remove",
                    addBasket: "Add to Basket",
                },

                buy: "Buy",

                symbolModalTitle: "Symbol",
                backdropModalTitle: "Backdrop",

                notifyBuyed: "Gifts successfully purchased and added to Profile",
                notifyBuyedButton: "Go to Profile",

                basket: {
                    title: "Basket",
                    gifts: "gifts",
                    selectAll: "Select all",
                    buyFor: "Buy for",
                    clearAll: "Clear all",
                    insufficientBalance: "Insufficient balance",
                    confirm: {
                        title: "Confirm to Buy Gifts",
                        sucessfulyBought: "Succesfuly Bought!",
                        sucessfulyBoughtDescription: "Gifts have arrived to your profile",
                        summary: "Summary",
                        buttons: {
                            cancel: "Close",
                            buy: "Buy",
                        }
                    }
                }
            },
            wallet: {
                back: "Back",
                walletNotConnected: "Wallet not connected",
                connect: "Connect",
                deposit: "Deposit",
                depositModal: {
                    title: "Deposit balance",
                    orderSuccess: "Deposit order created!",
                    orderFailed: "Deposit order failed!",
                },
                withdraw: "Withdraw",
                withdrawModal: {
                    title: "Withdraw balance",
                    info: "Withdrawal to the wallet with TAG/MEMO is not supported!",
                    orderSuccess: "Withdraw order created!",
                    orderFailed: "Withdraw order failed!",
                },
            }
        }
    },
    ru: {
        translation: {
            app: {
                rarity_1: "Редкий",
                rarity_2: "Оч. редк.",
                rarity_3: "Эпич.",
                rarity_4: "Легенд.",
                rarity_5: "Продано",
                rarity_6: "Авторский",

                price_free: "Бесплатно",

                supplySubmission: "из",
                giftsSubmission: "подарков",
                giftSubmission: "подарок",

                sendGift: "Отправить",
                sendGiftText: "подарок",

                newMark: "Новое",
                soon: "Скоро",
            },
            menu: {
                home: "Главная",
                rating: "Рейтинг",
                profile: "Профиль",
                market: "Маркет",
                tickets: "Тикеты",
                tasks: "Задания",
                soon: "Скоро",
            },
            home: {
                title: "Memgift",

                slider_0: "Memgift x Pepel Nahudi",
                slider_1: "Лучший подарок",
                slider_2: "Партнерская программа",
                slider_3: "Дорожная карта",
                slider_4: "Мем-тикеты",

                slider_button_0: "Перейти",
                slider_button: "Подробнее",

                create_own_gift_title: "Создать свой подарок",
                create_own_gift_mark: "Скоро",

                hideGifts: "Скрыть проданные подарки",

                gift_store_title: "Магазин подарков",
                gift_store_null: "Подарки не найдены",
                gift_store_null_button: "Обновить",

                category_1: "Все подарки",
                category_2: "Новые подарки",
                category_3: "Редкие",
                category_4: "Очень редкие",
                category_5: "Эпические",
                category_6: "Легендарные",
                category_7: "Продано",
                category_8: "Авторские",

                sortby_1: "Новые",
                sortby_2: "Старые",
                sortby_3: "По редкости",
                sortby_4: "По цене (от большего к меньшему)",
                sortby_5: "По цене (от меньшего к большему)",
                sortby_6: "По наличию (от большего к меньшему)",
                sortby_7: "По наличию (от меньшего к большему)",

                giftNew: "Новый",

                buyed: "купил",
                sended: "отправил",

                nullGiftsTitle: "Нет подарков",
                nullGiftsDescr: "Установите редкость подарка или сбросите",
                nullGiftsButton: "Сбросить",
            },
            collection: {
                giftCollectable: "Коллекционный",

                description: "Купи подарок, чтобы подарить его другу или контакту",

                recentsTitle: "Недавние действия",
                recentsNull: "Нет истории",
                recentsAction1: "отправил подарок",
                recentsAction2: "получил подарок",
                recentsAction3: "купил подарок",

                buttonBuy1: "Купить",
                buttonBuy2: "за",
                buttonBuyStars: "Купить звезды",

                saleNotSupport: "Тикеты не поддерживаются",

                terms: {
                    termsTitle: "Условия получения",
                    inviteFriends: "Пригласить 5 друзей",
                    inviteFriendsDesc: "Отправить сообщения",
                    shareChats: "Поделиться в 3 чата",
                    shareChatsDesc: "Отправить сообщения в чаты",
                    subscribedChannel: "Подписка",
                    subscribedChannelDesc: "Подписаться на канал",
                },
                buttonConditions: "Выполните условия",
                buttonGetFree: "Получить подарок",
                buttonGoToStore: "Перейти в магазин",
                buttonMaxAmount: "Макс. кол-во",
            },
            rating: {
                title: "Рейтинг",
                description: "Получай подарки и увеличивай свой рейтинг!",
                section1: "Холдеры",
                section2: "Рефералы",
                gifts: "подарок",
                referrals: "реферал",
            },
            profile: {
                profileGiftsCount: "подар(ков)", // 1 подарков

                profileGiftsTitle: "Мои подарки",
                profileGiftsViewTitle: "Подарки",

                profileGiftsCategory1: "Получено",
                profileGiftsCategory2: "Куплено",

                profileGiftSended: "Отправлено",

                profileGiftsNull: "Нет подарков(",
                profileGiftsNullButtonAsking: "Подарки можно покупать в магазине",
                profileGiftsNullButtonBuy: "Купить подарок",
                profileGiftsGiftSended: "Отправлено",
                profileGiftsGiftSupply: "из", // 130 из 1000
                profileGiftsGiftSend: "Отправить",

                profileGiftPreviewTableItem1: "Владелец",
                profileGiftPreviewTableItem0: "Прошлый владелец",
                profileGiftPreviewTableItem1Set: "Установить статус",
                profileGiftPreviewTableItem2: "Дата",
                profileGiftPreviewTableItem3: "Стоимость",
                profileGiftPreviewTableItem4: "Наличие",
                profileGiftPreviewTableItem4Supply: "из", // 130 из 1000

                profileGiftPreviewTableMintedItem1: "Модель",
                profileGiftPreviewTableMintedItem2: "Символ",
                profileGiftPreviewTableMintedItem3: "Фон",

                profileGiftPreviewButtonCollectable: "Улучшить подарок",
                profileGiftPreviewButtonCollectableMark1: "Скоро",
                profileGiftPreviewButtonTransfer: "Отправить в полученные",
                profileGiftPreviewButtonSend: "Отправить",
                profileGiftPreviewButtonSendFor: "Отправить за",
                profileGiftPreviewButtonOk: "Ок",

                profileGiftButtonOk: "Закрыть",

                profileTransferLabel: "Поиск по",

                profileTransferSections: {
                    name: "Имя",
                    username: "Юзернейм",
                    telegram_id: "Tg ID",
                },
                profileTransferInputPlaceholder: "Введите",
                profileGiftModalTransferError: "Вы не можете отправить самому себе.",

                profileReferralProgram: "Реферальная программа",
                profileCreatePrivateDeal: "Приватная сделка",
                profileCreateMulticheck: "Мультичек",

                profileConnect: "Подключить кошелек",
                profileDisconnectModalTitle: "Отвязка кошелека",
                profileDisconnectModalDescr: "Нажмите на кнопку, чтобы подтвердить отвязку кошелька.",
                profileDisconnectModalButton: "Отвязать",

                profileAllGifts: "Все подарки",

                profileActions: "Действия",
                profileOpenLink: "Показать",

                notifyBuyed: "Подарок(ки) успешно приобретен и добавлен в Профиль",
                notifyBuyedButton: "В профиль",

                profileMint: "Улучшить",
                profileTransfer: "Перенести",
                profileShare: "Поделиться",
                profileLink: "Ссылка",
                profileProfile: "Профиль",
                profileSell: "Продать",
                profileCopiedLink: "Ссылка скопирована в буфер обмена",
                profileTransfersAll: "Перевести все в \"Получено\"",
                profileConfirmTransfer: {
                    title: "Подтверждение",
                    descr: 'Перевести подарок в "Получено"?',
                    button: "Да",
                    buttonCancel: "Отмена",
                    success: '{{count}} NFT переведено в "Получено"!',
                    error: 'Ошибка при переводе в "Получено"',
                },
                profileConfirmTransfers: {
                    title: "Подтверждение",
                    descr: 'Перевести подарки в "Получено"?',
                    button: "Да",
                    buttonCancel: "Отмена",
                    success: '{{count}} NFT переведено в "Получено"!',
                    error: 'Ошибка при переводе в "Получено"',
                },
                profileFilters: {
                    model: "Модель",
                    sort: "Фильтр",
                    symbol: "Символ",
                    backdrop: "Фон",
                    gifts: "подарок",
                },
                profileModelModal: {
                    title: "Модель подарка",
                    cancel: "Отмена",
                    apply: "Применить",
                },
                profileFilterModal: {
                    title: "Сортировка",
                    items: {
                        latest: "Последние",
                        oldest: "Старые",
                        price_high: "Цена: Высокая к Низкой",
                        price_low: "Цена: Низкая к Высокой",
                        upgraded: "Улучшенные",
                        not_upgraded: "Не улучшенные",
                    },
                    cancel: "Отмена",
                    apply: "Применить",
                },
                clearAll: "Очистить",
                market: "Маркет",
                sellFor: "Выставлено за",
                removeListing: "Снять с продажи",
            },
            receive: {
                purchasedText: "Подарок куплен",
                sendedText: "Подарок отправлен",
                receivedText: "Подарок получен",
                notfoundText: "Подарок не найден",
                selfedText: "Запрещено",

                purchasedDescr: "Отправьте свой подарок!",
                sendedDescr: "Отправьте свой подарок!",
                receivedDescr: " отправлен в ваш профиль",
                notfoundDescr: "Вы можете купить подарок в магазине",
                selfedDescr: "Вы не можете активировать подарок!",

                openProfile: "Открыть профиль",
                openShop: "Открыть магазин",
                chooseRecipient: "Выбрать получателя",
                okButton: "Ок",
            },
            receiveMulticheck: {
                sendedText: "Мультичек отправлен",
                receivedText: "Подарок получен",
                notfoundText: "Мультичек закончился",
                selfedText: "Запрещено",

                sendedDescr: "",
                receivedDescr: "отправлен в ваш профиль",
                notfoundDescr: "Вы можете приобрести в магазине подарки для создания мультичека",
                selfedDescr: "Вы пытаетесь получить свой подарок, либо вы уже получали подарок",

                openProfile: "Открыть профиль",
                openShop: "Открыть магазин",
                chooseRecipient: "Выбрать получателя",
                okButton: "Ок",
            },
            view: {
                viewGiftsCount: "подар(ков)",
                viewGiftsTitle: "Подарки",
            },
            tickets: {
                title: "Задачи",
                description: "Зарабатывайте мем-тикеты за вашу активность",
                descriptionSpan: "Узнать больше",

                recentsTitle: "Недавние действия",
                recentsNull: "Нет истории",
                recentsAction1: "отправил подарок",
                recentsAction2: "получил подарок",
                recentsAction3: "купил подарок",

                taskNoName: "Без названия",
                taskName1: "Создать историю",
                taskName2: "Установить эмодзи",

                partnersTitle: "Задания",
                partnersSpan: "Стать партнером",

                othersTitle: "Специальные",

                taskButtonStart: "Начать",
                taskButtonClaim: "Забрать",
                taskButtonDone: "Готово!",

                storyTaskDescription: "🎁 Получите ваш аирдроп за подарки",

                stickerGift: "{{count}} подарок",
            },
            multicheck: {
                title: "Мультичек",

                selectAll: "Выбрать все",
                buyMoreGifts: "Купить больше подарков",
                createMulticheck: "Создать",
                chooseNumberGifts: "Выберите количество подарков",
                atLeastGifts: "Необходимо выбрать не менее 2 подарков",
                notfoundText: "Подарки не найдены",
            },
            privateDeal: {
                title: "Приватная сделка",
                description: "Для создания транзакции можно использовать только подарки из категории купленных",

                label1: "Сумма сделки",
                label2: "Выбрать подарки",

                selectAll: "Выбрать все",
                unselectAll: "Убрать все",

                create: "Отправить",
                createGift: "подарок за",
                chooseNumberGifts: "Выберите количество подарков",
                notfoundText: "Подарки не найдены",
            },
            deposit: {
                title: "Пополнение",
                description: "Пополните TON в свой кошелек",

                available: "Доступно:",
                label1: "Сумма для пополнения",

                buttonDeposit: "Пополнить",
            },
            referral: {
                title: "Подарки за инвайты!",
                description: "Приглашайте друзей в Telegram или рекламируйте ссылку через",
                descriptionSpan: "Выдача подарков",
                descriptionSpanSoon: "Скоро",
                share: "Поделиться",
                referrals: "Рефералы",
                view: "Посмотреть",
                noReferrals: {
                    title: "Нет рефералов",
                    descr: "У вас ещё нет рефералов",
                    button: "Пригласить",
                }
            },
            market: {
                developmentTitle: "В разработке",
                developmentDescription: "Страница находится на стадии разработки",

                tabs: {
                    gifts: "Подарки",
                    listings: "Активность",
                },

                modal: {
                    removeBasket: "Убрать",
                    addBasket: "Добав. в корз.",
                },

                buy: "Купить",

                symbolModalTitle: "Символ",
                backdropModalTitle: "Фон",

                basket: {
                    title: "Корзина",
                    gifts: "подарка(ов)",
                    selectAll: "Выбрать все",
                    buyFor: "Купить за",
                    clearAll: "Очистить все",
                    insufficientBalance: "Недостаточно средств",
                    confirm: {
                        title: "Подтверждение покупки",
                        sucessfulyBought: "Успешно куплено!",
                        sucessfulyBoughtDescription: "Подарки успешно приобретены и добавлены в профиль",
                        summary: "Итого",
                        buttons: {
                            cancel: "Закрыть",
                            buy: "Купить",
                        }
                    }
                }
            },
            wallet: {
                back: "Назад",
                walletNotConnected: "Кошелек не подключен",
                connect: "Подключить",
                deposit: "Внести",
                depositModal: {
                    title: "Внести баланс",
                    orderSuccess: "Баланс внесен!",
                    orderFailed: "Ошибка внесения баланса!",
                },
                withdraw: "Вывести",
                withdrawModal: {
                    title: "Вывести баланс",
                    info: "Вывод на кошелек с TAG/MEMO не поддерживается!",
                    orderSuccess: "Заявка на вывод создана!",
                    orderFailed: "Ошибка вывода!",
                },
            }
        }
    },
  },
});

export default i18next;