import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import chatbotRouter from "./chatbot.js";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => res.send("Express on Vercel Server"));
app.use("/api/chat", chatbotRouter);

app.listen(3000, () => console.log("Server ready on port 3000."));
