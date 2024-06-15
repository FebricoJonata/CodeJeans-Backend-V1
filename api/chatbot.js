import { Groq } from "groq-sdk";
import { config as dotenvConfig } from "dotenv";
import express from "express";
import { createClient } from "@supabase/supabase-js";
import {
  TextAnalyticsClient,
  AzureKeyCredential,
} from "@azure/ai-text-analytics";

dotenvConfig();

const chatbotRouter = express.Router();

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const client = new TextAnalyticsClient(
  process.env.SENTIMENT_ANALYSIS_URL,
  new AzureKeyCredential(process.env.SENTIMENT_ANALYSIS_KEY)
);

let conversationHistory = [];

chatbotRouter.post("/chat-completion", async (req, res) => {
  try {
    const { conversation, user_id } = req.body;

    const contentValue = conversation.map((item) => item.content);
    const results = await client.analyzeSentiment(contentValue);

    if (user_id) {
      const currentDate = new Date().toISOString().split("T")[0];
      const { data, error } = await db
        .from("t_feedback")
        .insert([
          {
            feedback: contentValue[0],
            category: results[0].sentiment,
            created_at: currentDate,
            user_id,
          },
        ])
        .select();
    }

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
          "You are able to detect any language then answer user by language that they used.",
      },
      {
        role: "system",
        content:
          "You mustn't reply with no message if you don't understand what the user said.",
      },
      {
        role: "system",
        content:
          "If the user asks you about something out of your knowledge as customer service, Don't try to answer them if that irrelevant with you jobdesc as customer service.",
      },
      ...conversation,
    ],
    model: "llama3-8b-8192",
    temperature: 0.3,
    max_tokens: 1024,
    top_p: 0.5,
    // stream: true,
    // stop: null,
  });
}

export default chatbotRouter;
