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
        console.log(reaction);
        if (!reaction) {
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
}
