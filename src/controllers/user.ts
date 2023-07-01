import {Request, Response} from 'express';
import User from '../models/user.models';
import jwt from 'jsonwebtoken';
import {encipher} from '../util/encipher';
import {ResultListPage} from '../models/class/ResultList';
import {Token} from '../models/class/token';
import multer from 'multer';
import fs from 'fs';
import {ResultCodeEnum} from '../enum/http.enum';
import ChatChannelDatabase from '../models/chat-channel.models';
import {updateUserInfo} from './socket';
import {CommonUtil} from '../util/common-util';
import MailService, {verifyEmail} from '../service/mailService';
import {Redis} from "../db/redis";
import {UserRoleEnum} from "../enum/user.enum";

/**
 * 创建用户
 * @param req 参数
 * @param res 返回
 */
const register = async (req: Request, res: Response) => {
    try {
        const {name, userName, email, code, password} = req.body;
        // 加密密码
        // const hashPassword = await bcrypt.hash(password, 12);
        const aesPassword = encipher(password);

        // 验证是否存在相同用户
        const userRepeat = await User.findOne({where: {name}});
        if (userRepeat) {
            return res.json({
                code: ResultCodeEnum.fail,
                msg: `用户名已存在`,
            });
        }
        const redis = new Redis();
        // 获取存的email验证码
        const redisEmail = await redis.get(email);
        if (!redisEmail) {
            return res.json({
                code: ResultCodeEnum.fail,
                msg: `验证码已过期`,
            });
        }
        const verifyCode = JSON.parse(redisEmail).verifyCode;
        // 判断是否有效
        if (verifyCode && verifyCode !== code) {
            return res.json({
                code: ResultCodeEnum.fail,
                msg: `验证码错误`,
            });
        }
        // 成功创建用户
        const user: any = await User.create({
            name,
            username: userName,
            password: aesPassword,
            email,
            role: UserRoleEnum.general,
            roleName: '普通用户',
        });
        const channel: any = await ChatChannelDatabase.findOne({where: {channelId: '8808'}});
        // 添加至公共频道
        CommonUtil.updateChatChannel(channel, user, 'add').then((personnel: string | boolean) => {
            if (personnel) channel.update({personnel}, {where: {channelId: '8808'}});
        });
        res.json({
            code: ResultCodeEnum.success,
            msg: `用户 ${userName} 创建成功`,
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            code: ResultCodeEnum.fail,
            msg: `用户创建失败`,
            error,
        });
    }
};

/**
 * 发送邮件
 * @param req
 * @param res
 */
const sendEmail = async (req: Request, res: Response) => {
    try {
        // 实例化
        const mailService = MailService.getInstance();
        const transporter = mailService.getTransporter();
        if (!transporter) {
            await mailService.createConnection();
        }
        let code: string = '';
        // 创建随机验证码
        const generateOtp = (len: number) => {
            const digits = '0123456789';
            for (let i = 0; i < len; i++) {
                code += digits[Math.floor(Math.random() * 10)];
            }
            return code;
        };
        // 6位数验证码
        const verifyCode: string = generateOtp(6);
        // 返回邮件内容
        const emailTemplate = verifyEmail(verifyCode);
        // 获取收件箱
        const toEmail = req.body.email;
        const userLst: any = await User.findAll();
        for (let i = 0; i < userLst.length; i++) {
            if (userLst[i].email === toEmail) {
                return res.json({
                    code: ResultCodeEnum.fail,
                    msg: `该邮箱已经被注册`,
                });
            }
        }
        const redis = new Redis();
        // 设置验证码 过期时间10分钟
        await redis.set(toEmail, {toEmail, verifyCode}, 600);
        // 发送邮件
        await mailService.sendMail(toEmail, {
            from: process.env.SMTP_USERNAME,
            to: toEmail,
            subject: '[EVZIYI] 验证码 Verification',
            html: emailTemplate.html,
        });
        res.json({
            code: ResultCodeEnum.success,
            msg: `邮件发送成功`,
        });
    } catch (e) {
        console.log(e);
        res.json({
            code: ResultCodeEnum.fail,
            msg: `邮件发送失败`,
        });
    }
};

/**
 * 用户登录
 * @param req 参数
 * @param res 返回
 */
