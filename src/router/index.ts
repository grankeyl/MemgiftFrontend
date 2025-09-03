import { createRouter, createWebHistory } from 'vue-router'
import { usePostHog } from '../hooks/usePostHog'

import Home from '../pages/Home.vue'
import Collection from '../pages/Collection.vue'
import Activity from '../pages/Activity.vue'
import Profile from '../pages/Profile.vue'
import Deposit from '../pages/Deposit.vue'
import Receive from '../pages/Receive.vue'
import Rating from '../pages/Rating.vue'
import View from '../pages/View.vue'
import Gift from '../pages/Gift.vue'
import Market from '../pages/Market.vue'
import Dev from '../pages/Dev.vue'
import Tickets from '../pages/Tickets.vue'
import Multicheck from '../pages/Multicheck.vue'
import Deal from '../pages/Deal.vue'
import PrivateDeal from '../pages/PrivateDeal.vue'
import ActivateMulticheck from '../pages/Activate/Multicheck.vue'
import Referral from '../pages/Referral.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    },
    {
      path: '/deposit',
      name: 'deposit',
      component: Deposit
    },
    {
      path: '/view/:id',
      name: 'view',
      component: View
    },
    {
      path: '/gift/:id',
      name: 'gift',
      component: Gift
    },
    {
      path: '/collection/:nft',
      name: 'collection',
      component: Collection
    },
    {
      path: '/activity',
      name: 'activity',
      component: Activity
    },
    {
      path: '/receive/:nft/:nftType',
      name: 'receive',
      component: Receive
    },
    {
      path: '/activate-multicheck/:nft/:nftType',
      name: 'activate-multicheck',
      component: ActivateMulticheck
    },
    {
      path: '/rating',
      name: 'rating',
      component: Rating
    },
    {
      path: '/market',
      name: 'market',
      component: Dev
    },
    {
      path: '/market-dev',
      name: 'market-dev',
      component: Market
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: Tickets
    },
    {
      path: '/multicheck',
      name: 'multicheck',
      component: Multicheck
    },
    {
      path: '/deal',
      name: 'deal',
      component: Deal
    },
    {
      path: '/private-deal',
      name: 'private-deal',
      component: PrivateDeal
    },
    {
      path: '/referral',
      name: 'referral',
      component: Referral
    }
  ]
})

const { posthog } = usePostHog()
posthog.capture('$pageview')

export default router