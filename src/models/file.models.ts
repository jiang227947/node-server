import mongoose from "mongoose";

/**
 * 文件模型定义
 */

const fileSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  // 文件名
  filename: {
    type: String,
    required: true,
    unique: true,
  },
  // 文件大小（字节）
  filesize: {
    type: Number,
    required: true,
  },
  // 下载次数
  downloadCount: {
    type: Number,
  },
  // 文件路径
  path: {
    type: String,
    required: true,
  },
  // 上传用户
  uploadUser: {
    type: String,
    required: true
  },
  // 上传用户id
  uploadUserId: {
    type: String,
    required: true
  },
  // 创建时间
  created: {
    type: String,
  },
  // 修改时间
  updated: {
    type: String,
  },
});
const Filedb = mongoose.model('file', fileSchema);
export default Filedb;
