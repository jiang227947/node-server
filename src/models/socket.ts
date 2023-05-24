import http from 'http';
import express from 'express';
import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import {decipher} from '../util/encipher';
import {
    ChatChannelRoomInterface,
    PrivateChatChannelsInterface, RoomChatChannelsInterface
} from '../interface/chat-channels';
import {
    ChatChannelsCallbackEnum,
    ChatChannelsMessageTypeEnum
} from '../enum/chat-channels.enum';
import {ReservedOrUserListener} from 'socket.io/dist/typed-events';
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
    // 发送新的ping packet（25000）之前有多少ms
    pingInterval: 30000,
    // 有多少ms没有传递消息则考虑连接close（60000）
    pingTimeout: 5000,
});
// 用于保存有关创建的每个房间 ID 和该房间中的用户数量的信息
const roomsList: ChatChannelRoomInterface[] = [];

/**
 * 连接
 */
io.on('connection', async (socket) => {
    const token: string | any = socket.handshake.headers.token;
    const userInfo = decipher(token);
    // console.log('socket.handshake', socket.handshake);
    let decode: { name: string, id: number, iat: number, exp: number };
    if (userInfo) {
        decode = jwt.decode(userInfo) as { name: string, id: number, iat: number, exp: number };
        console.log('socket连接成功!', decode.name, socket.id);
        // join a room
        // socket.join('some room id');

        // socket.to('some room id').emit('some event');
        const room: ChatChannelRoomInterface = await new ChatChannelRoom(roomsList).joinRoom(`公共聊天室`, decode.id, decode.name, socket.id);
        console.log('房间列表', room);
        // 转发给客户端房间信息
        socket.emit(ChatChannelsMessageTypeEnum.systemMessage, {type: 'roomInfo', ...room});
        // 添加room
        socket.join(room.roomId);
        // 系统消息 发送给room房间
        socket.to(room.roomId).emit(ChatChannelsMessageTypeEnum.systemMessage, `用户${decode.name}进入房间`);
    }

    /**
     * 接收单个消息
     * privateChatChannelsMessage 为规定好的事件名称
     */
    socket.on(ChatChannelsMessageTypeEnum.generalMessage, (parseMessage: PrivateChatChannelsInterface, callback) => {
        try {
            console.log('单个消息', parseMessage);
            // 一般消息
            const message = {
                type: ChatChannelsMessageTypeEnum.generalMessage,
                from: parseMessage.from,
                content: parseMessage.content
            };
            // 发送给私人
            socket.to(parseMessage.to.socketId).emit(ChatChannelsMessageTypeEnum.generalMessage, message);
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
    socket.on(ChatChannelsMessageTypeEnum.roomMessage, (parseMessage: RoomChatChannelsInterface, callback) => {
        try {
            console.log('房间消息', parseMessage);
            // 房间消息
            const message = {
                type: 'message',
                from: parseMessage.from,
                content: parseMessage.content
            };
            // 发送给room房间
            socket.to(parseMessage.to.roomId).emit(ChatChannelsMessageTypeEnum.roomMessage, message);
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
                case ChatChannelsMessageTypeEnum.generalMessage:
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
        console.log(message);
        console.log(socket.rooms);
        try {
            // 接收消息成功回调
            callback({
                status: ChatChannelsCallbackEnum.ok
            });
            switch (message.type) {
                // 一般消息
                case ChatChannelsMessageTypeEnum.generalMessage:
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
