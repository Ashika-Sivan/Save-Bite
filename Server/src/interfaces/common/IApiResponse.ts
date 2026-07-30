export interface IApiResponse<T>{
    success:boolean;
    message:string;
    data?:T;//type of data can change
}