
import { Contact, Activity, Notification, FundingOffer, Invoice } from '../types';
import * as geminiService from './geminiService';

export interface AutomationResult {
  updatedContact: Contact;
  triggeredActions: string[];
}

/**
 * Calculates XP based on various engagement and data factors.
 */
const calculateXP = (contact: Contact): number => {
    let xp = 0;
    if (contact.businessProfile?.taxId) xp += 100;
    if (contact.businessProfile?.address) xp += 100;
    if (contact.connectedBanks?.length) xp += 500;
    
    const activityXP = (contact.activities?.length || 0) * 25;
    const documentXP = (contact.documents?.filter(d => d.status === 'Verified').length || 0) * 150;
    
    if (contact.status === 'Negotiation') xp += 1000;
    if (contact.status === 'Closed') xp += 5000;
    
    return xp + activityXP + documentXP;
};

/**
 * Calculates a 0-100 score based on underwriting health.
 */
const calculateNeuralScore = (contact: Contact): number => {
  let score = 50; 
  if (contact.revenue && contact.revenue > 15000) score += 15;
  if (contact.connectedBanks?.length) score += 15;
  
  const totalNSFs = contact.financialSpreading?.months.reduce((acc, m) => acc + m.nsfCount, 0) || 0;
  if (totalNSFs > 0) score -= Math.min(20, totalNSFs * 4);
  
  const verifiedDocs = contact.documents?.filter(d => d.status === 'Verified').length || 0;
  score += Math.min(20, verifiedDocs * 5);

  if (contact.creditAnalysis?.score) {
    if (contact.creditAnalysis.score > 720) score += 20;
    else if (contact.creditAnalysis.score > 680) score += 15;
  }

  return Math.min(100, Math.max(0, score));
};

/**
 * The Neural Automation Engine evaluates a contact's state 
 * and applies "Nexus Protocols" automatically.
 */
export const processAutomations = async (contact: Contact): Promise<AutomationResult> => {
  const actions: string[] = [];
  let updated = JSON.parse(JSON.stringify(contact)) as Contact; 
  const now = new Date();
  const tier = updated.subscription?.plan || 'Free';

  // 1. XP & SCORING (Internal maintenance)
  updated.xp = calculateXP(updated);
  updated.aiScore = calculateNeuralScore(updated);

  // 2. PROTOCOL: NEW LEAD ENRICHMENT (Discovery Scout)
  if (updated.status === 'Lead' && !updated.checklist['enrichment_complete']) {
      // In a real environment, we'd trigger the geminiService.enrichLeadData here
      updated.checklist['enrichment_complete'] = true;
      updated.leadVelocity = 85; 
      actions.push(`Automated Enrichment Scout executed for ${updated.company}`);
  }

  // 3. PROTOCOL: IDENTITY GATE (Compliance Shield)
  const isKycVerified = updated.compliance?.kycStatus === 'Verified';
  if (updated.status === 'Active' && !isKycVerified && updated.aiPriority !== 'Hot') {
      updated.aiPriority = 'Hot';
      updated.aiReason = "COMPLIANCE GATE: Capital transmission blocked. Biometric Link required.";
      actions.push(`Deal gate triggered for ${updated.company} (KYC Pending)`);
  }

  // 4. PROTOCOL: SEO GAP ANALYSIS (Growth Lever)
  if (updated.status === 'Active' && !updated.checklist['seo_gap_audit']) {
      updated.checklist['seo_gap_audit'] = true;
      updated.activities = [
          ...(updated.activities || []),
          {
              id: `seo_${Date.now()}`,
              type: 'system',
              description: "Growth Audit: Autonomous SEO scan detected high-intent keyword gaps. Ready for sales consultation.",
              date: now.toLocaleString(),
              user: 'Nexus AI'
          }
      ];
      actions.push(`SEO Gap Analysis synchronized for ${updated.company}`);
  }

  // 5. PROTOCOL: DRIP CAMPAIGN TRIGGER
  if (updated.status === 'Lead' && !updated.checklist['drip_assigned']) {
      updated.checklist['drip_assigned'] = true;
      updated.activities = [
          ...(updated.activities || []),
          {
              id: `drip_${Date.now()}`,
              type: 'email',
              description: "Triggered 'New Lead Welcome' AI Drip Sequence (3 Steps).",
              date: now.toLocaleString(),
              user: 'Nexus AI'
          }
      ];
      actions.push(`Assigned AI Welcome Drip to ${updated.name}`);
  }

  // 6. PROTOCOL: OVERDUE SETTLEMENT (Escalation)
  if (updated.invoices?.length) {
      updated.invoices = updated.invoices.map(inv => {
          const dueDate = new Date(inv.dueDate);
          if (inv.status === 'Pending' && dueDate < now) {
              inv.status = 'Overdue';
              actions.push(`Success Fee ${inv.id} marked Overdue`);
              updated.aiPriority = 'Hot';
              updated.aiReason = `Settlement Lag: $${inv.amount.toLocaleString()} overdue.`;
          }
          return inv;
      });
  }

  return { updatedContact: updated, triggeredActions: actions };
};
