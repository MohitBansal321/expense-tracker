// Import necessary libraries and modules
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Default categories for a new user
const categories = [
  { label: "Travel", icon: "✈️" },
  { label: "Shopping", icon: "🛍️" },
  { label: "Investment", icon: "📈" },
  { label: "Bills", icon: "🧾" },
  { label: "Food", icon: "🍔" },
];

// Controller function for user registration
export const register = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if a user with the provided email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(406).json({ message: "User already exists." });
    return;
  }

  // Hash the user's password for secure storage
  const saltRounds = 10;
  const salt = await bcrypt.genSaltSync(saltRounds);
  const hashedPassword = await bcrypt.hashSync(password, salt);

  // Create a new user with hashed password and default categories
  const user = await User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    categories,
  });

  // Save the new user to the database
  await user.save();
  res.status(201).json({ message: "User is created" });
};

// Controller function for user login
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Find a user with the provided email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ message: "Credentials not found" });
    return;
  }

  // Compare the provided password with the stored hashed password
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    res.status(401).json({ message: "Credentials not found" });
    return;
  }

  // Create a JWT token for authentication
  const payload = {
    username: email,
    _id: user._id,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Respond with a success message, token, and user information
  res.json({ message: "Successfully logged in.", token, user });
};
