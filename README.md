# Profile Website with Admin Panel

[![CI/CD Pipeline](https://github.com/username/profile-website/actions/workflows/ci.yml/badge.svg)](https://github.com/username/profile-website/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, responsive profile website with a complete admin panel for content management. Built with **Encore.ts** for the backend and **React** with **TypeScript** for the frontend.

## ✨ Features

- **🎨 Modern Design**: Dark theme with gradient backgrounds and smooth animations
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **🔐 Admin Panel**: Secure login system for content management
- **📸 HD Photo Upload**: Support for high-quality profile photos up to 10MB
- **⚡ Real-time Updates**: Instant content updates without page refresh
- **🛡️ Type Safety**: Full TypeScript support for both frontend and backend
- **🗄️ Database**: PostgreSQL with automated migrations
- **☁️ Cloud Storage**: Object storage for images and files

## 🚀 Tech Stack

### Backend
- **Encore.ts** - TypeScript backend framework
- **PostgreSQL** - Database with automated migrations
- **Object Storage** - For profile photos and media files

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Lucide React** - Modern icon library
- **React Router** - Client-side routing

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/profile-website.git
   cd profile-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Profile: http://localhost:4000
   - Admin: http://localhost:4000/admin

## 🔑 Admin Access

- **Username**: `ito`
- **Password**: `ito31102002`

## 📁 Project Structure

```
├── backend/
│   └── profile/
│       ├── encore.service.ts      # Service definition
│       ├── db.ts                  # Database configuration
│       ├── migrations/            # Database migrations
│       ├── auth.ts               # Authentication logic
│       ├── get_profile.ts        # Profile data API
│       ├── update_profile.ts     # Profile update API
│       ├── upload_photo.ts       # Photo upload API
│       ├── manage_skills.ts      # Skills management
│       ├── manage_education.ts   # Education management
│       ├── manage_certificates.ts # Certificates management
│       └── manage_tools.ts       # Tools management
├── frontend/
│   ├── App.tsx                   # Main app component
│   └── pages/
│       ├── ProfilePage.tsx       # Public profile page
│       ├── AdminLogin.tsx        # Admin login page
│       └── AdminDashboard.tsx    # Admin dashboard
├── .github/workflows/            # CI/CD pipelines
└── README.md
```

## 🎯 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production

# Testing
npm run test         # Run all tests
npm run test:backend # Run backend tests only
npm run test:frontend # Run frontend tests only

# Code Quality
npm run lint         # Lint code
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/profile_db

# Object Storage (if using external provider)
STORAGE_BUCKET_NAME=profile-photos
STORAGE_ACCESS_KEY=your_access_key
STORAGE_SECRET_KEY=your_secret_key
```

### Admin Credentials

To change admin credentials, update the authentication logic in `backend/profile/auth.ts`.

## 📸 Photo Upload

- **Maximum file size**: 10MB
- **Supported formats**: JPG, PNG, GIF, WebP
- **Recommended resolution**: 1080p or higher for best quality
- **Storage**: Automatic cloud storage with public URLs

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- `profiles` - User profile information
- `skills` - Skills with categories and percentages
- `education` - Educational background
- `certificates` - Professional certificates
- `tools` - Tools and technologies
- `admins` - Admin user accounts

## 🚀 Deployment

### Using Encore.ts Cloud

1. Install Encore CLI:
   ```bash
   npm install -g @encore/cli
   ```

2. Deploy to cloud:
   ```bash
   encore deploy
   ```

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the built files to your hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

## 💡 Feature Requests

Have an idea for improvement? Open an issue with the `enhancement` label and describe:
- What you'd like to see
- Why it would be useful
- Any implementation ideas

## 📞 Support

- 📧 Email: isetiabhakti@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/username/profile-website/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/username/profile-website/discussions)

---

**Made with ❤️ using Encore.ts and React**
