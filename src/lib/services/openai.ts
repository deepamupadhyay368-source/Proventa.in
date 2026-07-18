import OpenAI from 'openai';


let openaiClient: OpenAI | null = null;
function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
    });
  }
  return openaiClient;
}

export async function extractDocumentOCR(textPayload: string) {
  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a document intelligence AI. Extract key information from the provided document text. Output ONLY valid JSON containing fields such as documentType, summary, extractedEntities, confidenceScore (1-100), and any relevant company identifiers (like gstin, pan, or name).',
        },
        {
          role: 'user',
          content: textPayload,
        }
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }
    return JSON.parse(content);
  } catch (error) {
    console.error('OCR Extraction Error:', error);
    throw error;
  }
}

export async function analyzeCreditScore(data: any): Promise<number> {
  let score = 500;
  if (data?.annualRevenue > 1000000) score += 100;
  if (data?.gstin) score += 50;
  if (data?.pan) score += 50;
  if (data?.industry === 'Tech') score += 50;
  return Math.min(score, 900);
}

export async function generateEventSummary(eventType: string, details: string): Promise<string> {
  return `Simulated analysis for ${eventType}: ${details.substring(0, 50)}...`;
}
