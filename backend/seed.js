const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Announcement = require('./models/Announcement');
const Event = require('./models/Event');
const Complaint = require('./models/Complaint');
const Club = require('./models/Club');
const Mail = require('./models/Mail');

const MONGO_URI = process.env.MONGODB_URI;

// ── Users ────────────────────────────────────────────────────────────────────
const USERS = [
  {
    name: 'Admin User', email: 'admin@campusnexus.com', password: 'Admin@123',
    role: 'admin', department: 'Computer Science', isActive: true, isEmailVerified: true,
    bio: 'System administrator for CampusNexus ERP.',
    phone: '9000000001',
  },
  {
    name: 'Dr. Priya Sharma', email: 'priya.sharma@campusnexus.com', password: 'Faculty@123',
    role: 'faculty', department: 'Computer Science', designation: 'Associate Professor',
    isActive: true, isEmailVerified: true, phone: '9000000002',
    bio: 'Teaching Data Structures and Algorithms for 10+ years.',
    employeeId: 'FAC001',
  },
  {
    name: 'Prof. Rajesh Kumar', email: 'rajesh.kumar@campusnexus.com', password: 'Faculty@123',
    role: 'faculty', department: 'Electronics', designation: 'Professor',
    isActive: true, isEmailVerified: true, phone: '9000000003',
    bio: 'Expert in VLSI Design and Embedded Systems.',
    employeeId: 'FAC002',
  },
  {
    name: 'Arjun Mehta', email: 'arjun.mehta@campusnexus.com', password: 'Student@123',
    role: 'student', department: 'Computer Science', year: 3, semester: 5,
    section: 'A', batch: '2022-26', program: 'B.Tech', rollNumber: 'CS22001',
    isActive: true, isEmailVerified: true, phone: '9111111001',
    cgpa: 8.7, attendance: 88,
    bio: 'Passionate about full-stack development and open source.',
    skills: [
      { name: 'React', proficiency: 'Proficient' },
      { name: 'Node.js', proficiency: 'Intermediate' },
      { name: 'Python', proficiency: 'Expert' },
      { name: 'MongoDB', proficiency: 'Intermediate' },
      { name: 'Git', proficiency: 'Proficient' },
      { name: 'Docker', proficiency: 'Beginner' },
    ],
    achievements: [
      { title: '1st Place – State Hackathon 2024', type: 'Competition', organization: 'TechFest IIT Bombay', date: new Date('2024-03-01'), description: 'Built an AI-powered campus navigation app in 24 hours.' },
      { title: 'AWS Certified Cloud Practitioner', type: 'Certification', organization: 'Amazon Web Services', date: new Date('2024-01-01'), description: 'Passed the AWS CCP exam with 890/1000 score.' },
      { title: 'Best Student Developer Award', type: 'Award', organization: 'CampusNexus College', date: new Date('2023-11-01'), description: 'Recognized for outstanding contributions to college tech projects.' },
    ],
    projects: [
      { name: 'CampusNexus ERP', description: 'Full-stack college ERP with real-time chat, complaints, events and mail.', technologies: 'React · Node.js · MongoDB · Socket.IO', status: 'Completed', githubUrl: 'https://github.com/example/campusnexus' },
      { name: 'AI Resume Builder', description: 'Resume generator using GPT-4 API with PDF export.', technologies: 'Python · Flask · OpenAI API · React', status: 'In Progress', githubUrl: 'https://github.com/example/ai-resume' },
    ],
  },
  {
    name: 'Sneha Patel', email: 'sneha.patel@campusnexus.com', password: 'Student@123',
    role: 'student', department: 'Computer Science', year: 2, semester: 4,
    section: 'B', batch: '2023-27', program: 'B.Tech', rollNumber: 'CS23002',
    isActive: true, isEmailVerified: true, phone: '9111111002',
    cgpa: 9.1, attendance: 92,
    bio: 'UI/UX enthusiast and competitive programmer.',
    skills: [
      { name: 'JavaScript', proficiency: 'Expert' },
      { name: 'React', proficiency: 'Expert' },
      { name: 'Figma', proficiency: 'Proficient' },
      { name: 'TypeScript', proficiency: 'Intermediate' },
      { name: 'CSS', proficiency: 'Expert' },
    ],
    achievements: [
      { title: 'Google Girl Hackathon Finalist', type: 'Competition', organization: 'Google', date: new Date('2024-02-01'), description: 'Top 50 nationally in Google Girl Hackathon 2024.' },
      { title: 'Academic Excellence Award', type: 'Award', organization: 'CampusNexus College', date: new Date('2023-12-01'), description: 'Highest CGPA in the department for Semester 3.' },
    ],
    projects: [
      { name: 'Design System Library', description: 'Reusable React component library with Storybook documentation.', technologies: 'React · TypeScript · Tailwind CSS · Storybook', status: 'Completed' },
    ],
  },
  {
    name: 'Rohan Verma', email: 'rohan.verma@campusnexus.com', password: 'Student@123',
    role: 'student', department: 'Electronics', year: 3, semester: 5,
    section: 'A', batch: '2022-26', program: 'B.Tech', rollNumber: 'EC22003',
    isActive: true, isEmailVerified: true, phone: '9111111003',
    cgpa: 7.8, attendance: 74,
    bio: 'IoT and embedded systems enthusiast.',
    skills: [
      { name: 'C++', proficiency: 'Expert' },
      { name: 'Python', proficiency: 'Intermediate' },
      { name: 'Arduino', proficiency: 'Proficient' },
    ],
    achievements: [
      { title: 'Best Project – IoT Expo 2023', type: 'Award', organization: 'Electronics Dept', date: new Date('2023-09-01'), description: 'Smart irrigation system using soil sensors and NodeMCU.' },
    ],
    projects: [
      { name: 'Smart Irrigation System', description: 'Automated plant watering using soil moisture sensors.', technologies: 'C++ · Arduino · NodeMCU · MQTT', status: 'Completed' },
    ],
  },
  {
    name: 'Kavya Nair', email: 'kavya.nair@campusnexus.com', password: 'Student@123',
    role: 'student', department: 'Computer Science', year: 4, semester: 7,
    section: 'A', batch: '2021-25', program: 'B.Tech', rollNumber: 'CS21004',
    isActive: true, isEmailVerified: true, phone: '9111111004',
    cgpa: 8.3, attendance: 85,
    bio: 'Final year student interested in machine learning and data science.',
    skills: [
      { name: 'Python', proficiency: 'Expert' },
      { name: 'MongoDB', proficiency: 'Proficient' },
      { name: 'AWS', proficiency: 'Intermediate' },
      { name: 'Docker', proficiency: 'Intermediate' },
    ],
    achievements: [
      { title: 'Research Paper Published', type: 'Publication', organization: 'IEEE Conference 2024', date: new Date('2024-04-01'), description: 'Published paper on federated learning for healthcare data.' },
    ],
    projects: [
      { name: 'Federated Learning Framework', description: 'Privacy-preserving ML model training across distributed nodes.', technologies: 'Python · TensorFlow · Docker · AWS', status: 'In Progress' },
    ],
  },
];

