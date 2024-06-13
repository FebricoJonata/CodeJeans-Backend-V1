import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import chatbotRouter from "./chatbot.js";
import sentimentAnalysisRouter from "./sentiment-analysis.js";
import usersRouter from "./user.js";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => res.send("Express on Vercel Server"));
app.use("/api/chat", chatbotRouter);
app.use("/api/analyze", sentimentAnalysisRouter);
app.use("/api/users", usersRouter);

app.listen(3000, () => console.log("Server ready on port 3000."));
