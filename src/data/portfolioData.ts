export interface Project {
  id: string;
  name: string;
  category: string;
  timeline?: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  techStack: string[];
  featured: boolean;
  githubUrl?: string;
  liveUrl?: string;
  statusText?: string;
  highlights?: string[];
  role?: string;
  architectureNotes?: string;
}

export interface SkillCategory {
  title: string;
  description: string;
  skills: {
    name: string;
    level?: string;
    inProjects?: string[];
    highlight?: boolean;
  }[];
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year: string;
  category: 'Problem Solving' | 'Backend & Full-Stack' | 'Databases & SQL' | 'Programming';
  verificationUrl?: string;
  credentialLabel?: string;
  skillsAcquired: string[];
}

export interface AchievementItem {
  id: string;
  title: string;
  metric: string;
  sublabel: string;
  description: string;
  accent: 'amber' | 'blue' | 'emerald' | 'indigo';
  url?: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  duration: string;
  score: string;
  scoreLabel: string;
  location: string;
  details: string[];
}

export interface PortfolioData {
  personal: {
    name: string;
    headline: string;
    educationHeadline: string;
    university: string;
    location: string;
    duration: string;
    currentCgpa: number;
    cgpaDisplay: string;
    careerStage: string;
    introduction: string;
    bioParagraphs: string[];
    careerInterests: string[];
    availability: string;
    contactEmail: string;
    phone: string;
    githubUrl: string;
    linkedinUrl: string;
    leetcodeUrl: string;
    hackerrankUrl: string;
    leetcodeSolved: string;
    leetcodeRating: string;
    leetcodePeakRating: string;
    jeePercentile: string;
    resumeUrl: string;
    resumeFileName: string;
    profilePicture?: string;
  };
  skillCategories: SkillCategory[];
  featuredProjects: Project[];
  miniProjects: Project[];
  certifications: Certification[];
  achievements: AchievementItem[];
  education: EducationItem[];
  achievementsSummary: {
    label: string;
    value: string;
    context: string;
  }[];
}

