import sequelize from "../db/connection";
import {DataTypes} from "sequelize";

/**
 * 聊天频道模型定义
 */
const ChatChannelDatabase = sequelize.define('chat_channel', {
    id: {
        // 数据类型
        type: DataTypes.INTEGER,
        // 是否为key
        primaryKey: true,
        // 自动递增
        autoIncrement: true,
    },
    // 频道名称
    channelName: {
        type: DataTypes.STRING,
    },
    // 频道ID
    channelId: {
        type: DataTypes.STRING,
    },
    // 头像
    avatar: {
        type: DataTypes.STRING,
    },
    // 标签
    tags: {
        type: DataTypes.STRING,
    },
    // 管理员
    admins: {
        type: DataTypes.STRING,
    },
    // 是否为私密频道
    isPrivacy: {
        type: DataTypes.INTEGER,
    },
    // 密码
    password: {
        type: DataTypes.INTEGER,
    },
    // 备注
    remark: {
        type: DataTypes.STRING,
    },
});

export default ChatChannelDatabase;
