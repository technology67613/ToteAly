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
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
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
        console.error('Failed to create auth user, checking list again:', createError.message);
        
        // Try searching user list once more in case of race condition or delayed indexing
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000
        });
        if (!listError && users) {
          const authUser = users.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
          if (authUser) {
            authUserId = authUser.id;
          }
        }
        
        if (!authUserId) {
          throw new Error(`Auth user creation failed: ${createError.message}`);
        }
      } else if (user) {
        authUserId = user.id;
        console.log(`Successfully created auth user for ${normalizedEmail} with ID: ${authUserId}`);
      }
    } catch (err: any) {
      console.error("Error in createUser block:", err);
      // Try listing one final time
      const { data: { users } } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const authUser = users?.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
      if (authUser) {
        authUserId = authUser.id;
      } else {
        throw new Error(`Failed to resolve auth user for profile creation: ${err.message}`);
      }
    }
  }

  if (!authUserId) {
    throw new Error(`Unable to resolve a valid Auth User ID for ${normalizedEmail}`);
  }

  // 4. Now upsert/insert the profile row using this valid authUserId
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
