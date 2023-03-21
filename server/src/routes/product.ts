import { Router } from 'express';
import { getProducts } from '../controllers/product';
import validateToken from './validate-token';

const router = Router();

router.get('/', validateToken, getProducts);

export default router;
