import {Request, Response} from "express";
import axios, {AxiosResponse} from "axios";
import User from "../models/user.models";
import {UserRoleEnum} from "../enum/user.enum";
import jwt from "jsonwebtoken";
import {encipher} from "../util/encipher";
import {Token} from "../models/class/token";
import {v4 as uuidv4} from 'uuid';
import {
    GithubAccessTokenResponse,
    GithubUserInterface,
    OauthInterface,
    QQOpenIDOAuthResponse, QQUserInfoInterface, WxAuthResponse
} from "../interface/oauth2";
import {ResultCodeEnum} from "../enum/http.enum";
import ChatChannelDatabase from '../models/chat-channel.models';
import {CommonUtil} from '../util/common-util';

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
            code: ResultCodeEnum.success,
            msg: `生成成功`,
            data: aesString
        });
    } catch (error) {
        res.status(400).json({
            code: ResultCodeEnum.fail,
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
            return new Promise((resolve) => {
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
            return new Promise((resolve) => {
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
            const user: any = await User.findOne({id: userInfo.data.id});
            if (!user) {
                // 将用户信息保存到数据库中
                try {
                    // 生成uuid
                    const uuid = uuidv4();
                    // 成功创建用户
                    await User.create({
                        name: userInfo.data.login,
                        username: userInfo.data.name,
                        avatar: userInfo.data.avatar_url, // 头像
                        email: userEmails.data[0].email, // 邮箱
                        remarks: '', // 备注
                        password: uuid,
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
                            email: userEmails.data[0].email, // 邮箱
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
                // 生成token令牌
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
                // 更新登录时间
                await User.updateOne(
                    {id: user.id},
                    {lastLoginTime: new Date().getTime()},
                    function (err: any, res: any) {
                        if (err) throw err;
                        console.log(res);
                    }
                );
            }
        }).catch(() => {
            console.log('github失败');
        });
    } catch (error) {
        console.log('catch', error);
    }
};

/**
 * qq获取鉴权登录信息
 * @param req
 * @param res
 */
const qqOauth = async (req: Request, res: Response) => {
    const {code, state} = req.query;
    // axios请求
    const axios = require('axios').default;
    axios.defaults.timeout = 30000;
    // 分配给应用的appid
    const APP_ID = 102050313;
    // 分配给应用的appkey
    const APP_Key = 'IUUKvLWbWxVoxrdD';
    // 鉴权token
    let access_token = '';
    // 用户唯一ID信息
    let openID: QQOpenIDOAuthResponse;
    // 用户唯一ID
    let openid: number;
    // 用户信息
    let userInfo: QQUserInfoInterface;
    // 错误信息
    let errorMsg: string = 'error';
    try {
        new Promise((resolve) => {
            /**
             * 通过Authorization Code获取Access Token
             * grant_type    必须    授权类型，在本步骤中，此值为“authorization_code”。
             * client_id    必须    申请QQ登录成功后，分配给网站的appid。
             * client_secret    必须    申请QQ登录成功后，分配给网站的appkey。
             * code    必须    上一步返回的authorization code。
             * 如果用户成功登录并授权，则会跳转到指定的回调地址，并在URL中带上Authorization Code。
             * 例如，回调地址为www.qq.com/my.php，则跳转到：http://www.qq.com/my.php?code=520DD95263C1CFEA087******
             * 注意此code会在10分钟内过期。
             * redirect_uri    必须    与上面一步中传入的redirect_uri保持一致。
             * fmt    可选    因历史原因，默认是x-www-form-urlencoded格式，如果填写json，则返回json格式
             * https://wiki.connect.qq.com/%e4%bd%bf%e7%94%a8authorization_code%e8%8e%b7%e5%8f%96access_token
             */
            const body = {
                grant_type: 'authorization_code',
                client_id: APP_ID,
                client_secret: APP_Key,
                code: code,
                redirect_uri: 'https://www.evziyi.top/api/qqAuth-callback'
            };
            axios.get(`https://graph.qq.com/oauth2.0/token`, {params: body}
            ).then((res: AxiosResponse<string>) => {
                // access_token=82961AE50019****C468159C&expires_in=7776000&refresh_token=2708D9****DB53D46E096BBDD82E
                /**
                 * access_token    授权令牌，Access_Token。
                 * expires_in    该access token的有效期，单位为秒。
                 * refresh_token    在授权自动续期步骤中，获取新的Access_Token时需要提供的参数。
                 * 注：refresh_token仅一次有效
                 */
                const tokenArray = res.data.split('&');
                access_token = tokenArray[0].split('=')[1];
                resolve(res);
            }).catch(() => {
                console.log('access_token失败');
            });
        }).then(() => {
            /**
             * 获取用户OpenID_OAuth2.0
             * access_token    必须    在Step1中获取到的access token。
             * fmt    可选    因历史原因，默认是jsonpb格式，如果填写json，则返回json格式
             */
            // 中间请求需要return Promise
            return new Promise((resolve) => {
                axios.get(`https://graph.qq.com/oauth2.0/me`, {
                    params: {
                        access_token: access_token,
                        fmt: 'json',
                    }
                }).then((res: AxiosResponse<QQOpenIDOAuthResponse>) => {
                    openID = res.data;
                    const idList: string[] = openID.openid.match(/\d+/g) as string[];
                    openid = +(idList.join('')).slice(0, 6);
                    // {"client_id":"102050313","openid":"ACFBD42D56ED****7EBB8F61B9DB2E"}
                    resolve(res.data);
                }).catch(() => {
                    console.log('用户OpenID_OAuth2.0失败');
                });
            });
        }).then(() => {
            /**
             * 获取登录用户在QQ空间的信息，包括昵称、头像、性别及黄钻信息（包括黄钻等级、是否年费黄钻等）。
             * access_token    可通过使用Authorization_Code获取Access_Token 或来获取。
             * access_token有30天有效期。
             * oauth_consumer_key    申请QQ登录成功后，分配给应用的appid
             * openid    用户的ID，与QQ号码一一对应。
             */
            // 中间请求需要return Promise
            return new Promise((resolve, reject) => {
                axios.get(`https://graph.qq.com/user/get_user_info`, {
                    params: {
                        access_token: access_token,
                        oauth_consumer_key: APP_ID,
                        openid: openID.openid,
                    }
                }).then((res: AxiosResponse<QQUserInfoInterface>) => {
                    // 如果ret !== 0，会有相应的错误信息提示
                    if (res.data.ret !== 0) {
                        errorMsg = res.data.msg;
                        reject(res.data.msg);
                    } else {
                        userInfo = res.data;
                        resolve(res.data);
                    }
                }).catch(() => {
                    console.log('用户信息失败');
                });
            });
        }).then(async () => {
            // 查询是否存在该用户
            const user: any = await User.findOne({id: openid});
            if (!user) {
                // 将用户信息保存到数据库中
                try {
                    // 生成uuid
                    const uuid = uuidv4();
                    // 成功创建用户
                    const newUser: any = await User.create({
                        // openid对应每一个QQ号，唯一
                        id: openid,
                        name: userInfo.nickname,
                        username: userInfo.nickname,
                        avatar: userInfo.figureurl_qq_1, // 头像
                        email: '', // 邮箱
                        remarks: '', // 备注
                        password: uuid,
                        role: UserRoleEnum.qq,
                        roleName: 'QQ用户'
                    });
                    const channel: any = await ChatChannelDatabase.findOne({channelId: '8808'});
                    // 添加至公共频道
                    await CommonUtil.updateChatChannel(channel, newUser, 'add').then(async (personnel: string | boolean) => {
                        if (personnel) {
                            await ChatChannelDatabase.updateOne(
                                {channelId: '8808'},
                                {personnel},
                                function (err: any, res: any) {
                                    if (err) throw err;
                                    console.log(res);
                                }
                            );
                        }
                    });
                    // 生成token令牌
                    const token = jwt.sign(
                        {name: userInfo.nickname, id: newUser.id},
                        // 密钥
                        process.env.SECRET_KEY || 'uC+0Nnljo9',
                        // 过期时间 qq默认100小时
                        {
                            expiresIn: 360000000,
                        }
                    );
                    // 加密jwt
                    const aesToken: string = encipher(token);
                    const tokenInfo: Token = new Token('authorization', aesToken, newUser.id, 360000000);
                    // 加密
                    const params: OauthInterface = {
                        login_type: 'qq_oauth',
                        state: state,
                        date: new Date().getTime(),
                        userInfo: {
                            id: newUser.id,
                            userName: userInfo.nickname, // 登录名
                            name: userInfo.nickname, // 昵称
                            remarks: '', // 备注
                            email: '', // 邮箱
                            avatar: userInfo.figureurl_qq_1, // 头像
                            role: UserRoleEnum.qq, // 角色
                            roleName: 'QQ用户', // 角色名称
                            token: tokenInfo
                        }
                    };
                    const callbackParams: string = encipher(params);
                    // 跳转到首页
                    res.redirect(`/login/auth?${callbackParams}`);
                    // 更新登录时间
                    await User.updateOne(
                        {id: user.id},
                        {lastLoginTime: new Date().getTime()},
                        function (err: any, res: any) {
                            if (err) throw err;
                            console.log(res);
                        }
                    );
                } catch (e) {
                    // 用户创建失败
                    console.log('用户创建失败', e);
                }
            } else {
                // 生成token令牌
                const token = jwt.sign(
                    {name: user.username, id: user.id},
                    // 密钥
                    process.env.SECRET_KEY || 'uC+0Nnljo9',
                    // 过期时间 默认100小时
                    {
                        expiresIn: 360000000,
                    }
                );
                // 加密jwt
                const aesToken: string = encipher(token);
                const tokenInfo: Token = new Token('authorization', aesToken, user.id, 360000000);
                // 加密
                const params: OauthInterface = {
                    login_type: 'qq_oauth',
                    state: state,
                    date: new Date().getTime(),
                    userInfo: {
                        id: user.id,
                        userName: user.username, // 登录名
                        name: user.name, // 昵称
                        remarks: user.remarks, // 备注
                        email: user.email, // 邮箱
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
                // 更新登录时间
                await User.updateOne(
                    {id: user.id},
                    {lastLoginTime: new Date().getTime()},
                    function (err: any, res: any) {
                        if (err) throw err;
                        console.log(res);
                    }
                );
            }
        }).catch(() => {
            console.log('QQ失败');
        });
    } catch (e) {
        res.json({
            code: ResultCodeEnum.fail,
            msg: errorMsg,
        });
    }
}

/**
 * 微信code登录凭证校验
 * @param req
 * @param res
 */
const wxCodeAuthorization = async (req: Request, res: Response) => {
    const {code, avatar, name} = req.query;
    await wxCodeSession(code as string).then((result: WxAuthResponse | any) => {
        // 判断是否请求成功
        if (!result) {
            return res.json({
                code: ResultCodeEnum.complete,
                msg: '获取用户信息失败',
            });
        }
        // 判断是否有错误码
        if (result && result.errcode) {
            return res.json({
                code: ResultCodeEnum.complete,
                msg: result.errmsg,
            });
        }
        // 加密openid
        const openid: string = encipher(result.openid);
        // 获取成功 查询是否登录过
        const userFind = async () => {
            return await User.findOne({id: openid}).exec();
        };
        userFind().then((user: any) => {
            if (user) {
                // 生成token令牌
                const token = jwt.sign(
                    {name: user.username, id: user.id},
                    // 密钥
                    process.env.SECRET_KEY || 'uC+0Nnljo9',
                    // 过期时间 默认24小时
                    {
                        expiresIn: 86400000,
                    }
                );
                // 加密jwt
                const aesToken: string = encipher(token);
                const tokenInfo: Token = new Token('authorization', aesToken, user.id, 86400000);
                // 加密
                const params: OauthInterface = {
                    login_type: 'wx_oauth',
                    date: new Date().getTime(),
                    userInfo: {
                        id: user.id,
                        userName: user.username, // 登录名
                        name: user.name, // 昵称
                        remarks: user.remarks, // 备注
                        email: user.email, // 邮箱
                        avatar: user.avatar, // 头像
                        role: user.role, // 角色
                        roleName: user.roleName, // 角色名称
                        lastLoginTime: user.lastLoginTime, // 最后登录时间
                        token: tokenInfo
                    }
                };
                return res.json({
                    code: ResultCodeEnum.success,
                    data: params,
                    msg: '获取用户信息成功',
                });
            } else if (avatar && name) {
                // 查询是否有重名用户
                const nameFind = async () => {
                    return await User.findOne({name}).exec();
                };
                nameFind().then((user) => {
                    let userName: string;
                    // 重名用户补充数字
                    if (user) {
                        userName = `${name}${(Math.random() * 10000).toFixed(0)}`
                    } else {
                        userName = name as string;
                    }
                    // 创建密码
                    const aesPassword = uuidv4();
                    // 创建用户信息
                    const createUser = async () => {
                        const newUser = new User({
                            id: openid,
                            avatar,
                            name: userName,
                            username: userName,
                            password: aesPassword,
                            role: UserRoleEnum.mobile,
                            roleName: '小程序用户',
                            created: new Date().getTime()
                        });
                        // 保存
                        await newUser.save();
                    }
                    createUser().then(async () => {
                        // 生成token令牌
                        const token = jwt.sign(
                            {name: userName, id: openid},
                            // 密钥
                            process.env.SECRET_KEY || 'uC+0Nnljo9',
                            // 过期时间 默认24小时
                            {
                                expiresIn: 86400000,
                            }
                        );
                        // 加密jwt
                        const aesToken: string = encipher(token);
                        const tokenInfo: Token = new Token('authorization', aesToken, openid, 86400000);
                        // 加密
                        const params: OauthInterface = {
                            login_type: 'wx_oauth',
                            date: new Date().getTime(),
                            userInfo: {
                                id: openid,
                                userName: userName, // 登录名
                                name: userName, // 昵称
                                remarks: '', // 备注
                                email: '', // 邮箱
                                avatar: avatar as string, // 头像
                                role: UserRoleEnum.mobile,
                                roleName: '小程序用户',
                                token: tokenInfo
                            }
                        };
                        const channel: any = await ChatChannelDatabase.findOne({channelId: '8808'});
                        // 添加至公共频道
                        await CommonUtil.updateChatChannel(channel, params.userInfo, 'add').then(async (personnel: string | boolean) => {
                            if (personnel) {
                                await ChatChannelDatabase.updateOne({channelId: '8808'}, {personnel});
                            }
                        });
                        res.json({
                            code: ResultCodeEnum.success,
                            data: params,
                            msg: '注册成功',
                        });
                    });
                });
            } else {
                res.json({
                    code: ResultCodeEnum.complete,
                    msg: '该用户尚未注册',
                });
            }
        });
    }).catch((e) => {
        console.log(e);
        res.json({
            code: ResultCodeEnum.fail,
            msg: '获取用户信息失败',
        });
    });
}

/**
 * wx登录凭证校验
 * @param code
 */
const wxCodeSession = (code: string) => {
    return new Promise((resolve, reject) => {
        axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
            params: {
                appid: '',
                secret: '',
                js_code: code,
                grant_type: 'authorization_code',
            }
        }).then((result: AxiosResponse<WxAuthResponse>) => {
            resolve(result.data);
        }).catch(() => {
            reject(undefined);
        });
    })
}
export {
    uuidState,
    githubOauth,
    githubAccessToken,
    qqOauth,
    wxCodeAuthorization
}
