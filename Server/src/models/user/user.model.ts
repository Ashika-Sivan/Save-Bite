import mongoose, { Document, Schema } from "mongoose";

const pointSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
}, { _id: false });

export interface IUser extends Document {
    name: string,
    email?: string,//optional for subvendor
    username?: string,
    phone?: string,
    password?: string,
    authProvider?: "local" | "google",
    isBusinessOwner: boolean,
    isAuthenticated: boolean,
    isActive: boolean,
    isAdmin: boolean,
    totalOrder: number | 0,
    role: "user" | "vendor" | "admin" | "sub_vendor";
    vendorId?: mongoose.Types.ObjectId; // Link to parent vendor
    hotelId?: mongoose.Types.ObjectId; // Link to specific hotel
    permissions?: string[]; // Array of assigned feature permissions
    location?: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
    createdAt: Date
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: function () { return this.role !== 'sub_vendor'; },
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true
        },
        username: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },
        password: {
            type: String,
            required: function () { return this.authProvider === 'local' || !this.authProvider; }
        },
        authProvider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local'
        },
        phone: {
            type: String
        },
        isBusinessOwner: {
            type: Boolean,
            default: false
        },
        isAuthenticated: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            enum: ["user", 'vendor', 'admin', 'sub_vendor'],//add subbvendor
            default: 'user',
        },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor'
        },
        hotelId: {
            type: Schema.Types.ObjectId,
            ref: 'Hotel'
        },
        permissions: {
            type: [String],
            default: []//create ,update..
        },
        location: {
            type: pointSchema,
            required: false
        }
    },
    { timestamps: true }

)

export const User = mongoose.model<IUser>("User", userSchema)

User.collection.createIndex({ location: "2dsphere" });