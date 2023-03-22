import { Request, Response } from 'express';
import multer from 'multer';

/**
 * 上传文件
 * @param req
 * @param res
 */
const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, __dirname + '/uploads');
  },
  filename(req, file, callback) {
    callback(null, file.originalname);
  },
});
const uploads = multer({ storage });

const upload = {
  handler: uploads.array('file'),
  body: (req: Request, res: Response) => {
    console.log('body', req.body);
    console.log('files', req.files);
    console.log('file', req.file);
    res.status(200).json({
      msg: `上传文件`,
    });
  },
};

/**
 * 下载文件
 * @param req
 * @param res
 */
const download = async (req: Request, res: Response) => {
  res.download(__dirname + '/uploads/2022142-FTTH数字化预研项目 阶段汇报-会议纪要20230113.xlsx');
};
export { upload, download };
