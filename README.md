# Marketing Manager# Social Media Marketing Manager



A comprehensive AI-powered social media marketing campaign management system built with React frontend and n8n AI backend.A React-based social media marketing management application with Supabase authentication, designed to deploy on GitHub Pages with n8n backend integration.



## 🚀 Quick Start## 🚀 Quick Start



### Prerequisites### Prerequisites

- Node.js 16+ and npm- Node.js 16+ and npm

- Git- Git

- Supabase account and project- Supabase account and project

- n8n instance (cloud or self-hosted)

- OpenAI API key### Installation



### Installation1. **Install dependencies:**

   ```bash

1. **Install dependencies:**   npm install

   ```bash   ```

   npm install

   ```2. **Configure Supabase:**

   - Copy `.env.example` to `.env.local`

2. **Configure Environment:**   - Add your Supabase project URL and anon key:

   - Copy `.env.example` to `.env.local`   ```bash

   - Add your credentials:   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co

   ```bash   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co   ```

   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

   REACT_APP_N8N_CHAT_URL=your_n8n_chat_webhook_url3. **Add your logo:**

   REACT_APP_API_BASE_URL=your_api_endpoint   - Place your logo image as `public/assets/logo.png`

   ```   - Add favicon.ico to the `public/` folder



3. **Setup Database:**4. **Start development server:**

   - See `documentation/database-schema-actual.md` for complete setup   ```bash

   - Import n8n workflow from `n8n/MarketingManager.json`   npm start

   ```

4. **Add your logo:**

   - Place your logo image as `public/assets/logo.png`5. **Open browser:**

   - Add favicon.ico to the `public/` folder   ```

   http://localhost:3000

5. **Start development server:**   ```

   ```bash

   npm start## � Authentication System

   ```

### Features

6. **Open browser:**- ✅ Email/Password authentication via Supabase

   ```- ✅ User registration and login

   http://localhost:3000- ✅ Password reset functionality

   ```- ✅ Protected routes

- ✅ User session management

## 📚 Documentation- ✅ Automatic logout functionality



Complete system documentation is available in the `documentation/` folder:### User Flow

1. Users land on login page if not authenticated

### Core Documentation2. Can register new account or sign in

- **[Complete System Overview](documentation/README-complete.md)** - Comprehensive system guide3. Email verification required for new accounts

- **[Nova AI System Prompt](documentation/nova-ai-system-prompt-actual.md)** - AI personality and instructions4. Once authenticated, access to full dashboard

- **[n8n Integration Guide](documentation/nova-n8n-integration-guide-actual.md)** - Workflow architecture5. User info displayed in sidebar and header

- **[Database Schema](documentation/database-schema-actual.md)** - Complete database structure6. Easy logout from header or sidebar

- **[Deployment Guide](documentation/deployment-guide-actual.md)** - Step-by-step deployment

## �📁 Project Structure

### Examples & References

- **[JSON Payload Examples](documentation/ai-json-payload-examples.md)** - Campaign structure examples```

- **[Troubleshooting](documentation/TROUBLESHOOTING.md)** - Common issues and solutionssrc/

├── components/

## 🎯 System Features│   ├── Auth/

│   │   ├── Login.js          # Login/Register form

### React Frontend│   │   └── ProtectedRoute.js # Route protection

- **Authentication**: Supabase-powered user management│   └── Layout.js             # Main layout with sidebar

- **Responsive Design**: Tailwind CSS with mobile-first approach├── context/

- **AI Chat Interface**: Embedded n8n chat widget for campaign creation│   └── AuthContext.js        # Authentication state management

- **Campaign Reports**: View and manage created campaigns├── pages/

- **PDF Generation**: Professional campaign reports with branding│   ├── Dashboard.js          # Main dashboard

│   ├── Campaigns.js          # Campaign management

### Nova AI Backend (n8n)│   ├── Content.js            # Content management

- **Conversational AI**: GPT-4o powered campaign planning│   ├── Analytics.js          # Analytics dashboard

- **Strategic Planning**: Multi-phase campaign development│   └── ChatBot.js            # AI assistant

- **Platform Awareness**: Social media + marketing channel recommendations├── services/

- **Data Validation**: Robust JSON validation and processing│   └── supabase.js          # Supabase configuration

- **Automated Storage**: Supabase integration for campaign data├── utils/                    # Utility functions

├── App.js                   # Main app component

## 🔐 Authentication System└── index.js                 # Entry point

```

### Features

- ✅ Email/Password authentication via Supabase## 🗄️ Database Setup (Supabase)

- ✅ User registration and login

- ✅ Password reset functionality### Required Tables

- ✅ Protected routesYou mentioned you already have tables and API keys. The application expects these table names (configurable in `src/services/supabase.js`):

- ✅ User session management

- ✅ Automatic logout functionality- `users` - User profiles (handled by Supabase Auth)

- `campaigns` - Marketing campaigns

### User Flow- `campaign_phases` - Campaign phases and timelines

1. Users land on login page if not authenticated- `content` - Content posts and assets

2. Can register new account or sign in- `social_metrics` - Social media metrics

3. Email verification required for new accounts- `posts` - Scheduled and published posts

4. Once authenticated, access to full dashboard

5. User info displayed in sidebar and header### Table Configuration

6. Easy logout from header or sidebarUpdate the `TABLES` object in `src/services/supabase.js` to match your table names:



## 📁 Project Structure```javascript

