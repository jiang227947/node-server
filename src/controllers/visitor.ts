import {Request, Response} from 'express';
import Visitor from '../models/visitor.models';
import {ResultCodeEnum} from "../enum/http.enum";

/**
 * 访客数据新增
 * @constructor
 */
const visitor = async (req: Request, res: Response) => {
    const {ip, hostname, city, region, country, loc, timezone} = req.body;
    // 验证是否存在相同ip
    const visitorUser: any = await Visitor.findOne({ip});
    if (visitorUser) {
        // 更新访问时间
        await Visitor.updateOne(
            {id: visitorUser.id},
            {accessTime: new Date().getTime()},
            function (err: any, res: any) {
                if (err) throw err;
                console.log(res);
            }
        );
        res.status(200).json({
            code: ResultCodeEnum.success,
            msg: `请求成功`,
        });
    } else {
        try {
            const accessTime = new Date().getTime();
            // 新增访问
            await Visitor.create({ip, hostname, city, region, country, loc, timezone, accessTime});
            res.status(200).json({
                code: ResultCodeEnum.success,
                msg: `请求成功`,
            });
        } catch (error) {
            res.status(400).json({
                code: ResultCodeEnum.fail,
                msg: `请求失败`,
                error,
            });
        }
    }
};

export default visitor;

