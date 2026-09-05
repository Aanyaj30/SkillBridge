# SkillBridge 🚀

### The Gap Changed. The Talent Didn’t.

**SkillBridge** is an AI-powered, skill-first hiring platform designed to make recruitment more inclusive and evidence-driven.

Traditional hiring systems often rely heavily on resumes, job titles, keywords, and continuous career histories. This can cause capable candidates to be overlooked when their actual skills are not clearly represented in their resumes — especially candidates with career breaks, non-linear career paths, limited experience, or unconventional backgrounds.

SkillBridge addresses this **evidence gap** by discovering, translating, and matching a candidate's demonstrated capabilities with real job requirements.

> **Evidence first, not assumptions.**

---

## 🎯 Problem

A career break does not necessarily mean a skill gap.

Candidates may develop valuable skills through:

* Upskilling and online courses
* Personal projects
* Freelancing
* Volunteering
* Entrepreneurship
* Caregiving and other responsibilities
* Independent learning
* Previous professional experience

However, conventional hiring systems often fail to capture this evidence.

As a result:

```text
Actual Skills
     ↓
Not visible on resume
     ↓
Poor ATS / keyword match
     ↓
Candidate gets overlooked
```

**SkillBridge aims to change this flow.**

---

## 💡 Solution

SkillBridge uses a **multi-agent AI architecture** to analyze job requirements, understand candidate evidence, conduct skill-focused interviews, normalize skills, and calculate candidate-job compatibility.

The platform follows an **Evidence-First Hiring** approach:

```text
Candidate Experience
        ↓
Evidence Discovery
        ↓
Skill Extraction
        ↓
Skill Normalization
        ↓
Job Skill Analysis
        ↓
Skill-Based Matching
        ↓
Meaningful Match Score
```

---

# 🤖 Multi-Agent AI Architecture

SkillBridge is powered by **5 specialized AI agents**, where each agent is responsible for a specific part of the hiring workflow.

## 1. 🏢 Job Analysis Agent

**Purpose:** Understand what a job actually requires.

The Job Analysis Agent processes a natural-language job description and identifies:

* Required skills
* Critical skills
* Optional skills
* Relevant experience requirements
* Other important job requirements

### Example

**Input:**

```text
Looking for a frontend developer with experience in
React, JavaScript, REST APIs and Git.
```

**Output:**

```text
Required Skills:
- React
- JavaScript
- REST APIs
- Git
```

This transforms an unstructured job description into structured hiring requirements.

---

## 2. 🧑 Candidate Evidence Agent

**Purpose:** Discover skills from a candidate's existing experience and evidence.

Instead of relying only on explicit resume keywords, the agent analyzes candidate information to identify skills that can be demonstrated through their experiences.

It helps answer:

> **"What can this candidate actually demonstrate?"**

Evidence can come from:

* Work history
* Projects
* Previous responsibilities
* Learning activities
* Career-break activities
* Other candidate-provided experiences

---

## 3. 🎤 Skill Interview Agent

**Purpose:** Conduct an AI-powered skill discovery interview.

When a candidate requires additional evidence, SkillBridge can initiate a conversational skill interview.

The agent asks relevant questions and analyzes the candidate's responses to identify demonstrable skills.

### Example

**Question:**

```text
What did you work on during your career break?
```

**Candidate:**

```text
I completed a full-stack development course and built
two projects using React, Node.js and MongoDB.
```

**Discovered skills:**

```text
React
Node.js
MongoDB
JavaScript
Full-Stack Development
```

These newly discovered skills can then become part of the candidate's evidence profile.

---

## 4. 🧭 Guide Agent

**Purpose:** Guide candidates through the skill-discovery process.

The Guide Agent helps determine what information or evidence should be collected from the candidate and supports the overall candidate journey.

Instead of treating every candidate identically, the system can guide candidates toward the information that is most useful for representing their capabilities.

---

## 5. 🎯 Matching Agent

**Purpose:** Match candidate skills with job requirements.

The Matching Agent combines:

* Candidate skills
* AI-discovered skills
* Normalized skills
* Job-required skills

to determine how closely a candidate matches a particular opportunity.

The result is a transparent, skill-based matching score rather than a purely keyword-based decision.

---

# 🔄 How SkillBridge Works

```text
                         ┌──────────────────────┐
                         │       EMPLOYER       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Job Description    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │   Job Analysis Agent    │
                       └────────────┬────────────┘
                                    │
                                    ▼
                         Required / Critical /
                           Optional Skills
                                    │
                                    │
                                    ▼
┌──────────────────┐       ┌─────────────────────┐
│    CANDIDATE     │       │     Matching        │
└────────┬─────────┘       │       Agent         │
         │                 └──────────▲──────────┘
         ▼                            │
┌──────────────────┐                  │
│   Work History   │                  │
└────────┬─────────┘                  │
         │                            │
         ▼                            │
┌──────────────────────┐              │
│ Candidate Evidence   │──────────────┤
│       Agent           │              │
└──────────┬───────────┘              │
           │                          │
           ▼                          │
     Existing Skills                  │
           │                          │
           ▼                          │
    Current Career Gap?               │
        /       \                     │
      No         Yes                  │
      │           │                   │
      │           ▼                   │
      │   ┌────────────────────┐      │
      │   │ Skill Interview    │      │
      │   │      Agent         │      │
      │   └─────────┬──────────┘      │
      │             │                 │
      │             ▼                 │
      │      New Skill Evidence       │
      │             │                 │
      └─────────────┴─────────────────┘
                    │
                    ▼
              Skill Matching
                    │
                    ▼
              Match Score
```

