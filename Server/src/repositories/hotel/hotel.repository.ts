import { IHotelCreateData } from "../../dtos/hotel.dto";
import { IHotel } from "../../interfaces/models/IHotel.model";
import { IHotelRepository } from "../../interfaces/repository/IHotelRepository";
import { Hotel } from "../../models/vendor/hotel.model";
import { BaseRepository } from "../base.repository";

export class HotelRepository extends BaseRepository<IHotel> implements IHotelRepository{
    constructor(){
        super(Hotel);
    }

    async createHotel(data: IHotelCreateData): Promise<IHotel> {
            return await Hotel.create(data);
    }

    async findByVendorId(vendorId: string): Promise<IHotel[]> {
        return await Hotel.find({vendorId}).sort({
            createdAt:-1,
        });
    }
   async findByIdAndVendorId(hotelId: string, vendorId: string): Promise<IHotel | null> {
       return await Hotel.findOne({
        _id:hotelId,
        vendorId,
       })
   }
}