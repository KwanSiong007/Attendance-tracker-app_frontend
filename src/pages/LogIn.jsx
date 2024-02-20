import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from "@mui/material";
import { signIn } from "../api/authentication";
import { useAuth } from "../contexts/AuthContext";

function LogIn() {
  const { setUser } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);
  const [state, setState] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [toWorkerScreen, setToWorkerScreen] = useState(false);

  const signInUser = async () => {
    setLoggingIn(true);
    try {
      const user = await signIn(state.email, state.password);
      console.log("user:", user);
      setState({
        email: "",
        password: "",
      });
      setUser(user);
      setToWorkerScreen(true);
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-login-credentials":
          setError("Incorrect email or password.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/network-request-failed":
          setError("Network request failed. Please try again.");
          break;
        default:
          console.error("Error logging in:", error);
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState({
      ...state,
      [name]: value,
    });
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 4,
          gap: 2,
        }}
      >
        <Typography variant="h5">Company Attendance Tracker</Typography>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            signInUser();
          }}
          width="100%"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
          noValidate
        >
          <TextField
            margin="normal"
            required
            fullWidth
            name="email"
            label="Email Address"
            autoComplete="email"
            autoFocus
            value={state.email}
            onChange={(e) => handleChange(e)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={state.password}
            onChange={(e) => handleChange(e)}
          />
          {error && <div style={{ color: "red" }}>{error}</div>}
          {loggingIn ? (
            <CircularProgress />
          ) : (
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Log In
            </Button>
          )}
        </Box>
      </Box>
      {toWorkerScreen && <Navigate to="/home-screen" replace />}
    </Container>
  );
}

export default LogIn;
