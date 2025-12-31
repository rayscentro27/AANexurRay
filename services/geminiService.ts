
import { GoogleGenAI, Type } from "@google/genai";
import { Contact, SalesBattleCard, EnrichedData, FinancialSpreading, CreditMemo, Grant, Course, MarketReport, Stipulation, FundedDeal, RescuePlan, Investor, RiskAlert, EmailStep, PipelineRule, Review, NegativeItem, Lender, AgencyBranding, FundingOffer, InvestmentIdea } from "../types";

// Helper to get fresh AI instance
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to extract grounding URLs from Gemini response
 */
const extractSources = (response: any) => {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return chunks
    .filter((c: any) => c.web || c.maps)
    .map((c: any) => ({
      title: c.web?.title || c.maps?.title || "Source",
      uri: c.web?.uri || c.maps?.uri
    }));
};

/**
 * Simulates a growth scenario based on reinvesting funding.
 */
export const simulateGrowthScenario = async (amount: number, roi: number, contact: Contact): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a financial quant. Simulate a 12-month business growth scenario.
    Input: Capital Deployment of $${amount} at ${roi}% projected yield.
    Client context: ${contact.company}, current revenue $${contact.revenue}.
    
    Output JSON: {
      projectedEquity: number (net gain),
      tier2Magnitude: number (new projected loan limit),
      narrative: string (1-sentence strategic outcome)
    }`,
    config: { responseMimeType: "application/json" }
  });
  try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

/**
 * Processes a YouTube URL and generates a specific investment strategy based on context.
 */
export const generateInvestmentIdea = async (url: string, contact: Contact): Promise<InvestmentIdea | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Review this video: ${url}. 
    Based on its content and the fact that this client just received funding for their business "${contact.company}", generate a Sound Investment Idea.
    Focus on how they can RE-INVEST their funding to generate more revenue. 
    Examples: Real Estate acquisition, High-Yield Marketing, Inventory Flipping.
    
    Return JSON: {
      id: string,
      title: string,
      category: 'Real Estate' | 'Marketing' | 'Inventory' | 'Acquisition',
      description: string,
      roiPotential: string,
      riskLevel: 'Low' | 'Medium' | 'High',
      steps: string[]
    }`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });

  try {
    const data = JSON.parse(response.text || "{}");
    return { ...data, sourceUrl: url };
  } catch (e) {
    return null;
  }
};

/**
 * Generates Tier 2 Funding Strategy specifically focusing on 0% card liquidation 
 * and the 6-12 month reserve protocol.
 */
export const generateTier2Strategy = async (contact: Contact): Promise<string> => {
  const ai = getAI();
  const activeDeal = contact.fundedDeals?.find(d => d.status === 'Active');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a high-level capital strategist. A client has just been approved for Tier 1 funding (likely 0% interest business credit cards).
    
    Task: Explain the "Nexus Growth Protocol" which consists of:
    1. LIQUIDATION: How to turn 0% cards into cash for inventory, marketing, or equipment.
    2. THE RESERVE RULE: Immediately setting aside 6-12 months of minimum payments into a separate account.
    3. THE TIER 2 UNLOCK: Why 6 months of "Bank Statement Seasoning" (showing high balances from the reserve) makes them "Bankable" for $100k-$250k term loans later.
    
    Context: ${JSON.stringify({
      company: contact.company,
      amount: activeDeal?.originalAmount,
      industry: contact.businessProfile?.industry
    })}
    
    Be strategic, professional, and emphasize that Tier 2 is a reward for Tier 1 discipline. Use Markdown.`,
  });
  
  return response.text || "Season your bank statements for 6 months using the Reserve Protocol to unlock Tier 2 institutional capital.";
};

/**
 * Generates a list of potential funding offers. Defaults Tier 1 to 0% Card offers 90% of the time.
 */
export const suggestFundingOffers = async (contact: Contact): Promise<FundingOffer[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Suggest 3 business funding products.
    90% of Tier 1 options should be "0% Interest Promotional Business Credit Cards". 
    Context: ${JSON.stringify({
      company: contact.company,
      revenue: contact.revenue,
      score: contact.creditAnalysis?.score,
      industry: contact.businessProfile?.industry
    })}
    Return JSON array of FundingOffer: [{id: string, lenderName: string, amount: number, term: string, rate: string, payment: string, paymentAmount: number, description: string}]`,
    config: { 
        responseMimeType: "application/json"
    }
  });
  try {
    const offers = JSON.parse(response.text || "[]");
    return offers.map((o: any) => ({ ...o, status: 'Sent', dateSent: new Date().toLocaleDateString(), tier: 1 }));
  } catch {
    return [];
  }
};

