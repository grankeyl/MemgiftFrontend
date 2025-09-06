import { Icon } from "../Icon.ts"

export const MenuJson = {
    Home: {
        Key: 'home',
        Icon: Icon.Gift,
        Route: '/',
        Disable: false,
    },
    Rating: {
        Key: 'rating',
        Icon: Icon.Rating,
        Route: '/rating',
        Disable: false
    },
    Tickets: {
        Key: 'tasks',
        Icon: Icon.Ticket,
        Route: '/tickets',
        Disable: false
    },
    Market: {
        Key: 'market',
        Icon: Icon.Market,
        Route: '/market',
        Disable: false
    },
    Profile: {
        Key: 'profile',
        Icon: Icon.User,
        Route: '/profile',
        Disable: false
    }
}