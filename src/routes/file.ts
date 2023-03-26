import {Router} from 'express';
import {allFiles, deleteFile, download, upload, uploadMulter} from '../controllers/file';
import validateToken from "./validate-token";

const FileOperation = Router();
/**
 * 路由对象上挂载路由
 */
FileOperation.post('/api/queryFileList', validateToken, allFiles);
FileOperation.post('/api/uploadFile', validateToken, uploadMulter.single('file'), upload);
FileOperation.post('/api/download', validateToken, download);
FileOperation.post('/api/deleteFile', validateToken, deleteFile);
export default FileOperation;
