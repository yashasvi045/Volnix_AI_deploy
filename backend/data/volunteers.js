const volunteers = [
  { id: 1, name: "Rahul Sharma", skills: ["Medical", "Rescue"], location: "Kolkata", phone: "9876543210", email: "rahul@gmail.com" },
  { id: 2, name: "Priya Singh", skills: ["Teaching", "Logistics"], location: "Delhi", phone: "9876500012", email: "priya.singh@gmail.com" },
  { id: 3, name: "Aman Verma", skills: ["General", "Food"], location: "Mumbai", phone: "9876500013", email: "aman.verma@gmail.com" },
  { id: 4, name: "Sneha Das", skills: ["Medical", "Food"], location: "Chennai", phone: "9876500014", email: "sneha.das@gmail.com" },
  { id: 5, name: "Arjun Mehta", skills: ["Teaching", "General"], location: "Pune", phone: "9876500015", email: "arjun.mehta@gmail.com" },
  { id: 6, name: "Neha Gupta", skills: ["Logistics", "General"], location: "Hyderabad", phone: "9876500016", email: "neha.gupta@gmail.com" },
  { id: 7, name: "Vikram Roy", skills: ["Medical", "Rescue"], location: "Bangalore", phone: "9876500017", email: "vikram.roy@gmail.com" },
  { id: 8, name: "Kavita Nair", skills: ["Teaching", "Food"], location: "Kolkata", phone: "9876500018", email: "kavita.nair@gmail.com" },
  { id: 9, name: "Rohan Patel", skills: ["General", "Logistics"], location: "Ahmedabad", phone: "9876500019", email: "rohan.patel@gmail.com" },
  { id: 10, name: "Ananya Bose", skills: ["Medical", "General"], location: "Delhi", phone: "9876500020", email: "ananya.bose@gmail.com" },
  { id: 11, name: "Sahil Khan", skills: ["Teaching", "Rescue"], location: "Mumbai", phone: "9876500021", email: "sahil.khan@gmail.com" },
  { id: 12, name: "Meera Iyer", skills: ["Food", "General"], location: "Chennai", phone: "9876500022", email: "meera.iyer@gmail.com" },
  { id: 13, name: "Deepak Joshi", skills: ["Medical", "Logistics"], location: "Pune", phone: "9876500023", email: "deepak.joshi@gmail.com" },
  { id: 14, name: "Pooja Sen", skills: ["Teaching", "General"], location: "Hyderabad", phone: "9876500024", email: "pooja.sen@gmail.com" },
  { id: 15, name: "Nitin Malhotra", skills: ["Rescue", "General"], location: "Bangalore", phone: "9876500025", email: "nitin.malhotra@gmail.com" }
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
