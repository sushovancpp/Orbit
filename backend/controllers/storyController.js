const { Story } = require('../models');
const { Notification } = require('../models');

exports.getStories = async (req, res) => {
  try {
    const followingIds = [...req.user.following, req.user._id];
    const stories = await Story.find({
      author: { $in: followingIds },
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate('author', 'username name avatar isVerified')
      .sort({ createdAt: -1 });
    res.json({ success: true, stories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createStory = async (req, res) => {
  try {
    const { text, textColor, bgColor } = req.body;
    const story = await Story.create({
      author: req.user._id,
      media: req.file
        ? { url: req.file.path, publicId: req.file.filename, type: req.file.mimetype.startsWith('video') ? 'video' : 'image' }
        : undefined,
      text, textColor, bgColor,
    });
    await story.populate('author', 'username name avatar isVerified');
    res.status(201).json({ success: true, story });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
    const alreadyViewed = story.viewers.some(v => v.user.toString() === req.user._id.toString());
    if (!alreadyViewed) {
      story.viewers.push({ user: req.user._id, viewedAt: new Date() });
      await story.save();
      if (story.author.toString() !== req.user._id.toString()) {
        await Notification.create({ recipient: story.author, sender: req.user._id, type: 'story_view' });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
    if (story.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await story.deleteOne();
    res.json({ success: true, message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
