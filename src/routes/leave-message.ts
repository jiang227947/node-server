import { Router } from 'express';
import { addLeaveMessage, getLeaveMessage } from '../controllers/leave-message';

const LeaveMessageRouter = Router();

// 添加留言
LeaveMessageRouter.post('/api/addLeaveMessage', addLeaveMessage);
// 查询留言
LeaveMessageRouter.get('/api/getLeaveMessage', getLeaveMessage);

export default LeaveMessageRouter;
