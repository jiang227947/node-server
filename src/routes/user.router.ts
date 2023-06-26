/**
 * 用户路由
 */
import {Router} from 'express';
import {
    newUser,
    loginUser,
    allUser,
    deleteUser,
    updateUser,
    uploadAvatar,
    uploadAvatarMulter, queryUserById
} from '../controllers/user';
import validateToken from './validate-token';

const UserRouter = Router();

// 注册新用户
UserRouter.post('/api/register', newUser);
// 登录
UserRouter.post('/api/login', loginUser);
// 查询所有用户
UserRouter.post('/api/getUserList', validateToken, allUser);
// 根据用户ID查询
UserRouter.get('/api/queryUserById', validateToken, queryUserById);
// 删除用户
UserRouter.post('/api/deleteUser', validateToken, deleteUser);
// 修改用户
UserRouter.post('/api/updateUser', validateToken, updateUser);
// 上传头像
UserRouter.post('/api/uploadAvatar', validateToken, uploadAvatarMulter.single('avatar'), uploadAvatar);

export default UserRouter;
