/**
 * 第三方登录路由
 */
import {githubAccessToken, githubOauth, qqAccessToken, uuidState} from "../controllers/oauth2";
import {Router} from "express";

const Oauth2Router = Router();
// 根据需要登录的环境生成uuid用来校验
Oauth2Router.get('/api/gitUuidState', uuidState);
// github获取授权
Oauth2Router.get('/api/githubLogin', githubOauth);
// github获取鉴权
Oauth2Router.get('/api/auth-callback', githubAccessToken);
// qq获取鉴权
Oauth2Router.get('/api/qqAuth-callback', qqAccessToken);

export default Oauth2Router;