async function seedUsers() {
  const created = {};
  for (const u of USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) { created[u.email] = existing; continue; }
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(u.password, salt);
    const doc = await User.create({ ...u, password: hashed });
    created[u.email] = doc;
    console.log(`  ✅ User: ${u.name} (${u.role})`);
  }
  return created;
}

module.exports = { seedUsers, USERS };

async function seedAnnouncements(users) {
  const admin = users['admin@campusnexus.com'];
  const faculty = users['priya.sharma@campusnexus.com'];
  const count = await Announcement.countDocuments();
  if (count > 0) { console.log('  ⏭  Announcements already seeded'); return; }
  const items = [
    { title: 'Mid-Semester Examination Schedule Released', content: 'The mid-semester examination schedule for all departments has been released. Students are advised to check the academic portal for their individual timetables. Examinations will be held from November 18–25, 2024. No re-scheduling requests will be entertained after November 10.', author: admin._id, category: 'Exam', priority: 'urgent', targetAudience: 'students', isPinned: true, views: 342 },
    { title: 'Campus Placement Drive – TCS & Infosys', content: 'TCS and Infosys will be conducting their campus placement drives on November 20 and 22 respectively. All final-year B.Tech students with CGPA ≥ 6.5 are eligible. Registration is mandatory via the placement portal before November 15. Carry all original documents and two passport-size photographs.', author: admin._id, category: 'Placement', priority: 'high', targetAudience: 'students', isPinned: true, views: 289 },
    { title: 'Annual Tech Fest "InnovatX 2024" – Registrations Open', content: 'CampusNexus proudly presents InnovatX 2024, our annual technical festival! Events include Hackathon, Robo Wars, Code Sprint, Paper Presentation, and UI/UX Design Challenge. Register your teams before November 12. Cash prizes worth ₹2,00,000 up for grabs!', author: faculty._id, category: 'Cultural', priority: 'high', targetAudience: 'all', views: 512 },
    { title: 'Library Timing Extended During Exam Season', content: 'The central library will remain open until 11:00 PM from November 15 to November 30 to support students during the examination period. Students must carry their ID cards. The reading hall capacity is limited to 200 students at a time.', author: admin._id, category: 'Academic', priority: 'medium', targetAudience: 'students', views: 178 },
    { title: 'Faculty Development Programme – AI & ML Workshop', content: 'A three-day Faculty Development Programme on Artificial Intelligence and Machine Learning will be conducted from November 25–27. All faculty members are encouraged to attend. Registration link has been shared via official email. Certificate of participation will be provided.', author: admin._id, category: 'Academic', priority: 'medium', targetAudience: 'faculty', views: 95 },
    { title: 'Diwali Holiday Notice', content: 'The college will remain closed from November 1–3 on account of Diwali celebrations. Classes will resume on November 4 (Monday). Students residing in hostels are requested to inform the hostel warden if they are leaving campus.', author: admin._id, category: 'Holiday', priority: 'low', targetAudience: 'all', views: 634 },
    { title: 'New Computer Lab Inaugurated – Lab 5', content: 'We are pleased to announce the inauguration of Computer Lab 5 with 60 new high-performance workstations. The lab is equipped with the latest software tools including MATLAB, AutoCAD, and Adobe Creative Suite. Lab will be available for student use from Monday onwards.', author: admin._id, category: 'Administrative', priority: 'medium', targetAudience: 'all', views: 201 },
    { title: 'Sports Day – Inter-Department Tournament', content: 'The annual inter-department sports tournament will be held on November 30. Events include Cricket, Football, Badminton, Table Tennis, and Athletics. Teams must register with the Sports Committee by November 20. Participation certificates for all, trophies for winners!', author: admin._id, category: 'Sports', priority: 'medium', targetAudience: 'all', views: 267 },
  ];
  await Announcement.insertMany(items);
  console.log(`  ✅ Announcements: ${items.length} created`);
}