const loginUser = async (req: Request, res: Response) => {
    const {userName, password} = req.body;
    /**
     * 1. 验证是否存在该用户
     * 2. 验证密码是否正确
     * 3. 生成令牌 登录成功
     */
    const user: any = await User.findOne({where: {name: userName}});
    if (!user) {
        return res.json({
            code: ResultCodeEnum.fail,
            msg: `用户不存在`,
        });
    }
    // 验证密码是否正确
    // const passwordValid = await bcrypt.compare(password, user.password);
    const aesPasswordValid = encipher(password);
    if (aesPasswordValid !== user.password) {
        return res.json({
            code: ResultCodeEnum.fail,
            msg: `密码错误`,
        });
    }
    // 生成token令牌 登录成功
    const token = jwt.sign(
        {name: user.username, id: user.id},
        // 密钥
        process.env.SECRET_KEY || 'uC+0Nnljo9',
        // 过期时间 默认6小时
        {
            expiresIn: 21600000,
        }
    );
    // 加密jwt
    const aesToken: string = encipher(token);
    // 加密cookie
    // const cookie: string = encipher({
    //     userId: user.id,
    //     time: new Date().getTime(),
    // });
    const tokenInfo: Token = new Token('authorization', aesToken, user.id, 21600000);
    // 设置cookie
    // res.setHeader('Set-Cookie', cookie);
    // 返回结构
    res.status(200).json({
        code: ResultCodeEnum.success,
        msg: '登录成功',
        data: {
            id: user.id, // id
            userName: user.username, // 昵称
            name: user.name, // 登录名
            remarks: user.remarks, // 备注
            avatar: user.avatar, // 头像
            role: user.role, // 角色
            roleName: user.roleName, // 角色名称
            lastLoginTime: user.lastLoginTime, // 最后登录时间
            token: tokenInfo, // token
        },
    });
    // 更新登录时间
    await user.update(
        {
            lastLoginTime: new Date().getTime(),
        },
        {
            where: {id: user.id},
        }
    );
};

/**
 * 分页查询所有用户
 * @param req 参数
 * @param res 返回
 */
const allUser = async (req: Request, res: Response) => {
    const {pageNum, pageSize} = req.body;
    const begin = (pageNum - 1) * pageSize;
    // 查询所有用户的数量
    const userCount = await User.count();
    let totalPage: number;

    // 获取总分页数量
    if (pageSize === 0) {
        totalPage = 0;
    } else {
        totalPage = Math.trunc(userCount % pageSize === 0 ? userCount / pageSize : userCount / pageSize + 1);
    }
    // 跳过offset个实例,然后获取limit个实例
    const allUserList = await User.findAll({offset: begin, limit: pageSize}).then((users) => {
        return users.map((item: any) => {
            return {
                id: item.id,
                name: item.name,
                userName: item.username,
                role: item.role,
                roleName: item.roleName,
                lastLoginTime: item.lastLoginTime,
            };
        });
    });
    const data = new ResultListPage(200, '查询成功', allUserList, pageNum, pageSize, userCount, totalPage);
    res.status(200).json(data);
};

/**
 * 根据用户ID查询
 * @param req
 * @param res
 */
const queryUserById = async (req: Request, res: Response) => {
    try {
        const {id} = req.query;
        const user: any = await User.findOne({where: {id}});
        if (!user) {
            return res.json({
                code: ResultCodeEnum.fail,
                msg: `用户不存在`,
            });
        }
        const userInfo = {...user.dataValues, password: null};
        return res.json({
            code: ResultCodeEnum.success,
            msg: `查询成功`,
            data: userInfo
        });
    } catch (e) {
        return res.json({
            code: ResultCodeEnum.fail,
            msg: `查询失败`,
        });
    }
};

/**
 * 删除用户
 * @param req 参数
 * @param res 返回
 */
const deleteUser = async (req: Request, res: Response) => {
    try {
        const {id} = req.body;
        const user: any = await User.findOne({where: {id}});
        if (!user) {
            return res.json({
                code: ResultCodeEnum.fail,
                msg: `用户不存在`,
            });
        }
        const channel: any = await ChatChannelDatabase.findOne({where: {channelId: '8808'}});
        // 从公共频道删除
        CommonUtil.updateChatChannel(channel, user, 'del').then((personnel: string | boolean) => {
            if (personnel) channel.update({personnel}, {where: {channelId: '8808'}});
        });
        // 成功删除用户
        await user.destroy();
        res.json({
            code: ResultCodeEnum.success,
            msg: `用户 ${user.name} 删除成功`,
        });
    } catch (error) {
        res.status(400).json({
            code: ResultCodeEnum.fail,
            msg: `用户删除失败`,
            error,
        });
    }
};

