const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Temporary users
const users = [];

// ---------------- REGISTER ----------------
app.post("/api/register", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User already exists"
        });
    }

    users.push({
        username,
        email,
        password
    });

    res.json({
        success: true,
        message: "Registration successful"
    });
});


// ---------------- LOGIN ----------------
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    const user = users.find(
        user => user.email === email && user.password === password
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    res.json({
        success: true,
        message: "Login successful",
        user: {
            username: user.username,
            email: user.email
        }
    });
});


// ---------------- HOME ----------------
app.get("/", (req, res) => {
    res.json({
        message: "InterviewIQ AI Backend is running"
    });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
