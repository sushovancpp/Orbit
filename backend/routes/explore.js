// explore.js
const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const eRouter = express.Router();

eRouter.get('/trending', optionalAuth, async (req, res) => {
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const posts = await Post.find({ createdAt: { $gte: since }, type: 'post', isArchived: false })
    .sort({ likes: -1, views: -1 }).limit(20)
    .populate('author', 'username name avatar isVerified');
  res.json({ success: true, posts });
});

eRouter.get('/search', optionalAuth, async (req, res) => {
  const { q, type = 'posts', page = 1 } = req.query;
  if (!q) return res.json({ success: true, results: [] });
  let results = [];
  if (type === 'posts') {
    results = await Post.find({ $text: { $search: q }, isArchived: false })
      .sort({ score: { $meta: 'textScore' } }).skip((page - 1) * 10).limit(10)
      .populate('author', 'username name avatar isVerified');
  } else if (type === 'users') {
    results = await User.find({ $text: { $search: q } })
      .select('username name avatar isVerified followers').limit(10);
  } else if (type === 'hashtags') {
    results = await Post.find({ hashtags: q.replace('#', '') })
      .sort({ createdAt: -1 }).limit(15)
      .populate('author', 'username avatar');
  }
  res.json({ success: true, results });
});

eRouter.get('/reels', optionalAuth, async (req, res) => {
  const reels = await Post.find({ type: 'reel', isArchived: false })
    .sort({ createdAt: -1 }).limit(20).populate('author', 'username avatar isVerified');
  res.json({ success: true, reels });
});

module.exports = eRouter;
