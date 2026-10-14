const { OpenAI } = require('openai');

// Rich expanded database of pre-seeded student projects covering diverse technical stacks
const SAMPLE_RECOMMENDATIONS = [
  // --- AI / MACHINE LEARNING / PYTHON ---
  {
    title: "Student Performance Prediction System",
    description: "An AI system that analyzes historic student records and predicts future academic performance, identifying students who might need extra assistance.",
    technologies: ["Python", "Scikit-Learn", "Pandas", "Flask", "Jupyter Notebook"],
    difficulty: "Intermediate",
    teamSize: 3,
    branch: "Computer Science",
    category: "AI / Machine Learning",
    skills: ["Python", "Machine Learning", "Data Analysis"]
  },
  {
    title: "Smart Attendance System using Face Recognition",
    description: "Automate classroom attendance using a webcam that detects, recognizes, and logs student faces into a database in real time.",
    technologies: ["Python", "OpenCV", "Face Recognition", "Flask", "SQLite"],
    difficulty: "Advanced",
    teamSize: 4,
    branch: "Computer Science",
    category: "AI / Machine Learning",
    skills: ["Python", "OpenCV", "AI/ML", "Computer Vision"]
  },
  {
    title: "Real-time Traffic Congestion Control using Computer Vision",
    description: "Analyze road camera video streams using computer vision models to dynamically estimate congestion and optimize traffic signal durations.",
    technologies: ["Python", "OpenCV", "YOLOv8", "PyTorch"],
    difficulty: "Advanced",
    teamSize: 4,
    branch: "Computer Science",
    category: "AI / Machine Learning",
    skills: ["Python", "OpenCV", "AI/ML", "Computer Vision"]
  },
  {
    title: "AI Chatbot for Academic Advising",
    description: "An intelligent dialogue assistant that answers queries regarding college electives, prerequisites, credits, and registration dates.",
    technologies: ["Python", "Natural Language Processing", "OpenAI API", "React.js", "Express.js"],
    difficulty: "Advanced",
    teamSize: 3,
    branch: "Computer Science",
    category: "AI / Machine Learning",
    skills: ["AI/ML", "NLP", "React", "Python"]
  },
  {
    title: "AI-Powered Resume Screener & Job Matcher",
    description: "Upload resumes in PDF format, extract skills, and match them against specific project postings using keyword embeddings and NLP models.",
    technologies: ["Python", "FastAPI", "SpaCy", "React.js", "Tailwind CSS"],
    difficulty: "Advanced",
    teamSize: 3,
    branch: "Computer Science",
    category: "AI / Machine Learning",
    skills: ["Python", "AI/ML", "NLP", "FastAPI", "React"]
  },
  {
    title: "Stock Market & Crypto Trend Predictor",
    description: "A machine learning pipeline that fetches real-time financial market histories and trains an LSTM neural network to predict price movement trends.",
    technologies: ["Python", "TensorFlow", "Pandas", "yfinance", "Streamlit"],
    difficulty: "Intermediate",
    teamSize: 2,
    branch: "Data Science",
    category: "AI / Machine Learning",
    skills: ["Python", "AI/ML", "Data Analysis"]
  },
  {
    title: "Medical Image Diagnostic Classifier",
    description: "A deep learning convolutional neural network (CNN) trained on chest X-rays to detect early signs of pneumonia and lung anomalies.",
    technologies: ["Python", "Keras", "TensorFlow", "FastAPI", "Docker"],
    difficulty: "Advanced",
    teamSize: 3,
    branch: "Data Science",
    category: "AI / Machine Learning",
    skills: ["Python", "TensorFlow", "AI/ML", "Deep Learning"]
  },
  {
    title: "Real Estate Price Predictor Engine",
    description: "Model geographic, dimensional, and age factors of properties using regression algorithms to estimate real estate valuation curves.",
    technologies: ["Python", "Django", "Scikit-Learn", "Pandas", "React.js"],
    difficulty: "Intermediate",
    teamSize: 3,
    branch: "Data Science",
    category: "AI / Machine Learning",
    skills: ["Python", "Django", "AI/ML", "Data Analysis"]
  },

  // --- WEB DEVELOPMENT (REACT / NODE / FULLSTACK) ---
  {
    title: "E-Commerce App with React & Node",
    description: "A fully responsive online marketplace complete with product filtering, shopping cart, user checkout, and payment gateways.",
    technologies: ["React", "Node.js", "Express.js", "MongoDB", "Tailwind CSS"],
    difficulty: "Intermediate",
    teamSize: 4,
    branch: "Computer Science",
    category: "Web Development",
    skills: ["React", "Node.js", "Express.js", "MongoDB", "Tailwind CSS", "JavaScript"]
  },
  {
    title: "Virtual Classroom & Study Hub",
    description: "A WebRTC collaborative workspace featuring audio/video calls, real-time shared whiteboards, document uploads, and dynamic text chats.",
    technologies: ["React", "Node.js", "Socket.io", "WebRTC", "Express"],
    difficulty: "Advanced",
    teamSize: 4,
    branch: "Computer Science",
    category: "Web Development",
    skills: ["React", "Node.js", "Socket.io", "WebRTC", "JavaScript"]
  },
  {
    title: "Interactive Coding Playground & Judge",
    description: "An online sandbox editor where students can write, compile, and run code in multiple languages directly in their browser.",
    technologies: ["React", "Node.js", "Docker", "Judge0 API", "Tailwind CSS"],
    difficulty: "Advanced",
    teamSize: 4,
    branch: "Computer Science",
    category: "Web Development",
    skills: ["React", "Node.js", "Docker", "JavaScript"]
  },
  {
    title: "Agile Project Management Dashboard",
    description: "A collaboration tool with interactive Kanban boards, sprint burn-down charts, member assignment roles, and progress meters.",
    technologies: ["React", "Express.js", "MongoDB", "Tailwind CSS", "Chart.js"],
    difficulty: "Intermediate",
    teamSize: 3,
    branch: "Software Engineering",
    category: "Web Development",
    skills: ["React", "Node.js", "Express.js", "MongoDB", "Tailwind CSS"]
  },
  {
    title: "Campus Event Management & Ticketing Portal",
    description: "Discover, register, and ticket college club events, complete with automated email alerts and calendar sync features.",
    technologies: ["React", "Express.js", "MongoDB", "Nodemailer", "Tailwind CSS"],
    difficulty: "Intermediate",
    teamSize: 3,
    branch: "Information Technology",
    category: "Web Development",
    skills: ["React", "Node.js", "Express.js", "MongoDB"]
  },
  {
    title: "Online Code Review & Collaborative Editor",
    description: "Collaborative text editor enabling peers to comment on specific lines of code, highlight bugs, and verify changes concurrently.",
    technologies: ["React", "Express.js", "ShareDB", "Socket.io", "MongoDB"],
    difficulty: "Advanced",
    teamSize: 4,
    branch: "Software Engineering",
    category: "Web Development",
    skills: ["React", "Node.js", "Socket.io", "JavaScript"]
  },
  {
    title: "Multiplayer Real-time Whiteboard",
    description: "Draw diagrams, place post-its, and organize team flows concurrently on an HTML5 canvas synchronized via web sockets.",
    technologies: ["HTML5 Canvas", "React.js", "Node.js", "Socket.io", "Express.js"],
    difficulty: "Intermediate",
    teamSize: 3,
    branch: "Computer Science",
    category: "Web Development",
    skills: ["React", "Node.js", "Socket.io", "JavaScript"]
  },
  {
    title: "Personal Finance & Budget Analytics Portal",
    description: "An intuitive web platform to log daily expenses, categorize transactions, set budget thresholds, and view spending breakdown charts.",
    technologies: ["Python", "Django", "SQLite", "Chart.js", "HTML/CSS"],
    difficulty: "Beginner",
    teamSize: 2,
    branch: "Information Technology",
    category: "Web Development",
    skills: ["Python", "Django", "HTML/CSS", "JavaScript"]
  },

  // --- MOBILE APP DEVELOPMENT (FLUTTER / REACT NATIVE / ANDROID) ---
  {
    title: "Mental Health & Wellness Companion App",
    description: "A mobile application offering mood tracking, daily journaling, AI sentiment analysis, and mindfulness activities for students.",
    technologies: ["Flutter", "Dart", "Firebase", "Node.js", "TensorFlow Lite"],
    difficulty: "Intermediate",
    teamSize: 3,
    branch: "Information Technology",
    category: "Mobile Apps",
    skills: ["Flutter", "Dart", "Firebase", "Mobile Development"]
  },
  {
    title: "Campus Food Delivery & Order Tracker",
    description: "A cross-platform mobile app for ordering food from campus canteens with real-time order status tracking and push notifications.",
    technologies: ["Flutter", "Dart", "Node.js", "MongoDB", "Firebase Cloud Messaging"],
    difficulty: "Intermediate",
    teamSize: 3,
    branch: "Computer Science",
    category: "Mobile Apps",
    skills: ["Flutter", "Dart", "Node.js", "Mobile Development"]
  },
  {
    title: "Language Learning App with Voice Feedback",
    description: "Interactive flashcards, pronunciation checks, and vocabulary challenges with speech-to-text feedback modules.",
    technologies: ["React Native", "Node.js", "Google Cloud Speech API", "MongoDB"],
    difficulty: "Intermediate",
    teamSize: 3,
    branch: "Computer Science",
    category: "Mobile Apps",
    skills: ["React Native", "Node.js", "Mobile Development", "JavaScript"]
  },
  {
    title: "Offline-First Student Notes & PDF Manager",
    description: "Mobile document manager enabling students to scan lecture notes, annotate PDFs, and sync when online using local encrypted SQLite storage.",
    technologies: ["React Native", "TypeScript", "SQLite", "Firebase Storage"],
    difficulty: "Intermediate",
    teamSize: 2,
    branch: "Software Engineering",
    category: "Mobile Apps",
    skills: ["React Native", "TypeScript", "Mobile Development"]
  },

  // --- CYBERSECURITY & NETWORKING ---
  {
    title: "Network Intrusion & Anomaly Detection System",
    description: "Monitor network packet traffic, analyze payload signatures, and flag suspicious IP port scans or DDoS attempts in real time.",
    technologies: ["Python", "Scapy", "Wireshark PCAP", "FastAPI", "React"],
    difficulty: "Advanced",
    teamSize: 3,
    branch: "Cybersecurity",
    category: "Cybersecurity",
    skills: ["Cybersecurity", "Networking", "Python", "Linux"]
  },
  {
    title: "Encrypted Password & Credential Vault",
    description: "Zero-knowledge password storage application with AES-256 encryption, master key derivation (PBKDF2), and auto-fill extension API.",
    technologies: ["React", "Electron", "Node.js", "CryptoJS", "SQLite"],
    difficulty: "Intermediate",
    teamSize: 2,
    branch: "Cybersecurity",
    category: "Cybersecurity",
    skills: ["Cybersecurity", "Cryptography", "React", "Node.js"]
  },
  {
    title: "Automated Web Vulnerability Scanner",
    description: "Audit target web applications for SQL Injection, XSS, CSRF, and misconfigured HTTP headers, generating detailed security patch reports.",
    technologies: ["Python", "BeautifulSoup", "Asyncio", "Docker", "Tailwind CSS"],
    difficulty: "Advanced",
    teamSize: 3,
    branch: "Cybersecurity",
    category: "Cybersecurity",
    skills: ["Cybersecurity", "Python", "Web Security"]
  },

  // --- BLOCKCHAIN & DECENTRALIZED SYSTEMS ---
  {
    title: "Blockchain-based Student Credential Verifier",
    description: "Secure, tamper-proof system for universities to issue graduation certificates, and for employers to verify them via public smart contracts.",
    technologies: ["Solidity", "Ethereum", "React", "Web3.js", "Hardhat"],
    difficulty: "Advanced",
    teamSize: 3,
    branch: "Information Technology",
    category: "Blockchain",
    skills: ["Blockchain", "Solidity", "React", "Web3"]
  },
  {
    title: "Decentralized File Storage Explorer (IPFS)",
    description: "Store files redundantly and securely using InterPlanetary File System (IPFS) and interact via a React client dashboard.",
    technologies: ["React", "IPFS API", "Web3.js", "Solidity"],
    difficulty: "Advanced",
    teamSize: 3,
    branch: "Information Technology",
    category: "Blockchain",
    skills: ["React", "Blockchain", "IPFS", "Solidity"]
  },

  // --- CLOUD, DEVOPS & SYSTEM PROGRAMMING ---
  {
    title: "Docker Container Health Monitoring Dashboard",
    description: "Collect CPU, memory, network I/O, and log streams from running Docker containers and visualize infrastructure metrics live.",
    technologies: ["Go", "Docker API", "React", "Prometheus", "Grafana"],
    difficulty: "Advanced",
    teamSize: 3,
    branch: "Software Engineering",
    category: "DevOps & Cloud",
    skills: ["DevOps", "Docker", "Go", "Cloud"]
  },
  {
    title: "Automated CI/CD Build Pipeline Monitor",
    description: "A continuous integration status monitor fetching GitHub actions triggers, tracking automated unit test results, and notifying teams on Discord.",
    technologies: ["Node.js", "Express", "GitHub REST API", "React", "Webhooks"],
    difficulty: "Intermediate",
    teamSize: 2,
    branch: "Software Engineering",
    category: "DevOps & Cloud",
    skills: ["DevOps", "Node.js", "Git", "React"]
  },
  {
    title: "High-Performance Key-Value Storage Engine in Rust",
    description: "In-memory LSM-tree backed storage engine written in Rust featuring crash recovery write-ahead logs (WAL) and client benchmarks.",
    technologies: ["Rust", "Tokio", "SERDE", "CLI"],
    difficulty: "Advanced",
    teamSize: 2,
    branch: "Computer Science",
    category: "System Programming",
    skills: ["Rust", "System Programming", "Algorithms"]
  },

  // --- JAVA / C++ / ENTERPRISE & IoT ---
  {
    title: "Library Management System",
    description: "A classic desktop application to handle cataloging, user registry, book issues, and fine tracking with a relational database backend.",
    technologies: ["Java", "Swing", "MySQL", "JDBC"],
    difficulty: "Beginner",
    teamSize: 2,
    branch: "Information Technology",
    category: "Software Systems",
    skills: ["Java", "MySQL", "Database Management"]
  },
  {
    title: "Hospital Management System",
    description: "A terminal or web-based CRUD application tracking patient registrations, doctor assignments, schedules, and billing information.",
    technologies: ["C++", "File Streams", "SQL", "Console UI"],
    difficulty: "Beginner",
    teamSize: 2,
    branch: "Software Engineering",
    category: "Software Systems",
    skills: ["C++", "OOP", "SQL"]
  },
  {
    title: "Smart Grid Energy Monitoring System",
    description: "An IoT application collecting energy consumption telemetry from smart meters and publishing load statistics to a dashboard.",
    technologies: ["IoT", "Python", "MQTT", "Raspberry Pi", "InfluxDB"],
    difficulty: "Advanced",
    teamSize: 3,
    branch: "Electrical Engineering",
    category: "IoT / Hardware",
    skills: ["IoT", "Python", "Hardware", "MQTT"]
  },
  {
    title: "IoT Smart Agriculture Irrigation System",
    description: "Deploy soil moisture, temperature, and humidity sensors connected to microcontrollers to automate crop irrigation dynamically.",
    technologies: ["IoT", "Arduino", "ESP8266", "C++", "ThingsBoard"],
    difficulty: "Intermediate",
    teamSize: 3,
    branch: "Electrical & Computer Engineering",
    category: "IoT / Hardware",
    skills: ["IoT", "Arduino", "C++", "Hardware"]
  }
];

