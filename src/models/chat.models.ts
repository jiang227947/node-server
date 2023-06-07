import sequelize from '../db/connection';
import {DataTypes} from 'sequelize';

/**
 * 聊天记录保存模型定义
 */
const ChatDatabase = sequelize.define('chat', {
    id: {
        // 数据类型
        type: DataTypes.INTEGER,
        // 是否为key
        primaryKey: true,
        // 自动递增
        autoIncrement: true,
    },
    // 消息体
    content: {
        type: DataTypes.TEXT,
    },
    // 存储时间
    saveTime: {
        type: DataTypes.BIGINT,
    },
});

export default ChatDatabase;
