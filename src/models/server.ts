import express, { Application } from 'express';
import cors from 'cors';
import routerProduct from '../routes/product';
import { newUser, loginUser } from '../controllers/user';
import Product from './product';
import User from './user';

class Servers {
  private app: Application;
  private port: string;

  constructor() {
    this.app = express();
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

  listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Application 端口为：${this.port}`);
    });
  }

  routes(): void {
    this.app.use('/api/products', routerProduct);
    this.app.use('/api/users', newUser);
    this.app.use('/api/loginUser', loginUser);
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
      await User.sync({ alter: true });
      console.log('数据库创建成功');
    } catch (error) {
      console.log('数据库创建失败', error);
    }
  }
}

export default Servers;
