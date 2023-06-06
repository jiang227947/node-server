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
import User from './user';
import {ChatChannelRoom} from './class/ChatChannelRoom';

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
        maxDisconnectionDuration: 1 * 60 * 1000,
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
// 用于保存聊天记录信息 每50条保存一次
const chatHistoryInformation = [];
// 最多存储50条记录
const MAX_RECORD = 50;
// 默认频道为8808
const CHANNEL_ID: number = 8808;
// todo：频道后面改成可以自己创建群组
/**
 * 连接
 */
io.on('connection', async (socket) => {
    console.log('socket.recovered', socket.recovered);
    if (socket.recovered) {
        // recovery was successful: socket.id, socket.rooms and socket.data were restored
    } else {
        // new or unrecoverable session
    }
    // token
    const token: string | any = socket.handshake.headers.token;
    // 解密token
    const userInfo = decipher(token);
    if (userInfo) {
        // 用户进入房间信息
        const decode = jwt.decode(userInfo) as { name: string, id: number, iat: number, exp: number };
        const user: any = await User.findOne({where: {id: decode.id}});
        console.log('socket连接成功!', decode.name, socket.id);
        const room: ChatChannelRoomInterface = await new ChatChannelRoom(roomsList).joinRoom(`公共聊天室`, user, socket.id);
        console.log('房间列表', room);
        // 转发给客户端房间信息
        socket.emit(ChatChannelsMessageTypeEnum.systemMessage, {systemStates: SystemMessagesEnum.roomInfo, ...room});
        // 添加room
        socket.join(room.roomId + '');
        // 系统消息 发送给room房间
        socket.to(room.roomId + '').emit(ChatChannelsMessageTypeEnum.systemMessage, {
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
            socket.to(parseMessage.channel_id).emit(ChatChannelsMessageTypeEnum.publicMessage, parseMessage);
            chatHistoryInformation.push(parseMessage);
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
            socket.to(parseMessage.channel_id).emit(ChatChannelsMessageTypeEnum.roomMessage, parseMessage);
            chatHistoryInformation.push(parseMessage);
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
        console.log(message);
        console.log(socket.rooms);
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
     * 接收所有消息
     * onallmessage 为规定好的事件名称
     */
    socket.on('onallmessage', (msg) => {
        // console.log(msg);
        // 转发给全部客户端信息，所有客户端都可以收到
        socket.emit('onallmessage', '广播 : 这是一条广播消息！');
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
        const {userName, id} = new ChatChannelRoom(roomsList).leaveRoom(CHANNEL_ID, socket.id);
        // console.log('roomsList', roomsList[0]);
        const parseMessage = {
            systemStates: SystemMessagesEnum.left,
            userName,
            id,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        };
        chatHistoryInformation.push(parseMessage);
        socket.to(CHANNEL_ID + '').emit(ChatChannelsMessageTypeEnum.systemMessage, parseMessage);
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

export {SocketServer, io};
