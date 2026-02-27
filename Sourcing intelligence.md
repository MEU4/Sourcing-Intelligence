# Sourcing Intelligence – Antigravity App Directive

## App Overview

**Name:** Sourcing Intelligence  
**Purpose:** Strategic sourcing tool for procurement teams. Users upload a supplier bidding analysis file (Excel), the app analyses it using the Gemini AI API, and returns visual charts, tables, and AI-generated insights to support negotiation and cost optimisation decisions.  
**Hosting target:** Azure Static Web Apps (or Azure App Service)  
**Authentication:** None required  
**Data storage:** None required — all processing is in-memory per session  

---

## File Structure Expected

The app is designed to accept Excel files (.xlsx) with the following sheets:

### Sheet 1: `Raw Bids`
Key columns used by the app:
| Column | Description |
|---|---|
| Bidder Name | Supplier name |
| Lot ID | Material/article identifier |
| Article Description | Description of the item |
| Indicative 2027 Demand Volume x 1000 Units | Forecasted demand |
| Incoterms | Delivery terms (e.g. DDP, DAP) |
| DDP Price (per 1000 Units) | All-in delivered price |
| Tinplate (per 1000 Units) | Material cost component |
| Conversion (per 1000 Units) | Conversion cost component |
| Historic Price | Prior year price for comparison |
| MOQ x 1000 Units | Minimum order quantity |
| Production Batch Size x 1000 Units | Production batch |
| Lead time for re-occuring items (Calendar Days) | Supplier lead time |
| Currency | Bid currency |
| Country | Supplier country |
| Production site location | Manufacturing location |
| Incumbent - Status | Whether supplier is current incumbent |

### Sheet 2: `Round Lot Bids`
| Column | Description |
|---|---|
| Bidder | Supplier name |
| Lot | Material lot number |
| Article Description | Item name |
| Rank | Competitive rank in the round |
| Bid Value | Price submitted |
| Adjusted Bid Value | Normalised price |
| Round | Bidding round label |

---

## App Behaviour

### On Load
- Display a clean, professional landing screen with the app name and tagline: *"AI-powered strategic sourcing insights"*
- Show an **Upload Bidding Analysis File** button (accepts `.xlsx` only)
- No other content is displayed until a file is uploaded

### On File Upload
1. Parse the Excel file client-side (use SheetJS / xlsx.js library)
2. Extract data from both sheets
3. Show a loading indicator: *"Analysing your sourcing data with AI..."*
4. Send structured data as a prompt to the **Gemini API** (see Gemini Integration section)
5. Render the analysis dashboard (see Dashboard Layout section)

### On New File Upload
- Reset all analysis results and charts
- Re-run full analysis from scratch with the new file

---

## Dashboard Layout

The dashboard is rendered after successful AI analysis. Sections appear in this order:

### 1. Summary KPI Cards (top row)
Display four metric cards in a horizontal row:
- **Total Current Spend** – sum of (DDP Price × Demand Volume) across all lots and all bidders at historic/current price
- **Optimised Spend** – sum of (lowest DDP Price per lot × Demand Volume) if best bidder per lot is selected
- **Total Savings Opportunity** – Current Spend minus Optimised Spend
- **Savings %** – (Savings / Current Spend) × 100

### 2. Price Comparison by Supplier (Bar Chart)
- X-axis: Article Description (or Lot ID)
- Y-axis: DDP Price per 1000 units
- Grouped bars per bidder
- Highlight the lowest price bar in green for each lot
- Include historic price as a reference line/bar

### 3. Spend Analysis Table
Sortable table with columns:
- Lot ID
- Article Description
- Demand Volume (k units)
- Best Price (EUR/k units) + Supplier Name
- Current / Historic Price
- Saving per unit
- Total Saving Opportunity (EUR)
- Incoterms
- MOQ

Highlight rows where savings > 10% in amber/yellow.

### 4. DDP Opportunities Panel
- Filter and highlight all bids where Incoterms = DDP (delivered duty paid, direct to site — no intermediate warehouse needed)
- Show a summary table: Supplier | Lot | DDP Price | Saving vs Non-DDP bids | Site Address
- Add an AI-generated note: *"DDP bids eliminate intermediate storage costs. Consider these as priority negotiations."*

