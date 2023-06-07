import {Request, Response} from 'express';
import {ResultListPage} from '../models/class/ResultList';
import ChatDatabase from '../models/chat.models';

/**
 * 分页查询聊天记录
 * @param req
 * @param res
 */
const queryChatMessage = async (req: Request, res: Response) => {
    const {pageNum, pageSize} = req.body;
    const begin = (pageNum - 1) * pageSize;
    // 查询所有文件的数量
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
    const data = new ResultListPage(
        200,
        '查询成功',
        chatList,
        pageNum,
        pageSize,
        chatCount,
        totalPage
    );
    res.status(200).json(data);
};

export {queryChatMessage};
