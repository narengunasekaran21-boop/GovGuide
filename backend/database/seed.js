require("dotenv").config();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

function runInTransaction(fn) {
  db.exec("BEGIN");
  try {
    fn();
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

function run() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  db.exec(schema);

  const categories = [
    { name: "Education", description: "Scholarships and education support", icon: "graduation-cap" },
    { name: "Employment", description: "Job and skill development schemes", icon: "briefcase" },
    { name: "Agriculture", description: "Support for farmers and agri-workers", icon: "wheat" },
    { name: "Healthcare", description: "Health and medical assistance", icon: "heart-pulse" },
    { name: "Women & Child Welfare", description: "Welfare schemes for women and children", icon: "users" },
    { name: "Senior Citizens", description: "Pension and elderly welfare schemes", icon: "user-round" },
    { name: "Housing", description: "Housing and shelter assistance", icon: "home" },
    { name: "Financial Assistance", description: "Direct financial support schemes", icon: "wallet" },
  ];

  const insertCategory = db.prepare(
    "INSERT OR IGNORE INTO categories (name, description, icon) VALUES (?, ?, ?)"
  );
  runInTransaction(() => {
    for (const c of categories) insertCategory.run(c.name, c.description, c.icon);
  });

  const schemeCount = db.prepare("SELECT COUNT(*) AS c FROM schemes").get().c;
  if (schemeCount === 0) {
    const schemes = [
      {
        name: "National Scholarship Program",
        description: "Financial support for eligible students pursuing higher education, covering tuition and allied costs for meritorious and economically weaker students.",
        category: "Education",
        benefits: ["Up to \u20b950,000 per year", "Covers tuition fees", "One-time book/laptop allowance"],
        eligibility: ["Must be an Indian citizen", "Must be enrolled in a recognised institution", "Family income below \u20b98,00,000 per annum"],
        documents: ["Aadhaar Card", "Income Certificate", "Bank Account Details", "Educational Certificate", "Address Proof"],
        application_steps: ["Check Eligibility", "Prepare Documents", "Visit Official Portal", "Submit Application", "Track Application"],
        government_level: "CENTRAL",
        state: "All India",
        benefit_summary: "Up to \u20b950,000",
        min_age: 16, max_age: 30, max_income: 800000,
        occupation_tags: ["student"], gender: "ANY",
      },
      {
        name: "Kisan Samman Support Scheme",
        description: "Direct income support scheme for small and marginal farmers to help meet input costs for agriculture and allied activities.",
        category: "Agriculture",
        benefits: ["\u20b96,000 per year direct transfer", "Priority access to soil health cards", "Crop insurance guidance"],
        eligibility: ["Must be an Indian citizen", "Must own cultivable agricultural land", "Small/marginal farmer category"],
        documents: ["Aadhaar Card", "Land Ownership Records", "Bank Account Details"],
        application_steps: ["Check Eligibility", "Prepare Documents", "Visit Official Portal", "Submit Application", "Track Application"],
        government_level: "CENTRAL",
        state: "All India",
        benefit_summary: "\u20b96,000/year",
        min_age: 18, max_age: 100, max_income: 400000,
        occupation_tags: ["farmer"], gender: "ANY",
      },
      {
        name: "Ayushman Health Assurance Scheme",
        description: "Health coverage scheme providing hospitalisation and treatment cost support for economically vulnerable families.",
        category: "Healthcare",
        benefits: ["Coverage up to \u20b95,00,000 per family per year", "Cashless treatment at empaneled hospitals", "Coverage for pre-existing conditions"],
        eligibility: ["Must be an Indian citizen", "Family listed under socio-economic criteria", "No existing health insurance coverage"],
        documents: ["Aadhaar Card", "Income Certificate", "Ration Card", "Family ID"],
        application_steps: ["Check Eligibility", "Prepare Documents", "Visit Official Portal", "Submit Application", "Track Application"],
        government_level: "CENTRAL",
        state: "All India",
        benefit_summary: "Up to \u20b95,00,000",
        min_age: 0, max_age: 100, max_income: 250000,
        occupation_tags: ["any"], gender: "ANY",
      },
      {
        name: "Skill India Employment Bridge",
        description: "Vocational training and employment linkage programme for young job seekers to build industry-relevant skills.",
        category: "Employment",
        benefits: ["Free skill certification", "Stipend during training", "Placement assistance"],
        eligibility: ["Age between 18 and 35", "Must be unemployed or seeking upskilling", "Minimum 10th pass"],
        documents: ["Aadhaar Card", "Educational Certificate", "Bank Account Details", "Address Proof"],
        application_steps: ["Check Eligibility", "Prepare Documents", "Visit Official Portal", "Submit Application", "Track Application"],
        government_level: "CENTRAL",
        state: "All India",
        benefit_summary: "Free training + stipend",
        min_age: 18, max_age: 35, max_income: null,
        occupation_tags: ["job_seeker"], gender: "ANY",
      },
      {
        name: "Mahila Shakti Empowerment Grant",
        description: "Support scheme for women entrepreneurs and self-help groups offering seed funding and business skill training.",
        category: "Women & Child Welfare",
        benefits: ["Seed grant up to \u20b91,00,000", "Business mentorship", "Interest-subsidised loans"],
        eligibility: ["Applicant must be a woman aged 18 or above", "Must be part of or willing to form a self-help group", "Indian citizen"],
        documents: ["Aadhaar Card", "Bank Account Details", "Business Plan (if applicable)", "Address Proof"],
        application_steps: ["Check Eligibility", "Prepare Documents", "Visit Official Portal", "Submit Application", "Track Application"],
        government_level: "STATE",
        state: "Tamil Nadu",
        benefit_summary: "Up to \u20b91,00,000",
        min_age: 18, max_age: 100, max_income: 500000,
        occupation_tags: ["entrepreneur", "self_employed"], gender: "FEMALE",
      },
      {
        name: "Senior Citizen Pension Support",
        description: "Monthly pension scheme for senior citizens without a regular source of income, ensuring basic financial security.",
        category: "Senior Citizens",
        benefits: ["\u20b92,000 monthly pension", "Priority healthcare access", "Annual health check-up"],
        eligibility: ["Age 60 years or above", "No regular pension from other sources", "Indian citizen"],
        documents: ["Aadhaar Card", "Age Proof", "Bank Account Details", "Income Certificate"],
        application_steps: ["Check Eligibility", "Prepare Documents", "Visit Official Portal", "Submit Application", "Track Application"],
        government_level: "STATE",
        state: "All India",
        benefit_summary: "\u20b92,000/month",
        min_age: 60, max_age: 120, max_income: 300000,
        occupation_tags: ["retired", "any"], gender: "ANY",
      },
      {
        name: "Affordable Housing Assistance Scheme",
        description: "Subsidised housing loan interest scheme for first-time homebuyers from economically weaker and lower-income groups.",
        category: "Housing",
        benefits: ["Interest subsidy up to 6.5%", "Support for first-time homebuyers", "Simplified loan documentation"],
        eligibility: ["Must not own a pucca house", "First-time homebuyer", "Household income within scheme limits"],
        documents: ["Aadhaar Card", "Income Certificate", "Bank Account Details", "Address Proof"],
        application_steps: ["Check Eligibility", "Prepare Documents", "Visit Official Portal", "Submit Application", "Track Application"],
        government_level: "CENTRAL",
        state: "All India",
        benefit_summary: "Up to 6.5% interest subsidy",
        min_age: 21, max_age: 100, max_income: 1800000,
        occupation_tags: ["any"], gender: "ANY",
      },
      {
        name: "Direct Financial Relief Assistance",
        description: "One-time financial assistance for individuals from economically vulnerable backgrounds facing temporary hardship.",
        category: "Financial Assistance",
        benefits: ["One-time relief of up to \u20b925,000", "Fast-track disbursal", "No collateral required"],
        eligibility: ["Household income below \u20b93,00,000", "Indian citizen", "Not availing similar central scheme benefit"],
        documents: ["Aadhaar Card", "Income Certificate", "Bank Account Details"],
        application_steps: ["Check Eligibility", "Prepare Documents", "Visit Official Portal", "Submit Application", "Track Application"],
        government_level: "STATE",
        state: "All India",
        benefit_summary: "Up to \u20b925,000",
        min_age: 18, max_age: 100, max_income: 300000,
        occupation_tags: ["any"], gender: "ANY",
      },
      {
        name: "Higher Education Merit Scholarship",
        description: "Merit-based scholarship for top-performing students entering undergraduate and postgraduate programmes.",
        category: "Education",
        benefits: ["Full tuition waiver for top rank holders", "Annual book allowance", "Mentorship programme access"],
        eligibility: ["Minimum 85% in qualifying examination", "Enrolled in a recognised institution", "Indian citizen"],
        documents: ["Aadhaar Card", "Mark Sheet", "Bank Account Details", "Educational Certificate"],
        application_steps: ["Check Eligibility", "Prepare Documents", "Visit Official Portal", "Submit Application", "Track Application"],
        government_level: "CENTRAL",
        state: "All India",
        benefit_summary: "Full tuition waiver",
        min_age: 16, max_age: 25, max_income: null,
        occupation_tags: ["student"], gender: "ANY",
      },
      {
        name: "Farmer Irrigation Support Grant",
        description: "Subsidy scheme to help farmers install micro-irrigation systems and improve water-use efficiency.",
        category: "Agriculture",
        benefits: ["Up to 55% subsidy on drip irrigation", "Technical support for installation", "Priority in water-scarce districts"],
        eligibility: ["Must own or lease agricultural land", "Willing to adopt micro-irrigation", "Indian citizen"],
        documents: ["Aadhaar Card", "Land Ownership Records", "Bank Account Details"],
        application_steps: ["Check Eligibility", "Prepare Documents", "Visit Official Portal", "Submit Application", "Track Application"],
        government_level: "STATE",
        state: "Tamil Nadu",
        benefit_summary: "Up to 55% subsidy",
        min_age: 18, max_age: 100, max_income: null,
        occupation_tags: ["farmer"], gender: "ANY",
      },
      {
        name: "Child Nutrition & Welfare Program",
        description: "Nutritional support and health monitoring programme for children under six and expecting mothers.",
        category: "Women & Child Welfare",
        benefits: ["Free nutritional supplements", "Regular health check-ups", "Growth monitoring"],
        eligibility: ["Children below 6 years or expecting/nursing mothers", "Registered at local anganwadi centre", "Indian citizen"],
        documents: ["Aadhaar Card", "Birth Certificate (for children)", "Address Proof"],
        application_steps: ["Check Eligibility", "Prepare Documents", "Visit Official Portal", "Submit Application", "Track Application"],
        government_level: "CENTRAL",
        state: "All India",
        benefit_summary: "Free nutrition support",
        min_age: 0, max_age: 45, max_income: null,
        occupation_tags: ["any"], gender: "FEMALE",
      },
      {
        name: "Startup & Self-Employment Loan Scheme",
        description: "Collateral-free loan scheme to encourage self-employment and small business creation among youth.",
        category: "Employment",
        benefits: ["Loans up to \u20b910,00,000", "Collateral-free for first-time borrowers", "Reduced interest rate"],
        eligibility: ["Age between 18 and 45", "Viable business plan", "Indian citizen"],
        documents: ["Aadhaar Card", "Business Plan", "Bank Account Details", "Address Proof"],
        application_steps: ["Check Eligibility", "Prepare Documents", "Visit Official Portal", "Submit Application", "Track Application"],
        government_level: "CENTRAL",
        state: "All India",
        benefit_summary: "Loans up to \u20b910,00,000",
        min_age: 18, max_age: 45, max_income: null,
        occupation_tags: ["self_employed", "entrepreneur", "job_seeker"], gender: "ANY",
      },
    ];

    const insertScheme = db.prepare(`
      INSERT INTO schemes
        (name, description, category, benefits, eligibility, documents, application_steps,
         government_level, state, official_url, benefit_summary, min_age, max_age, max_income,
         occupation_tags, gender, status, is_demo_data)
      VALUES (@name, @description, @category, @benefits, @eligibility, @documents, @application_steps,
              @government_level, @state, @official_url, @benefit_summary, @min_age, @max_age, @max_income,
              @occupation_tags, @gender, 'ACTIVE', 1)
    `);

    runInTransaction(() => {
      for (const s of schemes) {
        insertScheme.run({
          ...s,
          benefits: JSON.stringify(s.benefits),
          eligibility: JSON.stringify(s.eligibility),
          documents: JSON.stringify(s.documents),
          application_steps: JSON.stringify(s.application_steps),
          occupation_tags: JSON.stringify(s.occupation_tags),
          official_url: null,
          max_income: s.max_income ?? null,
        });
      }
    });
    console.log(`Seeded ${schemes.length} demo schemes.`);
  } else {
    console.log("Schemes already present, skipping scheme seed.");
  }

  // Seeded admin account (development only)
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@govguide.demo";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";
  const adminName = process.env.SEED_ADMIN_NAME || "GovGuide Admin";

  const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
  if (!existingAdmin) {
    const hash = bcrypt.hashSync(adminPassword, 12);
    db.prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'ADMIN')"
    ).run(adminName, adminEmail, hash);
    console.log(`Seeded ADMIN account: ${adminEmail} (development only — change this password immediately).`);
  } else {
    console.log("Admin account already exists, skipping.");
  }
}

run();
