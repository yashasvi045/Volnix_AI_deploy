require("dotenv").config();

const cors = require("cors");
const express = require("express");

const {
  addVolunteer,
  findBestVolunteer,
  getAllVolunteers
} = require("./data/volunteers");
const { getUrgencyFromFlask } = require("./services/aiService");
const {
  analyzeNeedWithGemini,
  buildFallbackAnalysis
} = require("./services/geminiService");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", volunteers: getAllVolunteers().length });
});

app.post("/add-volunteer", (req, res) => {
  const { name, skill, skills, location, phone, email } = req.body || {};

  if (!name || !(skill || (Array.isArray(skills) && skills.length)) || !location || !phone || !email) {
    return res.status(400).json({
      error: "name, skill/skills, location, phone, and email are required"
    });
  }

  const createdVolunteer = addVolunteer({ name, skill, skills, location, phone, email });

  return res.status(201).json({
    message: "Volunteer added successfully",
    volunteer: createdVolunteer,
    totalVolunteers: getAllVolunteers().length
  });
});

app.post("/assign", async (req, res) => {
  const body = req.body || {};
  const description = body.description || body.text;
  const requiredSkill = body.required_skill || body.requiredSkill;
  const location = body.location;

  if (!description || !requiredSkill || !location) {
    return res.status(400).json({
      error: "description/text, required_skill/requiredSkill, and location are required"
    });
  }

  const matchResult = findBestVolunteer(requiredSkill, location);
  const assignedVolunteer = matchResult.volunteer;

  let analysis;

  try {
    analysis = await analyzeNeedWithGemini(description);
  } catch (error) {
    console.error("Gemini analysis failed:", error.message);

    const fallbackUrgency = await getUrgencyFromFlask(description);
    const fallbackCategory =
      String(requiredSkill).trim() ||
      "General";

    analysis = buildFallbackAnalysis(
      description,
      fallbackUrgency,
      fallbackCategory,
      assignedVolunteer
    );
  }

  const volunteerResponse = assignedVolunteer
    ? {
        name: assignedVolunteer.name,
        skills: assignedVolunteer.skills || [assignedVolunteer.skill || "General"],
        location: assignedVolunteer.location,
        phone: assignedVolunteer.phone,
        email: assignedVolunteer.email
      }
    : null;

  return res.json({
    urgency: analysis.urgency,
    category: analysis.category,
    volunteer: volunteerResponse,
    summary: analysis.summary,
    matchMessage: matchResult.message,
    assignedVolunteer: assignedVolunteer
  });
});

app.listen(PORT, () => {
  console.log(`SmartServe AI backend running on http://localhost:${PORT}`);
});
