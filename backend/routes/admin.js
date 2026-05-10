const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { getStats, getUsers, banUser, unbanUser, setRole, deletePost, getReportedPosts } = require('../controllers/adminController');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);
router.patch('/users/:id/role', setRole);
router.delete('/posts/:id', deletePost);
router.get('/reports', getReportedPosts);

module.exports = router;
