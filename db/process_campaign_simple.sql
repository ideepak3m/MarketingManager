-- Simple Campaign Processing Function
-- Processes raw campaign data from campaign_capture_byNova into structured tables
-- Based on actual Supabase schema exported 2025-10-16

CREATE OR REPLACE FUNCTION process_campaign_by_email(input_email TEXT)
RETURNS JSON AS $$
DECLARE
    raw_record RECORD;
    campaign_json JSONB;
    campaign_phases_json JSONB;
    new_campaign_id UUID;
    new_campaign_record RECORD;
    phase_record RECORD;
    result JSON;
BEGIN
    -- Find the most recent raw campaign data for this email
    SELECT * INTO raw_record
    FROM "campaign_capture_byNova" 
    WHERE "userEmail" = input_email 
    AND campaign IS NOT NULL
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Check if we found any data
    IF raw_record IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No campaign data found for email: ' || input_email
        );
    END IF;
    
    -- Parse the campaign JSON (stored as TEXT in campaign column)
    BEGIN
        campaign_json := raw_record.campaign::JSONB;
    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid JSON in campaign data'
        );
    END;
    
    -- Extract campaign phases if they exist
    campaign_phases_json := campaign_json->'campaign_phases';
    
    -- Generate new campaign ID
    new_campaign_id := gen_random_uuid();
    
    -- Insert into campaigns table
    INSERT INTO campaigns (
        id,
        user_id,
        name,
        description,
        campaign_type,
        status,
        start_date,
        end_date,
        budget,
        target_audience,
        goals,
        target_metrics,
        platforms,
        number_of_phases,
        campaign_length,
        created_by_ai,
        ai_model_version
    ) VALUES (
        new_campaign_id,
        input_email, -- Use email as user_id for tracking
        COALESCE(campaign_json->'campaign'->>'name', 'Untitled Campaign'),
        campaign_json->'campaign'->>'description',
        'marketing',  -- Default type since it's missing from JSON
        'draft',
        CASE 
            WHEN campaign_json->'campaign'->>'start_date' IS NOT NULL 
            THEN (campaign_json->'campaign'->>'start_date')::timestamp with time zone
            ELSE NOW()
        END,
        CASE 
            WHEN campaign_json->'campaign'->>'end_date' IS NOT NULL 
            THEN (campaign_json->'campaign'->>'end_date')::timestamp with time zone
            WHEN campaign_json->'campaign'->>'campaign_length' IS NOT NULL 
            THEN 
                CASE 
                    WHEN campaign_json->'campaign'->>'start_date' IS NOT NULL 
                    THEN (campaign_json->'campaign'->>'start_date')::timestamp with time zone + 
                         CASE 
                            WHEN campaign_json->'campaign'->>'campaign_length' LIKE '% week%' 
                            THEN (regexp_replace(campaign_json->'campaign'->>'campaign_length', '[^0-9]', '', 'g')::integer || ' weeks')::interval
                            WHEN campaign_json->'campaign'->>'campaign_length' LIKE '% month%' 
                            THEN (regexp_replace(campaign_json->'campaign'->>'campaign_length', '[^0-9]', '', 'g')::integer || ' months')::interval
                            WHEN campaign_json->'campaign'->>'campaign_length' LIKE '% day%' 
                            THEN (regexp_replace(campaign_json->'campaign'->>'campaign_length', '[^0-9]', '', 'g')::integer || ' days')::interval
                            ELSE '8 weeks'::interval
                         END
                    ELSE NOW() + '8 weeks'::interval
                END
            ELSE NULL
        END,
        COALESCE((campaign_json->'campaign'->'goals'->>'budget')::numeric, 0),  -- budget is nested in goals
        jsonb_build_object('target_audience', campaign_json->'campaign'->'goals'->>'target_audience'),  -- nested in goals
        campaign_json->'campaign'->'goals',
        campaign_json->'campaign'->'target_metrics',
        CASE 
            WHEN campaign_json->'campaign'->'goals'->'recommended_platforms' IS NOT NULL 
            THEN ARRAY(SELECT jsonb_array_elements_text(campaign_json->'campaign'->'goals'->'recommended_platforms'))
            ELSE '{}'::text[]
        END,
        COALESCE(jsonb_array_length(campaign_phases_json), 0),
        COALESCE(campaign_json->'campaign'->>'campaign_length', campaign_json->'campaign'->>'duration', '8 weeks'),
        true,
        'Nova-1.0'
    );
    
    -- Insert campaign phases if they exist
    IF campaign_phases_json IS NOT NULL AND jsonb_array_length(campaign_phases_json) > 0 THEN
        FOR i IN 0..jsonb_array_length(campaign_phases_json)-1 LOOP
            INSERT INTO campaign_phases (
                id,
                campaign_id,
                user_id,
                name,
                description,
                phase_order,
                start_date,
                end_date,
                status,
                goals,
                target_metrics,
                content_strategy,
                recommended_content_types,
                recommended_platforms
            ) VALUES (
                gen_random_uuid(),
                new_campaign_id,
                input_email, -- Use email as user_id for tracking
                (campaign_phases_json->i->>'name'),
                (campaign_phases_json->i->>'description'),
                i + 1,
                CASE 
                    WHEN campaign_phases_json->i->>'start_date' IS NOT NULL 
                    THEN (campaign_phases_json->i->>'start_date')::timestamp with time zone
                    ELSE NOW() + (i || ' days')::interval
                END,
                CASE 
                    WHEN campaign_phases_json->i->>'end_date' IS NOT NULL 
                    THEN (campaign_phases_json->i->>'end_date')::timestamp with time zone
                    ELSE NOW() + ((i + 7) || ' days')::interval
                END,
                'planned',
                campaign_phases_json->i->'goals',
                campaign_phases_json->i->'target_metrics',
                campaign_phases_json->i->>'content_strategy',
                CASE 
                    WHEN campaign_phases_json->i->'content_types' IS NOT NULL 
                    THEN ARRAY(SELECT jsonb_array_elements_text(campaign_phases_json->i->'content_types'))
                    ELSE '{}'::text[]
                END,
                CASE 
                    WHEN campaign_phases_json->i->'platforms' IS NOT NULL 
                    THEN ARRAY(SELECT jsonb_array_elements_text(campaign_phases_json->i->'platforms'))
                    ELSE '{}'::text[]
                END
            );
        END LOOP;
    END IF;
    
    -- Get the created campaign for response
    SELECT * INTO new_campaign_record FROM campaigns WHERE id = new_campaign_id;
    
    -- Build success response
    result := json_build_object(
        'success', true,
        'campaign_id', new_campaign_id,
        'campaign_name', new_campaign_record.name,
        'phases_created', new_campaign_record.number_of_phases,
        'raw_data_id', raw_record.id,
        'session_id', raw_record."sessionId"
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    -- Handle any errors
    RETURN json_build_object(
        'success', false,
        'error', 'Database error: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION process_campaign_by_email(TEXT) TO anon, authenticated;