import bcrypt from "bcryptjs";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const registerSchema = z.object({
    first_name: z.string().min(1, "Tên không hợp lệ"),
    name: z.string().min(2, "Tên cần tối thiểu 2 ký tự"),
    email: z.string().email("Sai định dạng email"),
    phone: z.string().regex(/^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-689]|9[0-46-9])\d{7}$/, "Sai định dạng số điện thoại Việt Nam"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Ngày sinh phải đúng định dạng YYYY-MM-DD" }),
    sex: z.string().min(0).max(1),
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

const loginSchema = z.object({
    email: z.string().email("Sai định dạng email"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

const generateAccessToken = (userId, email, role) => {
    return jwt.sign({ id: userId, email: email, role: role }, process.env.SECRET_KEY, { expiresIn: "1d" });
};

const generateRefreshToken = (userId, email, role) => {
    return jwt.sign({ id: userId, email: email, role: role }, process.env.SECRET_KEY, { expiresIn: "30d" });
};

export const register = async (req, res) => {
    try {
        const result = registerSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.format() });
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
            role: "1",
        });

        return res.status(201).json({ message: "Đăng ký thành công" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.format() });
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

        const token = generateAccessToken(user._id, user.email, user.role);
        const refreshToken = generateRefreshToken(user._id, user.email, user.role);
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        await User.findByIdAndUpdate(user._id, { refreshToken: hashedRefreshToken });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            path: "/api/auth/refresh",
        });
        console.log(user);
        return res.status(200).json({
            message: "Đăng nhập thành công",
            user: { id: user._id, email: user.email, name: user.name, token },
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const requestRefreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token" });
    }

    try {
        const userData = jwt.verify(refreshToken, process.env.SECRET_KEY);
        const user = await User.findById(userData.id);

        if (!user || !user.refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isValid) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const newToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);
        const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

        await User.findByIdAndUpdate(user._id, { refreshToken: hashedNewRefreshToken });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            path: "/api/auth/refresh",
        });

        res.status(200).json({ token: newToken });
    } catch (error) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(200).json({ message: "Đã đăng xuất" });

        const userData = jwt.verify(refreshToken, process.env.SECRET_KEY);
        await User.findByIdAndUpdate(userData.id, { refreshToken: null });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            path: "/api/auth/refresh",
        });

        return res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
export const info = async (req, res) => {
    return res.status(200).json(req.user);
};
