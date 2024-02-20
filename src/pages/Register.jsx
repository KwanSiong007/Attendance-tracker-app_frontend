import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from "@mui/material";

import { register } from "../api/authentication";
import { updateProfile } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { BACKEND_URL } from "../constants/BackendUrl";

function Register() {
  const [state, setState] = useState({
    name: "",
    email: "",
    phone: "",
    worksite: "",
    department: "",
    worker_shift: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const showSuccessMessage = () => {
    toast.success("Congratulations! Registration completed!", {
      position: "top-center",
      autoClose: 5000, // Close the message after 5 seconds
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
  };

  const registerUser = async () => {
    try {
      if (state.password !== state.confirmPassword) {
        setConfirmPasswordError(true);
        return;
      }

      const user = await register(state.email, state.password);
      console.log("user", user);
      console.log("user.uid", user.uid);

      await updateProfile(user, {
        displayName: state.name,
      });

      await axios.post(`${BACKEND_URL}/workers/add`, {
        workerName: state.name,
        userID: user.uid,
        email: state.email,
        phone: state.phone,
        worksite: state.worksite,
        department: state.department,
        workerShift: state.worker_shift,
      });

      showSuccessMessage();
      setState({
        name: "",
        email: "",
        phone: "",
        worksite: "",
        department: "",
        worker_shift: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("An error occurred during registration. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState({
      ...state,
      [name]: value,
    });

    if (name === "password" && value.length < 8) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }

    if (name === "confirmPassword") {
      if (value.length < 8 || value !== state.password) {
        setConfirmPasswordError(true);
      } else {
        setConfirmPasswordError(false);
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 5,
          gap: 2,
        }}
      >
        {/* Display toast notifications when registration completed.*/}
        <ToastContainer />
        <Typography variant="h5">Company Attendance Tracker</Typography>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            registerUser();
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
            name="name"
            label="Full Name"
            autoComplete="name"
            autoFocus
            value={state.name}
            onChange={(e) => handleChange(e)}
          />
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
            name="phone"
            label="Mobile phone"
            autoComplete="phone"
            autoFocus
            value={state.phone}
            onChange={(e) => handleChange(e)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="worksite"
            label="Worksite"
            autoComplete="worksite"
            autoFocus
            value={state.worksite}
            onChange={(e) => handleChange(e)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="department"
            label="Department"
            autoComplete="department"
            autoFocus
            value={state.department}
            onChange={(e) => handleChange(e)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="worker_shift"
            label="Worker_shift"
            autoComplete="worker_shift"
            autoFocus
            value={state.worker_shift}
            onChange={(e) => handleChange(e)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            onChange={(e) => handleChange(e)}
            error={passwordError}
            helperText={
              passwordError ? "Password must be at least 8 characters" : ""
            }
            value={state.password}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            onChange={(e) => handleChange(e)}
            error={confirmPasswordError}
            helperText={
              confirmPasswordError
                ? "Confirm password must be at least  8 characters and match the password"
                : ""
            }
            value={state.confirmPassword}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            disabled={passwordError}
          >
            Register
          </Button>
        </Box>
        {/* <Typography>
          Go back to <Link to="/">Log In</Link>
        </Typography> */}
      </Box>
    </Container>
  );
}

export default Register;
