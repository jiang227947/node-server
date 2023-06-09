import express, {Application} from 'express';
import cors from 'cors';
import {SocketServer} from '../controllers/socket';
// Router
import UserRouter from '../routes/user.router';
import FileOperation from '../routes/file.router';
import LeaveMessageRouter from '../routes/leave-message.router';
import ChatMessageRouter from '../routes/chat.router';
import Oauth2Router from '../routes/oauth2.router';
import ChatChannelRouter from '../routes/chat-channel.router';
// Models
import User from './user.models';
import Filedb from './file.models';
import LeaveMessage from './leave-message.models';
import Visitor from './visitor.models';
import ChatDatabase from './chat.models';
import ChatChannelDatabase from './chat-channel.models';
import {Redis} from "../db/redis";

class Servers {
    private app: Application;
    private readonly port: string;
    private readonly socketPort: string;

    constructor() {
        this.app = express();
        // 服务端口
        this.port = process.env.PORT || '3000';
        // websocket端口
        this.socketPort = process.env.SOCKETPORT || '3022';
        // 默认启动
        this.listen();
        try {
            // 连接Redis和创建数据库
            new Redis().connect().then(() =>
                this.dbConnect().then(() => {
                    // json数据
                    this.midlewares();
                    // 添加路由接口
                    this.routes();
                }));
        } catch (e) {
            console.error('连接数据库失败');
        }
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
        // 用户路由
        this.app.use(UserRouter);
        // 第三方登录路由
        this.app.use(Oauth2Router);
        // 文件路由
        this.app.use(FileOperation);
        // 留言路由
        this.app.use(LeaveMessageRouter);
        // 聊天记录路由
        this.app.use(ChatMessageRouter);
        // 聊天频道路由
        this.app.use(ChatChannelRouter);
    }

    /**
     * 中间件
     */
    midlewares(): void {
        // json解析
        this.app.use(express.json());
        // 多请求地址配置
        const whiteList: string[] = ['https://www.evziyi.top', 'http://localhost:4300']; // 请求白名单
        // 跨域
        this.app.use(
            cors({
                origin: (origin, callback) => {
                    if (origin) {
                        if (whiteList.indexOf(<string>origin) !== -1) return callback(null, true);
                    } else {
                        return callback(null, true);
                    }
                    callback(new Error('Not allowed by CORS!'));
                },
            })
        );
        // 头像文件静态资源托管，这样才能在浏览器上直接访问预览图片
        this.app.use('/data/avatar', express.static('/data/avatar'));
        // 附件文件静态资源托管
        this.app.use('/data/channel/attachments', express.static('/data/channel/attachments'));
    }

    /**
     * 数据库连接
     */
    async dbConnect(): Promise<void> {
        try {
            // 测试连接
            // await sequelize.authenticate();
            // 如果表不存在,则创建该表(如果已经存在,则不执行任何操作)
            // 用户表
            await User.sync();
            // 文件路径表
            await Filedb.sync();
            // 登录页留言框表
            await LeaveMessage.sync();
            // 访问表
            await Visitor.sync();
            // 聊天记录表
            await ChatDatabase.sync();
            // 聊天频道
            await ChatChannelDatabase.sync();
        } catch (error) {
            console.log('数据库连接失败', error);
        }
    }
}

export default Servers;
