// Import necessary modules and components from Material-UI and React
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/auth.js";

// Define an initial form state
const InitialForm = {
  label: "",
  icon: "",
};

// Define available icons
const icons = ["User"];

// React component for managing category creation and update
export default function CategoryForm({ editCategory }) {
  // Get user data from the Redux store
  const user = useSelector((state) => state.auth.user);

  // Get the dispatch function to dispatch actions to the Redux store
  const dispatch = useDispatch();

  // Get the authentication token from cookies
  const token = Cookies.get("token");

  // State to manage the form data
  const [form, setForm] = useState(InitialForm);

  // Update the form data when editing an existing category
  useEffect(() => {
    if (editCategory._id !== undefined) {
      setForm(editCategory);
    }
  }, [editCategory]);

  // Handle form input changes
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Check if category already exist
  function categoryExist(){
    const label = form.label.toLowerCase();
    const icon = form.icon.toLowerCase();
    const categoryExists = user.categories.some(category => category.label.toLowerCase() === label);
    if (label === ''){
      alert("Label cannot be empty");
      return true;
    }
    
    if(icon === ''){
      alert("Icon cannot be empty");
      return true;
    }

    if (categoryExists) {
      alert("This category is already in your list. Please enter a unique category name.");
      return true;
    }

    return false;

  }

  // Handle form submission for creating or updating a category
  async function handleSubmit(e) {
    e.preventDefault();
    if(categoryExist()){
      return;
    }
    editCategory._id === undefined ? create() : update();
    if(editCategory._id !== undefined) editCategory._id = undefined
  }

  // Function to reload user data and update the Redux store
  function reload(res, _user) {
    if (res.ok) {
      dispatch(setUser({ user: _user }));
      setForm(InitialForm);
    }
  }

  // Create a new category
  async function create() {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/category`, {
      method: "POST",
      body: JSON.stringify(form),
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      alert("Failed to create category");
      return;
    }
  
    const data = await res.json(); // Get the response data
  
    if (data.category) {
      // Append the new category to the user's category list
      const _user = {
        ...user,
        categories: [...user.categories, data.category], // Add the new category
      };
  
      reload(res, _user); // Update the Redux store and reset the form
    }
  }

  // Update an existing category
  async function update() {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/category/${editCategory._id}`, {
      method: "PATCH",
      body: JSON.stringify(form),
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const _user = {
      ...user,
      categories: user.categories.map((cat) =>
        // eslint-disable-next-line
        cat._id == editCategory._id ? form : cat
      ),
    };
    reload(res, _user);
  }

  // Render the category form
  return (
    <Card sx={{ minWidth: 275, marginTop: 10 }}>
      <CardContent>
        <Typography variant="h6">Add New Category</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex" }}>
          <TextField
            sx={{ marginRight: 5 }}
            id="outlined-basic"
            label="Label"
            type="text"
            size="small"
            name="label"
            variant="outlined"
            value={form.label}
            onChange={handleChange}
          />

          <Autocomplete
            value={form.icon}
            onChange={(event, newValue) => {
              setForm({ ...form, icon: newValue });
            }}
            id="icons"
            options={icons}
            sx={{ width: 200, marginRight: 5 }}
            renderInput={(params) => <TextField {...params} size="small" label="Icon" />}
          />

          {editCategory._id !== undefined && (
            <Button type="submit" variant="secondary">
              Update
            </Button>
          )}

          {editCategory._id === undefined && (
            <Button type="submit" variant="contained">
              Submit
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
