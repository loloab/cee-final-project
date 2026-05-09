import { GoogleGenAI } from '@google/genai';

let ai = null;

const getClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

/**
 * Parse a receipt image using Gemini 2.0 Flash.
 * Returns structured JSON with vendor, date, currency, items, and total.
 */
export async function parseReceipt(imageBuffer, mimeType) {
  const client = getClient();

  const base64Image = imageBuffer.toString('base64');

  const prompt = `You are a receipt/bill parser. Analyze this receipt image and extract the following information.
The receipt may be in Thai or English. Extract ALL information accurately.

Return a JSON object with this exact structure:
{
  "vendor": "Store/restaurant name",
  "date": "YYYY-MM-DD format (use today's date if not visible)",
  "currency": "THB, USD, EUR, etc. (detect from the receipt)",
  "items": [
    { "name": "Item description", "price": 0.00 }
  ],
  "total": 0.00,
  "language": "th or en"
}

Rules:
- For Thai receipts, translate item names to English but keep the vendor name in original language
- Prices should be numbers without currency symbols
- If you cannot determine the currency, default to "THB"
- If date is not visible, use "${new Date().toISOString().split('T')[0]}"
- Include ALL line items you can identify
- The total should match the receipt total, not the sum of items (which may exclude tax/service)`;

  const response = await client.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType || 'image/jpeg',
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  const text = response.text;
  
  try {
    const parsed = JSON.parse(text);
    return parsed;
  } catch {
    // If JSON parsing fails, try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse Gemini response as JSON');
  }
}

export default { parseReceipt };
