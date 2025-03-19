import mongoose, { Schema } from "mongoose";

const registerSchema = new Schema(
    {
        first_name: {
            type: String,
            required: true,
            minLength: 6,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
        },
        date: {
            type: String,
        },
        sex: {
            type: String, // 0: Nữ, 1: Nam
            enum: ["0", "1"],
            required: true,
        },
        city: {
            type: String,
        },
        district: {
            type: String,
        },
        commune: {
            type: String,
        },
        address: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["1", "3"],
            default: "1",
        },
        verify: {
            type: Number,
            enum: [0, 1],
            default: 0,
        },
        refreshToken: { type: String, default: "" }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model("user", registerSchema);
