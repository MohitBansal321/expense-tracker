// Import necessary modules and libraries from React and Material-UI
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Cookie from "js-cookie";
import * as React from "react";
import { useDispatch } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { setUser } from "../store/auth.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const form = {
      email: data.get("email"),
      password: data.get("password"),
    };

    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify(form),
      headers: {
        "content-type": "application/json",
      },
    });

    const { token, user } = await res.json();

    if (res.ok) {
      Cookie.set("token", token);
      await dispatch(setUser(user));
      navigate("/dashboard");
    } else {
      toast.error("Email or Password are Incorrect");
    }
  };

  return (
    <AuthLayout>
      <Avatar sx={{ m: 1, bgcolor: "secondary.main", width: 56, height: 56 }}>
        <LockOutlinedIcon fontSize="large" />
      </Avatar>

      <ToastContainer position="top-center" theme="light" />

      <Typography component="h1" variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Welcome Back
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Sign in to continue to Expensor
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: "100%" }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          InputProps={{ sx: { borderRadius: 2 } }}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          InputProps={{ sx: { borderRadius: 2 } }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 4, mb: 2, borderRadius: 2, height: 48, fontWeight: 700 }}
        >
          Sign In
        </Button>

        <Grid container sx={{ mt: 2 }} justifyContent="center">
          <Grid item>
            <RouterLink to="/register" style={{ textDecoration: 'none' }}>
              <Link component="span" variant="body2" sx={{ fontWeight: 500 }}>
                {"Don't have an account? Sign Up"}
              </Link>
            </RouterLink>
          </Grid>
        </Grid>
      </Box>
    </AuthLayout>
  );
}
