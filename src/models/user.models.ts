import sequelize from '../db/connection';
import {DataTypes} from 'sequelize';

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
    // 登录名
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    // 用户名
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // 头像
    avatar: {
        type: DataTypes.STRING,
    },
    // 密码
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // 角色
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // 角色名称
    roleName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // 备注
    remarks: {
        type: DataTypes.STRING,
    },
    // 最后登录时间
    lastLoginTime: {
        type: DataTypes.BIGINT
    },
});

export default User;
