const mongoose = require('mongoose');

const DiscussionCommentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionComment', default: null },
  replyToUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isEdited: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

module.exports = mongoose.model('DiscussionComment', DiscussionCommentSchema);
