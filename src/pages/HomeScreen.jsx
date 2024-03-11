import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Popover,
  Toolbar,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { logOut } from "../api/authentication";

import { useAuth } from "../contexts/AuthContext";
import WorkerScreen from "./WorkerScreen";

const theme = createTheme({
  breakpoints: {
    values: {
      ...createTheme().breakpoints.values,
      mobile: 480,
    },
  },
  components: {
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({ fontSize: theme.typography.body2.fontSize }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "6px 10px",
        },
      },
    },
  },
});

function HomeScreen() {
  const { user, setUser, loadingAuth } = useAuth();
  console.log("user:", user);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSignOut = async () => {
    await logOut();
    setUser(null);
    //setRole("");
    handlePopoverClose();
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  if (loadingAuth) {
    return <CircularProgress sx={{ mt: 5 }} />;
  } else if (user) {
    return (
      <>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Attendance Tracker
            </Typography>
            <Typography variant="body1" style={{ marginRight: 10 }}>
              {user.worker_name}
            </Typography>
            <Avatar
              onClick={handleAvatarClick}
              style={{ cursor: "pointer" }}
              variant="square"
            >
              {user.worker_name ? user.worker_name.charAt(0).toUpperCase() : ""}
            </Avatar>
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <Button onClick={handleSignOut}>Sign Out</Button>
            </Popover>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 4,
            gap: 2,
          }}
        >
          <ThemeProvider theme={theme}>
            {<WorkerScreen workerId={user.user_id} user={user} />}
          </ThemeProvider>
        </Box>
      </>
    );
  } else {
    return <Navigate to="/" replace />;
  }
}

export default HomeScreen;
