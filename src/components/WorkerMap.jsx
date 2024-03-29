import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { BACKEND_URL } from "../constants/BackendUrl";
import axios from "axios";

mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_KEY;

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

function WorkerMap({
  location,
  gpsStatus,
  gpsSite,
  checkedInSite,
  attendanceStatus,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [worksites, setWorksites] = useState([]);
  console.log("worksites:", worksites);
  useEffect(() => {
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

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [103.8198, 1.3521],
        zoom: 10,
      });
    }
    const map = mapRef.current;

    map.fitBounds([
      // Bounding box is [103.6059, 1.1644], [104.0839, 1.4705]
      [103.5659, 1.1844],
      [104.0739, 1.4905],
    ]);

    map.on("load", () => {
      if (!map.getSource("worksites")) {
        map.addSource("worksites", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });
      }

      map.addLayer({
        id: "worksite-fill",
        type: "fill",
        source: "worksites",
        paint: {
          "fill-color": "#627BC1",
          "fill-opacity": 0.5,
        },
      });

      map.addLayer({
        id: "worksite-border",
        type: "line",
        source: "worksites",
        paint: {
          "line-color": "#627BC1",
          "line-width": 2,
        },
      });

      for (const worksite of worksites) {
        const feature = {
          type: "Feature",
          properties: {
            name: worksite.worksite_name,
          },
          geometry: {
            type: "Polygon",
            coordinates: worksite.geometry.coordinates,
          },
        };

        const data = map.getSource("worksites")._data;
        data.features.push(feature);
        map.getSource("worksites").setData(data);
      }
    });

    let popup;

    map.on("mouseenter", "worksite-fill", function (e) {
      map.getCanvas().style.cursor = "pointer";

      const name = e.features[0].properties.name;

      popup = new mapboxgl.Popup({ closeButton: false })
        .setLngLat(e.lngLat)
        .setHTML(name)
        .addTo(map);
    });

    map.on("mousemove", "worksite-fill", function (e) {
      if (popup) {
        popup.setLngLat(e.lngLat);
      }
    });

    map.on("mouseleave", "worksite-fill", () => {
      map.getCanvas().style.cursor = "";
      if (popup) {
        popup.remove();
      }
    });
  }, [worksites]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;

    if (location && map) {
      const { lng, lat } = location;

      const markerColor = () => {
        switch (attendanceStatus) {
          case ATTENDANCE_STATUS.LOADING:
            return "grey";
          case ATTENDANCE_STATUS.CHECKING_IN:
            return "green";
          case ATTENDANCE_STATUS.CHECKED_IN:
            return "green";
          case ATTENDANCE_STATUS.CHECKING_OUT:
            return "grey";
          case ATTENDANCE_STATUS.CHECKED_OUT:
            return "grey";
        }
      };

      if (marker) {
        marker.remove();
      }
      markerRef.current = new mapboxgl.Marker({ color: markerColor() })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      map.flyTo({ center: [lng, lat], zoom: 15 });
    }
  }, [location, attendanceStatus]);

  const gpsStatusMsg = () => {
    switch (gpsStatus) {
      case GPS_STATUS.REQUESTING:
        return "Detecting location.";
      case GPS_STATUS.ON:
        if (!gpsSite) {
          return "Your current location is not at a work site.";
        } else if (checkedInSite && gpsSite !== checkedInSite) {
          return `Your current location is ${gpsSite}. You must check out from ${checkedInSite}.`;
        } else {
          return `Your current location is ${gpsSite}.`;
        }
      case GPS_STATUS.NOT_SUPPORTED:
        return "Location access not supported. Please use a compatible browser.";
      case GPS_STATUS.DENIED:
        return "Location access denied. Please grant access to confirm you're at a work site.";
      case GPS_STATUS.ERROR:
        return "Location access error. Please contact support.";
      default:
        return;
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        mr: 3,
      }}
    >
      <Typography>{gpsStatusMsg()}</Typography>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "325px",
          borderRadius: "4px",
        }}
      ></div>
    </Box>
  );
}

export default WorkerMap;
