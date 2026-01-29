// Settings page with modern Shadcn UI
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { Settings as SettingsIcon, Save, User } from "lucide-react";
import { setUser } from "../store/auth";
import { toast, ToastContainer } from "react-toastify";

// Shadcn UI Components
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

export default function Settings() {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    const [form, setForm] = useState({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        password: "",
        confirmPassword: "",
    });

    async function handleSubmit(e) {
        e.preventDefault();

        if (form.password && form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const token = Cookies.get("token");
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    password: form.password || undefined,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Profile updated successfully!");
                dispatch(setUser(data.user));
                setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    }

    return (
        <div className="container max-w-4xl mx-auto py-6 px-4">
            <ToastContainer position="top-center" />

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <SettingsIcon className="h-7 w-7" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your profile and account
                    </p>
                </div>
            </div>

            {/* Profile Information Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>
                        Update your personal details and password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        value={form.firstName}
                                        onChange={(e) =>
                                            setForm({ ...form, firstName: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input
                                        id="lastName"
                                        value={form.lastName}
                                        onChange={(e) =>
                                            setForm({ ...form, lastName: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email Field (Read-only) */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={user.email} disabled />
                                <p className="text-xs text-muted-foreground">
                                    Email cannot be changed
                                </p>
                            </div>

                            <Separator className="my-6" />

                            {/* Change Password Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Change Password</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Leave blank to keep current password
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={form.password}
                                            onChange={(e) =>
                                                setForm({ ...form, password: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={form.confirmPassword}
                                            onChange={(e) =>
                                                setForm({ ...form, confirmPassword: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <Button type="submit" size="lg" className="gap-2">
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
