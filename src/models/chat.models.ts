import mongoose from "mongoose";

/**
 * 聊天记录保存模型定义
 */
const ChatSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    // 附件
    attachments: {
        type: String,
    },
    // 作者
    author: {
        type: Object,
    },
    // 频道id
    channelId: {
        type: String,
    },
    // 组件
    components: {
        type: String,
    },
    // 消息内容
    content: {
        type: String,
        unique: true
    },
    // 编辑消息的时间
    editedTimestamp: {
        type: String,
    },
    // 反应
    reaction: {
        type: Object,
    },
    // 标志
    flags: {
        type: String,
    },
    // 提及的人
    mentionEveryone: {
        type: String,
    },
    // 提及的人名称信息
    mentions: {
        type: String,
    },
    // 留言参考
    messageReference: {
        type: Object,
    },
    // 参考消息
    referencedMessage: {
        type: String,
    },
    // 固定/置顶
    pinned: {
        type: Boolean,
    },
    // 时间
    timestamp: {
        type: String,
    },
    // 文本转语音
    tts: {
        type: Boolean,
    },
    // 消息类型 用于前端展示判断
    type: {
        type: Number,
    },
    // 创建时间
    created: {
        type: String,
    },
});
const ChatDatabase = mongoose.model('chat', ChatSchema);
export default ChatDatabase;
