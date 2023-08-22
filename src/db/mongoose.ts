import * as mongoose from "mongoose";

/**
 * 连接mongodb数据库
 */
export const connectMongoDb = async () => {
    await mongoose.connect('mongodb://root:admin@localhost:27018/?authSource=admin');
};
