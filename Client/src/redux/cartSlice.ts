import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
export interface CartItem {
    itemId: string;
    itemName: string;
    unitType: string;
    originalPrice: number;
    discountedPrice: number;
    availableStock: number;
    quantity: number;
    itemImageUrl?: string;
}

export interface AddToCartPayload extends CartItem {
    hotelId: string;
    menuId: string;
    hotelName: string;
    pickupWindow: {
        startTime: string;
        endTime: string;
    };
    itemImageUrl?: string;
    hotelImageKey?: string;
}
interface CartState {
    hotelId: string | null;
    menuId: string | null;
    hotelName: string | null;
    pickupWindow: {
        startTime: string;
        endTime: string
    } | null;
    hotelImageKey?: string;
    items: CartItem[]
}

export const CART_STORAGE_KEY =
    "savebite_cart"

const emptyCartState: CartState = {
    hotelId: null,
    menuId: null,
    hotelName: null,
    pickupWindow: null,
    items: [],
}

const loadCartState =
    (): CartState => {
        try {
            const savedCart =
                localStorage.getItem(
                    CART_STORAGE_KEY
                )

            if (!savedCart) {
                return emptyCartState
            }

            const parsedCart =
                JSON.parse(
                    savedCart
                ) as CartState

            if (
                !Array.isArray(
                    parsedCart.items
                )
            ) {
                return emptyCartState
            }

            return parsedCart
        } catch {
            return emptyCartState
        }
    }
const initialState: CartState = loadCartState()


const resetCartState = (state: CartState): void => {
    state.hotelId = null;
    state.menuId = null
    state.hotelName = null;
    state.pickupWindow = null;
    state.hotelImageKey = undefined;
    state.items = []
}
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (
            state,
            action: PayloadAction<AddToCartPayload>
        ) => {
            const newItem = action.payload;
            if (state.hotelId && state.hotelId !== newItem.hotelId) {
                return;
            }

            if (!state.hotelId) {
                state.hotelId = newItem.hotelId;
                state.menuId = newItem.menuId;
                state.hotelName = newItem.hotelName;
                state.pickupWindow = newItem.pickupWindow;
                state.hotelImageKey = newItem.hotelImageKey;
            }

            const existingItem = state.items.find((item) => item.itemId == newItem.itemId)
            if (existingItem) {
                existingItem.quantity = Math.min(existingItem.quantity + newItem.quantity, existingItem.availableStock);
                return
            }

            state.items.push({
                itemId: newItem.itemId,
                itemName: newItem.itemName,
                unitType: newItem.unitType,
                originalPrice: newItem.originalPrice,
                discountedPrice: newItem.discountedPrice,
                availableStock: newItem.availableStock,
                quantity: newItem.quantity,
                itemImageUrl: newItem.itemImageUrl
            });

        },
        /*
        if the cutsomer tries to add the item from 1 restaurant ,so this will replace the existing item from 1 rest to another 
        */
        replaceCart: (state, action: PayloadAction<AddToCartPayload>) => {//if a customer adding item from other cart
            const newItem = action.payload;
            if (newItem.availableStock <= 0 || newItem.quantity <= 0) {
                return
            }
            state.hotelId = newItem.hotelId;
            state.menuId = newItem.menuId;
            state.hotelName = newItem.hotelName;
            state.pickupWindow = newItem.pickupWindow;
            state.hotelImageKey = newItem.hotelImageKey;
            state.items = [
                {
                    itemId: newItem.itemId,
                    itemName: newItem.itemName,
                    unitType: newItem.unitType,
                    originalPrice: newItem.originalPrice,
                    discountedPrice: newItem.discountedPrice,
                    availableStock: newItem.availableStock,
                    quantity: Math.min(newItem.quantity, newItem.availableStock),
                    itemImageUrl: newItem.itemImageUrl
                },
            ];

        },
        updateCartQuantity: (
            state,
            action: PayloadAction<{
                itemId: string;
                quantity: number;
            }>
        ) => {
            const item = state.items.find(
                (currentItem) => currentItem.itemId === action.payload.itemId
            );
            if (!item) {
                return
            }

            if (action.payload.quantity >= 1 && action.payload.quantity <= item.availableStock) {
                item.quantity = action.payload.quantity
            }


        },

        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.itemId !== action.payload);
            if (state.items.length === 0) {
                resetCartState(state)
            }

        },
        clearCart: (state) => {
            resetCartState(state)
        },
        syncCart: (
            state,
            action: PayloadAction<{
                items: {
                    itemId: string;
                    itemName: string;
                    unitType: string;
                    originalPrice: number;
                    discountedPrice: number;
                    stockQuantity: number;
                    isAvailable: boolean;
                    itemImageUrl: string;
                }[];
            }>
        ) => {
            const liveItems = action.payload.items;
            const updatedItems = [];

            for (const cartItem of state.items) {
                const liveItem = liveItems.find(item => item.itemId === cartItem.itemId);
                
                if (liveItem && liveItem.isAvailable && liveItem.stockQuantity > 0) {
                    updatedItems.push({
                        ...cartItem,
                        itemName: liveItem.itemName,
                        originalPrice: liveItem.originalPrice,
                        discountedPrice: liveItem.discountedPrice,
                        availableStock: liveItem.stockQuantity,
                        itemImageUrl: liveItem.itemImageUrl,
                        unitType: liveItem.unitType,
                        quantity: Math.min(cartItem.quantity, liveItem.stockQuantity)
                    });
                }
            }

            if (updatedItems.length === 0 && state.items.length > 0) {
                resetCartState(state);
            } else {
                state.items = updatedItems;
            }
        },
    },

})


export const { addToCart, replaceCart, updateCartQuantity, removeFromCart, clearCart, syncCart } = cartSlice.actions
export default cartSlice.reducer
