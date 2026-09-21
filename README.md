# WebGen - Web Builder Platform

A full-stack web application that allows users to build, deploy, and share web projects with an intuitive visual editor. WegGen combines a powerful backend API with a modern React frontend to provide a seamless web building experience.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Frontend Routes](#frontend-routes)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Project Overview

WebGen is a comprehensive web building platform that empowers users to create, customize, and deploy web projects without extensive coding knowledge. The platform features:

- **Visual Web Editor**: Drag-and-drop interface for building web pages
- **Project Management**: Create, save, and manage multiple projects
- **Community Features**: Share and discover projects in the community
- **Payment Processing**: Integrated Stripe for monetization
- **GitHub Integration**: Direct GitHub repository integration for seamless deployment
- **Vercel Deployment**: Deploy projects directly to Vercel

## ✨ Features

### Authentication & Security
- User registration and email verification
- JWT-based authentication
- Password reset functionality
- Protected routes with role-based access control

### Project Management
- Create and manage multiple web projects
- Save project configurations
- Deploy projects to GitHub and Vercel
- Preview projects before publishing

### Visual Editor
- Drag-and-drop component system
- Canvas-based editing interface
- Real-time preview
- Theme customization
- Multiple component types:
  - Text, headings, and rich content
  - Forms (login, signup)
  - Buttons, links, and images
  - Tables, lists, and containers
  - Code blocks and raw HTML
  - Media (video, images)
  - UI components (cards, alerts, modals)

### Community & Social
- Community page for discovering projects
- Project sharing capabilities
- Community engagement features

### Payments & Pricing
- Stripe integration for payment processing
- Pricing page with subscription options
- Payment history tracking

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB (Mongoose 9.9.2)
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Security**: bcryptjs for password hashing
- **External APIs**:
  - Stripe for payments
  - GitHub API (Octokit) for repository management
- **Development**: Nodemon for hot-reloading
- **Utilities**: CORS, Morgan for logging

### Frontend
- **Library**: React 19.2.7
- **Build Tool**: Vite 8.1.1
- **Styling**: Tailwind CSS 4.3.3
- **Routing**: React Router DOM 7.18.2
- **HTTP Client**: Axios
- **UI Components**: Lucide React (icons), React Hot Toast (notifications)
- **Linting**: ESLint

## 📁 Project Structure

```
webgen/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── communityController.js
│   │   ├── paymentController.js
│   │   └── projectController.js
│   ├── middlewares/
│   │   └── auth.js               # JWT verification middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── authForgot.js
│   │   ├── communityRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── projectRoutes.js
│   │   └── projectDeploy.js
│   ├── utils/
│   │   ├── llm.js                # LLM utilities
│   │   ├── mockGenerator.js      # Mock data generation
│   │   └── services.js           # Helper services
│   ├── server.js                 # Express server setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   │   ├── AuthShell.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ScrollToTop.jsx
│   │   │   └── modal/            # Modal components
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── editor/               # Visual editor components
│   │   │   ├── EditorPage.jsx
│   │   │   ├── components/
│   │   │   │   ├── canvas/       # Editable canvas components
│   │   │   │   ├── navigation/   # Editor navigation
│   │   │   │   └── sidebar/      # Editor sidebar with tabs
│   │   │   ├── context/
│   │   │   │   └── editor-provider.jsx
│   │   │   └── utils/
│   │   │       └── editor-constants.js
│   │   ├── pages/                # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── BuilderPage.jsx
│   │   │   ├── EditorPage.jsx
│   │   │   ├── CommunityPage.jsx
│   │   │   ├── PricingPage.jsx
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── api.js            # API client configuration
│   │   │   └── safePreview.js
│   │   ├── assets/
│   │   │   ├── ui.jsx
│   │   │   └── dummyStyles.jsx
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # Entry point
│   │   └── index.css
│   ├── public/                   # Static assets
│   ├── vite.config.js            # Vite configuration
│   ├── eslint.config.js
│   ├── index.html
│   └── package.json
│
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with required variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
GITHUB_TOKEN=your_github_token
PORT=4000
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:4000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:4000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## ⚙️ Configuration

### Backend Configuration

#### Database Configuration (`backend/config/db.js`)
- Configures MongoDB connection using Mongoose
- Handles connection pooling and error handling

#### Authentication Middleware (`backend/middlewares/auth.js`)
- JWT token verification
- User authentication for protected routes

### Frontend Configuration

#### API Client (`frontend/src/utils/api.js`)
- Axios instance configuration
- Base URL setup for API calls
- Request/response interceptors

#### React Router Setup (`frontend/src/App.jsx`)
- Route definitions
- Protected route configuration
- Toast notifications setup

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

This creates an optimized production build in the `dist/` directory.

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /verify-email` - Email verification
- `POST /forgot` - Password reset request
- `GET /profile` - Get user profile (protected)

### Projects (`/api/projects`)
- `GET /` - Get all projects (protected)
- `POST /` - Create new project (protected)
- `GET /:id` - Get specific project
- `PUT /:id` - Update project (protected)
- `DELETE /:id` - Delete project (protected)
- `POST /:id/deploy` - Deploy project (protected)

### Community (`/api/community`)
- `GET /` - Get community projects
- `GET /:id` - Get project details
- `POST /:id/like` - Like a project (protected)

### Payments (`/api/payments`)
- `POST /create-checkout-session` - Create Stripe checkout (protected)
- `GET /orders` - Get payment history (protected)

## 🗺️ Frontend Routes

| Route | Component | Protected | Description |
|-------|-----------|-----------|-------------|
| `/` | LandingPage | No | Landing/home page |
| `/register` | RegisterPage | No | User registration |
| `/login` | LoginPage | No | User login |
| `/verify-email` | VerifyEmailPage | No | Email verification |
| `/forgot` | ForgotPasswordPage | No | Password reset |
| `/community` | CommunityPage | No | Community projects |
| `/pricing` | PricingPage | No | Pricing page |
| `/dashboard` | DashboardPage | Yes | User dashboard |
| `/builder` | BuilderPage | Yes | Project builder |
| `/editor/:id` | EditorPage | Yes | Visual editor |
| `/preview/:id` | PreviewPage | No | Project preview |
| `/settings` | SettingsPage | Yes | User settings |
| `*` | NotFoundPage | No | 404 page |

## 🔐 Environment Variables

### Backend `.env`
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/webgen
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
PORT=4000
NODE_ENV=development
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:4000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
```

## 📝 Scripts

### Backend
- `npm start` - Start the server with Nodemon (hot-reload)

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🆘 Support

For support, issues, or questions, please open an issue in the repository.

---

**Happy Building! 🚀**
