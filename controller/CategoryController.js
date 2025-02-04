// Import the User model
import User from "../models/User.js";
import mongoose from 'mongoose';

// Controller function for deleting a category
export const destroy = async (req, res) => {
  // Retrieve the user's categories
  const categories = req.user.categories;

  // Filter out the category to be deleted based on its ID
  const newCategories = categories.filter((category) => category._id != req.params.id);

  // Update the user's categories with the new list
  const user = await User.updateOne({ _id: req.user.id }, { $set: { categories: newCategories } });

  // Respond with the updated user information
  res.json({ user });
};

// Controller function for creating a new category
export const create = async (req, res) => {
  // Extract label and icon from the request body
  const { label, icon } = req.body;

  const newCategory = {
    _id: new mongoose.Types.ObjectId(),
    label,
    icon,
  };

  // Add the new category to the user's categories list
  const response = await User.updateOne(
    { _id: req.user.id },
    { $set: { categories: [...req.user.categories, newCategory] } }
  );

  // Respond with the updated user information
  res.json({ response , category: newCategory });
};

// Controller function for updating a category
export const update = async (req, res) => {
  // Extract label and icon from the request body
  const { label, icon } = req.body;

  // Update the user's categories, replacing the category with a matching ID
  const response = await User.updateOne(
    { _id: req.user.id },
    {
      $set: {
        categories: req.user.categories.map((category) => {
          if (category._id == req.params.id) {
            return { label, icon };
          }
          return category;
        }),
      },
    }
  );

  // Respond with the updated user information
  res.json({ response });
};