### 5. Negotiation Opportunities Table
AI-generated table with columns:
- Material / Lot
- Current Supplier
- Best Alternative Supplier
- Price Gap (EUR & %)
- Recommended Action (e.g. "Switch supplier", "Use as leverage", "Request re-quote")
- Priority (High / Medium / Low)

### 6. Top Savings by Material (Horizontal Bar Chart)
- Top 10 materials sorted by total savings opportunity (EUR)
- Color-coded by savings tier: green (>20%), amber (10–20%), red (<10%)

### 7. MOQ & Lead Time Analysis
- Scatter plot: X = MOQ (k units), Y = DDP Price, bubble size = Demand Volume, color = Supplier
- Helps identify suppliers with low MOQ and competitive price — best fit for flexibility

### 8. Strategic AI Insights Panel
A card-style section with 4–6 AI-generated bullet insights from Gemini, such as:
- Identified cost reduction opportunities
- Supplier concentration risk
- DDP vs DAP recommendation
- Incumbent vs challenger pricing gaps
- Currency or country risk notes
- Quick win recommendations

---

## Gemini Integration

### API Setup
- Use the **Google Gemini API** (`gemini-1.5-flash` or `gemini-1.5-pro` model)
- The API key must be stored as an **environment variable**: `GEMINI_API_KEY`
- In Azure, store it in **Application Settings** (App Service) or as an **Azure Key Vault** secret referenced in environment config
- The key is never exposed client-side — all Gemini calls are made from a lightweight backend function (Azure Function or Express API endpoint)

### Prompt Structure Sent to Gemini
The app sends a structured JSON payload summarising the parsed Excel data:

```
You are a strategic sourcing expert. Analyse the following bidding data from a metal cap eRFQ tender and provide:
1. A table of negotiation opportunities with recommended actions and priority level (High/Medium/Low)
2. 5–6 strategic insights highlighting savings opportunities, supplier risks, and quick wins
3. A summary of DDP (Delivered Duty Paid) opportunities and their advantage over DAP bids
4. Top materials by savings potential

Return your response as structured JSON with keys:
- negotiation_opportunities (array)
- strategic_insights (array of strings)
- ddp_summary (string)
- top_savings_materials (array)

Bidding data:
[PARSED EXCEL DATA AS JSON]
```

### Gemini Chatbox – "Strategy Expert"
- Fixed at the **bottom of the screen** as a collapsible chat widget
- Label: **Strategy Expert** with a small Gemini/AI icon
- Users can ask free-form sourcing questions about the uploaded data
- The chat maintains conversation history within the session
- Each message appends the current dataset context so Gemini can answer data-specific questions
- Example prompts shown as chips on first open:
  - *"Which supplier has the best price for To63 caps?"*
  - *"What's the total saving if we switch to the lowest bidder on all lots?"*
  - *"Are there any DDP opportunities I should prioritise?"*
- The chatbox resets when a new file is uploaded

---

## Technical Stack

| Layer | Technology |
|---|---|
| Frontend | React (single page app) |
| Charting | Recharts or Chart.js |
| Excel Parsing | SheetJS (xlsx) — client-side |
| AI Analysis | Google Gemini API (via backend) |
| Backend | Azure Function (Node.js) or Express |
| Hosting | Azure Static Web Apps + Azure Functions |
| Styling | Tailwind CSS |
| State management | React useState / useReducer (in-memory, no persistence) |

---

## Error Handling

- If no file is uploaded, show a placeholder screen with instructions
- If the uploaded file is missing expected columns, show a friendly error: *"This file format isn't recognised. Please upload a valid bidding analysis file."*
- If Gemini API fails, show: *"AI analysis is temporarily unavailable. Charts and tables are still shown from your data."* and display calculated metrics without AI narrative
- If the file contains no bid rows, show: *"No bid data found in this file."*

---

## Azure Deployment Notes

- **No authentication required** — app is publicly accessible
- **No database** — all data is parsed and held in React state for the session only
- Environment variable `GEMINI_API_KEY` must be configured in Azure App Settings before deploying
- CORS must be configured to allow the frontend origin to call the Azure Function backend
- Recommended Azure resources:
  - Azure Static Web Apps (free tier) for the React frontend
  - Azure Functions (Consumption plan) for the Gemini API proxy
  - Azure Key Vault (optional) for secure API key management

---

## Out of Scope

- User login / authentication
- Saving or exporting reports (may be added in a future version)
- Multi-file comparison
- Database or long-term data storage