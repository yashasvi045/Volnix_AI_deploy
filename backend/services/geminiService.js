const { GoogleGenerativeAI } = require("@google/generative-ai");

function buildFallbackAnalysis(text, urgency, category, volunteer) {
  const summaryParts = [
    `Need analyzed as ${urgency} urgency in the ${category} category.`,
    volunteer
      ? `${volunteer.name} from ${volunteer.location} is the best available match.`
      : "No exact volunteer match was found, so the request needs manual review."
  ];

  return {
    urgency,
    category,
    summary: summaryParts.join(" ")
  };
}

function buildGeminiPrompt(text) {
  return [
    "You are a strict JSON classification engine for NGO needs.",
    "Analyze the user's need text and return only valid JSON with exactly these keys:",
    '{"urgency":"High|Medium|Low","category":"Medical|Teaching|Food|Rescue|Logistics|General","summary":"2-3 short lines"}',
    "Rules:",
    "- Return JSON only.",
    "- No markdown.",
    "- No explanations.",
    "- No code fences.",
    "- Summary must be short, clear, and related to the need.",
    `Need text: ${text}`
  ].join("\n");
}

function parseGeminiJson(rawText) {
  if (!rawText) {
    throw new Error("Gemini returned empty text");
  }

  const trimmed = rawText.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const candidateText = jsonMatch ? jsonMatch[0] : trimmed;
  const parsed = JSON.parse(candidateText);

  const urgencyValues = new Set(["High", "Medium", "Low"]);
  const categoryValues = new Set(["Medical", "Teaching", "Food", "Rescue", "Logistics", "General"]);

  if (!urgencyValues.has(parsed.urgency)) {
    throw new Error("Invalid urgency value from Gemini");
  }

  if (!categoryValues.has(parsed.category)) {
    throw new Error("Invalid category value from Gemini");
  }

  if (typeof parsed.summary !== "string" || !parsed.summary.trim()) {
    throw new Error("Invalid summary value from Gemini");
  }

  return {
    urgency: parsed.urgency,
    category: parsed.category,
    summary: parsed.summary.trim()
  };
}

async function analyzeNeedWithGemini(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  const configuredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildGeminiPrompt(text);
  const modelCandidates = [
    configuredModel,
    "gemini-2.5-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite-001"
  ].filter((modelName, index, arr) => modelName && arr.indexOf(modelName) === index);

  const modelErrors = [];

  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
      const responseText = result.response.text();
      return parseGeminiJson(responseText);
    } catch (error) {
      modelErrors.push(`${modelName}: ${error.message}`);
    }
  }

  throw new Error(`Gemini analysis failed for all candidate models. ${modelErrors.join(" | ")}`);
}

module.exports = {
  analyzeNeedWithGemini,
  buildFallbackAnalysis,
  parseGeminiJson
};
