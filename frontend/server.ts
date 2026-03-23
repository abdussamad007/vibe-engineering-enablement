import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), "..", ".env") });

const db = new Database("../maturity_survey.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS surveys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_name TEXT NOT NULL,
    respondent_name TEXT NOT NULL,
    category_scores TEXT NOT NULL,
    total_score REAL NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes (Mocking Java Backend for Preview)
  app.get("/api/surveys", (req, res) => {
    try {
      const surveys = db.prepare("SELECT * FROM surveys ORDER BY submitted_at DESC").all();
      res.json(surveys.map((s: any) => ({
        id: s.id,
        teamName: s.team_name,
        respondentName: s.respondent_name,
        categoryScores: s.category_scores, 
        totalScore: s.total_score,
        submittedAt: s.submitted_at
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch surveys" });
    }
  });

  app.post("/api/surveys", (req, res) => {
    try {
      const { teamName, respondentName, categoryScores, totalScore } = req.body;
      
      const stmt = db.prepare(`
        INSERT INTO surveys (team_name, respondent_name, category_scores, total_score)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(teamName, respondentName, categoryScores, totalScore);
      
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to save survey" });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
