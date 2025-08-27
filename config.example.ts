// LinkedIn Easy Apply Bot - Configuration Example
// Copy this file to config.ts and fill in your actual values

export const config = {
  // LinkedIn Credentials
  LINKEDIN_EMAIL: "your-email@example.com",
  LINKEDIN_PASSWORD: "your-password",

  // Personal Information
  PHONE: "+1234567890",
  HOME_CITY: "Your City, Country",
  
  // Document Paths (use absolute paths)
  CV_PATH: "C:\\path\\to\\your\\resume.pdf",
  COVER_LETTER_PATH: "C:\\path\\to\\your\\cover-letter.pdf",

  // Experience Configuration
  YEARS_OF_EXPERIENCE: {
    "years.*experience": "5",
    "experience.*years": "5",
    "años.*experiencia": "5",
    "experiencia.*años": "5"
  },

  // Language Proficiency
  LANGUAGE_PROFICIENCY: {
    "english.*level": "Native",
    "spanish.*level": "Native", 
    "nivel.*inglés": "Native",
    "nivel.*español": "Native"
  },

  // Boolean Fields Configuration
  BOOLEANS: {
    "visa.*sponsor": false,
    "require.*visa": false,
    "authorized.*work": true,
    "eligible.*work": true,
    "background.*check": true,
    "drug.*test": true,
    "willing.*relocate": false,
    "available.*start": true
  },

  // Text Fields Configuration
  TEXT_FIELDS: {
    "salary.*expectation": "Negotiable",
    "expected.*salary": "Competitive",
    "notice.*period": "2 weeks",
    "availability": "Immediate",
    "website.*portfolio": "https://your-portfolio.com",
    "linkedin.*profile": "https://linkedin.com/in/your-profile"
  },

  // Multiple Choice Fields Configuration
  MULTIPLE_CHOICE_FIELDS: {
    "experience.*level": "Mid-Level",
    "education.*level": "Bachelor's Degree",
    "employment.*type": "Full-time",
    "work.*arrangement": "Remote",
    "nivel.*educación": "Licenciatura",
    "tipo.*empleo": "Tiempo completo"
  },

  // Visa Sponsorship
  REQUIRES_VISA_SPONSORSHIP: false
};

export default config;
