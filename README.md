# Social Media Marketing Manager

A React-based social media marketing management application with Supabase authentication, designed to deploy on GitHub Pages with n8n backend integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git
- Supabase account and project

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Supabase:**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase project URL and anon key:
   ```bash
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Add your logo:**
   - Place your logo image as `public/assets/logo.png`
   - Add favicon.ico to the `public/` folder

4. **Start development server:**
   ```bash
   npm start
   ```

5. **Open browser:**
   ```
   http://localhost:3000
   ```

## � Authentication System

### Features
- ✅ Email/Password authentication via Supabase
- ✅ User registration and login
- ✅ Password reset functionality
- ✅ Protected routes
- ✅ User session management
- ✅ Automatic logout functionality

### User Flow
1. Users land on login page if not authenticated
2. Can register new account or sign in
3. Email verification required for new accounts
4. Once authenticated, access to full dashboard
5. User info displayed in sidebar and header
6. Easy logout from header or sidebar

## �📁 Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.js          # Login/Register form
│   │   └── ProtectedRoute.js # Route protection
│   └── Layout.js             # Main layout with sidebar
├── context/
│   └── AuthContext.js        # Authentication state management
├── pages/
│   ├── Dashboard.js          # Main dashboard
│   ├── Campaigns.js          # Campaign management
│   ├── Content.js            # Content management
│   ├── Analytics.js          # Analytics dashboard
│   └── ChatBot.js            # AI assistant
├── services/
│   └── supabase.js          # Supabase configuration
├── utils/                    # Utility functions
├── App.js                   # Main app component
└── index.js                 # Entry point
```

## 🗄️ Database Setup (Supabase)

### Required Tables
You mentioned you already have tables and API keys. The application expects these table names (configurable in `src/services/supabase.js`):

- `users` - User profiles (handled by Supabase Auth)
- `campaigns` - Marketing campaigns
- `campaign_phases` - Campaign phases and timelines
- `content` - Content posts and assets
- `social_metrics` - Social media metrics
- `posts` - Scheduled and published posts

### Table Configuration
Update the `TABLES` object in `src/services/supabase.js` to match your table names:

```javascript
export const TABLES = {
  USERS: 'your_users_table',
  CAMPAIGNS: 'your_campaigns_table',
  // ... etc
}
```

## 🎯 Features

### ✅ Completed Features
- React app with routing and responsive design
- Supabase authentication system
- Protected routes and user management
- Logo display in sidebar
- Modern UI with Tailwind CSS
- Basic dashboard layout

### 🔄 Next Steps (Planned)
- Social media dashboard with real metrics
- Campaign phase management with timelines
- AI chatbot interface for campaign creation
- n8n backend integration
- Content management system
- Daily metrics tracking
- GitHub Pages deployment optimization

## 🛠️ Technology Stack

- **Frontend:** React 18, React Router, Tailwind CSS
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **Charts:** Chart.js with React
- **Icons:** Font Awesome
- **Backend Integration:** n8n workflows (planned)
- **Deployment:** GitHub Pages
- **State Management:** React Context

## 🎨 UI Features

- **Responsive Design:** Works on desktop, tablet, and mobile
- **Social Media Branding:** Platform-specific colors and icons
- **Dark/Light Themes:** Ready for theme switching
- **Smooth Animations:** CSS transitions and hover effects
- **Professional Layout:** Clean sidebar navigation

## 🚀 Deployment

### GitHub Pages Deployment
```bash
# Build and deploy
npm run deploy
```

### Environment Configuration
- Set up GitHub Secrets for Supabase credentials
- Update `homepage` in package.json with your GitHub Pages URL
- Configure n8n webhooks for backend integration

## 📋 Development Workflow

1. **Phase 1:** Authentication system ✅
2. **Phase 2:** Social media dashboard
3. **Phase 3:** Campaign management system
4. **Phase 4:** AI chatbot integration
5. **Phase 5:** n8n backend connection
6. **Phase 6:** Content management
7. **Phase 7:** Analytics and reporting
8. **Phase 8:** Production deployment

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Enable Email Authentication
3. Configure your tables
4. Get your project URL and anon key
5. Update `.env.local` with your credentials

### Logo Setup
- Place your logo as `public/assets/logo.png`
- Recommended size: 200x50px (or similar aspect ratio)
- Supports PNG, JPG, SVG formats
- Falls back to icon if logo not found

## 🤝 Contributing

This is a custom marketing management system. Ready for the next development phase!

## 📄 License

Private project - All rights reserved.