// Generate dynamic tailored recommendations for skills provided
const generateSkillSpecificProjects = (skillName, branch = '') => {
  const cleanSkill = skillName.trim();
  const lower = cleanSkill.toLowerCase();
  
  if (lower.includes('python') || lower.includes('machine learning') || lower.includes('ai') || lower.includes('data')) {
    return [
      {
        title: `AI-Powered Data Analytics & Classification Engine in ${cleanSkill}`,
        description: `A specialized intelligence workspace leveraging ${cleanSkill} to automatically import datasets, clean missing data, perform feature extraction, and output predictive diagnostics reports.`,
        technologies: [cleanSkill, "Pandas", "Scikit-Learn", "FastAPI", "React"],
        difficulty: "Intermediate",
        teamSize: 3,
        branch: branch || "Data Science",
        category: "AI / Machine Learning",
        matchedSkill: cleanSkill,
        skills: [cleanSkill, "AI/ML", "Data Analysis"]
      },
      {
        title: `Automated Document & Image Feature Extractor using ${cleanSkill}`,
        description: `Extract structured data, tabular contents, and key text fields from unstructured PDFs and images using neural vision pipelines built with ${cleanSkill}.`,
        technologies: [cleanSkill, "PyTorch", "OpenCV", "Streamlit"],
        difficulty: "Advanced",
        teamSize: 3,
        branch: branch || "Computer Science",
        category: "AI / Machine Learning",
        matchedSkill: cleanSkill,
        skills: [cleanSkill, "AI/ML", "Computer Vision"]
      }
    ];
  }

  if (lower.includes('react') || lower.includes('javascript') || lower.includes('typescript') || lower.includes('web') || lower.includes('frontend')) {
    return [
      {
        title: `Real-time Peer Collaborative Hub built with ${cleanSkill}`,
        description: `A sleek, high-performance web portal built with ${cleanSkill} for live workspace sharing, drag-and-drop task boards, and concurrent user interaction tracking.`,
        technologies: [cleanSkill, "Node.js", "Express", "Tailwind CSS", "MongoDB"],
        difficulty: "Intermediate",
        teamSize: 3,
        branch: branch || "Computer Science",
        category: "Web Development",
        matchedSkill: cleanSkill,
        skills: [cleanSkill, "Node.js", "JavaScript", "Web Development"]
      },
      {
        title: `Dynamic Dashboard Component System in ${cleanSkill}`,
        description: `A modular dashboard suite engineered with ${cleanSkill} featuring responsive charts, custom metric widgets, dark/light theme switching, and REST API integration.`,
        technologies: [cleanSkill, "TypeScript", "Tailwind CSS", "Chart.js"],
        difficulty: "Intermediate",
        teamSize: 2,
        branch: branch || "Software Engineering",
        category: "Web Development",
        matchedSkill: cleanSkill,
        skills: [cleanSkill, "UI/UX", "JavaScript"]
      }
    ];
  }

  if (lower.includes('flutter') || lower.includes('mobile') || lower.includes('dart') || lower.includes('android') || lower.includes('ios')) {
    return [
      {
        title: `Cross-Platform Mobile Student Companion in ${cleanSkill}`,
        description: `A responsive mobile application built with ${cleanSkill} providing offline course notes access, timetable notifications, and campus interactive maps.`,
        technologies: [cleanSkill, "Dart", "Firebase", "SQLite"],
        difficulty: "Intermediate",
        teamSize: 3,
        branch: branch || "Information Technology",
        category: "Mobile Apps",
        matchedSkill: cleanSkill,
        skills: [cleanSkill, "Mobile Development", "Firebase"]
      }
    ];
  }

  if (lower.includes('security') || lower.includes('cyber') || lower.includes('network') || lower.includes('crypto')) {
    return [
      {
        title: `Security Audit & Vulnerability Assessment Dashboard (${cleanSkill})`,
        description: `An automated auditing tool using ${cleanSkill} to scan open system ports, check SSL certificate validity, and flag security compliance gaps.`,
        technologies: [cleanSkill, "Python", "FastAPI", "React", "Linux"],
        difficulty: "Advanced",
        teamSize: 3,
        branch: branch || "Cybersecurity",
        category: "Cybersecurity",
        matchedSkill: cleanSkill,
        skills: [cleanSkill, "Cybersecurity", "Networking"]
      }
    ];
  }

  if (lower.includes('devops') || lower.includes('docker') || lower.includes('cloud') || lower.includes('kubernetes')) {
    return [
      {
        title: `Automated Microservices Deployment & Monitoring in ${cleanSkill}`,
        description: `Build a containerized deployment pipeline utilizing ${cleanSkill} to automate health checks, log aggregation, and real-time container metrics visualization.`,
        technologies: [cleanSkill, "Docker", "Prometheus", "React", "Node.js"],
        difficulty: "Advanced",
        teamSize: 3,
        branch: branch || "Software Engineering",
        category: "DevOps & Cloud",
        matchedSkill: cleanSkill,
        skills: [cleanSkill, "Cloud", "DevOps"]
      }
    ];
  }

  if (lower.includes('java') || lower.includes('spring') || lower.includes('c++') || lower.includes('c#') || lower.includes('rust') || lower.includes('go')) {
    return [
      {
        title: `High-Throughput Enterprise Backend Service in ${cleanSkill}`,
        description: `A concurrent backend architecture developed in ${cleanSkill} featuring connection pooling, fast JSON serialization, and structured database transaction handling.`,
        technologies: [cleanSkill, "SQL", "REST API", "Docker"],
        difficulty: "Advanced",
        teamSize: 3,
        branch: branch || "Software Engineering",
        category: "Software Systems",
        matchedSkill: cleanSkill,
        skills: [cleanSkill, "Software Engineering", "SQL"]
      }
    ];
  }

  // Generic tailored fallback for any custom skill name (e.g. Figma, SQL, GraphQL, Next.js, etc.)
  return [
    {
      title: `${cleanSkill}-Powered Innovation Workspace`,
      description: `A specialized student collaboration platform built specifically around ${cleanSkill} best practices, providing dynamic analytics, custom templates, and real-time team workflow management.`,
      technologies: [cleanSkill, "JavaScript", "HTML5/CSS3", "REST APIs"],
      difficulty: "Intermediate",
      teamSize: 3,
      branch: branch || "Computer Science",
      category: "Specialized Stack",
      matchedSkill: cleanSkill,
      skills: [cleanSkill]
    }
  ];
};

