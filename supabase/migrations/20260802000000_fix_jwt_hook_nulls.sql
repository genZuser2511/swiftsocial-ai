CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_profile   RECORD;
  v_role      TEXT;
BEGIN
  -- 1. Get the user's primary workspace and org details
  SELECT p.org_id, p.agency_id, p.default_workspace_id AS workspace_id,
         p.is_demo_user, o.is_demo, o.isolation_level, o.data_region
  INTO v_profile
  FROM public.profiles p
  LEFT JOIN public.organizations o ON o.id = p.org_id
  WHERE p.id = (event ->> 'user_id')::UUID;

  -- 2. Get the user's role for that workspace
  SELECT role::TEXT INTO v_role
  FROM public.user_workspace_roles
  WHERE user_id = (event ->> 'user_id')::UUID AND is_active = true
  ORDER BY created_at ASC LIMIT 1;

  -- 3. Inject the variables directly into the JWT token
  -- Use proper jsonb null for missing values so we don't throw UUID casting errors!
  
  IF v_profile.org_id IS NOT NULL THEN
    event := jsonb_set(event, '{claims,org_id}', to_jsonb(v_profile.org_id::TEXT));
  ELSE
    event := jsonb_set(event, '{claims,org_id}', 'null'::jsonb);
  END IF;

  IF v_profile.agency_id IS NOT NULL THEN
    event := jsonb_set(event, '{claims,agency_id}', to_jsonb(v_profile.agency_id::TEXT));
  ELSE
    event := jsonb_set(event, '{claims,agency_id}', 'null'::jsonb);
  END IF;

  IF v_profile.workspace_id IS NOT NULL THEN
    event := jsonb_set(event, '{claims,workspace_id}', to_jsonb(v_profile.workspace_id::TEXT));
  ELSE
    event := jsonb_set(event, '{claims,workspace_id}', 'null'::jsonb);
  END IF;

  event := jsonb_set(event, '{claims,role}',          to_jsonb(COALESCE(v_role, 'agent')));
  event := jsonb_set(event, '{claims,is_demo}',       to_jsonb(COALESCE(v_profile.is_demo, false)));
  
  RETURN event;
END; 
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
