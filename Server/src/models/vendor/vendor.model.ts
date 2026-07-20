import mongoose,{Schema} from "mongoose"
import { IVendor,VendorStatus} from "../../interfaces/models/IVendor.model";
// export interface IVendor extends Document{
//     ownerId:mongoose.Types.ObjectId;

//     businessInfo:{
//         businessName:string;
//         businessImageKey?:string;
//         businessType:string;
//         place:string;
//         address:string;

//         location:{
//             type:"Point";
//             coordinates:[number,number]
//         }
//     }

//     verification:{
//         gstNumber:string;
//         panNumber:string;
//         ifscCode:string;
//         bankAccountNumber:string;
//         fssaiNumber:string;
//     };
//     documents?:{
//         gstCertificateKey?:string;
//         fssaiCertificateKey?:string;
//         panCardKey?:string;
//         businessRegistrationCertificate?:string;
//     };
//     status:"pending"|"approved"|"rejected";
//     rejectionReason?:string
//     isLive:boolean
// }


const vendorSchema=new Schema<IVendor>(
    {
        ownerId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true,
            unique:true

        },

        businessInfo:{
            businessName:{
                type:String,
                required:true
            },
            businessImageKey:{
                type:String,
            },
            businessType:{
                type:String,
                required:true
            },
            place:{
                type:String,
                required:true,
            },
            address:{
                type:String,
                required:true
            },
            location:{
                type:{
                    type:String,
                    enum:["Point"],
                    default:"Point",
                },
                coordinates:{
                    type:[Number],
                    required:true
                },

            },
        },
        verification:{
            gstNumber:{
                type:String,
                required:true
            },
            panNumber:{
                type:String,
                required:true
            },
            ifscCode:{
                type:String,
                required:true
            },
            bankAccountNumber:{
                type:String,
                required:true
            },
            fssaiNumber:{
                type:String,
                required:true
            },

        },
        documents:{
            gstCertificateKey:{
                type:String,
                 required:true
            },
            fssaiCertificateKey:{
                type:String,
                required:true
            },
            panCardKey:{
                type:String,
                required:true
            },
            businessRegistrationCertificateKey:{
                type:String,
                required:true
            },
        },

        status:{
            type:String,
            enum:Object.values(VendorStatus),
            default:VendorStatus.PENDING
        },
        rejectionReason:{
            type:String,
            default:null
        },
        isLive:{
            type:Boolean,
            default:false,
        }
    },
    {
        timestamps:true
    }
);
vendorSchema.index({
    "businessInfo.location":"2dsphere",
});

export const Vendor=mongoose.model<IVendor>(
    "vendor",
    vendorSchema

)

