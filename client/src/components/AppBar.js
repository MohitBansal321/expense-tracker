// Modern navigation bar with Shadcn UI styling
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "../context/ThemeContext";
import { logout } from "../store/auth.js";
import NotificationBell from "./NotificationBell";
import { Button } from "./ui/button";

export default function ButtonAppBar() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const { mode, toggleTheme } = useThemeMode();

  function _logout() {
    Cookies.remove("token");
    dispatch(logout());
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto flex h-14 items-center px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl mr-6 hover:opacity-80 transition-opacity"
        >
          <span>💰</span>
          <span>Expensor</span>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1 flex-1">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link to="/transactions">
              <Button variant="ghost" size="sm">
                Transactions
              </Button>
            </Link>
            <Link to="/budget">
              <Button variant="ghost" size="sm">
                Budget
              </Button>
            </Link>
            <Link to="/recurring">
              <Button variant="ghost" size="sm">
                Recurring
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="ghost" size="sm">
                Reports
              </Button>
            </Link>
            <Link to="/smart-entry">
              <Button variant="ghost" size="sm">
                Smart Entry
              </Button>
            </Link>
            <Link to="/category">
              <Button variant="ghost" size="sm">
                Category
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="sm">
                Settings
              </Button>
            </Link>
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={mode === "dark" ? "Light Mode" : "Dark Mode"}
            className="transition-transform hover:rotate-12"
          >
            {mode === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notification Bell */}
          {isAuthenticated && <NotificationBell />}

          {/* Auth buttons */}
          {isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={_logout}>
              Logout
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
