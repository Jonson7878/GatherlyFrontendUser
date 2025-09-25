import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material";
import {jwtDecode} from "jwt-decode"; 
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Fade,
  Chip,
  Divider,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import { deepPurple } from '@mui/material/colors';
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VisibilityIcon from "@mui/icons-material/Visibility";
import API_BASE from "../../config";

const EventCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: "350px",
  height: "100%",
  borderRadius: "14px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
  overflow: "hidden",
  cursor: "pointer",
  backgroundColor: "#fff",
  transition: "transform 0.35s ease, box-shadow 0.34s ease",
  "&:hover": {
    transform: "scale(1.03)",
    boxShadow: "0 12px 25px rgba(1,59,250,0.29)",
  },
}));

export default function Eventlist() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [alert, setAlert] = useState({ message: "", severity: "" });

  const token = localStorage.getItem("token");
  let currentUser = null;
  if (token) {
    try {
      currentUser = jwtDecode(token);
    } catch (error) {
      console.error("Token decode error", error);
    }
  }

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!token) {
          setAlert({
            message: "You are not authorized. Please Log in",
            severity: "warning",
          });
          setTimeout(() => navigate("/login"), 1500);
          return;
        }
        const response = await fetch(`${API_BASE}/api/events`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          setAlert({
            message: "Session expired. Please log in again.",
            severity: "warning",
          });
          setTimeout(() => navigate("/login"), 1500);
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch events.");
        }
        const data = await response.json();
        setEvents(data.events);
      } catch (err) {
        console.error("Error fetching events:", err);
        setAlert({
          message: err.message || "Error fetching events",
          severity: "error",
        });
      }
    };
    fetchEvents();
  }, [navigate, token]);

  return (
    <Box sx={{ p: 4, backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {alert.message && (
        <Stack sx={{ mb: 2 }}>
          <Alert
            severity={alert.severity}
            onClose={() => setAlert({ message: "", severity: "" })}
          >
            {alert.message}
          </Alert>
        </Stack>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#5e35b1", textAlign: 'left', flexGrow: 1 }}>
          All Events
        </Typography>
        <Button
          variant="outlined"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => navigate("/create-event")}
          sx={{
            textTransform: "none",
            borderRadius: "50px",
            padding:"6px 18px",
            fontWeight: 600,
            fontSize:"0.85rem",
            minWidth:"90px",
            whiteSpace:"nowrap",
            boxShadow: "none",
            borderColor: deepPurple[600],
            color: deepPurple[600],
            "&:hover": {
              backgroundColor: deepPurple[600],
              color: "#fff",
              borderColor: deepPurple[600],
              boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
            },
          }}
        >
          Add Event
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr",
          },
          gap: 4,
        }}
      >
        {events.map((event, index) => (
          <Fade in={true} timeout={400 + index * 200} key={event._id}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <EventCard onClick={() => navigate(`/event/${event._id}`)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    event.image?.startsWith("data:image")
                      ? event.image
                      : "/path-to-default-image.jpg"
                  }
                  alt={event.eventName}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {event.eventName}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      mb: 1.5,
                    }}
                  >
                    <Chip
                        icon={<EventIcon />}
                        label={new Date(event.dateTime).toLocaleString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                        sx={{
                          bgcolor: "#e3f2fd",
                          color: "#1976d2",
                          fontWeight: "600",
                          boxShadow: "0 2px 6px rgba(25, 118, 210, 0.3)",
                          "& .MuiSvgIcon-root": { color: "#1976d2" },
                          borderRadius: "8px",
                        }}
                      />
                    <Chip
                        icon={<LocationOnIcon />}
                        label={event.location}
                        sx={{
                          bgcolor: "#fce4ec",
                          color: "#d81b60",
                          fontWeight: "600",
                          boxShadow: "0 2px 6px rgba(216, 27, 96, 0.3)",
                          "& .MuiSvgIcon-root": { color: "#d81b60" },
                          borderRadius: "8px",
                        }}
                      />
                    <Chip
                      icon={<VisibilityIcon />}
                      label={event.view.toUpperCase()}
                      sx={{
                        bgcolor: "#f3e5f5",
                        color: "#8e24aa",
                        fontWeight: 600,
                        boxShadow: "0 2px 6px rgba(158,25,210,0.43)",
                        "& .MuiSvgIcon-root": {color: "#8e24aa"},
                        borderRadius:"8px"
                      }}
                    />
                  </Box>
                  <Divider sx={{ my: 1, opacity: 0.3 }} />
                  {event.createdBy && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 1, fontWeight: 500 }}
                    >
                      Created By: <b>{event.createdBy.username}</b>
                      {event.createdBy.companyId?.name && (
                        <>
                          {" "}
                          | Company:{" "}
                          <strong>
                            {event.createdBy.companyId.name.toUpperCase()}
                          </strong>
                        </>
                      )}
                    </Typography>
                  )}
                  {(currentUser?.id === event.createdBy._id ||
                    currentUser?.role === "admin") && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                        mt: 2,
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        sx={{
                          textTransform: "none",
                          borderRadius: "50px",
                          padding: "4px 16px",
                          fontWeight: "600",
                          fontSize: "0.85rem",
                          borderColor: "#ef6c00",
                          color: "#ef6c00",
                          "&:hover": {
                            backgroundColor: "#ef6c00",
                            color: "#fff",
                            borderColor: "#ef6c00",
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const isSameCompanyAdmin =
                            currentUser?.role === "admin" &&
                            event.createdBy?.companyId?._id ===
                              currentUser?.companyId;

                          if (
                            currentUser?.id === event.createdBy._id ||
                            isSameCompanyAdmin
                          ) {
                            navigate(`/update-event/${event._id}`);
                          } else {
                            setAlert({
                              message: "You are not allowed to edit this event.",
                              severity: "error",
                            });
                            setTimeout(() => setAlert({ message: "", severity: "" }), 1500);
                          }
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        sx={{
                          textTransform: "none",
                          borderRadius: "50px",
                          padding: "4px 16px",
                          fontWeight: "600",
                          fontSize: "0.85rem",
                          borderColor: "#d32f2f",
                          color: "#d32f2f",
                          "&:hover": {
                            backgroundColor: "#d32f2f",
                            color: "#fff",
                            borderColor: "#d32f2f",
                          },
                        }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          const isSameCompanyAdmin =
                            currentUser?.role === "admin" &&
                            event.createdBy?.companyId?._id ===
                              currentUser?.companyId;
                          if (
                            currentUser?.id !== event.createdBy._id &&
                            !isSameCompanyAdmin
                          ) {
                            setAlert({
                              message: "You are not allowed to delete this event.",
                              severity: "error",
                            });
                            return;
                          }
                          if (
                            window.confirm(
                              "Are you sure you want to delete this event?"
                            )
                          ) {
                            try {
                              const res = await fetch(
                                `${API_BASE}/api/events/delete/${event._id}`,
                                {
                                  method: "DELETE",
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              );

                              if (!res.ok) {
                                throw new Error("Failed to delete event");
                              }

                              setEvents((prev) =>
                                prev.filter((e) => e._id !== event._id)
                              );

                              setAlert({
                                message: "Event deleted successfully.",
                                severity: "success",
                              });
                            } catch (err) {
                              setAlert({
                                message: err.message || "Error deleting event",
                                severity: "error",
                              });

                              setTimeout(() => {
                                setAlert({ message: "", severity: "" });
                              }, 1500);
                            }
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </EventCard>
            </Box>
          </Fade>
        ))}
      </Box>
    </Box>
  );
}
