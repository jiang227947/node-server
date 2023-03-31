import {Request, Response} from 'express';
import Visitor from '../models/visitor';

/**
 * 访客数据新增
 * @constructor
 */
const visitor = async (req: Request, res: Response) => {
    const {ip, hostname, city, region, country, loc, timezone} = req.body;
    // 验证是否存在相同ip
    const visitorUser: any = await Visitor.findOne({where: {ip}});
    if (visitorUser) {
        // 更新访问时间
        await visitorUser.update(
            {
                accessTime: new Date().getTime(),
            },
            {
                where: {id: visitorUser.id},
            }
        );
        res.status(200).json({
            code: 0,
            msg: `请求成功`,
        });
    } else {
        try {
            const accessTime = new Date().getTime();
            // 新增访问
            await Visitor.create({ip, hostname, city, region, country, loc, timezone, accessTime});
            res.status(200).json({
                code: 0,
                msg: `请求成功`,
            });
        } catch (error) {
            res.status(400).json({
                code: -1,
                msg: `请求失败`,
                error,
            });
        }
    }
};

export default visitor;

