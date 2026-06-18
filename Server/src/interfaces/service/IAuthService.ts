// which define the authentication service shoudl provide

import { IUser } from "../../models/user.model";

//what authentication service can do
export interface iAuthService{
    register(name:string,email:string,password:string,phone?:string):Promise<IUser>
}