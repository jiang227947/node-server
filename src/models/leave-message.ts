import sequelize from '../db/connection';
import { DataTypes } from 'sequelize';

/**
 * 登录页留言框
 */
const LeaveMessage = sequelize.define('leave_message', {
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
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  browser: {
    type: DataTypes.STRING,
  },
});

export default LeaveMessage;