async function seedEvents(users) {
  const admin = users['admin@campusnexus.com'];
  const faculty = users['priya.sharma@campusnexus.com'];
  const count = await Event.countDocuments();
  if (count > 0) { console.log('  ⏭  Events already seeded'); return; }
  const now = new Date();
  const d = (days) => new Date(now.getTime() + days * 86400000);
  const items = [
    { title: 'InnovatX Hackathon 2024', description: '24-hour hackathon open to all students. Build innovative solutions for real-world problems. Themes: HealthTech, EdTech, FinTech, and Smart Cities. Teams of 2–4 members. Mentors from top tech companies will guide participants.', organizer: faculty._id, organizerName: 'Dr. Priya Sharma', category: 'Technical', startDate: d(5), endDate: d(6), startTime: '09:00', endTime: '09:00', venue: 'Main Auditorium & Labs 1–4', requiresRegistration: true, maxParticipants: 200, status: 'upcoming', isFeatured: true, color: '#4F46E5', tags: ['hackathon', 'coding', 'innovation'] },
    { title: 'Campus Placement – TCS', description: 'TCS campus recruitment drive for final-year B.Tech students. Process includes online aptitude test, technical interview, and HR interview. Eligible branches: CSE, ECE, IT, EEE. Minimum CGPA: 6.5. Carry all original documents.', organizer: admin._id, organizerName: 'Placement Cell', category: 'Placement', startDate: d(8), endDate: d(8), startTime: '08:00', endTime: '18:00', venue: 'Seminar Hall A & B', requiresRegistration: true, maxParticipants: 150, status: 'upcoming', isFeatured: true, color: '#059669', tags: ['placement', 'TCS', 'recruitment'] },
    { title: 'Python & Data Science Workshop', description: 'Hands-on workshop covering Python basics, NumPy, Pandas, Matplotlib, and an introduction to Machine Learning with scikit-learn. Bring your laptops with Python 3.10+ installed. Certificate of completion provided.', organizer: faculty._id, organizerName: 'Dr. Priya Sharma', category: 'Workshop', startDate: d(3), endDate: d(4), startTime: '10:00', endTime: '17:00', venue: 'Computer Lab 3', requiresRegistration: true, maxParticipants: 60, status: 'upcoming', color: '#0891B2', tags: ['python', 'data science', 'workshop'] },
    { title: 'Annual Sports Day', description: 'Inter-department sports tournament featuring Cricket, Football, Badminton, Table Tennis, and 100m Sprint. All students and faculty are welcome to participate. Registration with Sports Committee required by November 20.', organizer: admin._id, organizerName: 'Sports Committee', category: 'Sports', startDate: d(15), endDate: d(15), startTime: '07:00', endTime: '18:00', venue: 'College Sports Ground', requiresRegistration: true, maxParticipants: 500, status: 'upcoming', color: '#DC2626', tags: ['sports', 'tournament', 'annual'] },
    { title: 'Guest Lecture – Cloud Computing & DevOps', description: 'Industry expert from Microsoft Azure will deliver a lecture on modern cloud architecture, CI/CD pipelines, and DevOps best practices. Open to all students and faculty. Q&A session at the end.', organizer: faculty._id, organizerName: 'CSE Department', category: 'Seminar', startDate: d(2), endDate: d(2), startTime: '14:00', endTime: '16:30', venue: 'Seminar Hall C', requiresRegistration: false, status: 'upcoming', color: '#7C3AED', tags: ['cloud', 'devops', 'guest lecture'] },
    { title: 'Cultural Night – Diwali Celebration', description: 'Join us for a spectacular Diwali cultural night featuring classical dance performances, music, stand-up comedy, and a grand fireworks display. Food stalls and games will be set up on the college grounds. Entry free for all students.', organizer: admin._id, organizerName: 'Cultural Committee', category: 'Cultural', startDate: d(-2), endDate: d(-2), startTime: '18:00', endTime: '22:00', venue: 'College Grounds', requiresRegistration: false, status: 'completed', color: '#F59E0B', tags: ['cultural', 'diwali', 'celebration'] },
    { title: 'Research Paper Writing Seminar', description: 'Learn how to write and publish research papers in IEEE and Springer journals. Topics: literature review, methodology, result analysis, and submission process. Targeted at final-year students and faculty.', organizer: faculty._id, organizerName: 'Research Cell', category: 'Academic', startDate: d(10), endDate: d(10), startTime: '11:00', endTime: '13:00', venue: 'Conference Room 1', requiresRegistration: true, maxParticipants: 40, status: 'upcoming', color: '#0F766E', tags: ['research', 'publication', 'academic'] },
  ];
  await Event.insertMany(items);
  console.log(`  ✅ Events: ${items.length} created`);
}

