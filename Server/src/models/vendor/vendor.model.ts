import mongoose,{Document,Schema} from "mongoose";
export interface IVendor extends Document{
    ownerId:mongoose.Types.ObjectId;

    businessInfo:{
        businessName:string;
        businessImage?:string;
        businessType:string;
        place:string;
        address:string;

        location:{
            type:"Point";
            coordinates:[number,number]
        }
    }

    verification:{
        gstNumber:string;
        panNumber:string;
        ifscCode:string;
        bankAccountNumber:string;
        fssaiNumber:string;
    };
    documents:{
        gstCertificate:string;
        fssaiCertificate:string;
        panCard:string;
        businessRegistrationCertificate:string;
    };
    status:"pending"|"approved"|"rejected";
    rejectionReason?:string
    isLive:boolean
}


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
            businessImage:{
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
            gstCertificate:{
                type:String,
                required:true
            },
            fssaiCertificate:{
                type:String,
                required:true
            },
            panCard:{
                type:String,
                required:true
            },
            businessRegistrationCertificate:{
                type:String,
                required:true
            },
        },

        status:{
            type:String,
            enum:['pending','approved','rejected'],
            default:'pending'
        },
        rejectionReason:{
            type:String,
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

