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
    // 附件
    attachments: {
        type: DataTypes.STRING,
    },
    // 作者
    author: {
        type: DataTypes.STRING,
    },
    // 频道id
    channelId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // 频道id
    components: {
        type: DataTypes.STRING,
    },
    // 消息内容
    content: {
        type: DataTypes.TEXT,
    },
    // 编辑消息的时间
    editedTimestamp: {
        type: DataTypes.STRING,
    },
    // 反应
    reaction: {
        type: DataTypes.STRING,
    },
    // 标志
    flags: {
        type: DataTypes.INTEGER,
    },
    // 提及的人
    mentionEveryone: {
        type: DataTypes.BOOLEAN,
    },
    // 提及的人名称信息
    mentions: {
        type: DataTypes.STRING,
    },
    // 留言参考
    messageReference: {
        type: DataTypes.STRING,
    },
    // 参考消息
    referencedMessage: {
        type: DataTypes.STRING,
    },
    // 固定
    pinned: {
        type: DataTypes.BOOLEAN,
    },
    // 时间
    timestamp: {
        type: DataTypes.STRING,
    },
    // 文本转语音
    tts: {
        type: DataTypes.BOOLEAN,
    },
    // 消息类型 用于前端展示判断
    type: {
        type: DataTypes.INTEGER,
    },
});

export default ChatDatabase;
