const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Temporary user storage
const users = new Map();

// Default user
users.set("janani@gmail.com", {
    username: "Janani",
    email: "janani@gmail.com",
    password: "123456"
});


// ================= REGISTER =================

app.post("/register", (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill all fields"
        });
    }

    const userEmail = email.toLowerCase().trim();

    if (users.has(userEmail)) {
        return res.status(409).json({
            success: false,
            message: "This email is already registered"
        });
    }

    users.set(userEmail, {
        username: username.trim(),
        email: userEmail,
        password: password
    });

    res.status(201).json({
        success: true,
        message: "Account created successfully"
    });
});


// ================= LOGIN =================

app.post("/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const userEmail = email.toLowerCase().trim();

    const user = users.get(userEmail);

    if (!user || user.password !== password) {
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
});


// ================= GET USER =================

app.get("/user/:email", (req, res) => {

    const email = req.params.email.toLowerCase();

    const user = users.get(email);

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
    console.log(`http://localhost:${PORT}`);
    console.log("--------------------------------");

});
