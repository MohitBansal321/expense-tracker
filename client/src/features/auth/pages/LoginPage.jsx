// Login page with modern Shadcn UI design
import * as React from "react";
import { useDispatch } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

// Store
import { setUser } from "@/store/auth.js";
import { login } from "../../../services/auth.service";

// Auth Layout
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const data = new FormData(event.currentTarget);
    const form = {
      email: data.get("email"),
      password: data.get("password"),
    };

    try {
      const result = await login(form);

      const token = result.data?.token || result.token;
      const user = result.data?.user || result.user;
      Cookie.set("token", token);
      dispatch(setUser({ user }));
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.message || "Email or Password are Incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <div className="mb-6 rounded-full bg-primary/10 p-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue to Financh</p>
        </div>

        <Card className="w-full border shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  autoFocus
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="mt-6 h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <RouterLink
                    to="/register"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign Up
                  </RouterLink>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