/**
 * Verifies a business presence on Google using Search Grounding.
 */
export const verifyBusinessPresence = async (businessName: string, location: string): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Find and verify the Google Business Profile for "${businessName}" in "${location}". 
    Extract the average rating, total review count, and primary category if found.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            exists: { type: Type.BOOLEAN },
            rating: { type: Type.NUMBER },
            reviewCount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            officialName: { type: Type.STRING }
        }
      }
    }
  });
  try { return JSON.parse(response.text || "{}"); } catch { return { exists: false }; }
};

/**
 * Generates formatted citations for business directories.
 */
export const generateDirectoryCitations = async (branding: AgencyBranding): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on these business vitals, generate a JSON object containing formatted citations for Yelp, YellowPages, and industry directories.
    Ensure perfect NAP (Name, Address, Phone) consistency.
    Vitals: ${JSON.stringify({ name: branding.name, phone: branding.contactPhone, address: branding.physicalAddress, website: branding.websiteUrl, email: branding.contactEmail })}
    Return JSON: {
      yelp: string,
      yellowPages: string,
      industry: string,
      optimizedShortDesc: string
    }`,
    config: { responseMimeType: "application/json" }
  });
  try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

/**
 * Generates optimized bios for various social media platforms.
 */
export const generateSocialBios = async (branding: AgencyBranding): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate optimized social media bios (max character counts strictly observed) for LinkedIn (tagline), Instagram (bio), and TikTok (short bio).
    Vitals: ${JSON.stringify({ name: branding.name, niche: branding.heroHeadline, mission: branding.heroSubheadline })}
    Return JSON: {
      linkedin: string,
      instagram: string,
      tiktok: string
    }`,
    config: { responseMimeType: "application/json" }
  });
  try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

/**
 * Generates a full SEO keyword strategy and content roadmap.
 */
export const generateSEOStrategy = async (industry: string, targetMarket: string): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a world-class SEO specialist. Generate a Search Domination Strategy for a business in the "${industry}" industry targeting "${targetMarket}". 
    Return JSON: {
      primaryKeywords: [{keyword: string, volume: string, difficulty: string}],
      longTailKeywords: [string],
      contentBlueprints: [{title: string, outline: [string], targetIntent: string}],
      backlinkStrategy: [string]
    }`,
    config: { 
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json" 
    }
  });
  try { 
    const data = JSON.parse(response.text || "{}");
    return { ...data, sources: extractSources(response) };
  } catch { return null; }
};

/**
 * Optimizes Google Business Profile content for local ranking.
 */
export const optimizeGBP = async (businessDesc: string, location: string): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Optimize this Google Business Profile for rank #1 in ${location}. Original Description: "${businessDesc}". 
    Return JSON: {
      optimizedDescription: string,
      recommendedCategories: [string],
      localKeywords: [string],
      postIdeas: [string]
    }`,
    config: { responseMimeType: "application/json" }
  });
  try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

/**
 * Generates high-converting viral hooks for social media.
 */
export const generateViralHooks = async (topic: string): Promise<string[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 high-converting 'stop the scroll' hooks for a social media video about: "${topic}". 
    Focus on business owners, funding, and speed. Return as a plain JSON array of strings.`,
    config: { responseMimeType: "application/json" }
  });
  try { return JSON.parse(response.text || "[]"); } catch { return []; }
};

/**
 * Analyzes an existing YouTube video to generate a cinematic "faceless" recreation prompt.
 */
export const transformVideoToDirective = async (url: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Review this video: ${url}. Abstract its core message into a "faceless" cinematic visual directive for a social media marketing video. 
    Focus on professional business growth metaphors, clean office environments, and vibrant lighting. Return ONLY the cinematic prompt.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return response.text || "A sleek professional environment with cinematic lighting.";
};

/**
 * Analyzes a YouTube video and extracts 5 actionable business steps.
 */
export const analyzeYouTubeVideo = async (url: string): Promise<{ title: string; steps: string[] }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Review the content of this YouTube video: ${url}. Provide the video title and exactly 5 actionable business/funding steps a broker could take based on its strategy.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          steps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Exactly 5 actionable steps."
          }
        }
      }
    }
  });
  try {
    return JSON.parse(response.text || "{}");
  } catch {
    return { title: "Video Intelligence Scan", steps: ["Audit client profile", "Execute outreach", "Document results", "Follow up", "Finalize close"] };
  }
};

/**
 * Generates a cinematic marketing video using Veo 3.1.
 */
export const generateSocialVideo = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string | null> => {
  const ai = getAI();
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Faceless professional marketing video: ${prompt}. Cinematic 4k, sleek aesthetic.`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return null;
    return `${downloadLink}&key=${process.env.API_KEY}`;
  } catch (e: any) {
    if (e.message?.includes("Requested entity was not found")) {
        throw new Error("API Project Context Error: Please ensure your Google AI Studio project is correctly configured for Video generation.");
    }
    throw e;
  }
};

