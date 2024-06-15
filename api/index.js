import express from "express";
import cors from "cors";
import { verifyToken } from "./helpers/jwtMiddleware.js";
import bodyParser from "body-parser";
import chatbotRouter from "./chatbot.js";
import sentimentAnalysisRouter from "./sentiment-analysis.js";
import usersRouter from "./user.js";
import chatRouter from "./chat.js";
import feedbackRouter from "./feedback.js";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => res.send("Express on Vercel Server"));
app.use("/api/chat", chatbotRouter);
app.use("/api/text", sentimentAnalysisRouter);
app.use("/api/users", usersRouter);
app.use("/api/chat", chatRouter);
app.use("/api/feedback", verifyToken, feedbackRouter);

app.listen(3000, () => console.log("Server ready on port 3000."));
