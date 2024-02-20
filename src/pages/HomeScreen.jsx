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
import { reAuth, logOut } from "../api/authentication";
// import { ref, get } from "firebase/database";
// import { database } from "../firebase";

import { useAuth } from "../contexts/AuthContext";
// import WorkerScreen from "./WorkerScreen";
// import DB_KEY from "../constants/dbKey";
// import ROLE from "../constants/role";

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
  //const [role, setRole] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const checkIfLoggedIn = (user) => {
      console.log("user:", user);
      if (user) {
        setUser(user);
      }
    };

    reAuth(checkIfLoggedIn);
  }, [setUser]);

  /*useEffect(() => {
    const fetchRole = async () => {
      const profileRef = ref(database, `${DB_KEY.PROFILES}/${user.uid}`);
      const snapshot = await get(profileRef);

      const profile = snapshot.val();
      setRole(profile.role);
    };

    if (user) {
      fetchRole();
    }
  }, [user]);*/

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
              {user.displayName}
            </Typography>
            <Avatar
              //src={user.photoURL}
              onClick={handleAvatarClick}
              style={{ cursor: "pointer" }}
              variant="square"
            >
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : ""}
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
            {/* {<WorkerScreen workerId={user.uid} />} */}
          </ThemeProvider>
        </Box>
      </>
    );
  } else {
    return <Navigate to="/" replace />;
  }
}

export default HomeScreen;