/**
 * Interface with the CRM pipeline using natural language.
 */
export const chatWithCRM = async (query: string, contacts: Contact[]) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a CRM AI Co-Pilot for a funding agency. Data context: ${JSON.stringify(contacts.map(c => ({ name: c.name, company: c.company, status: c.status })))}. User query: ${query}`,
        config: {
          systemInstruction: "You assist brokers in managing their pipeline. Be concise and actionable."
        }
    });
    return { text: response.text || "Handshake established.", actions: response.functionCalls || [] };
};

export const generateSalesScript = async (contact: Contact, scenario: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a sales script for ${contact.company}. Scenario: ${scenario}. Data: ${JSON.stringify(contact)}`
    });
    return response.text || "Start with rapport building.";
};

export const enrichLeadData = async (company: string, website?: string): Promise<EnrichedData | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Search and enrich business data for "${company}". Website: ${website || 'unknown'}.`,
    config: { 
      tools: [{ googleSearch: {} }], 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          description: { type: Type.STRING },
          ceo: { type: Type.STRING },
          revenue: { type: Type.STRING },
          phone: { type: Type.STRING },
          address: { type: Type.STRING },
          industry: { type: Type.STRING },
          icebreakers: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

export const generateSalesBattleCard = async (contact: Contact): Promise<SalesBattleCard | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Synthesize a Sales Battle Card for ${contact.company}. Data: ${JSON.stringify(contact)}.`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          predictedObjections: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                objection: { type: Type.STRING }, 
                rebuttal: { type: Type.STRING } 
              } 
            } 
          },
          closingStrategy: { type: Type.STRING }
        }
      }
    }
  });
  try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

export const generateLegalDocumentContent = async (type: string, context: any, prompt: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Draft professional legal content for a "${type}" agreement. Context: ${JSON.stringify(context)}. User Prompt: ${prompt}`
    });
    return response.text || "";
};

export const generateContractAmendment = async (original: string, instruction: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Update this contract: "${instruction}". Original: ${original}`
    });
    return response.text || original;
};

export const generateLegalDisclosure = async (type: string, jurisdiction: string, context: any): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Draft a formal legal disclosure for a "${type}" in "${jurisdiction}". Context: ${JSON.stringify(context)}`
    });
    return response.text || "";
};

export const analyzeDealStructure = async (financials: FinancialSpreading, amount: number): Promise<any> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Underwriter: Analyze $${amount} deal. Financials: ${JSON.stringify(financials)}. Provide 3 optimal options.`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              maxApproval: { type: Type.NUMBER },
              riskAssessment: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    term: { type: Type.STRING },
                    rate: { type: Type.NUMBER },
                    payment: { type: Type.NUMBER },
                    freq: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
    });
    try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

export const searchPlaces = async (query: string): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Find leads for: "${query}".`,
    config: { tools: [{googleMaps: {}}] },
  });
  const text = response.text || "";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const places = groundingChunks.filter((chunk: any) => chunk.maps).map((chunk: any) => ({
      title: chunk.maps.title || "Unknown Place",
      url: chunk.maps.uri || "#",
      address: chunk.maps.address || "",
      rating: chunk.maps.rating || 0
  }));
  return { text, places };
};

export const generateReviewReply = async (review: Review): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a professional and appreciative response to this ${review.rating}-star business review: "${review.comment}".`
  });
  return response.text || "";
};

export const generateMockGoogleReviews = async (businessName: string): Promise<Review[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Simulate 3 realistic Google reviews for a business named "${businessName}". Vary the ratings from 3 to 5 stars.`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            contactName: { type: Type.STRING },
            company: { type: Type.STRING },
            rating: { type: Type.NUMBER },
            comment: { type: Type.STRING },
            date: { type: Type.STRING },
            source: { type: Type.STRING },
            status: { type: Type.STRING }
          }
        }
      }
    }
  });
  try { return JSON.parse(response.text || "[]"); } catch { return []; }
};

export const analyzeReviewSentiment = async (reviews: Review[]): Promise<any> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze the collective sentiment of these reviews: ${JSON.stringify(reviews)}. Identify key themes, recurring praises, and vulnerabilities. 
        Return JSON: {
            summary: string,
            positiveKeywords: string[],
            negativeKeywords: string[],
            overallTone: string
        }`,
        config: { responseMimeType: "application/json" }
    });
    try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

