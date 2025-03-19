import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, index: true },
        price: { type: Number, required: true, index: true },
        sku: { type: String, required: true, index: true },
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
        categoryAncestors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true }],
        colors: [
            {
                baseColor: { type: String, required: true, index: true },
                actualColor: { type: String, required: true },
                colorName: { type: String, required: true },
            },
        ],
        images: {
            main: { type: String, required: true },
            hover: { type: String, required: true },
            product: [{ type: String }],
        },
        shortDescription: { type: String },
        description: { type: String },
        sizes: [
            {
                size: { type: String, enum: ["S", "M", "L", "XL", "XXL"], required: true },
                stock: { type: Number, required: true, min: 0, index: true },
            },
        ],
    },
    { timestamps: true, versionKey: false }
);

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model("Product", productSchema);

export default Product;