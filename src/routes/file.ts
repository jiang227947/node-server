import { Router } from 'express';
import { download, upload, uploadMulter } from '../controllers/file';

const FileOperation = Router();
/**
 * 路由对象上挂载路由
 */
FileOperation.post('/api/uploadFile', uploadMulter.array('file'), upload);
FileOperation.post('/api/download', download);
export default FileOperation;
