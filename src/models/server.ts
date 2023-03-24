import express, {Application} from 'express';
import cors from 'cors';
import Product from './product';
import User from './user';
import UserRouter from '../routes/user';
import ProductRouter from '../routes/product';
import FileOperation from '../routes/file';
import Filedb from './file';
import {SocketServer} from './socket';
import LeaveMessage from './leave-message';
import LeaveMessageRouter from '../routes/leave-message';
import ChatMessageSendRouter from '../routes/chat';

class Servers {
    private app: Application;
    private port: string;
    private socketPort: string;

    constructor() {
        this.app = express();
        // 服务端口
        this.port = process.env.PORT || '3000';
        // websocket端口
        this.socketPort = process.env.SOCKETPORT || '3022';
        // 默认启动
        this.listen();
        // json数据
        this.midlewares();
        // 添加路由接口
        this.routes();
        // 创建数据库
        this.dbConnect();
    }

    /**
     * 启动端口
     */
    listen(): void {
        // node服务的启动
        this.app.listen(this.port, () => {
            console.log(`node 端口为：${this.port}`);
        });
        // websocket服务的启动
        SocketServer.listen(this.socketPort, () => {
            console.log(`websocket 端口为：${this.socketPort}`);
        });
    }

    /**
     * 注册路由模块
     */
    routes(): void {
        this.app.use(ProductRouter);
        // 用户路由
        this.app.use(UserRouter);
        // 文件路由
        this.app.use(FileOperation);
        // 留言路由
        this.app.use(LeaveMessageRouter);
        // socket路由
        this.app.use(ChatMessageSendRouter);
    }

    /**
     * 中间件express.json解析
     */
    midlewares(): void {
        // json解析
        this.app.use(express.json());
        // 跨域
        this.app.use(cors());
    }

    /**
     * 数据库连接
     */
    async dbConnect(): Promise<void> {
        try {
            // 测试连接
            // await sequelize.authenticate();
            // 如果表不存在,则创建该表(如果已经存在,则不执行任何操作)
            await Product.sync();
            // 用户表
            await User.sync();
            // 文件路径表
            await Filedb.sync();
            // 登录页留言框表
            await LeaveMessage.sync();
        } catch (error) {
            console.log('数据库连接失败', error);
        }
    }
}

export default Servers;
