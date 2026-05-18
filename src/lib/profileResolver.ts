import { supabaseAdmin as supabase } from "@/lib/supabase";
import { v5 as uuidv5 } from "uuid";

const TOTEALY_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

export async function resolveProfile(email: string, name?: string, avatarUrl?: string) {
  if (!email) {
    throw new Error("Email is required to resolve profile");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if profile already exists in public.profiles
  const { data: existingProfile, error: getError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (existingProfile) {
    return existingProfile;
  }

  // 2. Profile does not exist, check if user exists in auth.users
  let authUserId: string | null = null;
  
  try {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (!listError && users) {
      const authUser = users.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
      if (authUser) {
        authUserId = authUser.id;
      }
    }
  } catch (err) {
    console.error("Failed to list auth users:", err);
  }

  // 3. If not found in auth.users, create them in auth.users
  if (!authUserId) {
    try {
      const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: true,
        user_metadata: { 
          role: normalizedEmail === 'toteallyiconic@gmail.com' ? 'admin' : 'user',
          name: name || normalizedEmail.split('@')[0]
        }
      });

      if (createError) {
        console.error('Failed to create auth user:', createError.message);
        // Fallback to deterministic UUID
        authUserId = uuidv5(normalizedEmail, TOTEALY_NAMESPACE);
      } else if (user) {
        authUserId = user.id;
        console.log(`Successfully created auth user for ${normalizedEmail} with ID: ${authUserId}`);
      }
    } catch (err) {
      console.error("Error in createUser block:", err);
      authUserId = uuidv5(normalizedEmail, TOTEALY_NAMESPACE);
    }
  }

  if (!authUserId) {
    authUserId = uuidv5(normalizedEmail, TOTEALY_NAMESPACE);
  }

  // 4. Now upsert/insert the profile row using this authUserId
  const { data: profile, error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      id: authUserId,
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0],
      role: normalizedEmail === 'toteallyiconic@gmail.com' ? 'admin' : 'user',
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' })
    .select('*')
    .single();

  if (upsertError) {
    console.error('Failed to upsert profile in public.profiles:', upsertError.message);
    throw upsertError;
  }

  return profile;
}
