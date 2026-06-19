<div align="center">

# 🎓 CampusNexus

### A Full-Stack College ERP Platform

Manage students, faculty, and administration from one unified dashboard.

[![Made with React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Made with Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Auth](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#-license)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Test Accounts](#-test-accounts) • [Roadmap](#-roadmap)

</div>

---

## 📖 About

**CampusNexus** is a College ERP (Enterprise Resource Planning) platform built to centralize everyday campus operations — student records, faculty workflows, and administrative tasks — into a single, role-based web application.

It's a full-stack project: a **React** frontend talks to a **Node.js / Express** REST API, backed by **MongoDB Atlas**, with **JWT-based authentication** controlling access for three distinct roles — Admin, Faculty, and Student.

> ⚠️ **Status:** Actively in development. This project currently runs **locally only** — there is no hosted live demo yet. See [Getting Started](#-getting-started) below to run it on your own machine.

---

## ✨ Features

- 🔐 **Role-based access control** — separate experiences for Admin, Faculty, and Student
- 🔑 **JWT authentication** — secure, token-based login sessions
- 🖥️ **Modern UI** — built with React.js and styled using Tailwind CSS
- ⚙️ **REST API backend** — powered by Node.js and Express.js
- ☁️ **Cloud database** — data persisted in MongoDB Atlas
- 🚀 **One-click local startup** — a single `.bat` script spins up both servers together

---

## 🛠️ Tech Stack

| Layer | Technology | Port |
|---|---|---|
| **Frontend** | React.js + Tailwind CSS | `3000` |
| **Backend** | Node.js + Express.js | `5000` |
| **Database** | MongoDB Atlas (Cloud) | — |
| **Auth** | JSON Web Tokens (JWT) | — |

---

## 📂 Repository Structure

> **Note:** This repository currently contains the project's root configuration and startup tooling. The `backend/` and `frontend/` application source folders referenced in the run instructions below are part of the project but have not yet been pushed to this repository — push them to `main` so the steps below work out of the box for new contributors.

| File | Description |
|---|---|
| [`START_CAMPUSNEXUS.bat`](./START_CAMPUSNEXUS.bat) | Windows script that kills stray Node processes and launches both the backend and frontend together |
| [`package.json`](./package.json) | Root-level project metadata and dependency manifest |
| [`package-lock.json`](./package-lock.json) | Locked, exact dependency versions for reproducible installs |
| [`.gitignore`](./.gitignore) | Files and folders excluded from version control (e.g. `node_modules`, `.env`) |
| [`README.md`](./README.md) | You are here 👋 |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm (comes bundled with Node.js)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) connection string (for the backend `.env`)

### Option 1 — Easiest Way (Windows)

Just double-click:

```
START_CAMPUSNEXUS.bat
```

This automatically kills any conflicting Node processes and starts **both** the backend and frontend together.

Then open your browser to:

```
http://localhost:3000
```

### Option 2 — Manual Setup (any OS / VS Code)

**Terminal 1 — Backend**

```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm install
npm start
```

Then open your browser to:

```
http://localhost:3000
```

---

## 🧪 Test Accounts

These accounts aren't pre-seeded — **register them manually** through the app's sign-up flow to test each role:

| Role | Email | Password |
|---|---|---|
| 👑 Admin | `admin@college.edu` | `admin1234` |
| 👨‍🏫 Faculty | `faculty@college.edu` | `faculty1234` |
| 🎓 Student | `student@college.edu` | `student1234` |

> 🔒 **Security note:** These are placeholder credentials meant for local development and demos only. Never reuse simple passwords like these in a production environment.

---

## 🗺️ Roadmap

- [ ] Push `backend/` and `frontend/` source code to the repository
- [ ] Deploy backend (Render / Railway) and frontend (Vercel / Netlify)
- [ ] Add a live demo link once deployed
- [ ] Add automated tests
- [ ] Add CI/CD pipeline via GitHub Actions
- [ ] Add API documentation

---

## 🤝 Contributing

Contributions are welcome! If you'd like to help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is currently unlicensed. Consider adding an [MIT License](https://choosealicense.com/licenses/mit/) or another license of your choice to clarify how others can use this code.

---

## 👤 Author

**Yash Soni**
GitHub: [@yashsoni972](https://github.com/yashsoni972)

---

<div align="center">

Made with for campuses everywhere

</div>
