import {Router} from 'express';
import {addLeaveMessage, getLeaveMessage} from '../controllers/leave-message';
import visitor from '../controllers/visitor';

const LeaveMessageRouter = Router();

// 添加留言
LeaveMessageRouter.post('/api/addLeaveMessage', addLeaveMessage);
// 查询留言
LeaveMessageRouter.get('/api/getLeaveMessage', getLeaveMessage);
// 访客数据保存
LeaveMessageRouter.post('/api/visitor', visitor);

export default LeaveMessageRouter;
