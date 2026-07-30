import { IUserResponseDTO } from "../dtos/auth.dto";
import { IAdminUserListDTO } from "../dtos/user.dto";
import { IUser } from "../models/user/user.model";

export const toUserResponseDTO = (
  user: IUser
): IUserResponseDTO => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isAuthenticated: user.isAuthenticated,
  };
};

export const toAdminUserListDTO = (
  user: IUser
): IAdminUserListDTO => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};