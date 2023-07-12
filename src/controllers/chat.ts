import {Request, Response} from 'express';
import {ResultListPage} from '../models/class/ResultList';
import ChatDatabase from '../models/chat.models';
import {CommonUtil} from '../util/common-util';
import {ResultCodeEnum} from '../enum/http.enum';
import multer from 'multer';
import fs from 'fs';
import ChatChannelDatabase from '../models/chat-channel.models';
import {Op} from 'sequelize';
import {v4 as uuidv4} from 'uuid';
import User from '../models/user.models';

/**
 * 分页查询聊天记录
 * @param req
 * @param res
 */
const queryChatMessage = async (req: Request, res: Response) => {
    try {
        const {channelId, pageNum, pageSize} = req.body;
        // const begin = (pageNum - 1) * pageSize;
        // console.log('begin', begin);
        // 查询所有聊天消息的数量
        const chatCount: any = await ChatDatabase.count({where: {channelId}});
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
            where: {
                channelId
            },
            offset: _offset,
            limit: _limit
        });
        // 格式化信息
        const msgList = chatList.map(item => {
            return {
                ...item.dataValues,
                author: JSON.parse(item.dataValues.author as string),
                reaction: JSON.parse(item.dataValues.reaction as string),
                messageReference: JSON.parse(item.dataValues.messageReference as string),
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
        console.log('添加反应表情失败', e);
        // 返回结构
        res.status(400).json({
            code: ResultCodeEnum.fail,
            msg: `添加反应表情失败`,
        });
    }
};

// 头像路径
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
 * @param req
 * @param res
 */
const uploadChannelAvatar = async (req: Request, res: Response) => {
    try {
        if (req.file) {
            const {id} = req.body;
            // 判断是新增还是修改
            if (id) {
                const channel: any = await ChatChannelDatabase.findOne({where: {id}});
                // 判断是否存在头像
                if (fs.existsSync(channel.avatar)) {
                    fs.unlinkSync(channel.avatar); // 删除旧头像
                }
                // 更新新头像
                await channel.update({avatar: `${path}/${req.file?.originalname}`}, {where: {id}});
            } else {
                // 返回头像路径
                res.json({
                    code: ResultCodeEnum.success,
                    msg: `上传成功`,
                    data: `${req.file?.destination}/${req.file?.originalname}`, // 复制URL链接直接浏览器可以访问
                });
            }
        } else {
            res.json({
                code: ResultCodeEnum.fail,
                msg: `上传失败`,
            });
        }
    } catch (e) {
        res.status(400).json({
            code: ResultCodeEnum.fail,
            msg: `上传失败`,
        });
    }
};

/**
 * 创建频道
 * @param req
 * @param res
 */
const createChannel = async (req: Request, res: Response) => {
    try {
        const {avatar, channelName, tags, admins, announcement, isPrivacy, password, remark} = req.body;
        const userId = req.header('userId');
        const channel: any = await ChatChannelDatabase.findAll({
            where: {
                admins: {
                    // 带上like查询条件
                    [Op.like]: `%${userId}%`
                },
            },
        });
        // 判断该用户的频道数量是否超过三个
        if (channel.length >= 3) {
            // 返回结构
            res.json({
                code: ResultCodeEnum.fail,
                msg: `最多创建三个频道`,
            });
            return;
        }
        const isChannelName = await ChatChannelDatabase.findOne(({where: {channelName}}));
        // 判断是否重名
        if (isChannelName) {
            // 返回结构
            res.json({
                code: ResultCodeEnum.fail,
                msg: `频道名称已存在`,
            });
            return;
        }
        // 获取用户信息
        const user: any = await User.findOne({where: {id: userId}});
        const userInfo = {
            id: user.id,
            userName: user.username,
            avatar: user.avatar,
            role: user.role,
            roleName: user.roleName,
            remarks: user.remarks
        };
        // 创建人存入频道
        const personnel = JSON.stringify([userInfo]);
        // 生成uuid
        const uuid = uuidv4();
        // 创建数据
        await ChatChannelDatabase.create({
            channelId: uuid,
            avatar,
            channelName,
            tags,
            admins,
            personnel,
            announcement,
            isPrivacy,
            password,
            remark
        });
        // 返回结构
        res.json({
            code: ResultCodeEnum.success,
            msg: `创建频道成功`,
            data: uuid
        });
    } catch (e) {
        // 返回结构
        res.json({
            code: ResultCodeEnum.fail,
            msg: `创建频道失败`,
        });
    }
};

/**
 * 查询频道
 * @param req
 * @param res
 */
const queryChannel = async (req: Request, res: Response) => {
    const {id} = req.query;
    const channel: any = await ChatChannelDatabase.findAll({
        where: {
            personnel: {
                // 带上like查询条件
                [Op.like]: `%"id":${id}%`
            },
        },
    });
    // 更新数据用的
    /*const channelAll: any = await ChatChannelDatabase.findOne({where: {channelId: '8808'}});
    let channelAllPersonnel: ChatChannelRoomUserInterface[] = JSON.parse(channelAll.personnel);
    for (let i = 0; i < channelAllPersonnel.length; i++) {
        const user: any = await User.findOne({where: {id: channelAllPersonnel[i].id}});
        channelAllPersonnel[i].name = user.name;
        channelAllPersonnel[i].createdAt = user.createdAt;
    }
    console.log(channelAllPersonnel);
    channelAll.update({personnel: JSON.stringify(channelAllPersonnel)}, {where: {channelId: '8808'}});*/
    // 格式转换
    const result = channel.map((item: any) => {
        return {
            ...item.dataValues,
            // 管理员格式转换
            admins: JSON.parse(item.dataValues.admins),
            // 频道人员格式转换
            personnel: JSON.parse(item.dataValues.personnel),
            // 密码删除
            password: null
        };
    });
    // 返回结构
    res.json({
        code: ResultCodeEnum.success,
        msg: '查询成功',
        data: result
    });
    try {
    } catch (e) {
        // 返回结构
        res.json({
            code: ResultCodeEnum.fail,
            msg: `查询失败`,
        });
    }
};

/**
 * 删除频道
 * @param req
 * @param res
 */
const deleteChannel = async (req: Request, res: Response) => {
    try {
        const {channelId} = req.body;
        const channel: any = await ChatChannelDatabase.findOne({where: {channelId}});
        if (!channel) {
            return res.json({
                code: ResultCodeEnum.fail,
                msg: `频道不存在`,
            });
        }
        // 删除频道
        await channel.destroy();
        // 删除频道聊天记录
        await ChatDatabase.destroy({where: {channelId}});
        res.json({
            code: ResultCodeEnum.success,
            msg: `频道删除成功`,
        });
    } catch (e) {
        res.json({
            code: ResultCodeEnum.fail,
            msg: `频道删除失败`,
        });
    }
};

/**
 * 加入频道
 * @param req
 * @param res
 */
const joinChannel = async (req: Request, res: Response) => {
    try {
        const {channelId, password} = req.body;
        const channel: any = await ChatChannelDatabase.findOne({where: {channelId}});
        if (!channel) {
            return res.json({
                code: ResultCodeEnum.fail,
                msg: `频道不存在`,
            });
        }
        // 用户ID
        const userId = req.header('userId') as string;
        // 频道人员
        const channelPersonnel: any[] = JSON.parse(channel.personnel);
        // console.log('频道人员', channelPersonnel);
        const isJoin = channelPersonnel.find(item => item.id === +userId);
        // 验证是否已经加入频道
        if (isJoin) {
            return res.json({
                code: ResultCodeEnum.fail,
                msg: `你已经加入该频道`,
            });
        }
        // 校验密码
        if (channel.isPrivacy === 1 && channel.password !== password) {
            return res.json({
                code: ResultCodeEnum.fail,
                msg: `密码错误`,
            });
        }
        // 获取用户信息
        const user: any = await User.findOne({where: {id: userId}});
        const userInfo = {
            id: user.id,
            userName: user.username,
            avatar: user.avatar,
            role: user.role,
            roleName: user.roleName,
            remarks: user.remarks,
            lastOnline: new Date().getTime()
        };
        const personnel = [...channelPersonnel, userInfo];
        // 更新频道用户
        await channel.update(
            {
                personnel: JSON.stringify(personnel),
            },
            {
                where: {channelId},
            }
        );
        res.json({
            code: ResultCodeEnum.success,
            msg: `频道加入成功`,
        });
    } catch (e) {
        res.json({
            code: ResultCodeEnum.fail,
            msg: `频道加入失败`,
        });
    }
};


/**
 * 附件上传
 * @param req
 * @param res
 */
// 附件路径
const attachmentsPath = '/data/channel/attachments';
const attachmentsStorage = multer.diskStorage({
    // 文件上传的地址
    destination: (req, file, callback) => {
        //判断目录是否存在，没有则创建
        if (!fs.existsSync(attachmentsPath)) {
            fs.mkdirSync(attachmentsPath, {
                recursive: true,
            });
        }
        callback(null, attachmentsPath);
    },
    // 文件名称
    filename: (req, file, callback) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        callback(null, file.originalname);
    },
});
const uploadAttachmentsMulter = multer({storage: attachmentsStorage});
const attachmentsUpload = async (req: Request, res: Response) => {
    try {
        if (req.file) {
            // 返回附件路径
            res.json({
                code: ResultCodeEnum.success,
                msg: `上传成功`,
                data: `${req.file?.destination}/${req.file?.originalname}`, // 复制URL链接直接浏览器可以访问
            });
        } else {
            res.json({
                code: ResultCodeEnum.fail,
                msg: `上传失败`,
            });
        }
    } catch (e) {
        res.status(400).json({
            code: ResultCodeEnum.fail,
            msg: `上传失败`,
        });
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
        // const API2D_KEY = 'fk186791-RToqs3gWFqVMVivKBFd2fdJlU0o9rUsc';
        // const API2D_TOKEN = '1148|sPsDncYL2iY0yNnrpqaB34dUvUIHKsqQGWaH4woy';
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
    uploadChannelAvatar,
    createChannel,
    queryChannel,
    deleteChannel,
    joinChannel,
    uploadAttachmentsMulter,
    attachmentsUpload
};
