/**
 * token 拦截器
 */
import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {decipher} from "../util/encipher";

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    const headerToken = req.headers['authorization'];
    // 验证是否有鉴权信息 并且不是非法鉴权
    if (headerToken !== undefined && headerToken.startsWith('Bearer ')) {
        // 截取token
        const bearerToken = headerToken.slice(7);
        const aesToken = decipher(bearerToken);
        console.log('aesToken', aesToken);
        try {
            // 验证token合法性
            jwt.verify(aesToken, process.env.SECRET_KEY || 'jzy2023');
            next();
        } catch (error) {
            return res.status(401).json({
                msg: 'token不合法',
            });
        }
    } else {
        return res.status(401).json({
            msg: '无权限访问',
        });
    }
};

export default validateToken;
