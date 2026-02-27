import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini Client
// We ensure the API key is passed correctly, or picked up from GEMINI_API_KEY env var automatically
const ai = new GoogleGenAI({});

app.post('/api/analyze', async (req, res) => {
    try {
        const { rawBids, roundLotBids } = req.body;

        if (!rawBids || !roundLotBids) {
            return res.status(400).json({ error: 'Missing bid data in request payload' });
        }

        const promptText = `
You are a strategic sourcing expert. Analyse the following bidding data from a metal cap eRFQ tender and provide:
1. A table of negotiation opportunities with recommended actions and priority level (High/Medium/Low)
2. 5-6 strategic insights highlighting savings opportunities, supplier risks, and quick wins
3. A summary of DDP (Delivered Duty Paid) opportunities and their advantage over DAP bids
4. Top materials by savings potential

Return your response as structured JSON EXACTLY matching this schema, without markdown formatting or code blocks:
{
  "negotiation_opportunities": [
    {
      "material_lot": "string",
      "current_supplier": "string",
      "best_alternative": "string",
      "price_gap_eur": "number or string",
      "price_gap_percentage": "number or string",
      "recommended_action": "string",
      "priority": "High | Medium | Low"
    }
  ],
  "strategic_insights": [
    "string"
  ],
  "ddp_summary": "string",
  "top_savings_materials": [
    {
      "material_name": "string",
      "savings_eur": "number or string",
      "savings_percentage": "number",
      "tier": "green | amber | red"
    }
  ]
}

Bidding data (Raw Bids):
${JSON.stringify(rawBids.slice(0, 50))} // Sending a sample if it's too large, but assuming manageable size for model context.
`;

        // Attempting to call Gemini 1.5 Flash
        // We request JSON format output
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: promptText,
            config: {
                responseMimeType: "application/json",
            }
        });

        const responseText = response.text || "{}";

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(responseText);
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON:", responseText);
            return res.status(500).json({ error: 'Failed to parse AI response as JSON' });
        }

        res.json(parsedResponse);
    } catch (error: any) {
        console.error('Error in /api/analyze:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
});
