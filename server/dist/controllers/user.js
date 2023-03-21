"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.newUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * 创建用户
 * @param req 参数
 * @param res 返回
 */
const newUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // 加密密码
    const hashPassword = yield bcrypt_1.default.hash(password, 12);
    // 验证是否存在相同用户
    const userRepeat = yield user_1.default.findOne({ where: { username } });
    if (userRepeat) {
        return res.status(400).json({
            msg: `用户名已存在`,
        });
    }
    try {
        // 成功创建用户
        yield user_1.default.create({
            username,
            password: hashPassword,
        });
        res.json({
            msg: `用户 ${username} 创建成功`,
        });
    }
    catch (error) {
        res.status(400).json({
            msg: `用户创建失败`,
            error,
        });
    }
});
exports.newUser = newUser;
/**
 * 用户登录
 * @param req 参数
 * @param res 返回
 */
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    /**
     * 1. 验证是否存在该用户
     * 2. 验证密码是否正确
     * 3. 生成令牌 登录成功
     */
    // 验证是否存在该用户
    const user = yield user_1.default.findOne({ where: { username } });
    if (!user) {
        return res.status(400).json({
            msg: `用户不存在`,
        });
    }
    // 验证密码是否正确
    const passwordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!passwordValid) {
        return res.status(400).json({
            msg: `密码错误`,
        });
    }
    // 生成token令牌 登录成功
    const token = jsonwebtoken_1.default.sign({
        username,
    }, 
    // 密钥
    process.env.SECRET_KEY || 'jzy2023', 
    // 过期时间 默认24小时
    {
        expiresIn: '86400000',
    });
    res.json({
        token,
    });
});
exports.loginUser = loginUser;
