const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 500 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, maxlength: 300 },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, maxlength: 2000, default: '' },
  media: [{
    url: String,
    publicId: String,
    type: { type: String, enum: ['image', 'video'] },
    thumbnail: String,
  }],
  type: { type: String, enum: ['post', 'reel', 'story'], default: 'post' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [{ type: String }],
  hashtags: [{ type: String }],
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  poll: {
    question: String,
    options: [pollOptionSchema],
    expiresAt: Date,
  },
  location: { type: String, default: '' },
  isArchived: { type: Boolean, default: false },
  visibility: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
  views: { type: Number, default: 0 },
  repostOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
}, { timestamps: true });

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ content: 'text' });

module.exports = mongoose.model('Post', postSchema);
