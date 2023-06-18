import {Router} from 'express';
import validateToken from './validate-token';
import {
    addReaction,
    completions,
    queryChatMessage,
} from '../controllers/chat';

const ChatMessageRouter = Router();
// 分页查询聊天记录
ChatMessageRouter.post('/api/queryChatMessage', validateToken, queryChatMessage);
// 添加反应表情
ChatMessageRouter.post('/api/addReaction', validateToken, addReaction);
// GPT
ChatMessageRouter.post('/api/completions', validateToken, completions);
export default ChatMessageRouter;
