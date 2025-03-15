import jwt from "jsonwebtoken";
import User from "../models/user";
export const checkAuth = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({
            message: "Bạn không có quyền truy cập",
        });
    }

    try {
        const decoded = jwt.decode(token, "123456");
        if (!decoded) {
            return res.status(401).json({
                message: "Token không hợp lệ",
            });
        }
        const user = await User.findById(decoded.id).select("-password");
        console.log(user);
        if (user.role !== 3) {
            return res.status(401).json({
                message: "Bạn không có quyền truy cập",
            });
        }
        next();
    } catch (error) {
        return res.status(401).json({
            message: error.message,
        });
    }
};
