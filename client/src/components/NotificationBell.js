import React, { useState, useEffect } from "react";
import { Badge, IconButton, Menu, MenuItem, Typography, Box, Divider } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
    const [alerts, setAlerts] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const open = Boolean(anchorEl);

    useEffect(() => {
        fetchAlerts();
    }, []);

    async function fetchAlerts() {
        const token = Cookies.get("token");
        if (!token) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/budget/alerts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAlerts(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch alerts", error);
        }
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        fetchAlerts(); // Refresh on open
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleItemClick = () => {
        handleClose();
        navigate("/budget");
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleClick} sx={{ ml: 1 }}>
                <Badge badgeContent={alerts.length} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: 400,
                        width: '350px',
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" fontSize="1rem" fontWeight={700}>Notifications</Typography>
                    {alerts.length > 0 && (
                        <Typography variant="caption" color="error" fontWeight={600}>{alerts.length} Alerts</Typography>
                    )}
                </Box>
                <Divider />

                {alerts.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2">No new notifications</Typography>
                    </MenuItem>
                ) : (
                    alerts.map((alert) => (
                        <MenuItem key={alert.budgetId} onClick={handleItemClick}>
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 0.5 }}>
                                {alert.severity === 'error' ? (
                                    <ErrorIcon color="error" fontSize="small" sx={{ mt: 0.5 }} />
                                ) : (
                                    <WarningIcon color="warning" fontSize="small" sx={{ mt: 0.5 }} />
                                )}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {alert.categoryName}: {alert.severity === 'error' ? 'Over Budget' : 'Near Limit'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                        Spent ${alert.currentSpending.toLocaleString()} of ${alert.amount.toLocaleString()} ({alert.percentageUsed}%)
                                    </Typography>
                                </Box>
                            </Box>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
}