export const generateCourseCurriculum = async (topic: string, audience: string): Promise<Course | null> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Generate 4-module course on "${topic}" for "${audience}".`,
        config: { responseMimeType: "application/json" }
    });
    try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

export const generateSocialCaption = async (platform: string, videoPrompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Social caption for ${platform} about: "${videoPrompt}".`
  });
  return response.text || "Ready for funding!";
};

export const generateEmailDripSequence = async (goal: string, audience: string, agencyName: string): Promise<EmailStep[]> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are a high-converting email copywriter for a business funding agency called "${agencyName}".
        Generate a 3-step automated email drip campaign for the following goal: "${goal}".
        The target audience is: "${audience}".

        For each step, include:
        - subject: A catchy subject line.
        - body: The email content (use professional yet aggressive sales tone).
        - delayDays: Integer representing days to wait after the previous step (Step 1 should be 0).

        Return JSON array of objects: [{subject, body, delayDays}]`,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING },
                        delayDays: { type: Type.INTEGER }
                    }
                }
            }
        }
    });
    try { return JSON.parse(response.text || "[]"); } catch { return []; }
};

export const draftGrantAnswer = async (question: string, context: any, grantName: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Draft a high-probability grant answer for the grant "${grantName}". 
        Question: "${question}"
        Business Context: ${JSON.stringify(context)}
        
        Guidelines: Use an inspiring but professional tone. Focus on community impact, job creation, and innovative scaling. Reference specific industry details from the context provided.`
    });
    return response.text || "";
};

export const generateCreditMemo = async (contact: Contact): Promise<CreditMemo | null> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Credit memo for ${contact.company}. Data: ${JSON.stringify(contact)}`,
        config: { responseMimeType: "application/json" }
    });
    try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

export const generateSmartReplies = async (messages: any[]): Promise<string[]> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on this conversation history, generate 3 short, high-intent suggested replies for the broker. 
        Return as a plain JSON array of strings. 
        History: ${JSON.stringify(messages)}`,
        config: { responseMimeType: "application/json" }
    });
    try { return JSON.parse(response.text || "[]"); } catch { return []; }
};

export const analyzeRiskEvent = async (alert: RiskAlert): Promise<any> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are a forensic underwriter. Analyze this risk alert: ${JSON.stringify(alert)}. 
        What is the likely impact and recommended action?
        Return JSON: {recommendation: string, severity: 'Low'|'Medium'|'High'|'Critical'}`,
        config: { responseMimeType: "application/json" }
    });
    try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

export const findGrants = async (topic: string): Promise<Grant[]> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Search for active business grants related to: "${topic}". Provide a list of grants including provider name, estimated amount, deadline (if found), and a brief description.`,
        config: { 
          tools: [{ googleSearch: {} }], 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                provider: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                deadline: { type: Type.STRING },
                description: { type: Type.STRING },
                matchScore: { type: Type.NUMBER },
                requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                url: { type: Type.STRING }
              }
            }
          }
        }
    });
    try { 
      const results = JSON.parse(response.text || "[]"); 
      return results.map((r: any) => ({ ...r, status: 'Identified' }));
    } catch { return []; }
};

export const generateCollectionsMessage = async (name: string, daysLate: number, amount: number): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Draft a professional yet firm collections notice for ${name}. They are ${daysLate} days late on a payment of $${amount}. Mention that immediate settlement is required to prevent legal escalation.`
    });
    return response.text || "";
};

export const generateApplicationCoverLetter = async (contact: Contact, lenderName: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Write a compelling underwriting cover letter to "${lenderName}" for a $${contact.value} funding request for "${contact.company}". Highlight their time in business and revenue consistency. Focus on why they are a low-risk, high-growth candidate.`
  });
  return response.text || "";
};

