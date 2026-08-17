const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) =>
    console.log("MongoDB connection failed:", error.message)
  );

// Interview model
const Interview = mongoose.model(
  "Interview",
  new mongoose.Schema({
    userName: String,
    type: String,
    score: Number,
    communication: Number,
    technical: Number,
    problemSolving: Number,
    confidence: Number,
    feedback: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  })
);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "InterviewIQ Backend is running!"
  });
});

// Save interview result
app.post("/api/interviews", async (req, res) => {
  try {
    const interview = await Interview.create(req.body);

    res.status(201).json({
      message: "Interview saved successfully",
      interview
    });
  } catch (error) {
    console.error("SAVE ERROR:", error);

    res.status(500).json({
      message: "Error saving interview",
      error: error.message
    });
  }
});

// Get interview results
app.get("/api/interviews", async (req, res) => {
  try {
    const interviews = await Interview.find().sort({
      createdAt: -1
    });

    res.json(interviews);
  } catch (error) {
    console.error("GET ERROR:", error);

    res.status(500).json({
      message: "Error getting interviews",
      error: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
// Analytics API
app.get("/api/analytics", async (req, res) => {
  try {
    const interviews = await Interview.find();

    if (interviews.length === 0) {
      return res.json({
        totalInterviews: 0,
        averageScore: 0,
        bestScore: 0,
        averageCommunication: 0,
        averageTechnical: 0,
        averageProblemSolving: 0,
        averageConfidence: 0
      });
    }

    const totalInterviews = interviews.length;

    const average = (field) =>
      Math.round(
        interviews.reduce((sum, interview) => {
          return sum + (interview[field] || 0);
        }, 0) / totalInterviews
      );

    const scores = interviews.map((interview) => interview.score || 0);

    res.json({
      totalInterviews,
      averageScore: average("score"),
      bestScore: Math.max(...scores),
      averageCommunication: average("communication"),
      averageTechnical: average("technical"),
      averageProblemSolving: average("problemSolving"),
      averageConfidence: average("confidence")
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);

    res.status(500).json({
      message: "Error getting analytics",
      error: error.message
    });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});