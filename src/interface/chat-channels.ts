import {ChatMessagesTypeEnum} from '../enum/chat-channels.enum';

/**
 * 聊天频道聊天频道房间接口
 */
export interface ChatChannelRoomInterface {
    // 房间ID
    roomId: string;
    // 房间名称
    roomName: string;
    // 用户信息
    users: {
        // id
        id: number;
        // socketId
        socketId: string;
        // 名称
        userName: string;
        // 头像
        avatar: string;
        // 备注
        remarks: string;
        // 角色
        role: string;
        // 角色名称
        roleName: string;
    }[];
    // 最近的聊天信息
    messages: string;
}

/**
 * 消息接口
 */
export interface ChatMessagesInterface {
    // 附件
    attachments: any[];
    // 作者
    author: {
        // 头像
        avatar: string;
        // 头像描述
        avatar_decoration: string;
        // 鉴别器
        discriminator: string;
        // 全局名称
        global_name: string;
        // id
        id: number;
        // 公共标签
        public_flags: number;
        // 用户名
        username: string;
    };
    // 频道id
    channel_id: string;
    // 组件
    components: any[];
    // 消息内容
    content: string;
    // 编辑消息的时间
    edited_timestamp: string;
    // 嵌入
    embeds: any[];
    // 标志
    flags: number;
    // id
    id: number;
    // 提及的人
    mention_everyone: boolean;
    // 提及的角色
    mention_roles: any[];
    // 提及的人名称信息
    mentions: any[];
    // 留言参考
    message_reference: any[];
    // 参考消息
    referenced_message: any[];
    // 固定
    pinned: boolean;
    // 时间
    timestamp: string;
    // 文本转语音
    tts: boolean;
    // 消息类型 用于前端展示判断
    type: ChatMessagesTypeEnum;
}
