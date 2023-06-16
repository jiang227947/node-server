import {Router} from 'express';
import validateToken from './validate-token';
import {
    addReaction,
    completions,
    queryChatMessage,
    uploadChannelAvatar,
    uploadChannelAvatarMulter
} from '../controllers/chat';
import UserRouter from "./user.router";

const ChatMessage = Router();
// 分页查询聊天记录
ChatMessage.post('/api/queryChatMessage', validateToken, queryChatMessage);
// 添加反应表情
ChatMessage.post('/api/addReaction', validateToken, addReaction);
// GPT
ChatMessage.post('/api/completions', validateToken, completions);
// 上传频道头像
UserRouter.post('/api/uploadChannelAvatar', validateToken, uploadChannelAvatarMulter.single('avatar'), uploadChannelAvatar);
export default ChatMessage;
