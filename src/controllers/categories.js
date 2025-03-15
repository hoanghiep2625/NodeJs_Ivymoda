import Category from "../models/categories";
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