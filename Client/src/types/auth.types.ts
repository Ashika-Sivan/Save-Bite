export interface signupData{
    name:string;
    email:string;
    password:string;
    phone?:string
    role:"user"|"vendor"|"admin"
}