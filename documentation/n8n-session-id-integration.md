# n8n Session ID Integration Guide

This guide shows how to modify your n8n workflow to include session tracking with UUIDs.

## 🎯 Why Add Session ID?

### Benefits of Session Tracking
1. **Correlation**: Link frontend interactions with backend data
2. **Debugging**: Track specific chat sessions through the system
3. **Deduplication**: Prevent duplicate campaign saves
4. **Analytics**: Understand user behavior patterns
5. **Error Recovery**: Resume or replay specific sessions

## 🔧 n8n Workflow Modifications

### 1. Add Session ID Generation
Add a new node after the Chat Trigger to generate or extract session ID:

```javascript
// New Node: "Generate Session ID" (Code Node)
// Place between Chat Trigger and AI Agent

const sessionId = $input.first().json.sessionId || 
                 $execution.id || 
                 crypto.randomUUID();

return {
  json: {
    sessionId: sessionId,
    originalInput: $input.first().json
  }
};
```

### 2. Pass Session ID Through Workflow
Modify your existing JavaScript processing node:

```javascript
// Updated JavaScript Processor Node
const responseText = $input.first().json.output;
const sessionId = $('Generate Session ID').item.json.sessionId;

// ... existing JSON extraction logic ...

return {
  json: {
    sessionId,                     // Add session ID to output
    readyToSave,
    campaignPayload: extractedJson || null,
    summaryText: summaryOnly,
    missingFields,
    campaignPhaseCount: actualPhaseCount,
    isValidJSON: isValid
  }
};
```

### 3. Update Database Save Node
Modify the Supabase node to include session_id:

```javascript
// Updated Supabase Save Configuration
fieldsUi: {
  fieldValues: [
    {
      fieldId: "session_id",
      fieldValue: "={{ $('Code in JavaScript').item.json.sessionId }}"
    },
    {
      fieldId: "campaign",
      fieldValue: "={{ $('Code in JavaScript').item.json.campaignPayload }}"
    },
    {
      fieldId: "summaryText", 
      fieldValue: "={{ $('Code in JavaScript').item.json.summaryText }}"
    },
    {
      fieldId: "missingFields",
      fieldValue: "={{ $('Code in JavaScript').item.json.missingFields }}"
    },
    {
      fieldId: "user_id",
      fieldValue: "={{ $('Chat Trigger').item.json.userId || null }}"
    }
  ]
}
```

## 🎨 Frontend Integration

### Pass Session ID to n8n Chat
```javascript
// In ChatBot.js - Pass session ID to n8n chat widget
const sessionId = crypto.randomUUID();

const chatWidgetUrl = `${process.env.REACT_APP_N8N_CHAT_URL}?sessionId=${sessionId}&userId=${user.id}`;

// Store session ID in component state for later reference
const [currentSessionId, setCurrentSessionId] = useState(sessionId);
```

### Track Sessions in CampaignReports
```javascript
// In CampaignReports.js - Add session tracking
const loadCampaigns = async () => {
    const { data, error } = await supabase
        .from('campaign_capture_byNova')
        .select('*')
        .order('created_at', { ascending: false });

    // Group by session for better organization
    const campaignsBySession = data.reduce((acc, campaign) => {
        const sessionId = campaign.session_id;
        if (!acc[sessionId]) {
            acc[sessionId] = [];
        }
        acc[sessionId].push(campaign);
        return acc;
    }, {});

    setCampaigns(data);
    setSessionGroups(campaignsBySession);
};
```

## 🔍 Session-Based Querying

### Get Campaign by Session ID
```javascript
// Useful for correlating frontend and backend
const getCampaignBySession = async (sessionId) => {
    const { data, error } = await supabase
        .rpc('get_campaign_by_session', { session_uuid: sessionId });
    
    return data?.[0]; // Should be unique per session
};
```

### Session Analytics
```javascript
// Track session completion rates
const getSessionAnalytics = async () => {
    const { data, error } = await supabase
        .from('campaign_capture_byNova')
        .select('session_id, created_at, missingFields')
        .order('created_at', { ascending: false });

    const sessionStats = data.reduce((acc, campaign) => {
        const isComplete = !campaign.missingFields || campaign.missingFields.length === 0;
        acc.total += 1;
        acc.completed += isComplete ? 1 : 0;
        return acc;
    }, { total: 0, completed: 0 });

    return {
        completionRate: sessionStats.completed / sessionStats.total,
        totalSessions: sessionStats.total
    };
};
```

## 🛡️ Error Handling with Sessions

### Duplicate Prevention
```sql
-- Add unique constraint to prevent duplicate session saves
ALTER TABLE campaign_capture_byNova 
ADD CONSTRAINT unique_session_campaign 
UNIQUE (session_id);
```

### Session Recovery
```javascript
// In n8n workflow - check for existing session before saving
const existingCampaign = await supabase
    .from('campaign_capture_byNova')
    .select('id')
    .eq('session_id', sessionId)
    .single();

if (existingCampaign.data) {
    // Update existing campaign instead of creating new one
    const { data, error } = await supabase
        .from('campaign_capture_byNova')
        .update({
            campaign: campaignPayload,
            summaryText: summaryText,
            missingFields: missingFields,
            updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
} else {
    // Create new campaign
    // ... existing insert logic
}
```

## 📊 Database Schema Considerations

### Primary Key Strategy: Hybrid Approach
```sql
-- Recommended: Keep serial ID + add session_id
CREATE TABLE campaign_capture_byNova (
    id SERIAL PRIMARY KEY,              -- Fast database operations
    session_id UUID NOT NULL UNIQUE,   -- n8n session correlation
    -- ... other fields
);
```

### Why Not Use UUID as Primary Key?
1. **Performance**: Integer joins are faster than UUID joins
2. **Storage**: UUIDs take more space (36 chars vs 4-8 bytes)
3. **Indexing**: Integer indexes are more efficient
4. **Compatibility**: Some tools work better with integer IDs

### Why Keep Session ID Separate?
1. **Flexibility**: Can change session tracking without affecting primary keys
2. **Correlation**: Easy to correlate with external systems (n8n, analytics)
3. **Debugging**: Clear tracking of user sessions vs database records
4. **Uniqueness**: Enforce session uniqueness without affecting ID sequence

## 🚀 Implementation Steps

1. **Update Database Schema**: Run `campaign_capture_table.sql`
2. **Modify n8n Workflow**: Add session ID generation and passing
3. **Update Frontend**: Pass session IDs from chat widget
4. **Test Session Flow**: Verify session correlation works end-to-end
5. **Add Session Analytics**: Track session completion and user behavior

This approach gives you the best of both worlds: efficient database operations with powerful session tracking capabilities.