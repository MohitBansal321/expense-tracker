import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';

export default function AuthLayout({ children, title, subtitle }) {
    const theme = useTheme();

    return (
        <Grid container component="main" sx={{ height: "100vh", overflow: "hidden" }}>
            {/* Left Side - Hero / Visuals */}
            <Grid
                item
                xs={false}
                sm={4}
                md={7}
                sx={{
                    background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                    display: { xs: "none", sm: "flex" },
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                    p: 4,
                    position: "relative",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                        backgroundSize: "30px 30px",
                        opacity: 0.1,
                    }
                }}
            >
                <Box sx={{ position: "relative", zIndex: 1, maxWidth: 480 }}>
                    <Typography variant="h3" fontWeight={800} gutterBottom sx={{ textShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                        Master Your Money.
                    </Typography>
                    <Typography variant="h5" sx={{ opacity: 0.9, mb: 6, fontWeight: 300 }}>
                        Join thousands of users controlling their financial future with AI-powered insights.
                    </Typography>

                    <Grid container spacing={4}>
                        <Grid item xs={4}>
                            <Box sx={{ textAlign: "center" }}>
                                <AutoGraphIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                                <Typography variant="subtitle2">Smart Analytics</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ textAlign: "center" }}>
                                <SecurityIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                                <Typography variant="subtitle2">Secure Data</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ textAlign: "center" }}>
                                <SpeedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                                <Typography variant="subtitle2">Fast Entry</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Grid>

            {/* Right Side - Form */}
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box
                    sx={{
                        my: 8,
                        mx: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                        maxWidth: 400
                    }}
                >
                    {children}
                </Box>
            </Grid>
        </Grid>
    );
}
