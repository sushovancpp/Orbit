const User = require('../models/User');
const Post = require('../models/Post');
const { Notification } = require('../models');

exports.getStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [users, posts, todaySignups, todayPosts] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments({ isArchived: false }),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      Post.countDocuments({ createdAt: { $gte: todayStart } }),
    ]);
    res.json({ success: true, stats: { users, posts, todaySignups, todayPosts } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (role) query.role = role;
    const [users, total] = await Promise.all([
      User.find(query).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.setRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ success: false, message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, message: 'Post removed by admin' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReportedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ 'reports.0': { $exists: true } })
      .populate('author', 'username avatar')
      .sort({ 'reports.length': -1 })
      .limit(50);
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
