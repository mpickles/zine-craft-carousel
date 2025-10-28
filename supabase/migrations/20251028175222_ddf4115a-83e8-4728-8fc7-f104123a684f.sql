-- Update the handle_new_user function to store birthdate
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, email_verified_at, account_created_at, birthdate)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NULL),
    NEW.email_confirmed_at,
    NOW(),
    CASE 
      WHEN NEW.raw_user_meta_data->>'birthdate' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'birthdate')::date
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$function$;