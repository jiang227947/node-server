import { Request, Response } from 'express';
import LeaveMessage from '../models/leave-message.models';
import {ResultCodeEnum} from "../enum/http.enum";

/**
 * 添加留言
 * @param req 参数
 * @param res 返回
 */
const addLeaveMessage = async (req: Request, res: Response) => {
  const { name, message, browser } = req.body;

  try {
    await LeaveMessage.create({
      name,
      message,
      browser,
    });
    res.json({
      code: ResultCodeEnum.success,
      msg: `留言成功`,
    });
  } catch (error) {
    res.status(400).json({
      code: ResultCodeEnum.fail,
      msg: `留言失败`,
      error,
    });
  }
};

/**
 * 查询留言
 * @param req 请求
 * @param res 结果
 */
const getLeaveMessage = async (req: Request, res: Response) => {
  const listProducts = await LeaveMessage.findAll();
  res.json({
    code: ResultCodeEnum.success,
    msg: `查询成功`,
    data: listProducts,
  });
};

export { addLeaveMessage, getLeaveMessage };
