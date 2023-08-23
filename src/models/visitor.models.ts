import mongoose from "mongoose";

/**
 * 访客模型定义
 */
const VisitorSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    // ip地址
    ip: {
        type: String,
    },
    // 主机名
    hostname: {
        type: String,
    },
    // 城市
    city: {
        type: String,
    },
    // 地区
    region: {
        type: String,
    },
    // 国家
    country: {
        type: String,
    },
    // 坐标
    loc: {
        type: String,
    },
    // 时区
    timezone: {
        type: String,
    },
    // 访问时间
    accessTime: {
        type: String,
    },
});
const Visitor = mongoose.model('visitor', VisitorSchema);
export default Visitor;
