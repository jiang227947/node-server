import { Router } from 'express';
import { download, upload } from '../controllers/file';

const router = Router();

router.post('/', upload.handler, upload.body);
router.post('/', download);

export default router;
