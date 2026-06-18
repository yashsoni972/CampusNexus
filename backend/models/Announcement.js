const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Academic', 'Administrative', 'Cultural', 'Sports', 'Placement', 'Holiday', 'Exam', 'General'],
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Target audience
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'faculty', 'specific_department', 'specific_batch'],
    default: 'all'
  },
  targetDepartment: {
    type: String
  },
  targetBatch: {
    type: String
  },
  // Visibility
  isPublished: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  // Scheduling
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  // Attachments
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }],
  // Engagement
  views: {
    type: Number,
    default: 0
  },
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  tags: [{ type: String, trim: true }]
}, {
  timestamps: true
});

announcementSchema.index({ category: 1 });
announcementSchema.index({ isPublished: 1, publishDate: -1 });
announcementSchema.index({ isPinned: -1, publishDate: -1 });
announcementSchema.index({ targetAudience: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
