# 🎓 CampusNexus

**Your campus, fully connected.**

A unified, full-stack College ERP platform for students, faculty, and administrators — built for modern campus life. CampusNexus brings announcements, events, club chat, complaints, and campus mail into one beautifully designed, real-time experience.

🔗 **Live Demo:** [https://campus-nexus-7l8w.vercel.app](https://campus-nexus-7l8w.vercel.app)

> ⏳ Note: The backend runs on a free-tier server that sleeps when idle. The very first load after inactivity may take 30–50 seconds to wake up — please be patient on first visit!

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT-based login/register with role-based access (Student / Faculty / Admin)
- 📢 **Announcements** — Real-time campus-wide updates
- 🎯 **Events** — Discover, RSVP, and stay connected with campus events
- 💬 **Campus Clubs & Live Chat** — Real-time club messaging powered by Socket.IO
- 📬 **Campus Mail** — Your own in-app college inbox
- 📝 **Complaints Portal** — Submit and track grievances
- 📊 **Dashboard & Analytics** — A clear, role-specific overview of campus activity

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Create React App
- Tailwind CSS for styling
- Socket.IO Client for real-time chat
- Axios for API communication

**Backend**
- Node.js + Express.js
- Socket.IO for WebSocket-based real-time features
- MongoDB Atlas with Mongoose
- JWT for authentication
- Helmet, CORS, and rate-limiting for security

**Deployment**
- Frontend → [Vercel](https://vercel.com)
- Backend → [Render](https://render.com)
- Database → [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## 🚀 Try It Live

👉 **[Open CampusNexus](https://campus-nexus-7l8w.vercel.app)**

You can either register a new account or use the quick demo login buttons (Student / Faculty / Admin) on the login screen to explore instantly.

---

## 💻 Running Locally

Clone the repo:
```bash
git clone https://github.com/yashsoni972/CampusNexus.git
cd CampusNexus
```

### Backend
```bash
cd backend
npm install
npm run dev
```
Create a `.env` file in `backend/` with:
```
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend
```bash
cd frontend
npm install
npm start
```
Create a `.env` file in `frontend/` with:
```
REACT_APP_API_URL=http://localhost:5000
```

The app will be available at `http://localhost:3000`, connecting to the backend at `http://localhost:5000`.

---

## 📁 Project Structure

```
CampusNexus/
├── frontend/          # React app (UI, pages, contexts, components)
├── backend/           # Express API + Socket.IO server
│   ├── controllers/   # Route logic
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API endpoints
│   └── middleware/     # Auth, validation, uploads
└── README.md
```

---

## 📄 License

This project is built for educational purposes as a campus ERP demonstration.

---

<p align="center">Built with for modern campus life — by Yash Soni</p>
