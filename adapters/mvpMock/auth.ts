
import { AuthAdapter, UserProfile } from '../types';

const STORAGE_KEY = 'nexus_mvp_auth';
const USERS_KEY = 'nexus_mvp_users';
const MASTER_ADMIN_KEY = 'nexus_mvp_master_admin';

let subscribers: ((user: UserProfile | null) => void)[] = [];

const notifySubscribers = (user: UserProfile | null) => {
  subscribers.forEach(cb => cb(user));
};

const getMasterAdminEmail = (): string => {
  try {
    return (localStorage.getItem(MASTER_ADMIN_KEY) || '').toLowerCase();
  } catch (e) {
    return '';
  }
};

const normalizeUser = (user: UserProfile | null): UserProfile | null => {
  if (!user) return null;
  const masterEmail = getMasterAdminEmail();
  if (masterEmail && user.email.toLowerCase() === masterEmail) {
    return { ...user, role: 'admin', isMasterAdmin: true };
  }
  return user;
};

export const mvpAuthAdapter: AuthAdapter = {
  signIn: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: UserProfile) => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      const normalized = normalizeUser(user) || user;
      if (normalized !== user) {
        const updatedUsers = users.map((u: UserProfile) => (
          u.email.toLowerCase() === normalized.email.toLowerCase() ? normalized : u
        ));
        localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      notifySubscribers(normalized);
      return { user: normalized, error: null };
    }
    return { user: null, error: 'Account not found. Please register as a new entity.' };
  },

  signUp: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    const emailExists = users.some((u: UserProfile) => u.email.toLowerCase() === data.email.toLowerCase());
    if (emailExists) {
      return { user: null, error: 'An account with this email already exists.' };
    }

    // PROTOCOL: The very first user to register is ALWAYS granted Master Admin
    const masterEmail = getMasterAdminEmail();
    const isMasterAdmin = !masterEmail;
    const normalizedEmail = data.email.toLowerCase();

    if (isMasterAdmin) {
      localStorage.setItem(MASTER_ADMIN_KEY, normalizedEmail);
    }
    
    const newUser: UserProfile = {
      id: `u_${Date.now()}`,
      email: normalizedEmail,
      name: data.name,
      role: isMasterAdmin ? 'admin' : 'client',
      isMasterAdmin
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    notifySubscribers(newUser);
    
    return { user: newUser, error: null };
  },

  signOut: async () => {
    localStorage.removeItem(STORAGE_KEY);
    notifySubscribers(null);
  },

  getCurrentUser: async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? normalizeUser(JSON.parse(stored)) : null;
    } catch (e) { return null; }
  },

  onAuthStateChange: (callback) => {
    subscribers.push(callback);
    const initialUser = normalizeUser(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
    if (initialUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUser));
    }
    callback(initialUser);
    return () => { subscribers = subscribers.filter(cb => cb !== callback); };
  }
};
