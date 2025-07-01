const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const requireAuth = require("../middleware/authMiddleware");
const router = express.Router();

// POST /register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    // If user exists, return error
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    // Hash the password
    const hashed = await bcrypt.hash(password, 10);
    // Create a new user
    await User.create({ name, email, password: hashed, photoURL });

    return res
      .status(201)
      .json({ message: "User registered successfully, Please log in!" });
  } catch (err) {
    console.error("Registration error:", err);
    return res
      .status(500)
      .json({ error: "Registration failed", detail: err.message });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    //check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Check if password matches
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "Lax",
        secure: false, 
      })
      .json({
        message: "Login successful",
        user: { name: user.name, photoURL: user.photoURL },
      });
  } catch (err) {
    res.status(500).json({ error: "Login failed", detail: err.message });
  }
});

// GET /me
router.get("/me", requireAuth, async (req, res) => {
  // Get the user from the database
  const user = await User.findById(req.user.id).select("name photoURL");
  res.json(user);
});

// POST /logout
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully!" });
});

module.exports = router;
