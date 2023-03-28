import sequelize from '../db/connection';
import { DataTypes } from 'sequelize';

/**
 * 文件模型定义
 */
const Filedb = sequelize.define('file', {
  id: {
    // 数据类型
    type: DataTypes.INTEGER,
    // 是否为key
    primaryKey: true,
    // 自动递增
    autoIncrement: true,
  },
  filename: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  filesize: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  path: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
});

export default Filedb;
