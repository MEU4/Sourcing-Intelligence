import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const port = process.env.PORT || 8080;

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || '';
const LOCATION = 'us-central1';
const MODEL = 'gemini-1.5-flash';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve React frontend static files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// ── Health check — Cloud Run needs this to confirm startup ────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// ── Lazy load Vertex AI to avoid startup crash ────────────────────────────────
async function getModel() {
    const { VertexAI } = await import('@google-cloud/vertexai');
    const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    return vertexAI.getGenerativeModel({ model: MODEL });
}

// ── Analyse endpoint ──────────────────────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
    try {
        const { rawBids, roundLotBids } = req.body;

        if (!rawBids || !roundLotBids) {
            return res.status(400).json({ error: 'Missing bid data in request payload' });
        }

        const promptText = `
You are a strategic sourcing expert. Analyse the following bidding data from a metal cap eRFQ tender and provide:
1. A list of quick wins — immediate actions achievable in under 30 days with estimated EUR savings
2. A ranked list of savings opportunities with EUR values and % impact
3. Specific negotiation tactics per supplier based on their bid position
4. Market and supplier landscape analysis including concentration risk
5. Overall recommended sourcing strategy based on the full data
6. Risk assessment — rate each recommendation Low/Medium/High risk with justification
7. A table of negotiation opportunities with recommended actions and priority level
8. A summary of DDP opportunities and their advantage over DAP bids

Return ONLY valid JSON matching this exact schema with no markdown, no code blocks, no extra text:
{
  "quick_wins": ["string"],
  "savings_opportunities": ["string"],
  "negotiation_strategies": ["string"],
  "category_insight": "string",
  "strategic_approach": "string",
  "risk_assessment": ["string"],
  "negotiation_opportunities": [
    {
      "material_lot": "string",
      "current_supplier": "string",
      "best_alternative": "string",
      "price_gap_eur": "number",
      "price_gap_percentage": "number",
      "recommended_action": "string",
      "priority": "High | Medium | Low"
    }
  ],
  "strategic_insights": ["string"],
  "ddp_summary": "string",
  "top_savings_materials": [
    {
      "material_name": "string",
      "savings_eur": "number",
      "savings_percentage": "number",
      "tier": "green | amber | red"
    }
  ]
}

Bidding data (Raw Bids):
${JSON.stringify(req.body.rawBids.slice(0, 50))}

Round Lot Bids:
${JSON.stringify(req.body.roundLotBids.slice(0, 20))}
`;

        const model = await getModel();
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
            },
        });

        const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

        let parsedResponse;
        try {
            const clean = responseText.replace(/```json|```/g, '').trim();
            parsedResponse = JSON.parse(clean);
        } catch (parseError) {
            console.error('Failed to parse Vertex AI JSON:', responseText);
            return res.status(500).json({ error: 'Failed to parse AI response as JSON' });
        }

        res.json(parsedResponse);

    } catch (error: any) {
        console.error('Error in /api/analyze:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// ── Chat endpoint ─────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, dataContext } = req.body;

        if (!messages || messages.length === 0) {
            return res.status(400).json({ error: 'No messages provided' });
        }

        const systemContext = `You are a strategic sourcing expert assistant called "Strategy Expert". 
You are analysing a metal cap eRFQ tender with the following data context:
- ${dataContext?.rawBids?.length || 0} supplier bids across multiple lots
- Suppliers: ${[...new Set((dataContext?.rawBids || []).map((b: any) => b['Bidder Name']).filter(Boolean))].join(', ')}

Bid data sample: ${JSON.stringify((dataContext?.rawBids || []).slice(0, 20))}

Answer questions concisely and strategically. Focus on actionable procurement insights.`;

        const contents = [
            {
                role: 'user',
                parts: [{ text: systemContext + '\n\nUser question: ' + messages[messages.length - 1].content }]
            }
        ];

        const model = await getModel();
        const result = await model.generateContent({
            contents,
            generationConfig: { temperature: 0.4 },
        });

        const reply = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

        res.json({ reply });

    } catch (error: any) {
        console.error('Error in /api/chat:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// ── Serve React app for all other routes ─────────────────────────────────────
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Start server immediately — don't wait for Vertex AI
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Project ID: ${PROJECT_ID}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
