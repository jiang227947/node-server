import { Request, Response } from 'express';
import { io } from '../models/socket';

/**
 * 发送聊天信息
 * @param req 请求
 * @param res 结果
 */
const ChatMessageSend = (req: Request, res: Response) => {
  const { user, message } = req.body;
  console.log('message', message);
  if (!message) {
    return res.status(400).json({
      code: -1,
      msg: `消息为空`,
    });
  }
  console.log(io);
  // 发送给所有人
  io.emit('chat_message', { user, message });
  // 发送给单个用户
  // io.to().emit('chat_message', { user, message });
  res.json({
    code: 200,
    msg: `消息发送成功`,
  });
};

export default ChatMessageSend;
