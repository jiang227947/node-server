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

/**
 * 用户被 GitHub 重定向响应
 */
export interface GithubAccessTokenResponse {
    access_token: string;
    scope: string;
    token_type: string;
}

/**
 * github用户响应参数
 */
export interface GithubUserInterface {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string;
    company: string;
    blog: string;
    location: string;
    email: string;
    hireable: boolean;
    bio: string;
    twitter_username: string;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
    private_gists: number;
    total_private_repos: number;
    owned_private_repos: number;
    disk_usage: number;
    collaborators: number;
    two_factor_authentication: boolean;
    plan: any;
}
