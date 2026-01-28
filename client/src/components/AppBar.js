// Import necessary modules and libraries from Material-UI and React
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Cookies from "js-cookie";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useThemeMode } from "../context/ThemeContext";
import { logout } from "../store/auth.js";
import NotificationBell from "./NotificationBell";

// A React component for the application's top navigation bar
export default function ButtonAppBar() {
  // Use the `useNavigate` hook to manage navigation
  const navigate = useNavigate();

  // Get the authentication status from the Redux store
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Get the dispatch function to dispatch actions to the Redux store
  const dispatch = useDispatch();

  // Get theme and mobile status
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Get theme mode and toggle function
  const { mode, toggleTheme } = useThemeMode();

  // Function to handle user logout
  function _logout() {
    // Remove the authentication token stored in cookies
    Cookies.remove("token");

    // Dispatch the logout action to update the Redux store
    dispatch(logout());

    // Navigate the user to the login page
    navigate("/login");
  }

  // Render the top navigation bar
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          backdropFilter: "blur(10px)",
          boxShadow: mode === "dark" ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          {/* Application title with a link to the home page */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            <Link
              to="/"
              style={{
                color: "inherit",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              💰 Expensor
            </Link>
          </Typography>

          {/* Dark mode toggle button */}
          <Tooltip title={mode === "dark" ? "Light Mode" : "Dark Mode"}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                mr: 1,
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "rotate(30deg)",
                }
              }}
            >
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {/* Notification Bell (Only if authenticated) */}
          {isAuthenticated && <NotificationBell />}

          {/* Render navigation buttons based on authentication status */}
          {isAuthenticated && (
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
              {/* Link to the Dashboard page */}
              <Link to="/dashboard" style={{ color: "inherit", textDecoration: "none" }}>
                <Button color="inherit" sx={{ mx: 0.5 }}>Dashboard</Button>
              </Link>

              {/* Link to the Transactions page */}
              <Link to="/transactions" style={{ color: "inherit", textDecoration: "none" }}>
                <Button color="inherit" sx={{ mx: 0.5 }}>Transactions</Button>
              </Link>

              {/* Link to the Budget page */}
              <Link to="/budget" style={{ color: "inherit", textDecoration: "none" }}>
                <Button color="inherit" sx={{ mx: 0.5 }}>Budget</Button>
              </Link>

              {/* Link to the Recurring Transactions page */}
              <Link to="/recurring" style={{ color: "inherit", textDecoration: "none" }}>
                <Button color="inherit" sx={{ mx: 0.5 }}>Recurring</Button>
              </Link>

              {/* Link to the Reports page */}
              <Link to="/reports" style={{ color: "inherit", textDecoration: "none" }}>
                <Button color="inherit" sx={{ mx: 0.5 }}>Reports</Button>
              </Link>

              {/* Link to the Smart Entry page */}
              <Link to="/smart-entry" style={{ color: "inherit", textDecoration: "none" }}>
                <Button color="inherit" sx={{ mx: 0.5 }}>Smart Entry</Button>
              </Link>

              <Link to="/category" style={{ color: "inherit", textDecoration: "none" }}>
                <Button color="inherit" sx={{ mx: 0.5 }}>Category</Button>
              </Link>

              {/* Link to the Settings page */}
              <Link to="/settings" style={{ color: "inherit", textDecoration: "none" }}>
                <Button color="inherit" sx={{ mx: 0.5 }}>Settings</Button>
              </Link>
            </Box>
          )}

          {isAuthenticated && (
            /* Logout button */
            <Button
              color="inherit"
              onClick={_logout}
              sx={{
                ml: 1,
                border: "1px solid rgba(255,255,255,0.3)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                }
              }}
            >
              Logout
            </Button>
          )}

          {/* Render Login and Register buttons if user is not authenticated */}
          {!isAuthenticated && (
            <>
              {/* Link to the Login page */}
              <Link to="/login" style={{ color: "inherit", textDecoration: "none" }}>
                <Button color="inherit">Login</Button>
              </Link>

              {/* Link to the Register page */}
              <Link to="/register" style={{ color: "inherit", textDecoration: "none" }}>
                <Button
                  variant="outlined"
                  sx={{
                    color: "inherit",
                    borderColor: "rgba(255,255,255,0.5)",
                    ml: 1,
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    }
                  }}
                >
                  Register
                </Button>
              </Link>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

