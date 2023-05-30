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
    let userName: string = '';
    if (userInfo) {
        // 用户进入房间信息
        const decode = jwt.decode(userInfo) as { name: string, id: number, iat: number, exp: number };
        userName = decode.name;
        console.log('socket连接成功!', decode.name, socket.id);
        // join a room
        // socket.join('some room id');

        // socket.to('some room id').emit('some event');
        const room: ChatChannelRoomInterface = await new ChatChannelRoom(roomsList).joinRoom(`公共聊天室`, decode.id, userName, socket.id);
        console.log('房间列表', room);
        // 转发给客户端房间信息
        socket.emit(ChatChannelsMessageTypeEnum.systemMessage, {systemStates: SystemMessagesEnum.roomInfo, ...room});
        // 添加room
        socket.join(room.roomId + '');
        // 系统消息 发送给room房间
        socket.to(room.roomId + '').emit(ChatChannelsMessageTypeEnum.systemMessage, {systemStates: SystemMessagesEnum.join, userName});
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
            socket.to(CHANNEL_ID + '').emit(ChatChannelsMessageTypeEnum.publicMessage, parseMessage);
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
        console.log('接收系统消息', socket.rooms);
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
    socket.on('disconnect', (evt) => {
        // console.log('roomsList', roomsList);
        // leave room
        // new ChatChannelRoom(roomsList).leaveRoom(roomID);
        console.log('连接断开', evt);
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
