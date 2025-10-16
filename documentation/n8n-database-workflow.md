# n8n Database Integration Workflow

## Overview
This guide shows how to take Nova's structured JSON output and insert it into your Supabase database using n8n nodes.

## Workflow Structure
```
Chat Trigger → AI Agent (Nova) → Validate JSON → Insert Campaign → Insert Phases → Success Response
```

## Step-by-Step n8n Setup

### 1. Chat Trigger Node
Configure the initial chat trigger:
```json
{
  "chatName": "Nova - AI Campaign Planner",
  "welcomeMessage": "Hi, I'm Nova—your AI campaign planner from Priority One Tech. Want to describe your campaign idea and I'll help you turn it into a full plan?",
  "initialMessages": [],
  "mode": "window"
}
```

### 2. AI Agent Node (OpenAI/Claude)
Use the complete Nova system prompt from `nova-ai-system-prompt.md` with these settings:
- **Model**: gpt-4 or claude-3-sonnet
- **Temperature**: 0.3 (for consistent output)
- **Max Tokens**: 2000
- **System Prompt**: Use the complete Nova prompt

### 3. JSON Validation Node (JavaScript)
Add this JavaScript code to validate Nova's simplified output:

```javascript
// Validate and parse AI response
const aiResponse = $input.first().json.chatInput || $input.first().json.output;

try {
  // Try to parse JSON from AI response
  let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return [{
      json: {
        valid: false,
        error: "No JSON found in AI response",
        continue_chat: true,
        message: "I need to gather more information before creating your campaign. Could you tell me more about your goals?"
      }
    }];
  }

  const campaignData = JSON.parse(jsonMatch[0]);
  
  // Validate required structure - simplified
  const required = ['campaign.name', 'campaign.description', 'campaign.campaign_type', 'campaign_phases'];
  for (let field of required) {
    if (!getNestedValue(campaignData, field)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate campaign_type
  const validTypes = ['product_launch', 'brand_awareness', 'lead_generation', 'sales', 'event_promotion'];
  if (!validTypes.includes(campaignData.campaign.campaign_type)) {
    throw new Error('Invalid campaign_type');
  }

  // Validate phases structure
  if (!Array.isArray(campaignData.campaign_phases) || campaignData.campaign_phases.length === 0) {
    throw new Error('At least one phase is required');
  }

  // Validate phase order
  campaignData.campaign_phases.forEach((phase, index) => {
    if (phase.phase_order !== index + 1) {
      throw new Error(`Phase order must start at 1 and increment`);
    }
  });

  return [{
    json: {
      valid: true,
      campaign_data: campaignData,
      user_id: $('Chat Trigger').first().json.sessionId, // Use session ID or get from user context
      message: "Great! Creating your campaign now..."
    }
  }];

} catch (error) {
  return [{
    json: {
      valid: false,
      error: error.message,
      continue_chat: true,
      message: `I had trouble processing that. Let me ask you a few more questions to make sure I have everything right. ${error.message}`
    }
  }];
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
```

### 5. Supabase Insert Campaign Node
Configure Supabase node for simplified campaign insertion:

**JavaScript to prepare campaign data:**
```javascript
const data = $input.first().json.campaign_data;
const userId = $input.first().json.user_id;

return [{
  json: {
    user_id: userId,
    name: data.campaign.name,
    description: data.campaign.description,
    campaign_type: data.campaign.campaign_type,
    status: 'planned',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}];
```

### 6. Supabase Insert Phases Node
Configure second Supabase node for simplified phases:

**JavaScript to prepare phases data:**
```javascript
const campaignData = $('Validate JSON').first().json.campaign_data;
const campaignId = $('Supabase Insert Campaign').first().json.id;
const userId = $('Validate JSON').first().json.user_id;

const phases = campaignData.campaign_phases.map(phase => ({
  campaign_id: campaignId,
  user_id: userId,
  name: phase.name,
  description: phase.description,
  phase_order: phase.phase_order,
  status: 'planned',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

return phases.map(phase => ({ json: phase }));
```

**Node Settings:**
- **Operation**: Insert
- **Table**: campaign_phases
- **Batch Size**: Set to handle multiple phases

### 7. Success Response Node
Final response back to chat:

```javascript
const campaignName = $('Supabase Insert Campaign').first().json.name;
const campaignId = $('Supabase Insert Campaign').first().json.id;
const phasesCount = $('Supabase Insert Phases').length;

return [{
  json: {
    output: `🎉 Perfect! I've successfully created your "${campaignName}" campaign with ${phasesCount} phases.

Your campaign is now live in the system with ID: ${campaignId}

You can view and manage it in your Campaigns dashboard. Would you like to create another campaign or need help with anything else?`
  }
}];
```

## Environment Variables in n8n

Set these in your n8n instance:

```bash
SUPABASE_URL=https://dgixdsalyudglthesnxp.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

## Complete Workflow Summary

1. **User chats** with Nova about campaign idea
2. **Nova asks questions** to gather requirements
3. **When ready**, Nova outputs structured JSON
4. **Validation node** checks JSON format and required fields
5. **If valid**, insert campaign into `campaigns` table
6. **Get campaign ID**, then insert all phases into `campaign_phases` table
7. **Success message** confirms creation to user
8. **If invalid**, continue conversation or show error

## Error Handling

Add error handling nodes after each Supabase operation:

```javascript
// Error handler for database operations
if ($input.first().json.error) {
  return [{
    json: {
      output: `I encountered an issue creating your campaign: ${$input.first().json.error.message}. Let me try again or would you like to modify the campaign details?`
    }
  }];
}
```

## Testing Your Workflow

1. **Test conversation flow** without database operations first
2. **Test JSON validation** with sample campaign data
3. **Test database insertion** with manual JSON input
4. **Test complete end-to-end** flow
5. **Verify data** appears correctly in Supabase

## Monitoring and Logs

- Enable **workflow execution logs** in n8n
- Monitor **Supabase logs** for database operations
- Set up **error notifications** for failed insertions
- Track **campaign creation metrics**

This setup gives you a robust pipeline from conversational AI to structured database records!