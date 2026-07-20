import { IUser } from "../models/user/user.model";

export const toUserResponseDTO=(user:IUser)=>{
    return {
        _id:user._id,
        name:user.name,
        email:user.email,
        phone:user.phone,
        role:user.role,
        isAuthenticated:user.isAuthenticated
    }

}