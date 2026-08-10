import { Types } from "mongoose";
import { IDailyMenu } from "../../interfaces/models/IDailyMenu.model";
import { IDailyMenuCreateData, IDailyMenuItemCreateData, IDailyMenuRepository, IPickupWindowUpdateData } from "../../interfaces/repository/IDailyMenuRepository";
import { DailyMenu } from "../../models/menu/DailyMenu.model";
import { BaseRepository } from "../base.repository";
import { IDailyMenuItemUpdateData } from "../../dtos/dailyMenu.dto";
/*
run validator=means mongoose to check the schema rule befor update docu
*/

export class DailyMenuRepository extends BaseRepository<IDailyMenu>implements IDailyMenuRepository{
    constructor(){
        super(DailyMenu)
    }

    async createMenu(data: IDailyMenuCreateData): Promise<IDailyMenu> {
        return await this.create(data);
    }
    async addItem(menuId: string,vendorId:Types.ObjectId, data: IDailyMenuItemCreateData): Promise<IDailyMenu | null> {
        return DailyMenu.findOneAndUpdate({_id:new Types.ObjectId(menuId),vendorId},{
                $push:{
                    items:data
                },
        },
        {
            new:true,
            runValidators: true,
        }
    )
    }
    async findByIdAndVendorId(menuId: string, vendorId: Types.ObjectId): Promise<IDailyMenu | null> {
       return DailyMenu.findOne({
        _id:menuId,
        vendorId
       })
    }
    async updateLiveStatus(menuId: string, vendorId: Types.ObjectId, isLive: boolean): Promise<IDailyMenu | null> {
        return DailyMenu.findOneAndUpdate(
            {
                _id:new Types.ObjectId(menuId),
                vendorId:vendorId
            },
            {
                $set:{isLive:isLive},
            },
            {
                new:true,
                runValidators:true
            }
        )
    }
    async findTodayMenuByHotel(hotelId: string, vendorId: Types.ObjectId, startOfDay: Date, endOfDay: Date): Promise<IDailyMenu | null> {
        return DailyMenu.findOne({
            hotelId:hotelId,
            vendorId:vendorId,
            menuDate:{
                $gte:startOfDay,
                $lt:endOfDay
            }
        })
    }
    async updatePickupWindow(menuId: string, vendorId: Types.ObjectId, pickupWindow: IPickupWindowUpdateData
        
    ): Promise<IDailyMenu | null> {
        return DailyMenu.findOneAndUpdate({_id:new Types.ObjectId(menuId),vendorId:vendorId
            ,isLive:false
        },
        {
            $set:{
                pickupWindow:pickupWindow
            },
        },
        {
            new:true,
            runValidators:true
        }

    )
    }
    async updateItem(menuId: string, itemId: string, vendorId: Types.ObjectId, data: IDailyMenuItemUpdateData): Promise<IDailyMenu | null> {
        const updateFields:Record<string,unknown>={};
        Object.entries(data).forEach(([key,value])=>{
            if(value!==undefined){
                updateFields[`items.$.${key}`]=value
            }
        });

        return await DailyMenu.findOneAndUpdate({_id:menuId,vendorId,"items._id":itemId},{$set:updateFields,},{new:true,runValidators:true})
    }

    async findLatestMenuBeforeDate(hotelId: Types.ObjectId, vendorId: Types.ObjectId, beforeDate: Date): Promise<IDailyMenu | null> {
        return await DailyMenu.findOne({hotelId,vendorId,menuDate:{$lt:beforeDate},"items.0":{
            $exists:true,
        },
    }).sort({menuDate:-1,createdAt:-1})
    }
    async setItemIfEmpty(menuId:string,vendorId:Types.ObjectId,items:IDailyMenuItemCreateData[]):Promise<IDailyMenu|null>{
        return await DailyMenu.findOneAndUpdate(
            {
                _id:new Types.ObjectId(menuId),
                vendorId,
                isLive:false,
                items:{
                    $size:0
                },
            },
            {
                $set:{
                    items,
                },
            },
            {
                new:true,
                runValidators:true
            }
        )
    }

}
