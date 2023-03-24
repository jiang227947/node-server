import { Request, Response } from 'express';
import Product from '../models/product';

/**
 * 获取产品接口
 * @param req 请求
 * @param res 结果
 */
export const getProducts = async (req: Request, res: Response) => {
  const listProducts = await Product.findAll();
  res.status(200).json({
    code: 200,
    msg: '查询成功',
    data: listProducts
  });
};
