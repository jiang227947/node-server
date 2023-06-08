/**
 * 聊天频道房间类
 */
import {ChatChannelRoomInterface} from '../../interface/chat-channels';
import {v4 as uuidv4} from 'uuid';

// 每个房间允许的最大人数
const ROOM_MAX_CAPACITY = 10;

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
     * @param content 最近的聊天消息
     */
    joinRoom(roomName: string, user: any, socketId: string, content: string): Promise<ChatChannelRoomInterface> {
        return new Promise((resolve) => {
            for (let i = 0; i < this.roomsState.length; i++) {
                // 判断该用户是否已经在房间内
                const findIndex = this.roomsState[i].users.findIndex(item => item.id === user.id);
                if (findIndex >= 0) {
                    // 重新赋值socketId
                    this.roomsState[i].users[findIndex].socketId = socketId;
                    // 返回加入的房间
                    return resolve(this.roomsState[i]);
                } else {
                    // 新加入没满的房间
                    if (this.roomsState[i].users.length < ROOM_MAX_CAPACITY) {
                        this.roomsState[i].users.push({
                            socketId,
                            id: user.id,
                            userName: user.username,
                            avatar: user.avatar, // 头像
                            remarks: user.remarks, // 备注
                            role: user.role,
                            roleName: user.roleName
                        });
                        // 返回加入的房间
                        return resolve(this.roomsState[i]);
                    }
                }
            }
            // 新增房间
            // const roomId = uuidv4();
            const roomId: string = '8808';
            console.log('新增房间', {id: user.id, userName: user.username});
            const room: ChatChannelRoomInterface = {
                roomId,
                roomName: `${roomName}${this.roomsState.length + 1}`,
                users: [{
                    socketId,
                    id: user.id,
                    userName: user.username,
                    avatar: user.avatar, // 头像
                    remarks: user.remarks, // 备注
                    role: user.role,
                    roleName: user.roleName
                }],
                messages: content
            };
            // 加入房间
            this.roomsState.push(room);
            // 返回加入的房间
            return resolve(room);
        });
    }

    /**
     * 减少特定房间中的用户
     */
    leaveRoom(roomID: number, socketId: string): { userName: string, id: number } {
        let {userName, id} = {userName: '', id: 0};
        this.roomsState = this.roomsState.filter((room: ChatChannelRoomInterface) => {
            if (+room.roomId === roomID) {
                // 查询用户下标
                const findIndex = room.users.findIndex(user => user.socketId === socketId);
                if (findIndex >= 0) {
                    userName = room.users[findIndex].userName;
                    id = room.users[findIndex].id;
                    // 删除
                    room.users.splice(findIndex, 1);
                } else {
                    return false;
                }
            }
            return true;
        });
        return {userName, id};
    }
}
