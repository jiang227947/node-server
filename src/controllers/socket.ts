import http from 'http';
import express from 'express';
import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import {decipher} from '../util/encipher';
import {
    ChatChannelRoomInterface, ChatMessagesInterface,
} from '../interface/chat-channels';
import {
    ChatChannelsCallbackEnum,
    ChatChannelsMessageTypeEnum, SystemMessagesEnum
} from '../enum/chat-channels.enum';
import User from '../models/user.models';
import {ChatChannelRoom} from '../models/class/ChatChannelRoom';
import ChatDatabase from '../models/chat.models';

/**
 * websocket服务
 * 使用socket.io
 */
const app = express();
const SocketServer = http.createServer(app);
const io = new Server(SocketServer, {
    cors: {
        origin: '*',
    },
    connectionStateRecovery: {
        // 会话和报文的备份时间
        maxDisconnectionDuration: 60 * 1000,
        // 恢复成功后是否跳过中间件
        skipMiddlewares: true,
    },
    // 发送新的ping packet（30000）之前有多少ms
    pingInterval: 30000,
    // 有多少ms没有传递消息则考虑连接close（5000）
    pingTimeout: 5000,
});
// 用于保存有关创建的每个房间 ID 和该房间中的用户数量的信息
const roomsList: ChatChannelRoomInterface[] = [];
// 默认频道为8808
// const CHANNEL_ID: string = '8808';
/**
 * 连接
 */
