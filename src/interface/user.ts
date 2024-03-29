import {UserRoleEnum} from '../enum/user.enum';
import {Token} from '../models/class/token';

/**
 * 角色接口
 */
export interface UserInterface {
    id: string; // id
    name: string;    // 登录名
    userName: string;    // 用户名
    token: Token;   // token数据
    username?: string;    // 用户名
    password?: string; // 密码
    email?: string; // 邮箱
    role?: UserRoleEnum;    // 角色
    roleName?: string;    // 角色名称
    avatar?: string;    // 头像路径
    remarks?: string;    // 备注
    lastLoginTime?: string;    // 上次登录时间
}

