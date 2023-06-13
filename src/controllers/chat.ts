import {Request, Response} from 'express';
import {ResultListPage} from '../models/class/ResultList';
import ChatDatabase from '../models/chat.models';
import User from '../models/user.models';
import {CommonUtil} from '../util/common-util';
import {ChatMessagesInterface} from '../interface/chat-channels';

/**
 * 分页查询聊天记录
 * @param req
 * @param res
 */
const queryChatMessage = async (req: Request, res: Response) => {
    try {
        const {pageNum, pageSize} = req.body;
        const begin = (pageNum - 1) * pageSize;
        // 查询所有聊天消息的数量
        const chatCount = await ChatDatabase.count();
        let totalPage: number;
        // 获取总分页数量
        if (pageSize === 0) {
            totalPage = 0;
        } else {
            totalPage = Math.trunc(chatCount % pageSize === 0 ? chatCount / pageSize : chatCount / pageSize + 1);
        }
        // 跳过offset个实例,然后获取limit个实例
        const chatList = await ChatDatabase.findAll({offset: begin, limit: pageSize});
        // 格式化信息
        const msgList = chatList.map(item => {
            return {
                ...item.dataValues,
                author: JSON.parse(item.dataValues.author as string),
                reaction: JSON.parse(item.dataValues.reaction as string),
            };
        });
        const data = new ResultListPage(
            200,
            '查询成功',
            msgList,
            pageNum,
            pageSize,
            chatCount,
            totalPage
        );
        res.status(200).json(data);
    } catch (e) {
        // 返回结构
        res.status(400).json({
            code: -1,
            msg: `查询失败`,
        });
    }
};

/**
 * 添加反应表情
 * @param req.body.emoji 表情
 * @param req.body.id 消息id
 */
const addReaction = async (req: Request, res: Response) => {
    try {
        const {emoji, id, userId} = req.body;
        // 验证是否存在该消息
        const message = await ChatDatabase.findOne({where: {id}});
        if (message) {
            const reaction = CommonUtil.addReaction(message.dataValues.reaction, emoji, userId);
            console.log(reaction);
            // 更新反应表情
            await message.update(
                {
                    reaction: JSON.stringify(reaction),
                },
                {
                    where: {id},
                }
            );
            // 返回结构
            res.status(200).json({
                code: 200,
                msg: '添加成功',
                data: null,
            });
        } else {
            // 返回结构
            return res.json({
                code: -1,
                msg: `消息不存在`,
            });
        }
    } catch (e) {
        console.log(e);
        console.log('添加反应表情失败');
        // 返回结构
        res.status(400).json({
            code: -1,
            msg: `添加反应表情失败`,
        });
    }
};

export {queryChatMessage, addReaction};
