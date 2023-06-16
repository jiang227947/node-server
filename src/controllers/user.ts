import {Request, Response} from 'express';
import User from '../models/user.models';
import jwt from 'jsonwebtoken';
import {encipher} from '../util/encipher';
import {ResultListPage} from '../models/class/ResultList';
import {Token} from '../models/class/token';
import multer from 'multer';
import fs from 'fs';
import {ResultCodeEnum} from "../enum/http.enum";

/**
 * 创建用户
 * @param req 参数
 * @param res 返回
 */
const newUser = async (req: Request, res: Response) => {
    const {name, username, password, role, roleName} = req.body;
    // 加密密码
    // const hashPassword = await bcrypt.hash(password, 12);
    const aesPassword = encipher(password);

    // 验证是否存在相同用户
    const userRepeat = await User.findOne({where: {name}});
    const usernameRepeat = await User.findOne({where: {username}});
    if (userRepeat || usernameRepeat) {
        return res.json({
            code: ResultCodeEnum.fail,
            msg: `用户名或昵称已存在`,
        });
    }

    try {
        // 成功创建用户
        await User.create({
            name,
            username,
            password: aesPassword,
            role,
            roleName,
        });
        res.json({
            code: ResultCodeEnum.success,
            msg: `用户 ${username} 创建成功`,
        });
    } catch (error) {
        res.status(400).json({
            code:ResultCodeEnum.fail,
            msg: `用户创建失败`,
            error,
        });
    }
};

/**
 * 用户登录
 * @param req 参数
 * @param res 返回
 */
const loginUser = async (req: Request, res: Response) => {
    const {username, password} = req.body;
    /**
     * 1. 验证是否存在该用户
     * 2. 验证密码是否正确
     * 3. 生成令牌 登录成功
     */
    const user: any = await User.findOne({where: {name: username}});
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
    const cookie: string = encipher({
        userId: user.id,
        time: new Date().getTime(),
    });
    const tokenInfo: Token = new Token('authorization', aesToken, user.id, 21600000);
    // 设置cookie
    res.setHeader('Set-Cookie', cookie);
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
 * 删除用户
 * @param req 参数
 * @param res 返回
 */
const deleteUser = async (req: Request, res: Response) => {
    const {id} = req.body;
    const user: any = await User.findOne({where: {id}});
    if (!user) {
        return res.json({
            code: ResultCodeEnum.fail,
            msg: `用户不存在`,
        });
    }
    try {
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
        const {id} = req.body;
        const user: any = await User.findOne({where: {id}});
        // 判断是否存在头像
        // console.log(fs.existsSync(user.avatar));
        if (user.avatar && fs.existsSync(user.avatar)) {
            fs.unlinkSync(user.avatar); // 删除旧头像
        }
        const pathUrl = `${req.file?.destination}/${req.file?.originalname}`; // 指定文件路径和文件名
        // console.log(pathUrl);
        // console.log(path + req.file?.originalname);
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
    if (!user) {
        return res.json({
            code: ResultCodeEnum.fail,
            msg: `用户不存在`,
            user,
        });
    }
    const userId = req.header('userId');
    if (userId != user.id) {
        return res.json({
            code: ResultCodeEnum.fail,
            msg: `参数异常`,
            user,
        });
    }
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
    res.json({
        code: ResultCodeEnum.success,
        msg: '修改成功',
    });
};
export {
    newUser,
    loginUser,
    allUser,
    deleteUser,
    updateUser,
    uploadAvatarMulter,
    uploadAvatar
};
