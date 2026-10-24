const mongoose = require("mongoose");
const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  description: { type: String, required: true, trim: true, minlength: 1, maxlength: 12000 },
  tag: { type: String, default: "General", trim: true, maxlength: 40 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model("note", NoteSchema);
