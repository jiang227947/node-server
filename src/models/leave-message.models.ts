import mongoose from "mongoose";

/**
 * 登录页留言框
 */
const LeaveMessageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  message: {
    type: String,
  },
  browser: {
    type: String,
  },
  // 创建时间
  updated: {
    type: Number,
  },
});
const LeaveMessage = mongoose.model('leave_message', LeaveMessageSchema);
export default LeaveMessage;
