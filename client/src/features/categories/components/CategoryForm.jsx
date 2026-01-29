// Import necessary modules and components from Material-UI and React
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/auth.js";

// Initial form state
const InitialForm = {
  label: "",
  icon: "💰",
};

// Curated list of finance-related emojis
const icons = [
  "💰", "💳", "🏦", "💵", "🧾", // Money & Banking
  "🍔", "☕", "🍕", "🛒", "🛍️", // Food & Shopping
  "🚗", "🚌", "✈️", "⛽", "🔧", // Transport
  "🏠", "💡", "💧", "📱", "🌐", // Home & Bills
  "🎮", "🎬", "🎵", "📚", "🏋️‍♂️", // Entertainment & Health
  "🩺", "💊", "🎓", "👶", "🎁", // Health & Family
  "💼", "📈", "🛡️", "🐾", "✂️", // Work & Misc
];

// React component for managing category creation and update
export default function CategoryForm({ editCategory, onClose }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const token = Cookies.get("token");
  const [form, setForm] = useState(InitialForm);

  useEffect(() => {
    if (editCategory?._id) {
      setForm(editCategory);
    } else {
      setForm(InitialForm);
    }
  }, [editCategory]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleIconClick(icon) {
    setForm({ ...form, icon });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.label) return alert("Label is required");

    // Check dupe only if label changed or new
    if ((!editCategory?._id || editCategory.label !== form.label) &&
      user.categories.some(c => c.label.toLowerCase() === form.label.toLowerCase())) {
      return alert("Category already exists");
    }

    editCategory?._id ? update() : create();
  }

  function reload(res, _user) {
    if (res.ok) {
      dispatch(setUser({ user: _user }));
      setForm(InitialForm);
      if (onClose) onClose();
    }
  }

  async function create() {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/category`, {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      reload(res, { ...user, categories: [...user.categories, data.category] });
    }
  }

  async function update() {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/category/${editCategory._id}`, {
      method: "PATCH",
      body: JSON.stringify(form),
      headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
    });
    const _user = {
      ...user,
      categories: user.categories.map((cat) => cat._id === editCategory._id ? form : cat),
    };
    reload(res, _user);
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom fontWeight={600}>
        Category Name
      </Typography>
      <TextField
        fullWidth
        label="e.g. Groceries"
        size="small"
        name="label"
        value={form.label}
        onChange={handleChange}
        sx={{ mb: 4 }}
      />

      <Typography variant="subtitle1" gutterBottom fontWeight={600}>
        Select Icon
      </Typography>
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 2, borderRadius: 2, mb: 4, maxHeight: 200, overflowY: "auto" }}>
        <Grid container spacing={1}>
          {icons.map((icon) => (
            <Grid item key={icon}>
              <Box
                onClick={() => handleIconClick(icon)}
                sx={{
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  borderRadius: "50%",
                  bgcolor: form.icon === icon ? "primary.light" : "transparent",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {icon}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        {onClose && (
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
        )}
        <Button type="submit" variant="contained">
          {editCategory?._id ? "Update Category" : "Add Category"}
        </Button>
      </Box>
    </Box>
  );
}
