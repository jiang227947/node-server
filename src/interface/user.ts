import {UserRoleEnum} from "../enum/user.enum";

/**
 * 角色接口
 */
export interface UserInterface {
    id: number; // id
    name: string;    // 昵称
    userName: string;    // 登录名
    password: string; // 密码
    role: UserRoleEnum;    // 角色
    roleName: string;    // 角色名称
    lastLoginTime: string;    // 上次登录时间
    token: string;   // token数据
}