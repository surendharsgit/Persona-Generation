# Technical Documentation - Synthetic User Generation Platform

## 1. Project Overview
The **Synthetic User Generation Platform** (Persona Forge Engine) is an advanced tool that utilizes AI (Google Gemini) to dynamically generate rich buyer personas, conduct automated surveys, simulate multi-turn interviews, and extract actionable research insights. This documentation outlines the system architecture, features, and the latest optimizations implemented to support large-scale generation.

## 2. Problem Statement
Traditional UX research is expensive, time-consuming, and difficult to scale. Creating personas often relies on assumptions rather than data, and gathering statistically significant feedback from target demographics can take weeks. There is a need for a rapid, AI-driven platform capable of instantly generating a cohort of synthetic users that closely mirror real-world demographics and psychographics, allowing product teams to test ideas in minutes rather than months.

## 3. Proposed Solution
The platform provides an end-to-end synthetic research pipeline:
1. **Generator**: Automatically generate up to 100 hyper-detailed personas based on product parameters.
2. **Survey Engine**: Dispatch automated surveys to the generated cohort and record their responses.
3. **Interview Engine**: Conduct deep-dive, multi-turn interviews with individual personas with persistent memory.
4. **Insights Dashboard**: Extract and visualize high-level metrics, theme clusters, sentiment, and product validation scores based strictly on the aggregated data.
5. **Report Export**: Export a professional, structured PDF report for stakeholders.

## 4. System Architecture
The application follows a client-server architecture:
- **Frontend**: React (Vite), TailwindCSS, Framer Motion. Uses Context API for global state management.
- **Backend**: Node.js, Express.js. Handles AI API orchestration and local JSON data storage.
- **AI Engine**: Google Gemini API (`@google/genai`). Used for generating personas, answering surveys, powering interviews, and extracting insights.
- **Data Persistence**: Local file system (in `backend/data/`) storing `memory.json`, `surveys.json`, and `insights.json`.

## 5. Technology Stack
- **Frontend**: React, React Router, TailwindCSS, Framer Motion, html2pdf.js, react-icons.
- **Backend**: Node.js, Express.js, CORS, dotenv.
- **AI/LLM**: Google Gemini (`gemini-3.6-flash`).

## 6. Persona Generation Architecture
The Persona Generator takes product details (Name, Industry, Target Age/Gender, Objective) and constructs a detailed prompt. To support stress-testing and large cohorts (e.g., 100 personas), the frontend chunks requests into batches of 10. This prevents AI rate limits and timeouts, providing a real-time progress update to the user.

## 7. Survey Mode
Survey Mode allows users to define a set of questions. The backend processes these questions by simulating each persona's perspective and generating in-character responses.

## 8. Interview Mode & 9. Multi-turn Memory
Interview Mode uses a conversational UI. The backend maintains a `memory.json` store containing the conversation history and a dynamically updated "memory dictionary." This ensures the persona recalls facts shared earlier in the conversation without breaking character.

## 10. Insight Extraction Agent
The Insight Agent processes all generated personas, survey results, and interview transcripts in a single large-context prompt. It is instructed to extract:
- Executive Summary
- Top Theme Clusters
- Sentiment Breakdown
- Representative Quotes
- Agreement/Disagreement Patterns

## 11. Product Validation Scoring
A key output of the Insight Agent is the **Adoption Score** (0-100). The AI calculates this score based on positive signals vs. hesitations observed in the synthetic data. It provides reasoning for the overall score and aggregates scores across specific persona segments.

## 12. Insights Dashboard
The Insights Dashboard visualizes the extracted data. It features custom CSS-based progress bars, dynamic statistics (total personas, responses), and segmented quote displays.

## 13. PDF Report Generation
Using `html2pdf.js`, the platform renders a hidden `ReportTemplate` component optimized for A4 printing. This allows users to download a structured, paginated PDF report of the experiment results without relying on heavy backend PDF libraries.

## 14. Database Architecture & 15. Supabase Integration
*(Note: Supabase integration was mentioned in the original project spec, but the current milestone utilizes local JSON storage for simplicity and rapid iteration. Future phases will migrate the `backend/data/` JSON files to Supabase PostgreSQL tables).*

## 16. AI/Gemini Integration
Gemini (`gemini-3.6-flash`) is heavily utilized with strict JSON schema instructions (`responseMimeType: "application/json"`) to ensure programmatic parsing.

## 17. Error Handling & 18. Hallucination Prevention
- **Retry Logic**: Chunked generation includes automatic retries (up to 3 times) for failed AI requests.
- **Hallucination Prevention**: The Insight Agent prompt strictly commands the AI to ground all insights in the provided context and return "Insufficient Evidence" rather than fabricating data.
- **Graceful Degradation**: If an insight cannot be parsed, the system safely falls back to defaults or alerts the user in the UI.

## 19. Testing Strategy
- **100 Persona Stress Test**: Validated by requesting 100 personas, which successfully chunks into 10 API requests, preventing timeouts.
- **End-to-End Workflow**: Verified generating personas -> running surveys -> generating insights -> exporting PDF.

## 20. Limitations
- **Context Limits**: Extracting insights from 100 personas with extensive interview histories might approach Gemini's context window limits.
- **Local Storage**: Currently relies on local JSON, which is not suitable for concurrent multi-user deployment.

## 21. Future Scope
- Migrate data layer to Supabase.
- Implement background queue processing (e.g., Redis/BullMQ) for massive surveys.
- Add advanced charting libraries for more complex visualizations.
