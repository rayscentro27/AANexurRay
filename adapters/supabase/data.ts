import { DataAdapter } from '../types';
import { Contact, AgencyBranding } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

const CONTACTS_TABLE = 'contacts';
const BRANDING_TABLE = 'branding';
const BRANDING_ID = 'default';

const defaultBranding: AgencyBranding = {
  name: 'Nexus Funding',
  primaryColor: '#10b981',
  heroHeadline: 'The Operating System for Business Funding.',
  heroSubheadline: 'Consolidate your CRM, Dialer, and Underwriting into one AI platform.',
  tierPrices: {
    Bronze: 97,
    Silver: 197,
    Gold: 497
  }
};

const unpackContact = (row: any): Contact => {
  if (row && row.payload) return row.payload as Contact;
  return row as Contact;
};

const packContact = (contact: Contact) => ({
  id: contact.id,
  payload: contact
});

const unpackBranding = (row: any): AgencyBranding => {
  if (row && row.payload) return row.payload as AgencyBranding;
  return row as AgencyBranding;
};

const packBranding = (branding: AgencyBranding) => ({
  id: BRANDING_ID,
  payload: branding
});

const requireSupabase = () => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }
};

export const supabaseDataAdapter: DataAdapter = {
  getContacts: async () => {
    requireSupabase();
    const { data, error } = await supabase.from(CONTACTS_TABLE).select('*');
    if (error) throw error;
    return (data || []).map(unpackContact);
  },

  updateContact: async (contact) => {
    requireSupabase();
    const payload = packContact(contact);

    let result = await supabase.from(CONTACTS_TABLE).upsert(payload).select('*').maybeSingle();
    if (result.error) {
      result = await supabase.from(CONTACTS_TABLE).upsert(contact).select('*').maybeSingle();
    }

    if (result.error) throw result.error;
    return unpackContact(result.data || contact);
  },

  addContact: async (contactData) => {
    requireSupabase();
    const newContact = {
      checklist: {},
      clientTasks: [],
      documents: [],
      activities: [],
      messageHistory: [],
      ...contactData,
      id: `c_${Date.now()}`,
      created_at: new Date().toISOString(),
      lastContact: 'Just now'
    } as Contact;

    let result = await supabase.from(CONTACTS_TABLE).insert(packContact(newContact)).select('*').maybeSingle();
    if (result.error) {
      result = await supabase.from(CONTACTS_TABLE).insert(newContact).select('*').maybeSingle();
    }

    if (result.error) throw result.error;
    return unpackContact(result.data || newContact);
  },

  getBranding: async () => {
    requireSupabase();
    const { data, error } = await supabase
      .from(BRANDING_TABLE)
      .select('*')
      .eq('id', BRANDING_ID)
      .maybeSingle();

    if (error) return defaultBranding;
    if (!data) return defaultBranding;
    return { ...defaultBranding, ...unpackBranding(data) };
  },

  updateBranding: async (branding) => {
    requireSupabase();
    const payload = packBranding(branding);

    let result = await supabase.from(BRANDING_TABLE).upsert(payload).select('*').maybeSingle();
    if (result.error) {
      result = await supabase.from(BRANDING_TABLE).upsert(branding).select('*').maybeSingle();
    }

    if (result.error) throw result.error;
    return unpackBranding(result.data || branding);
  }
};
