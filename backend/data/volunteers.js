const volunteers = [
  { name: "Rahul Sharma", skill: "Medical", location: "Kolkata", phone: "9876543210", email: "rahul.sharma@gmail.com" },
  { name: "Ananya Das", skill: "Teaching", location: "Kolkata", phone: "9123456780", email: "ananya.das@gmail.com" },
  { name: "Amit Verma", skill: "Food", location: "Delhi", phone: "9012345678", email: "amit.verma@gmail.com" },
  { name: "Neha Kapoor", skill: "Rescue", location: "Mumbai", phone: "9988776655", email: "neha.kapoor@gmail.com" },
  { name: "Arjun Mehta", skill: "Logistics", location: "Mumbai", phone: "9090909090", email: "arjun.mehta@gmail.com" },
  { name: "Priya Singh", skill: "General", location: "Lucknow", phone: "9345678901", email: "priya.singh@gmail.com" },
  { name: "Rohit Gupta", skill: "Medical", location: "Delhi", phone: "9234567890", email: "rohit.gupta@gmail.com" },
  { name: "Sneha Iyer", skill: "Teaching", location: "Chennai", phone: "9871234560", email: "sneha.iyer@gmail.com" },
  { name: "Vikram Reddy", skill: "Food", location: "Hyderabad", phone: "9011122233", email: "vikram.reddy@gmail.com" },
  { name: "Pooja Jain", skill: "Rescue", location: "Jaipur", phone: "9887766554", email: "pooja.jain@gmail.com" }
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getAllVolunteers() {
  return volunteers;
}

function toSkillsArray(value) {
  if (Array.isArray(value)) {
    return value.map((skill) => String(skill || "").trim()).filter(Boolean);
  }

  const oneSkill = String(value || "").trim();
  return oneSkill ? [oneSkill] : [];
}

function addVolunteer(volunteer) {
  const skills = toSkillsArray(volunteer.skills || volunteer.skill);
  const entry = {
    id: Date.now(),
    name: volunteer.name.trim(),
    skills,
    location: volunteer.location.trim(),
    phone: String(volunteer.phone || "").trim(),
    email: String(volunteer.email || "").trim()
  };

  entry.skill = entry.skills[0] || "General";

  volunteers.push(entry);
  return entry;
}

function calculateScore(volunteer, requiredSkill, location) {
  const targetSkill = normalize(requiredSkill);
  const targetLocation = normalize(location);
  const volunteerSkills = toSkillsArray(volunteer.skills || volunteer.skill).map(normalize);

  let score = 0;
  if (volunteerSkills.includes(targetSkill)) {
    score += 2;
  }
  if (normalize(volunteer.location) === targetLocation) {
    score += 2;
  }
  if (volunteerSkills.includes("general")) {
    score += 1;
  }

  return score;
}

function findBestVolunteer(requiredSkill, location) {
  let bestVolunteer = null;
  let bestScore = -1;

  for (const volunteer of volunteers) {
    const score = calculateScore(volunteer, requiredSkill, location);
    if (score > bestScore) {
      bestVolunteer = volunteer;
      bestScore = score;
    }
  }

  const exactMatch =
    !!bestVolunteer &&
    toSkillsArray(bestVolunteer.skills || bestVolunteer.skill).map(normalize).includes(normalize(requiredSkill)) &&
    normalize(bestVolunteer.location) === normalize(location);

  return {
    volunteer: bestScore > 0 ? bestVolunteer : null,
    score: bestScore,
    exactMatch,
    message: exactMatch
      ? "Exact match found"
      : bestScore > 0
      ? "No exact match found. Best available volunteer assigned"
      : "No exact match found"
  };
}

module.exports = {
  addVolunteer,
  calculateScore,
  findBestVolunteer,
  getAllVolunteers
};
