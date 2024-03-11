import { useEffect, useState, React } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { point } from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

import { BACKEND_URL } from "../constants/BackendUrl";
import axios from "axios";

import WorkerButton from "../components/WorkerButton";
import WorkerMap from "../components/WorkerMap";
import dayjs from "dayjs";

import {
  format,
  parseISO,
  differenceInHours,
  differenceInMinutes,
  isWithinInterval,
  startOfDay,
  endOfDay,
  subDays,
  isEqual,
} from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

const TIME_ZONE = "Asia/Singapore";

const showCurrDate = (dateObj) => {
  return format(utcToZonedTime(dateObj, TIME_ZONE), "EEE, d MMM");
};

const WORKER_BUTTON_TYPE = {
  CHECK_IN: "checkIn",
  CHECK_OUT: "checkOut",
};

const GPS_STATUS = {
  OFF: "off",
  REQUESTING: "requesting",
  ON: "on",
  NOT_SUPPORTED: "notSupported",
  DENIED: "denied",
  ERROR: "error",
};

const ATTENDANCE_STATUS = {
  LOADING: "loading",
  CHECKED_IN: "checkedIn",
  CHECKED_OUT: "checkedOut",
  CHECKING_IN: "checkingIn",
  CHECKING_OUT: "checkingOut",
};

