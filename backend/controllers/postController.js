const Post = require('../models/Post');
const { Notification } = require('../models');
const { getIO } = require('../sockets');

exports.createPost = async (req, res) => {
  try {
    const { content, type, tags, hashtags, visibility, poll, location } = req.body;
    const media = (req.files || []).map(f => ({
      url: f.path, publicId: f.filename,
      type: f.mimetype.startsWith('video') ? 'video' : 'image',
    }));
    const post = await Post.create({
      author: req.user._id, content, type: type || 'post',
      media, tags: tags ? JSON.parse(tags) : [],
      hashtags: hashtags ? JSON.parse(hashtags) : extractHashtags(content),
      visibility: visibility || 'public', location,
      poll: poll ? JSON.parse(poll) : undefined,
    });
    await post.populate('author', 'username name avatar isVerified');
    res.status(201).json({ success: true, post });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const followingIds = req.user.following;
    const posts = await Post.find({
      $or: [{ author: { $in: followingIds } }, { author: req.user._id }],
      type: 'post', isArchived: false,
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit))
      .populate('author', 'username name avatar isVerified')
      .populate('comments.user', 'username avatar');
    res.json({ success: true, posts, page: Number(page) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'username name avatar isVerified')
      .populate('comments.user', 'username name avatar');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const liked = post.likes.includes(req.user._id);
    if (liked) post.likes.pull(req.user._id);
    else {
      post.likes.push(req.user._id);
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({ recipient: post.author, sender: req.user._id, type: 'like', post: post._id });
        getIO()?.to(post.author.toString()).emit('notification', { type: 'like' });
      }
    }
    await post.save();
    res.json({ success: true, likes: post.likes.length, liked: !liked });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const comment = { user: req.user._id, text };
    post.comments.push(comment);
    await post.save();
    await post.populate('comments.user', 'username avatar');
    const newComment = post.comments[post.comments.length - 1];
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({ recipient: post.author, sender: req.user._id, type: 'comment', post: post._id, text: text.slice(0, 80) });
      getIO()?.to(post.author.toString()).emit('notification', { type: 'comment' });
    }
    res.status(201).json({ success: true, comment: newComment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post?.poll) return res.status(404).json({ success: false, message: 'Poll not found' });
    if (new Date() > new Date(post.poll.expiresAt))
      return res.status(400).json({ success: false, message: 'Poll expired' });
    post.poll.options.forEach(opt => opt.votes.pull(req.user._id));
    post.poll.options[optionIndex].votes.push(req.user._id);
    await post.save();
    res.json({ success: true, poll: post.poll });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

function extractHashtags(text = '') {
  return (text.match(/#\w+/g) || []).map(t => t.slice(1).toLowerCase());
}
