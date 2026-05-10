const mongoose = require('mongoose');

// ─── Story ───────────────────────────────────────────────────────────────────
const storySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media: { url: String, publicId: String, type: { type: String, enum: ['image', 'video'] } },
  text: { type: String, maxlength: 200, default: '' },
  textColor: { type: String, default: '#ffffff' },
  bgColor: { type: String, default: '#000000' },
  viewers: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, viewedAt: Date }],
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ─── Chat / Message ───────────────────────────────────────────────────────────
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  media: { url: String, type: String },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  name: { type: String, default: '' },
  avatar: { type: String, default: '' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [messageSchema],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  lastActivity: { type: Date, default: Date.now },
}, { timestamps: true });

chatSchema.index({ members: 1 });

// ─── Notification ─────────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'comment', 'follow', 'mention', 'reply', 'repost', 'story_view', 'poll_vote'], required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  text: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = {
  Story: mongoose.model('Story', storySchema),
  Chat: mongoose.model('Chat', chatSchema),
  Message: mongoose.model('Message', messageSchema),
  Notification: mongoose.model('Notification', notificationSchema),
};