const getAIRecommendations = async (skills = [], interests = [], branch = '') => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert AI academic advisor. Generate 8 unique, modern project recommendations for students based on their inputs. Output strictly as a JSON array of project objects: [{\"title\":\"...\",\"description\":\"...\",\"technologies\":[\"...\"],\"difficulty\":\"Beginner/Intermediate/Advanced\",\"teamSize\":3,\"category\":\"...\"}]"
            },
            {
              role: "user",
              content: `Skills: ${skills.join(', ')}. Interests: ${interests.join(', ')}. Academic Branch: ${branch}.`
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      const rawText = data.choices[0].message.content;
      const parsed = JSON.parse(rawText);
      
      const projects = Array.isArray(parsed) ? parsed : (parsed.projects || Object.values(parsed)[0]);
      if (Array.isArray(projects) && projects.length > 0) {
        return projects;
      }
    } catch (error) {
      console.warn("OpenAI API call failed, falling back to dynamic skill-matched recommender engine:", error.message);
    }
  }

  // Local Skill-Matched Generative Engine
  const userSkills = Array.isArray(skills) ? skills.map(s => s.trim()).filter(Boolean) : [];
  const dynamicGenerated = [];

  // Generate distinct recommendations for EACH skill supplied
  userSkills.forEach(skill => {
    const generatedForSkill = generateSkillSpecificProjects(skill, branch);
    dynamicGenerated.push(...generatedForSkill);
  });

  // Combine generated projects with the 30+ pre-seeded projects
  const combined = [...dynamicGenerated, ...SAMPLE_RECOMMENDATIONS];

  // Score each project against user skills, interests, and branch
  const scoredMap = new Map();

  combined.forEach(project => {
    let score = 0;
    let matchTag = project.matchedSkill || null;
    
    // Skill matches (+10 per match)
    userSkills.forEach(userSkill => {
      const isMatch = project.skills.some(s => 
        s.toLowerCase().includes(userSkill.toLowerCase()) || 
        userSkill.toLowerCase().includes(s.toLowerCase())
      ) || project.technologies.some(t => 
        t.toLowerCase().includes(userSkill.toLowerCase()) || 
        userSkill.toLowerCase().includes(t.toLowerCase())
      );
      
      if (isMatch) {
        score += 10;
        if (!matchTag) matchTag = userSkill;
      }
    });

    // Interest matches (+4 per match)
    interests.forEach(interest => {
      if (interest.trim()) {
        const isMatch = project.title.toLowerCase().includes(interest.toLowerCase()) || 
                        project.description.toLowerCase().includes(interest.toLowerCase()) ||
                        (project.category && project.category.toLowerCase().includes(interest.toLowerCase()));
        if (isMatch) score += 4;
      }
    });

    // Branch match (+5)
    if (branch && project.branch && project.branch.toLowerCase().includes(branch.toLowerCase())) {
      score += 5;
    }

    const uniqueKey = project.title.toLowerCase();
    if (!scoredMap.has(uniqueKey) || scoredMap.get(uniqueKey).score < score) {
      scoredMap.set(uniqueKey, { ...project, score, matchedSkill: matchTag });
    }
  });

  // Sort by score descending
  const sorted = Array.from(scoredMap.values()).sort((a, b) => b.score - a.score);

  // Return top 12 recommendations (or all if fewer)
  return sorted.slice(0, 12);
};

