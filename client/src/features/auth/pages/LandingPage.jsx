import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsightsIcon from "@mui/icons-material/Insights";
import MicIcon from "@mui/icons-material/Mic";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function Landing() {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    return (
        <Box sx={{ overflowX: "hidden" }}>
            {/* Hero Section */}
            <Box
                sx={{
                    bgcolor: "background.default",
                    pt: { xs: 6, md: 12 }, // Reduced padding on mobile
                    pb: { xs: 8, md: 12 },
                    position: "relative",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "radial-gradient(circle at 50% 30%, rgba(25, 118, 210, 0.1) 0%, transparent 60%)",
                        zIndex: 0,
                    },
                }}
            >
                <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                    <Typography
                        component="h1"
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            mb: 3,
                            fontSize: { xs: "2.5rem", md: "3.75rem" }, // Responsive font size
                            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Master Your Money with Automation
                    </Typography>
                    <Typography variant="h5" color="text.secondary" sx={{ mb: 6, maxWidth: 800, mx: "auto", fontSize: { xs: "1.1rem", md: "1.5rem" } }}>
                        Stop manual data entry. Use AI-powered voice input, receipt scanning, and recurring transactions to track expenses effortlessly.
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                        {isAuthenticated ? (
                            <Link to="/dashboard" style={{ textDecoration: "none" }}>
                                <Button variant="contained" size="large" sx={{ px: 5, py: 1.5, borderRadius: 50 }}>
                                    Go to Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" style={{ textDecoration: "none" }}>
                                    <Button variant="contained" size="large" sx={{ px: 5, py: 1.5, borderRadius: 50 }}>
                                        Get Started Free
                                    </Button>
                                </Link>
                                <Link to="/login" style={{ textDecoration: "none" }}>
                                    <Button variant="outlined" size="large" sx={{ px: 5, py: 1.5, borderRadius: 50 }}>
                                        Login
                                    </Button>
                                </Link>
                            </>
                        )}
                    </Box>
                </Container>
            </Box>

            {/* Problem vs Solution */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.75rem", md: "2.125rem" } }}>
                            Tired of the chaos?
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Manual spreadsheets, lost receipts, and forgetting to log expenses lead to inaccurate financial data and stress.
                        </Typography>
                        {[
                            "Manual data entry errors",
                            "Lost paper receipts",
                            "Forgotten subscriptions",
                            "Unclear spending habits",
                        ].map((text) => (
                            <Box key={text} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Box
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        bgcolor: "error.light",
                                        color: "error.main",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 14,
                                        fontWeight: "bold",
                                    }}
                                >
                                    X
                                </Box>
                                <Typography>{text}</Typography>
                            </Box>
                        ))}
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ textAlign: "center", display: { xs: "none", md: "block" } }}>
                        <AutoAwesomeIcon sx={{ fontSize: 48, color: "text.disabled" }} />
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Card
                            sx={{
                                background: "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 203, 243, 0.1) 100%)",
                                border: "1px solid rgba(33, 150, 243, 0.2)",
                            }}
                        >
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h5" fontWeight={700} gutterBottom color="primary">
                                    The Automated Way
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    Experience financial clarity with automated tools that do the heavy lifting for you.
                                </Typography>
                                {[
                                    "Receipt scanning with OCR",
                                    "One-click voice entry",
                                    "Auto-recurring expenses",
                                    "AI-powered duplicate check",
                                ].map((text) => (
                                    <Box key={text} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                        <CheckCircleIcon color="success" />
                                        <Typography fontWeight={500}>{text}</Typography>
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Feature Showcase */}
            <Box sx={{ bgcolor: "background.paper", py: { xs: 6, md: 10 } }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" fontWeight={700} textAlign="center" gutterBottom sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
                        Smart Entry Features
                    </Typography>
                    <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mb: 8 }}>
                        Three ways to add transactions without typing
                    </Typography>

                    <Grid container spacing={4}>
                        {[
                            {
                                icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
                                title: "Receipt Scanner",
                                desc: "Upload a photo of your receipt. We extract the date, merchant, and amount automatically.",
                            },
                            {
                                icon: <MicIcon sx={{ fontSize: 40 }} />,
                                title: "Voice Input",
                                desc: 'Just say "Spent 25 dollars on lunch" and we turn speech into structured data.',
                            },
                            {
                                icon: <CloudUploadIcon sx={{ fontSize: 40 }} />,
                                title: "CSV Import",
                                desc: "Drag and drop your bank statements to import hundreds of transactions at once.",
                            },
                        ].map((feature, i) => (
                            <Grid item xs={12} md={4} key={i}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        height: "100%",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        borderRadius: 4,
                                        transition: "transform 0.2s",
                                        "&:hover": { transform: "translateY(-5px)" },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 3,
                                            bgcolor: "primary.light",
                                            color: "primary.main",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            mb: 3,
                                            opacity: 0.2, // background opacity
                                        }}
                                    >
                                        <Box sx={{ opacity: 5, color: "primary.main" }}>{feature.icon}</Box>
                                    </Box>
                                    <Typography variant="h5" fontWeight={700} gutterBottom>
                                        {feature.title}
                                    </Typography>
                                    <Typography color="text.secondary">{feature.desc}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Analytics Preview */}
            <Container maxWidth="lg" sx={{ py: 10 }}>
                <Grid container spacing={6} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Typography variant="overline" color="primary" fontWeight={700}>
                            Powerful Insights
                        </Typography>
                        <Typography variant="h3" fontWeight={700} gutterBottom>
                            See where your money goes
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Visual reports help you identify spending patterns and find opportunities to save.
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            {[
                                { icon: <InsightsIcon />, text: "Monthly Trends" },
                                { icon: <SpeedIcon />, text: "Budget Tracking" },
                                { icon: <SecurityIcon />, text: "Secure Data" },
                            ].map((item, i) => (
                                <Grid item xs={12} sm={6} key={i}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box sx={{ color: "primary.main" }}>{item.icon}</Box>
                                        <Typography fontWeight={600}>{item.text}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                position: "relative",
                                width: "100%",
                                paddingTop: "60%", // Aspect ratio
                                bgcolor: "background.paper",
                                borderRadius: 4,
                                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                                border: "1px solid",
                                borderColor: "divider",
                                overflow: "hidden",
                            }}
                        >
                            {/* Mock Dashboard UI */}
                            <Box sx={{ position: "absolute", inset: 0, p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Box sx={{ flex: 1, height: 100, bgcolor: "action.hover", borderRadius: 2 }} />
                                    <Box sx={{ flex: 1, height: 100, bgcolor: "action.hover", borderRadius: 2 }} />
                                    <Box sx={{ flex: 1, height: 100, bgcolor: "action.hover", borderRadius: 2 }} />
                                </Box>
                                <Box sx={{ flex: 1, bgcolor: "action.hover", borderRadius: 2, display: "flex", alignItems: "end", justifyContent: "space-around", pb: 2, px: 2 }}>
                                    {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                                        <Box key={i} sx={{ width: "8%", height: `${h}%`, bgcolor: "primary.main", opacity: 0.7, borderRadius: 1 }} />
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
