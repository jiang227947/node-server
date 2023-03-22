import { Router } from 'express';
import { newUser, loginUser } from '../controllers/user';

const UserRouter = Router();

UserRouter.post('/api/users', newUser);
UserRouter.post('/api/loginUser', loginUser);

export default UserRouter;
