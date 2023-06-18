import {Router} from "express";
import validateToken from "./validate-token";
import {createChannel, queryChannel, uploadChannelAvatar, uploadChannelAvatarMulter} from "../controllers/chat";

const ChatChannelRouter = Router();

// 上传频道头像
ChatChannelRouter.post('/api/uploadChannelAvatar', validateToken, uploadChannelAvatarMulter.single('avatar'), uploadChannelAvatar);
// 创建频道
ChatChannelRouter.post('/api/createChannel', validateToken, createChannel);
// 查询频道
ChatChannelRouter.get('/api/queryChannel', validateToken, queryChannel);
export default ChatChannelRouter;