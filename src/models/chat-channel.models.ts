import mongoose from "mongoose";

/**
 * 聊天频道模型定义
 */
const ChatChannelSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    // 频道名称
    channelName: {
        type: String,
        required: true,
        unique: true,
    },
    // 频道ID
    channelId: {
        type: String,
        required: true,
        unique: true,
    },
    // 头像
    avatar: {
        type: String,
    },
    // 标签
    tags: {
        type: String,
    },
    // 管理员
    admins: {
        type: String,
    },
    // 频道人员
    personnel: {
        type: Object,
    },
    // 公告
    announcement: {
        type: String,
    },
    // 是否为私密频道
    isPrivacy: {
        type: Number,
    },
    // 密码
    password: {
        type: String,
    },
    // 备注
    remark: {
        type: String,
    },
    // 创建时间
    updated: {
        type: Number,
    },
});
const ChatChannelDatabase = mongoose.model('chat_channel', ChatChannelSchema);
export default ChatChannelDatabase;
