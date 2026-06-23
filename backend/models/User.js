const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student'
  },
  rollNumber: {
    type: String,
    sparse: true,
    trim: true
  },
  employeeId: {
    type: String,
    sparse: true,
    trim: true
  },

  // Academic Info
  department: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    min: 1,
    max: 4
  },
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  designation: {
    type: String,
    trim: true
  },
  batch: {
    type: String,
    trim: true
  },
  section: {
    type: String,
    trim: true
  },
  program: {
    type: String,
    enum: ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'Other'],
    default: 'B.Tech'
  },

  // Profile
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number (exactly 10 digits)']
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },

  // Academic performance
  cgpa: {
    type: Number,
    min: 0,
    max: 10
  },
  attendance: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Social links
  linkedIn: String,
  github: String,

  // Skills (for student profiles) — with proficiency
  skills: [{
    name: { type: String, trim: true, required: true },
    proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Proficient', 'Expert'], default: 'Intermediate' }
  }],

  // Achievements
  achievements: [{
    title: { type: String, trim: true, required: true },
    type: { type: String, enum: ['Award', 'Certification', 'Leadership', 'Publication', 'Competition', 'Other'], default: 'Other' },
    organization: { type: String, trim: true },
    date: { type: Date },
    description: { type: String, trim: true, maxlength: 500 },
    icon: { type: String, default: '🏆' },
    certificateUrl: { type: String, trim: true }
  }],

  // Projects
  projects: [{
    name: { type: String, trim: true, required: true },
    description: { type: String, trim: true, maxlength: 500 },
    technologies: { type: String, trim: true },
    status: { type: String, enum: ['In Progress', 'Completed'], default: 'In Progress' },
    githubUrl: { type: String, trim: true },
    liveUrl: { type: String, trim: true }
  }],

  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },

  // Parent/Guardian info (for students)
  guardian: {
    name: String,
    phone: String,
    relation: String
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Indexes for performance (email and rollNumber already indexed via unique:true)
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

module.exports = mongoose.model('User', userSchema);
