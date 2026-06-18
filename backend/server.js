const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Google DNS - fixes SRV lookup on restricted networks


const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const announcementRoutes = require('./routes/announcements');
const complaintRoutes = require('./routes/complaints');
const eventRoutes = require('./routes/events');
const dashboardRoutes = require('./routes/dashboard');
const clubRoutes = require('./routes/clubs');
const mailRoutes = require('./routes/mail');
const ClubMessage = require('./models/ClubMessage');
const Club = require('./models/Club');
const User = require('./models/User');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/mail',  mailRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CampusNexus API is running', timestamp: new Date() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection with retry logic
const connectDB = async (retries = 5) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI is missing. Put your Mongo Atlas URI in backend/.env');
      }

      // Atlas (SRV) + safer mongoose options
// Ensure Atlas authSource=admin for SRV/Atlas users
      let finalUri = mongoUri;
      if (!/authSource=/.test(finalUri)) {
        const joinChar = finalUri.includes('?') ? '&' : '?';
        finalUri = `${finalUri}${joinChar}authSource=admin`;
      }

      await mongoose.connect(finalUri, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        maxPoolSize: 10,
        family: 4
      });
      console.log('✅ MongoDB connected successfully');
      console.log('🔌 Mongo host:', (process.env.MONGODB_URI.match(/@([^/?]+)/)?.[1] || 'unknown'));
      return true;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${i}/${retries} failed:`, error.message);
      if (i === retries) {
        console.error('⚠️ MongoDB not available after retries. Server will still start, but API requiring DB will fail.');
        return false;
      }
      console.log(`⏳ Retrying in 3 seconds...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  return false;
};


const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// ── Socket.io WebSocket chat ────────────────────────────────────────────────
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return next(new Error('Unauthorized'));
    socket.user = user;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  // Join a club room
  socket.on('join_club', async (clubId) => {
    try {
      const club = await Club.findById(clubId);
      if (!club) return;
      const isMember = club.members.some(m => m.user.toString() === socket.user._id.toString());
      if (!isMember) return;
      socket.join(clubId);
    } catch {}
  });

  // Leave a club room
  socket.on('leave_club', (clubId) => {
    socket.leave(clubId);
  });

  // Send message
  socket.on('send_message', async ({ clubId, text }) => {
    try {
      if (!text?.trim()) return;
      const club = await Club.findById(clubId);
      if (!club) return;
      const isMember = club.members.some(m => m.user.toString() === socket.user._id.toString());
      if (!isMember) return;

      const msg = await ClubMessage.create({
        club: clubId,
        sender: socket.user._id,
        text: text.trim()
      });
      await msg.populate('sender', 'name avatar role');

      io.to(clubId).emit('new_message', msg);
    } catch {}
  });

  // Typing indicator
  socket.on('typing', ({ clubId, isTyping }) => {
    socket.to(clubId).emit('user_typing', {
      userId: socket.user._id,
      name: socket.user.name,
      isTyping
    });
  });

  // Join personal room for mail notifications
  socket.join(`user_${socket.user._id}`);
});

// ────────────────────────────────────────────────────────────────────────────

connectDB().finally(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 CampusNexus API running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

module.exports = { app, io };
