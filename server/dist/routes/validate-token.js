"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateToken = (req, res, next) => {
    const headerToken = req.headers['authorization'];
    // 验证是否有鉴权信息 并且不是非法鉴权
    if (headerToken !== undefined && headerToken.startsWith('Bearer ')) {
        // 截取token
        const bearerToken = headerToken.slice(7);
        try {
            // 验证token合法性
            jsonwebtoken_1.default.verify(bearerToken, process.env.SECRET_KEY || 'jzy2023');
            next();
        }
        catch (error) {
            return res.status(401).json({
                msg: 'token不合法',
            });
        }
    }
    else {
        return res.status(401).json({
            msg: '无权限访问',
        });
    }
};
exports.default = validateToken;
