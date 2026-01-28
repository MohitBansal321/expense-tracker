import User from "../models/User.js";
import bcrypt from "bcrypt";

// Controller function for retrieving user information
export const index = (req, res) => {
  // Respond with the user information from the request (authenticated user)
  res.json({ user: req.user });
};

// Update user profile
export const update = async (req, res) => {
  try {
    const { firstName, lastName, password } = req.body;
    const userId = req.user._id;

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;

    if (password) {
      const saltRounds = 10;
      const salt = await bcrypt.genSaltSync(saltRounds);
      updates.password = await bcrypt.hashSync(password, salt);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};
