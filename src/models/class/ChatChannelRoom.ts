/**
 * 聊天频道房间类
 */
import {ChatChannelRoomInterface, ChatChannelRoomUserInterface} from '../../interface/chat-channels';
import ChatChannelDatabase from '../chat-channel.models';

// 每个房间允许的最大人数
// const ROOM_MAX_CAPACITY = 100;

export class ChatChannelRoom {
    // 用于保存有关创建的每个房间 ID 和该房间中的用户数量的信息
    roomsState: ChatChannelRoomInterface[];

    constructor(roomsState: ChatChannelRoomInterface[]) {
        this.roomsState = roomsState;
    }

    /**
     * 添加房间
     * @param roomName 房间名
     * @param user 用户信息
     * @param socketId 用户socketId
     */
    joinRoom(roomName: string, user: any, socketId: string): Promise<ChatChannelRoomInterface> {
        return new Promise(async (resolve) => {
            const userInfo = {
                socketId,
                id: user.id,
                userName: user.username,
                avatar: user.avatar, // 头像
                remarks: user.remarks, // 备注
                role: user.role,
                roleName: user.roleName,
                lastOnline: new Date().getTime()
            };
            for (let i = 0; i < this.roomsState.length; i++) {
                // 判断该用户是否已经在房间内
                const findIndex = this.roomsState[i].users.findIndex(item => item.id === user.id);
                if (findIndex >= 0) {
                    // 重新赋值socketId
                    this.roomsState[i].users[findIndex].socketId = socketId;
                    // 返回加入的房间
                    return resolve(this.roomsState[i]);
                }
            }
            // 查询频道
            const channel: any = await ChatChannelDatabase.findOne({channelId: '8808'});
            // 频道人员
            const channelPersonnel: ChatChannelRoomUserInterface[] = JSON.parse(channel.personnel);
            // 如果上面的循环走完还没有加入频道 则进入公共闲聊频道
            if (this.roomsState.length > 0) {
                const findIndex = this.roomsState.findIndex(item => item.roomId === '8808');
                // console.log('频道人员', channelPersonnel);
                const isJoin = channelPersonnel.find(item => item.id === user.id);
                // 如果用户是第一次进入，则添加至公共频道
                if (!isJoin) {
                    // 去掉socketId
                    userInfo.socketId = '';
                    const personnel = [...channelPersonnel, userInfo];
                    // 更新频道用户
                    await ChatChannelDatabase.updateOne(
                        {channelId: '8808'},
                        {
                            personnel: JSON.stringify(personnel),
                        },
                    );
                }
                // 补充socketId
                userInfo.socketId = socketId;
                const room: ChatChannelRoomInterface = {
                    roomId: channel.channelId,
                    roomName: channel.channelName,
                    announcement: channel.announcement,
                    personnel: channelPersonnel,
                    users: [...this.roomsState[findIndex].users, userInfo]
                };
                // 加入闲聊频道
                this.roomsState[findIndex].users.push(userInfo);
                // 返回加入的房间
                return resolve(room);
            }
            // 如果没有频道则新增闲聊频道
            const room: ChatChannelRoomInterface = {
                roomId: '8808',
                roomName,
                announcement: '',
                personnel: channelPersonnel,
                users: [userInfo]
            };
            // 加入房间
            this.roomsState.push(room);
            // 返回加入的房间
            return resolve(room);
        });
    }

    /**
     * 加入指定的频道
     */
    async joinRoomToChannel(channelId: string, user: any, socketId: string): Promise<ChatChannelRoomInterface> {
        const userInfo = {
            socketId,
            id: user.id,
            userName: user.username,
            avatar: user.avatar, // 头像
            remarks: user.remarks, // 备注
            role: user.role,
            roleName: user.roleName
        };
        // 判断该频道是否已经创建
        const findIndex = this.roomsState.findIndex(item => item.roomId === channelId);
        if (findIndex >= 0) {
            // 添加该用户
            this.roomsState[findIndex].users.push(userInfo);
            // 返回加入的频道
            return this.roomsState[findIndex];
        } else {
            // 查询频道
            const channel: any = await ChatChannelDatabase.findOne({channelId});
            // 判断是否存在该频道
            if (channel) {
                const room: ChatChannelRoomInterface = {
                    roomId: channel.channelId,
                    roomName: channel.channelName,
                    announcement: channel.announcement,
                    personnel: JSON.parse(channel.personnel),
                    users: [userInfo]
                };
                // 加入频道
                this.roomsState.push(room);
                // 返回加入的频道
                return room;
            } else {
                // 不存在该频道
                return {
                    roomId: channel.channelId,
                    roomName: channel.channelName,
                    announcement: channel.announcement,
                    personnel: JSON.parse(channel.personnel),
                    users: [userInfo]
                };
            }
        }
    }

    /**
     * 减少特定房间中的用户
     */
    leaveRoom(socketId: string): { userName: string, id: number, channelId: string } {
        let {userName, id, channelId} = {userName: '', id: 0, channelId: ''};
        for (let i = 0; i < this.roomsState.length; i++) {
            // 查询到用户所在频道ID
            const findIndex = this.roomsState[i].users.findIndex(user => user.socketId === socketId);
            if (findIndex >= 0) {
                userName = this.roomsState[i].users[findIndex].userName;
                id = this.roomsState[i].users[findIndex].id;
                channelId = this.roomsState[i].roomId;
                // 删除
                this.roomsState[i].users.splice(findIndex, 1);
            }
        }
        return {userName, id, channelId};
    }
}
