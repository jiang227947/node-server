/**
 * 聊天频道房间类
 */
import {ChatChannelRoomInterface} from '../../interface/chat-channels';
import {v4 as uuidv4} from 'uuid';

// 每个房间允许的最大人数
const ROOM_MAX_CAPACITY = 3;

export class ChatChannelRoom {
    // 用于保存有关创建的每个房间 ID 和该房间中的用户数量的信息
    roomsState: ChatChannelRoomInterface[];

    constructor(roomsState: ChatChannelRoomInterface[]) {
        this.roomsState = roomsState;
    }

    /**
     * 添加房间
     * @param roomName 房间名
     * @param id 用户id
     * @param name 用户名
     * @param socketId 用户socketId
     */
    joinRoom(roomName: string, id: number, name: string, socketId: string): Promise<ChatChannelRoomInterface> {
        return new Promise((resolve) => {
            for (let i = 0; i < this.roomsState.length; i++) {
                // 判断该用户是否已经在房间内
                const findIndex = this.roomsState[i].users.findIndex(item => item.id === id);
                if (findIndex >= 0) {
                    // 重新赋值socketId
                    this.roomsState[i].users[findIndex].socketId = socketId;
                    // 返回加入的房间
                    return resolve(this.roomsState[i]);
                } else {
                    // 新加入没满的房间
                    if (this.roomsState[i].users.length < ROOM_MAX_CAPACITY) {
                        this.roomsState[i].users.push({id, socketId, name});
                        // 返回加入的房间
                        return resolve(this.roomsState[i]);
                    }
                }
            }
            // 新增房间
            const roomId = uuidv4();
            console.log('新增房间', {id, name});
            const room = {
                roomId,
                roomName: `${roomName}${this.roomsState.length + 1}`,
                users: [{id, socketId, name}],
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
    leaveRoom(roomID: string, userId: number): void {
        this.roomsState = this.roomsState.filter((room: ChatChannelRoomInterface) => {
            if (room.roomId === roomID) {
                // 查询用户下标
                const findIndex = room.users.findIndex(user => user.id === userId);
                console.log('findIndex', findIndex);
                if (findIndex >= 0) {
                    // 删除
                    room.users.splice(findIndex, 1);
                } else {
                    return false;
                }
            }
            return true;
        });
    }
}