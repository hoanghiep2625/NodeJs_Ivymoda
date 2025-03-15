import bcrypt from "bcryptjs";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { z } from "zod";

const signUpSchema = z.object({
    first_name: z.string().min(1, "Tên không hợp lệ"),
    name: z.string().min(2, "Tên cần tối thiểu 2 ký tự"),
    email: z.string().email("Sai định dạng email"),
    phone: z.string().regex(/^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-689]|9[0-46-9])\d{7}$/, "Sai định dạng số điện thoại Việt Nam"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Ngày sinh phải đúng định dạng YYYY-MM-DD",
    }),
    sex: z.number().min(0).max(1),
    city: z.string().min(1, "Cần chọn thành phố"),
    district: z.string().min(1, "Cần chọn quận/huyện"),
    commune: z.string().min(1, "Cần chọn phường xã"),
    address: z.string().min(2, "Địa chỉ tối thiểu 2 ký tự"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

const signInSchema = z.object({
    email: z.string().email("Sai định dạng email"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const signup = async (req, res) => {
    try {
        const result = signUpSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors.map(err => err.message) });
        }

        const value = result.data;

        const existUser = await User.findOne({ email: value.email.toLowerCase() });
        if (existUser) {
            return res.status(400).json({ message: "Tài khoản đã tồn tại" });
        }

        const hashedPassword = await bcrypt.hash(value.password, 10);

        const newUser = await User.create({
            ...value,
            email: value.email.toLowerCase(),
            password: hashedPassword,
            role: 1,
        });

        const userResponse = newUser.toObject();
        delete userResponse.password;

        return res.status(201).json({
            message: "Đăng ký thành công",
            user: userResponse
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const signin = async (req, res) => {
    try {
        const result = signInSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors.map(err => err.message) });
        }

        const { email, password } = result.data;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Tài khoản không tồn tại" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không chính xác" });
        }

        const token = jwt.sign({ id: user._id }, "123456", { expiresIn: "30m" });

        user.password = undefined;
        return res.status(200).json({
            message: "Đăng nhập thành công",
            user,
            token,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
