"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
/**
 * 创建Sequelize 实例
 * 可以通过将连接参数分别传递到 Sequelize 构造函数
 * 或通过传递一个连接 URI 来完成
 * https://www.sequelize.cn/core-concepts/getting-started
 */
const sequelize = new sequelize_1.Sequelize('node_mysql', 'root', 'admin123', {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
});
exports.default = sequelize;
