const { Chat } = require('../models');

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.user._id })
      .populate('members', 'username name avatar lastSeen')
      .sort({ lastActivity: -1 });
    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const chat = await Chat.findOne({ _id: req.params.id, members: req.user._id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    const limit = 50;
    const messages = chat.messages.slice(-(page * limit)).reverse();
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createDM = async (req, res) => {
  try {
    const { userId } = req.body;
    let chat = await Chat.findOne({
      isGroup: false,
      members: { $all: [req.user._id, userId], $size: 2 },
    }).populate('members', 'username name avatar');
    if (!chat) {
      chat = await Chat.create({ members: [req.user._id, userId] });
      await chat.populate('members', 'username name avatar');
    }
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    if (!name || !members?.length)
      return res.status(400).json({ success: false, message: 'Name and members required' });
    const chat = await Chat.create({
      isGroup: true,
      name,
      members: [req.user._id, ...members],
      admins: [req.user._id],
    });
    await chat.populate('members', 'username name avatar');
    res.status(201).json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const chat = await Chat.findOne({ _id: chatId, members: req.user._id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    const msg = chat.messages.id(messageId);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    if (msg.sender.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    msg.isDeleted = true;
    msg.content = '';
    await chat.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
