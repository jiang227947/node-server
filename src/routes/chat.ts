import { Router } from 'express';
import SocketRouter from '../controllers/chat';

const ChatMessageSendRouter = Router();

ChatMessageSendRouter.post('/api/sendMsg', SocketRouter);

export default ChatMessageSendRouter;
