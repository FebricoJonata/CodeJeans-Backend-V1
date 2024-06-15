import express from "express";
import { config as dotenvConfig } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "./helpers/jwtMiddleware.js";
dotenvConfig();

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const feedbackRouter = express.Router();

feedbackRouter.post("/all", verifyToken, async (req, res) => {
  try {
    const { user_id } = req.body;
    let data;

    if (user_id) {
      data = await db.from("t_feedback").select("*").eq("user_id", user_id);
    } else {
      data = await db.from("t_feedback").select("*");
    }

    return res.status(200).json({
      body: data,
    });
  } catch (error) {
    console.error("Error retrieving feedback:", error.message);
    return res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
});

feedbackRouter.get("/all", verifyToken, async (req, res) => {
  try {
    const { user_id } = req.body;
    let data;

    if (user_id) {
      data = await db.from("t_feedback").select("*").eq("user_id", user_id);
    } else {
      data = await db.from("t_feedback").select("*");
    }

    return res.status(200).json({
      body: data,
    });
  } catch (error) {
    console.error("Error retrieving feedback:", error.message);
    return res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
});

export default feedbackRouter;
