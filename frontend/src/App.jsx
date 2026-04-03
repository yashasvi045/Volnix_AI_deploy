import { useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const skillOptions = ["Medical", "Teaching", "Food", "Rescue", "Logistics", "General"];
const cityOptions = [
  "Kolkata",
  "Delhi",
  "Mumbai",
  "Chennai",
  "Pune",
  "Hyderabad",
  "Bangalore",
  "Ahmedabad"
];

const loadingSteps = [
  "Analyzing need...",
  "Detecting urgency...",
  "Matching volunteer...",
  "Generating insights..."
];

const stats = [
  { label: "Needs Addressed", value: "120+" },
  { label: "Volunteers Connected", value: "80+" },
  { label: "Urgent Cases Resolved", value: "95%" }
];

const flowSteps = [
  "NGO submits need",
  "AI analyzes",
  "Volunteer matched",
  "Task completed"
];

function App() {
  const [page, setPage] = useState("home");
  const [statusMessage, setStatusMessage] = useState("");

  const [volunteerForm, setVolunteerForm] = useState({
    name: "",
    skill: "Medical",
    location: "Kolkata",
    phone: "",
    email: ""
  });

  const [ngoForm, setNgoForm] = useState({
    text: "",
    requiredSkill: "Medical",
    location: "Kolkata"
  });

  const [demoForm, setDemoForm] = useState({
    text: "",
    requiredSkill: "General",
    location: "Kolkata"
  });

  const [demoResult, setDemoResult] = useState(null);
  const [assignResult, setAssignResult] = useState(null);
  const [history, setHistory] = useState([]);

  const [isLoadingVolunteer, setIsLoadingVolunteer] = useState(false);
  const [isAnalyzingDemo, setIsAnalyzingDemo] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const currentNeedSummary = useMemo(() => {
    if (!assignResult) {
      return null;
    }

    return {
      text: assignResult.sourceText,
      location: assignResult.sourceLocation
    };
  }, [assignResult]);

  function goHomeAndScroll(sectionId) {
    setPage("home");
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  }

  function onVolunteerChange(event) {
    const { name, value } = event.target;
    setVolunteerForm((current) => ({ ...current, [name]: value }));
  }

  function onNgoChange(event) {
    const { name, value } = event.target;
    setNgoForm((current) => ({ ...current, [name]: value }));
  }

  function onDemoChange(event) {
    const { name, value } = event.target;
    setDemoForm((current) => ({ ...current, [name]: value }));
  }

  async function submitVolunteer(event) {
    event.preventDefault();
    setStatusMessage("");
    setIsLoadingVolunteer(true);

    try {
      const response = await fetch(`${API_BASE_URL}/add-volunteer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(volunteerForm)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setVolunteerForm({
        name: "",
        skill: "Medical",
        location: "Kolkata",
        phone: "",
        email: ""
      });
      setStatusMessage("Volunteer registered successfully.");
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsLoadingVolunteer(false);
    }
  }

  async function runDemoAnalysis(event) {
    event.preventDefault();
    setStatusMessage("");
    setIsAnalyzingDemo(true);
    setDemoResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demoForm)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Demo analysis failed");
      }

      setDemoResult({
        urgency: data.urgency,
        category: data.category,
        summary: data.summary
      });
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsAnalyzingDemo(false);
    }
  }

  async function analyzeAndAssign(event) {
    event.preventDefault();
    setStatusMessage("");
    setAssignResult(null);
    setIsAssigning(true);

    let currentStep = 0;
    setActiveStep(0);

    const ticker = setInterval(() => {
      currentStep = (currentStep + 1) % loadingSteps.length;
      setActiveStep(currentStep);
    }, 800);

    try {
      const response = await fetch(`${API_BASE_URL}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ngoForm)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Assign failed");
      }

      const fullResult = {
        ...data,
        volunteer: data.volunteer || data.assignedVolunteer || null,
        sourceText: ngoForm.text,
        sourceLocation: ngoForm.location,
        sourceSkill: ngoForm.requiredSkill,
        createdAt: new Date().toLocaleString()
      };

      setAssignResult(fullResult);
      setHistory((current) => [fullResult, ...current].slice(0, 8));
      setPage("result");
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      clearInterval(ticker);
      setIsAssigning(false);
      setActiveStep(0);
    }
  }

  return (
    <div className="site-root">
      <header className="navbar">
        <button className="logo" type="button" onClick={() => setPage("home")}>SmartServe AI</button>
        <nav className="nav-links">
          <button type="button" onClick={() => goHomeAndScroll("home")}>Home</button>
          <button type="button" onClick={() => goHomeAndScroll("features")}>Features</button>
          <button type="button" onClick={() => goHomeAndScroll("how-it-works")}>How it Works</button>
          <button type="button" onClick={() => goHomeAndScroll("contact")}>Contact</button>
        </nav>
        <button className="primary-btn" type="button" onClick={() => setPage("ngo")}>Get Started</button>
      </header>

      {statusMessage ? <div className="status-banner">{statusMessage}</div> : null}

      {page === "home" ? (
        <main id="home" className="page home-page">
          <section className="hero-section">
            <div>
              <p className="hero-pill">Google AI Powered Coordination</p>
              <h1>Empowering NGOs with Intelligent Volunteer Coordination</h1>
              <p>
                Analyze needs, match volunteers, and create impact using Google AI.
              </p>
              <div className="hero-actions">
                <button className="primary-btn" type="button" onClick={() => setPage("ngo")}>
                  Go to NGO Dashboard
                </button>
                <button className="secondary-btn" type="button" onClick={() => setPage("volunteer")}>
                  Join as Volunteer
                </button>
              </div>
            </div>
            <div className="hero-card">
              <h3>Realtime Coordination Engine</h3>
              <p>AI urgency scoring + skill matching + action-ready volunteer contact.</p>
            </div>
          </section>

          <section id="features" className="section-card">
            <div className="section-head">
              <h2>Live AI Demo</h2>
              <span className="wow-tag">WOW SECTION</span>
            </div>
            <form className="form-grid" onSubmit={runDemoAnalysis}>
              <label className="full-row">
                Enter a community need...
                <textarea
                  name="text"
                  value={demoForm.text}
                  onChange={onDemoChange}
                  rows="3"
                  placeholder="Need medical kits and food packets for families in relief camp"
                  required
                />
              </label>
              <label>
                Required Skill
                <select name="requiredSkill" value={demoForm.requiredSkill} onChange={onDemoChange}>
                  {skillOptions.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </label>
              <label>
                Location
                <select name="location" value={demoForm.location} onChange={onDemoChange}>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </label>
              <button className="primary-btn" type="submit" disabled={isAnalyzingDemo}>
                {isAnalyzingDemo ? "Analyzing..." : "Analyze"}
              </button>
            </form>

            {demoResult ? (
              <div className="demo-output">
                <div><span>Urgency:</span> <strong>{demoResult.urgency}</strong></div>
                <div><span>Category:</span> <strong>{demoResult.category}</strong></div>
                <p>{demoResult.summary}</p>
              </div>
            ) : null}
          </section>

          <section className="stats-grid">
            {stats.map((stat) => (
              <article key={stat.label} className="stat-card">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </article>
            ))}
          </section>

          <section id="how-it-works" className="section-card">
            <h2>How It Works</h2>
            <div className="steps-grid">
              {flowSteps.map((step, index) => (
                <article key={step} className="step-card">
                  <span>Step {index + 1}</span>
                  <h3>{step}</h3>
                </article>
              ))}
            </div>
          </section>

          <section className="why-grid">
            <article className="section-card">
              <h2>Why SmartServe AI</h2>
              <ul>
                <li>Faster than manual coordination</li>
                <li>AI-powered decisions</li>
                <li>Real-world impact</li>
              </ul>
            </article>
            <article className="section-card cta-card">
              <h2>Ready to make a difference?</h2>
              <div className="hero-actions">
                <button className="primary-btn" type="button" onClick={() => setPage("ngo")}>NGO Dashboard</button>
                <button className="secondary-btn" type="button" onClick={() => setPage("volunteer")}>Volunteer Registration</button>
              </div>
            </article>
          </section>
        </main>
      ) : null}

      {page === "volunteer" ? (
        <main className="page flow-page">
          <section className="section-card">
            <div className="panel-top">
              <h2>Volunteer Registration</h2>
              <button className="ghost-btn" type="button" onClick={() => setPage("home")}>Back to Home</button>
            </div>
            <form className="form-grid" onSubmit={submitVolunteer}>
              <label>
                Name
                <input name="name" value={volunteerForm.name} onChange={onVolunteerChange} required />
              </label>
              <label>
                Skill
                <select name="skill" value={volunteerForm.skill} onChange={onVolunteerChange}>
                  {skillOptions.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </label>
              <label>
                Location
                <select name="location" value={volunteerForm.location} onChange={onVolunteerChange}>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </label>
              <label>
                Phone
                <input name="phone" value={volunteerForm.phone} onChange={onVolunteerChange} required />
              </label>
              <label className="full-row">
                Email
                <input type="email" name="email" value={volunteerForm.email} onChange={onVolunteerChange} required />
              </label>
              <button className="primary-btn" type="submit" disabled={isLoadingVolunteer}>
                {isLoadingVolunteer ? "Registering..." : "Register"}
              </button>
            </form>
          </section>
        </main>
      ) : null}

      {page === "ngo" ? (
        <main className="page flow-page">
          <section className="section-card">
            <div className="panel-top">
              <h2>NGO Dashboard</h2>
              <button className="ghost-btn" type="button" onClick={() => setPage("home")}>Back to Home</button>
            </div>
            <form className="form-grid" onSubmit={analyzeAndAssign}>
              <label className="full-row">
                Need Description
                <textarea
                  name="text"
                  value={ngoForm.text}
                  onChange={onNgoChange}
                  rows="4"
                  placeholder="Describe the community need"
                  required
                />
              </label>
              <label>
                Required Skill
                <select name="requiredSkill" value={ngoForm.requiredSkill} onChange={onNgoChange}>
                  {skillOptions.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </label>
              <label>
                Location
                <select name="location" value={ngoForm.location} onChange={onNgoChange}>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </label>
              <button className="primary-btn" type="submit" disabled={isAssigning}>
                {isAssigning ? "Processing..." : "Analyze & Assign"}
              </button>
            </form>

            {isAssigning ? (
              <section className="process-screen">
                {loadingSteps.map((step, index) => (
                  <div key={step} className={`process-step ${index <= activeStep ? "active" : ""}`}>
                    <span className="dot" />
                    <span>{step}</span>
                  </div>
                ))}
              </section>
            ) : null}
          </section>
        </main>
      ) : null}

      {page === "result" && assignResult ? (
        <main className="page flow-page">
          <section className="result-layout">
            <article className="section-card">
              <h3>Need Summary</h3>
              <p>{currentNeedSummary?.text}</p>
              <p><strong>Location:</strong> {currentNeedSummary?.location}</p>
            </article>

            <article className="section-card">
              <h3>AI Analysis</h3>
              <p><strong>Urgency:</strong> <span className={`badge ${assignResult.urgency.toLowerCase()}`}>{assignResult.urgency}</span></p>
              <p><strong>Category:</strong> {assignResult.category}</p>
            </article>

            <article className="section-card">
              <h3>Assigned Volunteer</h3>
              {assignResult.volunteer ? (
                <>
                  <p><strong>{assignResult.volunteer.name}</strong></p>
                  <p>Skills: {(assignResult.volunteer.skills || []).join(", ")}</p>
                  <p>Location: {assignResult.volunteer.location}</p>
                  <p>Phone: {assignResult.volunteer.phone || "N/A"}</p>
                  <p>Email: {assignResult.volunteer.email || "N/A"}</p>
                  <div className="hero-actions">
                    <a className="primary-btn" href={assignResult.volunteer.phone ? `tel:${assignResult.volunteer.phone}` : "#"}>Call</a>
                    <a className="secondary-btn" href={assignResult.volunteer.email ? `mailto:${assignResult.volunteer.email}` : "#"}>Email</a>
                  </div>
                </>
              ) : (
                <p>No volunteer matched yet.</p>
              )}
            </article>

            <article className="section-card">
              <h3>AI Insight (Gemini)</h3>
              <p>{assignResult.summary}</p>
            </article>
          </section>

          <section className="section-card history-card">
            <div className="panel-top">
              <h3>Recent Request Log</h3>
              <button className="ghost-btn" type="button" onClick={() => setPage("ngo")}>Create New Request</button>
            </div>
            {history.length ? (
              <div className="history-list">
                {history.map((item, index) => (
                  <div key={`${item.createdAt}-${index}`} className="history-item">
                    <div>
                      <strong>{item.sourceLocation}</strong> - {item.sourceSkill}
                      <p>{item.sourceText}</p>
                    </div>
                    <span className={`badge ${item.urgency.toLowerCase()}`}>{item.urgency}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No history yet.</p>
            )}
          </section>
        </main>
      ) : null}

      <footer id="contact" className="footer">
        <p>SmartServe AI</p>
        <div>
          <button type="button" onClick={() => setPage("home")}>Home</button>
          <button type="button" onClick={() => setPage("ngo")}>NGO Dashboard</button>
          <button type="button" onClick={() => setPage("volunteer")}>Volunteer Registration</button>
        </div>
        <p>Built for Google Solution Challenge 2026</p>
      </footer>
    </div>
  );
}

export default App;
