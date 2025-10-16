# n8n AI Chat Widget Integration Guide

## Overview
This document explains how to set up the n8n AI chat widget that powers the AI Campaign Assistant in your Social Media Marketing Manager application.

## Architecture
```
React App (Static) → n8n Chat Widget → AI Agent → Supabase Database
```

## Benefits of n8n Chat Widget
- ✅ **Built-in chat UI** - Professional, responsive interface
- ✅ **Simplified integration** - Just embed an iframe
- ✅ **Direct n8n connection** - No webhook complexity
- ✅ **Conversation state management** - Handled automatically
- ✅ **Less code to maintain** - Focus on AI logic, not UI

## Setup Steps

### 1. Create n8n AI Chat Workflow

#### Required Nodes:
1. **Chat Trigger** - Enables the chat widget interface
2. **AI Agent (OpenAI/Claude)** - Processes user messages
3. **Supabase Nodes** - Database operations for campaign creation
4. **Decision/Switch Nodes** - Route conversation flow

#### System Prompt for AI Agent:
```
You are an expert social media marketing strategist integrated into a campaign management system. You have direct access to create campaigns in the user's database.

DATABASE SCHEMA KNOWLEDGE:
- campaigns: name, description, budget, platforms[], target_audience, goals, timeline
- campaign_phases: phase_order, name, description, duration, content recommendations
- content: content_type (image, video, carousel, story, reel, post, ad), platforms[], scheduling
- social_metrics: platform-specific performance tracking

YOUR CAPABILITIES:
1. Have natural conversations about marketing goals
2. Ask clarifying questions about budget, audience, timeline, platforms
3. Suggest strategic multi-phase campaign structures
4. Recommend content types for each phase based on platform and goals
5. **DIRECTLY CREATE campaigns and phases in the database when user approves**

CONVERSATION FLOW:
1. Understand the user's product/service and goals
2. Ask about target audience, budget, timeline
3. Suggest platform strategy (Twitter, Facebook, Instagram, LinkedIn)
4. Propose phase structure (e.g., Awareness → Engagement → Conversion)
5. Recommend content types for each phase
6. When user approves, CREATE the campaign immediately in Supabase
7. Confirm creation and provide campaign ID

IMPORTANT: 
- Always confirm details before database creation
- Provide clear phase breakdowns with content recommendations
- Use the actual database schema for campaign creation
- Be conversational but professional
- Focus on strategic value, not just tactics
```

### 2. Configure Chat Widget

#### In your n8n workflow:
1. Add a **Chat Trigger** node
2. Configure the chat settings:
   - **Chat Name**: "AI Campaign Assistant"
   - **Welcome Message**: Custom greeting
   - **Appearance**: Match your brand colors
   - **User Authentication**: Optional user context

#### Chat Trigger Configuration:
```json
{
  "chatName": "AI Campaign Assistant",
  "welcomeMessage": "👋 Hi! I'm your AI Marketing Assistant. I'll help you create strategic social media campaigns. What product, service, or idea would you like to promote?",
  "theme": {
    "primaryColor": "#2563eb",
    "backgroundColor": "#f8fafc"
  }
}
```

### 3. Database Integration Workflow

#### Campaign Creation Flow:
```
User Input → AI Processing → Campaign Plan → User Approval → Database Creation
```

#### Required Supabase Operations:
1. **Insert Campaign**:
```sql
INSERT INTO campaigns (
  user_id, name, description, start_date, end_date,
  budget, platforms, target_audience, goals, status
) VALUES (...)
```

2. **Insert Campaign Phases**:
```sql
INSERT INTO campaign_phases (
  campaign_id, user_id, name, description, phase_order,
  start_date, end_date, goals, status
) VALUES (...)
```

### 4. React App Integration

#### Environment Configuration:
```bash
# .env.local
REACT_APP_N8N_CHAT_URL=https://your-n8n-instance.app.n8n.cloud/chat/campaign-assistant
```

#### ChatBot.js Integration:
The React component embeds the n8n chat widget as an iframe with:
- User authentication check
- Professional header with user context
- Full-height chat interface
- Development setup instructions

### 5. User Context Passing

#### Option 1: URL Parameters
```javascript
const chatUrl = `${N8N_CHAT_URL}?user_id=${user.id}&email=${user.email}`;
```

#### Option 2: PostMessage API
```javascript
iframe.contentWindow.postMessage({
  type: 'USER_CONTEXT',
  data: {
    user_id: user.id,
    user_email: user.email,
    user_name: user.user_metadata?.full_name
  }
}, '*');
```

### 6. Testing Your Setup

1. **Create the n8n chat workflow**
2. **Enable the chat widget** and copy the URL
3. **Update your .env.local** with the chat URL
4. **Test the integration**:
   - Navigate to AI Assistant page
   - Verify chat widget loads
   - Test conversation flow
   - Verify database operations

### 7. Advanced Features

#### Conversation Context:
- n8n automatically maintains conversation history
- AI can reference previous messages
- User can continue conversations across sessions

#### Campaign Management Integration:
- After campaign creation, redirect user to campaigns page
- Real-time updates when campaigns are created
- Integration with existing campaign management features

#### Error Handling:
- n8n handles connection issues automatically
- Graceful fallbacks for database errors
- User-friendly error messages

## Security Considerations

- **User Authentication**: Verify user identity before database operations
- **Data Validation**: Sanitize all inputs before database insertion
- **Rate Limiting**: Prevent abuse of AI services
- **CORS Configuration**: Ensure iframe can communicate with parent

## Next Steps

1. **Create your n8n AI chat workflow** with the above configuration
2. **Test the chat widget** independently in n8n
3. **Configure database connections** with proper credentials
4. **Update the chat URL** in your React app
5. **Test end-to-end flow** from chat to database creation

## Troubleshooting

- **Chat widget not loading**: Check CORS settings and URL
- **Database errors**: Verify Supabase credentials and table schemas
- **AI not responding**: Check API keys and rate limits
- **User context issues**: Verify authentication flow

This approach provides a much simpler and more robust solution compared to custom webhook integration while maintaining full functionality.