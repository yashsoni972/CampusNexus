const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getClubs, getClub, createClub, updateClub, deleteClub,
  joinClub, leaveClub, changeMemberRole, removeMember, getMessages
} = require('../controllers/clubController');

router.get('/',            protect, getClubs);
router.get('/:id',         protect, getClub);
router.post('/',           protect, authorize('admin', 'faculty'), createClub);
router.put('/:id',         protect, updateClub);
router.delete('/:id',      protect, authorize('admin'), deleteClub);

router.post('/:id/join',   protect, joinClub);
router.post('/:id/leave',  protect, leaveClub);

router.put('/:id/members/:userId/role',  protect, changeMemberRole);
router.delete('/:id/members/:userId',    protect, removeMember);

router.get('/:id/messages', protect, getMessages);

module.exports = router;
