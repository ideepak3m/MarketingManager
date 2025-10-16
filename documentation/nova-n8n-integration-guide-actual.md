# n8n Integration Guide - Marketing Manager

This guide documents the actual n8n workflow implementation for the Marketing Manager application.

## Workflow Overview

The `MarketingManager.json` workflow implements a complete AI-powered campaign planning system with the following components:

### 1. Chat Trigger (Entry Point)
- **Node Type**: `@n8n/n8n-nodes-langchain.chatTrigger`
- **Webhook ID**: `77b6e70b-b3a8-4054-8a06-192b3b4e0727`
- **Function**: Receives user messages and initiates the workflow
- **Configuration**: Response mode set to "responseNodes" for controlled responses

### 2. AI Agent (Core Intelligence)
- **Node Type**: `@n8n/n8n-nodes-langchain.agent`
- **Model**: Connected to OpenAI GPT-4o
- **System Prompt**: Complete Nova personality and instructions (see nova-ai-system-prompt-actual.md)
- **Memory**: Connected to Simple Memory buffer for conversation context
- **Output**: Natural language response with embedded JSON payload

### 3. Simple Memory (Context Management)
- **Node Type**: `@n8n/n8n-nodes-langchain.memoryBufferWindow`
- **Window Length**: 20 messages
- **Function**: Maintains conversation history for contextual responses
- **Integration**: Connected to AI Agent for memory persistence

### 4. OpenAI Chat Model (Language Model)
- **Node Type**: `@n8n/n8n-nodes-langchain.lmChatOpenAi`
- **Model**: `gpt-4o`
- **Credentials**: OpenAI API account (`cPVaWES7kOLZMJQh`)
- **Function**: Provides language processing capabilities to AI Agent

### 5. JavaScript Processor (JSON Extraction & Validation)
- **Node Type**: `n8n-nodes-base.code`
- **Function**: Critical processing node that handles:

#### JSON Extraction Logic
```javascript
const responseText = $input.first().json.output;

// 1. Extract JSON block (robust match)
let extractedJson = null;
let summaryOnly = responseText;
try {
  const jsonMatch = responseText.match(/{[\s\S]*}/);
  if (jsonMatch) {
    const jsonString = jsonMatch[0];
    extractedJson = JSON.parse(jsonString);
    summaryOnly = responseText.replace(jsonString, "").trim(); // strip JSON from display
  }
} catch (err) {
  extractedJson = null;
}
```

#### Validation Logic
- **Campaign-level validation**: Checks for required fields in campaign object
- **Phase count consistency**: Validates `number_of_phases` matches actual `campaign_phases` array length
- **Phase-level validation**: Ensures each phase has required fields
- **Missing fields tracking**: Generates array of missing required fields

#### Required Campaign Fields
```javascript
const requiredCampaignFields = [
  "name", "description", "campaign_type", "status",
  "start_date", "end_date", "budget", "target_audience",
  "goals", "target_metrics", "platforms", "number_of_phases"
];
```

#### Required Phase Fields
```javascript
const requiredPhaseFields = [
  "name", "description", "phase_order", "start_date", "end_date",
  "status", "goals", "target_metrics"
];
```

#### Output Structure
```javascript
return {
  json: {
    readyToSave,           // Boolean: true when campaign + phases are complete
    campaignPayload,       // Extracted JSON or null
    summaryText,          // Human-readable text with JSON stripped
    missingFields,        // Array of missing required fields
    campaignPhaseCount,   // Number of actual phases
    isValidJSON          // Boolean: true when all validations pass
  }
};
```

### 6. Conditional Router (Decision Logic)
- **Node Type**: `n8n-nodes-base.if`
- **Condition**: `{{ $json.readyToSave }} === true`
- **Function**: Routes workflow based on campaign completion status
- **Outputs**:
  - **True Path**: Campaign is complete → Save to database → Send completion message
  - **False Path**: Campaign incomplete → Continue conversation

### 7. Database Integration (Supabase)
- **Node Type**: `n8n-nodes-base.supabase`
- **Table**: `campaign_capture_byNova`
- **Credentials**: Supabase API account (`iad9QWjCVBQWRjRJ`)
- **Trigger**: Only when `readyToSave` is true

#### Saved Fields
```javascript
fieldsUi: {
  fieldValues: [
    {
      fieldId: "campaign",
      fieldValue: "={{ $('If').item.json.campaignPayload }}"
    },
    {
      fieldId: "summaryText", 
      fieldValue: "={{ $('If').item.json.summaryText }}"
    },
    {
      fieldId: "missingFields",
      fieldValue: "={{ $('If').item.json.missingFields }}"
    }
  ]
}
```

### 8. Chat Response Nodes

#### Standard Response (Continue Conversation)
- **Node Type**: `@n8n/n8n-nodes-langchain.chat`
- **Message**: `{{ $('AI Agent').item.json.output }}`
- **Trigger**: When campaign is not ready (false path from conditional)
- **Function**: Echoes Nova's response to continue conversation

#### Completion Response (Campaign Saved)
- **Node Type**: `@n8n/n8n-nodes-langchain.chat`
- **Message**: "Thank you for using the Campaign Design chat window. I've gathered all the necessary details, and you'll receive a summary email shortly with everything we've captured. If there's anything else you'd like to add or clarify, feel free to let me know!"
- **Trigger**: After successful database save
- **Function**: Confirms campaign capture and sets user expectations

## Workflow Connections

```
Chat Trigger → AI Agent → JavaScript Processor → Conditional Router
                ↑                                        ↓         ↓
         Simple Memory                           Database Save   Continue Chat
         OpenAI Model                                ↓
                                              Completion Response
```

## Database Schema Requirements

The workflow expects a Supabase table named `campaign_capture_byNova` with these fields:

- `campaign` (JSONB): Complete campaign payload from Nova
- `summaryText` (TEXT): Human-readable campaign summary
- `missingFields` (JSONB): Array of validation issues

## Integration with React Frontend

The React app integrates with this workflow through:

1. **Iframe Embedding**: Loads n8n chat widget in `src/pages/ChatBot.js`
2. **Environment Variables**: `REACT_APP_N8N_CHAT_URL` points to webhook URL
3. **User Context**: Passes user authentication details to chat session
4. **API Integration**: `CampaignReports.js` fetches saved campaigns via API

## Environment Configuration

Required environment variables:
- `REACT_APP_N8N_CHAT_URL`: Full webhook URL for chat trigger
- `REACT_APP_API_BASE_URL`: Base URL for campaign data API
- Supabase credentials configured in n8n
- OpenAI API credentials configured in n8n

## Error Handling

The workflow includes robust error handling:
- JSON parsing errors are caught and handled gracefully
- Missing fields are tracked but don't block the conversation
- Invalid JSON structure still allows conversation to continue
- Database save failures are isolated from chat functionality

## Testing and Validation

Key test scenarios:
1. **Incomplete campaigns**: Should continue conversation without saving
2. **Complete campaigns**: Should save to database and show completion message
3. **Invalid JSON**: Should handle gracefully and continue conversation
4. **Missing required fields**: Should track issues but not break workflow
5. **Phase count mismatches**: Should flag inconsistencies in validation

This workflow provides a production-ready implementation of the Nova AI campaign planner with proper validation, error handling, and database integration.