export const TABLES = {

```  USERS: 'your_users_table',

MarketingManager/  CAMPAIGNS: 'your_campaigns_table',

├── src/                          # React frontend application  // ... etc

│   ├── components/               # Reusable React components}

│   │   ├── Auth/                # Authentication components```

│   │   └── Layout.js            # Main layout with sidebar

│   ├── context/                 # React context providers## 🎯 Features

│   ├── pages/                   # Main application pages

│   │   ├── Dashboard.js         # Main dashboard### ✅ Completed Features

│   │   ├── ChatBot.js           # AI assistant interface- React app with routing and responsive design

│   │   └── CampaignReports.js   # Campaign management- Supabase authentication system

│   ├── services/                # Business logic and API calls- Protected routes and user management

│   └── App.js                   # Main application component- Logo display in sidebar

├── n8n/                         # n8n workflow configuration- Modern UI with Tailwind CSS

│   └── MarketingManager.json    # Complete Nova AI workflow- Basic dashboard layout

├── documentation/               # Complete system documentation

│   ├── README-complete.md       # Comprehensive system guide### 🔄 Next Steps (Planned)

│   ├── nova-ai-system-prompt-actual.md- Social media dashboard with real metrics

│   ├── nova-n8n-integration-guide-actual.md- Campaign phase management with timelines

│   ├── database-schema-actual.md- AI chatbot interface for campaign creation

│   ├── ai-json-payload-examples.md- n8n backend integration

│   └── deployment-guide-actual.md- Content management system

├── public/                      # Static assets- Daily metrics tracking

└── package.json                 # Project dependencies- GitHub Pages deployment optimization

```

## 🛠️ Technology Stack

## 🗄️ Database Setup (Supabase)

- **Frontend:** React 18, React Router, Tailwind CSS

The system uses Supabase PostgreSQL with these key components:- **Authentication:** Supabase Auth

- **Database:** Supabase (PostgreSQL)

### Primary Table- **Charts:** Chart.js with React

- `campaign_capture_byNova` - Stores Nova's complete campaign outputs- **Icons:** Font Awesome

- **Backend Integration:** n8n workflows (planned)

### Required Setup- **Deployment:** GitHub Pages

1. Create Supabase project- **State Management:** React Context

2. Run SQL from `documentation/database-schema-actual.md`

3. Configure authentication## 🎨 UI Features

4. Set up API credentials

- **Responsive Design:** Works on desktop, tablet, and mobile

See the complete database documentation for detailed setup instructions.- **Social Media Branding:** Platform-specific colors and icons

- **Dark/Light Themes:** Ready for theme switching

## 🛠️ Technology Stack- **Smooth Animations:** CSS transitions and hover effects

- **Professional Layout:** Clean sidebar navigation

### Frontend

- **React 18**: Modern React with hooks and functional components## 🚀 Deployment

- **Tailwind CSS**: Utility-first CSS framework

- **Supabase**: Authentication and database client### GitHub Pages Deployment

- **jsPDF**: PDF generation library```bash

- **Chart.js**: Data visualization# Build and deploy

npm run deploy

### Backend```

- **n8n**: Workflow automation platform

- **OpenAI GPT-4o**: Large language model for Nova AI### Environment Configuration

- **Supabase**: PostgreSQL database with real-time subscriptions- Set up GitHub Secrets for Supabase credentials

- **JavaScript**: Custom validation and processing logic- Update `homepage` in package.json with your GitHub Pages URL

- Configure n8n webhooks for backend integration

## 🎨 UI Features

## 📋 Development Workflow

- **Responsive Design**: Works on desktop, tablet, and mobile

- **Social Media Branding**: Platform-specific colors and icons1. **Phase 1:** Authentication system ✅

- **Professional Layout**: Clean sidebar navigation2. **Phase 2:** Social media dashboard

- **PDF Reports**: Branded campaign reports3. **Phase 3:** Campaign management system

- **Real-time Chat**: Embedded n8n chat widget4. **Phase 4:** AI chatbot integration

5. **Phase 5:** n8n backend connection

## 🚀 Deployment6. **Phase 6:** Content management

7. **Phase 7:** Analytics and reporting

### GitHub Pages (Recommended)8. **Phase 8:** Production deployment

```bash

# Build and deploy## 🔧 Configuration

npm run build

npm run deploy### Supabase Setup

```1. Create a new Supabase project

2. Enable Email Authentication

### Complete Deployment Guide3. Configure your tables

See `documentation/deployment-guide-actual.md` for:4. Get your project URL and anon key

- GitHub Pages setup5. Update `.env.local` with your credentials

- n8n workflow deployment

- Supabase configuration### Logo Setup

- Environment variables- Place your logo as `public/assets/logo.png`

- Domain configuration- Recommended size: 200x50px (or similar aspect ratio)

- Supports PNG, JPG, SVG formats

## 📈 Current Status- Falls back to icon if logo not found



### ✅ Completed Features## 🤝 Contributing

- React frontend with authentication

- Nova AI system with n8n workflowThis is a custom marketing management system. Ready for the next development phase!

- Campaign creation and storage

- PDF report generation## 📄 License

- Responsive design

- Complete documentationPrivate project - All rights reserved.

### 🔄 Next Development Phase
- Social media dashboard with metrics
- Campaign phase management
- Content management system
- Multi-platform posting integration
- Advanced analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the documentation in `documentation/` folder
4. Test with the n8n workflow
5. Submit a pull request

## 📞 Support

For support and detailed information:
- **System Overview**: `documentation/README-complete.md`
- **Technical Issues**: `documentation/TROUBLESHOOTING.md`
- **n8n Integration**: `documentation/nova-n8n-integration-guide-actual.md`
- **Database Setup**: `documentation/database-schema-actual.md`

## 📄 License

Private project - All rights reserved to Priority One Tech Service.

---

**Built with ❤️ by Priority One Tech Service**

This system provides a complete AI-powered marketing campaign management solution with conversational campaign creation, automated data processing, and professional reporting capabilities.