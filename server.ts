import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  const db = new Database("maturity_survey.db");
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_name TEXT NOT NULL,
      respondent_name TEXT NOT NULL,
      category_scores TEXT NOT NULL, -- JSON string
      total_score REAL NOT NULL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/surveys", (req, res) => {
    try {
      const { teamName, respondentName, categoryScores, totalScore } = req.body;
      
      const stmt = db.prepare(`
        INSERT INTO surveys (team_name, respondent_name, category_scores, total_score)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(teamName, respondentName, JSON.stringify(categoryScores), totalScore);
      
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to save survey" });
    }
  });

  app.get("/api/surveys", (req, res) => {
    try {
      const surveys = db.prepare("SELECT * FROM surveys ORDER BY submitted_at DESC").all();
      res.json(surveys.map(s => ({
        ...s,
        category_scores: JSON.parse(s.category_scores)
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch surveys" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
