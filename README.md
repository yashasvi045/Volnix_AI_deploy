# SmartServe AI - Data-Driven Volunteer Coordination Platform

Simple MVP stack:

- Frontend: React
- Backend: Node.js + Express
- AI model: Python + scikit-learn
- AI API: Flask
- Storage: in-memory arrays only
- Gemini: used for short summary generation
- Gemini: primary analyzer for urgency, category, and summary

Backend note:

- Use Node.js 18 or newer so the backend can call `fetch` without extra packages.

## Folder structure

- `frontend/` - React UI
- `backend/` - Node.js API and volunteer store
- `ai-model/` - model training script and Flask prediction API

## Run order

1. Train the model:

   ```bash
   cd ai-model
   C:/Users/ISHITA/AppData/Local/Programs/Python/Python310/python.exe train_model.py
   ```

2. Start the Flask API:

   ```bash
   cd ai-model
   C:/Users/ISHITA/AppData/Local/Programs/Python/Python310/python.exe app.py
   ```

3. Start the Node backend:

   ```bash
   cd backend
   npm install
   npm start
   ```

   Add `backend/.env` before starting if you want Gemini summaries.

   Install the Gemini SDK if you are updating an existing backend:

   ```bash
   npm install @google/generative-ai
   ```

4. Start the React frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Environment variables

Create `backend/.env` with:

```bash
PORT=4000
FLASK_AI_URL=http://localhost:5000/predict
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

If `GEMINI_API_KEY` is missing, the backend falls back to the Flask ML model for urgency and uses a simple local category/summary fallback.

You will need the Gemini API key when the backend processes `POST /assign`. That is the point where Gemini becomes the primary analyzer for urgency, category, and summary. Without the key, the Flask model remains the backup.

## Example response

```json
{
   "urgency": "High",
   "category": "Medical",
   "assignedVolunteer": {
      "id": 1,
      "name": "Rahul Sharma",
      "skill": "Medical",
      "location": "Kolkata"
   },
   "summary": "The request is urgent and medical in nature. Rahul Sharma is assigned based on the best skill and location match."
}
```
## Sample API requests

Open [api-samples.http](api-samples.http) for ready-to-run requests for `add-volunteer` and `assign`.