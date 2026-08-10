import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


export interface CartItem{
    itemId:string;
    itemName:string;
    unitType:string;
    originalPrice:number;
    discountedPrice:number;
    availableStock:number;
    quantity:number
}

export interface AddToCartPayload extends CartItem{
    hotelId:string;
    menuId:string;
    hotelName:string;
    pickupWindow:{
        startTime:string;
        endTime:string;
    }
    
}
interface CartState{
    hotelId:string|null;
    menuId:string|null;
    hotelName:string|null;
    pickupWindow:{
        startTime:string;
        endTime:string
    }|null;
    items:CartItem[]

}
const initialState: CartState = {
    hotelId: null,
    menuId: null,
    hotelName: null,
    pickupWindow: null,
    items: [],
};


const resetCartState=(state:CartState):void=>{
    state.hotelId=null;
    state.menuId=null
    state.hotelName=null;
    state.pickupWindow=null;
    state.items=[]
}
const cartSlice=createSlice({
    name:'cart',
    initialState,
    reducers:{
        addToCart: (
            state,
            action: PayloadAction<AddToCartPayload>
        ) => {
            const newItem = action.payload;
            if(state.hotelId && state.hotelId!==newItem.hotelId){
                return ;
            }

            if(!state.hotelId){
                state.hotelId=newItem.hotelId;
                state.menuId=newItem.menuId;
                state.hotelName=newItem.hotelName;
                state.pickupWindow=newItem.pickupWindow
            }

            const existingItem=state.items.find((item)=>item.itemId==newItem.itemId)
            if(existingItem){
                existingItem.quantity=Math.min(existingItem.quantity+newItem.quantity,existingItem.availableStock);
                return 
            }

            state.items.push({
                itemId:newItem.itemId,
                itemName:newItem.itemName,
                unitType:newItem.unitType,
                originalPrice:newItem.originalPrice,
                discountedPrice:newItem.discountedPrice,
                availableStock:newItem.availableStock,
                quantity:newItem.quantity
            });
            
        },
        /*
        if the cutsomer tries to add the item from 1 restaurant ,so this will replace the existing item from 1 rest to another 
        */
        replaceCart:(state,action:PayloadAction<AddToCartPayload>)=>{//if a customer adding item from other cart
            const newItem=action.payload;
            state.hotelId=newItem.hotelId;
            state.menuId=newItem.menuId;
            state.hotelName=newItem.hotelName;
            state.pickupWindow=newItem.pickupWindow
            state.items=[
                {
                    itemId:newItem.itemId,
                    itemName:newItem.itemName,
                    unitType:newItem.unitType,
                    originalPrice:newItem.originalPrice,
                    discountedPrice:newItem.discountedPrice,
                    availableStock:newItem.availableStock,
                    quantity:newItem.quantity
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
            const item=state.items.find(
                (currentItem)=>currentItem.itemId===action.payload.itemId
            );
            if(!item){
                return 
            }

            if(action.payload.quantity>=1&& action.payload.quantity<=item.availableStock){
                item.quantity=action.payload.quantity
            }
        },

        removeFromCart:(state,action:PayloadAction<string>)=>{
            state.items=state.items.filter((item)=>item.itemId!==action.payload);
            if(state.items.length===0){
                resetCartState(state)
            }
            
        },
        clearCart:(state)=>{
                resetCartState(state)
        },   
    },

})


export const {addToCart,replaceCart,updateCartQuantity,removeFromCart,clearCart}=cartSlice.actions
export default cartSlice.reducer
