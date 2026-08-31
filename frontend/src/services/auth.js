import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Sign up a new user, create their profile record, and if patient, create patients table entry.
 */
export async function signUp({ email, password, fullName, role = 'patient', phone = '' }) {
  if (!isSupabaseConfigured) {
    return { user: null, session: null, profile: null, error: new Error('Supabase is not configured.') };
  }

  // 1. Sign up the user in Supabase Auth with metadata
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        phone,
      },
    },
  });

  // Explicitly return if Supabase returns any error (e.g. 429 rate limit, invalid format)
  if (authError || !authData?.user) {
    return { user: null, session: null, profile: null, error: authError || new Error('Signup failed.') };
  }

  // Check if email already existed in Supabase (identities array will be empty)
  if (authData.user.identities && authData.user.identities.length === 0) {
    const existingUserError = new Error('This account already exists. Please sign in instead of registering again.');
    existingUserError.code = 'user_already_exists';
    existingUserError.status = 400;
    existingUserError.isExistingUser = true;
    return { user: null, session: null, profile: null, error: existingUserError };
  }

  let activeSession = authData.session;
  const user = authData.user;

  // 2. If no active session returned (e.g. project setting), attempt auto-sign-in to obtain JWT session
  if (!activeSession) {
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!signInErr && signInData?.session) {
      activeSession = signInData.session;
    }
  }

  // 3. Check/Fetch profile from database (created by PostgreSQL trigger)
  let profile = null;
  let patientRecord = null;

  if (activeSession) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (existingProfile) {
      profile = existingProfile;
    } else {
      // Fallback manual insert if trigger not run
      const { data: insertedProfile } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          role,
          phone,
        })
        .select()
        .maybeSingle();

      profile = insertedProfile;
    }

    // 4. Ensure patient record if role is patient
    if (role === 'patient') {
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (existingPatient) {
        patientRecord = existingPatient;
      } else {
        const { data: newPRec } = await supabase
          .from('patients')
          .upsert({ profile_id: user.id }, { onConflict: 'profile_id' })
          .select()
          .maybeSingle();
        patientRecord = newPRec;
      }
    }
  }

  return {
    user,
    session: activeSession,
    profile: profile || { id: user.id, full_name: fullName, role, phone },
    patientRecord,
    error: null,
  };
}

/**
 * Sign in existing user with email and password.
 */
export async function signIn({ email, password }) {
  if (!isSupabaseConfigured) {
    return { user: null, session: null, profile: null, error: new Error('Supabase is not configured.') };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user) {
    return { user: null, session: null, profile: null, error };
  }

  // Fetch or ensure profile
  let profile = null;
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  if (existingProfile) {
    profile = existingProfile;
  } else {
    // Fallback: create from metadata
    const meta = data.user.user_metadata || {};
    const fallbackRole = meta.role || 'patient';
    const fallbackName = meta.full_name || data.user.email?.split('@')[0] || 'User';
    const { data: newProfile } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        full_name: fallbackName,
        role: fallbackRole,
        phone: meta.phone || '',
      })
      .select()
      .maybeSingle();

    profile = newProfile;
  }

  // If patient, ensure patient record
  let patientRecord = null;
  if (profile?.role === 'patient') {
    const { data: pRec } = await supabase
      .from('patients')
      .upsert({ profile_id: data.user.id }, { onConflict: 'profile_id' })
      .select()
      .maybeSingle();
    patientRecord = pRec;
  }

  return {
    user: data.user,
    session: data.session,
    profile,
    patientRecord,
    error: null,
  };
}

/**
 * Sign out the current user session.
 */
export async function signOut() {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current authenticated user session.
 */
export async function getSession() {
  if (!isSupabaseConfigured) return { session: null, error: null };
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session, error };
}

/**
 * Get current authenticated user.
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured) return { user: null, error: null };
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user, error };
}

/**
 * Get profile details by user profile ID.
 */
export async function getProfile(userId) {
  if (!isSupabaseConfigured || !userId) return { profile: null, error: null };
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  return { profile: data, error };
}

/**
 * Update profile details.
 */
export async function updateProfile(userId, updates) {
  if (!isSupabaseConfigured || !userId) return { data: null, error: null };
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

/**
 * Listen to auth state changes.
 */
export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
