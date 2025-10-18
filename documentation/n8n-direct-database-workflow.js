// n8n Workflow Structure for Direct Database Updates
// This replaces the complex SQL processing function

// Node 1: Nova AI Chat (existing)
// Node 2: Conditional Check (existing) 
// Node 3: Parse Campaign Data

// Node 4: Insert Campaign Record
{
    "operation": "insert",
        "table": "campaigns",
            "records": [
                {
                    "id": "{{ $('Nova AI Chat').first().json.sessionId }}", // Use n8n sessionId
                    "user_id": "{{ $('Nova AI Chat').first().json.userEmail }}",
                    "name": "{{ $json.campaign.name }}",
                    "description": "{{ $json.campaign.description }}",
                    "campaign_type": "Nova Generated",
                    "status": "draft",
                    "start_date": "{{ new Date().toISOString() }}",
                    "end_date": "{{ new Date(Date.now() + 30*24*60*60*1000).toISOString() }}",
                    "budget": "{{ $json.campaign.budget || 0 }}",
                    "target_audience": "{{ JSON.stringify($json.campaign.targetAudience || {}) }}",
                    "goals": "{{ JSON.stringify($json.campaign.goals || {}) }}",
                    "target_metrics": "{{ JSON.stringify($json.campaign.targetMetrics || {}) }}",
                    "platforms": "{{ JSON.stringify($json.campaign.platforms || []) }}",
                    "number_of_phases": "{{ $json.campaignPhases?.length || 0 }}",
                    "campaign_length": "{{ $json.campaign.campaignLength || '30 days' }}",
                    "summary_text": "{{ $('Nova AI Chat').first().json.summaryText }}",
                    "created_by_ai": true,
                    "ai_model_version": "Nova-1.0"
                }
            ]
}

// Node 5: Insert Campaign Phases (Loop)
{
    "operation": "insert",
        "table": "campaign_phases",
            "records": [
                // For each phase in campaignPhases array
                {
                    "id": "{{ $generateUUID() }}", // Generate new UUID for each phase
                    "campaign_id": "{{ $('Nova AI Chat').first().json.sessionId }}", // Link to campaign
                    "user_id": "{{ $('Nova AI Chat').first().json.userEmail }}",
                    "name": "{{ $json.name }}",
                    "description": "{{ $json.description }}",
                    "phase_order": "{{ $json.order || $index + 1 }}",
                    "start_date": "{{ new Date(Date.now() + $index * 14 * 24 * 60 * 60 * 1000).toISOString() }}",
                    "end_date": "{{ new Date(Date.now() + ($index + 1) * 14 * 24 * 60 * 60 * 1000).toISOString() }}",
                    "status": "planned",
                    "goals": "{{ JSON.stringify($json.goals || {}) }}",
                    "target_metrics": "{{ JSON.stringify($json.targetMetrics || {}) }}",
                    "content_strategy": "{{ $json.contentStrategy || '' }}",
                    "recommended_content_types": "{{ JSON.stringify($json.recommendedContentTypes || []) }}",
                    "recommended_platforms": "{{ JSON.stringify($json.recommendedPlatforms || []) }}"
                }
            ]
}

// Node 6: Update campaign_capture_byNova Status
{
    "operation": "update",
        "table": "campaign_capture_byNova",
            "condition": {
        "userSessionID": "{{ $('Nova AI Chat').first().json.userSessionID }}"
    },
    "records": [
        {
            "status": "Processed", // Changed from 'Created' to 'Processed'
            "updated_at": "{{ new Date().toISOString() }}"
        }
    ]
}

// Node 7: Success Response to Chat
{
    "output": "🎉 Perfect! I've successfully created your campaign and set up all {{ $json.campaignPhases?.length || 0 }} phases. Your campaign is now live in the system and ready to execute. You can view and manage it in your Campaigns dashboard!"
}