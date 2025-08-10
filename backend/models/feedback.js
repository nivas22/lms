const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    feedback: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { collection: "Feedback" }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
