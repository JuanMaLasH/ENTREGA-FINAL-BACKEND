import { Schema, model, Types } from "mongoose";

const userSchema = Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    password: {
        type: String,
        //required: true
    },
    age: {
        type: Number,
        required: true
    },
    cart: {
        type: Types.ObjectId,
        ref: 'Cart'
    },
    role: {
        type: String,
        enum: ['admin', 'usuario', 'premium'],
        default: 'usuario'
    },
    resetToken: {
        token: String,
        expire: Date
    },
    documents: [{
        name: String,
        reference: String
    }], 

    last_connection: {
        type: Date, 
        default: Date.now
    }
});

export const UserModel = model("user", userSchema);