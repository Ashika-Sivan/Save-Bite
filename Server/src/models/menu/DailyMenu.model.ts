import mongoose, { Schema } from "mongoose";
import { IDailyMenu, IDailyMenuItem, MenuUnitType } from "../../interfaces/models/IDailyMenu.model";
/*
for each menu item,
*/

const dailyMenuItemSchema = new Schema<IDailyMenuItem>(
    {
        itemName: {
            type: String,
            required: true,
            trim: true,
        },

        unitType: {
            type: String,
            enum: Object.values(MenuUnitType),
            required: true,
        },

        originalPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        discountedPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        stockQuantity: {
            type: Number,
            required: true,
            min: 0,
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        _id: true,
    }
);
/*
for the menu in the hotel
*/

const dailyMenuSchema=new Schema<IDailyMenu>(
    {
        vendorId:{
            type:Schema.Types.ObjectId,
            ref:"vendor",
            required:true,
            index:true
        },
        hotelId:{
            type:Schema.Types.ObjectId,
            ref:'hotel',
            required:true,
            index:true
        },
        menuDate:{
            type:Date,
            required:true,
        },
        pickupWindow:{
            startTime:{
                type:Date,
                required:true
            },endTime:{
                type:Date,
                required:true
            }
        },

        items:{
            type:[dailyMenuItemSchema],
            default:[]
        },
        isLive:{
            type:Boolean,
            default:false
        },
    },
    {
        timestamps:true
    }
)
/*
ahotel can only one daily menu document for a particulr date
*/
dailyMenuItemSchema.index(
    {
        hotelId:1,
        menuDate:1
    },
    {
        unique:true
    }
)
export const DailyMenu=mongoose.model<IDailyMenu>("DailyMenu",dailyMenuSchema)