export const generateRescuePlan = async (contact: Contact): Promise<RescuePlan | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `A business funding deal for "${contact.company}" was just declined. Based on their data: ${JSON.stringify(contact)}, generate a Rescue Plan.
    Return JSON: {
      approvalProbability: number,
      estimatedRecoveryTime: string,
      diagnosis: string,
      dealKillers: [{issue: string, impact: string}],
      prescription: [{step: string, timeframe: string}]
    }`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          approvalProbability: { type: Type.NUMBER },
          estimatedRecoveryTime: { type: Type.STRING },
          diagnosis: { type: Type.STRING },
          dealKillers: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { issue: { type: Type.STRING }, impact: { type: Type.STRING } } } },
          prescription: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.STRING }, timeframe: { type: Type.STRING } } } }
        }
      }
    }
  });
  try { return JSON.parse(response.text || "{}"); } catch { return null; }
}

export const generateInvestorReport = async (investor: Investor, deals: any[]): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a professional monthly performance update email to our capital partner "${investor.name}". They have $${investor.totalDeployed} deployed across ${investor.activeDeals} deals. Focus on portfolio yield and low default rates.`
  });
  return response.text || "";
};

export const generateRenewalPitch = async (deal: FundedDeal, contact: Contact): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Draft a high-conversion renewal pitch for "${contact.company}". They have paid down ${Math.round(((deal.totalPayback - deal.currentBalance) / deal.totalPayback) * 100)}% of their current $${deal.originalAmount} deal. Offer them a pre-approved limit increase to $${Math.round(deal.originalAmount * 1.5).toLocaleString()} with a rate reduction.`
    });
    return response.text || "";
};

export const generateWorkflowFromPrompt = async (prompt: string): Promise<Partial<PipelineRule>> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Convert this automation request into a JSON pipeline rule: "${prompt}".
        Return JSON matching PipelineRule interface: {name, trigger: {type, value}, conditions: [{field, operator, value}], actions: [{type, params: {}}]}`,
        config: { responseMimeType: "application/json" }
    });
    try { return JSON.parse(response.text || "{}"); } catch { return {}; }
};

export const predictCommonObjections = async (contact: Contact): Promise<string[]> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on this borrower profile: ${JSON.stringify(contact)}, predict the top 3 likely objections they will have to a funding offer. Return as a plain JSON array of strings.`,
        config: { responseMimeType: "application/json" }
    });
    try { return JSON.parse(response.text || "[]"); } catch { return ["Cost of capital", "Daily payment strain"]; }
};

export const generateObjectionResponse = async (contact: Contact, objection: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a short, persuasive rebuttal for this borrower objection: "${objection}". Target borrower: ${contact.company}.`
    });
    return response.text || "I understand your concern.";
};

export const generateDisputeLetter = async (contact: Contact, bureau: string, items: NegativeItem[], method: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Draft a formal legal dispute letter to ${bureau}. 
        Method: ${method}. 
        Borrower: ${contact.name}, ${contact.businessProfile?.address || 'Unknown Address'}.
        Negative Items to Challenge: ${JSON.stringify(items.filter(i => i.isSelected))}.
        Use professional legal formatting.`
    });
    return response.text || "";
};

export const generateMeetingPrep = async (contact: Contact): Promise<any> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Generate a "Meeting Prep Dossier" for a call with "${contact.company}".
        Return JSON: {
            summary: string,
            predictedObjections: string[],
            icebreakers: string[],
            goal: string
        }`,
        config: { responseMimeType: "application/json" }
    });
    try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

export const processMeetingDebrief = async (transcript: string): Promise<any> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this meeting transcript and extract follow-up actions.
        Transcript: "${transcript}"
        Return JSON: {
            note: string (concise summary for CRM),
            suggestedStatus: 'Lead'|'Active'|'Negotiation'|'Closed',
            emailDraft: string (follow up email to client)
        }`,
        config: { responseMimeType: "application/json" }
    });
    try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

export const generateAnalyticsInsights = async (contacts: Contact[]): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this CRM pipeline data and provide 3 strategic insights for the agency owner to increase revenue. 
        Data: ${JSON.stringify(contacts.map(c => ({ company: c.company, status: c.status, value: c.value })))}`
    });
    return response.text || "";
};

export const generateBusinessPlanSection = async (section: string, data: any): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Draft the "${section}" for a professional business plan. Use this context: ${JSON.stringify(data)}. Format as professional markdown.`
    });
    return response.text || "";
};

export const generateLandingPageCopy = async (industry: string, offer: string): Promise<any> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate high-converting landing page copy for the ${industry} industry. 
        Offer: "${offer}".
        Return JSON: {
            headline: string,
            subhead: string,
            benefits: string[],
            buttonText: string
        }`,
        config: { responseMimeType: "application/json" }
    });
    try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

export const analyzeCompetitors = async (company: string, industry: string, location: string): Promise<MarketReport | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Find and analyze top competitors for "${company}" in the ${industry} industry in ${location}.
    Provide a SWOT analysis and identified digital gaps.
    Return JSON matching MarketReport interface.`,
    config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
  });
  try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