const generateSearchSuggestions = async (query = '', branch = '') => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI software architect. Generate 6 unique, modern, highly creative project suggestions/ideas matching the user\'s search query or technologies. Each suggestion must contain: title, description (detailed, 2-3 sentences), technologies (an array of strings), difficulty (Beginner, Intermediate, or Advanced), teamSize (integer, e.g. 2 to 4), and category (e.g. Web Development, Mobile Apps, AI / Machine Learning, Data Science, Blockchain, Cybersecurity, IoT / Hardware, Software Systems). Output strictly as a JSON array of projects: [{"title":"...","description":"...","technologies":["..."],"difficulty":"...","teamSize":3,"category":"..."}]'
            },
            {
              role: 'user',
              content: 'User Search query/Technologies: "' + query + '". Academic Branch context: "' + branch + '".'
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      const rawText = data.choices[0].message.content;
      const parsed = JSON.parse(rawText);
      
      const projects = Array.isArray(parsed) ? parsed : (parsed.projects || Object.values(parsed)[0]);
      if (Array.isArray(projects)) {
        return projects;
      }
    } catch (error) {
      console.warn("OpenAI search suggestions failed, using local generative fallback:", error.message);
    }
  }

  // Generative fallback for search query
  const cleanQuery = query.trim() || 'Software Systems';
  return [
    {
      title: `${cleanQuery} Collaboration & Analytics Platform`,
      description: `A next-generation collaboration ecosystem specifically designed around ${cleanQuery} tools. Features real-time dashboard analytics, secure credential sharing, and student team matchmaking rules.`,
      technologies: [cleanQuery, 'React', 'Node.js', 'Express.js', 'MongoDB'],
      difficulty: 'Intermediate',
      teamSize: 3,
      category: 'Web Development'
    },
    {
      title: `AI & Diagnostic Automation Engine for ${cleanQuery}`,
      description: `An intelligent data analytics and diagnostic classifier matching user needs for ${cleanQuery}. Includes dynamic trend graphs, regression analysis models, and responsive data export options.`,
      technologies: ['Python', cleanQuery, 'FastAPI', 'Chart.js', 'PostgreSQL'],
      difficulty: 'Advanced',
      teamSize: 3,
      category: 'AI / Machine Learning'
    },
    {
      title: `Cross-Platform Mobile Suite for ${cleanQuery}`,
      description: `A lightweight synchronization dashboard and monitoring app focusing on ${cleanQuery} workflows. Enables users to track system parameters and trigger mobile alerts.`,
      technologies: ['Flutter', cleanQuery, 'Firebase', 'Dart'],
      difficulty: 'Intermediate',
      teamSize: 3,
      category: 'Mobile Apps'
    },
    {
      title: `Security Audit & Monitoring System for ${cleanQuery}`,
      description: `A specialized vulnerability assessment and security logging portal built around ${cleanQuery} architecture to inspect traffic, audit permissions, and prevent breaches.`,
      technologies: [cleanQuery, 'Cybersecurity', 'Python', 'Docker', 'Linux'],
      difficulty: 'Advanced',
      teamSize: 3,
      category: 'Cybersecurity'
    }
  ];
};

module.exports = { getAIRecommendations, generateSearchSuggestions, SAMPLE_RECOMMENDATIONS };
