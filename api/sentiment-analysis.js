import { config as dotenvConfig } from "dotenv";
import express from "express";
import {
  TextAnalyticsClient,
  AzureKeyCredential,
} from "@azure/ai-text-analytics";

dotenvConfig();

const textAnalysisRouter = express.Router();

const client = new TextAnalyticsClient(
  process.env.SENTIMENT_ANALYSIS_URL,
  new AzureKeyCredential(process.env.SENTIMENT_ANALYSIS_KEY)
);

textAnalysisRouter.post("/sentiment-analysis", async (req, res) => {
  const { documents } = req.body;

  if (!documents || !Array.isArray(documents)) {
    return res
      .status(400)
      .json({ error: "Invalid input. 'documents' should be an array." });
  }

  try {
    const results = await client.analyzeSentiment(documents);

    const response = results.map((result, index) => {
      if (result.error === undefined) {
        return {
          text: documents[index],
          sentiment: result.sentiment,
          scores: result.confidenceScores,
        };
      } else {
        return { error: result.error, text: documents[index] };
      }
    });

    res.json(response);
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    res.status(500).json({ error: "Failed to analyze sentiment." });
  }
});

textAnalysisRouter.post("/summary", async (req, res) => {
  const { conversation } = req.body;

  if (!conversation || !Array.isArray(conversation)) {
    return res
      .status(400)
      .json({ error: "Invalid input. 'conversation' should be an array." });
  }

  try {
    const results = await client.extractKeyPhrases(conversation);

    const response = results.map((result, index) => {
      if (result.error === undefined) {
        // Extracted key phrases for the current document
        const keyPhrases = result.keyPhrases;

        // Combine all key phrases into a single summary
        const combinedSummary = keyPhrases.join(" ");

        return {
          summary: combinedSummary,
        };
      } else {
        return { error: result.error, text: conversation[index] };
      }
    });

    res.json(response);
  } catch (error) {
    console.error("Error summarizing text:", error);
    res.status(500).json({ error: "Failed to summarize text." });
  }
});

export default textAnalysisRouter;
