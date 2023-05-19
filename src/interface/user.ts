import {UserRoleEnum} from '../enum/user.enum';
import {Token} from '../models/class/token';

/**
 * 角色接口
 */
export interface UserInterface {
    id: number; // id
    name: string;    // 登录名
    userName: string;    // 用户名
    token: Token;   // token数据
    password?: string; // 密码
    role?: UserRoleEnum;    // 角色
    roleName?: string;    // 角色名称
    avatar?: string;    // 头像路径
    remarks?: string;    // 备注
    lastLoginTime?: string;    // 上次登录时间
}

/**
 * 第三方登录返回数据接口
 */
export interface OauthInterface {
    login_type: string; // 类型
    date: number; // 时间
    userInfo: UserInterface; // 用户信息
}
