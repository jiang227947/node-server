import sequelize from '../db/connection';
import { DataTypes } from 'sequelize';

/**
 * 模型定义
 */
const Product = sequelize.define('product', {
  id: {
    // 数据类型
    type: DataTypes.INTEGER,
    // 是否为key
    primaryKey: true,
    // 自动递增
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
});
export default Product;
