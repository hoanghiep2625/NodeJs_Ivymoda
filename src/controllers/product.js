import { z } from "zod";
import mongoose from "mongoose";
import Product from "../models/product.js";
import upload from "../middlewares/multer.js";
import cloudinary from "../config/cloudinary.js";

// Schema Zod với transform
const productSchema = z.object({
    name: z.string().min(2, "Tên sản phẩm cần tối thiểu 2 ký tự"),
    price: z.string().transform(val => parseFloat(val)).refine(val => val >= 0, {
        message: "Giá phải lớn hơn hoặc bằng 0",
    }),
    sku: z.string(),
    categoryId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "categoryId phải là ObjectId hợp lệ",
    }),
    categoryAncestors: z.string().transform(val => JSON.parse(val)).optional().refine(
        val => Array.isArray(val) ? val.every(id => mongoose.Types.ObjectId.isValid(id)) : true,
        { message: "Mỗi ID trong categoryAncestors phải là ObjectId hợp lệ" }
    ),
    colors: z.string().transform(val => JSON.parse(val)).refine(
        val => Array.isArray(val) && val.length > 0 && val.every(color =>
            typeof color.baseColor === "string" && color.baseColor.length > 0 &&
            typeof color.actualColor === "string" && color.actualColor.length > 0 &&
            typeof color.colorName === "string" && color.colorName.length > 0
        ),
        { message: "Phải có ít nhất một màu với các trường hợp lệ" }
    ),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    sizes: z.string().transform(val => JSON.parse(val)).refine(
        val => Array.isArray(val) && val.length > 0 && val.every(size =>
            ["S", "M", "L", "XL", "XXL"].includes(size.size) &&
            typeof size.stock === "number" && Number.isInteger(size.stock) && size.stock >= 0
        ),
        { message: "Phải có ít nhất một kích cỡ hợp lệ" }
    ),
});

// Hàm upload ảnh lên Cloudinary từ buffer
const uploadImageToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        stream.end(file.buffer);
    });
};

// Tạo sản phẩm với upload ảnh
export const createProduct = async (req, res) => {
    upload.fields([
        { name: "mainImage", maxCount: 1 },
        { name: "hoverImage", maxCount: 1 },
        { name: "productImages", maxCount: 10 },
    ])(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        try {
            const result = productSchema.safeParse(req.body);
            if (!result.success) {
                const errors = result.error.errors.map(err => err.message);
                return res.status(400).json({ errors });
            }
            const mainImage = req.files["mainImage"]
                ? await uploadImageToCloudinary(req.files["mainImage"][0])
                : null;
            const hoverImage = req.files["hoverImage"]
                ? await uploadImageToCloudinary(req.files["hoverImage"][0])
                : null;
            const productImages = req.files["productImages"]
                ? await Promise.all(req.files["productImages"].map(file => uploadImageToCloudinary(file)))
                : [];

            if (!mainImage || !hoverImage) {
                return res.status(400).json({ message: "Phải cung cấp ảnh chính và ảnh hover" });
            }

            const images = {
                main: mainImage,
                hover: hoverImage,
                product: productImages,
            };

            const productData = {
                ...result.data,
                images,
            };

            const product = await Product.create(productData);
            return res.status(201).json(product);
        } catch (error) {
            return res.status(400).json({
                message: error.message,
            });
        }
    });
};

export const getProducts = async (req, res) => {
    try {
        const { _limit = 10, _page = 1, _sort = "price", _order = "asc", baseColor, categoryId } = req.query;
        const options = {
            page: parseInt(_page),
            limit: parseInt(_limit),
            sort: { [_sort]: _order === "desc" ? -1 : 1 },
        };
        const query = {};
        if (baseColor) query["colors.baseColor"] = baseColor;
        if (categoryId) query.categoryId = categoryId;
        const products = await Product.paginate(query, options);
        return res.status(200).json(products);
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }
        return res.status(200).json(product);
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }
        return res.status(200).json({
            message: "Xóa sản phẩm thành công",
            data: product,
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const result = productSchema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.errors.map(err => err.message);
            return res.status(400).json({ errors });
        }
        const product = await Product.findByIdAndUpdate(req.params.id, result.data, { new: true });
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }
        return res.status(200).json({
            message: "Cập nhật sản phẩm thành công",
            data: product,
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};