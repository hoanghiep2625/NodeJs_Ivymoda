import Category from "../models/categories.js";
import { z } from "zod";
import mongoose from "mongoose";

const categorySchema = z.object({
    name: z.string().min(2, "Tên danh mục cần tối thiểu 2 ký tự"),
    parentId: z
        .string()
        .refine((val) => val === null || mongoose.Types.ObjectId.isValid(val), {
            message: "parentId phải là ObjectId hợp lệ hoặc null",
        })
        .nullable()
        .optional(),
    ancestors: z
        .array(
            z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
                message: "Mỗi ID trong ancestors phải là ObjectId hợp lệ",
            })
        )
        .optional(),
    level: z.number().int().min(1, "Cấp độ phải là số nguyên lớn hơn hoặc bằng 1").max(3, "Cấp độ tối đa là 3"),
});

export const createCategory = async (req, res) => {
    try {
        const result = categorySchema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.errors.map(err => err.message);
            return res.status(400).json({ errors });
        }
        const category = await Category.create(result.data);
        return res.status(201).json(category);
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};
export const getCategories = async (req, res) => {
    try {
        const {
            _limit = 10,
            _page = 1,
            _sort = "level",
            _order = "asc",
            level1,
            level2
        } = req.query;

        const options = {
            page: parseInt(_page),
            limit: parseInt(_limit),
            sort: { [_sort]: _order === "desc" ? -1 : 1 },
        };

        const query = {};
        if (level1) query["ancestors.1"] = level1;  // Sửa cú pháp truy vấn MongoDB
        if (level2) query["ancestors.2"] = level2;

        const category = await Category.paginate(query, options);
        return res.status(200).json(category);
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Danh mục không tồn tại" });
        }
        return res.status(200).json(category);
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Danh mục không tồn tại" });
        }
        return res.status(200).json({
            message: "Xóa danh mục thành công",
            data: category,
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const result = categorySchema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.errors.map(err => err.message);
            return res.status(400).json({ errors });
        }
        const category = await Category.findByIdAndUpdate(req.params.id, result.data, { new: true });
        if (!category) {
            return res.status(404).json({ message: "Danh mục không tồn tại" });
        }
        return res.status(200).json({
            message: "Cập nhật danh mục thành công",
            data: category,
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};