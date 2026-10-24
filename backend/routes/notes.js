const express = require("express");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const router = express.Router();
router.use(fetchuser);

function validationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
    return true;
  }
  return false;
}
const noteRules = [
  body("title").trim().isLength({ min: 2, max: 120 }).withMessage("Title must be between 2 and 120 characters."),
  body("description").trim().isLength({ min: 1, max: 12000 }).withMessage("Write a description for your note."),
  body("tag").optional({ nullable: true }).isString().isLength({ max: 40 }).withMessage("Tag must be 40 characters or fewer.")
];

router.get("/fetchallnotes", async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1, date: -1 });
    return res.json(notes);
  } catch (error) {
    console.error("Fetch notes error:", error.message);
    return res.status(500).json({ error: "Could not load your notes." });
  }
});

router.post("/addnote", noteRules, async (req, res) => {
  if (validationErrors(req, res)) return;
  try {
    const note = await Note.create({
      user: req.user.id,
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      tag: (req.body.tag || "General").trim() || "General"
    });
    return res.status(201).json(note);
  } catch (error) {
    console.error("Create note error:", error.message);
    return res.status(500).json({ error: "Could not save this note." });
  }
});

router.put("/updatenote/:id", noteRules, async (req, res) => {
  if (validationErrors(req, res)) return;
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { title: req.body.title.trim(), description: req.body.description.trim(), tag: (req.body.tag || "General").trim() || "General" } },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ error: "Note not found." });
    return res.json(note);
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ error: "Invalid note ID." });
    console.error("Update note error:", error.message);
    return res.status(500).json({ error: "Could not update this note." });
  }
});

router.delete("/deletenote/:id", async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ error: "Note not found." });
    return res.json({ success: true, id: req.params.id });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ error: "Invalid note ID." });
    console.error("Delete note error:", error.message);
    return res.status(500).json({ error: "Could not delete this note." });
  }
});

module.exports = router;
