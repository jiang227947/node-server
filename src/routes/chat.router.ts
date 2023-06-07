import {Router} from 'express';
import validateToken from './validate-token';
import {queryChatMessage} from '../controllers/chat';

const ChatMessage = Router();
/**
 * 路由对象上挂载路由
 */
ChatMessage.post('/api/queryChatMessage', validateToken, queryChatMessage);
export default ChatMessage;
