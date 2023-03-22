import sequelize from '../db/connection';
import { DataTypes } from 'sequelize';

/**
 * 用户模型定义
 */
const User = sequelize.define('user', {
  id: {
    // 数据类型
    type: DataTypes.INTEGER,
    // 是否为key
    primaryKey: true,
    // 自动递增
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default User;
