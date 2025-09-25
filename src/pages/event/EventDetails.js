import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Accordion,    
  Chip,
  Button,
  Stack,
  Divider,
  Alert,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import MonetizationOnTwoToneIcon from "@mui/icons-material/MonetizationOnTwoTone";
import VisibilityIcon from "@mui/icons-material/Visibility";
import API_BASE from "../../config";

export default function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true); // eslint-disable-next-line
  const [error, setError] = useState("");
  const [alert, setAlert] = useState({ message: "", severity: "" });
  const [selectedTickets, setSelectedTickets] = useState({});
  const [processingTickets, setProcessingTickets] = useState({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setAlert({ message: "Please log in to view this event.", severity: "warning" });
          setTimeout(() => navigate("/login"), 1500);
          return;
        }

        const res = await fetch(`${API_BASE}/api/events/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          setAlert({ message: "Session expired. Please log in again.", severity: "warning" });
          setTimeout(() => navigate("/login"), 1500);
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch event");
        const data = await res.json();
        setEvent(data.event);
      } catch (err) {
        setAlert({ message: err.message || "Something went wrong", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  const handleIncrease = (index) => {
    setSelectedTickets((prev) => {
      const currentQty = prev[index] || 0;
      const maxQty = event.tickets[index].quantity;
      if (currentQty < maxQty) {
        return { ...prev, [index]: currentQty + 1 };
      }
      return prev;
    });
  };

  const handleDecrease = (index) => {
    setSelectedTickets((prev) => {
      const currentQty = prev[index] || 0;
      if (currentQty > 0) {
        return { ...prev, [index]: currentQty - 1 };
      }
      return prev;
    });
  };

const handleBuyTickets = async () => {
  const ticketsToBuy = Object.entries(selectedTickets).filter(([, qty]) => qty > 0);

  if (ticketsToBuy.length === 0) return;

  const processingState = {};
  ticketsToBuy.forEach(([index]) => {
    processingState[index] = true;
  });
  setProcessingTickets(processingState);

  try {
    const token = localStorage.getItem("token");

    const payload = {
      eventId: event._id,
      tickets: ticketsToBuy.map(([indexStr, qty]) => {
        const index = parseInt(indexStr, 10);
        const ticket = event.tickets[index];
        return {
          ticketId: ticket._id,
          ticketName: ticket.ticketName,
          quantity: qty,
          amount: ticket.price,
        };
      }),
    };

    const res = await fetch(`${API_BASE}/api/order/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to place order");
    }

    const data = await res.json();
    navigate(`/order/${data.order._id}`);

    setSelectedTickets({});

    setAlert({ message: data.message || "Tickets purchased successfully!", severity: "success" });

    setEvent((prevEvent) => {
      const updatedTickets = [...prevEvent.tickets];
      ticketsToBuy.forEach(([indexStr, qty]) => {
        const index = parseInt(indexStr, 10);
        updatedTickets[index].quantity -= qty;
      });
      return { ...prevEvent, tickets: updatedTickets };
    });
  } catch (err) {
    setAlert({ message: err.message || "Error purchasing tickets", severity: "error" });
  } finally {
    setProcessingTickets({});
  }
};

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography>No event data found</Typography>
      </Box>
    );
  }

  return (
    <Box
      maxWidth="900px"
      mx="auto"
      p={3}
      sx={{ fontFamily: "'Poppins', 'Roboto', sans-serif" }}
    >
      {alert.message && (
        <Stack sx={{ width: "100%", mb: 2 }}>
          <Alert severity={alert.severity} onClose={() => setAlert({ message: "", severity: "" })}>
            {alert.message}
          </Alert>
        </Stack>
      )}
      <Button
        variant="outlined"
        onClick={() => navigate("/events/dashboard")}
        sx={{
          mb: 3,
          fontWeight: 600,
          color: "primary.main",
          borderColor: "primary.main",
          borderRadius: 2,
          textTransform: "none",
          "&:hover": {
            bgcolor: "primary.light",
            color: "white",
            borderColor: "primary.main",
          },
        }}
      >
        ← Back
      </Button>
      <Box
        component="img"
        src={event.image || "/default-event.jpg"}
        alt={event.eventName}
        width="100%"
        height="300px"
        sx={{
          objectFit: "cover",
          borderRadius: 3,
          mb: 4,
          transition: "transform 0.5s ease, boxShadow 0.5s ease",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          "&:hover": {
            transform: "scale(1.03)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.3)",
          },
        }}
      />

      <Typography variant="h3" fontWeight={700} gutterBottom sx={{ color: "#2c3e50" }}>
        {event.eventName}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        gutterBottom
        sx={{ fontSize: "1.15rem", lineHeight: 1.6 }}
      >
        {event.description}
      </Typography>

      <Box display="flex" gap={4} my={3} color="#34495e">
        <Typography
          display="flex"
          alignItems="center"
          gap={1}
          sx={{
            fontWeight: 600,
            transition: "color 0.3s",
            "& svg": {
              color: "#43a047",
              transition: "transform 0.3s",
            },
            "&:hover svg": {
              transform: "scale(1.3)",
            },
          }}
        >
          <EventIcon fontSize="medium" />
          {new Date(event.dateTime).toLocaleString()}
        </Typography>
        <Typography
          display="flex"
          alignItems="center"
          gap={1}
          sx={{
            fontWeight: 600,
            transition: "color 0.3s",
            "& svg": {
              color: "#ef5350",
              transition: "transform 0.3s",
            },
            "&:hover svg": {
              transform: "scale(1.3)",
            },
          }}
        >
          <LocationOnIcon fontSize="medium" />
          {event.location}
        </Typography>
        <Typography
          display="flex"
          alignItems="center"
          gap={1}
          sx={{
            color: "#135325",
            fontWeight: 600,
            transition: "color 0.3s",
            "& svg": {
              color: "#000",
              transition: "transform 0.3s",
            },
            "&:hover svg": {
              transform: "scale(1.3)",
            },
          }}
        >
          <VisibilityIcon fontSize="medium" />
          {event.view.toUpperCase()} EVENT
        </Typography>
      </Box>

      {/* Tickets Section */}
      <Box my={5}>
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
        >
          <ConfirmationNumberIcon sx={{ color: "#862d86" }} />
          Available Tickets
        </Typography>
        {event.tickets?.map((ticket, index) => {
          const selectedQty = selectedTickets[index] || 0;
          const isMaxReached = selectedQty >= ticket.quantity;
          const isProcessing = processingTickets[index] || false;
          const totalPriceForTicket = selectedQty * ticket.price;

          return (
            <Card
              key={index}
              sx={{
                mb: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderRadius: 3,
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent sx={{ flex: "1 1 auto" }}>
                <Typography fontWeight={700} fontSize="1.15rem" mb={0.5}>
                  {ticket.ticketName}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1.5}>
                  {ticket.description}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <Chip label={`₹${ticket.price}`} color="success" />
                  <Chip label={`Available: ${ticket.quantity}`} color="default" />
                </Stack>

                <Box
                  sx={{
                    mt: 1,
                    p: 1.2,
                    borderRadius: 3,
                    bgcolor: "#e8f5e9",
                    display: "inline-block",
                    fontWeight: 600,
                    color: "#2e7d32",
                    fontSize: "1rem",
                    minWidth: "170px",
                    textAlign: "center",
                    boxShadow: "0 0 6px rgba(46,125,50,0.2)",
                  }}
                >
                  Selected: {selectedQty} | Total: ₹{totalPriceForTicket}
                </Box>
              </CardContent>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pr: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleDecrease(index)}
                    disabled={selectedQty === 0 || isProcessing}
                    sx={{
                      borderColor: "#ef5350",
                      color: "#c62828",
                      "&:hover": {
                        bgcolor: "#b71c1c",
                        color: "white",
                      },
                    }}
                  >
                    <RemoveIcon />
                  </Button>
                  <Typography fontWeight={700}>{selectedQty}</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleIncrease(index)}
                    disabled={isMaxReached || isProcessing}
                    sx={{
                      borderColor: "#81c784",
                      color: "#2e7d32",
                      "&:hover": {
                        bgcolor: "#1b5e20",
                        color: "white",
                      },
                    }}
                  >
                    <AddIcon />
                  </Button>
                </Box>
              </Box>
            </Card>
          );
        })}
        <Box
           sx={{
             display: "flex",
             justifyContent:"flex-end",
             mt: 3,
           }}
        >
            <Button
            variant="outlined"
            color="success"
            disabled={
              Object.values(selectedTickets).every((qty) => qty === 0) ||
              Object.values(processingTickets).some((proc) => proc === true) ||
              event.tickets.every((ticket) => ticket.quantity === 0)
            }
            onClick={handleBuyTickets}
            sx={{
              minWidth: 140,
              fontWeight: 700,
              borderRadius: 10,
              borderColor:"#1b5e20",
              "&:hover": {
               borderColor: "#1b5e20",
               color:"white",
               backgroundColor: "#1b5e20"
              },
            }}
          >
            Buy Ticket
          </Button>
        </Box>
        </Box>

        <Box my={5}>
            <Divider sx={{mb: 2}} />
            <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
                sx={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "700",
                    fontSize: "1.5rem",
                    gap:1,
                }}
            >
                <MonetizationOnTwoToneIcon sx={{color:"#c62828", fontSize: 26}} />
                Refund Policy
            </Typography>
            <Typography variant="body2" sx={{color: "#555", fontSize:"1rem"}}>
                Refunds available up to <strong>7 days</strong> before the event.
            </Typography>
            <Divider sx={{mt:2}} />
        </Box>

        <Box my={5}>
            <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
                sx={{mb: 2, display: "flex", alignItems: "center", gap:1}}
            >
                <HelpOutlineIcon sx={{color:"#ff33ff"}} />
                FAQs
            </Typography>
            {event.faqs?.map((faq, index) =>(
                <Accordion
                    key={index}
                    disableGutters
                    elevation={0}
                    square
                    sx={{
                        borderBottom: "1px solid #ddd",
                        borderRadius:2,
                        mb:2,
                        "&:before": {display: "none"},
                        "&:hover":{
                            backgroundColor: "transparent",
                            boxShadow: "none",
                        },
                    }}
                >
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Question: {faq.title}
                        </Typography>
                        <Typography color="text.secondary">
                            Answer: {faq.description}
                        </Typography>
                    </Box>
                </Accordion>
            ))}
        </Box>
      </Box>
  );
}
