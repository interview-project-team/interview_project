const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// ==========================================
// 1. CONNECT TO MONGODB
// ==========================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error.message);
    });


// ==========================================
// 2. USER MODEL - LOGIN
// ==========================================

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);


// ==========================================
// 3. PRACTICE MODEL
// ==========================================

const practiceSchema = new mongoose.Schema({
    userName: String,
    question: String,
    answer: String,
    score: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Practice = mongoose.model("Practice", practiceSchema);


// ==========================================
// 4. INTERVIEW MODEL
// ==========================================

const interviewSchema = new mongoose.Schema({
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
});

const Interview = mongoose.model("Interview", interviewSchema);


// ==========================================
// 5. HOME PAGE TEST
// ==========================================

app.get("/", (req, res) => {

    res.json({
        message: "InterviewIQ Backend is running!"
    });

});


// ==========================================
// 6. REGISTER
// ==========================================

app.post("/api/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

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

        console.error(error);

        res.status(500).json({
            message: "Registration failed"
        });

    }

});


// ==========================================
// 7. LOGIN
// ==========================================

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

        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });

    }

});


// ==========================================
// 8. SAVE PRACTICE
// ==========================================

app.post("/api/practice", async (req, res) => {

    try {

        const practice = await Practice.create(req.body);

        res.status(201).json({
            message: "Practice saved successfully",
            practice
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error saving practice"
        });

    }

});


// ==========================================
// 9. GET PRACTICE
// ==========================================

app.get("/api/practice", async (req, res) => {

    try {

        const practices = await Practice
            .find()
            .sort({ createdAt: -1 });

        res.json(practices);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error getting practice data"
        });

    }

});


// ==========================================
// 10. SAVE INTERVIEW
// ==========================================

app.post("/api/interviews", async (req, res) => {

    try {

        const interview = await Interview.create(req.body);

        res.status(201).json({
            message: "Interview saved successfully",
            interview
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error saving interview"
        });

    }

});


// ==========================================
// 11. GET INTERVIEWS
// ==========================================

app.get("/api/interviews", async (req, res) => {

    try {

        const interviews = await Interview
            .find()
            .sort({ createdAt: -1 });

        res.json(interviews);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error getting interviews"
        });

    }

});


// ==========================================
// 12. ANALYTICS
// ==========================================

app.get("/api/analytics", async (req, res) => {

    try {

        const interviews = await Interview.find();

        if (interviews.length === 0) {

            return res.json({
                totalInterviews: 0,
                averageScore: 0,
                bestScore: 0
            });

        }

        const totalInterviews = interviews.length;

        const totalScore = interviews.reduce(
            (sum, interview) => sum + interview.score,
            0
        );

        const averageScore =
            Math.round(totalScore / totalInterviews);

        const bestScore =
            Math.max(...interviews.map(
                interview => interview.score
            ));

        res.json({
            totalInterviews,
            averageScore,
            bestScore
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Analytics error"
        });

    }

});


// ==========================================
// 13. START SERVER
// ==========================================

/*const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on https://interview-project-uimv.onrender.com:${PORT}`
    );

});*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