async function seedComplaints(users) {
  const s1 = users['arjun.mehta@campusnexus.com'];
  const s2 = users['sneha.patel@campusnexus.com'];
  const s3 = users['rohan.verma@campusnexus.com'];
  const s4 = users['kavya.nair@campusnexus.com'];
  const faculty = users['priya.sharma@campusnexus.com'];
  const count = await Complaint.countDocuments();
  if (count > 0) { console.log('  ⏭  Complaints already seeded'); return; }
  const items = [
    { title: 'Wi-Fi not working in Hostel Block C', description: 'The Wi-Fi connection in Hostel Block C has been down for the past 3 days. Students are unable to access online resources for their assignments and exam preparation. Multiple complaints have been raised verbally but no action has been taken.', submittedBy: s1._id, category: 'IT Support', priority: 'high', status: 'in_progress', assignedTo: faculty._id, statusHistory: [{ status: 'open', changedBy: s1._id, note: 'Complaint submitted' }, { status: 'in_progress', changedBy: faculty._id, note: 'IT team notified, working on fix' }] },
    { title: 'Canteen food quality has deteriorated', description: 'The quality of food served in the main canteen has significantly deteriorated over the past month. Several students have reported stomach issues after eating there. The hygiene standards are not being maintained properly.', submittedBy: s2._id, category: 'Canteen', priority: 'medium', status: 'open', statusHistory: [{ status: 'open', changedBy: s2._id, note: 'Complaint submitted' }] },
    { title: 'Projector in Room 204 not functioning', description: 'The projector in Classroom 204 has been malfunctioning for two weeks. Faculty are unable to conduct proper lectures. The bulb appears to be burnt out. Kindly arrange for immediate replacement.', submittedBy: s3._id, category: 'Infrastructure', priority: 'medium', status: 'resolved', assignedTo: faculty._id, resolvedAt: new Date(), resolutionNote: 'Projector bulb replaced. Issue resolved.', statusHistory: [{ status: 'open', changedBy: s3._id }, { status: 'in_progress', changedBy: faculty._id }, { status: 'resolved', changedBy: faculty._id, note: 'Projector bulb replaced' }] },
    { title: 'Library books not updated – CS section', description: 'The Computer Science section of the library lacks books on modern topics like Cloud Computing, Machine Learning, and Microservices. Most available books are from 2015 or earlier. Request to procure updated editions.', submittedBy: s4._id, category: 'Library', priority: 'low', status: 'open', statusHistory: [{ status: 'open', changedBy: s4._id }] },
    { title: 'Attendance portal showing incorrect data', description: 'My attendance in the portal shows 68% for the subject "Operating Systems" but I have attended all classes. I have the manual attendance register proof. This discrepancy may affect my eligibility for exams. Please rectify urgently.', submittedBy: s1._id, category: 'Academic', priority: 'high', status: 'in_progress', assignedTo: faculty._id, statusHistory: [{ status: 'open', changedBy: s1._id }, { status: 'in_progress', changedBy: faculty._id, note: 'Checking with subject faculty' }] },
    { title: 'Drinking water cooler broken in Block A', description: 'The water cooler on the ground floor of Academic Block A has been out of order for a week. Students have to walk to Block B for water. With the current heat, this is causing significant inconvenience.', submittedBy: s2._id, category: 'Infrastructure', priority: 'medium', status: 'closed', resolvedAt: new Date(Date.now() - 86400000 * 3), resolutionNote: 'Water cooler repaired and tested.', statusHistory: [{ status: 'open', changedBy: s2._id }, { status: 'resolved', changedBy: faculty._id }, { status: 'closed', changedBy: faculty._id }] },
  ];
  for (const item of items) await Complaint.create(item);
  console.log(`  ✅ Complaints: ${items.length} created`);
}