export const parseLenderGuidelines = async (base64: string): Promise<Partial<Lender> | null> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                { inlineData: { data: base64, mimeType: 'application/pdf' } },
                { text: "Extract the underwriting guidelines from this rate sheet. I need: minScore (number), minRevenue (monthly, number), minTimeInBusinessMonths (number), maxAmount (number), and a list of restrictedIndustries. Return as JSON." }
            ]
        },
        config: { responseMimeType: "application/json" }
    });
    try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

export const extractStipsFromText = async (text: string): Promise<Stipulation[]> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Extract the specific documents required (stipulations) from this lender approval text: "${text}". 
        Return as a JSON array of objects: [{name: string, description: string}].`,
        config: { responseMimeType: "application/json" }
    });
    try { 
        const items = JSON.parse(response.text || "[]");
        return items.map((i: any) => ({ id: `stip_${Math.random()}`, name: i.name, description: i.description, status: 'Pending' }));
    } catch { return []; }
};

export const verifyDocumentContent = async (base64: string, mimeType: string, docName: string, context: any): Promise<any> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                { inlineData: { data: base64, mimeType } },
                { text: `You are a compliance officer. Is this document actually a "${docName}"? Context: ${JSON.stringify(context)}. 
                Return JSON: {isMatch: boolean, confidence: number (0-100), reason: string}` }
            ]
        },
        config: { responseMimeType: "application/json" }
    });
    try { return JSON.parse(response.text || "{}"); } catch { return { isMatch: false, confidence: 0, reason: "Verification failure." }; }
};

export const refineNoteContent = async (text: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Refine and professionalize this raw sales note while keeping all technical details intact: "${text}"`
    });
    return response.text || text;
};

export const analyzeCallStrategy = async (transcript: { role: string; text: string }[], contact: Contact): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Review this live call transcript with "${contact.company}". 
        Transcript: ${transcript.map(t => `${t.role}: ${t.text}`).join('\n')}
        Provide one short, critical "Tactical Pivot" to help the agent close the deal now.`,
        config: {
          systemInstruction: "You are a senior sales manager watching a live call. Be blunt and effective."
        }
    });
    return response.text || "Listen actively and follow the lead's cues.";
};

export const analyzeContract = async (base64: string) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: 'application/pdf' } },
            { text: "Perform a forensic audit of this funding contract. Calculate the true APR, identify any 'predatory' clauses (confession of judgment, etc.), and provide a safety score from 0-100. Return as JSON." }
          ]
        },
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              safetyScore: { type: Type.NUMBER },
              trueApr: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              risks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { clause: { type: Type.STRING }, description: { type: Type.STRING }, type: { type: Type.STRING } } } }
            }
          }
        }
    });
    try { return JSON.parse(response.text || "{}"); } catch { return null; }
};

export const analyzeDocumentForensics = async (base64: string): Promise<{ trustScore: number, riskLevel: string }> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                { inlineData: { data: base64, mimeType: 'application/pdf' } },
                { text: "Analyze this document for signs of digital tampering or forgery (font inconsistencies, balance misalignment, metadata mismatch). Return a trustScore (0-100) and a riskLevel (Low, Medium, High)." }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    trustScore: { type: Type.NUMBER },
                    riskLevel: { type: Type.STRING }
                }
            }
        }
    });
  try { return JSON.parse(response.text || "{}"); } catch { return { trustScore: 50, riskLevel: 'Unknown' }; }
};

export const extractFinancialsFromDocument = async (base64: string, mimeType: string): Promise<FinancialSpreading | null> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType } },
            { text: "Extract the monthly revenue, withdrawals, and ending balance for each month found in this bank statement. Also count NSFs (Non-Sufficient Funds) and negative daily balance events. Return as JSON matching the FinancialSpreading interface." }
          ]
        },
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              lastUpdated: { type: Type.STRING },
              months: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    month: { type: Type.STRING },
                    revenue: { type: Type.NUMBER },
                    expenses: { type: Type.NUMBER },
                    endingBalance: { type: Type.NUMBER },
                    nsfCount: { type: Type.NUMBER },
                    negativeDays: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        }
    });
    try { return JSON.parse(response.text || "{}"); } catch { return null; }
};
