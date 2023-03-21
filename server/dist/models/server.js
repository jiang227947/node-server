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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const product_1 = __importDefault(require("../routes/product"));
const user_1 = require("../controllers/user");
const product_2 = __importDefault(require("./product"));
const user_2 = __importDefault(require("./user"));
class Servers {
    constructor() {
        this.app = (0, express_1.default)();
        // 端口
        this.port = process.env.PORT || '3000';
        // 默认启动
        this.listen();
        // json数据
        this.midlewares();
        // 添加路由接口
        this.routes();
        // 创建数据库
        this.dbConnect();
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Application 端口为：${this.port}`);
        });
    }
    routes() {
        this.app.use('/api/products', product_1.default);
        this.app.use('/api/users', user_1.newUser);
        this.app.use('/api/loginUser', user_1.loginUser);
    }
    /**
     * 中间件express.json解析
     */
    midlewares() {
        this.app.use(express_1.default.json());
        // 跨域
        this.app.use((0, cors_1.default)());
    }
    /**
     * 数据库连接
     */
    dbConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // await sequelize.authenticate();
                // 如果表不存在,则创建该表(如果已经存在,则不执行任何操作)
                yield product_2.default.sync();
                yield user_2.default.sync({ alter: true });
                console.log('数据库创建成功');
            }
            catch (error) {
                console.log('数据库创建失败', error);
            }
        });
    }
}
exports.default = Servers;
