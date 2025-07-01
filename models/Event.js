// models/Event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: String,
    name: String,
    creatorId: mongoose.Schema.Types.ObjectId, // user._id
    dateTime: Date,
    location: String,
    description: String,
    attendeeCount: { type: Number, default: 0 },
    joinedUsers: [String], // array of user IDs
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
