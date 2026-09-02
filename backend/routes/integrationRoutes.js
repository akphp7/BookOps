import express from 'express';
import {
  getEmailStatus,
  getGoogleConnectUrl,
  handleGoogleCallback,
  sendEmailTest,
} from '../controllers/integrationController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/google/connect', auth, getGoogleConnectUrl);
router.get('/google/callback', handleGoogleCallback);
router.get('/email/status', auth, getEmailStatus);
router.post('/email/test', auth, sendEmailTest);

export default router;
