import {createClient} from 'redis';

const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;
const password = process.env.REDIS_PASSWORD;

/**
 * Redis服务
 */
export class Redis {

    // redisClient
    redisClient: any;

    constructor() {
        this.redisClient = createClient({
            url: `${host}:${port}`,
            password: `${password}`,
            legacyMode: true
        });

        // 配置redis的监听事件
        this.redisClient.on('ready', () => {
            console.log('Redis Client: ready');
        });

        // 连接到redis-server回调事件
        this.redisClient.on('connect', () => {
            console.log(new Date(), 'redis is now connected!');
        });

        this.redisClient.on('reconnecting', () => {
            console.log(new Date(), 'redis reconnecting', arguments);
        });

        this.redisClient.on('end', () => {
            console.log('Redis Closed!');
        });

        this.redisClient.on('warning', () => {
            console.log('Redis client: warning', arguments);
        });

        this.redisClient.on('error', (err: any) => {
            console.log('Redis Error ' + err);
        });

        // 判断redis是否连接
        if (this.redisClient.isOpen) {
            // console.log('redis已经连接!');
        } else {
            this.connect();
        }
    }

    /**
     * 连接
     */
    async connect(): Promise<void> {
        await this.redisClient.connect().catch((error: any) => {
            console.log(error);
        });
    }

    /**
     * 退出
     */
    quit(): void {
        this.redisClient.quit();
    }

    /**
     * 查询一个key是否存在
     * @param key
     */
    async exists(key: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.redisClient.exists(key, (err: any, result: boolean) => {
                if (err) {
                    reject(false);
                }
                resolve(result);
            });
        });
    }

    /**
     * 设置
     * @param key
     * @param value
     * @param expires
     * redis.set('email', {id: 2, code: 112233}, 10).catch((error: any) => {
     *  console.log(error);
     * });
     */
    async set(key: string, value: string | object, expires: number): Promise<any> {
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        return new Promise((resolve, reject) => {
            this.redisClient.set(key, value, (err: any, result: any) => {
                if (err) {
                    reject(false);
                }
                if (!isNaN(expires)) {
                    this.redisClient.expire(key, expires);
                }
                resolve(result);
            });
        });
    }

    /**
     * 获取key的值
     * @param key
     */
    async get(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.redisClient.get(key, (err: any, result: any) => {
                if (err) {
                    reject(false);
                }
                resolve(result);
            });
        });
    }

    /**
     * 获取一个List的值
     * @param key key
     * @param startIndex 开始的下标
     * @param endIndex 开始的下标
     */
    async getList(key: string, startIndex: number, endIndex: number): Promise<any> {
        // redis.getList('emailList', 0, 5).then((res: string) => {
        //                     console.log(res);
        //                 }).catch((error: any) => {
        //                     console.log(error);
        //                 });
        return new Promise((resolve, reject) => {
            this.redisClient.lrange(key, startIndex, endIndex, (err: any, result: any) => {
                if (err) {
                    reject(false);
                }
                resolve(result);
            });
        });
    }

    /**
     * 删除
     * @param key
     */
    async remove(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.redisClient.del(key, (err: any, result: any) => {
                if (err) {
                    reject(false);
                }
                resolve(result);
            });
        });
    }

    /**
     * 将给定值推入列表的右端 返回值 当前列表长度
     * @param key
     * @param list
     * @param expires
     */
    async rPush(key: string, list: string | object, expires: number): Promise<number> {
        // redis.rPush('email2', 'k', 10).catch((error: any) => {
        //  console.log(error);
        // });
        if (typeof list === 'object') {
            list = JSON.stringify(list);
        }
        return new Promise((resolve, reject) => {
            this.redisClient.rPush(key, list, (err: any, length: number) => {
                if (err) {
                    reject(false);
                }
                if (!isNaN(expires)) {
                    this.redisClient.expire(key, expires);
                }
                resolve(length);
            });
        });
    }

    /**
     * 清除list中n个值为value的项
     * @param key
     * @param n
     * @param value
     */
    async lrem(key: string, n: number = 1, value: any): Promise<any> {
        return new Promise((resolve) => {
            this.redisClient.lrem(key, n, value, (err: any, result: any) => {
                if (err) {
                    return false;
                }
                resolve(result);
            });
        });
    }

}