async function seedClubs(users) {
  const s1 = users['arjun.mehta@campusnexus.com'];
  const s2 = users['sneha.patel@campusnexus.com'];
  const s3 = users['rohan.verma@campusnexus.com'];
  const s4 = users['kavya.nair@campusnexus.com'];
  const faculty = users['priya.sharma@campusnexus.com'];
  const count = await Club.countDocuments();
  if (count > 0) { console.log('  ⏭  Clubs already seeded'); return; }
  const items = [
    { name: 'CodeCraft Club', description: 'A community for coding enthusiasts. We conduct weekly DSA sessions, hackathons, and competitive programming contests. Open to all branches.', tags: ['coding', 'DSA', 'competitive programming'], createdBy: faculty._id, members: [{ user: faculty._id, role: 'admin' }, { user: s1._id, role: 'member' }, { user: s2._id, role: 'member' }, { user: s4._id, role: 'member' }] },
    { name: 'Design & UX Society', description: 'For students passionate about UI/UX design, graphic design, and product thinking. We run design sprints, Figma workshops, and portfolio reviews.', tags: ['design', 'UI/UX', 'figma'], createdBy: s2._id, members: [{ user: s2._id, role: 'admin' }, { user: s1._id, role: 'member' }] },
    { name: 'Robotics & IoT Club', description: 'Hands-on club for building robots, drones, and IoT projects. We participate in national-level robotics competitions and conduct Arduino/Raspberry Pi workshops.', tags: ['robotics', 'IoT', 'hardware'], createdBy: s3._id, members: [{ user: s3._id, role: 'admin' }, { user: s1._id, role: 'member' }] },
    { name: 'AI & Data Science Hub', description: 'Exploring the frontiers of Artificial Intelligence and Data Science. Weekly paper reading sessions, Kaggle competitions, and ML project showcases.', tags: ['AI', 'ML', 'data science'], createdBy: faculty._id, members: [{ user: faculty._id, role: 'admin' }, { user: s4._id, role: 'member' }, { user: s1._id, role: 'member' }, { user: s2._id, role: 'member' }] },
  ];
  await Club.insertMany(items);
  console.log(`  ✅ Clubs: ${items.length} created`);
}

