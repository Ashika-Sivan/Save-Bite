import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer, { CART_STORAGE_KEY } from './cartSlice'
import notificationReducer, { NOTIFICATION_STORAGE_KEY } from './notificationSlice';

export const store = configureStore({//global store
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        notification: notificationReducer
    }
})

let previousCartState = store.getState().cart
let previousNotificationState = store.getState().notification

store.subscribe(() => {
    const state = store.getState()
    const currentCartState = state.cart
    const currentNotificationState = state.notification

    if (currentCartState !== previousCartState) {
        previousCartState = currentCartState
        try {
            if (currentCartState.items.length === 0) {
                localStorage.removeItem(CART_STORAGE_KEY)
            } else {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(currentCartState))
            }
        } catch (error) {
            console.error("Failed to update cart storage:", error);
        }
    }

    if (currentNotificationState !== previousNotificationState) {
        previousNotificationState = currentNotificationState
        try {
            localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(currentNotificationState))
        } catch (error) {
            console.error("Failed to update notification storage:", error);
        }
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch