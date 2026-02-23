# 🏥 MediCare Hospital Management System - Setup Guide

Welcome to **MediCare** setup guide. Follow these steps to get the application running on your local machine with a fully seeded database and premium UI features.

---

## �️ Software Requirements

### Required Software

#### 1. **Node.js** (v18.x or higher)
Node.js is required to run the Next.js application and npm scripts.

**Installation:**
- **macOS**: Download from [nodejs.org](https://nodejs.org) or use Homebrew:
  ```bash
  brew install node
  ```
- **Windows**: Download installer from [nodejs.org](https://nodejs.org)
- **Linux**: Use package manager:
  ```bash
  # Ubuntu/Debian
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  
  # Or using snap
  sudo snap install node --classic
  ```

**Verify Installation:**
```bash
node --version  # Should show v18.x or higher
npm --version   # Should show npm version
```

#### 2. **MongoDB** (Local or Atlas)
You have two options for MongoDB:

**Option A: MongoDB Local Instance**
- **macOS**: 
  ```bash
  # Using Homebrew
  brew tap mongodb/brew
  brew install mongodb-community
  brew services start mongodb-community
  ```
- **Windows**: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- **Linux**: 
  ```bash
  # Ubuntu/Debian
  wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
  echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
  sudo apt-get update
  sudo apt-get install -y mongodb-org
  sudo systemctl start mongod
  ```

**Option B: MongoDB Atlas (Cloud)**
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free M0 tier is sufficient)
4. Create a database user with password
5. Get your connection string from **Connect → Connect your application**
6. Whitelist your IP address (0.0.0.0/0 for development)

#### 3. **Git** (Version Control)
**Installation:**
- **macOS**: `brew install git`
- **Windows**: Download from [git-scm.com](https://git-scm.com)
- **Linux**: `sudo apt-get install git` (Ubuntu/Debian)

#### 4. **Code Editor** (Recommended)
- **Visual Studio Code**: [code.visualstudio.com](https://code.visualstudio.com)
- **WebStorm**: [jetbrains.com/webstorm](https://www.jetbrains.com/webstorm/)
- **Vim/Neovim**: For terminal-based development

#### 5. **Optional Tools**
- **MongoDB Compass**: GUI for MongoDB management
- **Postman**: API testing tool
- **Docker**: For containerized deployment

---

## 🚀 Quick Start

### 1. Prerequisites Check
Ensure all required software is installed:
```bash
# Check Node.js version (should be 18.x+)
node --version

# Check npm version
npm --version

# Check MongoDB connection
mongosh --eval "db.adminCommand('ismaster')"
```

### 2. Project Setup
Clone the repository and install dependencies:
```bash
# Clone the repository
git clone <repository-url>
cd medicare

# Install dependencies
npm install

# Alternatively, if you prefer pnpm
pnpm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

**For Local MongoDB:**
```env
# MongoDB Connection String (Local)
MONGODB_URI=mongodb://localhost:27017/medicare

# Secure JWT Secret (Used for signing tokens)
JWT_SECRET=your_ultra_secure_secret_key_here_change_this_in_production

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For MongoDB Atlas:**
```env
# MongoDB Connection String (Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/medicare?retryWrites=true&w=majority

# Secure JWT Secret
JWT_SECRET=your_ultra_secure_secret_key_here_change_this_in_production

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Seeding
MediCare comes with a comprehensive seed script to populate your database with initial doctors, patients, and analytical data.

```bash
# Run the seed script
npm run seed
```

**What gets seeded:**
- 1 Admin account
- 3 Patient accounts  
- 6 Doctors with specializations
- 12 Sample appointments
- Analytics data for dashboard

### 5. Start the Application
```bash
# Run the development server
npm run dev

# Or for production build
npm run build
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔐 Access Credentials (Seeded Data)

Use these credentials to test the various role-based dashboards:

### 🛠️ Administrator Account
**Access Level**: Full system control, analytics, and management.
- **Email**: `admin@example.com`
- **Password**: `password`

### 👤 Patient Accounts
**Access Level**: Book appointments, view medical history, and manage profile.

**Patient 1:**
- **Email**: `patient@example.com`
- **Password**: `password`

**Patient 2:**
- **Email**: `john.doe@example.com`
- **Password**: `password`

**Patient 3:**
- **Email**: `jane.smith@example.com`
- **Password**: `password`

---

## ✨ Key Features
- **Premium Dashboards**: Role-specific interfaces for Admins and Patients.
- **Live Analytics**: Real-time Recharts visualization for appointment trends and revenue.
- **Secure Auth**: JWT-based session management with Bcrypt password hashing.
- **Modern UI**: Fully responsive design with Glassmorphism and Lucide icons.
- **Health Tracking**: Manage medical history and upcoming appointments.
- **Real-time Updates**: Live appointment status and notifications.

---

## 📁 Project Structure
```
medicare/
├── app/
│   ├── api/              # Backend API routes (Auth, Doctors, Admin Stats)
│   ├── admin/            # Admin-only dashboard and management pages
│   ├── patient/          # Patient-only dashboard and health records
│   └── globals.css       # Global styles and theme configuration
├── components/
│   ├── ui/              # Base UI components (Button, Card, etc.)
│   ├── doctor-card.tsx   # Doctor profile cards
│   ├── appointment-card.tsx # Appointment display cards
│   └── service-card.tsx  # Service feature cards
├── lib/
│   ├── mongodb.ts        # Database connection
│   ├── auth-context.tsx # Authentication context
│   └── seed.ts          # Database seeding script
├── models/
│   ├── Doctor.ts         # Doctor schema
│   ├── Appointment.ts    # Appointment schema
│   └── User.ts          # User schema
├── styles/
│   └── globals.css      # Tailwind CSS configuration
├── .env.local          # Environment variables (create this)
└── package.json         # Dependencies and scripts
```

---

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```bash
# Check if MongoDB is running (local)
brew services list | grep mongodb  # macOS
sudo systemctl status mongod     # Linux

# Start MongoDB if not running
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

**2. Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**3. Node.js Version Issues**
```bash
# Use Node Version Manager (nvm) to manage versions
nvm install 18
nvm use 18
```

**4. Permission Issues**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) node_modules
```

### Development Tips

**Hot Reload**: The development server automatically reloads on file changes.

**Database Reset**: To reset the database, run:
```bash
npm run seed
```

**Environment Variables**: Never commit `.env.local` to version control. It's already in `.gitignore`.

---

## 🚀 Deployment

### Production Deployment

**1. Build the Application:**
```bash
npm run build
```

**2. Environment Setup:**
- Set `NODE_ENV=production`
- Use production MongoDB Atlas connection string
- Generate a secure JWT secret

**3. Deploy Options:**
- **Vercel**: Connect GitHub repository and configure environment variables
- **Netlify**: Use Next.js adapter and configure build settings
- **Docker**: Use provided Dockerfile for containerized deployment
- **AWS/Google Cloud**: Deploy as Node.js application

---

## 📞 Support

For issues and support:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [Project Structure](#-project-structure)
3. Ensure all [Software Requirements](#-software-requirements) are met

---

© 2026 MediCare Hospital Management. All rights reserved.