/**
 * 上传头像
 * @param req
 * @param res
 */
const path = '/data/avatar';
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
// multer配置项
const uploadAvatarMulter = multer({storage: storage});
const uploadAvatar = async (req: Request, res: Response) => {
    if (req.file) {
        // 用户ID
        const id = req.header('userId') as string;
        const user: any = await User.findOne({where: {id}});
        if (!user) {
            return res.json({
                code: ResultCodeEnum.fail,
                msg: `用户不存在`,
            });
        }
        // 判断是否存在头像
        // console.log(fs.existsSync(user.avatar));
        if (user.avatar && fs.existsSync(user.avatar)) {
            fs.unlinkSync(user.avatar); // 删除旧头像
        }
        const pathUrl = `${req.file?.destination}/${req.file?.originalname}`; // 指定文件路径和文件名
        // console.log(pathUrl);
        // console.log(path + req.file?.originalname);
        // 从公共频道删除
        const channel: any = await ChatChannelDatabase.findOne({where: {channelId: '8808'}});
        const personnel: any[] = JSON.parse(channel.personnel);
        // 找到索引
        const findIndex: number | undefined = personnel.findIndex(item => item.id === +id);
        if (findIndex >= 0) {
            // 修改信息
            personnel[findIndex] = {
                ...personnel[findIndex],
                avatar: `${path}/${req.file?.originalname}`, // 头像
            };
            // 更新
            await channel.update(
                {
                    personnel: JSON.stringify(personnel),
                },
                {
                    where: {channelId: '8808'},
                }
            );
            // 通知房间更新用户信息
            await updateUserInfo(id, `${path}/${req.file?.originalname}`);
        }
        // 保存新头像
        await user.update(
            {
                avatar: `${path}/${req.file?.originalname}`,
            },
            {
                where: {id: user.id},
            }
        );
        res.json({
            code: ResultCodeEnum.success,
            msg: `修改成功`,
            data: pathUrl, // 复制URL链接直接浏览器可以访问
        });
    } else {
        res.status(400).json({
            code: ResultCodeEnum.fail,
            msg: `修改失败`,
        });
    }
};

/**
 * 修改用户信息
 * @param req 参数
 * @param res 返回
 */
const updateUser = async (req: Request, res: Response) => {
    const {id, avatar, userName, remarks, password} = req.body;
    if (!id) {
        return res.json({
            code: ResultCodeEnum.fail,
            msg: '参数错误',
        });
    }
    const user: any = await User.findOne({where: {id}});
    const userId = req.header('userId');
    if (userId != user.id) {
        return res.json({
            code: ResultCodeEnum.fail,
            msg: `参数异常`,
        });
    }
    if (!user) {
        return res.json({
            code: ResultCodeEnum.fail,
            msg: `用户不存在`,
        });
    }
    // 验证是否存在相同用户昵称
    const usernameRepeat = await User.findOne({where: {username: userName}});
    if (usernameRepeat) {
        return res.json({
            code: ResultCodeEnum.fail,
            msg: `昵称已存在`,
        });
    }
    const channel: any = await ChatChannelDatabase.findOne({where: {channelId: '8808'}});
    const personnel: any[] = JSON.parse(channel.personnel);
    // 找到索引
    const findIndex: number | undefined = personnel.findIndex(item => item.id === id);
    if (findIndex >= 0) {
        // 修改信息
        personnel[findIndex] = {
            ...personnel[findIndex],
            avatar, // 头像
            remarks, // 备注
            userName: userName, // 昵称
        };
        // 更新
        await channel.update(
            {
                personnel: JSON.stringify(personnel),
            },
            {
                where: {channelId: '8808'},
            }
        );
    }
    // 通知房间更新用户信息
    await updateUserInfo(id, avatar, userName, remarks);
    if (password) {
        const aesPassword = encipher(password);
        // 更新
        await user.update(
            {
                avatar, // 头像
                remarks, // 备注
                username: userName, // 昵称
                password: aesPassword, // 密码
            },
            {
                where: {id: user.id},
            }
        );
    } else {
        // 更新
        await user.update(
            {
                avatar, // 头像
                remarks, // 备注
                username: userName, // 昵称
            },
            {
                where: {id: user.id},
            }
        );
    }
    res.json({
        code: ResultCodeEnum.success,
        msg: '修改成功',
    });
};

export {
    register,
    loginUser,
    allUser,
    queryUserById,
    deleteUser,
    updateUser,
    uploadAvatarMulter,
    uploadAvatar,
    sendEmail
};