io.on('connection', async (socket) => {
    // console.log('socket.recovered', socket.recovered);
    if (socket.recovered) {
        // recovery was successful: socket.id, socket.rooms and socket.data were restored
    } else {
        // new or unrecoverable session
    }
    // token
    const token: string | any = socket.handshake.headers.token;
    if (token) {
        // 解密token
        const userInfo = decipher(token);
        if (userInfo) {
            // 用户进入房间信息
            const decode = jwt.decode(userInfo) as { name: string, id: number, iat: number, exp: number };
            const user: any = await User.findOne({where: {id: decode.id}});
            console.log('socket连接成功!', decode.name, socket.id);
            let room: ChatChannelRoomInterface;
            // 准备连接的频道ID
            const channelId: string = socket.handshake.headers.channelid as string;
            if (channelId !== 'undefined') {
                // 加入指定的频道
                room = await new ChatChannelRoom(roomsList).joinRoomToChannel(channelId, user, socket.id);
                if (!room) {
                    socket.emit(ChatChannelsMessageTypeEnum.systemMessage, {systemStates: null, msg: '不存在该频道'});
                    return;
                }
            } else {
                // 加入闲聊频道
                room = await new ChatChannelRoom(roomsList).joinRoom(`闲聊频道`, user, socket.id);
            }
            // console.log('房间列表', room, roomsList);
            // 转发给客户端房间信息
            socket.emit(ChatChannelsMessageTypeEnum.systemMessage, {systemStates: SystemMessagesEnum.roomInfo, ...room});
            // 添加room
            socket.join(room.roomId);
            // 系统消息 发送给room房间
            socket.to(room.roomId).emit(ChatChannelsMessageTypeEnum.systemMessage, {
                systemStates: SystemMessagesEnum.join,
                id: decode.id,
                socketId: socket.id,
                userName: user.username,
                avatar: user.avatar, // 头像
                remarks: user.remarks, // 备注
                role: user.role,
                roleName: user.roleName,
                timestamp: new Date().toISOString()
            });
        } else {
            socket.disconnect();
        }
    } else {
        // todo 游客身份
    }

    /**
     * 接收公共频道消息
     * publicMessage 为规定好的事件名称
     */
    socket.on(ChatChannelsMessageTypeEnum.publicMessage, (parseMessage: ChatMessagesInterface, callback) => {
        try {
            // console.log('公共频道消息', parseMessage);
            // 转发给公共频道
            // socket.emit(ChatChannelsMessageTypeEnum.publicMessage, {type: 'public', parseMessage});
            // 系统消息 发送给room房间
            socket.to(parseMessage.channelId).emit(ChatChannelsMessageTypeEnum.publicMessage, parseMessage);
            // 保存记录
            saveMessage(parseMessage);
            // 接收消息成功回调
            callback({
                status: ChatChannelsCallbackEnum.ok
            });
        } catch (e) {
            // 接收消息失败回调
            callback({
                status: ChatChannelsCallbackEnum.error
            });
        }
    });

    /**
     * 接收房间消息
     * roomMessage 为规定好的事件名称
     */
    socket.on(ChatChannelsMessageTypeEnum.roomMessage, (parseMessage: ChatMessagesInterface, callback) => {
        try {
            console.log('房间消息', parseMessage);
            // 发送给room房间
            socket.to(parseMessage.channelId).emit(ChatChannelsMessageTypeEnum.roomMessage, parseMessage);
            // 保存记录
            saveMessage(parseMessage);
            // 接收消息成功回调
            callback({
                status: ChatChannelsCallbackEnum.ok
            });
        } catch (e) {
            // 接收消息失败回调
            callback({
                status: ChatChannelsCallbackEnum.error
            });
        }
    });

    /**
     * 接收全体消息
     * allMessage 为规定好的事件名称
     */
    socket.on(ChatChannelsMessageTypeEnum.allMessage, (message: any, callback) => {
        try {
            // 接收消息成功回调
            callback({
                status: ChatChannelsCallbackEnum.ok
            });
            switch (message.type) {
                // 一般消息
                case ChatChannelsMessageTypeEnum.publicMessage:
                    // const message = {
                    //     type: 'message',
                    //     content: message.content
                    // };
                    socket.broadcast.emit('allMessage', message);
                    break;
                // 全体消息
                case ChatChannelsMessageTypeEnum.allMessage:
                    const allMessage = {
                        type: 'allMessage',
                        from: message.from,
                        content: message.content
                    };
                    socket.broadcast.emit('allMessage', allMessage);
                    break;
                // 系统消息
                case ChatChannelsMessageTypeEnum.systemMessage:
                    // socket.broadcast.emit('system', {some: 'data'});
                    break;
            }
        } catch (e) {
            callback({
                status: ChatChannelsCallbackEnum.error
            });
        }
        // 转发给客户端信息
        // socket.emit('onmessage', 'onmessage消息收到');
    });

    /**
     * 接收系统消息
     * systemMessage 为规定好的事件名称
     */
    socket.on(ChatChannelsMessageTypeEnum.systemMessage, (message: any, callback) => {
        console.log('接收系统消息', message);
        try {
            /*switch (message.type) {
                // 一般消息
                case ChatChannelsMessageTypeEnum.publicMessage:
                    // const message = {
                    //     type: 'message',
                    //     content: message.content
                    // };
                    socket.broadcast.emit('allMessage', message);
                    break;
                // 全体消息
                case ChatChannelsMessageTypeEnum.allMessage:
                    const allMessage = {
                        type: 'allMessage',
                        from: message.from,
                        content: message.content
                    };
                    socket.broadcast.emit('allMessage', allMessage);
                    break;
                // 系统消息
                case ChatChannelsMessageTypeEnum.systemMessage:
                    break;
            }*/
            // 接收消息成功回调
            callback({
                status: ChatChannelsCallbackEnum.ok
            });
        } catch (e) {
            callback({
                status: ChatChannelsCallbackEnum.error
            });
        }
        // 转发给客户端信息
        // socket.emit('onmessage', 'onmessage消息收到');
    });

    /**
     * 发送给所有人
     */
    // socket.broadcast.emit('system', {some: 'data'});

    /**
     * 连接断开
     */
    socket.on('disconnect', () => {
        console.log('连接断开', socket.id);
        // 删除断开的房间用户
        const {userName, id, channelId} = new ChatChannelRoom(roomsList).leaveRoom(socket.id);
        // console.log('连接断开', userName, channelId);
        const parseMessage = {
            systemStates: SystemMessagesEnum.left,
            userName,
            id,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        };
        socket.to(channelId).emit(ChatChannelsMessageTypeEnum.systemMessage, parseMessage);
    });
    /**
     * 连接关闭
     */
    socket.on('close', (evt) => {
        // console.log('roomsList', roomsList);
        // leave room
        // new ChatChannelRoom(roomsList).leaveRoom(roomID);
        console.log('连接关闭', evt);
    });
    /**
     * 连接错误
     */
    socket.on('connect_error', (evt) => {
        // console.log('roomsList', roomsList);
        // leave room
        // new ChatChannelRoom(roomsList).leaveRoom(roomID);
        console.log('连接错误', evt);
    });
});


/**
 * 保存聊天消息
 * @constructor
 */
const saveMessage = async (msg: ChatMessagesInterface) => {
    try {
        const massage = {
            ...msg,
            // 附件转换为字符串
            attachments: msg.attachments ? JSON.stringify(msg.attachments) : null,
            // 作者转换为字符串
            author: JSON.stringify(msg.author),
            timestamp: msg.timestamp = new Date().toISOString()
        };
        await ChatDatabase.create(massage);
    } catch (error) {
        console.log('保存失败');
    }
};

/**
 * 通知房间更新用户信息
 * @param id 用户id
 * @param avatar 用户头像
 * @param userName 昵称
 * @param remarks 备注
 */
const updateUserInfo = async (id: string, avatar: string, userName?: string, remarks?: string) => {
    try {
        const parseMessage: any = {
            systemStates: SystemMessagesEnum.update,
            id,
            avatar
        };
        if (userName && remarks) {
            parseMessage.userName = userName;
            parseMessage.remarks = remarks;
        }
        io.to('8808').emit(ChatChannelsMessageTypeEnum.systemMessage, parseMessage);
    } catch (error) {
        console.log('更新用户信息失败');
    }
};

export {SocketServer, io, updateUserInfo};
