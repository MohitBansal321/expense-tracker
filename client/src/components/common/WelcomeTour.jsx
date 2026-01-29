import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const steps = [
    {
        label: "Welcome to Expensor",
        description: "Let's get your finances on autopilot. We'll help you track expenses, set budgets, and reach your saving goals.",
        icon: <AutoAwesomeIcon sx={{ fontSize: 60, color: "primary.main" }} />,
    },
    {
        label: "Set a Monthly Budget",
        description: "A budget is the first step to financial freedom. Start by setting a realistic monthly limit.",
        icon: <AccountBalanceIcon sx={{ fontSize: 60, color: "secondary.main" }} />,
        action: (
            <Link to="/budget" style={{ textDecoration: "none" }}>
                <Button variant="outlined" size="small">
                    Go to Budget Settings
                </Button>
            </Link>
        ),
    },
    {
        label: "You're Ready!",
        description: "Start by adding your first transaction. Use the Smart Entry features for quick logging.",
        icon: <CheckCircleIcon sx={{ fontSize: 60, color: "success.main" }} />,
        action: (
            <Link to="/smart-entry" style={{ textDecoration: "none" }}>
                <Button variant="contained" color="success">
                    Try Smart Entry
                </Button>
            </Link>
        ),
    },
];

export default function WelcomeTour() {
    const [open, setOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("hasSeenTour");
        if (!hasSeenTour) {
            // Short delay to allow page load
            setTimeout(() => setOpen(true), 1000);
        }
    }, []);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleClose = () => {
        setOpen(false);
        localStorage.setItem("hasSeenTour", "true");
    };

    return (
        <Dialog
            open={open}
            onClose={activeStep === steps.length - 1 ? handleClose : undefined}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 4, p: 2 },
            }}
        >
            <DialogContent sx={{ textAlign: "center", py: 4 }}>
                <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
                    {steps[activeStep].icon}
                </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    {steps[activeStep].label}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    {steps[activeStep].description}
                </Typography>

                {steps[activeStep].action && (
                    <Box sx={{ mt: 2, mb: 1 }}>{steps[activeStep].action}</Box>
                )}

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 4 }}>
                    {steps.map((step) => (
                        <Step key={step.label}>
                            <StepLabel />
                        </Step>
                    ))}
                </Stepper>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                    {activeStep === steps.length - 1 ? (
                        <Button variant="contained" onClick={handleClose} fullWidth>
                            Get Started
                        </Button>
                    ) : (
                        <Button variant="contained" onClick={handleNext} fullWidth>
                            Next
                        </Button>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
