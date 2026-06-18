const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');
const {
  getInbox, getSent, getDrafts, getTrash,
  getMail, composeMail, markRead, trashMail,
  deleteMail, getUnreadCount, searchUsers
} = require('../controllers/mailController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/mail/'),
  filename:    (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|xlsx|pptx/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    cb(null, allowed.test(ext));
  }
});

router.get('/unread-count',  protect, getUnreadCount);
router.get('/users/search',  protect, searchUsers);
router.get('/inbox',         protect, getInbox);
router.get('/sent',          protect, getSent);
router.get('/drafts',        protect, getDrafts);
router.get('/trash',         protect, getTrash);
router.get('/:id',           protect, getMail);
router.post('/compose',      protect, upload.array('attachments', 5), composeMail);
router.put('/:id/read',      protect, markRead);
router.put('/:id/trash',     protect, trashMail);
router.delete('/:id',        protect, deleteMail);

module.exports = router;
