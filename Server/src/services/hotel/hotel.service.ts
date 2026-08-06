import { Types } from "mongoose";
import { HOTEL_MESSAGES } from "../../constants/messages";
import { StatusCode } from "../../constants/statusCode";
import { ICreateHotelDTO, IHotelCreateData } from "../../dtos/hotel.dto";
import { AppError } from "../../errors/AppError";
import { IHotel } from "../../interfaces/models/IHotel.model";
import { IVendor, VendorStatus } from "../../interfaces/models/IVendor.model";
import { IHotelRepository } from "../../interfaces/repository/IHotelRepository";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { IHotelService } from "../../interfaces/service/hotel/IHotelService";
import { uploadToS3 } from "../../utils/uploadToS3";

export class HotelService implements IHotelService{
    constructor(private _hotelRepository:IHotelRepository,
                private _vendorRepository:IVendorRepository
    ){}

    private async getApprovedVendor(ownerId:string):Promise<IVendor>{
        const vendor=await this._vendorRepository.findByOwnerId(ownerId)
        if(!vendor){
            throw new AppError(HOTEL_MESSAGES.VENDOR_NOT_FOUND,StatusCode.NOT_FOUND)
        }

        if(vendor.status!==VendorStatus.APPROVED){
            throw new AppError(HOTEL_MESSAGES.VENDOR_NOT_APPROVED,StatusCode.FORBIDDEN)

        }
        return vendor
    }

    async createHotel(ownerId: string, data: ICreateHotelDTO, hotelImage: Express.Multer.File): Promise<IHotel> {
        const vendor=await this.getApprovedVendor(ownerId)
        this.validateHotelData(data)
        if(!hotelImage){
            throw new AppError(HOTEL_MESSAGES.IMAGE_REQUIRED,StatusCode.BAD_REQUEST)
        }
        const imageUpload=await uploadToS3(hotelImage,'hotel-image')
        const hotelData:IHotelCreateData={
            vendorId:vendor._id,
            hotelName:data.hotelName.trim(),
            businessType:data.businessType.trim(),
            place:data.place.trim(),
            address:data.address.trim(),
            hotelImageKey:imageUpload.key,
            location:{
                type:"Point",
                coordinates:[
                    data.longitude,
                    data.latitude
                ],
            },

        };
        return await this._hotelRepository.createHotel(hotelData);
    }    

    async getVendorHotels(ownerId: string): Promise<IHotel[]> {
        const vendor=await this.getApprovedVendor(ownerId)
        return await this._hotelRepository.findByVendorId(vendor._id.toString())
    }
    async getHotelById(ownerId: string, hotelId: string): Promise<IHotel> {
       const vendor=await this.getApprovedVendor(ownerId);
       if(!Types.ObjectId.isValid(hotelId)){
        throw new AppError(HOTEL_MESSAGES.NOT_FOUND,StatusCode.NOT_FOUND)
       }

       const hotel=await this._hotelRepository.findByIdAndVendorId(hotelId,vendor._id.toString())

       if(!hotel){
        throw new AppError(HOTEL_MESSAGES.NOT_FOUND,StatusCode.NOT_FOUND)
       }
       return hotel
    }
      private validateHotelData(data: ICreateHotelDTO): void {
        if (
            !data.hotelName?.trim() ||
            !data.businessType?.trim() ||
            !data.place?.trim() ||
            !data.address?.trim()
        ) {
            throw new AppError(
                HOTEL_MESSAGES.INVALID_DATA,
                StatusCode.BAD_REQUEST
            );
        }

        if (
            !Number.isFinite(data.latitude) ||
            !Number.isFinite(data.longitude) ||
            data.latitude < -90 ||
            data.latitude > 90 ||
            data.longitude < -180 ||
            data.longitude > 180
        ) {
            throw new AppError(
                HOTEL_MESSAGES.INVALID_LOCATION,
                StatusCode.BAD_REQUEST
            );
        }
    }
    



}