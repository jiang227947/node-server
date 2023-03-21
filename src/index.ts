import dotenv from 'dotenv';
import Servers from './models/server';

// 初始化默认配置
dotenv.config();
const server = new Servers();
