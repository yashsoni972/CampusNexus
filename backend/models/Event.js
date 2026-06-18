const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [3000, 'Description cannot exceed 3000 characters']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizerName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Academic', 'Cultural', 'Sports', 'Technical', 'Workshop', 'Seminar', 'Placement', 'Holiday', 'Exam', 'Other'],
    required: [true, 'Category is required']
  },
  // Date and time
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  isAllDay: {
    type: Boolean,
    default: false
  },
  // Location
  venue: {
    type: String,
    trim: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  meetingLink: {
    type: String
  },
  // Audience
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'faculty', 'specific_department', 'specific_batch'],
    default: 'all'
  },
  targetDepartment: String,
  targetBatch: String,
  // Registration
  requiresRegistration: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number
  },
  registrationDeadline: {
    type: Date
  },
  registeredUsers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredAt: { type: Date, default: Date.now }
  }],
  // Status
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Media
  banner: {
    type: String
  },
  attachments: [{
    filename: String,
    url: String
  }],
  // Color for calendar display
  color: {
    type: String,
    default: '#4F46E5'
  },
  tags: [{ type: String, trim: true }]
}, {
  timestamps: true
});

// Validate end date is after start date
eventSchema.pre('save', function(next) {
  if (this.endDate < this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

eventSchema.index({ startDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ organizer: 1 });

module.exports = mongoose.model('Event', eventSchema);
