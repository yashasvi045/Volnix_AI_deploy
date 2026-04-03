async function getUrgencyFromFlask(text) {
  const flaskUrl = process.env.FLASK_AI_URL || "http://localhost:5000/predict";

  try {
    const response = await fetch(flaskUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`Flask API responded with ${response.status}`);
    }

    const data = await response.json();
    return data.urgency || "Medium";
  } catch (error) {
    console.error("Urgency prediction failed:", error.message);
    return "Medium";
  }
}

module.exports = {
  getUrgencyFromFlask
};
