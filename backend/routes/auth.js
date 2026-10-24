const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

function makeToken(user) {
  return jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
function validationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
    return true;
  }
  return false;
}

router.post("/", [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters."),
  body("email").isEmail().withMessage("Enter a valid email address."),
  body("password").isLength({ min: 6 }).withMessage("Password must contain at least 6 characters.")
], async (req, res) => {
  if (validationErrors(req, res)) return;
  try {
    const email = req.body.email.toLowerCase().trim();
    if (await User.findOne({ email })) return res.status(409).json({ error: "An account with this email already exists." });
    const password = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({ name: req.body.name.trim(), email, password });
    return res.status(201).json({ authToken: makeToken(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "An account with this email already exists." });
    console.error("Signup error:", error.message);
    return res.status(500).json({ error: "Could not create your account. Please try again." });
  }
});

router.post("/login", [
  body("email").isEmail().withMessage("Enter a valid email address."),
  body("password").notEmpty().withMessage("Enter your password.")
], async (req, res) => {
  if (validationErrors(req, res)) return;
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ error: "Email or password is incorrect." });
    }
    return res.json({ authToken: makeToken(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ error: "Could not sign in. Please try again." });
  }
});

router.get("/me", require("../middleware/fetchuser"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email");
    if (!user) return res.status(404).json({ error: "Account not found." });
    return res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (_error) {
    return res.status(500).json({ error: "Could not load your account." });
  }
});

module.exports = router;
