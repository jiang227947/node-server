import {Router} from 'express';
import {newUser, loginUser, allUser, deleteUser} from '../controllers/user';
import validateToken from "./validate-token";

const UserRouter = Router();

// 注册新用户
UserRouter.post('/api/register', newUser);
// 登录
UserRouter.post('/api/login', loginUser);
// 查询所有用户
UserRouter.post('/api/getUserList', validateToken, allUser);
// 删除用户
UserRouter.post('/api/deleteUser', validateToken, deleteUser);

export default UserRouter;
