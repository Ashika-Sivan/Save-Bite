import { ISubVendorService } from "../../interfaces/service/vendor/ISubVendorService";
import { IUserRepository } from "../../interfaces/repository/IUserRepository";
import { IHotelRepository } from "../../interfaces/repository/IHotelRepository";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { IPasswordHasher } from "../../interfaces/service/auth/IPasswordHasher";
import { ICreateSubVendorDTO, IUpdateSubVendorPermissionsDTO, IUpdateSubVendorPasswordDTO } from "../../dtos/subVendor.dto";
import { IUser } from "../../models/user/user.model";
import { AppError } from "../../errors/AppError";
import { StatusCode } from "../../constants/statusCode";

export class SubVendorService implements ISubVendorService {
    constructor(
        private _userRepository: IUserRepository,
        private _hotelRepository: IHotelRepository,
        private _vendorRepository: IVendorRepository,
        private _passwordHasher: IPasswordHasher
    ) {}

    async getSubVendor(vendorOwnerId: string, hotelId: string): Promise<IUser | null> {
        const vendor = await this._vendorRepository.findByOwnerId(vendorOwnerId);
        if (!vendor) throw new AppError("Vendor not found", StatusCode.NOT_FOUND);

        const hotel = await this._hotelRepository.findById(hotelId);
        if (!hotel) throw new AppError("Hotel not found", StatusCode.NOT_FOUND);
        
        if (hotel.vendorId.toString() !== vendor._id.toString()) {
            throw new AppError("Unauthorized to manage this hotel", StatusCode.FORBIDDEN);
        }

        const username = `${vendor.businessInfo.businessName.replace(/\s+/g, "").toLowerCase()}_${hotel.hotelName.replace(/\s+/g, "").toLowerCase()}`;
        return await this._userRepository.findByUsername(username);
    }

    async createCredentials(vendorOwnerId: string, hotelId: string, data: ICreateSubVendorDTO): Promise<IUser> {
        const vendor = await this._vendorRepository.findByOwnerId(vendorOwnerId);
        if (!vendor) throw new AppError("Vendor not found", StatusCode.NOT_FOUND);

        const hotel = await this._hotelRepository.findById(hotelId);
        if (!hotel) throw new AppError("Hotel not found", StatusCode.NOT_FOUND);
        
        if (hotel.vendorId.toString() !== vendor._id.toString()) {
            throw new AppError("Unauthorized to manage this hotel", StatusCode.FORBIDDEN);
        }

        const username = `${vendor.businessInfo.businessName.replace(/\s+/g, "").toLowerCase()}_${hotel.hotelName.replace(/\s+/g, "").toLowerCase()}`;
        
        const existingUser = await this._userRepository.findByUsername(username);
        if (existingUser) {
            throw new AppError("Credentials already exist for this hotel. Please reset password instead.", StatusCode.CONFILCT);
        }

        const hashedPassword = await this._passwordHasher.hash(data.password);

        const newUser = await this._userRepository.create({
            name: `${hotel.hotelName} Manager`,
            username,
            email: `${username}@subvendor.savebite.com`,
            password: hashedPassword,
            role: "sub_vendor",
            vendorId: vendor._id as any,
            hotelId: hotel._id as any,
            permissions: data.permissions || [],
            isBusinessOwner: false,
            isAuthenticated: true,
            isActive: true,
            isAdmin: false,
        });

        return newUser;
    }

    async updatePermissions(vendorOwnerId: string, hotelId: string, data: IUpdateSubVendorPermissionsDTO): Promise<IUser> {
        
        const vendor = await this._vendorRepository.findByOwnerId(vendorOwnerId);
        if (!vendor) throw new AppError("Vendor not found", StatusCode.NOT_FOUND);

        const hotel = await this._hotelRepository.findById(hotelId);
        if (!hotel) throw new AppError("Hotel not found", StatusCode.NOT_FOUND);
        
        if (hotel.vendorId.toString() !== vendor._id.toString()) {
            throw new AppError("Unauthorized to manage this hotel", StatusCode.FORBIDDEN);
        }

        const username = `${vendor.businessInfo.businessName.replace(/\s+/g, "").toLowerCase()}_${hotel.hotelName.replace(/\s+/g, "").toLowerCase()}`;
        const user = await this._userRepository.findByUsername(username);
        if (!user) {
            throw new AppError("Sub-Vendor credentials not found for this hotel", StatusCode.NOT_FOUND);
        }

        const updatedUser = await this._userRepository.updateById(user._id.toString(), { permissions: data.permissions });
        if (!updatedUser) throw new AppError("Failed to update permissions", StatusCode.INTERNAL_SERVER_ERROR);

        return updatedUser;
    }

    async updatePassword(vendorOwnerId: string, hotelId: string, data: IUpdateSubVendorPasswordDTO): Promise<IUser> {
        const vendor = await this._vendorRepository.findByOwnerId(vendorOwnerId);
        if (!vendor) throw new AppError("Vendor not found", StatusCode.NOT_FOUND);

        const hotel = await this._hotelRepository.findById(hotelId);
        if (!hotel) throw new AppError("Hotel not found", StatusCode.NOT_FOUND);
        
        if (hotel.vendorId.toString() !== vendor._id.toString()) {
            throw new AppError("Unauthorized to manage this hotel", StatusCode.FORBIDDEN);
        }

        const username = `${vendor.businessInfo.businessName.replace(/\s+/g, "").toLowerCase()}_${hotel.hotelName.replace(/\s+/g, "").toLowerCase()}`;
        const user = await this._userRepository.findByUsername(username);
        if (!user) {
            throw new AppError("Sub-Vendor credentials not found for this hotel", StatusCode.NOT_FOUND);
        }

        const hashedPassword = await this._passwordHasher.hash(data.password);
        const updatedUser = await this._userRepository.updateById(user._id.toString(), { password: hashedPassword });
        
        if (!updatedUser) throw new AppError("Failed to update password", StatusCode.INTERNAL_SERVER_ERROR);

        return updatedUser;
    }
}
