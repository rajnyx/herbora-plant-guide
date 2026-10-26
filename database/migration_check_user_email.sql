-- Herbora Migration: check_user_email helper function
-- Enables precise auth error diagnostics (distinguishing between "email does not exist", "wrong password", and "unconfirmed email")
CREATE OR REPLACE FUNCTION public.check_user_email(email_to_check text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user record;
BEGIN
  SELECT id, email, confirmed_at, email_confirmed_at
  INTO v_user
  FROM auth.users
  WHERE lower(email) = lower(trim(email_to_check))
  LIMIT 1;

  IF FOUND THEN
    RETURN json_build_object(
      'exists', true,
      'confirmed', (v_user.email_confirmed_at IS NOT NULL OR v_user.confirmed_at IS NOT NULL)
    );
  ELSE
    RETURN json_build_object(
      'exists', false,
      'confirmed', false
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_user_email(text) TO anon, authenticated, service_role;
