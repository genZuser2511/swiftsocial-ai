CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_org_id       UUID;
  v_agency_id    UUID;
  v_workspace_id UUID;
  v_is_demo      BOOLEAN;
  v_role         TEXT;
BEGIN
  -- 1. Get the user's details safely into scalar variables (avoids RECORD uninitialized errors)
  SELECT p.org_id, p.agency_id, p.default_workspace_id, p.is_demo_user
  INTO v_org_id, v_agency_id, v_workspace_id, v_is_demo
  FROM public.profiles p
  WHERE p.id = (event ->> 'user_id')::UUID;

  -- 2. Get the user's role for that workspace
  SELECT role::TEXT INTO v_role
  FROM public.user_workspace_roles
  WHERE user_id = (event ->> 'user_id')::UUID AND is_active = true
  ORDER BY created_at ASC LIMIT 1;

  -- 3. Inject the variables directly into the JWT token
  IF v_org_id IS NOT NULL THEN
    event := jsonb_set(event, '{claims,org_id}', to_jsonb(v_org_id::TEXT));
  ELSE
    event := jsonb_set(event, '{claims,org_id}', 'null'::jsonb);
  END IF;

  IF v_agency_id IS NOT NULL THEN
    event := jsonb_set(event, '{claims,agency_id}', to_jsonb(v_agency_id::TEXT));
  ELSE
    event := jsonb_set(event, '{claims,agency_id}', 'null'::jsonb);
  END IF;

  IF v_workspace_id IS NOT NULL THEN
    event := jsonb_set(event, '{claims,workspace_id}', to_jsonb(v_workspace_id::TEXT));
  ELSE
    event := jsonb_set(event, '{claims,workspace_id}', 'null'::jsonb);
  END IF;

  event := jsonb_set(event, '{claims,role}',          to_jsonb(COALESCE(v_role, 'agent')));
  event := jsonb_set(event, '{claims,is_demo}',       to_jsonb(COALESCE(v_is_demo, false)));
  
  RETURN event;
END; 
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
