import mongoose,{Schema} from "mongoose"
import { IVendor,VendorStatus} from "../../interfaces/models/IVendor.model";


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

