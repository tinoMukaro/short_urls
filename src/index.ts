import express from "express";
import dotenv from "dotenv";
import { db } from "./db/index";
import { urls } from "./db/schema";
import { eq } from "drizzle-orm";
import cors from 'cors';


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


// Test route
app.get("/", (req, res) => {
  res.send("URL Shortener API is running ");
});

// Create short URL
app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;
  if (!originalUrl) return res.status(400).json({ error: "Missing URL" });

  // generate short code
  const code = Math.random().toString(36).substring(2, 8);

  // insert into DB
  await db.insert(urls).values({ code, originalUrl });

  res.json({ shortUrl: `http://localhost:4000/${code}` });
});

// Redirect
app.get("/:code", async (req, res) => {
  const { code } = req.params;
  const result = await db.select().from(urls).where(eq(urls.code, code));

  if (!result.length) return res.status(404).send("URL not found");

  res.redirect(result[0].originalUrl);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
