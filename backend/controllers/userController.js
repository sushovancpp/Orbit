const User = require('../models/User');
const Post = require('../models/Post');
const { Notification } = require('../models');
const { getIO } = require('../sockets');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -oauthId -blockedUsers');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const posts = await Post.find({ author: user._id, isArchived: false, type: 'post' })
      .sort({ createdAt: -1 }).limit(12).select('media likes comments views');
    res.json({ success: true, user, posts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, website, location, isPrivate } = req.body;
    const updates = { name, bio, website, location, isPrivate };
    if (req.file) updates.avatar = req.file.path;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    const isFollowing = req.user.following.includes(targetId);
    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: targetId } });
      await User.findByIdAndUpdate(targetId, { $pull: { followers: req.user._id } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetId } });
      await User.findByIdAndUpdate(targetId, { $addToSet: { followers: req.user._id } });
      await Notification.create({ recipient: targetId, sender: req.user._id, type: 'follow' });
      getIO()?.to(targetId).emit('notification', { type: 'follow' });
    }
    res.json({ success: true, following: !isFollowing });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username name avatar isVerified');
    res.json({ success: true, followers: user.followers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username name avatar isVerified');
    res.json({ success: true, following: user.following });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q) return res.json({ success: true, users: [] });
    const users = await User.find({ $text: { $search: q } })
      .select('username name avatar isVerified followers')
      .skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getSuggestedUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $nin: [...req.user.following, req.user._id] },
    }).limit(8).select('username name avatar isVerified followers');
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
