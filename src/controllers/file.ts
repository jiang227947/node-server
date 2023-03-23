import { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import Filedb from '../models/file';

/**
 * 上传文件
 * @param req
 * @param res
 */
const path = 'D:/code/code/file';
const storage = multer.diskStorage({
  // 文件上传的地址
  destination: (req, file, callback) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate();
    const dir = path + year + month + day;
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
const uploadMulter = multer({ storage: storage });
const upload = async (req: Request, res: Response) => {
  // multer将请求中的文件存储之后，会把文件的信息(包括文件存储时的文件名)放入req.file对象中。(如果用的是upload.array，则会放在req.files中)
  // multer还会把本次表单提交的文本字段(如果有)解析为对象存入req.body中
  // console.log('单个文件：', req.file);
  // console.log('多个文件：', req.files);
  if (req.file) {
    const pathUrl = `${path}/${req.file?.originalname}`; // 指定文件路径和文件名
    // 成功保存文件
    await Filedb.create({
      filename: req.file?.originalname,
      path: pathUrl,
    });
    res.status(200).json({
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
      path: JSON.stringify(filesPathUrl),
    });
    res.status(200).json({
      msg: `上传成功`,
    });
  } else {
    res.status(400).json({
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
  console.log(req);

  res.download(__dirname + '/files/ES6.txt');
};
export { uploadMulter, upload, download };
