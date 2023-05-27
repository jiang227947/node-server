import {Request, Response} from "express";
import {AxiosResponse} from "axios";
import {GithubAccessTokenResponse, GithubUserInterface, OauthInterface} from "../interface/user";
import User from "../models/user";
import {UserRoleEnum} from "../enum/user.enum";
import jwt from "jsonwebtoken";
import {encipher} from "../util/encipher";
import {Token} from "../models/class/token";
import {v4 as uuidv4} from 'uuid';

/**
 * 根据需要登录的环境生成uuid用来校验
 */
const uuidState = (req: Request, res: Response) => {
    try {
        // 前端传的随机数
        const {random} = req.query;
        // 生成uuid
        const uuid = uuidv4();
        // 平台分配给应用的appid
        const client_id = 102050313;
        // 使用前端传的随机数 + 服务器时间戳 + uuid + 统一加密
        const merge = `${random}/${new Date().getTime()}/${uuid}/${client_id}`;
        // 统一加密
        const aesString = encipher(merge);
        res.json({
            code: 200,
            msg: `生成成功`,
            data: aesString
        });
    } catch (error) {
        res.status(400).json({
            code: -1,
            msg: `生成失败`,
            error,
        });
    }
}

/**
 * github获取授权
 * @param req
 * @param res
 */
const githubOauth = async (req: Request, res: Response) => {
    const githubUrl = 'https://github.com/login/oauth/authorize';
    // 重定向用户授权
    res.redirect(`${githubUrl}?client_id=${process.env.CLIENT_ID}&scope=user:email`);
};

/**
 * github获取鉴权
 * @param req
 * @param res
 */
const githubAccessToken = async (req: Request, res: Response) => {
    const axios = require('axios').default;
    axios.defaults.timeout = 30000;
    try {
        let access_token = '';
        let userInfo: AxiosResponse<GithubUserInterface>;
        let userEmails: AxiosResponse<any>;
        new Promise((resolve) => {
            /**
             * 获取access_token
             * 接下来的操作都需要使用access_token
             */
            const body = {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code: req.query.code,
            };
            const opts = {headers: {accept: 'application/json'}};
            axios.post(
                `https://github.com/login/oauth/access_token`, body, opts,
            ).then((res: AxiosResponse<GithubAccessTokenResponse>) => {
                access_token = res.data.access_token;
                // console.log('access_token', access_token);
                resolve(res);
            }).catch(() => {
                console.log('access_token失败');
            });
        }).then(() => {
            /**
             * 获取用户信息
             */
            // 中间请求需要return Promise
            return new Promise((resolve, reject) => {
                axios.get(`https://api.github.com/user`, {
                    data: undefined, string: undefined,
                    headers: {
                        // 在请求头中添加 Authorization 字段
                        Authorization: `token ${access_token}`,
                    }
                }).then((res: AxiosResponse<GithubUserInterface>) => {
                    userInfo = res;
                    // console.log('userInfo', userInfo.data);
                    resolve(res.data);
                }).catch(() => {
                    console.log('用户信息失败');
                });
            });
        }).then(() => {
            /**
             * 获取emails信息
             */
            // 中间请求需要return Promise
            return new Promise((resolve, reject) => {
                axios.get(`https://api.github.com/user/emails`, {
                    data: undefined, string: undefined,
                    headers: {
                        Accept: 'application/vnd.github+json',
                        Authorization: `token ${access_token}`,
                    }
                }).then((res: AxiosResponse<any>) => {
                    userEmails = res;
                    // console.log('userEmails', userEmails.data);
                    resolve(res.data);
                }).catch(() => {
                    console.log('emails失败');
                });
            });
        }).then(async () => {
            // 查询是否存在该用户
            const user: any = await User.findOne({where: {id: userInfo.data.id}});
            if (!user) {
                // 将用户信息和邮箱信息保存到数据库中
                try {
                    // 成功创建用户
                    await User.create({
                        id: userInfo.data.id,
                        name: userInfo.data.login,
                        username: userInfo.data.name,
                        avatar: userInfo.data.avatar_url, // 头像
                        remarks: userEmails.data[0].email, // 备注
                        password: 0,
                        role: UserRoleEnum.github,
                        roleName: 'Github用户'
                    });
                    // 生成token令牌
                    const token = jwt.sign(
                        {name: userInfo.data.name, id: userInfo.data.id},
                        // 密钥
                        process.env.SECRET_KEY || 'uC+0Nnljo9',
                        // 过期时间 默认6小时
                        {
                            expiresIn: 21600000,
                        }
                    );
                    // 加密jwt
                    const aesToken: string = encipher(token);
                    const tokenInfo: Token = new Token('authorization', aesToken, userInfo.data.id, 21600000);
                    // 加密
                    const params: OauthInterface = {
                        login_type: 'github_oauth',
                        date: new Date().getTime(),
                        userInfo: {
                            id: userInfo.data.id,
                            userName: userInfo.data.name, // 登录名
                            name: userInfo.data.login, // 昵称
                            remarks: userEmails.data[0].email, // 备注
                            avatar: userInfo.data.avatar_url, // 头像
                            role: UserRoleEnum.github, // 角色
                            roleName: 'Github用户', // 角色名称
                            token: tokenInfo
                        }
                    };
                    const callbackParams: string = encipher(params);
                    // 跳转到首页
                    res.redirect(`/login/auth?${callbackParams}`);
                } catch (error) {
                    // 用户创建失败
                    console.log('用户创建失败');
                }
            } else {
                // 更新登录时间
                await user.update(
                    {
                        lastLoginTime: new Date().getTime(),
                    },
                    {
                        where: {id: user.id},
                    }
                );
                // 生成token令牌
                const token = jwt.sign(
                    {name: user.name, id: user.id},
                    // 密钥
                    process.env.SECRET_KEY || 'uC+0Nnljo9',
                    // 过期时间 默认6小时
                    {
                        expiresIn: 21600000,
                    }
                );
                // 加密jwt
                const aesToken: string = encipher(token);
                const tokenInfo: Token = new Token('authorization', aesToken, userInfo.data.id, 21600000);
                // 加密
                const params: OauthInterface = {
                    login_type: 'github_oauth',
                    date: new Date().getTime(),
                    userInfo: {
                        id: user.id,
                        userName: user.username, // 登录名
                        name: user.name, // 昵称
                        remarks: user.remarks, // 备注
                        avatar: user.avatar, // 头像
                        role: user.role, // 角色
                        roleName: user.roleName, // 角色名称
                        lastLoginTime: user.lastLoginTime, // 最后登录时间
                        token: tokenInfo
                    }
                };
                const callbackParams: string = encipher(params);
                // 验证成功，跳转到首页
                res.redirect(`/login/auth?${callbackParams}`);
            }
        });
    } catch (error) {
        console.log('catch', error);
    }
};


/**
 * QQ获取授权
 * @param req
 * @param res
 */
const qqOauth = async (req: Request, res: Response) => {
    const githubUrl = 'https://github.com/login/oauth/authorize';
    // 重定向用户授权
    res.redirect(`${githubUrl}?client_id=${process.env.CLIENT_ID}&scope=user:email`);
};

/**
 * qq获取鉴权
 * @param req
 * @param res
 */
const qqAccessToken = async (req: Request, res: Response) => {
    res.json({
        code: -1,
        msg: `接口待完善`,
    });
}

export {
    uuidState,
    githubOauth,
    githubAccessToken,
    qqAccessToken
}