function WorkerScreen({ workerId, user }) {
  console.log("workerId:", workerId);
  console.log("user:", user);

  const [nowLoaded, setNowLoaded] = useState(null);
  console.log("nowLoaded:", nowLoaded);
  const [todaysDate, setTodaysDate] = useState(null);
  console.log("todaysDate:", todaysDate);
  const [currDate, setCurrDate] = useState("");
  console.log("currDate:", currDate);
  const [worksites, setWorksites] = useState([]);
  console.log("worksites:", worksites);
  const [attendance, setAttendance] = useState([]);
  console.log("attendance:", attendance);
  //INITIALLY, BY DEFAULT: ATTENDANCE_STATUS IS LOADING
  const [attendanceStatus, setAttendanceStatus] = useState(
    ATTENDANCE_STATUS.CHECKED_OUT
  );
  console.log("attendanceStatus:", attendanceStatus);
  const [checkedInSite, setCheckedInSite] = useState(null);
  console.log("checkedInSite:", checkedInSite);

  const [gpsStatus, setGpsStatus] = useState(GPS_STATUS.OFF);
  console.log("gpsStatus:", gpsStatus);
  const [location, setLocation] = useState(null);
  console.log("location:", location);
  const [gpsSite, setGpsSite] = useState(null);
  console.log("gpsSite:", gpsSite);

  useEffect(() => {
    const getAttendanceCurrDate = async () => {
      try {
        const userID = workerId;
        const response = await axios.get(
          `${BACKEND_URL}/attendance/getAttendanceCurrDate/${userID}/${todaysDate}`
        );
        console.log("response:", response);
        console.log("response.data:", response.data);
        //response.data is array, which have object inside it
        const attendanceData = response.data;
        setAttendance(attendanceData);

        // Iterate over each object in attendanceData
        attendanceData.forEach((data) => {
          // Check if check_in_time exists and check_out_time is null
          if (data.check_in_time && !data.check_out_time) {
            console.log("data:", data);
            setAttendanceStatus(ATTENDANCE_STATUS.CHECKED_IN);
            setCheckedInSite(data.worksite);
          }
        });
      } catch (error) {
        console.error(error);
      }
    };
    getAttendanceCurrDate();
  }, [workerId, todaysDate]);

  useEffect(() => {
    const nowLoaded = new Date();
    setNowLoaded(nowLoaded);
    setCurrDate(showCurrDate(nowLoaded));
    // Format the current date using dayjs
    const formattedDate = dayjs().format("YYYY-MM-DD");
    setTodaysDate(formattedDate);
    const getWorksites = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/worksites`);
        setWorksites(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    getWorksites();
  }, []);

  const checkLocation = (lng, lat) => {
    const userPoint = point([lng, lat]);
    console.log("userPoint:", userPoint);
    console.log("userPoint coordinates:", userPoint.geometry.coordinates);
    for (const site of worksites) {
      const siteArea = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: site.geometry.coordinates, // This should already be a  2D array
        },
      };
      console.log("siteArea:", siteArea);
      console.log("siteArea coordinates:", siteArea.geometry.coordinates);
      if (booleanPointInPolygon(userPoint, siteArea)) {
        setGpsSite(site.worksite_name);
        console.log("site:", site);
        return site;
      }
    }

    setGpsSite(null);
    setLocation(null);
    return null;
  };

  const locateWorker = async () => {
    setGpsStatus(GPS_STATUS.REQUESTING);
    if (!("geolocation" in navigator)) {
      setGpsStatus(GPS_STATUS.NOT_SUPPORTED);
      throw new Error("Geolocation not supported");
    }

    const permission = await navigator.permissions.query({
      name: "geolocation",
    });
    if (permission.state === "denied") {
      setGpsStatus(GPS_STATUS.DENIED);
      throw new Error("Geolocation permission denied");
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsStatus(GPS_STATUS.ON);
          const { longitude, latitude } = position.coords;
          setLocation({ lng: longitude, lat: latitude });
          const site = checkLocation(longitude, latitude);
          console.log("site:", site);
          resolve(site);
        },
        (error) => {
          console.error("Error getting location:", error);
          if (error.code === 1) {
            setGpsStatus(GPS_STATUS.DENIED);
          } else {
            setGpsStatus(GPS_STATUS.ERROR);
          }
          reject(new Error("Geolocation error"));
        },
        { enableHighAccuracy: true }
      );
    });
  };

  const writeCheckIn = async (site) => {
    console.log("user:", user);
    console.log("todaysDate:", todaysDate);
    const checkInTime = new Date().toISOString();
    console.log("checkInTime:", checkInTime);
    try {
      setAttendanceStatus(ATTENDANCE_STATUS.CHECKED_IN);
      setCheckedInSite(site.worksite_name);
      await axios.post(`${BACKEND_URL}/attendance/writeCheckIn`, {
        workerName: user.worker_name,
        userID: user.user_id,
        worksite: site.worksite_name,
        department: user.department,
        workerShift: user.worker_shift,
        workday: todaysDate,
        checkInTime: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Pass the prop, which is site to writeCheckIn function
  const handleCheckIn = async () => {
    setAttendanceStatus(ATTENDANCE_STATUS.CHECKING_IN);
    try {
      const site = await locateWorker();
      console.log("site:", site);
      if (site) {
        writeCheckIn(site);
      } else {
        setAttendanceStatus(ATTENDANCE_STATUS.CHECKED_OUT);
      }
    } catch (error) {
      console.error("Error retrieving location:", error);
      setAttendanceStatus(ATTENDANCE_STATUS.CHECKED_OUT);
    }
  };

  const writeCheckOut = async () => {
    try {
      setAttendanceStatus(ATTENDANCE_STATUS.CHECKED_OUT);
      console.log("userID:", user.user_id);
      const checkOutTime = new Date().toISOString();
      console.log("checkOutTime:", checkOutTime);
      await axios.post(`${BACKEND_URL}/attendance/writeCheckOut`, {
        workerName: user.worker_name,
        userID: user.user_id,
        department: user.department,
        workerShift: user.worker_shift,
        checkOutTime: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckOut = async () => {
    setAttendanceStatus(ATTENDANCE_STATUS.CHECKING_OUT);
    try {
      const site = await locateWorker();
      console.log("site:", site);
      if (site?.worksite_name === checkedInSite) {
        writeCheckOut();
      } else {
        setAttendanceStatus(ATTENDANCE_STATUS.CHECKED_IN);
      }
    } catch (error) {
      console.error("Error retrieving location:", error);
      setAttendanceStatus(ATTENDANCE_STATUS.CHECKED_IN);
    }
  };

  const attendanceMsg = () => {
    switch (attendanceStatus) {
      case ATTENDANCE_STATUS.CHECKED_IN:
        return `Checked in at ${checkedInSite}.`;
      case ATTENDANCE_STATUS.CHECKED_OUT:
        return "Checked out.";
      case ATTENDANCE_STATUS.CHECKING_IN:
        return "Checking in...";
      case ATTENDANCE_STATUS.CHECKING_OUT:
        return "Checking out...";
      default:
        return;
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          mb: 2,
        }}
      >
        <>
          <Box
            width="100%"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "center",
              gap: { xs: 4, sm: 6 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                ml: 3,
              }}
            >
              <Typography>{attendanceMsg()}</Typography>
              {worksites.length &&
              attendanceStatus === ATTENDANCE_STATUS.CHECKED_OUT ? (
                <WorkerButton
                  buttonType={WORKER_BUTTON_TYPE.CHECK_IN}
                  handleHold={handleCheckIn}
                />
              ) : worksites.length &&
                attendanceStatus === ATTENDANCE_STATUS.CHECKED_IN ? (
                <WorkerButton
                  buttonType={WORKER_BUTTON_TYPE.CHECK_OUT}
                  handleHold={handleCheckOut}
                />
              ) : (
                <Button
                  variant="contained"
                  disabled
                  sx={{
                    borderRadius: "50%",
                    width: "160px",
                    height: "160px",
                    fontSize: "h5.fontSize",
                    lineHeight: "1.5",
                    textTransform: "none",
                  }}
                >
                  Loading...
                </Button>
              )}
            </Box>
            <WorkerMap
              worksites={worksites}
              location={location}
              gpsStatus={gpsStatus}
              gpsSite={gpsSite}
              checkedInSite={checkedInSite}
              attendanceStatus={attendanceStatus}
            />
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography sx={{ alignSelf: "flex-start" }}>
              Showing your check ins today ({currDate}):
            </Typography>
          </Box>
        </>
      </Box>
    </Container>
  );
}

export default WorkerScreen;
