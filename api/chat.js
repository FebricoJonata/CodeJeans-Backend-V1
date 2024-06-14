import express from "express";
import { config as dotenvConfig } from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenvConfig();

const chatRouter = express.Router();

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

chatRouter.get("/chat-rooms", async (req, res) => {
  try {
    const { user_id } = req.body;
    let data;

    if (user_id) {
      data = await db
        .from("t_chat_room_members")
        .select("chat_room_id, users:user_id(user_id, name)")
        .eq("user_id", user_id);
    }

    return res.status(200).json({
      body: data,
    });
  } catch (error) {
    console.error("Error retrieving Chat Room:", error.message);
    return res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
});

chatRouter.get("/all", async (req, res) => {
  try {
    const { chat_room_id } = req.body;
    let data;

    if (chat_room_id) {
      data = await db
        .from("t_chat")
        .select("*")
        .eq("chat_room_id", chat_room_id);
    }

    return res.status(200).json({
      body: data,
    });
  } catch (error) {
    console.error("Error retrieving Chats:", error.message);
    return res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
});

export default chatRouter;
