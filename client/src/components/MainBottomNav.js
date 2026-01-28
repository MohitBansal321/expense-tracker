import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function MainBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    // Only show on mobile screens (sm and down)
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [value, setValue] = useState(0);

    // Sync state with current location
    useEffect(() => {
        switch (location.pathname) {
            case "/dashboard":
                setValue(0);
                break;
            case "/transactions":
                setValue(1);
                break;
            case "/smart-entry":
                setValue(2);
                break;
            case "/budget":
                setValue(3);
                break;
            case "/settings":
                setValue(4);
                break;
            default:
                setValue(0);
        }
    }, [location.pathname]);

    if (!isMobile) return null;

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                pb: 'env(safe-area-inset-bottom)' // Handle iPhone home indicator
            }}
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={value}
                onChange={(event, newValue) => {
                    setValue(newValue);
                    switch (newValue) {
                        case 0:
                            navigate("/dashboard");
                            break;
                        case 1:
                            navigate("/transactions");
                            break;
                        case 2:
                            // Special case: Add action
                            navigate("/smart-entry");
                            break;
                        case 3:
                            navigate("/budget");
                            break;
                        case 4:
                            navigate("/settings");
                            break;
                        default:
                            break;
                    }
                }}
                sx={{
                    "& .MuiBottomNavigationAction-root": {
                        minWidth: 'auto',
                        px: 0
                    }
                }}
            >
                <BottomNavigationAction label="Home" icon={<DashboardIcon />} />
                <BottomNavigationAction label="Trans." icon={<ReceiptLongIcon />} />
                <BottomNavigationAction
                    label="Add"
                    icon={<AddCircleIcon sx={{ fontSize: 32, color: 'primary.main', mb: 0.5 }} />}
                    sx={{ transform: 'translateY(-8px)' }}
                />
                <BottomNavigationAction label="Budget" icon={<AccountBalanceWalletIcon />} />
                <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
            </BottomNavigation>
        </Paper>
    );
}
