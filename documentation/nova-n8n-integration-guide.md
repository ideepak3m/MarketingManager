# Updated n8n Workflow for Nova's JSON Structure

## Overview
This updated workflow handles Nova's dynamic JSON output structure and creates both database records and PDF reports.

## Nova's JSON Structure
```json
{
  "readyToSave": true,
  "campaignPayload": {
    "campaign": {
      "name": "Campaign Name",
      "description": "Campaign description",
      "number_of_phases": 3,
      "start_date": "2023-11-01",
      "campaign_length": "8 weeks",
      "status": "planned",
      "goals": {
        "budget": "2000",
        "target_audience": "Target description",
        "goals": "Primary objectives",
        "recommended_platforms": ["facebook", "instagram"]
      },
      "target_metrics": {
        "reach": 20000,
        "engagement_rate": "3%",
        "phase_specific_kpis": "KPI description"
      }
    },
    "campaign_phases": [
      {
        "name": "Phase Name",
        "description": "Phase description",
        "phase_order": 1,
        "start_date": "2023-11-01",
        "end_date": "2023-11-21",
        "status": "planned",
        "goals": {
          "description": "Phase goals",
          "content_strategy": "Content approach",
          "recommended_content_types": ["image", "video"],
          "recommended_platforms": ["facebook", "instagram"]
        },
        "target_metrics": {
          "reach": 10000,
          "engagement_rate": "2%",
          "phase_specific_kpis": "Phase KPIs"
        }
      }
    ]
  },
  "summaryText": "Nova's summary text for PDF generation",
  "missingFields": [],
  "campaignPhaseCount": 3,
  "isValidJSON": true
}
```

## Updated n8n Workflow Nodes

### 1. Chat Trigger Node
```json
{
  "chatName": "Nova - AI Campaign Planner",
  "welcomeMessage": "Hi! I'm Nova, your AI campaign strategist. Let's create a comprehensive marketing campaign tailored to your goals. What product, service, or idea would you like to promote?",
  "mode": "window"
}
```

### 2. AI Agent Node (Nova System Prompt)
Use the updated Nova system prompt that focuses on strategic phase planning and comprehensive JSON output.

### 3. JSON Validation Node (JavaScript)
```javascript
// Enhanced validation for Nova's JSON structure
const aiResponse = $input.first().json.chatInput || $input.first().json.output;

try {
  // Extract JSON from AI response
  let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return [{
      json: {
        valid: false,
        error: "No JSON found in AI response",
        continue_chat: true,
        message: "I need to gather more information. Could you tell me more about your campaign goals?"
      }
    }];
  }

  const fullResponse = JSON.parse(jsonMatch[0]);
  
  // Check if this is Nova's complete structure
  if (!fullResponse.readyToSave || !fullResponse.campaignPayload) {
    return [{
      json: {
        valid: false,
        continue_chat: true,
        message: aiResponse // Continue conversation
      }
    }];
  }

  const campaignData = fullResponse.campaignPayload;
  
  // Validate required campaign fields
  const requiredCampaignFields = ['campaign.name', 'campaign.description'];
  for (let field of requiredCampaignFields) {
    if (!getNestedValue(campaignData, field)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate phases
  if (!Array.isArray(campaignData.campaign_phases) || campaignData.campaign_phases.length === 0) {
    throw new Error('At least one campaign phase is required');
  }

  // Validate phase order
  campaignData.campaign_phases.forEach((phase, index) => {
    if (!phase.phase_order || phase.phase_order !== index + 1) {
      throw new Error(`Phase order must start at 1 and increment sequentially`);
    }
  });

  return [{
    json: {
      valid: true,
      campaign_data: campaignData,
      summary_text: fullResponse.summaryText || '',
      user_id: $('Chat Trigger').first().json.sessionId,
      message: "Perfect! Creating your strategic campaign now..."
    }
  }];

} catch (error) {
  return [{
    json: {
      valid: false,
      error: error.message,
      continue_chat: true,
      message: `I had trouble processing that information. ${error.message}. Let me ask a few more questions to ensure we have everything right.`
    }
  }];
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
```

