const Mail = require('../models/Mail');
const User = require('../models/User');
const fs   = require('fs');
const path = require('path');

// Lazy-load io to avoid circular dependency
const getIO = () => {
  try { return require('../server').io; } catch { return null; }
};

const POPULATE_FROM = { path: 'from', select: 'name email avatar role department' };
const POPULATE_TO   = { path: 'to.user', select: 'name email avatar role' };
const POPULATE_CC   = { path: 'cc.user', select: 'name email avatar role' };

// ── Helpers ──────────────────────────────────────────────────────────────────
const resolveRecipients = async (list = []) => {
  const result = [];
  for (const item of list) {
    const id = item._id || item.id || item;
    try {
      const u = await User.findById(id).select('_id email');
      if (u) result.push({ user: u._id, email: u.email });
    } catch {}
  }
  return result;
};

// ── GET /api/mail/inbox ───────────────────────────────────────────────────────
const getInbox = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const base = {
      'to.user': req.user._id,
      isDraft: false,
      to: { $elemMatch: { user: req.user._id, folder: 'inbox' } }
    };
    if (search) base.$or = [
      { subject: { $regex: search, $options: 'i' } },
      { body:    { $regex: search, $options: 'i' } }
    ];

    const [mails, total] = await Promise.all([
      Mail.find(base).populate(POPULATE_FROM).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Mail.countDocuments(base)
    ]);

    // Attach per-user read state
    const data = mails.map(m => {
      const rec = m.to.find(r => r.user?.toString() === req.user._id.toString());
      return { ...m.toObject(), read: rec?.read || false };
    });

    res.json({ mails: data, total, totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
};

// ── GET /api/mail/sent ────────────────────────────────────────────────────────
const getSent = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const base = { from: req.user._id, isDraft: false, senderFolder: 'sent' };
    if (search) base.$or = [
      { subject: { $regex: search, $options: 'i' } },
      { body:    { $regex: search, $options: 'i' } }
    ];
    const [mails, total] = await Promise.all([
      Mail.find(base).populate(POPULATE_FROM).populate(POPULATE_TO).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Mail.countDocuments(base)
    ]);
    res.json({ mails, total, totalPages: Math.ceil(total / parseInt(limit)) });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// ── GET /api/mail/drafts ──────────────────────────────────────────────────────
const getDrafts = async (req, res) => {
  try {
    const mails = await Mail.find({ from: req.user._id, isDraft: true })
      .populate(POPULATE_FROM).populate(POPULATE_TO).sort({ updatedAt: -1 });
    res.json({ mails });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// ── GET /api/mail/trash ───────────────────────────────────────────────────────
const getTrash = async (req, res) => {
  try {
    const [sent, received] = await Promise.all([
      Mail.find({ from: req.user._id, senderFolder: 'trash' }).populate(POPULATE_FROM).populate(POPULATE_TO).sort({ createdAt: -1 }),
      Mail.find({ to: { $elemMatch: { user: req.user._id, folder: 'trash' } } }).populate(POPULATE_FROM).sort({ createdAt: -1 })
    ]);
    const all = [...sent, ...received].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ mails: all });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// ── GET /api/mail/:id ─────────────────────────────────────────────────────────
const getMail = async (req, res) => {
  try {
    const mail = await Mail.findById(req.params.id)
      .populate(POPULATE_FROM).populate(POPULATE_TO).populate(POPULATE_CC);
    if (!mail) return res.status(404).json({ message: 'Mail not found' });

    const uid = req.user._id.toString();
    const isFrom = mail.from._id.toString() === uid;
    const isTo   = mail.to.some(r => r.user?._id?.toString() === uid || r.user?.toString() === uid);
    const isCc   = mail.cc.some(r => r.user?._id?.toString() === uid || r.user?.toString() === uid);

    if (!isFrom && !isTo && !isCc) return res.status(403).json({ message: 'Access denied' });

    // Mark as read
    if (isTo) {
      const rec = mail.to.find(r => (r.user?._id || r.user)?.toString() === uid);
      if (rec && !rec.read) { rec.read = true; rec.readAt = new Date(); await mail.save(); }
    }

    res.json({ mail });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// ── POST /api/mail/compose ────────────────────────────────────────────────────
const composeMail = async (req, res) => {
  try {
    const { to = [], cc = [], subject, body, tags = [], isDraft = false, draftId } = req.body;

    const parsedTo   = JSON.parse(typeof to   === 'string' ? to   : JSON.stringify(to));
    const parsedCc   = JSON.parse(typeof cc   === 'string' ? cc   : JSON.stringify(cc));
    const parsedTags = JSON.parse(typeof tags === 'string' ? tags : JSON.stringify(tags));

    const toRecipients = await resolveRecipients(parsedTo);
    const ccRecipients = await resolveRecipients(parsedCc);

    const attachments = (req.files || []).map(f => ({
      filename:     f.filename,
      originalName: f.originalname,
      mimetype:     f.mimetype,
      size:         f.size,
      path:         f.path
    }));

    // Update existing draft
    if (draftId) {
      const draft = await Mail.findOne({ _id: draftId, from: req.user._id, isDraft: true });
      if (draft) {
        draft.to          = toRecipients;
        draft.cc          = ccRecipients;
        draft.subject     = subject || '(No Subject)';
        draft.body        = body || '';
        draft.tags        = parsedTags;
        draft.isDraft     = isDraft;
        draft.senderFolder = isDraft ? 'sent' : 'sent';
        draft.sentAt      = isDraft ? undefined : new Date();
        if (attachments.length) draft.attachments.push(...attachments);
        await draft.save();
        return res.json({ message: isDraft ? 'Draft saved' : 'Mail sent', mail: draft });
      }
    }

    const mail = await Mail.create({
      from: req.user._id,
      to: toRecipients,
      cc: ccRecipients,
      subject: subject || '(No Subject)',
      body: body || '',
      tags: parsedTags,
      attachments,
      isDraft,
      senderFolder: 'sent',
      sentAt: isDraft ? undefined : new Date()
    });

    await mail.populate(POPULATE_FROM);
    await mail.populate(POPULATE_TO);

    // Emit real-time notification to each recipient
    if (!isDraft) {
      const io = getIO();
      if (io) {
        for (const rec of toRecipients) {
          io.to(`user_${rec.user}`).emit('new_mail', {
            _id: mail._id, subject: mail.subject,
            from: { _id: req.user._id, name: req.user.name },
            createdAt: mail.createdAt
          });
        }
      }
    }

    res.status(201).json({ message: isDraft ? 'Draft saved' : 'Mail sent', mail });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PUT /api/mail/:id/read ────────────────────────────────────────────────────
const markRead = async (req, res) => {
  try {
    const mail = await Mail.findById(req.params.id);
    if (!mail) return res.status(404).json({ message: 'Not found' });
    const rec = mail.to.find(r => r.user?.toString() === req.user._id.toString());
    if (rec) { rec.read = req.body.read !== false; rec.readAt = new Date(); await mail.save(); }
    res.json({ message: 'Updated' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// ── PUT /api/mail/:id/trash ───────────────────────────────────────────────────
const trashMail = async (req, res) => {
  try {
    const mail = await Mail.findById(req.params.id);
    if (!mail) return res.status(404).json({ message: 'Not found' });
    const uid = req.user._id.toString();

    if (mail.from.toString() === uid) {
      mail.senderFolder = 'trash';
    } else {
      const rec = mail.to.find(r => r.user?.toString() === uid);
      if (rec) rec.folder = 'trash';
    }
    await mail.save();
    res.json({ message: 'Moved to trash' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// ── DELETE /api/mail/:id ──────────────────────────────────────────────────────
const deleteMail = async (req, res) => {
  try {
    const mail = await Mail.findById(req.params.id);
    if (!mail) return res.status(404).json({ message: 'Not found' });
    if (mail.from.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Delete attachment files
    for (const att of mail.attachments) {
      try { fs.unlinkSync(path.resolve(att.path)); } catch {}
    }
    await Mail.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted permanently' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// ── GET /api/mail/unread-count ────────────────────────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const count = await Mail.countDocuments({
      to: { $elemMatch: { user: req.user._id, read: false, folder: 'inbox' } },
      isDraft: false
    });
    res.json({ count });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// ── GET /api/mail/users/search ─────────────────────────────────────────────────
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) return res.json({ users: [] });
    const users = await User.find({
      _id: { $ne: req.user._id },
      isActive: true,
      $or: [
        { name:  { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).select('name email avatar role department').limit(8);
    res.json({ users });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

module.exports = {
  getInbox, getSent, getDrafts, getTrash,
  getMail, composeMail, markRead, trashMail,
  deleteMail, getUnreadCount, searchUsers
};
