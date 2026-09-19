const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error.message);
    });

const userSchema = new mongoose.Schema({

    name: String,

    email: {
        type: String,
        unique: true
    },

    password: String

});

const User = mongoose.model("User", userSchema);

const practiceSchema = new mongoose.Schema({

    userName: String,

    userEmail: String,

    question: String,

    answer: String,

    score: Number,

    createdAt: {
        type: Date,
        default: Date.now
    }

});

const Practice = mongoose.model("Practice", practiceSchema);

const interviewSchema = new mongoose.Schema({

    userName: {
        type: String,
        default: "Guest"
    },

    userEmail: {
        type: String,
        default: ""
    },

    type: {
        type: String,
        default: "HR"
    },

    score: {
        type: Number,
        default: 0
    },

    communication: {
        type: Number,
        default: 0
    },

    technical: {
        type: Number,
        default: 0
    },

    problemSolving: {
        type: Number,
        default: 0
    },

    confidence: {
        type: Number,
        default: 0
    },

    feedback: {
        type: String,
        default: "Your interview has been evaluated based on your answers."
    },

    answers: [
        {
            question: String,
            answer: String
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    }

});

const Interview = mongoose.model(
    "Interview",
    interviewSchema
);

app.get("/", (req, res) => {

    res.json({
        message: "InterviewIQ Backend is running!"
    });

});

app.post("/api/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        const existingUser =
            await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                message: "User already exists"
            });

        }

        const user = await User.create({

            name,

            email,

            password

        });

        res.status(201).json({

            message: "Registration successful",

            user: {

                name: user.name,

                email: user.email

            }

        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({

            message: "Registration failed"

        });

    }

});

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({

            email: email,

            password: password

        });

        if (!user) {

            return res.status(401).json({

                message: "Invalid email or password"

            });

        }

        res.json({

            message: "Login successful",

            user: {

                name: user.name,

                email: user.email

            }

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({

            message: "Login failed"

        });

    }

});

app.post("/api/practice", async (req, res) => {

    try {

        const practice =
            await Practice.create(req.body);

        res.status(201).json({

            message: "Practice saved successfully",

            practice

        });

    } catch (error) {

        console.error(
            "Practice save error:",
            error
        );

        res.status(500).json({

            message: "Error saving practice"

        });

    }

});

app.get("/api/practice", async (req, res) => {

    try {

        const { email, userEmail } = req.query;

        const filter = {};

        if (userEmail || email) {

            filter.userEmail =
                userEmail || email;

        }

        const practices = await Practice
            .find(filter)
            .sort({ createdAt: -1 });

        res.json(practices);

    } catch (error) {

        console.error(
            "Practice fetch error:",
            error
        );

        res.status(500).json({

            message: "Error getting practice data"

        });

    }

});

app.post("/api/interviews", async (req, res) => {

    try {

        const {

            userName,

            userEmail,

            email,

            type,

            score,

            communication,

            technical,

            problemSolving,

            confidence,

            feedback,

            answers

        } = req.body;

        const interview =
            await Interview.create({

                userName:
                    userName || "Guest",

                userEmail:
                    userEmail || email || "",

                type:
                    type || "HR",

                score:
                    Number(score) || 0,

                communication:
                    Number(communication) || 0,

                technical:
                    Number(technical) || 0,

                problemSolving:
                    Number(problemSolving) || 0,

                confidence:
                    Number(confidence) || 0,

                feedback:
                    feedback ||
                    "Your interview has been evaluated based on your answers.",

                answers:
                    answers || []

            });

        res.status(201).json({

            message: "Interview saved successfully",

            interview

        });

    } catch (error) {

        console.error(
            "Error saving interview:",
            error
        );

        res.status(500).json({

            message: "Error saving interview"

        });

    }

});

app.get("/api/interviews", async (req, res) => {

    try {

        const { email, userEmail } = req.query;

        const currentEmail =
            userEmail || email;

        if (!currentEmail) {

            return res.status(400).json({

                message: "User email is required"

            });

        }

        const interviews = await Interview
            .find({
                userEmail: currentEmail
            })
            .sort({ createdAt: -1 });

        res.json(interviews);

    } catch (error) {

        console.error(
            "Interview fetch error:",
            error
        );

        res.status(500).json({

            message: "Error getting interviews"

        });

    }

});

app.get("/api/analytics", async (req, res) => {

    try {

        const { email, userEmail } = req.query;

        const currentEmail =
            userEmail || email;

        if (!currentEmail) {

            return res.status(400).json({

                message: "User email is required"

            });

        }

        const interviews =
            await Interview.find({
                userEmail: currentEmail
            });

        if (interviews.length === 0) {

            return res.json({

                totalInterviews: 0,

                averageScore: 0,

                bestScore: 0

            });

        }

        const totalInterviews =
            interviews.length;

        const validScores =
            interviews.map(interview =>
                Number(interview.score) || 0
            );

        const totalScore =
            validScores.reduce(
                (sum, score) => sum + score,
                0
            );

        const averageScore =
            Math.round(
                totalScore / totalInterviews
            );

        const bestScore =
            Math.max(...validScores);

        res.json({

            totalInterviews,

            averageScore,

            bestScore

        });

    } catch (error) {

        console.error(
            "Analytics error:",
            error
        );

        res.status(500).json({

            message: "Analytics error"

        });

    }

});

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});
