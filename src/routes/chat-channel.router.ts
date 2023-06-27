import {Router} from 'express';
import validateToken from './validate-token';
import {
    attachmentsUpload,
    createChannel,
    deleteChannel, joinChannel,
    queryChannel, uploadAttachmentsMulter,
    uploadChannelAvatar,
    uploadChannelAvatarMulter
} from '../controllers/chat';

const ChatChannelRouter = Router();

// 上传频道头像
ChatChannelRouter.post('/api/uploadChannelAvatar', validateToken, uploadChannelAvatarMulter.single('avatar'), uploadChannelAvatar);
// 创建频道
ChatChannelRouter.post('/api/createChannel', validateToken, createChannel);
// 查询频道
ChatChannelRouter.get('/api/queryChannel', validateToken, queryChannel);
// 删除频道
ChatChannelRouter.post('/api/deleteChannel', validateToken, deleteChannel);
// 加入频道
ChatChannelRouter.post('/api/joinChannel', validateToken, joinChannel);
// 上传附件
ChatChannelRouter.post('/api/attachmentsUpload', validateToken, uploadAttachmentsMulter.single('file'), attachmentsUpload);

export default ChatChannelRouter;
