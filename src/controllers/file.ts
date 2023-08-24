import {Request, Response} from 'express';
import fs from 'fs';
import multer from 'multer';
import Filedb from '../models/file.models';
import {ResultListPage} from '../models/class/ResultList';
import {ResultCodeEnum} from "../enum/http.enum";
import {v4 as uuidv4} from "uuid";
import User from "../models/user.models";
import {UserInterface} from "../interface/user";
import moment from "moment/moment";


/**
 * 分页查询文件
 * @param req
 * @param res
 */
const allFiles = async (req: Request, res: Response) => {
    const {pageNum, pageSize} = req.body;
    const begin = (pageNum - 1) * pageSize;
    // 查询所有文件的数量
    const fileCount = await Filedb.find({}).count();
    let totalPage: number;
    // 获取总分页数量
    if (pageSize === 0) {
        totalPage = 0;
    } else {
        totalPage = Math.trunc(fileCount % pageSize === 0 ? fileCount / pageSize : fileCount / pageSize + 1);
    }
    // 跳过offset个实例,然后获取limit个实例
    const fileList: any[] = await Filedb.find({}).skip(begin).limit(pageSize);
    const filePageList = fileList.map(item => {
        item.created = moment(item.created, 'DD/MM/YYYY HH:mm:ss');
        item.updated = moment(item.updated, 'DD/MM/YYYY HH:mm:ss');
        return item;
    });
    const data = new ResultListPage(
        200,
        '查询成功',
        filePageList,
        pageNum,
        pageSize,
        fileCount,
        totalPage
    );
    res.status(200).json(data);
};

/**
 * 上传文件
 * @param req
 * @param res
 */
const path = '/data/files';
const storage = multer.diskStorage({
    // 文件上传的地址
    destination: (req, file, callback) => {
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const dir = `${path}-${year}-${month}`;
        //判断目录是否存在，没有则创建
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {
                recursive: true,
            });
        }
        callback(null, dir);
    },
    // 文件名称
    filename: (req, file, callback) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        callback(null, file.originalname);
    },
});
// multer配置项
const uploadMulter = multer({storage: storage});
const upload = async (req: Request | any, res: Response) => {
    // multer将请求中的文件存储之后，会把文件的信息(包括文件存储时的文件名)放入req.file对象中。(如果用的是upload.array，则会放在req.files中)
    // multer还会把本次表单提交的文本字段(如果有)解析为对象存入req.body中
    // console.log('单个文件：', req.file);
    // console.log('多个文件：', req.files);
    // 用户ID
    const userId = req.header('userId') as string;
    const user: UserInterface | null = await User.findOne({id: userId});
    if (!user) {
        return res.status(400).json({
            code: ResultCodeEnum.fail,
            msg: '参数异常',
        });
    }
    if (req.file) {
        const file: any = await Filedb.findOne({filename: req.file.filename});
        // 判断是否存在
        if (file && file.filesize === req.file.size) {
            return res.json({
                code: ResultCodeEnum.fail,
                msg: `文件已存在`
            });
        }
        const pathUrl = `${req.file?.destination}/${req.file?.originalname}`; // 指定文件路径和文件名
        // 成功保存文件
        const newFile = new Filedb({
            id: uuidv4(),
            filename: req.file?.originalname,
            filesize: req.file?.size,
            path: pathUrl,
            uploadUser: user.userName,
            uploadUserId: user.id,
            created: new Date().getTime()
        });
        // 保存
        await newFile.save();
        res.status(200).json({
            code: ResultCodeEnum.success,
            msg: `上传成功`,
            url: pathUrl, // 复制URL链接直接浏览器可以访问
        });
    } else if (req.files) {
        let filesName: string[] = [];
        let filesPathUrl: string[] = [];
        for (let i = 0; i < req.files.length; i++) {
            filesName.push(`${req.files[i].originalname}`);
            filesPathUrl.push(`${path}/${req.files[i].originalname}`);
        }
        // 成功保存文件
        await Filedb.create({
            filename: JSON.stringify(filesName),
            filesize: req.files?.size,
            path: JSON.stringify(filesPathUrl),
        });
        const newFile = new Filedb({
            id: uuidv4(),
            filename: JSON.stringify(filesName),
            filesize: req.files?.size,
            path: JSON.stringify(filesPathUrl),
            uploadUser: user.userName,
            uploadUserId: user.id,
            created: new Date().getTime()
        });
        // 保存
        await newFile.save();
        res.status(200).json({
            code: ResultCodeEnum.success,
            msg: `上传成功`,
        });
    } else {
        res.status(400).json({
            code: ResultCodeEnum.fail,
            msg: `上传失败`,
        });
    }
};

/**
 * 下载文件
 * @param req
 * @param res
 */
const download = async (req: Request, res: Response) => {
    const {filename} = req.body;
    const file: any = await Filedb.findOne({filename});
    if (!file) {
        return res.json({
            code: ResultCodeEnum.fail,
            msg: `文件不存在`,
        });
    }
    // 更新下载次数
    await Filedb.updateOne(
        {id: file.id},
        {downloadCount: file.downloadCount + 1},
        function (err: any, res: any) {
            if (err) throw err;
            console.log(res);
        });
    res.download(file.path);
};

/**
 * 删除文件
 * @param req
 * @param res
 */
const deleteFile = async (req: Request, res: Response) => {
    const {id} = req.body;
    const file: any = await Filedb.findOne({id});
    if (!file) {
        return res.json({
            code: ResultCodeEnum.fail,
            msg: `文件不存在`,
        });
    }
    try {
        fs.unlink(file.path, (err) => {
            console.log(err);
        });
        // 成功删除
        await Filedb.deleteOne({id});
        res.json({
            code: ResultCodeEnum.success,
            msg: `文件删除成功`,
        });
    } catch (error) {
        res.json({
            code: ResultCodeEnum.fail,
            msg: `文件删除失败`,
            error,
        });
    }
};
export {uploadMulter, allFiles, upload, download, deleteFile};