### 4. Database Creation Node (JavaScript)
```javascript
// Use the new Supabase function for Nova's structure
const campaignData = $input.first().json.campaign_data;
const summaryText = $input.first().json.summary_text;
const userId = $input.first().json.user_id;

// Prepare data for the create_campaign_from_nova function
return [{
  json: {
    user_id: userId,
    campaign_json: JSON.stringify(campaignData.campaign),
    phases_json: JSON.stringify(campaignData.campaign_phases),
    summary_text: summaryText,
    function_call: 'create_campaign_from_nova'
  }
}];
```

### 5. Supabase Function Call Node
Configure to call the `create_campaign_from_nova` function:

**SQL Query:**
```sql
SELECT create_campaign_from_nova(
  $1::uuid,
  $2::jsonb,
  $3::jsonb,
  $4::text
) as campaign_id;
```

**Parameters:**
- `$1`: `{{$json.user_id}}`
- `$2`: `{{$json.campaign_json}}`
- `$3`: `{{$json.phases_json}}`
- `$4`: `{{$json.summary_text}}`

### 6. Success Response Node
```javascript
const campaignId = $('Supabase Function Call').first().json.campaign_id;
const campaignName = JSON.parse($('Database Creation').first().json.campaign_json).name;
const phasesCount = JSON.parse($('Database Creation').first().json.phases_json).length;

return [{
  json: {
    output: `🎉 Excellent! I've successfully created your "${campaignName}" campaign with ${phasesCount} strategic phases.

Your campaign is now live in the system with ID: ${campaignId}

✅ Campaign structure saved to database
✅ All ${phasesCount} phases configured
✅ Professional PDF report available for download
✅ Ready for execution

You can now:
• View your campaign in the Campaigns dashboard
• Download the professional PDF strategy report
• Begin implementing the phase-by-phase plan
• Track progress and metrics

Would you like to create another campaign or need help with implementation planning?`
  }
}];
```

## Key Improvements

### 1. **Flexible Phase Handling**
- Nova determines the number of phases (2-5 typically)
- Nova names phases strategically based on campaign type
- Nova sets optimal phase durations and sequencing

### 2. **Enhanced Data Capture**
- `number_of_phases` field tracks phase count
- `campaign_length` captures overall duration
- `summary_text` stored for PDF generation
- Enhanced goals structure with nested data

### 3. **Professional PDF Generation**
- Automatic PDF report creation
- Priority One Tech branding
- Professional formatting with cover page and TOC
- AI development credit included

### 4. **Improved Validation**
- Checks for Nova's complete JSON structure
- Validates strategic phase planning
- Ensures data integrity before database insertion

### 5. **Database Integration**
- Single function call handles entire campaign creation
- Atomic transactions ensure data consistency
- Automatic report generation entry creation

## Nova's Strategic Approach

Nova now acts as a true marketing strategist:

1. **Understands Business Context**: Analyzes user's business type, goals, and constraints
2. **Recommends Platform Strategy**: Chooses optimal platforms based on audience and goals
3. **Designs Phase Architecture**: Creates logical campaign flow (Awareness → Engagement → Conversion)
4. **Sets Realistic Metrics**: Establishes achievable KPIs based on budget and timeline
5. **Provides Strategic Rationale**: Explains why each phase and approach was chosen

This approach creates much more intelligent and customized campaigns compared to template-based solutions!

## Installation Steps

1. **Update your Supabase database** using `database_schema_update.sql`
2. **Install PDF dependencies** in your React app: `npm install jspdf html2canvas`
3. **Import the PDF components** where needed
4. **Configure the n8n workflow** with the updated nodes above
5. **Test end-to-end flow** from chat to database to PDF generation

Your marketing manager now has AI-powered strategic campaign planning with professional deliverables!