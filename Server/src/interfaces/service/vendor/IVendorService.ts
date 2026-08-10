import { ICreateVendorDTO, IVendorStatusResponseDTO } from "../../../dtos/vendor.dto";
import { IVendor } from "../../models/IVendor.model";

export interface IVendorService {
    registerVendor(
        ownerId: string,
        data: ICreateVendorDTO,
        files: { [fieldName: string]: Express.Multer.File[] }
    ): Promise<IVendor>;

    getVendorStatus(ownerId: string): Promise<IVendorStatusResponseDTO>;

    reapplyVendor(
        ownerId: string,
        data: ICreateVendorDTO,
        files: { [fieldName: string]: Express.Multer.File[] }
    ): Promise<IVendor>;
}