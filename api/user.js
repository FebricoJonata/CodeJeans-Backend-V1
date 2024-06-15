import express from "express";
import { config as dotenvConfig } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenvConfig();
const usersRouter = express.Router();

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

usersRouter.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    let fetchUsers;

    if (email) {
      fetchUsers = await db
        .from("m_users")
        .select("user_id, name, email, role")
        .eq("email", email);
    } else {
      fetchUsers = await db
        .from("m_users")
        .select("user_id, name, email, role");
    }

    return res.status(200).json({
      body: fetchUsers,
    });
  } catch (error) {
    console.error("Error retrieving users:", error.message);
    return res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
});

usersRouter.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if the user already exists
    const { data: existingUsers } = await db
      .from("m_users")
      .select("*")
      .eq("email", email);

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into Supabase users table
    const { data: newUser } = await db
      .from("m_users")
      .insert([
        {
          name,
          email,
          role,
          password: hashedPassword,
        },
      ])
      .select("user_id, name, email, role");

    return res
      .status(200)
      .json({ message: "User signed up successfully.", data: newUser });
  } catch (error) {
    console.error("Error signing up user:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

usersRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch user data from Supabase table
    const { data: users, error } = await db
      .from("m_users")
      .select("user_id, name, email, password, role")
      .eq("email", email)
      .limit(1);

    // Handle fetch errors

    if (error) {
      console.error("Error fetching user data:", error.message);
      return res.status(500).json({ error: "Internal server error." });
    }

    // Check if user exists and passwords match
    if (!users || users.length === 0) {
      return res
        .status(401)
        .json({ error: "Unauthorized, incorrect email or password." });
    }

    const user = users[0];

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ error: "Unauthorized, incorrect email or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "36h",
      }
    );

    // Return user data and JWT token
    return res.status(200).json({
      code: "200",
      message: "User signed in successfully.",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error signing in user:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default usersRouter;
