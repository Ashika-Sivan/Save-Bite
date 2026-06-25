import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export const store=configureStore({//global store
    reducer:{
        auth:authReducer
    }
})

export type RootState=ReturnType<typeof store.getState>//crerate a type for entire redux store.
export type AppDispatch=typeof store.dispatch//which give oroper typescript support
//actually working here