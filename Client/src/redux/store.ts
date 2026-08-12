import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer, { CART_STORAGE_KEY } from './cartSlice'

export const store=configureStore({//global store
    reducer:{
        auth:authReducer,
        cart:cartReducer
    }
})

let previousCartState=store.getState().cart
store.subscribe(()=>{
    const currentCartState=store.getState().cart//run whenever a redux action changes the store.

    if(currentCartState===previousCartState){
        return 
    }
    previousCartState=currentCartState
    try {
        if(currentCartState.items.length===0){
            localStorage.removeItem(CART_STORAGE_KEY)
            return 
        }
        localStorage.setItem(CART_STORAGE_KEY,JSON.stringify(currentCartState))
        
    } catch (error) {
        console.error("Failed to update cart storage:", error);
    }
})

export type RootState=ReturnType<typeof store.getState>//crerate a type for entire redux store.
export type AppDispatch=typeof store.dispatch//which give oroper typescript support
//actually working here