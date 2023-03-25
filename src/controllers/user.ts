import {Request, Response} from 'express';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import {encipher} from '../util/encipher';
import {ResultListPage} from "../models/class/ResultList";
import {Token} from "../models/class/token";

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
    if (userRepeat) {
        return res.json({
            code: -1,
            msg: `用户名已存在`,
        });
    }

    try {
        // 成功创建用户
        await User.create({
            name,
            username,
            password: aesPassword,
            role,
            roleName
        });
        res.json({
            code: 200,
            msg: `用户 ${username} 创建成功`,
        });
    } catch (error) {
        res.status(400).json({
            code: -1,
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
            code: -1,
            msg: `用户不存在`,
        });
    }
    // 验证密码是否正确
    // const passwordValid = await bcrypt.compare(password, user.password);
    const aesPasswordValid = encipher(password);

    if (aesPasswordValid !== user.password) {
        return res.json({
            code: -1,
            msg: `密码错误`,
        });
    }
    // 生成token令牌 登录成功
    const token = jwt.sign({name: username},
        // 密钥
        process.env.SECRET_KEY || 'jzy2023',
        // 过期时间 默认6小时
        {
            expiresIn: 21600000,
        }
    );
    // 加密jwt
    const aesToken = encipher(token);
    const tokenInfo = new Token('authorization', aesToken, user.id, 21600000);
    res.status(200).json({
        code: 200,
        msg: '登录成功',
        data: {
            id: user.id,    // id
            userName: user.username,    // 登录名
            name: user.name,    // 昵称
            role: user.role, // 密码
            roleName: user.roleName,    // 角色
            lastLoginTime: user.lastLoginTime,    // 角色名称
            token: tokenInfo
        }
    });
    // 更新登录时间
    await user.update(
        {
            lastLoginTime: new Date().getTime()
        }, {
            where: {id: user.id}
        });
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
                lastLoginTime: item.lastLoginTime
            }
        });
    });
    const data = new ResultListPage(
        200,
        '查询成功',
        allUserList,
        pageNum,
        pageSize,
        userCount,
        totalPage
    );
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
            code: -1,
            msg: `用户不存在`,
        });
    }
    try {
        // 成功删除用户
        await user.destroy();
        res.json({
            code: 200,
            msg: `用户 ${user.name} 删除成功`,
        });
    } catch (error) {
        res.status(400).json({
            code: -1,
            msg: `用户删除失败`,
            error,
        });
    }
};
export {newUser, loginUser, allUser, deleteUser};
