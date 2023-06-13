import {Router} from 'express';
import validateToken from './validate-token';
import {addReaction, queryChatMessage} from '../controllers/chat';

const ChatMessage = Router();
// 分页查询聊天记录
ChatMessage.post('/api/queryChatMessage', validateToken, queryChatMessage);
// 添加反应表情
ChatMessage.post('/api/addReaction', validateToken, addReaction);
export default ChatMessage;
