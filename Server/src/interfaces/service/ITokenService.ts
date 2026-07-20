export interface TokenPayload{
    userId:string,
    email:string,
    role:"user"|"vendor"|"admin"
}
// here the payload means the informatio that are stored in the jwt
export interface ITokenService{
    generateAccessToken(payload:TokenPayload):string
    verifyAccessToken(token:string):TokenPayload
    generateRefreshToken(payload:TokenPayload):string
    verifyRefreshToken(token:string):TokenPayload
}