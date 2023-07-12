import {ChatMessagesTypeEnum} from '../enum/chat-channels.enum';

/**
 * 聊天频道聊天频道房间接口
 */
export interface ChatChannelRoomInterface {
    // 房间ID
    roomId: string;
    // 房间名称
    roomName: string;
    // 公告
    announcement: string;
    // 人员
    personnel: string | ChatChannelRoomUserInterface[];
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
}

/**
 * 聊天频道聊天频道在线用户接口
 */
export interface ChatChannelRoomUserInterface {
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
    // 最后一次在线时间
    lastOnline: number;
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
        userName: string;
    } | string;
    // 频道id
    channelId: string;
    // 组件
    components: any[];
    // 消息内容
    content: string;
    // 编辑消息的时间
    edited_timestamp: string;
    // 反应
    reaction: any[];
    // 标志
    flags: number;
    // id
    id: number;
    // 提及的人
    mention_everyone: boolean;
    // 提及的人名称信息
    mentions: any[];
    // 留言参考
    messageReference: any;
    // 参考消息
    referencedMessage: any[];
    // 固定
    pinned: boolean;
    // 时间
    timestamp: string;
    // 文本转语音
    tts: boolean;
    // 消息类型 用于前端展示判断
    type: ChatMessagesTypeEnum;
}

/**
 * GPT返回的消息接口
 */
export interface GPTMessageInterface {
    choices: {
        message: {
            role: string, // 模型身份
            content: string // 模型返回给你的信息
        },
        finish_reason: string,
        index: number
    }[];
    created: number;
    id: string;
    model: string;
    object: string;
    usage: {
        [key: string]: number;
    };
}
