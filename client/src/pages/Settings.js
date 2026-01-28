import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import SaveIcon from "@mui/icons-material/Save";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import Cookies from "js-cookie";
import { setUser } from "../store/auth";
import { toast, ToastContainer } from "react-toastify";

export default function Settings() {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    const [form, setForm] = useState({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        password: "",
        confirmPassword: ""
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
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    password: form.password || undefined
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Profile updated successfully!");
                dispatch(setUser(data.user));
                setForm(prev => ({ ...prev, password: "", confirmPassword: "" }));
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <ToastContainer position="top-center" />

            <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                    <ManageAccountsIcon fontSize="large" />
                </Avatar>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Settings</Typography>
                    <Typography color="text.secondary">Manage your profile and account</Typography>
                </Box>
            </Box>

            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Profile Information</Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="First Name"
                                value={form.firstName}
                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                value={form.lastName}
                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                value={user.email}
                                disabled
                                helperText="Email cannot be changed"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Change Password</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Leave blank to keep current password
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="password"
                                label="New Password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="password"
                                label="Confirm Password"
                                value={form.confirmPassword}
                                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                startIcon={<SaveIcon />}
                            >
                                Save Changes
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}
