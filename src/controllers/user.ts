import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import { encipher } from '../util/encipher';

/**
 * 创建用户
 * @param req 参数
 * @param res 返回
 */
const newUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  // 加密密码
  const hashPassword = await bcrypt.hash(password, 12);
  const aesPassword = encipher(password);
  console.log(aesPassword);

  // 验证是否存在相同用户
  const userRepeat = await User.findOne({ where: { username } });
  if (userRepeat) {
    return res.status(400).json({
      msg: `用户名已存在`,
    });
  }

  try {
    // 成功创建用户
    await User.create({
      username,
      password: aesPassword,
    });
    res.json({
      msg: `用户 ${username} 创建成功`,
    });
  } catch (error) {
    res.status(400).json({
      msg: `用户创建失败`,
      error,
    });
  }
};

/**
 * 用户登录
 * @param req 参数
 * @param res 返回
 */
const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  /**
   * 1. 验证是否存在该用户
   * 2. 验证密码是否正确
   * 3. 生成令牌 登录成功
   */
  // 验证是否存在该用户
  const user: any = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(400).json({
      msg: `用户不存在`,
    });
  }
  // 验证密码是否正确
  const passwordValid = await bcrypt.compare(password, user.password);
  const aesPasswordValid = encipher(password);
  console.log('aesPasswordValid', aesPasswordValid);

  if (aesPasswordValid !== user.password) {
    return res.status(400).json({
      msg: `密码错误`,
    });
  }
  // 生成token令牌 登录成功
  const token = jwt.sign(
    {
      username,
    },
    // 密钥
    process.env.SECRET_KEY || 'jzy2023',
    // 过期时间 默认24小时
    {
      expiresIn: '86400000',
    }
  );
  res.json({
    token,
  });
};

export { newUser, loginUser };
