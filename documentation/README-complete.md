# Marketing Manager - Complete System Documentation

A comprehensive AI-powered social media marketing campaign management system built with React frontend and n8n AI backend.

## 🚀 System Overview

The Marketing Manager combines:
- **React Frontend**: Modern, responsive interface with authentication
- **Nova AI Agent**: Conversational campaign planner powered by GPT-4o
- **n8n Workflow**: Backend automation and data processing
- **Supabase Database**: Campaign storage and user management
- **PDF Generation**: Professional campaign reports

## 📁 Project Structure

```
MarketingManager/
├── src/                          # React frontend application
│   ├── components/               # Reusable React components
│   ├── pages/                   # Main application pages
│   ├── services/                # Business logic and API calls
│   └── App.js                   # Main application component
├── n8n/                         # n8n workflow configuration
│   └── MarketingManager.json    # Complete workflow definition
├── documentation/               # Complete system documentation
│   ├── nova-ai-system-prompt-actual.md
│   ├── nova-n8n-integration-guide-actual.md
│   ├── database-schema-actual.md
│   ├── ai-json-payload-examples.md
│   └── deployment-guide-actual.md
└── README.md                    # This file
```

## 🎯 Features

### Frontend (React)
- **Authentication**: Supabase-powered user login/registration
- **Responsive Design**: Tailwind CSS with mobile-first approach
- **AI Chat Interface**: Embedded n8n chat widget for campaign creation
- **Campaign Reports**: View and manage created campaigns
- **PDF Generation**: Professional campaign reports with Priority One Tech branding
- **GitHub Pages Ready**: Optimized for static hosting

### Backend (n8n)
- **AI Agent**: Nova AI personality powered by OpenAI GPT-4o
- **Memory Management**: Conversation context with 20-message buffer
- **JSON Validation**: Robust campaign data validation and processing
- **Database Integration**: Automatic save to Supabase when campaigns are complete
- **Error Handling**: Graceful handling of incomplete or invalid data

### Nova AI Capabilities
- **Campaign Planning**: Strategic multi-phase campaign development
- **Platform Awareness**: Instagram, Facebook, LinkedIn, Twitter, TikTok, WhatsApp, Email
- **Content Strategy**: Recommendations for content types per phase and platform
- **Business Model Alignment**: B2B, B2C, C2C, and Retail specialization
- **Validation**: Ensures complete campaign data before saving

## 🛠 Technical Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework
- **Supabase**: Authentication and database client
- **jsPDF**: PDF generation library
- **html2canvas**: HTML to canvas conversion for PDFs

### Backend
- **n8n**: Workflow automation platform
- **OpenAI GPT-4o**: Large language model for conversation
- **Supabase**: PostgreSQL database with real-time subscriptions
- **JavaScript**: Custom validation and processing logic

## 🎨 Nova AI System Prompt

Nova is designed with a sophisticated personality that evolves through conversations:

1. **Warm and Curious**: Initial engagement with genuine interest
2. **Conversational**: Collaborative approach with thoughtful suggestions  
3. **Strategic**: Confident planning with clear reasoning
4. **Supportive**: Gentle guidance without pressure

**Key Phrase**: "Here's the complete plan." - triggers backend automation

## 📊 Campaign Structure

Nova generates campaigns with this structure:

### Campaign Object
- Basic info: name, description, campaign_type, status
- Timeline: start_date, end_date, campaign_length
- Targeting: budget, target_audience, goals
- Metrics: reach, engagement_rate, phase_specific_kpis
- Platforms: recommended social media and marketing channels
- Phases: number_of_phases (2-5 typically)

### Campaign Phases Array
- Phase details: name, description, phase_order
- Timeline: start_date, end_date, status
- Strategy: content_strategy, recommended_content_types
- Platforms: recommended_platforms per phase
- Metrics: phase-specific success measurements

## 🔧 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- n8n instance (cloud or self-hosted)
- Supabase project
- OpenAI API key

### Quick Start

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/MarketingManager.git
   cd MarketingManager
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Setup Database** (see `database-schema-actual.md`)
   ```sql
   -- Run in Supabase SQL Editor
   CREATE TABLE campaign_capture_byNova (...);
   ```

4. **Import n8n Workflow**
   - Import `n8n/MarketingManager.json` into your n8n instance
   - Configure OpenAI and Supabase credentials
   - Activate the workflow

5. **Start Development**
   ```bash
   npm start
   # Opens http://localhost:3000
   ```

6. **Deploy to GitHub Pages**
   ```bash
   npm run deploy
   ```

## 📚 Documentation

### Core Documentation
- **[Nova AI System Prompt](nova-ai-system-prompt-actual.md)**: Complete AI personality and instructions
- **[n8n Integration Guide](nova-n8n-integration-guide-actual.md)**: Workflow architecture and implementation
- **[Database Schema](database-schema-actual.md)**: Complete database structure and functions
- **[Deployment Guide](deployment-guide-actual.md)**: Step-by-step deployment instructions

### Examples & References
- **[JSON Payload Examples](ai-json-payload-examples.md)**: Complete campaign examples
- **Campaign Types**: product_launch, brand_awareness, lead_generation, sales, event_promotion
- **Platform Coverage**: Social media + email, WhatsApp, print, voice calling

## 🎨 UI Components

### Layout.js
- Responsive sidebar navigation
- User authentication state management
- Priority One Tech branding
- Mobile-friendly hamburger menu

### ChatBot.js
- n8n chat widget iframe integration
- User context passing
- Authentication requirements
- Clean, minimal interface

### CampaignReports.js
- API-based campaign fetching
- Campaign list with filtering
- PDF generation integration
- Responsive card layout

### CampaignPDFReport.js
- Professional PDF generation
- Priority One Tech branding
- Campaign summary and phase details
- Download functionality

## 🔒 Security Features

- **Supabase Authentication**: Secure user management
- **Row Level Security**: User-specific data access
- **API Key Protection**: Environment variable management
- **Input Validation**: n8n workflow validation
- **CORS Configuration**: Proper cross-origin settings

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration/login flows
- [ ] Chat interface loads and responds
- [ ] Campaign creation through Nova conversation
- [ ] Campaign data saves to database
- [ ] Campaign reports display correctly
- [ ] PDF generation works properly
- [ ] Mobile responsiveness

### n8n Workflow Testing
- [ ] Chat trigger responds to messages
- [ ] AI Agent generates appropriate responses
- [ ] JavaScript validation processes JSON correctly
- [ ] Database saves when readyToSave is true
- [ ] Proper responses sent based on campaign status

## 🚀 Deployment Options

### GitHub Pages (Recommended)
- Free static hosting
- Automatic deployment from main branch
- Custom domain support
- HTTPS included

### Alternative Platforms
- **Netlify**: Advanced deployment features
- **Vercel**: Optimized for React applications
- **Firebase Hosting**: Google Cloud integration

## 📈 Roadmap

### Completed Features ✅
- React frontend with authentication
- n8n AI workflow with Nova personality
- Campaign creation and storage
- PDF report generation
- Responsive design
- Complete documentation

### Planned Features 🚧
- Social media dashboard with metrics
- Campaign phase management with timelines
- Content management system
- Multi-platform posting integration
- Advanced analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- **Documentation**: Check the `/documentation` folder
- **Issues**: Open a GitHub issue
- **n8n Workflow**: Refer to `nova-n8n-integration-guide-actual.md`
- **Deployment**: Follow `deployment-guide-actual.md`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ by Priority One Tech Service**

This system represents a complete, production-ready marketing campaign management solution with AI-powered campaign creation, automated data processing, and professional reporting capabilities.