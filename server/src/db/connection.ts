import { Sequelize } from 'sequelize';

/**
 * 创建Sequelize 实例
 * 可以通过将连接参数分别传递到 Sequelize 构造函数
 * 或通过传递一个连接 URI 来完成
 * https://www.sequelize.cn/core-concepts/getting-started
 */
const sequelize = new Sequelize('node_mysql', 'root', 'admin123', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
});

export default sequelize;
