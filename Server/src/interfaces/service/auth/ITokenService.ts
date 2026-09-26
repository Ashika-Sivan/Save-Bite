export interface TokenPayload{
    userId:string,
    email?:string, // Optional for sub_vendors who login via username
    username?:string, // For sub_vendors
    role:"user"|"vendor"|"admin"|"sub_vendor",
    vendorId?:string, // Only for sub_vendors
    hotelId?:string, // Only for sub_vendors
    permissions?:string[] // Only for sub_vendors
}
// here the payload means the informatio that are stored in the jwt
export interface ITokenService{
    generateAccessToken(payload:TokenPayload):string
    verifyAccessToken(token:string):TokenPayload
    generateRefreshToken(payload:TokenPayload):string
    verifyRefreshToken(token:string):TokenPayload
}