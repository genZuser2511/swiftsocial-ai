-- Step 1: Add a universal database trigger to prevent ANYONE from deleting default agents
CREATE OR REPLACE FUNCTION prevent_default_agent_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.name IN ('Inbound call agent', 'Outbound call agent') THEN
    RAISE EXCEPTION 'Default agents cannot be deleted.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_default_agent_deletion ON public.ai_agents;
CREATE TRIGGER trg_prevent_default_agent_deletion
  BEFORE DELETE ON public.ai_agents
  FOR EACH ROW EXECUTE FUNCTION prevent_default_agent_deletion();

-- Step 2: Seed the Test User's data
DO $$ 
DECLARE 
    test_user_id UUID;
    inbound_agent_id UUID;
    outbound_agent_id UUID;
BEGIN
    -- Look up testuser@example.com
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'testuser@example.com' LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'User testuser@example.com not found. Please create this user in Supabase Auth first.';
    END IF;

    -- Clean up existing default agents for this user to prevent duplicates if you run this twice
    DELETE FROM public.ai_agents WHERE user_id = test_user_id AND name IN ('Inbound call agent', 'Outbound call agent');

    -- Insert Inbound call agent
    INSERT INTO public.ai_agents (user_id, name, description, status, languages, total_calls, avg_duration, success_rate)
    VALUES (
        test_user_id, 
        'Inbound call agent', 
        'act as an appointment setter and customer care agent', 
        'active', 
        ARRAY['English', 'Hindi'], 
        3, 234, 100.00
    ) RETURNING id INTO inbound_agent_id;

    -- Insert Outbound call agent
    INSERT INTO public.ai_agents (user_id, name, description, status, languages, total_calls, avg_duration, success_rate)
    VALUES (
        test_user_id, 
        'Outbound call agent', 
        'make sales calls, also get reviews and call for renewals', 
        'active', 
        ARRAY['English', 'Hindi'], 
        3, 165, 100.00
    ) RETURNING id INTO outbound_agent_id;

    -- Insert mock calls for Inbound Agent
    INSERT INTO public.calls (user_id, agent_id, phone_number, duration, status, sentiment, summary, recording_url, transcript)
    VALUES 
    (test_user_id, inbound_agent_id, '+91 91234 56789', 292, 'completed', 'positive', 'Pure term life insurance inquiry (₹50L). Customer: Akash from Ahmedabad. Callback scheduled for tomorrow morning.', '/recordings/insurance_inbound5.wav', '[{"role": "agent", "text": "Thank you for calling Alpha Insurance. My name is Aria. How can I help you today — are you calling about an existing account, or would you like to explore our insurance plans?"}, {"role": "user", "text": "I would like to see what you offer in insurance plans."}]'),
    (test_user_id, inbound_agent_id, '+91 88776 55443', 134, 'completed', 'positive', 'Premium payment issue for existing account. Customer: Rahul. Specialist callback scheduled within next few hours.', '/recordings/insurance_inbound4.wav', '[{"role": "agent", "text": "Thank you for calling Alpha Insurance. My name is Aria. How can I help you today?"}, {"role": "user", "text": "I am calling about an existing account."}]'),
    (test_user_id, inbound_agent_id, 'Rahul (Gujarat)', 278, 'completed', 'positive', 'Pure term life insurance inquiry (₹50L). Customer: Rahul from Gujarat (26yo, non-smoker). Callback scheduled for tomorrow afternoon.', '/recordings/insurance_inbound6.wav', '[{"role": "agent", "text": "Thank you for calling Alpha Insurance. My name is Aria."}, {"role": "user", "text": "I would like to explore some of the plans."}]');

    -- Insert mock calls for Outbound Agent
    INSERT INTO public.calls (user_id, agent_id, phone_number, duration, status, sentiment, summary, recording_url, transcript)
    VALUES 
    (test_user_id, outbound_agent_id, 'Pranit', 192, 'completed', 'positive', 'Life insurance renewal follow-up. Customer: Pranit. Benefits explained: uninterrupted coverage, no fresh medicals. Renewal confirmed.', '/recordings/insurance_outbound2.wav', '[{"role": "agent", "text": "Hi, am I speaking with pranit?"}, {"role": "user", "text": "Yes. Who''s this?"}]'),
    (test_user_id, outbound_agent_id, 'Aditya', 245, 'completed', 'neutral', 'Health insurance renewal reminder. Customer: Aditya expressed dissatisfaction. Specialist callback scheduled for tomorrow morning.', '/recordings/insurance_outbound3.wav', '[{"role": "agent", "text": "Hi, am I speaking with aditya?"}, {"role": "user", "text": "Yes. Who am I talking to?"}]'),
    (test_user_id, outbound_agent_id, 'Raul', 178, 'completed', 'positive', 'Auto insurance renewal. Customer: Raul. Benefit highlighted: No Claim Bonus (NCB) protection. Renewal confirmed.', '/recordings/insurance_outbound4.wav', '[{"role": "agent", "text": "Hi, am I speaking with rahul?"}, {"role": "user", "text": "This is Raul. Who am I talking to?"}]');
    
END $$;
