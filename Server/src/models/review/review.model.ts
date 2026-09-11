import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReview extends Document {
  userId: Types.ObjectId;
  userName: string;
  userAvatar?: string;
  hotelId: Types.ObjectId;
  orderId?: Types.ObjectId;
  rating: number; // 1 to 5
  comment: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {

    userId: { 
      type: Schema.Types.ObjectId,
       ref: "user", 
       required: true, 
       index: true 
       
    },

    userName: {
       type: String,
        required: true,
        trim: true 
    },

    userAvatar: {
       type: String,
        default: "" 
    },

    hotelId: {
       type: Schema.Types.ObjectId,
        ref: "hotel", 
        required: true,
         index: true 
    
    },
    orderId: { 
      type: Schema.Types.ObjectId,
       ref: "Order", 
       default: null
    },

    rating: { 
      type: Number,
       required: true, 
       min: 1, 
       max: 5 
    },

    comment: {
       type: String,
        required: true,
         trim: true,
        maxLength: 1000
     },
    isVisible: {
       type: Boolean,
        default: true,
         index: true 
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ hotelId: 1, isVisible: 1, createdAt: -1 });

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
