import {UserInterface} from "./user";

/**
 * 第三方登录返回数据接口
 */
export interface OauthInterface {
    login_type: string; // 类型
    date: number; // 时间
    userInfo: UserInterface; // 用户信息
    state?: any; // 前端传递的参数，防止CSRF攻击，成功授权后回调时会原样带回
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


/**
 * 用户被 qq 重定向响应
 * access_token    授权令牌，Access_Token。
 * expires_in    该access token的有效期，单位为秒。
 * refresh_token    在授权自动续期步骤中，获取新的Access_Token时需要提供的参数。
 * 注：refresh_token仅一次有效
 */
export interface qqAccessTokenResponse {
    access_token: string;
    expires_in: string;
    refresh_token: string;
}

/**
 * 获取用户OpenID
 */
export interface QQOpenIDOAuthResponse {
    client_id: string;
    openid: string;
}

/**
 * QQ用户信息返回参数说明
 */
export interface QQUserInfoInterface {
    // 返回码
    ret: number;
    // 如果ret<0，会有相应的错误信息提示，返回数据全部用UTF-8编码
    msg: string;
    /*
    * 判断是否有数据丢失。如果应用不使用cache，不需要关心此参数。
    * 0：或者不返回：没有数据丢失，可以缓存。
    * 1：有部分数据丢失或错误，不要缓存
    * */
    is_lost: string;
    // 用户在QQ空间的昵称。
    nickname: string;
    // 大小为30×30像素的QQ空间头像URL。
    figureurl: string;
    // 大小为50×50像素的QQ空间头像URL。
    figureurl_1: string;
    // 大小为100×100像素的QQ空间头像URL
    figureurl_2: string;
    // 大小为40×40像素的QQ头像URL。
    figureurl_qq_1: string;
    // 大小为100×100像素的QQ头像URL。需要注意，不是所有的用户都拥有QQ的100x100的头像，但40x40像素则是一定会有。
    figureurl_qq_2: string;
    // 性别。 如果获取不到则默认返回"男"
    gender: string;
    // 性别类型。默认返回2
    gender_type: string;
    // 省
    province: string;
    // 市
    city: string;
    // 年
    year: string;
    // 星座
    constellation: string;
}