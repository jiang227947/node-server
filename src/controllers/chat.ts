import {Request, Response} from 'express';
import {ResultListPage} from '../models/class/ResultList';
import ChatDatabase from '../models/chat.models';
import {CommonUtil} from '../util/common-util';
import {AxiosResponse} from 'axios';
import {GPTMessageInterface} from '../interface/chat-channels';
import {ResultCodeEnum} from "../enum/http.enum";
import multer from "multer";
import fs from "fs";
import User from "../models/user.models";
import ChatChannelDatabase from "../models/chat-channel.models";

/**
 * 分页查询聊天记录
 * @param req
 * @param res
 */
const queryChatMessage = async (req: Request, res: Response) => {
    try {
        const {pageNum, pageSize} = req.body;
        const begin = (pageNum - 1) * pageSize;
        // console.log('begin', begin);
        // 查询所有聊天消息的数量
        const chatCount = await ChatDatabase.count();
        // 计算预计拿到的数量和总数相差的值
        const offset: number = chatCount - pageNum * pageSize;
        // console.log('offset', offset);
        // console.log('chatCount', chatCount);
        let totalPage: number;
        // 获取总分页数量
        if (pageSize === 0) {
            totalPage = 0;
        } else {
            totalPage = Math.trunc(chatCount % pageSize === 0 ? chatCount / pageSize : chatCount / pageSize + 1);
        }
        // 跳过实例
        let _offset: number;
        // 获取个实例
        let _limit: number;
        // 数量是正数则正常取值
        if (offset >= 0) {
            _offset = offset;
            _limit = pageSize;
        } else {
            // 数量是负数说明剩余的分页数量不够想拿到的值
            _offset = 0;
            _limit = pageSize - Math.abs(offset);
        }
        // 跳过offset个实例,然后获取limit个实例
        // console.log(`跳过${_offset}个实例,然后获取${_limit}个实例`);
        const chatList = await ChatDatabase.findAll({
            offset: _offset,
            limit: _limit
        });
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
        res.status(200).json({
            code: ResultCodeEnum.fail,
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
                code: ResultCodeEnum.success,
                msg: '添加成功',
                data: null,
            });
        } else {
            // 返回结构
            return res.json({
                code: ResultCodeEnum.fail,
                msg: `消息不存在`,
            });
        }
    } catch (e) {
        console.log(e);
        console.log('添加反应表情失败');
        // 返回结构
        res.status(400).json({
            code: ResultCodeEnum.fail,
            msg: `添加反应表情失败`,
        });
    }
};

// 路径
const path = '/data/avatar/channel';
const storage = multer.diskStorage({
    // 文件上传的地址
    destination: (req, file, callback) => {
        //判断目录是否存在，没有则创建
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, {
                recursive: true,
            });
        }
        callback(null, path);
    },
    // 文件名称
    filename: (req, file, callback) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        callback(null, file.originalname);
    },
});
const uploadChannelAvatarMulter = multer({storage: storage});
/**
 * 上传频道头像
 */
const uploadChannelAvatar = async (req: Request, res: Response) => {
    try {
        if (req.file) {
            const {id} = req.body;
            // 判断是新增还是修改
            if (id) {
                const channel: any = await ChatChannelDatabase.findOne({where: {id}});
                fs.unlinkSync(channel.avatar); // 删除旧头像
                // 更新新头像
                await channel.update({avatar: `${path}/${req.file?.originalname}`}, {where: {id}});
            } else {
                // 保存新头像
                res.json({
                    code: ResultCodeEnum.success,
                    msg: `上传成功`,
                    data: `${req.file?.destination}/${req.file?.originalname}`, // 复制URL链接直接浏览器可以访问
                });
            }
        } else {
            res.status(400).json({
                code: ResultCodeEnum.fail,
                msg: `上传失败`,
            });
        }
    } catch (e) {

    }
};


/**
 * completions
 * https://stream.api2d.net/v1/chat/completions
 */
const completions = async (req: Request, res: Response) => {
    const axios = require('axios').default;
    axios.defaults.timeout = 30000;
    try {
        // token值
        const API2D_KEY = 'fk186791-RToqs3gWFqVMVivKBFd2fdJlU0o9rUsc';
        const API2D_TOKEN = '1148|sPsDncYL2iY0yNnrpqaB34dUvUIHKsqQGWaH4woy';
        const messagesParam: {
            model: string,
            messages: {
                role: string, // 模型身份
                content: string // 模型返回给你的信息
            }[]
        } = req.body.messagesParam;
        console.log('messagesParam', messagesParam);
        // 查询余额需要 'Accept', 'application/json' https://api.api2d.com/user/profile
        /*axios.post(`https://stream.api2d.net/v1/chat/completions`, {
            data: messagesParam,
            headers: {
                skip: 'true',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API2D_KEY}`
            }
        }).then((res: AxiosResponse<GPTMessageInterface>) => {
        }).catch(() => {
        });*/
        // 返回结构
        res.json({
            code: ResultCodeEnum.success,
            msg: `请求成功`,
        });
    } catch (e) {
        // 返回结构
        res.status(400).json({
            code: ResultCodeEnum.fail,
            msg: `请求失败`,
        });
    }
};


export {
    queryChatMessage,
    addReaction,
    completions,
    uploadChannelAvatarMulter,
    uploadChannelAvatar
};