---

# 🧠 Evidence-First Hiring

The key idea behind SkillBridge is simple:

### Traditional Hiring

```text
Resume
  ↓
Keywords
  ↓
Match
  ↓
Decision
```

### SkillBridge

```text
Experience
   ↓
Evidence
   ↓
Demonstrated Skills
   ↓
Normalized Skills
   ↓
Job Requirements
   ↓
Skill Match
```

This allows the platform to surface skills that may otherwise remain hidden.

---

# 📊 Skill-Based Matching

SkillBridge evaluates compatibility based on the overlap between candidate skills and job requirements.

A simplified matching calculation is:

```text
                  Matched Required Skills
Match Score = ─────────────────────────────── × 100
                  Total Required Skills
```

### Example

**Job requires:**

```text
JavaScript
React
Node.js
MongoDB
```

**Candidate initially has:**

```text
JavaScript
HTML
CSS
```

Initial match:

```text
1 / 4 = 25%
```

After the AI skill interview, the candidate demonstrates:

```text
React
Node.js
MongoDB
```

The system can now recognize those capabilities:

```text
4 / 4 = 100%
```

The purpose is not to artificially increase a candidate's score.

It is to **make previously invisible evidence visible**.

---

# 🔧 Skill Normalization

SkillBridge includes a skill normalization layer to handle variations in how skills are written.

For example:

```text
"ReactJS"
"React.js"
"React JS"
```

can be normalized to:

```text
React
```

Similarly:

```text
"Node"
"NodeJS"
"Node.js"
```

can be treated as the same underlying skill.

This improves consistency during candidate-job matching.

---

# 🏗️ Technical Architecture

```text
┌──────────────────────────────────────────────┐
│                  React Client                │
│                    Vite                      │
│                                              │
│  Candidate Dashboard │ Jobs │ Applications  │
│  Employer Dashboard  │ Job Posting          │
│  Skill Interview     │ Candidate Pipeline   │
└───────────────────────┬──────────────────────┘
                        │
                     REST API
                        │
                        ▼
┌──────────────────────────────────────────────┐
│             Node.js + Express Server         │
│                                              │
│  Controllers                                 │
│  ├── Auth Controller                         │
│  ├── Candidate Controller                    │
│  ├── Job Controller                          │
│  └── Application Controller                  │
│                                              │
│  Routes + Authentication Middleware           │
└──────────────┬───────────────────┬───────────┘
               │                   │
               ▼                   ▼
┌──────────────────────┐  ┌──────────────────────┐
│    MongoDB Atlas     │  │      AI Layer        │
│                      │  │                      │
│ Candidate            │  │ 5 Specialized Agents │
│ Employer             │  │                      │
│ Job                  │  │ Job Analysis         │
│ Application          │  │ Candidate Evidence   │
└──────────────────────┘  │ Skill Interview      │
                          │ Guide                │
                          │ Matching             │
                          └──────────┬───────────┘
                                     │
                                     ▼
                              AI Provider Layer
```

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Context API

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs

## AI

* Gemini 2.5 Flash
* Multi-agent AI architecture
* AI-powered job analysis
* AI-powered candidate evidence extraction
* AI-powered skill interviews
* AI-powered matching

## Deployment & Development

* Git
* GitHub
* MongoDB Atlas
* Render
* ESLint

---

# 📁 Project Structure

