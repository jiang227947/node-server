import {Request, Response} from 'express';
import multer from 'multer';

/**
 * 上传文件
 * @param req
 * @param res
 */
const storage = multer.diskStorage({
    // 文件上传的地址
    destination: (req, file, callback) => {
        callback(null, 'D:/Git/code/node-server/src/util/files');
    },
    // 文件名称
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    },
});
// multer配置项
const uploadMulter = multer({storage: storage});
const upload = (req: Request, res: Response) => {
    // multer将请求中的文件存储之后，会把文件的信息(包括文件存储时的文件名)放入req.file对象中。(如果用的是upload.array，则会放在req.files中)
    // multer还会把本次表单提交的文本字段(如果有)解析为对象存入req.body中
    // console.log('单个文件：',req.file);
    // console.log('多个文件', req.files);
    let oldName = req.file?.path; // 上传后默认的文件名 : 15daede910f2695c1352dccbb5c3e897
    let newName = 'upload/' + req.file?.originalname  // 指定文件路径和文件名
    if (req.file) {
        res.status(200).json({
            msg: `上传成功`,
            url: 'D:/Git/code/node-server/src/util/files' + newName // 复制URL链接直接浏览器可以访问
        });
    } else {
        res.status(400).json({
            msg: `上传失败`,
        });
    }
}
/**
 * 下载文件
 * @param req
 * @param res
 */
const download = async (req: Request, res: Response) => {
    res.download(__dirname + '/files/ES6.txt');
};
export {uploadMulter, upload, download};
