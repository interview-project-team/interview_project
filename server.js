const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// ================= MONGODB CONNECTION =================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error.message);
    });


// ================= USER SCHEMA =================

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);


// ================= INTERVIEW SCHEMA =================

const interviewSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            trim: true
        },
        userEmail: {
            type: String,
            trim: true
        },
        question: {
            type: String,
            default: ""
        },
        answer: {
            type: String,
            default: ""
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        interviewType: {
            type: String,
            default: "HR Interview"
        },
        status: {
            type: String,
            default: "Completed"
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

const Interview = mongoose.model("Interview", interviewSchema);


// ================= REGISTER =================

app.post("/api/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        const userEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: userEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username: username.trim(),
            email: userEmail,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "Account created successfully"
        });

    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
});


// ================= LOGIN =================

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const userEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: userEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password"
            });
        }

        res.json({
            success: true,
            message: "Welcome back!",
            user: {
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
});


// ================= GET USER =================

app.get("/api/user/:email", async (req, res) => {
    try {
        const email = req.params.email.toLowerCase().trim();

        const user = await User.findOne({
            email: email
        }).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: {
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// ================= SAVE INTERVIEW =================

app.post("/api/interviews", async (req, res) => {
    try {
        const {
            userName,
            username,
            userEmail,
            email,
            question,
            answer,
            score,
            interviewType,
            type,
            status
        } = req.body;

        const finalUserName = userName || username;
        const finalEmail = userEmail || email;
        const finalType = interviewType || type || "HR Interview";

        if (!finalUserName) {
            return res.status(400).json({
                success: false,
                message: "Username is required"
            });
        }

        if (score === undefined || score === null) {
            return res.status(400).json({
                success: false,
                message: "Score is required"
            });
        }

        const numericScore = Number(score);

        if (
            Number.isNaN(numericScore) ||
            numericScore < 0 ||
            numericScore > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Score must be between 0 and 100"
            });
        }

        const interview = new Interview({
            userName: finalUserName,
            userEmail: finalEmail,
            question: question || "",
            answer: answer || "",
            score: numericScore,
            interviewType: finalType,
            status: status || "Completed"
        });

        await interview.save();

        res.status(201).json({
            success: true,
            message: "Interview saved successfully",
            interview: interview
        });

    } catch (error) {
        console.error("Save interview error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save interview"
        });
    }
});


// ================= GET INTERVIEWS =================

app.get("/api/interviews", async (req, res) => {
    try {
        const { userName, username, email } = req.query;

        const finalUserName = userName || username;

        let filter = {};

        if (finalUserName) {
            filter.userName = finalUserName;
        }

        if (email) {
            filter.userEmail = email.toLowerCase().trim();
        }

        const interviews = await Interview
            .find(filter)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            interviews: interviews
        });

    } catch (error) {
        console.error("Get interviews error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch interviews"
        });
    }
});


// ================= ANALYTICS =================

app.get("/api/analytics", async (req, res) => {
    try {
        const { userName, username, email } = req.query;

        const finalUserName = userName || username;

        let filter = {};

        if (finalUserName) {
            filter.userName = finalUserName;
        }

        if (email) {
            filter.userEmail = email.toLowerCase().trim();
        }

        const interviews = await Interview.find(filter)
            .sort({ createdAt: 1 });

        const totalInterviews = interviews.length;

        if (totalInterviews === 0) {
            return res.json({
                success: true,
                totalInterviews: 0,
                averageScore: 0,
                bestScore: 0,
                improvement: 0
            });
        }

        const scores = interviews.map(
            interview => Number(interview.score)
        );

        const totalScore = scores.reduce(
            (sum, score) => sum + score,
            0
        );

        const averageScore = Math.round(
            totalScore / totalInterviews
        );

        const bestScore = Math.max(...scores);

        let improvement = 0;

        if (scores.length >= 2) {
            const firstScore = scores[0];
            const latestScore = scores[scores.length - 1];

            if (firstScore > 0) {
                improvement = Math.round(
                    ((latestScore - firstScore) / firstScore) * 100
                );
            } else {
                improvement = latestScore;
            }
        }

        res.json({
            success: true,
            totalInterviews,
            averageScore,
            bestScore,
            improvement
        });

    } catch (error) {
        console.error("Analytics error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch analytics"
        });
    }
});


// ================= DELETE INTERVIEW =================

app.delete("/api/interviews/:id", async (req, res) => {
    try {
        const deletedInterview = await Interview.findByIdAndDelete(
            req.params.id
        );

        if (!deletedInterview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found"
            });
        }

        res.json({
            success: true,
            message: "Interview deleted successfully"
        });

    } catch (error) {
        console.error("Delete interview error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete interview"
        });
    }
});


// ================= HOME =================

app.get("/", (req, res) => {
    res.send("InterviewIQ AI Backend is running successfully 🚀");
});


// ================= SERVER =================

app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("InterviewIQ AI Backend");
    console.log(`Server running on port ${PORT}`);
    console.log(`Port: ${PORT}`);
    console.log("--------------------------------");
});