```text
SkillBridge/
│
├── client/
│   │
│   ├── public/
│   │   └── assets/
│   │
│   ├── src/
│   │   │
│   │   ├── components/
│   │   │   ├── landing/
│   │   │   │   ├── CandidateCohorts.jsx
│   │   │   │   ├── ExperienceToSkills.jsx
│   │   │   │   ├── ForEmployers.jsx
│   │   │   │   ├── Hero.jsx
│   │   │   │   ├── HowitWorks.jsx
│   │   │   │   ├── MultiAgentEngine.jsx
│   │   │   │   └── Transformation.jsx
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── ApplicationResult.jsx
│   │   │       ├── DeleteProfileModal.jsx
│   │   │       ├── Footer.jsx
│   │   │       ├── Logo.jsx
│   │   │       ├── Navbar.jsx
│   │   │       ├── SkillInterview.jsx
│   │   │       └── WorkHistoryForm.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   └── useInView.js
│   │   │
│   │   ├── pages/
│   │   │   ├── CandidateDashboard.jsx
│   │   │   ├── CandidatePipeline.jsx
│   │   │   ├── EmployerDashboard.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── PostJob.jsx
│   │   │   └── Signup.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   ├── candidateController.js
│   │   └── jobController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── Application.js
│   │   ├── Candidate.js
│   │   ├── Employer.js
│   │   └── Job.js
│   │
│   ├── routes/
│   │   ├── applicationRoutes.js
│   │   ├── authRoutes.js
│   │   ├── candidateRoutes.js
│   │   └── jobRoutes.js
│   │
│   ├── services/
│   │   │
│   │   ├── agents/
│   │   │   ├── candidateEvidenceAgent.js
│   │   │   ├── guideAgent.js
│   │   │   ├── jobAnalysisAgent.js
│   │   │   └── skillInterviewAgent.js
│   │   │
│   │   ├── matching/
│   │   │   └── skillNormalizer.js
│   │   │
│   │   ├── resume/
│   │   │   └── edenParser.js
│   │   │
│   │   ├── aiProvider.js
│   │   ├── aiService.js
│   │   └── matching.js
│   │
│   ├── test/
│   │   └── skillExtraction.test.js
│   │
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

# 🔐 Authentication & Security

SkillBridge implements authentication using:

* JWT-based authentication
* Password hashing with bcryptjs
* Protected API routes
* Role-based candidate/employer workflows
* Environment variables for sensitive configuration

Sensitive credentials and API keys are stored through environment variables and are excluded from version control.

---

# 🗃️ Database Design

SkillBridge uses **MongoDB** with Mongoose.

### Candidate

Stores:

* Candidate profile
* Work history
* Skills
* Career gaps
* Evidence
* AI-discovered skills

### Employer

Stores employer account information and authentication data.

### Job

Stores:

* Job title
* Experience level
* Work mode
* Location
* Job description
* Required skills
* Critical/optional skills

### Application

Connects candidates with jobs and stores application and matching information.

```text
Candidate
    │
    │ applies
    ▼
Application
    │
    │ for
    ▼
Job
```

---

# 🔄 Candidate Application Flow

```text
Candidate Login
      ↓
Candidate Profile
      ↓
Work History
      ↓
Apply for Opportunity
      ↓
Check Career Gap
      │
      ├── No Current Gap
      │       ↓
      │   Continue Application
      │
      └── Current Gap
              ↓
       Skill Interview Agent
              ↓
       Candidate Responses
              ↓
       Candidate Evidence Agent
              ↓
        Skill Extraction
              ↓
        Skill Normalization
              ↓
         Matching Agent
              ↓
          Match Score
              ↓
       Application Submitted
```

---

# 🏢 Employer Flow

```text
Employer Signup/Login
          ↓
     Post Opportunity
          ↓
    Enter Job Description
          ↓
    Job Analysis Agent
          ↓
 Required / Critical / Optional
          Skills
          ↓
      Publish Job
          ↓
   Receive Applications
          ↓
 Candidate Skill Matching
          ↓
    Candidate Pipeline
```

---

# 📈 Why Multi-Agent AI?

Instead of using one large AI prompt for the entire hiring workflow, SkillBridge separates responsibilities across specialized agents.

```text
Job Analysis Agent
        ↓
Understands the Job

Candidate Evidence Agent
        ↓
Understands Candidate Evidence

Skill Interview Agent
        ↓
Discovers Missing Evidence

Guide Agent
        ↓
Guides the Candidate Journey

Matching Agent
        ↓
Connects Skills to Opportunities
```

This modular architecture makes the system easier to:

* Develop
* Test
* Debug
* Extend
* Improve independently

---

# 🌍 Target Candidates

SkillBridge is designed to support diverse candidate profiles, including:

* 🎓 Fresh graduates
* 🏫 Tier-2/Tier-3 college candidates
* 💻 Self-taught professionals
* 🔄 Career-break candidates
* 🧩 Candidates with non-linear career paths
* 🚀 Candidates with unconventional experience
* 👩‍💻 Professionals returning to work

The platform focuses on **capability and evidence**, rather than assuming that a non-traditional career path means a lack of skills.

---

# 🚀 Future Scope

### For Candidates

* Verified skill assessments
* Personalized career roadmaps
* AI interview preparation
* Advanced job recommendations
* Skill-gap analysis

### For Employers

* Advanced candidate search
* Bulk candidate screening
* Custom assessments
* Hiring analytics
* ATS integrations
* Skill-based talent pools

### Internal Mobility

SkillBridge can also evolve beyond external recruitment.

Organizations could use the platform to discover existing employees whose demonstrated skills match new internal roles, projects, or opportunities.

---

# 🎯 Vision

SkillBridge aims to make hiring more:

**Skill-first.
Evidence-driven.
Inclusive.**

A career gap shouldn't automatically mean a skill gap.

A non-linear career shouldn't mean a lack of potential.

And a resume shouldn't be the only evidence of what someone can do.

---

## ⭐ Core Philosophy

> **The Gap Changed. The Talent Didn’t.**

SkillBridge turns hidden experience into visible evidence — helping candidates be evaluated for **what they can actually do**, not just what their career timeline looks like.
