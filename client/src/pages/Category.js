// Import necessary modules and libraries from React and Material-UI
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Fab from "@mui/material/Fab";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Cookies from "js-cookie";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import CategoryForm from "../components/CategoryForm.js";
import { setUser } from "../store/auth.js";

// A React component for managing and displaying user categories
export default function Category() {
  // Retrieve the JWT token from cookies
  const token = Cookies.get("token");

  // Retrieve user data and dispatch function from Redux store
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  // State to manage the category being edited and modal visibility
  const [editCategory, setEditCategory] = React.useState({});
  const [open, setOpen] = React.useState(false);

  // Function to open modal for new or existing category
  function handleOpen(category = {}) {
    setEditCategory(category);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setEditCategory({});
  }

  // Function to remove a category
  async function remove(id) {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/category/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      // Update user data in Redux by removing the deleted category
      const _user = {
        ...user,
        categories: user.categories.filter((cat) => cat._id !== id),
      };
      dispatch(setUser({ user: _user }));
    }
  }

  // Render the Category page with category list and form
  return (
    <Container maxWidth="md" sx={{ py: 4, position: 'relative', minHeight: '80vh' }}>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Manage Categories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize your expense categories with icons.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {user.categories.map((row) => (
          <Grid item xs={6} sm={4} md={3} key={row._id}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 4,
                transition: 'all 0.2s',
                position: 'relative',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  '& .actions': { opacity: 1 }
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ fontSize: '3rem', mb: 1 }}>
                  {row.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight={600} noWrap>
                  {row.label}
                </Typography>

                <Box
                  className="actions"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 2
                  }}
                >
                  <IconButton size="small" onClick={() => handleOpen(row)} color="primary">
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => remove(row._id)} color="error">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Floating Action Button for adding new category */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpen()}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)'
        }}
      >
        <AddIcon />
      </Fab>

      {/* Modal Dialog for Category Form */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ pb: 0, fontWeight: 700 }}>
          {editCategory._id ? "Edit Category" : "New Category"}
        </DialogTitle>
        <DialogContent>
          <CategoryForm editCategory={editCategory} onClose={handleClose} />
        </DialogContent>
      </Dialog>

    </Container>
  );
}
