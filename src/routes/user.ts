import {Router} from 'express';
import {newUser, loginUser, allUser, deleteUser} from '../controllers/user';

const UserRouter = Router();

UserRouter.post('/api/users', newUser);
UserRouter.post('/api/login', loginUser);
UserRouter.get('/api/getUserList', allUser);
UserRouter.post('/api/deleteUser', deleteUser);

export default UserRouter;
