import * as mongoose from "mongoose";

/**
 * 用户模型定义
 */
/*const User = sequelize.define('user', {
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
    // 邮箱
    email: {
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
});*/

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    // 登录名
    username: {
        type: String,
        required: true,
        unique: true,
    },
    // 用户名
    name: {
        type: String,
        required: true,
        unique: true,
    },
    // 密码
    password: {
        type: String,
        required: true,
    },
    // 邮箱
    email: {
        type: String,
    },
    // 头像
    avatar: {
        type: String,
    },
    // 角色
    role: {
        type: String,
        required: true
    },
    // 角色名称
    roleName: {
        type: String,
        required: true
    },
    // 备注
    remarks: {
        type: String,
    },
    // 最后登录时间
    lastLoginTime: {
        type: String,
    },
    // 创建时间
    created: {
        type: String,
    },
    // 修改时间
    updated: {
        type: String,
    },
});
const User = mongoose.model('User', userSchema);

export default User;
