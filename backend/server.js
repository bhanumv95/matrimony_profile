// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

// Initialize Razorpay instance with your API keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",       // public key id
  key_secret: process.env.RAZORPAY_SECRET || ""    // secret key
});

// Initialize OpenAI API client
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// In-memory "database" for users (for demo purposes)
const users = [];  // Each user: { id, name, email, passwordHash }

// Utility: Auth middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']; 
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.split(' ')[1]; // Expect "Bearer <token>"
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");
    req.user = decoded; // decoded contains userId, email, name
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

// Route: User Registration
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Please provide name, email, and password" });
  }
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "Email already registered" });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { 
      id: users.length + 1, 
      name, 
      email, 
      passwordHash 
    };
    users.push(newUser);
    // (Optionally, auto-login the user by generating a token here, but we'll require explicit login)
    return res.json({ message: "Registration successful" });
  } catch (err) {
    console.error("Error in registration:", err);
    return res.status(500).json({ error: "Internal server error during registration" });
  }
});

// Route: User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  try {
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: '1h' }
    );
    return res.json({ 
      message: "Login successful",
      token: token,
      user: { name: user.name, email: user.email } 
    });
  } catch (err) {
    console.error("Error in login:", err);
    return res.status(500).json({ error: "Internal server error during login" });
  }
});

// Route: Get current user profile (protected example)
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  // Using the info from token (req.user) to get user details
  const { userId, name, email } = req.user;
  return res.json({ userId, name, email });
});

// Route: Create Razorpay Order (Payment) - Protected
app.post('/api/payment/create-order', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  if (!amount) {
    return res.status(400).json({ error: "Amount is required to create payment order" });
  }
  const amountInPaise = Math.round(amount * 100);  // convert rupees to paise (integer)
  const options = {
    amount: amountInPaise,  
    currency: "INR",
    receipt: "receipt_" + Date.now()  // a unique receipt id for tracking
  };
  try {
    const order = await razorpay.orders.create(options);  // Create order via Razorpay API
    // Send order details and Razorpay key to client
    return res.json({ 
      orderId: order.id, 
      amount: order.amount, 
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID   // send the publishable key to frontend
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

// Route: AI Biodata Generation (using OpenAI) - Protected
app.post('/api/ai/generate-bio', authenticateToken, async (req, res) => {
  const { info } = req.body;  // 'info' is the user's input for generating the biodata
  if (!info) {
    return res.status(400).json({ error: "No input info provided for bio generation" });
  }
  if (!openai) {
    return res.status(500).json({ error: "AI service not configured" });
  }
  try {
    // Prepare a prompt for the AI (you can adjust this prompt for your needs)
    const prompt = `Write a concise marriage biodata based on the following information:\n${info}`;
    // Call OpenAI API (ChatGPT model) to generate text:contentReference[oaicite:9]{index=9}
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7
    });
    const aiMessage = completion.data.choices[0].message.content.trim();
    return res.json({ result: aiMessage });
  } catch (err) {
    console.error("OpenAI API error:", err);
    return res.status(500).json({ error: "Failed to generate biodata via AI" });
  }
});

// --- Static file serving (for production build) ---
if (process.env.NODE_ENV === "production") {
  // Serve frontend build files
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  // Serve index.html for any unknown routes (client-side routing support)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
