import { Router } from 'express';
import { getProducts } from '../controllers/product';
import validateToken from './validate-token';

const ProductRouter = Router();

ProductRouter.get('/api/products', getProducts);

export default ProductRouter;
