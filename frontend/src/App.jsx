import React, { useState, useMemo, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  IconButton,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";
import { useAuth } from "./hooks/useAuth";

/**
 * App Root
 * - Provides theme toggling and routing with basic auth guards
 */
function App() {
  const { user } = useAuth();
  const [mode, setMode] = useState("light");

  // Update body data-theme attribute when mode changes
  useEffect(() => {
    document.body.setAttribute('data-theme', mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode,
          primary: {
            main: mode === "light" ? "#1e88e5" : "#42a5f5",
          },
          secondary: {
            main: mode === "light" ? "#ff7043" : "#ff8a65",
          },
          background: {
            default: mode === "light" ? "#f7f9fc" : "#0a0a0a",
            paper: mode === "light" ? "#ffffff" : "#151515",
          },
          text: {
            primary: mode === "light" ? "#000000" : "#ffffff",
            secondary:
              mode === "light"
                ? "rgba(0, 0, 0, 0.6)"
                : "rgba(255, 255, 255, 0.7)",
          },
        },
        shape: { borderRadius: 10 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: { textTransform: "none", borderRadius: 8 },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                backgroundImage: "none",
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottom:
                  mode === "light"
                    ? "1px solid rgba(224, 224, 224, 1)"
                    : "1px solid rgba(255, 255, 255, 0.12)",
              },
            },
          },
        },
      }),
    [mode]
  );

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar
          position="static"
          elevation={0}
          color="transparent"
          sx={{
            borderBottom:
              mode === "light" ? "1px solid #e5eaf2" : "1px solid #202020",
            backdropFilter: "blur(6px)",
            backgroundColor:
              mode === "light"
                ? "rgba(255, 255, 255, 0.8)"
                : "rgba(10, 10, 10, 0.95)",
          }}
        >
          <Toolbar>
            <Typography
              variant="h6"
              color="primary"
              sx={{ fontWeight: 700, flexGrow: 1 }}
            >
              Student Management
            </Typography>
            <IconButton onClick={toggleColorMode} color="inherit" aria-label="Toggle color mode">
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Container sx={{ py: 4 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/students/add"
              element={user ? <AddStudent /> : <Navigate to="/login" />}
            />
            <Route
              path="/students/edit/:id"
              element={user ? <EditStudent /> : <Navigate to="/login" />}
            />
            <Route
              path="*"
              element={<Navigate to={user ? "/dashboard" : "/login"} />}
            />
            <Route
              path="/"
              element={<Navigate to={user ? "/dashboard" : "/login"} />}
            />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
