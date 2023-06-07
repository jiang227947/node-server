import sequelize from '../db/connection';
import {DataTypes} from 'sequelize';

/**
 * 访客模型定义
 */
const Visitor = sequelize.define('visitor', {
    id: {
        // 数据类型
        type: DataTypes.INTEGER,
        // 是否为key
        primaryKey: true,
        // 自动递增
        autoIncrement: true,
    },
    // ip地址
    ip: {
        type: DataTypes.STRING,
    },
    // 主机名
    hostname: {
        type: DataTypes.STRING,
    },
    // 城市
    city: {
        type: DataTypes.STRING,
    },
    // 地区
    region: {
        type: DataTypes.STRING,
    },
    // 国家
    country: {
        type: DataTypes.STRING,
    },
    // 坐标
    loc: {
        type: DataTypes.STRING,
    },
    // 时区
    timezone: {
        type: DataTypes.STRING,
    },
    // 访问时间
    accessTime: {
        type: DataTypes.BIGINT,
    },
});

export default Visitor;
