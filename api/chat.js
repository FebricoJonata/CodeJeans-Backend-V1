import express from "express";
import { config as dotenvConfig } from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenvConfig();

const chatRouter = express.Router();

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

chatRouter.post("/chat-rooms", async (req, res) => {
  try {
    const { user_id } = req.body;
    let data;

    if (user_id) {
      data = await db
        .from("t_chat_room_members")
        .select("chat_room:chat_room_id(chat_room_id, room_name)")
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

chatRouter.post("/create", async (req, res) => {
  try {
    const { chat_room_id, message, sender_id } = req.body;

    if (!sender_id) {
      return res.status(400).json({
        status: 400,
        error: "sender_id are required",
      });
    }

    const { data: userData, error: userError } = await db
      .from("m_users")
      .select("role")
      .eq("user_id", sender_id)
      .limit(1);

    // Get current date in yyyy-mm-dd format
    const currentDate = new Date().toISOString().split("T")[0];

    const { data, error } = await db
      .from("t_chat")
      .insert([{ chat_room_id, message, sender_id, sent_at: currentDate }])
      .select();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      status: 200,
      body: data,
    });
  } catch (error) {
    console.error("Error inserting chat:", error.message);
    return res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
});

export default chatRouter;
