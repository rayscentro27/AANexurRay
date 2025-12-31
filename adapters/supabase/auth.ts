import { AuthAdapter, UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

const PROFILES_TABLE = 'profiles';

const mapProfile = (profile: any): UserProfile => ({
  id: profile.id,
  email: profile.email,
  name: profile.name || profile.full_name || '',
  role: profile.role || 'client',
  isMasterAdmin: !!profile.is_master_admin,
  settings: profile.settings
});

const ensureProfile = async (authUser: any, data?: { name?: string }) => {
  if (!authUser) return { user: null, error: 'Missing auth user.' };

  const { data: existing, error: existingError } = await supabase
    .from(PROFILES_TABLE)
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (existingError && existingError.code !== 'PGRST116') {
    return { user: null, error: existingError };
  }

  if (existing) {
    if (existing.is_master_admin && existing.role !== 'admin') {
      await supabase.from(PROFILES_TABLE).update({ role: 'admin' }).eq('id', existing.id);
      existing.role = 'admin';
    }
    return { user: mapProfile(existing), error: null };
  }

  const profile = {
    id: authUser.id,
    email: authUser.email,
    name: data?.name || authUser.user_metadata?.name || authUser.user_metadata?.full_name || '',
    role: 'client',
    is_master_admin: false,
    settings: {}
  };

  const { data: inserted, error: insertError } = await supabase
    .from(PROFILES_TABLE)
    .insert(profile)
    .select('*')
    .single();

  if (insertError) return { user: null, error: insertError };
  return { user: mapProfile(inserted), error: null };
};

export const supabaseAuthAdapter: AuthAdapter = {
  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      return { user: null, error: 'Supabase is not configured.' };
    }
    if (!password) {
      return { user: null, error: 'Password is required for Supabase sign-in.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message || error };

    const authUser = data.user;
    const { user, error: profileError } = await ensureProfile(authUser);
    if (profileError) return { user: null, error: profileError };

    return { user, error: null };
  },

  signUp: async (data) => {
    if (!isSupabaseConfigured) {
      return { user: null, error: 'Supabase is not configured.' };
    }
    if (!data.password) {
      return { user: null, error: 'Password is required for Supabase sign-up.' };
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name } }
    });

    if (error) return { user: null, error: error.message || error };

    const authUser = authData.user;
    if (!authUser) {
      return { user: null, error: 'Check your email to confirm registration.' };
    }

    if (!authData.session) {
      return { user: null, error: 'Check your email to confirm registration, then sign in.' };
    }

    const { user, error: profileError } = await ensureProfile(authUser, { name: data.name });
    if (profileError) return { user: null, error: profileError };

    return { user, error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  getCurrentUser: async () => {
    if (!isSupabaseConfigured) return null;

    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;

    const { user } = await ensureProfile(data.user);
    return user;
  },

  onAuthStateChange: (callback) => {
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }
      const { user } = await ensureProfile(session.user);
      callback(user || null);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }
};
