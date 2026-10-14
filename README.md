# DEVCONNECT - AI-Powered Student Collaboration Platform

DEVCONNECT is a complete, modern, responsive student collaboration platform that helps students discover project ideas, form teams, collaborate on projects, track progress, share code, build resumes, and showcase completed projects.

Designed with a sleek modern UI including **Glassmorphism**, dark/light mode switches, smooth transitions, and visual progress charts.

---

## Technical Stack

- **Frontend**: React.js, Tailwind CSS, Lucide Icons, Chart.js (`react-chartjs-2`), Axios, React Router v6
- **Backend**: Node.js, Express.js, JWT, Bcrypt.js, Mongoose, Multer (file uploads)
- **Database**: MongoDB
- **AI Features**: Modular rule-based recommender (pre-seeded with 30 project types) ready for OpenAI API key integration.

---

## Project Structure

```
devconnect/
├── backend/
│   ├── config/          # Database connection (db.js)
│   ├── controllers/     # API request controllers (Auth, Profile, Project, etc.)
│   ├── middleware/      # Auth JWT protection and Multer configurations
│   ├── models/          # MongoDB Schemas (User, Project, Task, Repo, Forum, etc.)
│   ├── routes/          # Express Router paths mapping controllers
│   ├── scripts/         # Database seeding script (seed.js)
│   ├── utils/           # AI Project recommendation algorithms & scoring points
│   ├── uploads/         # Storage path for file uploads
│   ├── .env             # Server environment variables
│   ├── package.json     # Node libraries config
│   └── server.js        # Express HTTP entry point
└── frontend/
    ├── public/          # Static assets
    ├── src/
    │   ├── components/  # Layout elements (Navbar, Sidebar)
    │   ├── context/     # Global state management (AuthContext.jsx)
    │   ├── pages/       # Application views (Dashboard, Tasks, Showcases, etc.)
    │   ├── index.css    # Custom styles (scrollbars, glassmorphism, printing)
    │   ├── App.jsx      # Navigation routers mounting pages
    │   └── main.jsx     # App mounting entry
    ├── index.html       # Web landing page wrapper
    ├── tailwind.config.js # CSS theme styling configurations
    ├── postcss.config.js
    └── package.json     # React libraries config
```

---

## Local Setup & Run Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) installed (v16+)
- [MongoDB](https://www.mongodb.com/) running locally (port `27017`) or a MongoDB Atlas URI string

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Initialize the `.env` parameters (pre-configured to run locally):
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/devconnect
   JWT_SECRET=devconnect_super_secret_key_12345
   OPENAI_API_KEY=
   ```
4. **Seed the database** (creates student accounts, showcases, project boards, and 30 recommendations):
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server should start successfully on `http://localhost:5000`.

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite client:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:5173`. Open this URL in your web browser.

---

## Demo Accounts Credentials

The database seed script populates the following accounts for test evaluation:

### 1. Student User
- **Email**: `alice@devconnect.edu`
- **Password**: `password123`

### 2. Admin User
- **Email**: `admin@devconnect.edu`
- **Password**: `adminpassword`

---

## Platform Score Rules Engine

Contributions points are awarded automatically based on activity:
- **Code Upload**: +10 Points
- **Task Completed**: +5 Points
- **Forum Post**: +2 Points
- **Forum Reply**: +1 Point
- **Project Completion**: +50 Points (to all team members)
