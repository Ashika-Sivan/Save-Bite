import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from './cartSlice'

export const store=configureStore({//global store
    reducer:{
        auth:authReducer,
        cart:cartReducer
    }
})

export type RootState=ReturnType<typeof store.getState>//crerate a type for entire redux store.
export type AppDispatch=typeof store.dispatch//which give oroper typescript support
//actually working here