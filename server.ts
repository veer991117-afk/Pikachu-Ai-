import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // Gemini API client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Chatbot API endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: "You are Pikachu AI, a helpful, professional, and efficient AI assistant. Keep responses direct, clear, and concise. Avoid excessive Pokémon-themed roleplay or references. When asked about your creator, professionally state that you were developed by the expert software engineer Rajeev Thakur.",
        },
      });

      const response = await chat.sendMessage({ message });
      res.json({ reply: response.text });
    } catch (error) {
      console.error("Error in chat API:", error);
      res.status(500).json({ error: "Failed to communicate with Pikachu AI." });
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
