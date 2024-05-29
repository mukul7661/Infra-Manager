const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log(user);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token-scoutflo", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production", // Set to true in production
      maxAge: 3600000, // 1 hour
    });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const token = req.cookies["token-scoutflo"];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
