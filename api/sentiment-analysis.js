import { config as dotenvConfig } from "dotenv";
import express from "express";
import {
  TextAnalyticsClient,
  AzureKeyCredential,
} from "@azure/ai-text-analytics";

dotenvConfig();

const sentimentAnalysisRouter = express.Router();

const client = new TextAnalyticsClient(
  process.env.SENTIMENT_ANALYSIS_URL,
  new AzureKeyCredential(process.env.SENTIMENT_ANALYSIS_KEY)
);

sentimentAnalysisRouter.post("/", async (req, res) => {
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

export default sentimentAnalysisRouter;
