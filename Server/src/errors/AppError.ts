import { StatusCode } from "../constants/statusCode";

export class AppError extends Error{
    statusCode:number;

    constructor(message:string,statusCode:number=StatusCode.BAD_REQUEST){
        super(message);
        this.statusCode=statusCode
    }
}