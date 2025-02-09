// Import necessary modules and libraries from React and Material-UI
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
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
import Paper from "@mui/material/Paper";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [stats, setStats] = React.useState({ userCount: 0, transactionCount: 0 });
  const [loading, setLoading] = React.useState(true);

  // Fetch user and transaction count
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BASE_URL}/stats/count`);
        const data = await res.json();
        setStats({
          userCount: data.data.userCounts,
          transactionCount: data.data.transactionCounts,
        });
      } catch (error) {
        toast.error("Failed to load stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const form = {
      email: data.get("email"),
      password: data.get("password"),
    };

    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/login`, {
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
      navigate("/");
    } else {
      toast.error("Email or Password are Incorrect");
    }
  };

  return (
    <Container>
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Avatar icon */}
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>

        {/* Toast notifications */}
        <ToastContainer position="top-center" theme="light" />

        {/* Title */}
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        {/* Login form */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {/* Email input */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />

          {/* Password input */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />

          {/* Sign In button */}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Sign In
          </Button>

          {/* Link to Sign Up */}
          <Grid container sx={{ mt: 2 }}>
            <Grid item>
              <RouterLink to="/register">
                <Link component="span" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </RouterLink>
            </Grid>
          </Grid>

          {/* User and Transaction Stats Box */}
        {!loading && stats.userCount > 0 && stats.transactionCount > 0 && (
          <Paper elevation={3} sx={{ 
            mt: 2, 
            width: "100%", 
            textAlign: "center", 
            py: 2, 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            gap: 3 
        }}>
          <Typography variant="h6" sx={{ 
              color: "#1976D2", 
              fontWeight: "bold", 
              display: "flex", 
              alignItems: "center", 
              fontSize: "1rem"
          }}>
            🌍 <span style={{ marginLeft: "5px" }}>{stats.userCount} Users Registered</span>
          </Typography>
          <Typography variant="h6" sx={{ 
              color: "#9C27B0", 
              fontWeight: "bold", 
              display: "flex", 
              alignItems: "center", 
              fontSize: "1rem"
          }}>
            <span style={{ color: "#FFC107" }}>💰</span> 
            <span style={{ marginLeft: "5px" }}>{stats.transactionCount} Transactions Processed</span>
          </Typography>
        </Paper>
        
        )}
        </Box>
      </Box>
    </Container>
  );
}
