const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  isInternal: {
    type: Boolean,
    default: false // internal notes visible only to admin/faculty
  }
}, { timestamps: true });

const complaintSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Academic', 'Infrastructure', 'Administrative', 'Hostel', 'Library', 'Canteen', 'IT Support', 'Harassment', 'Other'],
    required: [true, 'Category is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Timeline tracking
  statusHistory: [{
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed', 'rejected']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  // Communication thread
  comments: [commentSchema],
  // Attachments
  attachments: [{
    filename: String,
    url: String
  }],
  // Resolution
  resolvedAt: {
    type: Date
  },
  resolutionNote: {
    type: String
  },
  // Feedback from student
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-generate ticket ID before saving
complaintSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Complaint').countDocuments();
    const year = new Date().getFullYear().toString().slice(-2);
    this.ticketId = `TKT-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// ticketId already indexed via unique:true above
complaintSchema.index({ submittedBy: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
