const db = require("../config/db");

const JSON_FIELDS = ["benefits", "eligibility", "documents", "application_steps", "occupation_tags"];

function parseScheme(row) {
  if (!row) return null;
  const out = { ...row };
  for (const f of JSON_FIELDS) {
    try {
      out[f] = row[f] ? JSON.parse(row[f]) : [];
    } catch {
      out[f] = [];
    }
  }
  out.is_demo_data = !!row.is_demo_data;
  return out;
}

const Scheme = {
  findById(id) {
    const row = db.prepare("SELECT * FROM schemes WHERE id = ?").get(id);
    return parseScheme(row);
  },

  search({ q, category, governmentLevel, state, status = "ACTIVE", sort = "relevant" } = {}) {
    let sql = "SELECT * FROM schemes WHERE 1=1";
    const params = [];

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    if (q) {
      sql += " AND (name LIKE ? OR description LIKE ? OR category LIKE ?)";
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    if (governmentLevel) {
      sql += " AND government_level = ?";
      params.push(governmentLevel);
    }
    if (state) {
      sql += " AND (state = ? OR state = 'All India')";
      params.push(state);
    }

    if (sort === "recent") {
      sql += " ORDER BY updated_at DESC";
    } else if (sort === "category") {
      sql += " ORDER BY category ASC, name ASC";
    } else {
      sql += " ORDER BY created_at DESC";
    }

    const rows = db.prepare(sql).all(...params);
    return rows.map(parseScheme);
  },

  listByCategory() {
    return db
      .prepare(
        "SELECT category, COUNT(*) as count FROM schemes WHERE status = 'ACTIVE' GROUP BY category"
      )
      .all();
  },

  count() {
    return db.prepare("SELECT COUNT(*) AS c FROM schemes").get().c;
  },

  create(data) {
    const info = db
      .prepare(
        `INSERT INTO schemes
          (name, description, category, benefits, eligibility, documents, application_steps,
           government_level, state, official_url, benefit_summary, min_age, max_age, max_income,
           occupation_tags, gender, status, is_demo_data)
         VALUES (@name, @description, @category, @benefits, @eligibility, @documents, @application_steps,
                 @government_level, @state, @official_url, @benefit_summary, @min_age, @max_age, @max_income,
                 @occupation_tags, @gender, @status, @is_demo_data)`
      )
      .run(serialize(data));
    return Scheme.findById(info.lastInsertRowid);
  },

  update(id, data) {
    const existing = Scheme.findById(id);
    if (!existing) return null;
    const merged = { ...existing, ...data };
    db.prepare(
      `UPDATE schemes SET
        name=@name, description=@description, category=@category, benefits=@benefits,
        eligibility=@eligibility, documents=@documents, application_steps=@application_steps,
        government_level=@government_level, state=@state, official_url=@official_url,
        benefit_summary=@benefit_summary, min_age=@min_age, max_age=@max_age, max_income=@max_income,
        occupation_tags=@occupation_tags, gender=@gender, status=@status,
        updated_at=datetime('now')
       WHERE id=@id`
    ).run({ ...serialize(merged), id });
    return Scheme.findById(id);
  },

  delete(id) {
    const info = db.prepare("DELETE FROM schemes WHERE id = ?").run(id);
    return info.changes > 0;
  },
};

function serialize(data) {
  return {
    name: data.name,
    description: data.description,
    category: data.category,
    benefits: JSON.stringify(data.benefits ?? []),
    eligibility: JSON.stringify(data.eligibility ?? []),
    documents: JSON.stringify(data.documents ?? []),
    application_steps: JSON.stringify(data.application_steps ?? []),
    government_level: data.government_level || "CENTRAL",
    state: data.state || "All India",
    official_url: data.official_url || null,
    benefit_summary: data.benefit_summary || null,
    min_age: data.min_age ?? null,
    max_age: data.max_age ?? null,
    max_income: data.max_income ?? null,
    occupation_tags: JSON.stringify(data.occupation_tags ?? []),
    gender: data.gender || "ANY",
    status: data.status || "ACTIVE",
    is_demo_data: data.is_demo_data === undefined ? 1 : data.is_demo_data ? 1 : 0,
  };
}

module.exports = Scheme;
