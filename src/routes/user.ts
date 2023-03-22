import { Router } from 'express';
import { newUser, loginUser } from '../controllers/user';

const router = Router();

router.post('/', newUser);
router.post('/', loginUser);

export default router;
