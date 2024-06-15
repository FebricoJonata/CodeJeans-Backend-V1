import { Groq } from "groq-sdk";
import { config as dotenvConfig } from "dotenv";
import express from "express";
import { createClient } from "@supabase/supabase-js";
dotenvConfig();

const chatbotRouter = express.Router();

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let conversationHistory = [];

chatbotRouter.post("/chat-completion", async (req, res) => {
  try {
    const { conversation } = req.body;

    const contentValue = conversation[0].content;

    checkUserCurrentSentiment(contentValue);

    // Ensure conversation is an array
    const messages = Array.isArray(conversation)
      ? conversation
      : [conversation];

    // Add current conversation to history
    conversationHistory = [...conversationHistory, ...messages];

    const chatCompletion = await getGroqChatCompletion(conversationHistory);

    res.json({ message: chatCompletion.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error("Error" + error);
    res.status(500).send({ error: "An error occurred" });
  }
});

async function getGroqChatCompletion(conversation) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are customer service assistant that help answering user question. Your name is Hanni. ",
      },
      {
        role: "system",
        content:
          "You are able to detect any language then answer user by language that they used. You must act friendly customer service",
      },
      ...conversation,
    ],
    model: "llama3-8b-8192",
    temperature: 0.5,
    max_tokens: 1024,
    top_p: 0.5,
    // stream: true,
    // stop: null,
  });
}

export default chatbotRouter;