async function seedMails(users) {
  const admin = users['admin@campusnexus.com'];
  const s1 = users['arjun.mehta@campusnexus.com'];
  const s2 = users['sneha.patel@campusnexus.com'];
  const faculty = users['priya.sharma@campusnexus.com'];
  const count = await Mail.countDocuments();
  if (count > 0) { console.log('  ⏭  Mails already seeded'); return; }
  const items = [
    { from: admin._id, to: [{ user: s1._id, read: false, folder: 'inbox' }], subject: 'Placement Drive Registration Reminder', body: 'Dear Arjun,\n\nThis is a reminder to complete your registration for the upcoming TCS placement drive by November 15. Please log in to the placement portal and upload your updated resume.\n\nBest regards,\nPlacement Cell', sentAt: new Date() },
    { from: faculty._id, to: [{ user: s1._id, read: true, folder: 'inbox' }, { user: s2._id, read: false, folder: 'inbox' }], subject: 'Assignment 3 Submission Deadline Extended', body: 'Dear Students,\n\nDue to the upcoming mid-semester exams, the deadline for Assignment 3 (Data Structures) has been extended to November 20. Please submit via the academic portal.\n\nRegards,\nDr. Priya Sharma', sentAt: new Date(Date.now() - 86400000) },
    { from: s1._id, to: [{ user: faculty._id, read: false, folder: 'inbox' }], subject: 'Query regarding Project Evaluation Criteria', body: 'Respected Dr. Sharma,\n\nI wanted to clarify the evaluation criteria for the final year project. Specifically, I would like to know the weightage given to the documentation vs the live demo.\n\nThank you,\nArjun Mehta\nCS22001', sentAt: new Date(Date.now() - 3600000 * 2) },
    { from: admin._id, to: [{ user: s2._id, read: false, folder: 'inbox' }], subject: 'Scholarship Application – Last Date Approaching', body: 'Dear Sneha,\n\nYour application for the Merit Scholarship 2024-25 is pending document verification. Please submit your income certificate and previous year marksheet to the admin office before November 18.\n\nRegards,\nAdmin Office', sentAt: new Date(Date.now() - 86400000 * 2) },
  ];
  await Mail.insertMany(items);
  console.log(`  ✅ Mails: ${items.length} created`);
}

async function main() {
  let finalUri = MONGO_URI;
  if (!/authSource=/.test(finalUri)) {
    finalUri += (finalUri.includes('?') ? '&' : '?') + 'authSource=admin';
  }
  await mongoose.connect(finalUri, { serverSelectionTimeoutMS: 15000, family: 4 });
  console.log('✅ MongoDB connected\n🌱 Seeding data...\n');
  const users = await seedUsers();
  await seedAnnouncements(users);
  await seedEvents(users);
  await seedComplaints(users);
  await seedClubs(users);
  await seedMails(users);
  console.log('\n✅ Seed complete!');
  console.log('\n📋 Demo Login Credentials:');
  console.log('  Admin:   admin@campusnexus.com   / Admin@123');
  console.log('  Faculty: priya.sharma@campusnexus.com / Faculty@123');
  console.log('  Student: arjun.mehta@campusnexus.com  / Student@123');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1); });
