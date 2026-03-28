import { Icon } from "../Icon.ts"

export const MenuJson = {
    Home: {
        Key: 'home',
        Icon: Icon.Gift,
        Route: '/',
        Disable: false,
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
        Route: '/m',
        Disable: false
    },
    Profile: {
        Key: 'profile',
        Icon: Icon.User,
        Route: '/profile',
        Disable: false
    }
}