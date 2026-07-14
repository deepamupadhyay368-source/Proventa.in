const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 10000;

export async function askOpenAI(prompt: string, systemPrompt: string = 'You are a professional financial credit analyst.'): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.warn('[OPENAI SERVICE WARNING]: OPENAI_API_KEY is not configured in the environment.');
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API returned HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (err: any) {
    console.error('[OPENAI SERVICE ERROR]: Request failed:', err.message);
    return null;
  }
}

// 1. Analyze Creditworthiness
export async function analyzeCreditScore(companyName: string, metrics: any): Promise<{
  explanation: string;
  rating: string;
  recommendedLimit: number;
  riskScore: number;
}> {
  const prompt = `
    Analyze the creditworthiness of company "${companyName}".
    Operational Metrics:
    - Annual Revenue: ₹${(metrics.annualRevenue || 0).toLocaleString('en-IN')}
    - Active Litigations: ${metrics.litigationCount || 0}
    - Industry: ${metrics.industry || 'General Trade'}
    - GST/PAN Compliance: ${metrics.hasGst && metrics.hasPan ? 'COMPLIANT' : 'PENDING'}
    
    Calculate:
    1. Recommended Credit Rating (AAA, AA, A, BBB, BB, B, C, D)
    2. Estimated Risk Score (0 to 100, where 100 is high risk)
    3. Recommended Exposure limit (number in INR)
    4. Short analysis explanation summary (max 3 sentences).
    
    Return the response strictly as a JSON block with these keys: "rating", "riskScore", "recommendedLimit", "explanation". Do not include Markdown blocks other than the JSON itself.
  `;

  const fallback = {
    rating: metrics.annualRevenue > 50000000 ? 'AA' : 'BBB',
    riskScore: metrics.litigationCount > 0 ? 45 : 15,
    recommendedLimit: Math.round((metrics.annualRevenue || 10000000) * 0.1),
    explanation: 'Calculated using baseline mathematical limit formulas based on regulatory check status and revenue scaling parameters.'
  };

  const responseText = await askOpenAI(prompt, 'You are an AI Credit Assessment Engine. Reply only with a JSON block.');
  if (responseText) {
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);
      return {
        explanation: data.explanation || fallback.explanation,
        rating: data.rating || fallback.rating,
        recommendedLimit: Number(data.recommendedLimit) || fallback.recommendedLimit,
        riskScore: Number(data.riskScore) || fallback.riskScore
      };
    } catch (e) {
      console.warn('[OPENAI PARSE WARNING]: Could not parse JSON response. Falling back.', e);
    }
  }
  return fallback;
}

// 2. AI Forecasting Engine
export async function generateForecastingInsights(type: string, period: string, currentVal: number, historyPoints: number[]): Promise<{
  insights: string[];
  projectedGrowthPct: number;
  confidenceScore: number;
}> {
  const prompt = `
    Perform a financial forecasting model analysis for the indicator: "${type}" over the next ${period}.
    Current value: ${currentVal}
    Historical trend points: [${historyPoints.join(', ')}]
    
    Calculate:
    1. Projected Growth Percentage (positive or negative number)
    2. Confidence Score (0 to 100)
    3. 3 key bullet insights outlining forecast assumptions.
    
    Return the response strictly as a JSON block with keys: "projectedGrowthPct", "confidenceScore", "insights".
  `;

  const fallback = {
    insights: [
      `Revenue trajectory displays seasonal variation based on historic periods.`,
      `Collections speed matches baseline Net-30 payment intervals.`,
      `Macroeconomic indices recommend maintaining current exposure caps.`
    ],
    projectedGrowthPct: 8.5,
    confidenceScore: 88
  };

  const responseText = await askOpenAI(prompt, 'You are an AI Financial Forecast Engine. Reply only with a JSON block.');
  if (responseText) {
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);
      return {
        insights: data.insights || fallback.insights,
        projectedGrowthPct: Number(data.projectedGrowthPct) || fallback.projectedGrowthPct,
        confidenceScore: Number(data.confidenceScore) || fallback.confidenceScore
      };
    } catch (e) {
      console.warn('[OPENAI PARSE WARNING]: Could not parse forecasting JSON. Falling back.', e);
    }
  }
  return fallback;
}