export const PORTFOLIO_DATA: PortfolioData = {
  personal: {
    name: "Tejas Tiwari",
    headline: "Full-Stack Developer | Java & DSA | AI-Integrated Applications",
    educationHeadline: "Bachelor of Technology in Computer Science (Artificial Intelligence and Machine Learning)",
    university: "Pranveer Singh Institute of Technology (PSIT), Kanpur",
    location: "Kanpur, Uttar Pradesh, India",
    duration: "2024 – 2028",
    currentCgpa: 8.43,
    cgpaDisplay: "8.43/10",
    careerStage: "Undergraduate / Fresher",
    introduction:
      "Computer Science undergraduate specializing in Artificial Intelligence and Machine Learning, with hands-on experience building full-stack applications using React.js, Node.js, Express.js, and PostgreSQL.",
    bioParagraphs: [
      "I am a Computer Science undergraduate specializing in Artificial Intelligence and Machine Learning at PSIT Kanpur (CGPA: 8.43/10), with hands-on experience building full-stack applications using React.js, TypeScript, Node.js, Express.js, and PostgreSQL.",
      "Experienced in developing REST APIs, JWT-based authentication, bcrypt password hashing, Role-Based Access Control (RBAC), database-backed session management, and AI-integrated applications powered by Gemini and OpenAI APIs.",
      "Backed by a strong foundation in Java, Data Structures and Algorithms (600+ problems solved across LeetCode, HackerRank, and GeeksforGeeks with a peak LeetCode rating of 1538), Object-Oriented Programming, and database management. Actively seeking SDE and Full-Stack internship opportunities."
    ],
    careerInterests: [
      "Software Development Engineer (SDE)",
      "Full-Stack Developer",
      "Backend Developer",
      "Java Developer",
      "AI-Integrated Engineer"
    ],
    availability: "Open to immediate internship opportunities",
    contactEmail: "tejastiwari724@gmail.com",
    phone: "+91 88403 24134",
    githubUrl: "https://github.com/tejastiwari1456",
    linkedinUrl: "https://www.linkedin.com/in/tejastiwari1226/",
    leetcodeUrl: "https://leetcode.com/u/tejas_tiwari_1456/",
    hackerrankUrl: "https://www.hackerrank.com/profile/tejastiwari724",
    leetcodeSolved: "600+",
    leetcodeRating: "1514",
    leetcodePeakRating: "1538",
    jeePercentile: "96.7%ile",
    resumeUrl: "/assets/aistudio/Tejas_Tiwari_SDE_Resume_71905e87.pdf",
    resumeFileName: "Tejas_Tiwari_SDE_Resume.pdf",
    profilePicture: "/assets/aistudio/Tejas_b16d8a21.jpeg"
  },

  achievementsSummary: [
    {
      label: "Problems Solved",
      value: "600+",
      context: "LeetCode, HackerRank & GeeksforGeeks"
    },
    {
      label: "Peak LeetCode Rating",
      value: "1538",
      context: "Current Rating: 1514 · Active Contestant"
    },
    {
      label: "Academic CGPA",
      value: "8.43/10",
      context: "PSIT Kanpur · B.Tech CSE (AI & ML)"
    },
    {
      label: "JEE Main 2024",
      value: "96.7%ile",
      context: "Plus HackerRank 5★ SQL · 4★ PS · 3★ Java"
    }
  ],

  skillCategories: [
    {
      title: "Languages",
      description: "Core languages for algorithmic problem solving, type-safe web engineering, and relational querying",
      skills: [
        { name: "Java", level: "3★ HackerRank · OOP & DSA", highlight: true },
        { name: "TypeScript", level: "Full-Stack Type Safety", inProjects: ["SimLab Hub", "AI Interview System"], highlight: true },
        { name: "JavaScript", level: "ES6+, Async & DOM", inProjects: ["SimLab Hub", "AI Interview System"], highlight: true },
        { name: "SQL", level: "5★ HackerRank · Certified", inProjects: ["SimLab Hub", "AI Interview System"], highlight: true }
      ]
    },
    {
      title: "Frontend Development",
      description: "Modern, responsive, component-driven user interfaces and interactive dashboards",
      skills: [
        { name: "React.js", inProjects: ["SimLab Hub"], highlight: true },
        { name: "React Router", inProjects: ["SimLab Hub"], highlight: true },
        { name: "Tailwind CSS", inProjects: ["SimLab Hub"], highlight: true },
        { name: "CSS3", inProjects: ["SimLab Hub", "AI Interview System"], highlight: true },
        { name: "HTML5", inProjects: ["SimLab Hub", "AI Interview System"], highlight: true }
      ]
    },
    {
      title: "Backend Development",
      description: "REST API architecture, secure JWT authentication, session management, and RBAC",
      skills: [
        { name: "Node.js", level: "HackerRank Certified", inProjects: ["SimLab Hub", "AI Interview System"], highlight: true },
        { name: "Express.js", inProjects: ["SimLab Hub"], highlight: true },
        { name: "REST API", inProjects: ["SimLab Hub", "AI Interview System"], highlight: true },
        { name: "JWT Authentication", inProjects: ["SimLab Hub"], highlight: true },
        { name: "RBAC", inProjects: ["SimLab Hub"], highlight: true },
        { name: "Session Management", inProjects: ["SimLab Hub"], highlight: true }
      ]
    },
    {
      title: "Databases",
      description: "Relational schema design, audit logging, and cloud-managed PostgreSQL storage",
      skills: [
        { name: "PostgreSQL", inProjects: ["SimLab Hub", "AI Interview System"], highlight: true },
        { name: "MySQL", highlight: true },
        { name: "Supabase", inProjects: ["AI Interview System"], highlight: true }
      ]
    },
    {
      title: "AI Integration & APIs",
      description: "Automated evaluation workflows, prompt configuration, and LLM-powered assessment systems",
      skills: [
        { name: "Gemini API", level: "Viva Voce Automation", inProjects: ["SimLab Hub"], highlight: true },
        { name: "OpenAI API", level: "Interview Evaluation", inProjects: ["AI Interview System"], highlight: true },
        { name: "AI Evaluation Workflows", inProjects: ["SimLab Hub", "AI Interview System"], highlight: true }
      ]
    },
    {
      title: "Core CS Concepts",
      description: "Foundational computer science principles powering reliable software systems",
      skills: [
        { name: "Data Structures & Algorithms", level: "600+ Solved", highlight: true },
        { name: "Object-Oriented Programming (OOP)", highlight: true },
        { name: "Database Management Systems (DBMS)", highlight: true },
        { name: "Operating Systems (OS)", highlight: true },
        { name: "Problem Solving", level: "4★ HackerRank · Certified", highlight: true }
      ]
    },
    {
      title: "Tools & Platforms",
      description: "Developer tooling, API testing, database administration, and edge deployment",
      skills: [
        { name: "Git & GitHub", highlight: true },
        { name: "Postman", highlight: true },
        { name: "VS Code", highlight: true },
        { name: "MySQL Workbench", highlight: true },
        { name: "Cloudflare Pages", inProjects: ["AI Interview System"], highlight: true },
        { name: "Vite", inProjects: ["SimLab Hub"], highlight: true }
      ]
    }
  ],

  featuredProjects: [
    {
      id: "simlab-competency-hub",
      name: "SimLab Competency Hub",
      category: "Full-Stack Development | EdTech & AI Assessment",
      timeline: "Aug 2026 – Sept 2026",
      shortDescription:
        "A full-stack virtual laboratory platform featuring interactive Optics and Electronics simulations, real-time experiment calculations, RBAC security, and AI-powered Viva Voce assessments.",
      fullDescription:
        "Engineered a full-stack virtual laboratory platform featuring interactive Optics and Electronics simulations, real-time experiment calculations, and competency-based student evaluation. Built with secure JWT authentication, bcrypt password hashing, database-backed session management and revocation, Role-Based Access Control (RBAC), audit logging, and Gemini AI-powered Viva Voce automated evaluation workflows.",
      features: [
        "Engineered a full-stack virtual laboratory platform featuring interactive Optics and Electronics simulations, real-time experiment calculations, and competency-based student evaluation.",
        "Implemented secure authentication using JWT, bcrypt password hashing, session management and revocation, Role-Based Access Control (RBAC), and audit logging.",
        "Developed REST APIs with PostgreSQL for persistent user, session, and competency data management.",
        "Integrated AI-powered Viva Voce assessments (Gemini) to evaluate students' conceptual understanding and practical knowledge through automated evaluation workflows."
      ],
      techStack: [
        "React",
        "TypeScript",
        "Tailwind",
        "Node.js",
        "Express.js",
        "PostgreSQL",
        "Gemini",
        "JWT Authentication",
        "RBAC"
      ],
      featured: true,
      githubUrl: "https://github.com/tejastiwari1456/SimpLab-Competency",
      statusText: "Full-Stack · AI Viva Voce",
      highlights: [
        "Interactive Optics & Electronics real-time calculations",
        "JWT, bcrypt, session revocation, RBAC & audit logging",
        "Gemini AI-powered Viva Voce automated evaluation"
      ],
      architectureNotes:
        "React + TypeScript + Tailwind client communicating with Node.js/Express REST APIs, guarded by JWT + bcrypt + RBAC middleware and backed by PostgreSQL with session revocation and audit trails, plus Gemini API assessment workflows."
    },
    {
      id: "ai-interview-system",
      name: "AI Interview System",
      category: "AI-Powered Platform | Full-Stack Engineering",
      timeline: "May 2026 – Jul 2026",
      shortDescription:
        "An AI-powered technical interview platform supporting interactive chat-based interviews, automated candidate evaluation, transcript storage, and an administrative management dashboard.",
      fullDescription:
        "Developed an AI-powered technical interview platform supporting interactive, chat-based interviews and automated candidate evaluation based on interview responses. Powered by OpenAI, Node.js, Supabase, PostgreSQL, and Cloudflare deployment with a full administrative console for prompt configuration and candidate access-code generation.",
      features: [
        "Developed an AI-powered technical interview platform supporting interactive, chat-based interviews and automated candidate evaluation based on interview responses.",
        "Implemented AI-driven evaluation workflows and interview transcript storage using Supabase and PostgreSQL, enabling structured candidate assessment and interview history management.",
        "Built an administrative dashboard for interview management, prompt configuration, and candidate access-code generation, streamlining interview creation and candidate access."
      ],
      techStack: [
        "HTML",
        "CSS",
        "TypeScript",
        "Node.js",
        "Cloudflare",
        "Supabase",
        "OpenAI",
        "PostgreSQL"
      ],
      featured: true,
      githubUrl: "https://github.com/tejastiwari1456/codingwalalh-ai-interview-main",
      statusText: "AI Assessment · Admin Dashboard",
      highlights: [
        "Interactive chat-based technical interviews & AI scoring",
        "Transcript storage & history via Supabase + PostgreSQL",
        "Admin dashboard with prompt config & access-code generator"
      ],
      architectureNotes:
        "TypeScript & Node.js orchestration integrating OpenAI evaluation pipelines with Supabase + PostgreSQL transcript persistence, edge-hosted on Cloudflare with an admin control plane for dynamic prompts and candidate access codes."
    }
  ],

  miniProjects: [],

  certifications: [
    {
      id: "hackerrank-problem-solving",
      title: "HackerRank Problem Solving Certificate",
      issuer: "HackerRank",
      year: "2026",
      category: "Problem Solving",
      verificationUrl: "https://www.hackerrank.com/certificates/ab77b4f2d4c9",
      credentialLabel: "hackerrank.com/certificates/ab77b4f2d4c9",
      skillsAcquired: [
        "Data Structures & Algorithms",
        "Time & Space Complexity",
        "Dynamic Programming & Recursion",
        "Graph & Tree Traversal"
      ]
    },
    {
      id: "hackerrank-nodejs",
      title: "HackerRank Node.js Certificate",
      issuer: "HackerRank",
      year: "2026",
      category: "Backend & Full-Stack",
      verificationUrl: "https://www.hackerrank.com/certificates/0061d1e9a620",
      credentialLabel: "hackerrank.com/certificates/0061d1e9a620",
      skillsAcquired: [
        "Node.js Runtime & Event Loop",
        "RESTful API Architecture",
        "Asynchronous Patterns & Streams",
        "Express Backend Services"
      ]
    },
    {
      id: "hackerrank-sql",
      title: "HackerRank SQL Certificate",
      issuer: "HackerRank",
      year: "2026",
      category: "Databases & SQL",
      verificationUrl: "https://www.hackerrank.com/certificates/ec1f2fc7ef95",
      credentialLabel: "hackerrank.com/certificates/ec1f2fc7ef95",
      skillsAcquired: [
        "Complex Relational Joins",
        "Aggregations & Window Functions",
        "Subqueries & Schema Optimization",
        "PostgreSQL / MySQL Querying"
      ]
    },
    {
      id: "oracle-java-foundations",
      title: "Oracle Java Foundations Badge",
      issuer: "Oracle",
      year: "2025",
      category: "Programming",
      skillsAcquired: [
        "Core Java Syntax & Types",
        "Object-Oriented Programming",
        "Inheritance & Polymorphism",
        "Exception Handling & Collections"
      ]
    }
  ],

  achievements: [
    {
      id: "coding-problems-600",
      title: "Cross-Platform Problem Solving",
      metric: "600+",
      sublabel: "Coding Problems Solved",
      description: "Solved 600+ coding problems across LeetCode, HackerRank, and GeeksforGeeks covering DSA, DP, graphs, and SQL.",
      accent: "blue",
      url: "https://leetcode.com/u/tejas_tiwari_1456/"
    },
    {
      id: "leetcode-rating",
      title: "LeetCode Contest Rating",
      metric: "1514",
      sublabel: "Peak Rating: 1538",
      description: "Achieved a LeetCode contest rating of 1514, with a peak rating of 1538 in timed competitive programming contests.",
      accent: "amber",
      url: "https://leetcode.com/u/tejas_tiwari_1456/"
    },
    {
      id: "hackerrank-stars",
      title: "HackerRank Proficiency Badges",
      metric: "5★ · 4★ · 3★",
      sublabel: "SQL · Problem Solving · Java",
      description: "Earned HackerRank 5-Star SQL, 4-Star Problem Solving, and 3-Star Java badges through verified skill benchmarks.",
      accent: "emerald",
      url: "https://www.hackerrank.com/profile/tejastiwari724"
    },
    {
      id: "jee-main-2024",
      title: "JEE Main 2024 Rank Performance",
      metric: "96.7%ile",
      sublabel: "National Engineering Entrance",
      description: "Secured 96.7 percentile in JEE Main 2024 among over a million nationwide engineering candidates.",
      accent: "indigo"
    }
  ],

  education: [
    {
      degree: "Bachelor of Technology in Computer Science (AI & ML)",
      institution: "Pranveer Singh Institute of Technology (PSIT), Kanpur",
      location: "Kanpur, Uttar Pradesh",
      duration: "2024 – 2028",
      score: "8.43/10",
      scoreLabel: "CGPA",
      details: [
        "Specialization in Artificial Intelligence and Machine Learning.",
        "Core Coursework: Data Structures & Algorithms, Object-Oriented Programming (Java), DBMS, Operating Systems.",
        "Applied engineering focus on React.js, TypeScript, Node.js, Express.js, PostgreSQL, and AI-integrated applications."
      ]
    },
    {
      degree: "Class XII – Senior Secondary (CBSE)",
      institution: "Kendriya Vidyalaya I.I.T. Kanpur",
      location: "Kanpur, Uttar Pradesh",
      duration: "2023",
      score: "93%",
      scoreLabel: "Percentage",
      details: [
        "Science Stream with Mathematics, Physics, Chemistry, and Computer Science.",
        "Secured 96.7 percentile in JEE Main 2024."
      ]
    },
    {
      degree: "Class X – Secondary School (CBSE)",
      institution: "Kendriya Vidyalaya I.I.T. Kanpur",
      location: "Kanpur, Uttar Pradesh",
      duration: "2021",
      score: "95%",
      scoreLabel: "Percentage",
      details: [
        "Comprehensive academic excellence across Mathematics, Science, and foundational computing."
      ]
    }
  ]
};
