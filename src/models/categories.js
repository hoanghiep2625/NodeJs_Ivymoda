import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const categorySchema = new mongoose.Schema(
    {
        name: { type: String },
        parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
        ancestors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
        level: { type: Number }
    },
    { timestamps: true, versionKey: false }
);

categorySchema.plugin(mongoosePaginate);

const Category = mongoose.model("Category", categorySchema);

export default Category;