import { createVendorDTO } from "../../dtos/vendor.dto";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { IVendorService } from "../../interfaces/service/IVendorService";
import { IVendor } from "../../models/vendor/vendor.model";

export class VendorService implements IVendorService{
    constructor(private vendorRepository:IVendorRepository){}

    async registerVendor(ownerId:string,data: createVendorDTO): Promise<IVendor> {
        const existingVendor=await this.vendorRepository.findByOwnerId(ownerId);
        if(existingVendor){
            throw new Error("Vendor application already exists");
        }

       return await this.vendorRepository.createVendor({ownerId,...data})
    }
}