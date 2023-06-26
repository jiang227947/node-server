import ChatChannelDatabase from '../models/chat-channel.models';
import {UserInterface} from '../interface/user';

/**
 * 工具类
 */
export class CommonUtil {
    /**
     * 聊天添加反应表情
     * @param reaction 反应数组
     * @param emoji 表情
     * @param userId 用户id
     */
    public static addReaction(reaction: string, emoji: string, userId: number): any[] {
        let _reaction = [];
        if (!reaction || reaction === '[]') {
            // 没有反应直接新增
            _reaction.push({
                emoji,
                count: 1,
                user: [userId]
            });
            return _reaction;
        } else {
            _reaction = JSON.parse(reaction);
            if (_reaction.length > 0) {
                const reactionList = [];
                for (let i = 0; i < _reaction.length; i++) {
                    reactionList.push(_reaction[i].emoji);
                }
                const isIndex = reactionList.indexOf(emoji);
                // 判断反应是否存在
                if (isIndex >= 0) {
                    const isId = _reaction[isIndex].user.indexOf(userId);
                    // 判断用户是否添加过反应
                    if (isId < 0) {
                        _reaction[isIndex].user.push(userId);
                        _reaction[isIndex].count++;
                    } else {
                        _reaction[isIndex].user.splice(isId, 1);
                        // 判断是否为最后一个表情
                        if (_reaction[isIndex].count === 1) {
                            _reaction.splice(isIndex, 1);
                        } else {
                            _reaction[isIndex].count--;
                        }
                    }
                } else {
                    // 没有反应直接新增
                    _reaction.push({
                        emoji,
                        count: 1,
                        user: [userId]
                    });
                }
            }
        }
        return _reaction;
    }

    /**
     * 聊天频道新增删除用户
     * @param channel 频道
     * @param userInfo 用户信息
     * @param type 操作类型 add del
     */
    public static updateChatChannel(channel: any, userInfo: UserInterface, type: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                if (type === 'add') {
                    // 添加进数组
                    const personnel = [...JSON.parse(channel.personnel), {
                        id: userInfo.id,
                        userName: userInfo.username,
                        avatar: null, // 头像
                        remarks: '', // 备注
                        role: userInfo.role,
                        roleName: userInfo.roleName,
                        lastOnline: new Date().getTime()
                    }];
                    // 返回结果
                    resolve(JSON.stringify(personnel));
                } else {
                    const personnel: any[] = JSON.parse(channel.personnel);
                    // 找到索引
                    const findIndex: number | undefined = personnel.findIndex(item => item.id === +userInfo.id);
                    if (findIndex >= 0) {
                        // 删除
                        personnel.splice(findIndex, 1);
                        // 返回结果
                        resolve(JSON.stringify(personnel));
                    } else {
                        reject(false);
                    }
                }
            } catch (e) {
                reject(false);
            }
        });
    }
}
