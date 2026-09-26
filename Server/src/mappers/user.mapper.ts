import { IUserResponseDTO } from "../dtos/auth.dto";
import { IAdminUserListDTO } from "../dtos/user.dto";
import { IUser } from "../models/user/user.model";

export const toUserResponseDTO = (
  user: IUser
): IUserResponseDTO => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email || "",
    phone: user.phone,
    role: user.role,
    isAuthenticated: user.isAuthenticated,
    ...(user.hotelId ? { hotelId: user.hotelId.toString() } : {}),
    ...(user.permissions ? { permissions: user.permissions } : {}),
  };
};

export const toAdminUserListDTO = (
  user: IUser
): IAdminUserListDTO => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email || "",
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};